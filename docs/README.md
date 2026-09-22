# Documentation index

## Start here

- `00_current_status.md` — **当前唯一项目现状入口。** 先看这里，回答“现在做到哪、哪些结果可信、还缺什么、下一步是什么”。

其它顶层文档是专项技术依据，不再各自承担“项目总状态”的职责。

## Current technical baseline

- `01_rf_simulation_requirements_v3.md` — requirement baseline；其中历史约束不自动等于当前主设计。
- `08_original_requirements_feasibility_audit_v1.md` — original requirement conflicts and revision rationale.
- `18_tcell_bandwidth_load_sensitivity_v1.md` — T-cell load/bandwidth sensitivity reference.
- `21_loaded_patch_nearfield_analytic_synthesis_v1.md` — loaded-Patch near-field model.
- `22_layered_medium_patch_loading_model_v1.md` — layered PP/air/workpiece loading model.
- `23_few_mode_robust_field_synthesis_v1.md` — current reduced-order field optimization.
- `24_theory_closure_master_v1.md` — theory master.
- `25_current_capability_gap_audit_v1.md` — 2026-09-20 capability-gap audit；已被 `00_current_status.md` 作为总状态入口取代。
- `26_openems_port_fixture_audit_v1.md` — corrected openEMS MSL-port methodology.
- `27_fast_tcell_design_loop_v1.md` — surrogate-guided fast T-cell iteration loop.
- `28_full_v2_fast_em_v1.md` — complete-board fast EM model and run gates.
- `29_full_v2_id_sensitivity_v1.md` — Full V2 ID copper/resistor RF sensitivity.
- `30_full_v2_loaded_simulation_closure_v1.md` — loaded-workpiece run audit and data-quality closure status.
- `31_pcb_status_explainer_v1.tex` — 2026-09-22 PCB/PDF说明源文件；它是一次性快照，不再作为总状态基线。

## Open development branches

两条重要工作目前仍是 open PR，状态已经统一写进 `00_current_status.md`：

- PR #22 — bridge / cable-tab / 5-25-100 delivery chain；
- PR #23 — Full V2 power-flow physics audit。

未合并分支中的结果必须明确标成“已开发、未合并/未最终验证”，不能写成 main 已完成能力。

## Historical material

Superseded documents are in `archive/`.

They are retained for traceability only. Do not use archived dimensions, side-coupler seeds, progressive-phase targets, or equal-power tap values as current design inputs unless a current document explicitly cites them as a benchmark.
