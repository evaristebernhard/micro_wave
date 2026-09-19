# micro_wave

2.45 GHz 微波加热设备磁吸天线板、连接桥与连接线的射频仿真设计仓库。

当前阶段先冻结可执行参数、审查物理可行性，并定义后续 HFSS/CST/openEMS 的建模与验收口径。仓库中的理论分析和参数预算不是“三维仿真已经达标”的证明。

## 当前基线

**当前有效需求基线：`docs/01_rf_simulation_requirements_v4.md`。**

- `docs/01_rf_simulation_requirements_v1.md`：原始需求冻结版，仅保留追踪
- `docs/01_rf_simulation_requirements_v2.md`：第一轮工程修订版，现保留用于追踪
- `docs/01_rf_simulation_requirements_v3.md`：上一版工程修订基线，保留追踪
- `docs/01_rf_simulation_requirements_v4.md`：当前 V4.1 物理闭合基线；1–80 块通用无源硬件采用 equal-power baseline，并统一 500 W、5–8 W/板、±25% 与总损耗 gate
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
- `docs/12_pre_simulation_phase_trim_estimate_v1.md`：在无全波仿真前给出解析 phase-trim 近似解；当前 +90° progressive mode seed，以及 A/B/C = 0 / 0.66 / 1.41 mm 的第一阶 branch trim
- `docs/13_coupler_terminal_phase_closure_v1.md`：闭合 C 的 quadrature phase 约定与 D terminal 相位；给出完整四板约 0/90/180/270° seed，并落实 B/C V-feed 与 D 35.34 mm 斜向 phase route
- `docs/14_c_coupler_footprint_feasibility_v1.md`：审计 C 的 3 dB quadrature coupler footprint；证明标准 full-size branch-line 在当前 50×50 mm 同层 Patch 布局中无空间，保留 compact quadrature 路线

## V4.1 当前工程口径

### 板数与通用功率架构

- 正式支持 **1–80 块**；5 / 25 / 80 为代表验收工况；
- 源功率上限 **500 W**；
- 单板 useful accepted RF：**5–8 W**；
- 均匀性硬指标：**≤±25%**；
- 1–80 通用固定无源 PCB 采用 **equal-power baseline**，不再使用随板数变化但缺乏可调硬件机制的 coupling taper。

固定无源网络中 normalized power split 不会随总输入功率改变，因此此前 field-aware \(1:0.6412:0.6412:1\) 只保留为低板数/可重构/独立分配优化模式。

### RF 分区

\[
N=4M+r,\qquad r=0,1,2,3.
\]

完整 Zone：

\[
A\rightarrow B\rightarrow C\rightarrow D_{\rm term}.
\]

80 块对应 **20 个四板 Zone**；余数使用 1/2/3-board partial Zone。机械上可以连续磁吸，但 RF 不采用 80 块连续普通 FR4 长链。

### loss-aware equal-power extraction

定义：

\[
\tau=10^{-L_{\rm cell}/10},
\qquad
A_m=\sum_{k=0}^{m-1}\tau^{-k}.
\]

固定 extraction：

\[
\kappa_i=\frac1{A_{m-i+1}}.
\]

在当前 conservative：

\[
L_{\rm cell}=0.42\ {\rm dB}
\]

下，四板 seed 为：

\[
\boxed{
\kappa_A/\kappa_B/\kappa_C
=
21.498\%/30.167\%/47.584\%.
}
\]

### 80-board 总损耗 gate

最坏上游 RF path：

\[
L_{\rm up}
=
L_{\rm cable}
+
L_{\rm adapter}
+
L_{\rm manifold}
+
L_{\rm bridge}
+
L_{\rm connector}.
\]

80×5 W 必须满足：

\[
\boxed{
L_{\rm zone}+L_{\rm up}
\le0.9691\ {\rm dB}.
}
\]

当前 0.42 dB/cell 时：

\[
\eta_{\rm zone}\approx85.99\%,
\]

因此只剩：

\[
\boxed{
L_{\rm up,max}\approx0.314\ {\rm dB}.
}
\]

所以“5 m cable≤0.5 dB”虽然可作为低/中板数指标，但**不能与当前 0.42 dB/cell 同时支持 80×5 W**。

loss trade-off：

| \(L_{\rm cell}\) | \(L_{\rm up,max}\) |
|---:|---:|
| 0.30 dB | 0.506 dB |
| 0.35 dB | 0.426 dB |
| 0.40 dB | 0.346 dB |
| 0.42 dB | 0.314 dB |

一阶可记：

\[
L_{\rm up}+1.5L_{\rm cell}\lesssim0.969\ {\rm dB}.
\]

### PP + FR4 修正

当前解析：

\[
3.48\lesssim\varepsilon_{\rm eff}\lesssim3.63,
\]

\[
\beta\approx5.49\text{–}5.61^\circ/{\rm mm},
\]

50 Ω quarter-wave 约：

\[
16.05\text{–}16.40\ {\rm mm},
\]

主线 quasi-static 中心：

\[
w_{50}\approx2.91\ {\rm mm}.
\]

50 mm 主线 loss 理论范围目前约：

\[
0.33\text{–}0.43\ {\rm dB},
\]

