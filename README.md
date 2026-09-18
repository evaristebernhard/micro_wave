# micro_wave

2.45 GHz 微波加热设备磁吸天线板、连接桥与连接线的射频仿真设计仓库。

当前阶段先冻结可执行参数、审查物理可行性，并定义后续 HFSS/CST/openEMS 的建模与验收口径。仓库中的理论分析和参数预算不是“三维仿真已经达标”的证明。

## 当前基线

**当前有效需求基线：`docs/01_rf_simulation_requirements_v3.md`。**

- `docs/01_rf_simulation_requirements_v1.md`：原始需求冻结版，仅保留追踪
- `docs/01_rf_simulation_requirements_v2.md`：第一轮工程修订版，现保留用于追踪
- `docs/01_rf_simulation_requirements_v3.md`：当前客户技术修订基线；明确写入不可执行原始指标、替代验收口径和客户需确认项
- `docs/02_system_theory_analysis_v1.md`：系统拓扑、功率预算、级联均匀性、WR340/50 Ω、磁吸接口等理论分析
- `docs/03_patch_antenna_theory_v1.md`：2.45 GHz 前向辐射矩形 Patch 的尺寸、弱耦合、馈电、功率守恒与 tscircuit/HFSS 参数化基线
- `docs/04_pcb_design_manual_v1.md`：第一版 tscircuit PCB 的执行手册，含坐标、尺寸、层叠、Patch/主线/耦合/识别线/磁吸接口规则和 HFSS 交接清单
- `docs/05_gradient_coupling_system_architecture_v1.md`：梯度耦合分区架构、等功率递推、A/B/C/D 四类板、500 W 系统功率边界和分配网络约束
- `docs/06_patch_design_rationale_v1.md`：当前设计思想主文档；从“为什么采用 Patch”进一步升级到“几何 → 复数 S 参数 → Patch 复激励 → 工件功率沉积 → 无源网络反综合”的统一设计链
- `docs/07_theory_gap_closure_v1.md`：闭合长串 FR4 损耗上限、灰板 raw S21 指标冲突、强耦合器可实现性、D 终端板与两层梯度分配等剩余理论问题
- `docs/08_original_requirements_feasibility_audit_v1.md`：原始客户需求可行性审计；逐项记录已证明不可同时满足或不能按原样验收的指标
- `docs/09_current_patch_smatrix_parameter_design_v1.md`：设计思想下的第一轮参数实现；建立复数 S/ABCD 级联与 A/B/C/D seed，但 6.5/5/3 dB 只作为 scalar-budget 起点，不作为最终场最优解
- `docs/10_zone_complex_phase_synthesis_v1.md`：四板 Zone 复相位综合；由目标 Patch 复激励反推 coupling magnitude、coupled-port phase 与 through phase，并给出 0/±90/180° canonical mode 扫描方案
- `docs/11_qmatrix_phase_dof_design_v1.md`：给出 Q 矩阵最小提取流程、phase-DOF 设计 gate、约 18 mm 相位补偿的损耗代价，以及从理想场解反推 PCB 的执行顺序

## V3 当前工程口径

### 功率

- 原“500 W + 100 块 + 5–8 W/块”不再作为同时硬指标；
- 磁控管硬件上限仍为 500 W；
- 预留约 20% 系统损耗/反射余量，初始有效功率预算按 400 W；
- 5–8 W/块不再作为 1–100 块全范围硬指标；
- 50 块：约 8 W/块；
- 80 块：约 5 W/块；
- 100 块：约 4 W/块；
- 若必须 100 块均达到 5 W/块，则 80% 效率假设下源功率至少约 625 W，需要升级硬件。

### RF 分区

系统仍支持总计 1–100 块，但不再默认全部串在一条连续 FR4 主线上。

当前工程基线：

```text
磁控管
  → WR340 / 匹配
  → WR340→N
  → 低损耗分配主干
  → 梯度耦合 RF Zone
       ├─ 4 块：A → B → C → D_term
       ├─ 3 块：B → C → D_term
       ├─ 2 块：C → D_term
       └─ 1 块：D_term
```

按当前 0.42 dB/cell 理论值，4 板等功率梯度目标约为 **21.5% / 30.2% / 47.6% / 100%**。D 板是终端辐射板，不再把所有板都按固定 10% 弱耦合同构板处理。

25/100 块优先使用局部全波模型 + 复数 S 参数网络级联。梯度比例必须在 HFSS/openEMS 得到真实 through-line 传输系数后重新标定。

### 50 Ω 主线

- 原 2.0 mm 不再冻结；
- tscircuit/HFSS seed 改为 **2.90 mm**；
- 扫描范围 **2.60–3.20 mm**；
- 最终按真实 PP 覆盖、地结构和铜厚场求解得到 50 Ω ±2 Ω。

### 连接桥

普通 FR4、tanδ≈0.02 条件下：

- 100 mm 平面桥：设计目标 ≤0.6 dB，验收≤0.8 dB；
- 约 100 mm 立体直角桥：目标≤0.8 dB，验收≤1.0 dB；
- 若坚持 0.2–0.3 dB，则改用 tanδ≤0.004 的 RF 低损耗基材或短同轴。

### 长馈线

RG142 不再作为 500 W、3–10 m 主馈线基线。

V2 采用 **LMR-900 等级或等效低损耗 50 Ω 电缆**作为比较基准：

- 3 m 总成：≤0.5 dB；
- 5 m 总成：≤0.8 dB；
- 10 m 总成：≤1.3 dB；
- VSWR≤1.3 优选，≤1.5 硬上限。

### 板数识别

取消“10 kΩ/板简单并联计数”作为基线，改为：

- 每板 100 Ω；
- 0.1%；
- ≤25 ppm/°C；
- 串联计数；
- 100 μA 恒流测量。

由此每增加一块约增加 10 mV，1–100 块对应约 10 mV–1.00 V。

## 保持不变的材料/频率参数

- 中心频率：2.45 GHz
- 工作频段：2.40–2.50 GHz
- 全局扫频：2.0–3.0 GHz
- 端口参考阻抗：50 Ω
- FR4：εr=4.3，tanδ=0.02，厚 1.6 mm
- 铜：σ=5.8×10^7 S/m，厚 35 μm，Rz=5 μm 作敏感性参数
- 前 PP：εr=2.2，tanδ=0.0005，厚 2 mm
- 后 PP：εr=2.2，tanδ=0.0005，厚 6 mm

## 后续模型目录

```text
micro_wave/
├── docs/
├── hfss/
│   ├── single_board/
│   ├── magnetic_interface/
│   ├── planar_bridge/
│   ├── right_angle_bridge/
│   ├── inter_zone_bridge/
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


## 当前设计方法

当前 Patch+Zone 路线统一按以下顺序推进：

\[
\boxed{
\text{Geometry}
\rightarrow
\text{Complex }S
\rightarrow
\text{Patch excitation }\mathbf u
\rightarrow
\text{Workpiece deposition }Q
\rightarrow
\text{Passive synthesis}
}
\]

因此后续 HFSS/openEMS 与 PCB 优化不再只以 coupling dB 为中心。A/B/C/D 的第一轮 6.5/5/3 dB 参数用于启动搜索，最终应由工件侧目标复激励和无源网络可实现性共同决定。
