# Vendored tscircuit skill

Source: https://github.com/tscircuit/skill

Vendored for this project on 2026-09-20 from upstream main commit ce9e2554c3be11c51a798a49c391c1e4a56492db.

Only the core workflow plus PCB/RF element references used by micro_wave are copied here. The upstream project remains canonical.

Project-specific workflow:
1. Check netlist and placement before build.
2. Treat the current T-cell board as an engineering/calibration seed, not manufacturing freeze.
3. Keep RF copper geometry synchronized with the openEMS/HFSS extraction model.
4. Export Gerbers only after placement/build/short checks are clean.
5. Do not interpret a successful Gerber export as RF validation.
