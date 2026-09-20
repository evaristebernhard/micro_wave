#!/usr/bin/env python3
"""Compare Full V2 ID sensitivity from already-computed summary files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def delta(a: dict, b: dict, key: str) -> float:
    return float(b[key]) - float(a[key])


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--off", type=Path, required=True)
    p.add_argument("--open", dest="open_", type=Path, required=True)
    p.add_argument("--tenk", type=Path, default=None)
    args = p.parse_args()

    off = load(args.off)
    opn = load(args.open_)

    out = {
        "id_copper_effect_open_minus_off": {
            "delta_S11_db": delta(off, opn, "S11_db"),
            "delta_S21_db": delta(off, opn, "S21_db"),
            "delta_VSWR": delta(off, opn, "VSWR"),
            "delta_non_through_fraction": delta(
                off, opn, "non_through_accepted_fraction"
            ),
            "delta_bandwidth_mhz": delta(
                off, opn, "vswr_le_2_bandwidth_mhz"
            ),
        }
    }

    if args.tenk is not None:
        tenk = load(args.tenk)
        out["resistor_effect_10k_minus_open"] = {
            "delta_S11_db": delta(opn, tenk, "S11_db"),
            "delta_S21_db": delta(opn, tenk, "S21_db"),
            "delta_VSWR": delta(opn, tenk, "VSWR"),
            "delta_non_through_fraction": delta(
                opn, tenk, "non_through_accepted_fraction"
            ),
            "delta_bandwidth_mhz": delta(
                opn, tenk, "vswr_le_2_bandwidth_mhz"
            ),
        }

    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
