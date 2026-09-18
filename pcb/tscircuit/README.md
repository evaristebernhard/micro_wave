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

The first HFSS pass should determine 50 mm through-line loss and phase before multi-board cascade optimization. After that, solve A/B/C coupling and board return loss as complex S-parameters, then cascade the loaded cells with S/ABCD matrices. C should not fall back blindly to a full-size standard branch-line hybrid: the analytical footprint audit shows that topology does not fit the current same-layer 50 × 50 mm Patch layout. If the compact side-coupled seed fails, use a compact quadrature family (miniaturized/loaded coupled-line, process-appropriate Lange/interdigital, multilayer broadside, or an external/SMD hybrid).

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

### Pre-HFSS analytical phase seed

The reduced-order transmission-line model gives a natural 50 mm cell progression of about +94.81° for εeff≈3.25. A +90° progressive-phase baseline therefore requires only small branch-path corrections. The current analytical seed is:

- A phase trim: 0 mm
- B phase trim: 0.66 mm
- C phase trim: 1.41 mm
- D: solve independently as a terminal/direct-fed radiator

These values are stored as metadata in `src/geometry.ts` under `phaseDesignSeed`; they are not yet routed as copper meanders. See `docs/12_pre_simulation_phase_trim_estimate_v1.md`.


## Complete complex-taper copper seed

The PCB geometry now implements the first reduced-order complex-taper seed rather than storing phase only as metadata:

- A: 6.5 dB amplitude seed, 0 mm branch phase trim;
- B: 5.0 dB amplitude seed, +0.66 mm path added by a short V-shaped feed transition;
- C: 3.0 dB amplitude seed, +1.41 mm V-shaped feed transition, with the Patch port assigned to the lagging quadrature branch in the analytical convention;
- D: direct terminal feed replaced by a shortened phase route with about 35.34 mm centerline length (7.29 mm horizontal + 17.55 mm diagonal at ~29.91° + 10.5 mm inset).

Under the current reduced-order model this gives an equivalent four-Patch phase seed close to 0° / 90° / 180° / 270° up to a common phase offset.

These are pre-HFSS copper seeds, not frozen manufacturing dimensions. HFSS/openEMS should calibrate the actual coupled-port phase, effective permittivity and loaded propagation phase, after which the trim lengths can be corrected using approximately 5.30°/mm at the present analytical baseline.

See `docs/13_coupler_terminal_phase_closure_v1.md`.


For pre-HFSS phase synthesis, A/B/C use a common target branch phase of approximately -90° relative to the local through reference; D is direct-fed at 0°. This convention is parameterized in `src/geometry.ts` and must be recalibrated from the final complex S-parameters.

## Matched-extraction T-cell variants

The PCB project now exports a second A/B/C/D topology based on analytically matched extraction T-cells.

- Board envelope: 50 × 60 mm; horizontal Patch pitch remains 50 mm.
- A: κ≈0.224, Zt≈44.05 Ω / 3.82 mm, Zb≈93.06 Ω / 0.88 mm.
- B: κ≈0.316, Zt≈41.35 Ω / 4.21 mm, Zb≈73.56 Ω / 1.52 mm.
- C: κ≈0.501, Zt≈35.32 Ω / 5.32 mm, Zb≈49.90 Ω / 3.13 mm.
- Transformer reference planes are at the inner edges of the magnetic RF pads.
- The 10.5 mm Patch inset remains a common 50 Ω feed and is not folded into the unequal branch transformer.
- A/B/C T-junctions are near y≈-25 to -26 mm and use ordinary manufacturable line widths.
- Inter-cell pad/bridge section target is approximately 37–39° electrical phase.
- D uses a direct ~33.84 mm pre-inset half-wave V-feed plus the common 10.5 mm inset.

Entrypoints: `index-ta.tsx`, `index-tb.tsx`, `index-tc.tsx`, `index-td.tsx`.

The original coupler variants remain in the project for topology comparison.
