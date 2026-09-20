#!/usr/bin/env python3
"""Validate the canonical T-cell calibration geometry without openEMS."""

from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GEOM_PATH = ROOT / "pcb" / "tscircuit" / "src" / "tcell-calibration-geometry.json"


def distance(a: dict[str, float], b: dict[str, float]) -> float:
    return math.hypot(b["x"] - a["x"], b["y"] - a["y"])


def require_close(name: str, actual: float, expected: float, tol: float) -> None:
    if abs(actual - expected) > tol:
        raise SystemExit(
            f"{name}: actual={actual:.6f}, expected={expected:.6f}, tol={tol:.6f}"
        )


def main() -> None:
    g = json.loads(GEOM_PATH.read_text(encoding="utf-8"))
    if g["schema"] != "micro-wave/tcell-calibration/v1":
        raise SystemExit(f"unexpected schema: {g['schema']!r}")

    board = g["board"]
    patch = g["patch"]
    tcell = g["tcell"]
    launch = g["launch"]

    x_min = board["center"]["x"] - board["widthMm"] / 2
    x_max = board["center"]["x"] + board["widthMm"] / 2
    y_min = board["center"]["y"] - board["heightMm"] / 2
    y_max = board["center"]["y"] + board["heightMm"] / 2

    require_close("board width", board["widthMm"], 50.0, 1e-9)
    require_close("board height", board["heightMm"], 60.0, 1e-9)
    require_close("board y min", y_min, -35.0, 1e-9)
    require_close("board y max", y_max, 25.0, 1e-9)

    series_len = distance(tcell["inputReference"], tcell["junction"])
    branch_len = distance(tcell["junction"], patch["feedReference"])
    require_close(
        "series transformer physical length",
        series_len,
        tcell["targetSeriesQuarterWaveMm"],
        0.01,
    )
    require_close(
        "branch transformer physical length",
        branch_len,
        tcell["targetBranchQuarterWaveMm"],
        0.01,
    )

    k = tcell["targetExtraction"]
    zt = 50.0 * math.sqrt(1.0 - k)
    zb = 50.0 * math.sqrt((1.0 - k) / k)
    require_close("analytical Zt", zt, tcell["targetSeriesOhm"], 0.02)
    require_close("analytical Zb", zb, tcell["targetBranchOhm"], 0.02)

    pad_inner = launch["contactXAbsMm"] - launch["signalPadWidthMm"] / 2
    require_close(
        "input pad inner edge",
        -pad_inner,
        tcell["inputReference"]["x"],
        1e-9,
    )
    require_close(
        "output pad inner edge",
        pad_inner,
        tcell["outputReference"]["x"],
        1e-9,
    )
    require_close(
        "signal pad center y",
        launch["signalPadCenterYMm"],
        tcell["inputReference"]["y"],
        1e-9,
    )
    require_close(
        "signal/output y symmetry",
        tcell["inputReference"]["y"],
        tcell["outputReference"]["y"],
        1e-9,
    )

    patch_y_min = patch["center"]["y"] - patch["lengthMm"] / 2
    require_close(
        "patch feed reference y",
        patch["feedReference"]["y"],
        patch_y_min,
        1e-9,
    )

    for name, p in {
        "inputReference": tcell["inputReference"],
        "junction": tcell["junction"],
        "outputReference": tcell["outputReference"],
        "patchFeedReference": patch["feedReference"],
    }.items():
        if not (x_min <= p["x"] <= x_max and y_min <= p["y"] <= y_max):
            raise SystemExit(f"{name} lies outside product board bounds: {p}")

    summary = {
        "geometry": str(GEOM_PATH.relative_to(ROOT)),
        "series_length_mm": round(series_len, 6),
        "branch_length_mm": round(branch_len, 6),
        "target_extraction": k,
        "zt_ohm": round(zt, 4),
        "zb_ohm": round(zb, 4),
        "board_bounds_mm": [x_min, x_max, y_min, y_max],
        "status": "ok",
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
