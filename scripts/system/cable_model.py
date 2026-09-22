#!/usr/bin/env python3
"""RG142 / replacement-cable loss calculator for the 2.45 GHz feed line."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

# Belden 84142 RG-142 nominal attenuation data, dB / 100 ft.
# Datasheet values used here:
# 2 GHz -> 19.3 dB/100ft
# 3 GHz -> 24.3 dB/100ft
# Source: Belden 84142 technical data sheet.
BELDEN_RG142 = {
    2.0: 19.3,
    3.0: 24.3,
}


def interp(x: float, x0: float, y0: float, x1: float, y1: float) -> float:
    return y0 + (x - x0) * (y1 - y0) / (x1 - x0)


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--frequency-ghz",type=float,default=2.45)
    p.add_argument("--length-m",type=float,default=5.0)
    p.add_argument("--target-loss-db",type=float,default=0.5)
    p.add_argument("--custom-db-per-m",type=float,default=None,
                   help="evaluate a replacement cable instead of RG142")
    p.add_argument("--out",type=Path,default=None)
    a=p.parse_args()

    if a.custom_db_per_m is None:
        db100ft=interp(a.frequency_ghz,2.0,BELDEN_RG142[2.0],3.0,BELDEN_RG142[3.0])
        dbpm=db100ft/30.48
        cable="RG142 / Belden 84142 nominal interpolation"
    else:
        dbpm=a.custom_db_per_m
        db100ft=dbpm*30.48
        cable="custom"

    loss=dbpm*a.length_m
    max_dbpm=a.target_loss_db/a.length_m
    result={
        "cable":cable,
        "frequency_ghz":a.frequency_ghz,
        "length_m":a.length_m,
        "attenuation_db_per_100ft":db100ft,
        "attenuation_db_per_m":dbpm,
        "total_insertion_loss_db":loss,
        "requested_total_loss_db":a.target_loss_db,
        "meets_requested_loss":loss<=a.target_loss_db,
        "required_max_attenuation_db_per_m":max_dbpm,
        "note":"Cable-only loss; N connector and magnetic-tab loss must be added separately."
    }
    text=json.dumps(result,indent=2)
    print(text)
    if a.out is not None:
        a.out.parent.mkdir(parents=True,exist_ok=True)
        a.out.write_text(text+"\n",encoding="utf-8")


if __name__=="__main__":
    main()
