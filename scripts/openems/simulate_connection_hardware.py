#!/usr/bin/env python3
"""Fast openEMS models for the connection hardware.

DUTs:
- flat: 100 x 50 mm planar bridge
- corner: planar L bridge with 5 cm + 5 cm centerline arms
- tab: 30 x 50 mm coax-to-magnetic adapter PCB

The models share geometry with the tscircuit deliverables and use PEC-sheet
copper for fast screening. They are intended to extract S11/S21/insertion loss
before the final report, not to certify high-power thermal behavior.
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
GEOM_PATH = ROOT / "pcb" / "tscircuit" / "src" / "connection-hardware-geometry.json"
DEFAULT_OUT = ROOT / "results" / "openems_connection_hardware"


def load_geometry() -> dict:
    return json.loads(GEOM_PATH.read_text(encoding="utf-8"))


def profile(name: str) -> dict:
    return {
        "smoke": dict(nr_ts=5000, end=1e-2, xy=1.5, z=0.8, points=21, flo=2.35e9, fhi=2.55e9),
        "fast": dict(nr_ts=26000, end=1e-3, xy=1.0, z=0.6, points=61, flo=2.30e9, fhi=2.60e9),
        "screen": dict(nr_ts=42000, end=2e-4, xy=0.8, z=0.45, points=101, flo=2.25e9, fhi=2.65e9),
    }[name]


def sheet_box(prop, x0, x1, y0, y1, z, priority=20):
    prop.AddBox(
        start=[min(x0, x1), min(y0, y1), z],
        stop=[max(x0, x1), max(y0, y1), z],
        priority=priority,
    )


def add_box(prop, x0, x1, y0, y1, z0, z1, priority=1):
    prop.AddBox(
        start=[min(x0, x1), min(y0, y1), min(z0, z1)],
        stop=[max(x0, x1), max(y0, y1), max(z0, z1)],
        priority=priority,
    )


def line_polygon(points, width):
    half = width / 2
    normals = []
    for p, q in zip(points[:-1], points[1:]):
        dx, dy = q[0] - p[0], q[1] - p[1]
        ln = math.hypot(dx, dy)
        normals.append((-dy / ln, dx / ln))

    def off(i, side):
        x, y = points[i]
        if i == 0:
            nx, ny = normals[0]
            return (x + side * half * nx, y + side * half * ny)
        if i == len(points) - 1:
            nx, ny = normals[-1]
            return (x + side * half * nx, y + side * half * ny)
        n0, n1 = normals[i - 1], normals[i]
        sx, sy = n0[0] + n1[0], n0[1] + n1[1]
        sl = math.hypot(sx, sy)
        mx, my = sx / sl, sy / sl
        den = max(abs(mx * n0[0] + my * n0[1]), 0.25)
        return (x + side * half * mx / den, y + side * half * my / den)

    left = [off(i, 1) for i in range(len(points))]
    right = [off(i, -1) for i in reversed(range(len(points)))]
    return left + right


def add_polygon(prop, pts, z=0.0, priority=20):
    px = np.asarray([p[0] for p in pts], dtype=float)
    py = np.asarray([p[1] for p in pts], dtype=float)
    prop.AddPolygon(points=[px, py], norm_dir=2, elevation=z, priority=priority)
    return np.column_stack([px, py])


def add_vias(ground, xs, y, radius, z0, z1):
    for x in xs:
        ground.AddCylinder(
            start=[x, y, min(z0, z1)],
            stop=[x, y, max(z0, z1)],
            radius=radius,
            priority=30,
        )


def build_common(g, cfg):
    f0 = g["frequencyGHz"] * 1e9
    stack = g["stackup"]
    FDTD = openEMS(NrTS=cfg["nr_ts"], EndCriteria=cfg["end"])
    FDTD.SetGaussExcite(f0, 0.30e9)
    FDTD.SetBoundaryCond(["PML_8"] * 6)
    CSX = ContinuousStructure()
    FDTD.SetCSX(CSX)
    mesh = CSX.GetGrid()
    mesh.SetDeltaUnit(1e-3)

    fr4_k = 2 * math.pi * f0 * EPS0 * stack["fr4EpsilonR"] * stack["fr4LossTangent"]
    pp_k = 2 * math.pi * f0 * EPS0 * stack["ppEpsilonR"] * stack["ppLossTangent"]

    fr4 = CSX.AddMaterial("FR4", epsilon=stack["fr4EpsilonR"], kappa=fr4_k)
    pp = CSX.AddMaterial("PP", epsilon=stack["ppEpsilonR"], kappa=pp_k)
    rf = CSX.AddMetal("RF_TOP")
    ground = CSX.AddMetal("GROUND")
    idm = CSX.AddMetal("ID_TOP")
    return FDTD, CSX, mesh, fr4, pp, rf, ground, idm


def coplanar_port(FDTD, nr, sx, sy_signal, sy_ground, z, excite, half_x=0.8):
    sig_edge = sy_signal - 2.0
    gnd_edge = sy_ground + 1.2
    return FDTD.AddLumpedPort(
        port_nr=nr,
        R=50.0,
        start=[sx - half_x, gnd_edge, z - 0.10],
        stop=[sx + half_x, sig_edge, z + 0.10],
        p_dir="y",
        excite=excite,
        priority=50,
        edges2grid="xy",
    )


def build_flat(sim_path: Path, g: dict, cfg: dict):
    FDTD, CSX, mesh, fr4, pp, rf, ground, idm = build_common(g, cfg)
    s = g["stackup"]
    itf = g["interface"]
    hw = g["flatBridge"]
    rfg = g["rf"]
    z0, zg = 0.0, -s["fr4ThicknessMm"]
    xmin, xmax = -hw["boardWidthMm"]/2, hw["boardWidthMm"]/2
    ymin, ymax = -hw["boardHeightMm"]/2, hw["boardHeightMm"]/2
    xpad = hw["contactXAbsMm"]

    add_box(fr4, xmin, xmax, ymin, ymax, zg, z0)
    add_box(pp, xmin, xmax, ymin, ymax, z0, s["frontPpThicknessMm"])
    sheet_box(ground, xmin+0.2, xmax-0.2, ymin+0.2, ymax-0.2, zg)

    # RF and ID copper.
    sheet_box(rf, -xpad, xpad, -rfg["calibratedTraceWidthMm"]/2, rfg["calibratedTraceWidthMm"]/2, z0)
    sheet_box(rf, -xpad-itf["signalPadWidthMm"]/2, -xpad+itf["signalPadWidthMm"]/2,
              -itf["signalPadHeightMm"]/2, itf["signalPadHeightMm"]/2, z0)
    sheet_box(rf, xpad-itf["signalPadWidthMm"]/2, xpad+itf["signalPadWidthMm"]/2,
              -itf["signalPadHeightMm"]/2, itf["signalPadHeightMm"]/2, z0)

    sheet_box(idm, -xpad, xpad, itf["idYmm"]-rfg["idTraceWidthMm"]/2, itf["idYmm"]+rfg["idTraceWidthMm"]/2, z0)

    # Top GND pads + vias.
    for sx in (-xpad, xpad):
        sheet_box(ground, sx-itf["groundPadWidthMm"]/2, sx+itf["groundPadWidthMm"]/2,
                  itf["groundYmm"]-itf["groundPadHeightMm"]/2, itf["groundYmm"]+itf["groundPadHeightMm"]/2, z0, 25)
        add_vias(ground, [sx+dx for dx in itf["viaXOffsetsMm"]], itf["groundYmm"],
                 itf["viaOuterDiameterMm"]/2, zg, z0)

    domain=[xmin-8,xmax+8,ymin-8,ymax+8,zg-5,s["frontPpThicknessMm"]+8]
    xlines=[domain[0],xmin,-xpad,0,xpad,xmax,domain[1]]
    ylines=[domain[2],ymin,itf["idYmm"],itf["groundYmm"],0,ymax,domain[3]]
    zlines=[domain[4],zg,-s["fr4ThicknessMm"]/2,0,s["frontPpThicknessMm"],domain[5]]
    mesh.AddLine("x", xlines); mesh.AddLine("y", ylines); mesh.AddLine("z", zlines)
    mesh.SmoothMeshLines("x", cfg["xy"], 1.4)
    mesh.SmoothMeshLines("y", cfg["xy"], 1.4)
    mesh.SmoothMeshLines("z", cfg["z"], 1.4)

    ports=[
        coplanar_port(FDTD,1,-xpad,0,itf["groundYmm"],z0,1),
        coplanar_port(FDTD,2,xpad,0,itf["groundYmm"],z0,0),
    ]
    CSX.Write2XML(str(sim_path/"flat.xml"))
    return FDTD, ports, dict(target_il_db=hw["targetInsertionLossDb"], length_mm=hw["boardWidthMm"])


def build_corner(sim_path: Path, g: dict, cfg: dict):
    FDTD, CSX, mesh, fr4, pp, rf, ground, idm = build_common(g, cfg)
    s=g["stackup"]; itf=g["interface"]; rfg=g["rf"]; hw=g["cornerBridge"]
    z0, zg = 0.0, -s["fr4ThicknessMm"]
    # L board = horizontal [-50,15]x[-15,15] + vertical [-15,15]x[-15,50]
    add_box(fr4,-50,15,-15,15,zg,z0); add_box(fr4,-15,15,-15,50,zg,z0)
    add_box(pp,-50,15,-15,15,z0,s["frontPpThicknessMm"]); add_box(pp,-15,15,-15,50,z0,s["frontPpThicknessMm"])
    sheet_box(ground,-49.8,14.8,-14.8,14.8,zg); sheet_box(ground,-14.8,14.8,-14.8,49.8,zg)

    rf_pts=[(-47.5,0),(-6,0),(0,6),(0,47.5)]
    id_pts=[(-47.5,-10.5),(-10.5,-10.5),(-10.5,47.5)]
    add_polygon(rf,line_polygon(rf_pts,rfg["calibratedTraceWidthMm"]),z0)
    add_polygon(idm,line_polygon(id_pts,rfg["idTraceWidthMm"]),z0)

    # interface pads
    sheet_box(rf,-47.5-itf["signalPadWidthMm"]/2,-47.5+itf["signalPadWidthMm"]/2,
              -itf["signalPadHeightMm"]/2,itf["signalPadHeightMm"]/2,z0)
    sheet_box(rf,-itf["signalPadHeightMm"]/2,itf["signalPadHeightMm"]/2,
              47.5-itf["signalPadWidthMm"]/2,47.5+itf["signalPadWidthMm"]/2,z0)

    # left ground
    sheet_box(ground,-47.5-itf["groundPadWidthMm"]/2,-47.5+itf["groundPadWidthMm"]/2,
              -6-itf["groundPadHeightMm"]/2,-6+itf["groundPadHeightMm"]/2,z0,25)
    add_vias(ground,[-47.5+dx for dx in itf["viaXOffsetsMm"]],-6,itf["viaOuterDiameterMm"]/2,zg,z0)
    # top ground, rotated
    sheet_box(ground,-6-itf["groundPadHeightMm"]/2,-6+itf["groundPadHeightMm"]/2,
              47.5-itf["groundPadWidthMm"]/2,47.5+itf["groundPadWidthMm"]/2,z0,25)
    for dy in itf["viaXOffsetsMm"]:
        ground.AddCylinder(start=[-6,47.5+dy,zg],stop=[-6,47.5+dy,z0],
                           radius=itf["viaOuterDiameterMm"]/2,priority=30)

    domain=[-58,23,-23,58,zg-5,s["frontPpThicknessMm"]+8]
    xlines=[domain[0],-50,-47.5,-15,-10.5,-6,0,15,domain[1]]
    ylines=[domain[2],-15,-10.5,-6,0,15,47.5,50,domain[3]]
    zlines=[domain[4],zg,-s["fr4ThicknessMm"]/2,0,s["frontPpThicknessMm"],domain[5]]
    mesh.AddLine("x",xlines);mesh.AddLine("y",ylines);mesh.AddLine("z",zlines)
    mesh.SmoothMeshLines("x",cfg["xy"],1.4);mesh.SmoothMeshLines("y",cfg["xy"],1.4);mesh.SmoothMeshLines("z",cfg["z"],1.4)

    p1=coplanar_port(FDTD,1,-47.5,0,-6,z0,1)
    # top port bridges signal at x=0 to ground at x=-6, so direction is x.
    p2=FDTD.AddLumpedPort(
        port_nr=2,R=50.0,
        start=[-4.8,47.5,-0.10],
        stop=[-2.0,47.5,0.10],
        p_dir="x",excite=0,priority=50,edges2grid="xy"
    )
    CSX.Write2XML(str(sim_path/"corner.xml"))
    return FDTD,[p1,p2],dict(target_il_db=hw["targetInsertionLossDb"], path_length_mm=100.0)


def build_tab(sim_path: Path, g: dict, cfg: dict):
    FDTD, CSX, mesh, fr4, pp, rf, ground, idm = build_common(g,cfg)
    s=g["stackup"]; itf=g["interface"]; rfg=g["rf"]; hw=g["cableTab"]
    z0,zg=0.0,-s["fr4ThicknessMm"]
    W,H=hw["boardWidthMm"],hw["boardHeightMm"]
    xmin,xmax=-W/2,W/2; ymin,ymax=-H/2,H/2
    ymag,ycoax=hw["contactEdgeYmm"],hw["coaxEdgeYmm"]

    add_box(fr4,xmin,xmax,ymin,ymax,zg,z0);add_box(pp,xmin,xmax,ymin,ymax,z0,s["frontPpThicknessMm"])
    sheet_box(ground,xmin+0.2,xmax-0.2,ymin+0.2,ymax-0.2,zg)
    sheet_box(rf,-rfg["calibratedTraceWidthMm"]/2,rfg["calibratedTraceWidthMm"]/2,ymag,ycoax,z0)
    sheet_box(idm,6-rfg["idTraceWidthMm"]/2,6+rfg["idTraceWidthMm"]/2,ymag,ycoax,z0)
    # magnetic and coax signal pads
    sheet_box(rf,-itf["signalPadWidthMm"]/2,itf["signalPadWidthMm"]/2,
              ymag-itf["signalPadHeightMm"]/2,ymag+itf["signalPadHeightMm"]/2,z0)
    sheet_box(rf,-2.3,2.3,ycoax-2,ycoax+2,z0)
    # ground pads
    sheet_box(ground,-6-itf["groundPadWidthMm"]/2,-6+itf["groundPadWidthMm"]/2,
              ymag-itf["groundPadHeightMm"]/2,ymag+itf["groundPadHeightMm"]/2,z0,25)
    sheet_box(ground,-9.0,-4.0,ycoax-2,ycoax+2,z0,25)
    sheet_box(ground,4.0,9.0,ycoax-2,ycoax+2,z0,25)
    for x in [-7.0,-6.2,-5.4,5.4,6.2,7.0]:
        ground.AddCylinder(start=[x,ycoax-2.5,zg],stop=[x,ycoax-2.5,z0],
                           radius=itf["viaOuterDiameterMm"]/2,priority=30)

    domain=[xmin-8,xmax+8,ymin-8,ymax+8,zg-5,s["frontPpThicknessMm"]+8]
    xlines=[domain[0],xmin,-6,0,6,xmax,domain[1]]
    ylines=[domain[2],ymin,ymag,0,ycoax,ymax,domain[3]]
    zlines=[domain[4],zg,-s["fr4ThicknessMm"]/2,0,s["frontPpThicknessMm"],domain[5]]
    mesh.AddLine("x",xlines);mesh.AddLine("y",ylines);mesh.AddLine("z",zlines)
    mesh.SmoothMeshLines("x",cfg["xy"],1.4);mesh.SmoothMeshLines("y",cfg["xy"],1.4);mesh.SmoothMeshLines("z",cfg["z"],1.4)

    # magnetic port at bottom and coax fixture port at top
    # Both magnetic and coax fixtures bridge the signal conductor to a
    # neighboring top-ground pad in the same plane.
    p1=FDTD.AddLumpedPort(
        port_nr=1,R=50.0,
        start=[-3.7,ymag-0.8,-0.1],
        stop=[-2.3,ymag+0.8,0.1],
        p_dir="x",excite=1,priority=50,edges2grid="xy"
    )
    p2=FDTD.AddLumpedPort(
        port_nr=2,R=50.0,
        start=[-4.0,ycoax-0.8,-0.1],
        stop=[-2.3,ycoax+0.8,0.1],
        p_dir="x",excite=0,priority=50,edges2grid="xy"
    )
    CSX.Write2XML(str(sim_path/"tab.xml"))
    return FDTD,[p1,p2],dict(target_il_db=None, length_mm=H)


def run(args):
    g=load_geometry(); cfg=profile(args.profile)
    sim_path=args.out.resolve()/f"{args.dut}_{args.profile}"
    if sim_path.exists() and not args.post_only:
        shutil.rmtree(sim_path)
    sim_path.mkdir(parents=True,exist_ok=True)

    if args.dut=="flat":
        FDTD,ports,meta=build_flat(sim_path,g,cfg)
    elif args.dut=="corner":
        FDTD,ports,meta=build_corner(sim_path,g,cfg)
    else:
        FDTD,ports,meta=build_tab(sim_path,g,cfg)

    if args.xml_only:
        print(sim_path)
        return

    if not args.post_only:
        FDTD.Run(str(sim_path),cleanup=False,verbose=1,numThreads=args.threads,disable_dumps=True)

    freq=np.linspace(cfg["flo"],cfg["fhi"],cfg["points"])
    for p in ports:
        p.CalcPort(str(sim_path),freq,ref_impedance=50.0,signal_type="pulse")

    inc=ports[0].uf_inc
    s11=ports[0].uf_ref/inc
    s21=ports[1].uf_ref/inc
    s11db=20*np.log10(np.maximum(np.abs(s11),1e-15))
    s21db=20*np.log10(np.maximum(np.abs(s21),1e-15))
    il=-s21db
    f0=g["frequencyGHz"]*1e9
    i0=int(np.argmin(np.abs(freq-f0)))

    summary={
        "dut":args.dut,
        "profile":args.profile,
        "f_ghz":float(freq[i0]/1e9),
        "S11_db":float(s11db[i0]),
        "S21_db":float(s21db[i0]),
        "insertion_loss_db":float(il[i0]),
        "target_insertion_loss_db":meta.get("target_il_db"),
        "meets_target_at_2p45":(
            None if meta.get("target_il_db") is None
            else bool(il[i0] <= meta["target_il_db"])
        ),
        "model":"fast PEC-sheet screening model",
    }
    result={
        **summary,
        "frequency_hz":freq.tolist(),
        "S11_db_curve":s11db.tolist(),
        "S21_db_curve":s21db.tolist(),
        "S21_phase_deg":np.angle(s21,deg=True).tolist(),
    }
    args.out.mkdir(parents=True,exist_ok=True)
    stem=f"{args.dut}_{args.profile}"
    (args.out/f"{stem}.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    (args.out/f"{stem}_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,indent=2))


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--dut",choices=["flat","corner","tab"],required=True)
    p.add_argument("--profile",choices=["smoke","fast","screen"],default="fast")
    p.add_argument("--out",type=Path,default=DEFAULT_OUT)
    p.add_argument("--threads",type=int,default=4)
    p.add_argument("--post-only",action="store_true")
    p.add_argument("--xml-only",action="store_true")
    run(p.parse_args())


if __name__=="__main__":
    main()
