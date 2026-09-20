#!/usr/bin/env python3
"""Full-wave openEMS model for the canonical T-cell calibration PCB.

Geometry is loaded from pcb/tscircuit/src/tcell-calibration-geometry.json, the
same file consumed by tscircuit. This prevents silent PCB/EM coordinate drift.

Two modes are supported:

* full: exact calibration PCB copper including the Patch. Ports are RF IN/OUT.
  The non-through accepted-power residual is reported as the first extraction
  observable; it still includes dielectric/radiation loss and is not claimed to
  be pure Patch accepted power.
* network: omit the Patch body and terminate the straight inset-feed segment
  with a third MSL port. This isolates the T-cell's three-port extraction before
  loaded-Patch calibration.
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
DEFAULT_OUT = ROOT / "results" / "openems_tcell_calibration"


def load_geometry() -> dict:
    return json.loads(GEOM_PATH.read_text(encoding="utf-8"))


def stroke_polygon(a: dict[str, float], b: dict[str, float], width: float) -> tuple[np.ndarray, np.ndarray]:
    dx = b["x"] - a["x"]
    dy = b["y"] - a["y"]
    length = math.hypot(dx, dy)
    if length <= 0:
        raise ValueError("zero-length RF segment")
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


def add_box(prop, x0, x1, y0, y1, z0, z1, priority=10):
    prop.AddBox(
        start=[min(x0, x1), min(y0, y1), min(z0, z1)],
        stop=[max(x0, x1), max(y0, y1), max(z0, z1)],
        priority=priority,
    )


def add_xy_box(prop, cx, cy, width, height, z0, z1, priority=20):
    add_box(
        prop,
        cx - width / 2,
        cx + width / 2,
        cy - height / 2,
        cy + height / 2,
        z0,
        z1,
        priority,
    )


def add_route(prop, a, b, width, z0, thickness, priority=20):
    px, py = stroke_polygon(a, b, width)
    prop.AddLinPoly(
        points=[px, py],
        norm_dir="z",
        elevation=z0,
        length=thickness,
        priority=priority,
    )
    return np.column_stack([px, py])


def add_via(prop, x, y, radius, z0, z1, priority=30):
    prop.AddCylinder(
        start=[x, y, min(z0, z1)],
        stop=[x, y, max(z0, z1)],
        radius=radius,
        priority=priority,
    )


def build_model(sim_path: Path, mode: str, coarse: bool = False):
    g = load_geometry()
    board = g["board"]
    stack = g["stackup"]
    patch = g["patch"]
    tcell = g["tcell"]
    launch = g["launch"]

    f0 = g["frequencyGHz"] * 1e9
    fc = 0.55e9

    FDTD = openEMS(NrTS=120000 if coarse else 180000, EndCriteria=1e-4)
    FDTD.SetGaussExcite(f0, fc)
    FDTD.SetBoundaryCond(["PML_8"] * 6)

    CSX = ContinuousStructure()
    FDTD.SetCSX(CSX)
    mesh = CSX.GetGrid()
    mesh.SetDeltaUnit(1e-3)

    copper_t = stack["copperThicknessMm"]
    fr4_t = stack["fr4ThicknessMm"]
    ground_z0 = -fr4_t - copper_t
    ground_surface_z = -fr4_t
    top_z0 = 0.0
    top_z1 = copper_t

    x_min = board["center"]["x"] - board["widthMm"] / 2
    x_max = board["center"]["x"] + board["widthMm"] / 2
    y_min = board["center"]["y"] - board["heightMm"] / 2
    y_max = board["center"]["y"] + board["heightMm"] / 2

    fr4_kappa = (
        2.0
        * math.pi
        * f0
        * EPS0
        * stack["fr4EpsilonR"]
        * stack["fr4LossTangent"]
    )
    pp_kappa = (
        2.0
        * math.pi
        * f0
        * EPS0
        * stack["ppEpsilonR"]
        * stack["ppLossTangent"]
    )

    fr4 = CSX.AddMaterial(
        "FR4",
        epsilon=stack["fr4EpsilonR"],
        kappa=fr4_kappa,
    )
    front_pp = CSX.AddMaterial(
        "front_PP",
        epsilon=stack["ppEpsilonR"],
        kappa=pp_kappa,
    )
    rear_pp = CSX.AddMaterial(
        "rear_PP",
        epsilon=stack["ppEpsilonR"],
        kappa=pp_kappa,
    )
    signal = CSX.AddMetal("cu_signal")
    ground = CSX.AddMetal("cu_ground")

    add_box(fr4, x_min, x_max, y_min, y_max, -fr4_t, 0.0, priority=1)
    add_box(
        front_pp,
        x_min,
        x_max,
        y_min,
        y_max,
        top_z1,
        top_z1 + stack["frontPpThicknessMm"],
        priority=1,
    )
    add_box(
        rear_pp,
        x_min,
        x_max,
        y_min,
        y_max,
        ground_z0 - stack["rearPpThicknessMm"],
        ground_z0,
        priority=1,
    )

    edge = board["edgeMarginMm"]
    add_box(
        ground,
        x_min + edge,
        x_max - edge,
        y_min + edge,
        y_max - edge,
        ground_z0,
        ground_surface_z,
        priority=20,
    )

    mesh_xy: list[tuple[float, float]] = []

    # RF signal launch pads.
    for sx in (-launch["contactXAbsMm"], launch["contactXAbsMm"]):
        add_xy_box(
            signal,
            sx,
            launch["signalPadCenterYMm"],
            launch["signalPadWidthMm"],
            launch["signalPadHeightMm"],
            top_z0,
            top_z1,
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

    # Exact canonical T-cell copper.
    for a, b, width in (
        (tcell["inputReference"], tcell["junction"], tcell["seriesWidthMm"]),
        (tcell["junction"], tcell["outputReference"], tcell["through50WidthMm"]),
        (tcell["junction"], patch["feedReference"], tcell["branchWidthMm"]),
    ):
        poly = add_route(signal, a, b, width, top_z0, copper_t)
        mesh_xy.extend(map(tuple, poly))

    add_xy_box(
        signal,
        tcell["junction"]["x"],
        tcell["junction"]["y"],
        tcell["junctionNodeSizeMm"],
        tcell["junctionNodeSizeMm"],
        top_z0,
        top_z1,
    )
    add_xy_box(
        signal,
        patch["feedReference"]["x"],
        patch["feedReference"]["y"],
        patch["feedNodeSizeMm"],
        patch["feedNodeSizeMm"],
        top_z0,
        top_z1,
    )

    patch_y_min = patch["center"]["y"] - patch["lengthMm"] / 2
    patch_y_max = patch["center"]["y"] + patch["lengthMm"] / 2
    notch_w = patch["feedWidthMm"] + 2 * patch["insetGapMm"]
    notch_x_min = -notch_w / 2
    notch_x_max = notch_w / 2
    notch_y_max = patch_y_min + patch["insetDepthMm"]
    inset_end = {"x": patch["feedReference"]["x"], "y": notch_y_max + 0.2}

    feed_poly = add_route(
        signal,
        patch["feedReference"],
        inset_end,
        patch["feedWidthMm"],
        top_z0,
        copper_t,
    )
    mesh_xy.extend(map(tuple, feed_poly))

    if mode == "full":
        patch_x_min = patch["center"]["x"] - patch["widthMm"] / 2
        patch_x_max = patch["center"]["x"] + patch["widthMm"] / 2

        add_box(
            signal,
            patch_x_min,
            patch_x_max,
            notch_y_max,
            patch_y_max,
            top_z0,
            top_z1,
        )
        add_box(
            signal,
            patch_x_min,
            notch_x_min,
            patch_y_min,
            notch_y_max,
            top_z0,
            top_z1,
        )
        add_box(
            signal,
            notch_x_max,
            patch_x_max,
            patch_y_min,
            notch_y_max,
            top_z0,
            top_z1,
        )
        mesh_xy.extend(
            [
                (patch_x_min, patch_y_min),
                (patch_x_max, patch_y_max),
                (notch_x_min, notch_y_max),
                (notch_x_max, notch_y_max),
            ]
        )

    # Ground launch pads and plated return vias.
    for sx in (-launch["contactXAbsMm"], launch["contactXAbsMm"]):
        add_xy_box(
            ground,
            sx,
            launch["groundPadCenterYMm"],
            launch["groundPadWidthMm"],
            launch["groundPadHeightMm"],
            top_z0,
            top_z1,
            priority=25,
        )
        for dx in launch["viaXOffsetsMm"]:
            vx = sx + dx
            add_via(
                ground,
                vx,
                launch["groundPadCenterYMm"],
                launch["viaOuterDiameterMm"] / 2,
                ground_z0,
                top_z1,
            )
            mesh_xy.append((vx, launch["groundPadCenterYMm"]))

    # Computational box and feature-aligned mesh.
    domain = {
        "x0": x_min - 10.0,
        "x1": x_max + 10.0,
        "y0": y_min - 10.0,
        "y1": y_max + 10.0,
        "z0": ground_z0 - stack["rearPpThicknessMm"] - 10.0,
        "z1": top_z1 + stack["frontPpThicknessMm"] + 15.0,
    }

    x_lines = [domain["x0"], x_min, x_max, domain["x1"], 0.0]
    y_lines = [domain["y0"], y_min, y_max, domain["y1"]]
    for x, y in mesh_xy:
        x_lines.append(float(x))
        y_lines.append(float(y))
    x_lines.extend(
        [
            -launch["contactXAbsMm"],
            launch["contactXAbsMm"],
            tcell["junction"]["x"],
            patch["feedReference"]["x"],
        ]
    )
    y_lines.extend(
        [
            launch["signalPadCenterYMm"],
            launch["groundPadCenterYMm"],
            tcell["junction"]["y"],
            patch["feedReference"]["y"],
            notch_y_max,
            patch_y_min,
            patch_y_max,
        ]
    )
    z_lines = [
        domain["z0"],
        ground_z0 - stack["rearPpThicknessMm"],
        ground_z0,
        ground_surface_z,
        0.0,
        top_z1,
        top_z1 + stack["frontPpThicknessMm"],
        domain["z1"],
    ]

    mesh.AddLine("x", np.unique(np.round(x_lines, 6)))
    mesh.AddLine("y", np.unique(np.round(y_lines, 6)))
    mesh.AddLine("z", np.unique(np.round(z_lines, 6)))
    mesh.SmoothMeshLines("x", 0.9 if coarse else 0.55, 1.35)
    mesh.SmoothMeshLines("y", 0.9 if coarse else 0.55, 1.35)
    mesh.SmoothMeshLines("z", 0.8 if coarse else 0.45, 1.35)

    # Launch ports use the actual rectangular signal pads. The reported phase
    # therefore includes the launch transition, which is intentional for the
    # calibration vehicle.
    y0 = launch["signalPadCenterYMm"] - launch["signalPadHeightMm"] / 2
    y1 = launch["signalPadCenterYMm"] + launch["signalPadHeightMm"] / 2
    pad_inner = launch["contactXAbsMm"] - launch["signalPadWidthMm"] / 2
    pad_outer = launch["contactXAbsMm"] + launch["signalPadWidthMm"] / 2

    ports = [
        FDTD.AddMSLPort(
            1,
            signal,
            [-pad_outer, y0, top_z1],
            [-pad_inner, y1, ground_surface_z],
            "x",
            "z",
            excite=1,
            priority=40,
            MeasPlaneShift=2.0,
            edges2grid="xyz",
        ),
        FDTD.AddMSLPort(
            2,
            signal,
            [pad_inner, y0, top_z1],
            [pad_outer, y1, ground_surface_z],
            "x",
            "z",
            excite=0,
            priority=40,
            MeasPlaneShift=2.0,
            edges2grid="xyz",
        ),
    ]

    if mode == "network":
        # Straight feed section provides an orthogonal branch reference plane.
        port_y0 = patch["feedReference"]["y"] + 0.5
        port_y1 = port_y0 + 1.0
        ports.append(
            FDTD.AddMSLPort(
                3,
                signal,
                [-patch["feedWidthMm"] / 2, port_y0, top_z1],
                [patch["feedWidthMm"] / 2, port_y1, ground_surface_z],
                "y",
                "z",
                excite=0,
                priority=40,
                MeasPlaneShift=0.0,
                edges2grid="xyz",
            )
        )

    sim_path.mkdir(parents=True, exist_ok=True)
    CSX.Write2XML(str(sim_path / f"tcell_calibration_{mode}.xml"))
    freq = np.linspace(2.0e9, 3.0e9, 401)
    return FDTD, ports, freq, g


def calc_db(x: np.ndarray) -> np.ndarray:
    return 20.0 * np.log10(np.maximum(np.abs(x), 1e-15))


def run(out_dir: Path, mode: str, coarse: bool, post_only: bool, xml_only: bool):
    out_dir = out_dir.resolve()
    sim_path = out_dir / mode
    if sim_path.exists() and not (post_only or xml_only):
        shutil.rmtree(sim_path)

    FDTD, ports, freq, g = build_model(sim_path, mode, coarse=coarse)
    if xml_only:
        print(sim_path / f"tcell_calibration_{mode}.xml")
        return

    if not post_only:
        FDTD.Run(str(sim_path), cleanup=False, verbose=1)

    for port in ports:
        port.CalcPort(str(sim_path), freq, ref_impedance=50.0)

    inc = ports[0].uf_inc
    s11 = ports[0].uf_ref / inc
    s21 = ports[1].uf_ref / inc
    result = {
        "geometry_schema": g["schema"],
        "geometry_path": str(GEOM_PATH.relative_to(ROOT)),
        "mode": mode,
        "frequency_hz": freq.tolist(),
        "S11": {"magnitude_db": calc_db(s11).tolist()},
        "S21": {"magnitude_db": calc_db(s21).tolist()},
        "target": {
            "extraction": g["tcell"]["targetExtraction"],
            "coupling_db": g["tcell"]["targetCouplingDb"],
            "series_ohm": g["tcell"]["targetSeriesOhm"],
            "branch_ohm": g["tcell"]["targetBranchOhm"],
        },
    }

    if mode == "network":
        s31 = ports[2].uf_ref / inc
        result["S31"] = {"magnitude_db": calc_db(s31).tolist()}
    else:
        reflected = np.abs(s11) ** 2
        through = np.abs(s21) ** 2
        residual = np.maximum(0.0, 1.0 - reflected - through)
        result["non_through_accepted_power_fraction"] = residual.tolist()

    i0 = int(np.argmin(np.abs(freq - g["frequencyGHz"] * 1e9)))
    summary = {
        "mode": mode,
        "f_ghz": g["frequencyGHz"],
        "S11_db": float(result["S11"]["magnitude_db"][i0]),
        "S21_db": float(result["S21"]["magnitude_db"][i0]),
        "target_extraction": g["tcell"]["targetExtraction"],
    }
    if mode == "network":
        summary["S31_db"] = float(result["S31"]["magnitude_db"][i0])
        summary["branch_power_fraction_50ohm"] = float(
            10.0 ** (summary["S31_db"] / 10.0)
        )
    else:
        summary["non_through_accepted_power_fraction"] = float(
            result["non_through_accepted_power_fraction"][i0]
        )
        summary["extraction_error_abs"] = (
            summary["non_through_accepted_power_fraction"]
            - g["tcell"]["targetExtraction"]
        )

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"tcell_calibration_{mode}.json").write_text(
        json.dumps(result, indent=2),
        encoding="utf-8",
    )
    (out_dir / f"tcell_calibration_{mode}_summary.json").write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["full", "network"], default="full")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--coarse", action="store_true")
    parser.add_argument("--post-only", action="store_true")
    parser.add_argument(
        "--xml-only",
        action="store_true",
        help="write the exact openEMS XML geometry without running FDTD",
    )
    args = parser.parse_args()
    run(args.out, args.mode, args.coarse, args.post_only, args.xml_only)


if __name__ == "__main__":
    main()
