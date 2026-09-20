#!/usr/bin/env python3
"""Build a low-cost calibrated surrogate and propose the next T-cell geometry.

The goal is to avoid brute-force openEMS sweeps. We reuse the latest verified
thru/T-cell results to calibrate two effects:

1. PP-loaded microstrip impedance is represented as
       Z_loaded(W) ~= alpha_Z * Z_Hammerstad_bare_FR4(W)
   using two independent native-MSL impedance observations.
2. The measured branch/through split is compared with a lossless transmission-
   line surrogate. The ratio is treated as an uncertain branch-efficiency
   correction, and a minimax junction split is chosen rather than blindly
   forcing the ideal 24.76% split.

This script is a design tool, not a replacement for one final full-wave check.
"""

from __future__ import annotations

import argparse
import copy
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_GEOM = ROOT / "pcb" / "tscircuit" / "src" / "tcell-calibration-geometry.json"
DEFAULT_THRU = (
    ROOT
    / "pcb"
    / "tscircuit"
    / "results"
    / "openems_tcell_coupon_20260920"
    / "thru_verify_summary.json"
)
DEFAULT_TCELL = (
    ROOT
    / "pcb"
    / "tscircuit"
    / "results"
    / "openems_tcell_coupon_20260920"
    / "tcell_verify_summary.json"
)
DEFAULT_OUT = ROOT / "design" / "tcell_candidate_v2.json"


def hammerstad_bare(width_mm: float, er: float, h_mm: float) -> tuple[float, float]:
    """Return quasi-static Z0 [ohm] and effective epsilon for a bare microstrip."""
    u = width_mm / h_mm
    ee = (er + 1.0) / 2.0 + (er - 1.0) / 2.0 * (
        1.0 / math.sqrt(1.0 + 12.0 / u)
        + (0.04 * (1.0 - u) ** 2 if u < 1.0 else 0.0)
    )
    if u <= 1.0:
        z0 = 60.0 / math.sqrt(ee) * math.log(8.0 / u + 0.25 * u)
    else:
        z0 = 120.0 * math.pi / (
            math.sqrt(ee) * (u + 1.393 + 0.667 * math.log(u + 1.444))
        )
    return z0, ee


def loaded_z(width_mm: float, alpha_z: float, er: float, h_mm: float) -> float:
    return alpha_z * hammerstad_bare(width_mm, er, h_mm)[0]


def width_for_loaded_z(
    target_ohm: float,
    alpha_z: float,
    er: float,
    h_mm: float,
    lo_mm: float = 0.2,
    hi_mm: float = 8.0,
) -> float:
    for _ in range(100):
        mid = 0.5 * (lo_mm + hi_mm)
        z = loaded_z(mid, alpha_z, er, h_mm)
        if z > target_ohm:
            lo_mm = mid
        else:
            hi_mm = mid
    return 0.5 * (lo_mm + hi_mm)


def loaded_eps_eff(width_mm: float, alpha_z: float, er: float, h_mm: float) -> float:
    # If geometry factor is unchanged and Z scales as 1/sqrt(eps_eff), the
    # measured impedance scale implies this first-order effective-epsilon shift.
    _, ee_bare = hammerstad_bare(width_mm, er, h_mm)
    return ee_bare / (alpha_z * alpha_z)


def quarter_wave_mm(width_mm: float, alpha_z: float, er: float, h_mm: float, f_hz: float) -> float:
    c0 = 299_792_458.0
    ee = loaded_eps_eff(width_mm, alpha_z, er, h_mm)
    return c0 / f_hz / math.sqrt(ee) / 4.0 * 1e3


def distance(a: dict[str, float], b: dict[str, float]) -> float:
    return math.hypot(b["x"] - a["x"], b["y"] - a["y"])


def lower_circle_intersection(
    a: dict[str, float],
    b: dict[str, float],
    ra: float,
    rb: float,
) -> dict[str, float]:
    dx = b["x"] - a["x"]
    dy = b["y"] - a["y"]
    d = math.hypot(dx, dy)
    if d > ra + rb or d < abs(ra - rb):
        raise ValueError("requested transformer lengths have no geometric intersection")
    x = (ra * ra - rb * rb + d * d) / (2.0 * d)
    h2 = ra * ra - x * x
    h = math.sqrt(max(0.0, h2))
    xm = a["x"] + x * dx / d
    ym = a["y"] + x * dy / d
    rx = -dy / d * h
    ry = dx / d * h
    p1 = {"x": xm + rx, "y": ym + ry}
    p2 = {"x": xm - rx, "y": ym - ry}
    return p1 if p1["y"] < p2["y"] else p2


def line_input_impedance(zc: float, theta: float, zl: complex) -> complex:
    t = math.tan(theta)
    return zc * (zl + 1j * zc * t) / (zc + 1j * zl * t)


