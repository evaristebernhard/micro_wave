#!/usr/bin/env python3
"""Static invariants for flat bridge, corner bridge and cable magnetic tab."""

from __future__ import annotations

import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
PATH=ROOT/"pcb"/"tscircuit"/"src"/"connection-hardware-geometry.json"


def main():
    g=json.loads(PATH.read_text(encoding="utf-8"))
    if g["schema"]!="micro-wave/connection-hardware/v1":
        raise SystemExit("unexpected schema")
    rf=g["rf"]; itf=g["interface"]; flat=g["flatBridge"]; corner=g["cornerBridge"]; tab=g["cableTab"]

    if abs(flat["boardWidthMm"]-100)>1e-9 or abs(flat["boardHeightMm"]-50)>1e-9:
        raise SystemExit("flat bridge must remain 100 x 50 mm")
    if abs(corner["legLengthMm"]-50)>1e-9 or abs(corner["legWidthMm"]-30)>1e-9:
        raise SystemExit("corner bridge must remain 5+5 cm class with 30 mm arm width")
    if abs(tab["boardWidthMm"]-30)>1e-9 or abs(tab["boardHeightMm"]-50)>1e-9:
        raise SystemExit("cable tab must remain 30 x 50 mm")
    if abs(rf["idTraceWidthMm"]-0.30)>1e-9:
        raise SystemExit("ID trace width must remain 0.30 mm")
    if rf["calibratedTraceWidthMm"] <= 0:
        raise SystemExit("RF trace width must be positive")
    signal_low=itf["signalYmm"]-itf["signalPadHeightMm"]/2
    gnd_high=itf["groundYmm"]+itf["groundPadHeightMm"]/2
    if signal_low <= gnd_high:
        raise SystemExit("signal and GND interface pads overlap")
    print(json.dumps({
        "geometry":str(PATH.relative_to(ROOT)),
        "flat_mm":[flat["boardWidthMm"],flat["boardHeightMm"]],
        "corner_leg_mm":[corner["legLengthMm"],corner["legWidthMm"]],
        "cable_tab_mm":[tab["boardWidthMm"],tab["boardHeightMm"]],
        "rf_trace_width_mm":rf["calibratedTraceWidthMm"],
        "id_trace_width_mm":rf["idTraceWidthMm"],
        "interface_signal_ground_gap_mm":signal_low-gnd_high,
        "status":"ok"
    },indent=2))


if __name__=="__main__":
    main()
