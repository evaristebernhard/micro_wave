#!/usr/bin/env python3
"""Static invariants for the Full Engineering Board V2 EM/PCB shared geometry."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RF_PATH = ROOT / "design" / "tcell_candidate_v2.json"
FULL_PATH = (
    ROOT / "pcb" / "tscircuit" / "src" / "full-engineering-board-v2-geometry.json"
)


def fail(msg: str) -> None:
    raise SystemExit(msg)


def main() -> None:
    rf = json.loads(RF_PATH.read_text(encoding="utf-8"))
    full = json.loads(FULL_PATH.read_text(encoding="utf-8"))

    if full["schema"] != "micro-wave/full-engineering-board-v2/v1":
        fail(f"unexpected full-board schema: {full['schema']!r}")

    board = rf["board"]
    launch = rf["launch"]
    idg = full["id"]

    x_min = board["center"]["x"] - board["widthMm"] / 2
    x_max = board["center"]["x"] + board["widthMm"] / 2
    y_min = board["center"]["y"] - board["heightMm"] / 2
    y_max = board["center"]["y"] + board["heightMm"] / 2

    if abs(board["widthMm"] - 50.0) > 1e-9 or abs(board["heightMm"] - 60.0) > 1e-9:
        fail("Full V2 must remain a true 50 x 60 mm product board")
    if abs(y_min + 35.0) > 1e-9 or abs(y_max - 25.0) > 1e-9:
        fail(f"unexpected board Y bounds: [{y_min}, {y_max}]")

    signal_low = launch["signalPadCenterYMm"] - launch["signalPadHeightMm"] / 2
    ground_high = launch["groundPadCenterYMm"] + launch["groundPadHeightMm"] / 2
    coplanar_gap = signal_low - ground_high
    if coplanar_gap <= 0:
        fail(f"signal/GND magnetic pads overlap: gap={coplanar_gap} mm")

    pad_outer = idg["padXAbsMm"] + idg["padWidthMm"] / 2
    if pad_outer > x_max:
        fail(f"ID pad exceeds board edge: x={pad_outer} > {x_max}")
    if not (y_min <= idg["yMm"] <= y_max):
        fail(f"ID chain Y={idg['yMm']} lies outside board [{y_min}, {y_max}]")
    if idg["emGapHalfLengthMm"] <= 0:
        fail("ID EM resistor gap must be positive")

    junction = rf["tcell"]["junction"]
    if not (x_min <= junction["x"] <= x_max and y_min <= junction["y"] <= y_max):
        fail(f"T-junction lies outside board: {junction}")

    if full["junction"]["diameterMm"] <= 0:
        fail("junction diameter must be positive")
    if full["branchToFeed"]["taperLengthMm"] <= 0:
        fail("branch/feed taper length must be positive")
    if full["padTransition"]["lengthMm"] <= 0:
        fail("pad transition length must be positive")

    summary = {
        "rf_geometry": str(RF_PATH.relative_to(ROOT)),
        "full_geometry": str(FULL_PATH.relative_to(ROOT)),
        "board_bounds_mm": [x_min, x_max, y_min, y_max],
        "magnetic_signal_ground_gap_mm": coplanar_gap,
        "id_y_mm": idg["yMm"],
        "id_resistor_ohm": idg["resistorOhm"],
        "junction": junction,
        "status": "ok",
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
