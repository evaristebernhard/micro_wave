#!/usr/bin/env python3
"""Run openEMS simulations for the current A/B/C/D PCB seeds.

The geometry mirrors pcb/tscircuit/src/geometry.ts and single-board.tsx:
  - A/B/C: through line, edge-coupled branch, inset-fed patch, open ISO end
  - D: terminal phase-route feed and inset-fed patch

This is a first-pass extraction model. It is intentionally self-contained so
that it can be run without a tscircuit/TSX parser and then compared against the
source geometry. The physical reference is mm, while openEMS uses a 1e-3 grid
unit. A/B/C are driven at port 1. Port 2 is RF OUT and port 3 is the patch feed.
D is driven at its RF input and has only the patch-feed port.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from CSXCAD import ContinuousStructure
from openEMS import openEMS
from openEMS.physical_constants import C0, EPS0


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = ROOT / "results" / "openems"


PCB = {
    "board_w": 50.0,
    "board_h": 70.0,
    "patch_w": 37.5,
    "patch_l": 28.5,
    "patch_cx": 0.0,
    "patch_cy": 5.0,
    "trace_w": 2.9,
    "trace_y": -18.0,
    "inset_depth": 10.5,
    "inset_gap": 0.5,
    "rf_contact_x": 22.5,
    "copper_t": 0.035,
    "fr4_t": 1.6,
    "front_pp_t": 2.0,
    "rear_pp_t": 6.0,
}

VARIANTS = {
    "A": {"coupling_db": 6.5, "coupling_gap": 0.70, "branch_trim": 0.00},
    "B": {"coupling_db": 5.0, "coupling_gap": 0.45, "branch_trim": 0.66},
    "C": {"coupling_db": 3.0, "coupling_gap": 0.30, "branch_trim": 1.41},
    "D": {"coupling_db": None, "coupling_gap": 0.00, "branch_trim": None},
}


def smooth_mesh_lines(values: list[float], step: float) -> np.ndarray:
    """Return sorted unique fixed lines; openEMS smooths between them."""

    return np.unique(np.round(np.asarray(values, dtype=float), 6))


def stroke_polygon(points: list[tuple[float, float]], width: float) -> list[np.ndarray]:
    """Create a closed XY polygon around a polyline."""

    half = width / 2.0
    pts = np.asarray(points, dtype=float)
    normals = []
    for p, q in zip(pts[:-1], pts[1:]):
        delta = q - p
        length = np.linalg.norm(delta)
        if length == 0:
            raise ValueError("Polyline contains duplicate points")
        normals.append(np.array([-delta[1], delta[0]]) / length)

    def offset(index: int, sign: float) -> np.ndarray:
        if index == 0:
            return pts[index] + sign * half * normals[0]
        if index == len(pts) - 1:
            return pts[index] + sign * half * normals[-1]
        n0, n1 = normals[index - 1], normals[index]
        bisector = n0 + n1
        bl = np.linalg.norm(bisector)
        if bl < 1e-12:
            return pts[index] + sign * half * n1
        bisector /= bl
        denom = float(np.dot(bisector, n0))
        scale = half / max(abs(denom), 0.25)
        return pts[index] + sign * scale * bisector

    left = [offset(i, 1.0) for i in range(len(pts))]
    right = [offset(i, -1.0) for i in reversed(range(len(pts)))]
    polygon = np.vstack(left + right)
    return [polygon[:, 0], polygon[:, 1]]


def add_box(prop, start, stop, priority=10):
    prop.AddBox(start=list(start), stop=list(stop), priority=priority)


def add_top_box(top, x0, x1, y0, y1, copper_t, priority=20):
    add_box(top, [x0, y0, 0.0], [x1, y1, copper_t], priority)


def add_top_route(top, centerline, width, copper_t, priority=20):
    poly = stroke_polygon(centerline, width)
    top.AddLinPoly(points=poly, norm_dir="z", elevation=0.0, length=copper_t, priority=priority)


def add_via(top, x, y, gnd_z, copper_t, radius=0.30, priority=30):
    top.AddCylinder(start=[x, y, gnd_z], stop=[x, y, 0.0], radius=radius, priority=priority)


def add_board_geometry(CSX, FDTD, board: str):
    p = PCB
    variant = VARIANTS[board]

    # Stack-up: rear PP / ground copper / FR4 / top copper / front PP.
    fr4_kappa = 2.0 * math.pi * 2.45e9 * EPS0 * 4.3 * 0.02
    pp_kappa = 2.0 * math.pi * 2.45e9 * EPS0 * 2.2 * 0.0005
    fr4 = CSX.AddMaterial("FR4", epsilon=4.3, kappa=fr4_kappa)
    front_pp = CSX.AddMaterial("front_PP", epsilon=2.2, kappa=pp_kappa)
    rear_pp = CSX.AddMaterial("rear_PP", epsilon=2.2, kappa=pp_kappa)
    # At 2.45 GHz the 35 um copper is many skin depths thick, so the first
    # extraction uses openEMS metal/PEC primitives. Copper loss is a later
    # sensitivity sweep rather than a port-validation blocker.
    top = CSX.AddMetal("cu_top")
    gnd = CSX.AddMetal("cu_ground")

    gnd_z = -p["fr4_t"] - p["copper_t"]
    gnd_surface_z = -p["fr4_t"]
    front_pp_z = p["copper_t"]
    rear_pp_z = gnd_z - p["rear_pp_t"]

    # Ten millimetres of the same stack is used as a connector launch outside
    # the 50 mm board outline so the MSL ports can terminate at the PML faces.
    add_box(fr4, [-35, -35, -p["fr4_t"]], [35, 35, 0.0], priority=1)
    add_box(front_pp, [-35, -35, front_pp_z], [35, 35, front_pp_z + p["front_pp_t"]], priority=1)
    add_box(rear_pp, [-35, -35, rear_pp_z], [35, 35, gnd_z], priority=1)
    # Ground plane is at the bottom of the FR4 stack.
    gnd.AddBox(start=[-35, -35, gnd_z], stop=[35, 35, -p["fr4_t"]], priority=20)

    patch_x0 = p["patch_cx"] - p["patch_w"] / 2.0
    patch_x1 = p["patch_cx"] + p["patch_w"] / 2.0
    patch_y0 = p["patch_cy"] - p["patch_l"] / 2.0
    patch_y1 = p["patch_cy"] + p["patch_l"] / 2.0
    notch_w = p["trace_w"] + 2.0 * p["inset_gap"]
    notch_x0 = -notch_w / 2.0
    notch_x1 = notch_w / 2.0
    notch_y1 = patch_y0 + p["inset_depth"]

    # Main through-line for A/B/C.
    if board != "D":
        add_top_box(top, -35.0, 35.0, p["trace_y"] - p["trace_w"] / 2.0,
                    p["trace_y"] + p["trace_w"] / 2.0, p["copper_t"])

        coupled_y = p["trace_y"] + p["trace_w"] + variant["coupling_gap"]
        add_top_box(top, -17.0, 0.0, coupled_y - p["trace_w"] / 2.0,
                    coupled_y + p["trace_w"] / 2.0, p["copper_t"])

        phase_start_y = coupled_y + p["trace_w"] / 2.0
        phase_end_y = patch_y0
        trim = variant["branch_trim"]
        if trim == 0.0:
            branch_centerline = [(0.0, phase_start_y), (0.0, notch_y1 + 0.2)]
        else:
            rise = phase_end_y - phase_start_y
            half_length = (abs(rise) + trim) / 2.0
            half_rise = abs(rise) / 2.0
            peak_x = math.sqrt(max(0.0, half_length**2 - half_rise**2))
            mid_y = (phase_start_y + phase_end_y) / 2.0
            branch_centerline = [
                (0.0, phase_start_y),
                (peak_x, mid_y),
                (0.0, phase_end_y),
                (0.0, notch_y1 + 0.2),
            ]
        add_top_route(top, branch_centerline, p["trace_w"], p["copper_t"])

        # The tscircuit seed reserves an ISO 50 ohm termination here. The
        # current openEMS Python binding discretizes the attempted internal
        # lumped resistor as zero active cells, so this first-pass extraction
        # deliberately leaves the coupled end open instead of inserting an
        # accidental copper short. A validated resistor fixture is a separate
        # follow-up sweep.

        # Patch: upper body and the two lower legs leave the inset notch open.
        add_top_box(top, patch_x0, patch_x1, notch_y1, patch_y1, p["copper_t"])
        add_top_box(top, patch_x0, notch_x0, patch_y0, notch_y1, p["copper_t"])
        add_top_box(top, notch_x1, patch_x1, patch_y0, notch_y1, p["copper_t"])
    else:
        # D terminal phase-route seed from geometry.ts.
        route = [(-35.0, -18.0), (-15.21, -18.0), (0.0, -9.25), (0.0, notch_y1 + 0.2)]
        add_top_route(top, route, p["trace_w"], p["copper_t"])
        add_top_box(top, patch_x0, patch_x1, notch_y1, patch_y1, p["copper_t"])
        add_top_box(top, patch_x0, notch_x0, patch_y0, notch_y1, p["copper_t"])
        add_top_box(top, notch_x1, patch_x1, patch_y0, notch_y1, p["copper_t"])

    # Return-via pairs at the magnetic RF contacts. They represent the ground
    # pads/vias in the tscircuit seed without modelling the magnetic connector.
    for x in (-p["rf_contact_x"], p["rf_contact_x"]):
        if board == "D" and x > 0:
            continue
        for dx in (-0.8, 0.8):
            add_via(top, x + dx, -13.7, gnd_z, p["copper_t"], radius=0.15)

    # Mesh lines follow every important board/metal edge. The smoothing pass
    # fills the rest of the box at approximately 1.5 mm resolution.
    x_lines = [-35, -25, 25, 35, -22.5, 22.5, -17, -17.25, -16.75, 0, 17,
               patch_x0, patch_x1, notch_x0, notch_x1]
    y_lines = [-50, -35, 35, 40, -18 - p["trace_w"] / 2.0, -18 + p["trace_w"] / 2.0,
               patch_y0, notch_y1, patch_y1, -13.7]
    if board != "D":
        coupled_y = p["trace_y"] + p["trace_w"] + variant["coupling_gap"]
        y_lines.extend([coupled_y - p["trace_w"] / 2.0, coupled_y + p["trace_w"] / 2.0,
                        coupled_y + p["trace_w"] / 2.0 + variant["branch_trim"]])
    z_lines = [-22, rear_pp_z, gnd_z, -p["fr4_t"], 0.0, p["copper_t"],
               front_pp_z + p["front_pp_t"], 16]
    return dict(gnd_z=gnd_z, gnd_surface_z=gnd_surface_z, top_z=p["copper_t"], x_lines=x_lines,
                y_lines=y_lines, z_lines=z_lines, patch_y0=patch_y0)


def build_sim(board: str, sim_path: Path, coarse: bool = False):
    p = PCB
    f0 = 2.45e9
    fc = 0.55e9
    # A 2.0--3.0 GHz FFT needs several ns of time record. The previous
    # short smoke setting was useful for checking the mesh but truncates the
    # Gaussian pulse before the spectrum is settled.
    FDTD = openEMS(NrTS=180000 if not coarse else 120000, EndCriteria=1e-4)
    FDTD.SetGaussExcite(f0, fc)
    FDTD.SetBoundaryCond(["PML_8"] * 6)
    CSX = ContinuousStructure()
    FDTD.SetCSX(CSX)
    mesh = CSX.GetGrid()
    mesh.SetDeltaUnit(1e-3)
    geom = add_board_geometry(CSX, FDTD, board)
    for axis, values in zip(("x", "y", "z"),
                            (geom["x_lines"], geom["y_lines"], geom["z_lines"])):
        mesh.AddLine(axis, smooth_mesh_lines(values, 1.5))
    mesh_res = 2.0 if coarse else 1.5
    mesh.SmoothMeshLines("all", mesh_res, 1.4)

    # Add a little extra grid refinement around the two coupled lines and the
    # patch inset. This preserves the 0.30 mm C-board starting gap.
    mesh.AddLine("x", [-17.0, 0.0, 17.0])
    mesh.AddLine("y", [-19.45, -16.55, -15.0, -13.0, -9.25, 1.25])

    metal = CSX.GetPropertiesByName("cu_top")[0]
    top_z = geom["top_z"]
    gnd_z = geom["gnd_surface_z"]
    trace_w = p["trace_w"]
    trace_y = p["trace_y"]

    ports = []
    if board != "D":
        ports.append(FDTD.AddMSLPort(
            1, metal, [-35.0, trace_y - trace_w / 2, top_z],
            [0.0, trace_y + trace_w / 2, gnd_z], "x", "z",
            excite=1, priority=40, MeasPlaneShift=10.0,
            edges2grid="xyz"))
        ports.append(FDTD.AddMSLPort(
            2, metal, [35.0, trace_y - trace_w / 2, top_z],
            [0.0, trace_y + trace_w / 2, gnd_z], "x", "z",
            excite=0, priority=40, MeasPlaneShift=10.0,
            edges2grid="xyz"))
        # Patch-feed reference port along the inset direction. The open port
        # is used as an observation plane; it does not add a zero-cell RLC.
        ports.append(FDTD.AddMSLPort(
            3, metal, [-trace_w / 2, geom["patch_y0"], top_z],
            [trace_w / 2, geom["patch_y0"] + 1.0, gnd_z], "y", "z",
            excite=0, priority=40, MeasPlaneShift=0.0,
            edges2grid="xyz"))
    else:
        ports.append(FDTD.AddMSLPort(
            1, metal, [-35.0, trace_y - trace_w / 2, top_z],
            [-34.0, trace_y + trace_w / 2, gnd_z], "x", "z",
            excite=1, priority=40, MeasPlaneShift=12.5,
            edges2grid="xyz"))
        ports.append(FDTD.AddMSLPort(
            2, metal, [-trace_w / 2, geom["patch_y0"], top_z],
            [trace_w / 2, geom["patch_y0"] + 1.0, gnd_z], "y", "z",
            excite=0, priority=40, MeasPlaneShift=0.0,
            edges2grid="xyz"))

    sim_path.mkdir(parents=True, exist_ok=True)
    CSX.Write2XML(str(sim_path / f"board_{board}.xml"))
    return FDTD, ports, np.linspace(2.0e9, 3.0e9, 401)


def run_one(board: str, out_dir: Path, coarse: bool = False, post_only: bool = False):
    out_dir = out_dir.resolve()
    sim_path = (out_dir / f"board_{board}").resolve()
    if sim_path.exists() and not post_only:
        shutil.rmtree(sim_path)
    FDTD, ports, freq = build_sim(board, sim_path, coarse=coarse)
    if not post_only:
        FDTD.Run(str(sim_path), cleanup=False, verbose=1)

    for port in ports:
        port.CalcPort(str(sim_path), freq, ref_impedance=50.0)
    inc = ports[0].uf_inc
    s11 = ports[0].uf_ref / inc
    if board != "D":
        s21 = ports[1].uf_ref / inc
        s31 = ports[2].uf_ref / inc
        s = {"S11": s11, "S21": s21, "S31_patch": s31}
    else:
        s = {"S11": s11, "S21_patch": ports[1].uf_ref / inc}

    data = {"board": board, "frequency_hz": freq.tolist(), "parameters": {
        "f0_hz": 2.45e9, "sweep_hz": [2.0e9, 3.0e9], "ref_impedance_ohm": 50.0,
        "coarse": coarse, "topology": "edge-coupled-quarter-wave" if board != "D" else "terminal",
        "target_coupling_db": VARIANTS[board]["coupling_db"],
    }}
    for name, values in s.items():
        data[name] = {"real": np.real(values).tolist(), "imag": np.imag(values).tolist(),
                      "magnitude_db": (20.0 * np.log10(np.maximum(np.abs(values), 1e-15))).tolist()}
    with (out_dir / f"board_{board}.json").open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)

    fig, ax = plt.subplots(figsize=(8.0, 4.8), constrained_layout=True)
    for name, values in s.items():
        ax.plot(freq / 1e9, data[name]["magnitude_db"], label=name)
    ax.axvline(2.45, color="0.55", linewidth=0.8, linestyle="--")
    ax.set(xlabel="Frequency (GHz)", ylabel="Magnitude (dB)", title=f"openEMS board {board}")
    ax.grid(True, alpha=0.3)
    ax.legend()
    fig.savefig(out_dir / f"board_{board}_sparameters.png", dpi=160)
    plt.close(fig)

    i0 = int(np.argmin(np.abs(freq - 2.45e9)))
    summary = {"board": board, "f_ghz": 2.45,
               "S11_db": float(data["S11"]["magnitude_db"][i0])}
    for name in s:
        if name != "S11":
            summary[f"{name}_db"] = float(data[name]["magnitude_db"][i0])
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--board", choices=["A", "B", "C", "D", "all"], default="all")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--coarse", action="store_true", help="use a faster first-pass mesh")
    parser.add_argument("--post-only", action="store_true", help="post-process existing openEMS runs")
    args = parser.parse_args()
    args.out = args.out.resolve()
    args.out.mkdir(parents=True, exist_ok=True)
    boards = ["A", "B", "C", "D"] if args.board == "all" else [args.board]
    summaries = []
    for board in boards:
        print(f"=== board {board} ===", flush=True)
        summaries.append(run_one(board, args.out, coarse=args.coarse, post_only=args.post_only))
        print(json.dumps(summaries[-1], ensure_ascii=False), flush=True)
    with (args.out / "summary.json").open("w", encoding="utf-8") as fh:
        json.dump(summaries, fh, indent=2)


if __name__ == "__main__":
    main()