0.42 dB 仅作为 conservative reference。

### 磁吸接口

用：

\[
Z_s=R_c+j\omega L_c,
\qquad
Y_p=G_p+j\omega C_p
\]

的 lumped two-port。RL≥20 dB 的单参数数量级：

\[
L_c\lesssim0.65\ {\rm nH},
\qquad
C_p\lesssim0.26\ {\rm pF}.
\]

preferred dissipative contact loss：

\[
IL_c\lesssim0.02\ {\rm dB}.
\]

5 mm magnetic bridge 的 phase-equivalent：

\[
\varepsilon_{\rm eff,bridge}\approx1.67.
\]

### loaded radiator

主谐振附近：

\[
\frac{X_L}{R_L}
=
-
Q_L
\left(
\frac{f}{f_r}
-
\frac{f_r}{f}
\right).
\]

center-frequency phase gate：

\[
|X_L/R_L|\lesssim0.0875
\]

对应约 ±5° branch phase error。

若 \(|\Gamma_L|\le0.10\) 且 \(X=0\)，则：

\[
40.9\ \Omega\lesssim R_L\lesssim61.1\ \Omega.
\]

### 连接桥与线缆

- 100 mm planar bridge 若坚持 ≤0.2 dB，材料需约 \(\tan\delta\lesssim0.002\text{–}0.003\)；
- 100 mm 量级 right-angle bridge 若坚持 ≤0.3 dB，材料级 gate 约 \(\tan\delta\lesssim0.004\)；
- cable / adapter / manifold / bridge 不再分别验收后直接相加，而必须检查同一 worst RF path 的总 \(L_{\rm up}\)。

### 其它保留项

- 50×50 mm 仍是硬 mechanical gate；
- 客户原方形 Spiral 保留为 baseline；
- Patch / T-cell 为优化路线；
- 10 kΩ/board 恢复为独立串联 ID network；
- 15–17 mm FR4 field-shaping phase section 不再作为 80-board universal baseline，因为它会显著吃掉 loss budget。

详细理论：

- docs/25_1_to_80_closed_power_framework_v1.md
- docs/26_physical_correction_analytic_closure_v1.md
- docs/24_next_pcb_design_parameters_v2.md（仅 field-aware 可重构/低板数分支）

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

V4.1 之后，1–80 通用无源路线的优先级改为：

\[
\boxed{
\text{loss budget}
\rightarrow
\text{equal-power extraction}
\rightarrow
\text{loaded match}
\rightarrow
\text{workpiece efficiency}
\rightarrow
\text{optional field shaping}
}
\]

系统级主链：

\[
\boxed{
\text{materials/geometry}
\rightarrow
(\alpha,\beta)
\rightarrow
S_{\rm cell}
\rightarrow
\kappa_i
\rightarrow
C_N
\rightarrow
P_{\rm src}(N)
}
\]

工件侧支链：

\[
\boxed{
\text{PP/gap/workpiece}
\rightarrow
G_{\rm work}+jB_{\rm work}
\rightarrow
Z_{\rm loaded}
\rightarrow
\eta_{\rm work}
}
\]

field-aware complex excitation / Q-matrix 仍保留，但作为低板数或可重构优化层，不再优先于 80-board loss closure。

- `docs/16_extended_board_tcell_design_v1.md`：50×60 工程包络与 matched-extraction T-cell 解析设计。
- `docs/17_tcell_reference_plane_bridge_phase_v1.md`：T-cell 最终参考面；5 mm 磁吸桥作为独立相移二端口，统一约 19° bridge phase，A/B/C 残差约在 ±0.7° 内

当前 PCB 工程同时保留原 coupler A/B/C/D 与 matched-extraction T-cell A/B/C/D 两套可导出 topology。RF 几何实际只需要约 60 mm 的纵向有效包络；由于当前 tscircuit board outline 以原点居中实现，工程板采用 50×70 mm，使下边界达到 y=-35 mm。横向板宽始终保持 50 mm，因此 Patch 节距与相位 reference 不变。

- `docs/17_tcell_reference_plane_layout_v1.md`：50×60 T-cell 正确 reference plane、T-junction 坐标、inter-cell 37–39° phase target 与 D 半波 V-feed。
- `docs/18_tcell_bandwidth_load_sensitivity_v1.md`：理想传输线频带与 loaded-Patch reflection 敏感性；给出 T-cell / isolated-topology 的定量切换判据。

- `docs/19_tcell_exact_equal_power_synthesis_v1.md`：按 0.42 dB/cell 精确反解等功率 T-cell；A/B/C 更新为 21.498% / 30.167% / 47.584%，并重新综合线宽、T 点与 inter-cell phase。

- `docs/25_1_to_80_closed_power_framework_v1.md`：1–80 块 equal-power passive 闭合功率理论；给出任意 N 的 loss-aware extraction、source-power 公式与 80 板总损耗 gate。
- `docs/26_physical_correction_analytic_closure_v1.md`：把 line/contact/bridge/loaded radiator/β/workpiece efficiency 全部写成解析修正模型与 design gate。
- `docs/24_next_pcb_design_parameters_v2.md`：field-aware 可重构/低板数分支；不再作为 1–80 通用无源 PCB 默认参数。
