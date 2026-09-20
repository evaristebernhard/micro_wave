# micro_wave tscircuit PCB

Current product/mechanical target: **50 × 60 mm**.

The old 50 × 70 mm centered-outline workaround is historical. Current calibration and full V2 boards use `boardAnchorPosition` and are true 50 × 60 mm boards.

## Current boards

### RF calibration board

Entry: `index-tcal.tsx`

Purpose: isolate the T-cell + Patch RF core. It intentionally omits the low-frequency ID chain.

### Full engineering board V2

Entry: `index-full-v2.tsx`

This is the current complete single-board engineering candidate:

- 50 × 60 mm board;
- RF IN / RF OUT magnetic signal pads;
- GND contact pads and return vias;
- bottom copper ground plane;
- surrogate-calibrated V2 T-cell;
- inset-fed 37.5 × 28.5 mm Patch;
- 10 kΩ / 0603 identification resistor;
- ID IN / ID OUT;
- silkscreen and fabrication dimensions;
- exposed RF top copper for consistency with the PP-loaded EM stack;
- tapered pad transitions and an octagonal T-junction instead of the V1 square hard node.

The full V2 board imports `design/tcell_candidate_v2.json`. It is a **screen candidate**, not a manufacturing freeze.

## V2 RF geometry

At 2.45 GHz:

| parameter | value |
|---|---:|
| 50 Ω through width candidate | 2.670 mm |
| series transformer | 42.11 Ω / 3.557 mm |
| branch transformer | 78.10 Ω / 1.073 mm |
| series quarter-wave seed | 15.317 mm |
| branch quarter-wave seed | 15.972 mm |
| T-junction | (-6.1105, -24.0072) mm |
| Patch | 37.5 × 28.5 mm |
| inset depth | 10.5 mm |

These values come from the current openEMS-calibrated surrogate. They supersede the old bare-FR4 3.137 / 3.92 / 1.04 mm seeds for the V2 candidate only.

## ID line

The full V2 board uses the **customer-requested 10 kΩ** identification resistor.

This low-frequency ID path is physically present on the full board but is not part of the RF extraction equations. Its RF coupling still has to be checked in the full-board EM model.

## Validation

Official tscircuit skill is vendored under:

`.codex/skills/tscircuit/`

Run:

```bash
npm run check:cal
npm run check:full-v2
```

The full V2 check performs:

```text
netlist -> placement -> build -> shorts
```

Exports:

```bash
npm run export:full-v2:circuit-json
npm run export:full-v2:gerbers
npm run export:full-v2:pcb-svg
```

## Important

A clean tscircuit/Gerber result proves PCB geometry consistency, not RF performance.

The next RF gate is:

1. V2 T-cell screen;
2. V2 verify if screen passes;
3. full-board launch + ID + Patch EM;
4. loaded Patch/workpiece;
5. A/B/C/D regeneration;
6. four-board Zone.
