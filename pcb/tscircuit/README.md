# micro_wave tscircuit PCB

This subproject generates the first 50 mm × 50 mm parameterized Patch PCB seed described in `docs/04_pcb_design_manual_v1.md`.

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
dist/single-board.gerbers.zip
```

## Current geometry seed

- PCB: 50 × 50 mm
- Patch: 37.5 × 28.5 mm
- Patch center: (0, 5 mm)
- RF through-line: 2.9 mm wide at y = -18 mm
- Inset depth: 10.5 mm
- Inset side gap: 0.5 mm
- Parallel coupling gap: 0.5 mm
- Parallel coupling length: 6 mm
- Bottom: nearly full continuous copper ground
- Board-count resistor: 100 Ω / 0603 placement seed

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

The first HFSS pass should determine 50 mm through-line loss before multi-board cascade optimization.
