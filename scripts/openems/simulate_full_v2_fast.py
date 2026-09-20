#!/usr/bin/env python3
"""Fast full-board openEMS model for Full Engineering Board V2.

This model is intentionally between the cheap T-cell coupon and the final
workpiece/full-power model. It includes the actual 50 x 60 mm engineering PCB:

- magnetic RF IN/OUT signal pads;
- ground contact pads and return vias;
- V2 pad tapers, T-cell and octagonal junction;
- branch-to-inset taper and rectangular Patch;
- finite bottom ground plane;
- the low-frequency ID copper chain, with selectable RF resistor model.

It does NOT claim workpiece absorbed power. The reported non-through power

    1 - |S11|^2 - |S21|^2

contains Patch radiation, dielectric loss and other accepted/lost power. It is a
screening observable only.

The geometry sources are shared with tscircuit:
- design/tcell_candidate_v2.json
- pcb/tscircuit/src/full-engineering-board-v2-geometry.json

Default copper is zero-thickness PEC for speed. Finite conductivity/thickness is
a later loss sensitivity, not part of this fast screen.
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
RF_GEOM_PATH = ROOT / "design" / "tcell_candidate_v2.json"
FULL_GEOM_PATH = (
    ROOT / "pcb" / "tscircuit" / "src" / "full-engineering-board-v2-geometry.json"
)
DEFAULT_OUT = ROOT / "results" / "openems_full_v2_fast"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def polygon(prop, pts, z=0.0, priority=20):
    px = np.asarray([p[0] for p in pts], dtype=float)
    py = np.asarray([p[1] for p in pts], dtype=float)
    prop.AddPolygon(points=[px, py], norm_dir=2, elevation=z, priority=priority)
    return np.column_stack([px, py])


def sheet_box(prop, x0, x1, y0, y1, z=0.0, priority=20):
    prop.AddBox(
        start=[min(x0, x1), min(y0, y1), z],
        stop=[max(x0, x1), max(y0, y1), z],
        priority=priority,
    )


def sheet_center_box(prop, cx, cy, w, h, z=0.0, priority=20):
    sheet_box(prop, cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, z, priority)


def line_polygon(a: dict, b: dict, width: float):
    dx = b["x"] - a["x"]
    dy = b["y"] - a["y"]
    length = math.hypot(dx, dy)
    if length <= 0:
        raise ValueError("zero-length RF segment")
    nx = -dy / length * width / 2
    ny = dx / length * width / 2
    return [
        (a["x"] + nx, a["y"] + ny),
        (b["x"] + nx, b["y"] + ny),
        (b["x"] - nx, b["y"] - ny),
        (a["x"] - nx, a["y"] - ny),
    ]


def octagon(center: dict, diameter: float):
    r = diameter / 2
    return [
        (
            center["x"] + r * math.cos(math.pi / 8 + i * math.pi / 4),
            center["y"] + r * math.sin(math.pi / 8 + i * math.pi / 4),
        )
        for i in range(8)
    ]


def x_taper(x0, x1, y, width0, width1):
    return [
        (x0, y + width0 / 2),
        (x1, y + width1 / 2),
        (x1, y - width1 / 2),
        (x0, y - width0 / 2),
    ]


def y_taper(x, y0, y1, width0, width1):
    return [
        (x - width0 / 2, y0),
        (x - width1 / 2, y1),
        (x + width1 / 2, y1),
        (x + width0 / 2, y0),
    ]


def add_via(prop, x, y, radius, z0, z1, priority=30):
    prop.AddCylinder(
        start=[x, y, min(z0, z1)],
        stop=[x, y, max(z0, z1)],
        radius=radius,
        priority=priority,
    )


def profile_config(name: str) -> dict:
    return {
        "smoke": {
            "nr_ts": 6000,
            "end_criteria": 1e-2,
            "xy_res": 1.40,
            "z_res": 0.80,
            "points": 21,
            "f_lo": 2.35e9,
            "f_hi": 2.55e9,
        },
        "fast": {
            "nr_ts": 28000,
            "end_criteria": 1e-3,
            "xy_res": 1.00,
            "z_res": 0.60,
            "points": 61,
            "f_lo": 2.30e9,
            "f_hi": 2.60e9,
        },
        "screen": {
            "nr_ts": 45000,
            "end_criteria": 2e-4,
            "xy_res": 0.80,
            "z_res": 0.45,
            "points": 101,
            "f_lo": 2.25e9,
            "f_hi": 2.65e9,
        },
    }[name]


def build_model(sim_path: Path, profile: str, id_mode: str):
    rf = load_json(RF_GEOM_PATH)
    full = load_json(FULL_GEOM_PATH)
    cfg = profile_config(profile)

    board = rf["board"]
    stack = rf["stackup"]
    patch = rf["patch"]
    tc = rf["tcell"]
    launch = rf["launch"]
    idg = full["id"]

    f0 = rf["frequencyGHz"] * 1e9
    fc = 0.30e9

    FDTD = openEMS(NrTS=cfg["nr_ts"], EndCriteria=cfg["end_criteria"])
    FDTD.SetGaussExcite(f0, fc)
    FDTD.SetBoundaryCond(["PML_8"] * 6)

    CSX = ContinuousStructure()
    FDTD.SetCSX(CSX)
    mesh = CSX.GetGrid()
    mesh.SetDeltaUnit(1e-3)

    fr4_t = stack["fr4ThicknessMm"]
    z_sig = 0.0
    z_gnd = -fr4_t

    x_min = board["center"]["x"] - board["widthMm"] / 2
    x_max = board["center"]["x"] + board["widthMm"] / 2
    y_min = board["center"]["y"] - board["heightMm"] / 2
    y_max = board["center"]["y"] + board["heightMm"] / 2

    fr4_kappa = (
        2 * math.pi * f0 * EPS0 * stack["fr4EpsilonR"] * stack["fr4LossTangent"]
    )
    pp_kappa = (
        2 * math.pi * f0 * EPS0 * stack["ppEpsilonR"] * stack["ppLossTangent"]
    )

    fr4 = CSX.AddMaterial("FR4", epsilon=stack["fr4EpsilonR"], kappa=fr4_kappa)
    front_pp = CSX.AddMaterial(
        "front_PP", epsilon=stack["ppEpsilonR"], kappa=pp_kappa
    )
    signal = CSX.AddMetal("RF_TOP")
    ground = CSX.AddMetal("GROUND")
    id_metal = CSX.AddMetal("ID_TOP")

    # Finite product stack. Rear PP is omitted in the fast model because the
    # continuous bottom ground screens it to first order.
    fr4.AddBox([x_min, y_min, z_gnd], [x_max, y_max, z_sig], priority=1)
    front_pp.AddBox(
        [x_min, y_min, z_sig],
        [x_max, y_max, stack["frontPpThicknessMm"]],
        priority=1,
    )
    edge = board["edgeMarginMm"]
    sheet_box(
        ground,
        x_min + edge,
        x_max - edge,
        y_min + edge,
        y_max - edge,
        z_gnd,
        priority=20,
    )

    mesh_xy: list[tuple[float, float]] = []

    # RF launch signal pads.
    for sx in (-launch["contactXAbsMm"], launch["contactXAbsMm"]):
        sheet_center_box(
            signal,
            sx,
            launch["signalPadCenterYMm"],
            launch["signalPadWidthMm"],
            launch["signalPadHeightMm"],
            z_sig,
        )
        mesh_xy.extend(
            [
                (
                    sx - launch["signalPadWidthMm"] / 2,
                    launch["signalPadCenterYMm"] - launch["signalPadHeightMm"] / 2,
                ),
                (
                    sx + launch["signalPadWidthMm"] / 2,
                    launch["signalPadCenterYMm"] + launch["signalPadHeightMm"] / 2,
                ),
            ]
        )

    p_in = tc["inputReference"]
    p_out = tc["outputReference"]
    p_patch = patch["feedReference"]
    junction = tc["junction"]

    # Same pad tapers as tscircuit.
    pt = full["padTransition"]
    poly = polygon(
        signal,
        x_taper(
            p_in["x"] - pt["lengthMm"],
            p_in["x"] + pt["overlapMm"],
            p_in["y"],
            launch["signalPadHeightMm"],
            tc["seriesWidthMm"],
        ),
    )
    mesh_xy.extend(map(tuple, poly))
    poly = polygon(
        signal,
        x_taper(
            p_out["x"] - pt["overlapMm"],
            p_out["x"] + pt["lengthMm"],
            p_out["y"],
            tc["through50WidthMm"],
            launch["signalPadHeightMm"],
        ),
    )
    mesh_xy.extend(map(tuple, poly))

    # V2 T-cell lines.
    for a, b, width in (
        (p_in, junction, tc["seriesWidthMm"]),
        (junction, p_out, tc["through50WidthMm"]),
        (junction, p_patch, tc["branchWidthMm"]),
    ):
        poly = polygon(signal, line_polygon(a, b, width))
        mesh_xy.extend(map(tuple, poly))

    # Octagonal junction.
    poly = polygon(signal, octagon(junction, full["junction"]["diameterMm"]))
    mesh_xy.extend(map(tuple, poly))

    # Branch-to-Patch taper.
    patch_y_min = patch["center"]["y"] - patch["lengthMm"] / 2
    patch_y_max = patch["center"]["y"] + patch["lengthMm"] / 2
    notch_w = patch["feedWidthMm"] + 2 * patch["insetGapMm"]
    notch_x_min = -notch_w / 2
    notch_x_max = notch_w / 2
    notch_y_max = patch_y_min + patch["insetDepthMm"]

    bf = full["branchToFeed"]
    taper_end_y = p_patch["y"] + bf["taperLengthMm"]
    feed_end = {"x": p_patch["x"], "y": notch_y_max + 0.2}

    poly = polygon(
        signal,
        y_taper(
            p_patch["x"],
            p_patch["y"] - bf["startOverlapMm"],
            taper_end_y,
            tc["branchWidthMm"],
            patch["feedWidthMm"],
        ),
    )
    mesh_xy.extend(map(tuple, poly))
    poly = polygon(
        signal,
        line_polygon(
            {"x": p_patch["x"], "y": taper_end_y - bf["endOverlapMm"]},
            feed_end,
            patch["feedWidthMm"],
        ),
    )
    mesh_xy.extend(map(tuple, poly))

    # Inset-fed Patch.
    patch_x_min = patch["center"]["x"] - patch["widthMm"] / 2
    patch_x_max = patch["center"]["x"] + patch["widthMm"] / 2
    sheet_box(signal, patch_x_min, patch_x_max, notch_y_max, patch_y_max, z_sig)
    sheet_box(signal, patch_x_min, notch_x_min, patch_y_min, notch_y_max, z_sig)
    sheet_box(signal, notch_x_max, patch_x_max, patch_y_min, notch_y_max, z_sig)
    mesh_xy.extend(
        [
            (patch_x_min, patch_y_min),
            (patch_x_max, patch_y_max),
            (notch_x_min, notch_y_max),
            (notch_x_max, notch_y_max),
        ]
    )

    # Ground contact pads and return vias.
    for sx in (-launch["contactXAbsMm"], launch["contactXAbsMm"]):
        sheet_center_box(
            ground,
            sx,
            launch["groundPadCenterYMm"],
            launch["groundPadWidthMm"],
            launch["groundPadHeightMm"],
            z_sig,
            priority=25,
        )
        for dx in launch["viaXOffsetsMm"]:
            vx = sx + dx
            add_via(
                ground,
                vx,
                launch["groundPadCenterYMm"],
                launch["viaOuterDiameterMm"] / 2,
                z_gnd,
                z_sig,
            )
            mesh_xy.append((vx, launch["groundPadCenterYMm"]))

    # ID chain. At RF, 10 kOhm is close to open. The default model includes
    # the full copper length but leaves the resistor gap open. A lumped 10 kOhm
    # model is available for sensitivity without changing the PCB geometry.
    if id_mode != "off":
        iy = idg["yMm"]
        padx = idg["padXAbsMm"]
        padw = idg["padWidthMm"]
        padh = idg["padHeightMm"]
        tw = idg["traceWidthMm"]
        gap = idg["emGapHalfLengthMm"]

        sheet_center_box(id_metal, -padx, iy, padw, padh, z_sig)
        sheet_center_box(id_metal, padx, iy, padw, padh, z_sig)
        left_inner = -padx + padw / 2
        right_inner = padx - padw / 2

        # Straight fast-EM approximation of the routed ID traces.
        sheet_box(id_metal, left_inner, -gap, iy - tw / 2, iy + tw / 2, z_sig)
        sheet_box(id_metal, gap, right_inner, iy - tw / 2, iy + tw / 2, z_sig)
        mesh_xy.extend(
            [
                (-padx - padw / 2, iy - padh / 2),
                (-gap, iy),
                (gap, iy),
                (padx + padw / 2, iy + padh / 2),
            ]
        )

        if id_mode == "10k":
            rprop = CSX.AddLumpedElement(
                "ID_R_10K",
                ny="x",
                caps=True,
                R=float(idg["resistorOhm"]),
                LEtype=1,
            )
            half_w = idg["emResistorStripHalfWidthMm"]
            # Thin local volume only; no mesh line is forced through its z extent.
            rprop.AddBox(
                [-gap, iy - half_w, -0.05],
                [gap, iy + half_w, 0.05],
                priority=35,
            )

    # Compact open boundary domain.
    domain = {
        "x0": x_min - 8.0,
        "x1": x_max + 8.0,
        "y0": y_min - 8.0,
        "y1": y_max + 8.0,
        "z0": z_gnd - 5.0,
        "z1": stack["frontPpThicknessMm"] + 10.0,
    }

    x_lines = [domain["x0"], x_min, x_max, domain["x1"], 0.0]
    y_lines = [domain["y0"], y_min, y_max, domain["y1"]]
    for x, y in mesh_xy:
        x_lines.append(float(x))
        y_lines.append(float(y))

    # Important feature/reference lines.
    x_lines.extend(
        [
            -launch["contactXAbsMm"],
            launch["contactXAbsMm"],
            p_in["x"],
            p_out["x"],
            junction["x"],
            p_patch["x"],
            -idg["emGapHalfLengthMm"],
            idg["emGapHalfLengthMm"],
        ]
    )
    y_lines.extend(
        [
            launch["signalPadCenterYMm"],
            launch["groundPadCenterYMm"],
            p_in["y"],
            junction["y"],
            p_patch["y"],
            patch_y_min,
            notch_y_max,
            patch_y_max,
            idg["yMm"],
        ]
    )
    z_lines = [
        domain["z0"],
        z_gnd,
        -fr4_t / 2,
        z_sig,
        stack["frontPpThicknessMm"],
        domain["z1"],
    ]

    mesh.AddLine("x", np.unique(np.round(x_lines, 6)))
    mesh.AddLine("y", np.unique(np.round(y_lines, 6)))
    mesh.AddLine("z", np.unique(np.round(z_lines, 6)))
    mesh.SmoothMeshLines("x", cfg["xy_res"], 1.4)
    mesh.SmoothMeshLines("y", cfg["xy_res"], 1.4)
    mesh.SmoothMeshLines("z", cfg["z_res"], 1.4)

    # Coplanar lumped ports bridge the actual top-side signal pad and adjacent
    # top-side GND pad. This better matches the magnetic contact pair than a
    # vertical signal-to-bottom-ground excitation. Return vias and the bottom
    # plane therefore participate naturally in the current path.
    port_half_x = min(0.8, launch["signalPadWidthMm"] / 4)
    signal_edge_y = (
        launch["signalPadCenterYMm"] - launch["signalPadHeightMm"] / 2
    )
    ground_edge_y = (
        launch["groundPadCenterYMm"] + launch["groundPadHeightMm"] / 2
    )
    ports = []
    for nr, sx, excite in (
        (1, -launch["contactXAbsMm"], 1),
        (2, launch["contactXAbsMm"], 0),
    ):
        port = FDTD.AddLumpedPort(
            port_nr=nr,
            R=50.0,
            start=[
                sx - port_half_x,
                ground_edge_y,
                -0.10,
            ],
            stop=[
                sx + port_half_x,
                signal_edge_y,
                0.10,
            ],
            p_dir="y",
            excite=excite,
            priority=50,
            edges2grid="xy",
        )
        ports.append(port)

    sim_path.mkdir(parents=True, exist_ok=True)
    CSX.Write2XML(str(sim_path / f"full_v2_{profile}_{id_mode}.xml"))
    freq = np.linspace(cfg["f_lo"], cfg["f_hi"], cfg["points"])

    metadata = {
        "profile": profile,
        "id_mode": id_mode,
        "nr_ts": cfg["nr_ts"],
        "end_criteria": cfg["end_criteria"],
        "xy_res_mm": cfg["xy_res"],
        "z_res_mm": cfg["z_res"],
        "metal_model": "zero-thickness PEC",
        "port_model": full["em"]["defaultPortModel"],
        "rear_pp_model": "omitted behind continuous bottom ground in fast model",
        "mesh_lines": {
            "x": int(len(mesh.GetLines(0))),
            "y": int(len(mesh.GetLines(1))),
            "z": int(len(mesh.GetLines(2))),
        },
        "yee_cells_approx": int(
            max(0, len(mesh.GetLines(0)) - 1)
            * max(0, len(mesh.GetLines(1)) - 1)
            * max(0, len(mesh.GetLines(2)) - 1)
        ),
    }
    return FDTD, ports, freq, rf, full, metadata


def db20(x):
    return 20.0 * np.log10(np.maximum(np.abs(x), 1e-15))


def contiguous_bandwidth(freq, mask, center_hz):
    i0 = int(np.argmin(np.abs(freq - center_hz)))
    if not mask[i0]:
        return 0.0, None, None
    lo = i0
    hi = i0
    while lo > 0 and mask[lo - 1]:
        lo -= 1
    while hi + 1 < len(mask) and mask[hi + 1]:
        hi += 1
    return float(freq[hi] - freq[lo]), float(freq[lo]), float(freq[hi])


def run(args):
    out_dir = args.out.resolve()
    sim_path = out_dir / f"{args.profile}_{args.id_mode}"
    if sim_path.exists() and not args.post_only:
        shutil.rmtree(sim_path)

    FDTD, ports, freq, rf, full, metadata = build_model(
        sim_path, args.profile, args.id_mode
    )

    if args.xml_only:
        print(sim_path / f"full_v2_{args.profile}_{args.id_mode}.xml")
        return

    if not args.post_only:
        FDTD.Run(
            str(sim_path),
            cleanup=False,
            verbose=1,
            numThreads=args.threads,
            disable_dumps=True,
        )

    for p in ports:
        p.CalcPort(str(sim_path), freq, ref_impedance=50.0, signal_type="pulse")

    inc = ports[0].uf_inc
    s11 = ports[0].uf_ref / inc
    s21 = ports[1].uf_ref / inc

    reflected = np.abs(s11) ** 2
    through = np.abs(s21) ** 2
    power_sum = reflected + through
    non_through = np.maximum(0.0, 1.0 - power_sum)

    f0 = rf["frequencyGHz"] * 1e9
    i0 = int(np.argmin(np.abs(freq - f0)))

    s11_db = db20(s11)
    s21_db = db20(s21)
    vswr = (1.0 + np.abs(s11)) / np.maximum(1.0 - np.abs(s11), 1e-12)

    # Customer VSWR <= 2 corresponds to |S11| <= 1/3 -> -9.542 dB.
    mask_vswr2 = s11_db <= 20.0 * math.log10(1.0 / 3.0)
    bw_hz, bw_lo, bw_hi = contiguous_bandwidth(freq, mask_vswr2, f0)

    result = {
        **metadata,
        "geometry": {
            "rf": str(RF_GEOM_PATH.relative_to(ROOT)),
            "full": str(FULL_GEOM_PATH.relative_to(ROOT)),
        },
        "frequency_hz": freq.tolist(),
        "S11_db": s11_db.tolist(),
        "S11_phase_deg": np.angle(s11, deg=True).tolist(),
        "S21_db": s21_db.tolist(),
        "S21_phase_deg": np.angle(s21, deg=True).tolist(),
        "VSWR": vswr.tolist(),
        "power_sum_reflected_plus_through": power_sum.tolist(),
        "non_through_accepted_fraction": non_through.tolist(),
    }

    summary = {
        "profile": args.profile,
        "id_mode": args.id_mode,
        "f_ghz": float(freq[i0] / 1e9),
        "S11_db": float(s11_db[i0]),
        "S21_db": float(s21_db[i0]),
        "VSWR": float(vswr[i0]),
        "reflected_power_fraction": float(reflected[i0]),
        "through_power_fraction": float(through[i0]),
        "non_through_accepted_fraction": float(non_through[i0]),
        "power_sum_reflected_plus_through": float(power_sum[i0]),
        "passivity_excess": float(max(0.0, power_sum[i0] - 1.0)),
        "vswr_le_2_bandwidth_mhz": bw_hz / 1e6,
        "vswr_le_2_band_lo_ghz": None if bw_lo is None else bw_lo / 1e9,
        "vswr_le_2_band_hi_ghz": None if bw_hi is None else bw_hi / 1e9,
        "target_non_through_fraction_reference": float(
            rf["tcell"]["targetExtraction"]
        ),
        "yee_cells_approx": metadata["yee_cells_approx"],
        "screen_gate": bool(
            s11_db[i0] <= -10.0
            and power_sum[i0] <= 1.05
            and bw_hz >= 50e6
        ),
        "interpretation": (
            "non_through_accepted_fraction is not pure workpiece absorption; "
            "it combines Patch radiation and all accepted/lost power in this fast model"
        ),
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"full_v2_{args.profile}_{args.id_mode}"
    (out_dir / f"{stem}.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )
    (out_dir / f"{stem}_summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--profile", choices=["smoke", "fast", "screen"], default="fast"
    )
    parser.add_argument(
        "--id-mode",
        choices=["off", "open", "10k"],
        default="open",
        help="off=no ID copper; open=ID copper with RF-open resistor gap; 10k=lumped 10 kOhm",
    )
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--post-only", action="store_true")
    parser.add_argument("--xml-only", action="store_true")
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
