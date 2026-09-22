# Final simulation report structure V1

## 1. Project scope

2.45 GHz magnetic microwave-heating board and connection hardware:
Full Engineering Board V2, flat bridge, corner bridge, coax magnetic tab, cable, and 5/25/100-board network.

## 2. Main board

Record:

- mechanical dimensions;
- stackup;
- RF/ID interface;
- T-cell/Patch geometry;
- tscircuit DRC/build status;
- converged openEMS S11/S21/VSWR;
- non-through accepted-power proxy;
- limitations before loaded-workpiece validation.

## 3. Flat bridge

Report:

- 100 × 50 mm PCB;
- 2.670 mm RF seed and 0.30 mm ID line;
- S11/S21 across 2.40–2.50 GHz;
- 2.45 GHz insertion loss;
- pass/fail against 0.2 dB target.

## 4. Corner bridge

Report:

- 5 cm + 5 cm planar-L geometry;
- mitered 90° transition;
- S11/S21 across 2.40–2.50 GHz;
- 2.45 GHz insertion loss;
- pass/fail against 0.3 dB target.

If the customer requires two orthogonal PCB planes rather than a planar-L PCB, explicitly mark the present corner bridge as a manufacturing variant and add the 3D assembly model.

## 5. Cable and magnetic tab

Report:

- 30 × 50 mm adapter PCB;
- tab S11/S21;
- cable-only attenuation;
- connector + tab estimate;
- RG142 feasibility.

The original 5 m / 0.5 dB RG142 statement must not be marked Pass unless measured data contradict the published cable attenuation.

## 6. 5 / 25 / 100 power distribution

For each case report:

- number of local zones;
- source power;
- Pmin/Pavg/Pmax;
- maximum deviation;
- 5–8 W status;
- ±25% status;
- 500 W source-limit status.

Use final bridge/cable/full-board losses in the network calculator before freezing this section.

## 7. Requirement compliance matrix

| Requirement | Result | Status | Evidence |
| --- | ---: | --- | --- |
| Main board VSWR ≤2 | TBD | Pending | Full V2 converged EM |
| Main board 5–8 W | TBD | Pending | loaded-workpiece/network model |
| 5-board ±25% | TBD | Pending | network model |
| 25-board ±25% | TBD | Pending | network model |
| 100-board ±25% | TBD | Conditional | source-power feasibility |
| Flat bridge IL ≤0.2 dB | TBD | Pending | flat bridge EM |
| Corner bridge IL ≤0.3 dB | TBD | Pending | corner bridge EM |
| RG142 5 m IL ≤0.5 dB | ~3.54 dB cable-only estimate | Fail as written | Belden RG142 datasheet audit |

## 8. Fabrication package

Attach:

- Full V2 Gerber / circuit JSON / PCB-SVG;
- flat bridge Gerber / PCB-SVG;
- corner bridge Gerber / PCB-SVG;
- cable tab Gerber / PCB-SVG;
- STEP/DXF generated from final Gerbers/KiCad conversion;
- parameter tables;
- raw simulation summaries.