def current_surrogate(
    geom: dict,
    alpha_z: float,
    system_z: float = 50.0,
) -> dict:
    stack = geom["stackup"]
    tc = geom["tcell"]
    patch = geom["patch"]
    er = stack["fr4EpsilonR"]
    h = stack["fr4ThicknessMm"]
    f = geom["frequencyGHz"] * 1e9

    zt = loaded_z(tc["seriesWidthMm"], alpha_z, er, h)
    zb = loaded_z(tc["branchWidthMm"], alpha_z, er, h)
    zthrough = loaded_z(tc["through50WidthMm"], alpha_z, er, h)

    eps_t = loaded_eps_eff(tc["seriesWidthMm"], alpha_z, er, h)
    eps_b = loaded_eps_eff(tc["branchWidthMm"], alpha_z, er, h)
    eps_o = loaded_eps_eff(tc["through50WidthMm"], alpha_z, er, h)

    c0 = 299_792_458.0
    beta_t = 2.0 * math.pi * f / c0 * math.sqrt(eps_t)
    beta_b = 2.0 * math.pi * f / c0 * math.sqrt(eps_b)
    beta_o = 2.0 * math.pi * f / c0 * math.sqrt(eps_o)

    lt = distance(tc["inputReference"], tc["junction"]) / 1e3
    lb = distance(tc["junction"], patch["feedReference"]) / 1e3
    lo = distance(tc["junction"], tc["outputReference"]) / 1e3

    z_branch_in = line_input_impedance(zb, beta_b * lb, complex(system_z))
    z_through_in = line_input_impedance(zthrough, beta_o * lo, complex(system_z))
    yb = 1.0 / z_branch_in
    yo = 1.0 / z_through_in
    zj = 1.0 / (yb + yo)
    zin = line_input_impedance(zt, beta_t * lt, zj)
    gamma = (zin - system_z) / (zin + system_z)
    junction_split = yb.real / (yb.real + yo.real)

    return {
        "loaded_impedances_ohm": {
            "series": zt,
            "branch": zb,
            "through": zthrough,
        },
        "electrical_length_deg": {
            "series": math.degrees(beta_t * lt),
            "branch": math.degrees(beta_b * lb),
            "through": math.degrees(beta_o * lo),
        },
        "junction_split": junction_split,
        "Zin_ohm": [zin.real, zin.imag],
        "S11_db": 20.0 * math.log10(max(abs(gamma), 1e-15)),
    }


def output_split(branch_power: float, through_power: float) -> float:
    total = branch_power + through_power
    return branch_power / total if total > 0 else 0.0


def infer_relative_branch_efficiency(k_junction: float, k_output: float) -> float:
    # k_out = (k_j * r) / (k_j * r + 1 - k_j), solve for r.
    den = k_junction * (1.0 - k_output)
    if den <= 0:
        raise ValueError("invalid split for branch-efficiency fit")
    return k_output * (1.0 - k_junction) / den


def output_split_from_efficiency(k_junction: float, r: float) -> float:
    return (k_junction * r) / (k_junction * r + 1.0 - k_junction)


