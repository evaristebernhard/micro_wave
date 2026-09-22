# micro_wave

2.45 GHz 微波加热磁吸天线板、连接件与多 Zone RF 分配研究仓库。

当前项目已经从早期 side-coupler / progressive-phase seed 转向 **field-aware matched T-cell + rectangular Patch**。理论链条已经基本闭合，当前重点是把单板 RF 核心、完整工程 PCB、磁吸接口和工件加载逐级做成可信的 full-wave/实物结果。

## 当前唯一入口

- 需求基线：`docs/01_rf_simulation_requirements_v3.md`
- 原始需求可行性审计：`docs/08_original_requirements_feasibility_audit_v1.md`
- T-cell 负载敏感性：`docs/18_tcell_bandwidth_load_sensitivity_v1.md`
- 工件/Patch 模型：`docs/21_loaded_patch_nearfield_analytic_synthesis_v1.md`、`docs/22_layered_medium_patch_loading_model_v1.md`
- 当前场优化：`docs/23_few_mode_robust_field_synthesis_v1.md`
- 理论总基线：`docs/24_theory_closure_master_v1.md`
- 当前能力/GAP：`docs/25_current_capability_gap_audit_v1.md`
- openEMS 端口与低成本校准：`docs/26_openems_port_fixture_audit_v1.md`
- 当前快速设计循环：`docs/27_fast_tcell_design_loop_v1.md`
- 当前交付要求：`docs/29_current_delivery_requirements_v1.md`
- 文档索引：`docs/README.md`
- 历史文档：`docs/archive/`

顶层 `docs/` 不再保留已被后续结论覆盖的 50×50、side-coupler、0/90/180/270°、equal-power 等阶段性文档。

## 当前 PCB

### Calibration board

`pcb/tscircuit/index-tcal.tsx`

用途：只校准 RF 核心，不作为客户完整单板。

- 50 × 60 mm
- T-cell + Patch
- RF IN / RF OUT
- bottom ground
- ground-return vias
- 无 ID 支路

### Full engineering board V2

`pcb/tscircuit/index-full-v2.tsx`

这是当前向客户完整单板演化的主 PCB：

- 真正 50 × 60 mm 板框；
- RF IN / RF OUT 磁吸信号触点；
- 对应 GND 接触面 + 多过孔 return；
- V2 surrogate-calibrated T-cell；
- rectangular Patch；
- 完整底层 ground；
- 客户原始 10 kΩ / 0603 ID 电阻；
- ID IN / ID OUT；
- RF 铜默认 exposed，便于与 PP-loaded EM stack 对齐；
- miter/overlap transition 和八边形 T-junction，避免 V1 纯硬直角铜节点。

V2 仍是 **screen candidate**，不是 manufacturing freeze。

## 当前 V2 RF 参数

现有可信 openEMS thru/T-cell verify 结果用于校准 PP-loaded microstrip surrogate。

当前 V2 candidate：

| 参数 | V2 |
|---|---:|
| 中心频率 | 2.45 GHz |
| PCB | 50 × 60 mm |
| Patch | 37.5 × 28.5 mm |
| calibrated 50 Ω width seed | 2.670 mm |
| series transformer | 42.11 Ω / 3.557 mm |
| branch transformer | 78.10 Ω / 1.073 mm |
| series electrical length seed | 15.317 mm |
| branch electrical length seed | 15.972 mm |
| T-junction | (-6.1105, -24.0072) mm |
| robust junction split target | ≈29.1% |
| final A-stage output target | 24.76% |

这些参数来自现有 full-wave 结果校准后的低阶 surrogate；只有 V2 screen/verify 通过后才会提升为 canonical RF geometry。

## 当前已验证到什么程度

可信的 `thru_verify`：

- S11 ≈ -24.27 dB
- S21 ≈ -0.376 dB
- native microstrip impedance ≈ 45.5 Ω for historical 3.137 mm line

可信的 `tcell_verify`：

- S11 ≈ -26.81 dB
- S21 ≈ -2.285 dB
- S31 ≈ -7.800 dB
- conditional branch split ≈ 21.9%
- passive/converged network result

所以当前可以说 **T-cell core topology 已经得到可信 full-wave 支撑**，但完整客户板（launch + ID + Patch + workpiece）仍未完成最终全波闭环。

## 当前系统架构

100 块不再作为一条普通 FR4 连续微带链。

当前架构：

```text
500 W source
  -> WR340 / matching
  -> low-loss distribution manifold
  -> local RF zones
       A -> B -> C -> D
  -> workpiece
```

总板数可以按 1–100 的机械/控制架构设计，但真实同时供能数量仍取决于最终：

[
eta_{m sys}
=
eta_{m manifold}
eta_{m interface}
eta_{m zone}
eta_{m load}.
]

“80 块 × 5 W”只是假设端到端效率 80% 时的敏感性示例，不是当前能力。

## 当前材料基线

- FR4：εr≈4.3，tanδ≈0.02，1.6 mm
- copper：35 μm
- front PP：εr≈2.2，2 mm
- rear PP：εr≈2.2，6 mm
- center frequency：2.45 GHz
- target band：2.40–2.50 GHz

## tscircuit

官方 tscircuit skill 已 vendored 到：

`.codex/skills/tscircuit/`

工程板必须按：

```text
netlist -> placement -> build -> shorts -> Gerber / PCB-SVG
```

顺序通过检查；“能导 Gerber”本身不等于 RF 已验证。

## openEMS

关键脚本：

- `scripts/openems/check_tcell_calibration_geometry.py`
- `scripts/openems/simulate_tcell_network_coupon.py`
- `scripts/openems/simulate_tcell_calibration.py`
- `scripts/openems/design_tcell_surrogate.py`
- `scripts/openems/check_full_v2_geometry.py`
- `scripts/openems/simulate_full_v2_fast.py`

快速迭代原则：已有 full-wave 数据先拟合 surrogate，只对候选做一次 T-cell screen；之后先跑 Full V2 fast board（含 launch / Patch / ID copper），Full V2 通过后才进入更昂贵的 loaded-workpiece / verify。


## 当前连接件交付物

- `pcb/tscircuit/index-flat-bridge.tsx` — 100 × 50 mm 平面桥；
- `pcb/tscircuit/index-corner-bridge.tsx` — 5 cm + 5 cm 平面 L 型直角桥；
- `pcb/tscircuit/index-cable-tab.tsx` — 30 × 50 mm N/coax-to-magnetic tab；
- `scripts/openems/simulate_connection_hardware.py` — flat/corner/tab 快速 S 参数模型；
- `scripts/system/cable_model.py` — RG142/替代低损耗电缆模型；
- `scripts/system/cascade_power_budget.py` — 5/25/100 块功率与 500 W feasibility。

多板交付采用单件 full-wave + network cascade，不建立 100 块完整 3D FDTD。
