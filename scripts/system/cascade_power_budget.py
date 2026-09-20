#!/usr/bin/env python3
"""5/25/100-board power-budget model for the recommended zoned architecture.

This is deliberately a network/power model, not a 100-board 3D solver.
It computes the source power required to maintain the requested per-board power
range after upstream and zone losses.

The default four-board field-aware power shape is normalized to a 6.5 W mean:
[A,B,C,D] ~= [7.92, 5.08, 5.08, 7.92] W.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path


RELATIVE_ZONE = [1.0, 0.6412, 0.6412, 1.0]


def normalized_profile(n: int, mean_w: float) -> list[float]:
    raw=RELATIVE_ZONE[:n]
    scale=mean_w/(sum(raw)/len(raw))
    return [x*scale for x in raw]


def group_sizes(n: int, zone_size: int=4) -> list[int]:
    full,rem=divmod(n,zone_size)
    out=[zone_size]*full
    if rem:
        out.append(rem)
    return out


def model(n: int, mean_w: float, source_max_w: float,
          upstream_loss_db: float, zone_efficiency: float) -> dict:
    sizes=group_sizes(n)
    zones=[]
    board_powers=[]
    useful=0.0
    rf_into_zones=0.0
    for i,m in enumerate(sizes):
        p=normalized_profile(m,mean_w)
        zone_useful=sum(p)
        zone_input=zone_useful/zone_efficiency
        useful += zone_useful
        rf_into_zones += zone_input
        board_powers.extend(p)
        zones.append({"zone":i+1,"boards":m,"board_target_w":p,
                      "useful_w":zone_useful,"rf_input_w":zone_input})

    source_needed=rf_into_zones*10**(upstream_loss_db/10)
    pmin=min(board_powers)
    pmax=max(board_powers)
    pavg=sum(board_powers)/len(board_powers)
    dev=max(abs(x-pavg) for x in board_powers)/pavg
    return {
        "boards":n,
        "zones":zones,
        "board_power_min_w":pmin,
        "board_power_max_w":pmax,
        "board_power_avg_w":pavg,
        "max_deviation_fraction":dev,
        "within_5_to_8_w":pmin>=5.0 and pmax<=8.0,
        "within_pm25_percent":dev<=0.25,
        "useful_board_power_w":useful,
        "rf_power_into_zones_w":rf_into_zones,
        "upstream_loss_db":upstream_loss_db,
        "zone_efficiency":zone_efficiency,
        "source_power_required_w":source_needed,
        "source_max_w":source_max_w,
        "feasible_under_source_limit":source_needed<=source_max_w,
        "minimum_system_efficiency_for_5w_each":(n*5.0/source_max_w),
    }


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--counts",default="5,25,100")
    p.add_argument("--mean-board-w",type=float,default=6.5)
    p.add_argument("--source-max-w",type=float,default=500.0)
    p.add_argument("--upstream-loss-db",type=float,default=0.8,
                   help="cable + connectors + manifold before local zones")
    p.add_argument("--zone-efficiency",type=float,default=0.80,
                   help="RF-to-board-useful efficiency inside each local zone")
    p.add_argument("--out",type=Path,default=None)
    a=p.parse_args()
    counts=[int(x) for x in a.counts.split(",") if x.strip()]
    result={
        "architecture":"local zones of up to four boards; not one 100-board microstrip chain",
        "assumptions":{
            "mean_board_power_w":a.mean_board_w,
            "source_max_w":a.source_max_w,
            "upstream_loss_db":a.upstream_loss_db,
            "zone_efficiency":a.zone_efficiency,
            "relative_zone_profile":RELATIVE_ZONE,
        },
        "cases":[model(n,a.mean_board_w,a.source_max_w,a.upstream_loss_db,a.zone_efficiency)
                 for n in counts]
    }
    text=json.dumps(result,indent=2)
    print(text)
    if a.out is not None:
        a.out.parent.mkdir(parents=True,exist_ok=True)
        a.out.write_text(text+"\n",encoding="utf-8")


if __name__=="__main__":
    main()
