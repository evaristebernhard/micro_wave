#!/usr/bin/env python3
"""Cheap, validity-first openEMS coupon for the T-cell network.

This script deliberately does NOT model the final Patch or magnetic launch.
It answers only two questions:

1. Is the openEMS MSL-port fixture itself numerically sane on this stack-up?
2. With the same validated fixture, what does the T-cell three-port do?

Use --dut thru first. Only trust --dut tcell if the thru coupon is passive,
well matched, and close to 0 dB transmission.

Important implementation details:
- Every MSL port has Feed_R=50 ohm. The default openEMS MSL port is open.
- Passive output ports are defined from OUTSIDE -> DUT so uf_ref is the wave
  leaving the DUT, matching the official openEMS notch-filter convention.
- Gaussian excitation is used for S-parameters. A finite sinus run is useful
  as a solver smoke test, but is not the default S-parameter workflow.
- Copper is PEC sheet metal in this first calibration stage. This removes the
  35 um z-cell penalty; conductor loss is a later sensitivity sweep.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
from pathlib import Path

import numpy as np
from CSXCAD import ContinuousStructure
from openEMS import openEMS
from openEMS.physical_constants import EPS0


ROOT = Path(__file__).resolve().parents[2]
GEOM_PATH = ROOT / "pcb" / "tscircuit" / "src" / "tcell-calibration-geometry.json"
DEFAULT_OUT = ROOT / "results" / "openems_tcell_coupon"


def load_geometry() -> dict:
    return json.loads(GEOM_PATH.read_text(encoding="utf-8"))


def stroke_polygon(a: dict[str, float], b: dict[str, float], width: float):
    dx = b["x"] - a["x"]
    dy = b["y"] - a["y"]
    length = math.hypot(dx, dy)
    if length <= 0:
        raise ValueError("zero-length segment")
    nx = -dy / length * width / 2
    ny = dx / length * width / 2
    pts = np.array(
        [
            [a["x"] + nx, a["y"] + ny],
            [b["x"] + nx, b["y"] + ny],
            [b["x"] - nx, b["y"] - ny],
            [a["x"] - nx, a["y"] - ny],
        ],
        dtype=float,
    )
    return pts[:, 0], pts[:, 1]


def add_sheet_box(prop, x0, x1, y0, y1, z, priority=20):
    prop.AddBox(
        start=[min(x0, x1), min(y0, y1), z],
        stop=[max(x0, x1), max(y0, y1), z],
        priority=priority,
    )


def add_sheet_route(prop, a, b, width, z=0.0, priority=20):
    px, py = stroke_polygon(a, b, width)
    prop.AddPolygon(
        points=[px, py],
        norm_dir=2,
        elevation=z,
        priority=priority,
    )
    return np.column_stack([px, py])


def build_model(sim_path: Path, dut: str, profile: str):
    g = load_geometry()
    stack = g["stackup"]
    patch = g["patch"]
    tcell = g["tcell"]

    cfg = {
        "smoke": {
            "nr_ts": 5000,
            "end_criteria": 1e-2,
            "xy_res": 1.35,
            "z_res": 0.75,
            "fc_ghz": 0.30,
            "points": 21,
        },
        "fast": {
            "nr_ts": 30000,
            "end_criteria": 1e-3,
            "xy_res": 1.00,
            "z_res": 0.55,
            "fc_ghz": 0.30,
            "points": 81,
        },
        "verify": {
            "nr_ts": 70000,
            "end_criteria": 1e-4,
            "xy_res": 0.70,
            "z_res": 0.40,
            "fc_ghz": 0.35,
            "points": 161,
        },
    }[profile]

    f0 = g["frequencyGHz"] * 1e9
    fc = cfg["fc_ghz"] * 1e9

    FDTD = openEMS(NrTS=cfg["nr_ts"], EndCriteria=cfg["end_criteria"])
    FDTD.SetGaussExcite(f0, fc)
    FDTD.SetBoundaryCond(["PML_8"] * 6)

    CSX = ContinuousStructure()
    FDTD.SetCSX(CSX)
    mesh = CSX.GetGrid()
    mesh.SetDeltaUnit(1e-3)

    fr4_t = stack["fr4ThicknessMm"]
    front_pp_t = stack["frontPpThicknessMm"]
    rear_pp_t = stack["rearPpThicknessMm"]
    z_sig = 0.0
    z_gnd = -fr4_t

    # Ideal calibration fixtures. Their outer ends are 50-ohm terminated.
    fixture_x = 30.0
    branch_outer_y = 2.0
    p_in = tcell["inputReference"]
    p_out = tcell["outputReference"]
    p_branch = patch["feedReference"]
    w50 = tcell["through50WidthMm"]

    # Coupon stack is intentionally larger than the DUT so the artificial
    # calibration fixtures sit on the same dielectric environment.
    stack_x0, stack_x1 = -32.0, 32.0
    stack_y0, stack_y1 = -33.0, 5.0

    fr4_kappa = 2 * math.pi * f0 * EPS0 * stack["fr4EpsilonR"] * stack["fr4LossTangent"]
    pp_kappa = 2 * math.pi * f0 * EPS0 * stack["ppEpsilonR"] * stack["ppLossTangent"]

    fr4 = CSX.AddMaterial("FR4", epsilon=stack["fr4EpsilonR"], kappa=fr4_kappa)
    front_pp = CSX.AddMaterial("front_PP", epsilon=stack["ppEpsilonR"], kappa=pp_kappa)
    rear_pp = CSX.AddMaterial("rear_PP", epsilon=stack["ppEpsilonR"], kappa=pp_kappa)
    signal = CSX.AddMetal("cu_signal")
    ground = CSX.AddMetal("cu_ground")

    fr4.AddBox([stack_x0, stack_y0, z_gnd], [stack_x1, stack_y1, z_sig], priority=1)
    front_pp.AddBox([stack_x0, stack_y0, z_sig], [stack_x1, stack_y1, front_pp_t], priority=1)
    rear_pp.AddBox(
        [stack_x0, stack_y0, z_gnd - rear_pp_t],
        [stack_x1, stack_y1, z_gnd],
        priority=1,
    )
    add_sheet_box(ground, stack_x0, stack_x1, stack_y0, stack_y1, z_gnd, priority=20)

    mesh_xy: list[tuple[float, float]] = []

    if dut == "thru":
        # Same reference planes as the T-cell, but replace the DUT with a
        # uniform 50-ohm line. This is the mandatory port-fixture sanity check.
        a = {"x": p_in["x"], "y": p_in["y"]}
        b = {"x": p_out["x"], "y": p_out["y"]}
        poly = add_sheet_route(signal, a, b, w50, z=z_sig)
        mesh_xy.extend(map(tuple, poly))
    else:
        for a, b, width in (
            (p_in, tcell["junction"], tcell["seriesWidthMm"]),
            (tcell["junction"], p_out, tcell["through50WidthMm"]),
            (tcell["junction"], p_branch, tcell["branchWidthMm"]),
        ):
            poly = add_sheet_route(signal, a, b, width, z=z_sig)
            mesh_xy.extend(map(tuple, poly))

        # Explicit overlap nodes, matching the PCB continuity fix.
        j = tcell["junction"]
        js = tcell["junctionNodeSizeMm"]
        add_sheet_box(signal, j["x"] - js / 2, j["x"] + js / 2, j["y"] - js / 2, j["y"] + js / 2, z_sig)
        fs = patch["feedNodeSizeMm"]
        add_sheet_box(
            signal,
            p_branch["x"] - fs / 2,
            p_branch["x"] + fs / 2,
            p_branch["y"] - fs / 2,
            p_branch["y"] + fs / 2,
            z_sig,
        )

        # Uniform branch fixture from the transformer output to port 3.
        branch_end = {"x": p_branch["x"], "y": branch_outer_y}
        poly = add_sheet_route(signal, p_branch, branch_end, patch["feedWidthMm"], z=z_sig)
        mesh_xy.extend(map(tuple, poly))

    # Mesh has to exist before AddMSLPort because MSLPort reads mesh lines.
    domain = {
        "x0": stack_x0 - 9.0,
        "x1": stack_x1 + 9.0,
        "y0": stack_y0 - 9.0,
        "y1": stack_y1 + 9.0,
        "z0": z_gnd - rear_pp_t - 9.0,
        "z1": front_pp_t + 9.0,
    }

    x_lines = [domain["x0"], stack_x0, -fixture_x, p_in["x"], 0.0, p_out["x"], fixture_x, stack_x1, domain["x1"]]
    y_lines = [domain["y0"], stack_y0, p_in["y"], tcell["junction"]["y"], p_branch["y"], branch_outer_y, stack_y1, domain["y1"]]

    for x, y in mesh_xy:
        x_lines.append(float(x))
        y_lines.append(float(y))

    # Explicit width-edge lines help the numerical MSL Z0 extraction.
    for cx, width in ((0.0, patch["feedWidthMm"]),):
        x_lines.extend([cx - width / 2, cx, cx + width / 2])
    y50 = p_in["y"]
    y_lines.extend([y50 - w50 / 2, y50, y50 + w50 / 2])

    z_lines = [
        domain["z0"],
        z_gnd - rear_pp_t,
        z_gnd,
        -fr4_t / 2,
        z_sig,
        front_pp_t,
        domain["z1"],
    ]

    mesh.AddLine("x", np.unique(np.round(x_lines, 6)))
    mesh.AddLine("y", np.unique(np.round(y_lines, 6)))
    mesh.AddLine("z", np.unique(np.round(z_lines, 6)))
    mesh.SmoothMeshLines("x", cfg["xy_res"], 1.4)
    mesh.SmoothMeshLines("y", cfg["xy_res"], 1.4)
    mesh.SmoothMeshLines("z", cfg["z_res"], 1.4)

    # Port 1: OUTSIDE -> DUT, excited and 50-ohm terminated.
    port1 = FDTD.AddMSLPort(
        1,
        signal,
        [ -fixture_x, y50 - w50 / 2, z_sig ],
        [ p_in["x"], y50 + w50 / 2, z_gnd ],
        "x",
        "z",
        excite=-1,
        Feed_R=50,
        MeasPlaneShift=(fixture_x + p_in["x"]) / 2,
        priority=50,
        edges2grid="xyz",
    )

    # Port 2 MUST also be OUTSIDE -> DUT. This makes the wave leaving the DUT
    # appear in uf_ref, exactly as in the official openEMS MSL tutorial.
    port2 = FDTD.AddMSLPort(
        2,
        signal,
        [ fixture_x, y50 - w50 / 2, z_sig ],
        [ p_out["x"], y50 + w50 / 2, z_gnd ],
        "x",
        "z",
        excite=0,
        Feed_R=50,
        MeasPlaneShift=(fixture_x - p_out["x"]) / 2,
        priority=50,
        edges2grid="xyz",
    )

    ports = [port1, port2]

    if dut == "tcell":
        # Branch output: OUTSIDE (larger y) -> DUT (smaller y).
        fw = patch["feedWidthMm"]
        port3 = FDTD.AddMSLPort(
            3,
            signal,
            [ -fw / 2, branch_outer_y, z_sig ],
            [ +fw / 2, p_branch["y"], z_gnd ],
            "y",
            "z",
            excite=0,
            Feed_R=50,
            MeasPlaneShift=(branch_outer_y - p_branch["y"]) / 2,
            priority=50,
            edges2grid="xyz",
        )
        ports.append(port3)

    sim_path.mkdir(parents=True, exist_ok=True)
    CSX.Write2XML(str(sim_path / f"{dut}.xml"))

    f_lo = 2.20e9 if profile != "smoke" else 2.35e9
    f_hi = 2.70e9 if profile != "smoke" else 2.55e9
    freq = np.linspace(f_lo, f_hi, cfg["points"])

    metadata = {
        "dut": dut,
        "profile": profile,
        "nr_ts": cfg["nr_ts"],
        "end_criteria": cfg["end_criteria"],
        "xy_res_mm": cfg["xy_res"],
        "z_res_mm": cfg["z_res"],
        "fixture_x_mm": fixture_x,
        "branch_outer_y_mm": branch_outer_y,
        "metal_model": "PEC sheet",
        "port_feed_R_ohm": 50.0,
    }
    return FDTD, ports, freq, g, metadata


def db20(x):
    return 20 * np.log10(np.maximum(np.abs(x), 1e-15))


def analyze(ports, sim_path: Path, freq, dut: str):
    # First let MSLPort extract its native line impedance and beta.
    native_z = []
    native_beta = []
    for p in ports:
        p.CalcPort(str(sim_path), freq, signal_type="pulse")
        native_z.append(np.asarray(p.Z_ref).copy())
        native_beta.append(np.asarray(p.beta).copy())

    # Then renormalize to the system's desired 50-ohm reference.
    for p in ports:
        p.CalcPort(str(sim_path), freq, ref_impedance=50.0, signal_type="pulse")

    inc = ports[0].uf_inc
    s11 = ports[0].uf_ref / inc
    s21 = ports[1].uf_ref / inc

    s = {"S11": s11, "S21": s21}
    if dut == "tcell":
        s31 = ports[2].uf_ref / inc
        s["S31"] = s31

    p_sum = np.abs(s11) ** 2 + np.abs(s21) ** 2
    if dut == "tcell":
        p_sum = p_sum + np.abs(s["S31"]) ** 2

    zin = ports[0].uf_tot / ports[0].if_tot

    return {
        "s": s,
        "power_sum": p_sum,
        "zin": zin,
        "native_z": native_z,
        "native_beta": native_beta,
    }


def run(args):
    out_dir = args.out.resolve()
    sim_path = out_dir / f"{args.dut}_{args.profile}"
    if sim_path.exists() and not args.post_only:
        shutil.rmtree(sim_path)

    FDTD, ports, freq, g, metadata = build_model(sim_path, args.dut, args.profile)

    if args.xml_only:
        print(sim_path / f"{args.dut}.xml")
        return

    if not args.post_only:
        FDTD.Run(
            str(sim_path),
            cleanup=False,
            verbose=1,
            numThreads=args.threads,
            disable_dumps=True,
        )

    a = analyze(ports, sim_path, freq, args.dut)
    i0 = int(np.argmin(np.abs(freq - g["frequencyGHz"] * 1e9)))

    result = {
        "geometry_schema": g["schema"],
        **metadata,
        "frequency_hz": freq.tolist(),
        "S11_db": db20(a["s"]["S11"]).tolist(),
        "S21_db": db20(a["s"]["S21"]).tolist(),
        "power_sum": a["power_sum"].tolist(),
        "Zin_real_ohm": np.real(a["zin"]).tolist(),
        "Zin_imag_ohm": np.imag(a["zin"]).tolist(),
        "native_port_Z_real_ohm": [np.real(z).tolist() for z in a["native_z"]],
        "native_port_Z_imag_ohm": [np.imag(z).tolist() for z in a["native_z"]],
    }
    if args.dut == "tcell":
        result["S31_db"] = db20(a["s"]["S31"]).tolist()

    summary = {
        "dut": args.dut,
        "profile": args.profile,
        "f_ghz": float(freq[i0] / 1e9),
        "S11_db": float(result["S11_db"][i0]),
        "S21_db": float(result["S21_db"][i0]),
        "power_sum": float(result["power_sum"][i0]),
        "passivity_excess": float(max(0.0, result["power_sum"][i0] - 1.0)),
        "Zin_ohm": [
            float(result["Zin_real_ohm"][i0]),
            float(result["Zin_imag_ohm"][i0]),
        ],
        "native_port_Z_ohm": [
            [
                float(result["native_port_Z_real_ohm"][n][i0]),
                float(result["native_port_Z_imag_ohm"][n][i0]),
            ]
            for n in range(len(ports))
        ],
    }

    if args.dut == "tcell":
        summary["S31_db"] = float(result["S31_db"][i0])
        summary["branch_power_fraction_50ohm"] = float(abs(a["s"]["S31"][i0]) ** 2)
        summary["target_branch_power_fraction"] = float(g["tcell"]["targetExtraction"])
        summary["branch_error_abs"] = (
            summary["branch_power_fraction_50ohm"]
            - summary["target_branch_power_fraction"]
        )

    # Validity gate. Do not tune the PCB if the fixture fails this test.
    if args.dut == "thru":
        summary["fixture_valid"] = bool(
            summary["S11_db"] <= -12.0
            and summary["S21_db"] >= -1.5
            and summary["power_sum"] <= 1.05
        )
    else:
        summary["network_result_valid"] = bool(summary["power_sum"] <= 1.05)

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{args.dut}_{args.profile}.json").write_text(
        json.dumps(result, indent=2),
        encoding="utf-8",
    )
    (out_dir / f"{args.dut}_{args.profile}_summary.json").write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dut", choices=["thru", "tcell"], default="thru")
    parser.add_argument("--profile", choices=["smoke", "fast", "verify"], default="fast")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--post-only", action="store_true")
    parser.add_argument("--xml-only", action="store_true")
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
