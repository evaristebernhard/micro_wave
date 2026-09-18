# micro_wave

2.45 GHz 微波加热设备磁吸点板、连接桥与连接线的射频仿真设计仓库。

本仓库当前先冻结需求、审查物理可行性，并定义后续 HFSS/CST/openEMS 的建模与验收口径。现阶段文档不是“三维仿真已经达标”的证明。

## 文档

- `docs/01_rf_simulation_requirements_v1.md`：基础参数冻结版需求书
- `docs/02_feasibility_and_risk_review.md`：功率预算、阻抗、材料损耗与级联风险审查
- `docs/03_simulation_execution_plan.md`：单板、桥、连接线和 5/25/100 块级联的仿真执行计划
- `docs/04_parameter_freeze_checklist.md`：最终三维仿真前必须确认的输入清单

## 当前冻结输入

- 中心频率：2.45 GHz
- 工作频段：2.40–2.50 GHz
- 全局扫频：2.0–3.0 GHz
- 参考阻抗：50 Ω
- 最大输入功率：500 W（参考面仍需最终确认）
- FR4：εr=4.3，tanδ=0.02，厚 1.6 mm
- 铜：σ=5.8×10^7 S/m，厚 35 μm，粗糙度标称 Rz=5 μm
- 前 PP：εr=2.2，tanδ=0.0005，厚 2 mm
- 后 PP：εr=2.2，tanδ=0.0005，厚 6 mm

## 已识别的一级风险

1. **500 W / 100 块 / 每块至少 5 W** 没有任何损耗余量，不能默认同时满足。
2. 在给定 PP 覆盖 + 1.6 mm FR4 层叠下，2 mm 能量线并非天然 50 Ω；已有二维计算约为 59 Ω。
3. 以 tanδ≈0.02 的 FR4 做 100 mm 传输路径，介质损耗可能单独超过平面桥 0.2 dB / 立体桥 0.3 dB 指标。
4. 5 m RG142 在 2.45 GHz 下是否能满足 ≤0.5 dB，必须按具体料号核验，不能只按“RG142”名称验收。
5. 连接桥必须同时建模信号路径与 RF 地回流，不能只连正面能量线。

## 建议后续目录

```text
micro_wave/
├── docs/
├── hfss/
│   ├── single_board/
│   ├── planar_bridge/
│   ├── right_angle_bridge/
│   ├── cable_adapter/
│   └── cascade/
├── scripts/
│   ├── pyaedt/
│   ├── cascade/
│   └── postprocess/
├── data/
│   ├── materials/
│   ├── sparameters/
│   └── measurements/
└── results/
```
