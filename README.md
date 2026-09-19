# micro_wave

2.45 GHz 微波加热设备磁吸天线板、连接桥与连接线的射频仿真设计仓库。

当前阶段先冻结可执行参数、审查物理可行性，并定义后续 HFSS/CST/openEMS 的建模与验收口径。仓库中的理论分析和参数预算不是“三维仿真已经达标”的证明。

## 当前基线

**当前有效需求基线：`docs/01_rf_simulation_requirements_v4.md`。**

- `docs/01_rf_simulation_requirements_v1.md`：原始需求冻结版，仅保留追踪
- `docs/01_rf_simulation_requirements_v2.md`：第一轮工程修订版，现保留用于追踪
- `docs/01_rf_simulation_requirements_v3.md`：上一版工程修订基线，保留追踪
- `docs/01_rf_simulation_requirements_v4.md`：当前物理闭合基线；正式改为 1–80 块，并统一 500 W、5–8 W/板、±25%、板数自适应功率与 efficiency gate
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

## V4 当前工程口径

### 板数与功率

- 正式支持 **1–80 块**；5 / 25 / 80 为代表验收工况；
- 磁控管硬件上限仍为 **500 W**；
- 端到板 useful RF 设计预算按 **400 W**，因此 80 板模式要求系统总效率 **η_sys ≥ 80%**；
- 单板 useful accepted RF 保持 **5–8 W**；
- 组内 nominal power deviation 保持 **≤±25%**；
- nominal 平均功率：

\[
\bar P(N)=\min\left(6.5,\frac{400}{N}\right)\ {\rm W}.
\]

- 1–61 块按 6.5 W/板 nominal；62–80 块进入 power-limited mode；80 块为 5 W/板。

### 自适应四板 taper

低/中板数沿用当前 field-aware endpoint：

\[
P_A:P_B:P_C:P_D=1:0.6412:0.6412:1.
\]

即 6.5 W 平均时约 **7.92 / 5.08 / 5.08 / 7.92 W**。

高板数按：

\[
q^*(N)=
\min\left[
1,
\max\left(
0.6412,
\frac{5}{2\bar P(N)-5}
\right)
\right].
\]

自动把 inner/outer taper 压平。80 板时 \(q=1\)，即 5 / 5 / 5 / 5 W equal-power Zone。整个解析目标范围内最大 nominal deviation 约 ±21.9%，低于 ±25%。

### RF 分区

系统机械上允许 1–80 块连续磁吸，但 RF 不采用 80 块连续普通 FR4 长链。

\[
N=4M+r,\qquad r=0,1,2,3.
\]

完整 Zone：

\[
A\rightarrow B\rightarrow C\rightarrow D_{\rm term}.
\]

80 块对应 **20 个四板 Zone**；余数 1 / 2 / 3 块用 partial Zone，并用同一套 backward loss-aware synthesis 求 coupling。

### 80 板 efficiency gate

若 upstream feed + manifold 目标效率为 95%，则 80 板模式要求：

\[
\eta_{\rm zone}\ge\frac{0.80}{0.95}=84.21\%.
\]

当前 0.42 dB/cell 的一阶 equal-power 四板模型约为 **85.99%**，因此解析上有小幅余量，但必须由 full-wave 验证。

### 50 Ω 主线

- 原 2.0 mm 不再冻结；
- PP-corrected 下一版中心约 **2.91 mm**；
- 正式制造前按真实 PP 厚度、FR4 参数和铜厚重新求 \(Z(W)\)。

### 板数识别

恢复客户原始 **10 kΩ/板**，但明确为独立识别线串联计数：

\[
R_{\rm ID}(N)=10N\ {\rm k\Omega}.
\]

建议 1 μA 恒流读取；1–80 块约对应 10 mV–0.80 V。识别线不进入 RF extraction 网络。

### 客户原始 Spiral 与优化 Patch

- 方形螺旋保留为正式 baseline；
- rectangular Patch / matched T-cell 作为优化方案；
- 最终按 S 参数、有用取能、工件吸收、场均匀性、高场风险、50×50 mm footprint 和加载敏感性比较。

### 连接桥 / 长馈线

普通 FR4 100 mm 平面桥 ≤0.2 dB、直角桥 ≤0.3 dB，以及 RG142 5 m ≤0.5 dB 均不作为“材料与损耗同时无条件冻结”的组合。若坚持原超低插损指标，必须同步采用更低损耗 RF 基材/电缆或缩短路径。

详细闭合推导：

- \`docs/25_1_to_80_closed_power_framework_v1.md\`
- \`docs/24_next_pcb_design_parameters_v2.md\`

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

- `docs/16_extended_board_tcell_design_v1.md`：50×60 工程包络与 matched-extraction T-cell 解析设计。
- `docs/17_tcell_reference_plane_bridge_phase_v1.md`：T-cell 最终参考面；5 mm 磁吸桥作为独立相移二端口，统一约 19° bridge phase，A/B/C 残差约在 ±0.7° 内

当前 PCB 工程同时保留原 coupler A/B/C/D 与 matched-extraction T-cell A/B/C/D 两套可导出 topology。RF 几何实际只需要约 60 mm 的纵向有效包络；由于当前 tscircuit board outline 以原点居中实现，工程板采用 50×70 mm，使下边界达到 y=-35 mm。横向板宽始终保持 50 mm，因此 Patch 节距与相位 reference 不变。

- `docs/17_tcell_reference_plane_layout_v1.md`：50×60 T-cell 正确 reference plane、T-junction 坐标、inter-cell 37–39° phase target 与 D 半波 V-feed。
- `docs/18_tcell_bandwidth_load_sensitivity_v1.md`：理想传输线频带与 loaded-Patch reflection 敏感性；给出 T-cell / isolated-topology 的定量切换判据。

- `docs/19_tcell_exact_equal_power_synthesis_v1.md`：按 0.42 dB/cell 精确反解等功率 T-cell；A/B/C 更新为 21.498% / 30.167% / 47.584%，并重新综合线宽、T 点与 inter-cell phase。

- `docs/25_1_to_80_closed_power_framework_v1.md`：1–80 块闭合功率理论；给出 board-count-adaptive taper、loss-aware extraction、80 板 efficiency gate 与 5/25/80 验收链。
