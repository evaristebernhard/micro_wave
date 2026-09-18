# micro_wave tscircuit PCB

This subproject generates the current 50 mm × 50 mm gradient-coupled Patch PCB seeds. It now exports four position classes: A / B / C through boards and the D terminal radiator.

## Requirements

- Node.js 22+
- npm

The project pins `tscircuit@0.0.2571`. The package exposes the `tsci` CLI.

## Install

```bash
cd pcb/tscircuit
npm install
```

## Preview

```bash
npm run dev
```

Open the local tscircuit preview shown by the CLI.

### WSL2 / local proxy

If `tsci dev` fails while polling `/api/events/list` with HTTP 502, a local HTTP proxy (for example Clash) may be intercepting the CLI's own localhost traffic. Use:

```bash
npm run dev:wsl
```

This bypasses proxies for `localhost`, `127.0.0.1`, and `::1` and pins the preview server to port 3020.

You can inspect proxy variables with:

```bash
env | grep -i proxy
```

The npm "new major version available" notice is unrelated to this issue.

## Build Circuit JSON

```bash
npm run build
npm run export:circuit-json
```

## Export Gerbers

```bash
npm run export:gerbers
```

Output:

```text
dist/board-a.gerbers.zip
dist/board-b.gerbers.zip
dist/board-c.gerbers.zip
dist/board-d.gerbers.zip

dist/board-a.circuit.json
dist/board-b.circuit.json
dist/board-c.circuit.json
dist/board-d.circuit.json
```

## Current geometry seed

Common geometry:

- PCB: 50 × 50 mm
- Patch: 37.5 × 28.5 mm
- Patch center: (0, 5 mm)
- RF through-line seed: 2.9 mm wide at y = -18 mm
- Inset depth: 10.5 mm
- Inset side gap: 0.5 mm
- Bottom: nearly full continuous copper ground
- Board-count resistor: 100 Ω / 0603 placement seed

Variant targets:

| Board | RF role | Target coupling | Current geometry seed |
|---|---|---:|---|
| A | through + Patch tap | 6.5 dB (~22.4%) | 17 mm quarter-wave-scale side-coupler, 0.70 mm gap seed |
| B | through + Patch tap | 5.0 dB (~31.6%) | 17 mm quarter-wave-scale side-coupler, 0.45 mm gap seed |
| C | strong tap | 3.0 dB (~50%) | 17 mm strong-coupler seed, 0.30 mm gap seed; hybrid fallback expected |
| D | Zone terminal radiator | no RF OUT | direct terminal feed into the Patch |

A/B/C include an isolated-end 50 Ω termination placement seed. The exact coupling gaps are **not validated RF dimensions**; they are starting points for HFSS/openEMS.

The historical 6 mm / 0.5 mm coupler is retained only in the source as a calibration reference.

All RF dimensions live in `src/geometry.ts`; do not scatter RF dimensions through the JSX.

## Important

This is the PCB geometry seed, not a claim that the board is already electromagnetically optimized.

After Gerber generation, HFSS must add the real material stack and external structures:

- FR4 εr = 4.3, tanδ = 0.02, h = 1.6 mm
- Cu = 35 μm, σ = 5.8e7 S/m, Rz = 5 μm
- front PP = 2 mm
- rear PP = 6 mm
- magnetic interface parasitics
- representative / actual workpiece

The first HFSS pass should determine 50 mm through-line loss and phase before multi-board cascade optimization. After that, solve A/B/C coupling and board return loss as complex S-parameters, then cascade the loaded cells with S/ABCD matrices. C should fall back to a matched 3 dB hybrid/power-divider topology if the simple side-coupled seed cannot reach ~50% extraction with adequate return loss.

## Phase-synthesis design gate

The current A/B/C geometry is a coupling-magnitude seed, not yet a complete complex-taper implementation.

At 2.45 GHz the 50 mm cell has an estimated natural through phase of roughly -265° to -270° (equivalently about +90° to +95° modulo 360°). That value must not be frozen merely because four cells sum to an integer number of turns.

Before adding meanders or phase-shifter geometry:

1. solve the four Patch unit-excitation complex fields with the workpiece present;
2. construct the regional power-deposition matrices Q^(k);
3. compare 0°, +90°, 180°, and -90° progressive-phase modes;
4. optimize the target complex Patch excitation vector u*;
5. only then synthesize branch/through phase using the relation p_(i+1) h_i = (u*_(i+1)/u*_i) p_i.

Design theory: `docs/10_zone_complex_phase_synthesis_v1.md` and `docs/11_qmatrix_phase_dof_design_v1.md`.

Do not add a fixed ~18 mm phase-trim meander yet. That length is only the first-order amount required to move the natural ~265° electrical path toward 360° on the present effective-permittivity estimate, and it would add roughly 0.15 dB/cell of FR4 path loss under the current 0.42 dB/50 mm estimate.