def robust_junction_target(target_output: float, r_low: float, r_high: float) -> dict:
    best = None
    for n in range(20001):
        k = 0.20 + n * (0.20 / 20000.0)
        lo = output_split_from_efficiency(k, r_low)
        hi = output_split_from_efficiency(k, r_high)
        worst = max(abs(lo - target_output), abs(hi - target_output))
        rms = math.sqrt(((lo - target_output) ** 2 + (hi - target_output) ** 2) / 2.0)
        if best is None or worst < best["worst_error"]:
            best = {
                "k_junction": k,
                "output_at_r_low": lo,
                "output_at_r_high": hi,
                "worst_error": worst,
                "endpoint_rms_error": rms,
            }
    assert best is not None
    return best


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--geometry", type=Path, default=DEFAULT_GEOM)
    parser.add_argument("--thru-summary", type=Path, default=DEFAULT_THRU)
    parser.add_argument("--tcell-summary", type=Path, default=DEFAULT_TCELL)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument(
        "--branch-efficiency-high",
        type=float,
        default=0.90,
        help="upper uncertainty bound after geometry is improved",
    )
    args = parser.parse_args()

    geom = json.loads(args.geometry.read_text(encoding="utf-8"))
    thru = json.loads(args.thru_summary.read_text(encoding="utf-8"))
    tcell = json.loads(args.tcell_summary.read_text(encoding="utf-8"))

    er = geom["stackup"]["fr4EpsilonR"]
    h = geom["stackup"]["fr4ThicknessMm"]
    w_thru = geom["tcell"]["through50WidthMm"]
    w_feed = geom["patch"]["feedWidthMm"]

    z_thru_native = sum(z[0] for z in thru["native_port_Z_ohm"]) / len(thru["native_port_Z_ohm"])
    z_feed_native = tcell["native_port_Z_ohm"][2][0]

    z_thru_bare = hammerstad_bare(w_thru, er, h)[0]
    z_feed_bare = hammerstad_bare(w_feed, er, h)[0]

    alpha_a = z_thru_native / z_thru_bare
    alpha_b = z_feed_native / z_feed_bare
    alpha_z = 0.5 * (alpha_a + alpha_b)
    alpha_rel_spread = abs(alpha_a - alpha_b) / alpha_z

    current = current_surrogate(geom, alpha_z)
    branch_power = float(tcell["branch_power_fraction_50ohm"])
    through_power = 10.0 ** (float(tcell["S21_db"]) / 10.0)
    measured_output_split = output_split(branch_power, through_power)

    r_fit = infer_relative_branch_efficiency(
        current["junction_split"],
        measured_output_split,
    )
    r_low = min(r_fit, args.branch_efficiency_high)
    r_high = max(r_fit, args.branch_efficiency_high)

    target_output = float(geom["tcell"]["targetExtraction"])
    robust = robust_junction_target(target_output, r_low, r_high)
    k_j = robust["k_junction"]

    system_z = 50.0
    target_zt = system_z * math.sqrt(1.0 - k_j)
    target_zb = system_z * math.sqrt((1.0 - k_j) / k_j)

    w50 = width_for_loaded_z(system_z, alpha_z, er, h)
    wt = width_for_loaded_z(target_zt, alpha_z, er, h)
    wb = width_for_loaded_z(target_zb, alpha_z, er, h)

    f_hz = geom["frequencyGHz"] * 1e9
    lt = quarter_wave_mm(wt, alpha_z, er, h, f_hz)
    lb = quarter_wave_mm(wb, alpha_z, er, h, f_hz)

    junction = lower_circle_intersection(
        geom["tcell"]["inputReference"],
        geom["patch"]["feedReference"],
        lt,
        lb,
    )

    candidate = copy.deepcopy(geom)
    candidate["tcell"]["junction"] = {
        "x": round(junction["x"], 6),
        "y": round(junction["y"], 6),
    }
    candidate["tcell"]["through50WidthMm"] = round(w50, 6)
    candidate["tcell"]["seriesWidthMm"] = round(wt, 6)
    candidate["tcell"]["branchWidthMm"] = round(wb, 6)
    candidate["tcell"]["targetSeriesOhm"] = round(target_zt, 6)
    candidate["tcell"]["targetBranchOhm"] = round(target_zb, 6)
    candidate["tcell"]["targetSeriesQuarterWaveMm"] = round(lt, 6)
    candidate["tcell"]["targetBranchQuarterWaveMm"] = round(lb, 6)
    # The coupon branch fixture should also be a calibrated 50-ohm line.
    # This does NOT freeze the final Patch inset/feed geometry.
    candidate["patch"]["feedWidthMm"] = round(w50, 6)

    candidate["candidateMeta"] = {
        "name": "surrogate-v2-robust-screen",
        "status": "EM candidate; not production geometry",
        "source_results": {
            "thru": str(args.thru_summary),
            "tcell": str(args.tcell_summary),
        },
        "impedance_scale_alpha": alpha_z,
        "impedance_scale_two_point_relative_spread": alpha_rel_spread,
        "calibration_points": [
            {
                "width_mm": w_thru,
                "native_z_ohm": z_thru_native,
                "bare_hammerstad_z_ohm": z_thru_bare,
                "alpha": alpha_a,
            },
            {
                "width_mm": w_feed,
                "native_z_ohm": z_feed_native,
                "bare_hammerstad_z_ohm": z_feed_bare,
                "alpha": alpha_b,
            },
        ],
        "current_surrogate": current,
        "measured_output_split": measured_output_split,
        "relative_branch_efficiency_fit": r_fit,
        "relative_branch_efficiency_interval": [r_low, r_high],
        "robust_junction_target": robust,
        "target_output_split": target_output,
        "note": (
            "The junction target is intentionally above the final output target "
            "to hedge the branch-path penalty seen in the verified coupon. "
            "Promote only after one screen/verify EM run."
        ),
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(candidate, indent=2) + "\n", encoding="utf-8")

    report = {
        "alpha_z": alpha_z,
        "alpha_relative_spread": alpha_rel_spread,
        "current": current,
        "measured_output_split": measured_output_split,
        "relative_branch_efficiency_fit": r_fit,
        "robust_junction_target": robust,
        "candidate": {
            "through50WidthMm": w50,
            "seriesWidthMm": wt,
            "branchWidthMm": wb,
            "seriesQuarterWaveMm": lt,
            "branchQuarterWaveMm": lb,
            "junction": junction,
            "targetSeriesOhm": target_zt,
            "targetBranchOhm": target_zb,
        },
        "output": str(args.out),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
