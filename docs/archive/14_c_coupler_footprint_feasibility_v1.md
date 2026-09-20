# C 板 3 dB 正交耦合器的尺寸可实现性审计 V1

> **状态更新（2026-09-20）：** 本文关于“标准 branch-line 在 50×50 mm 中放不下”的结论仅针对历史 50×50 footprint。当前产品机械目标已扩展为 50×60 mm，标准 branch-line 可重新作为对照候选；主方案仍优先 matched T-cell。见 `docs/16_extended_board_tcell_design_v1.md` / `docs/24_theory_closure_master_v1.md`。


> 目的：在全波仿真前，先回答 C 板“约 3 dB 强耦合 + 约 -90° branch phase”能否用标准单节 branch-line hybrid 直接塞进当前 50×50 mm Patch 板。

## 1. 标准微带尺寸的一阶反算

条件：

\[
f_0=2.45\ {\rm GHz},\qquad
\varepsilon_r=4.3,\qquad
h=1.6\ {\rm mm}.
\]

用标准 Hammerstad 型微带近似反算：

| 线阻抗 | 一阶线宽 | εeff | 四分之一波长 |
|---:|---:|---:|---:|
| 50 Ω | 3.14 mm | 3.27 | 16.92 mm |
| 35.35 Ω | 5.33 mm | 3.42 | 16.54 mm |
| 70.7 Ω | 1.64 mm | 3.11 | 17.34 mm |

标准 3 dB branch-line hybrid 的单节结构通常使用约 35.35 Ω 与 50 Ω 的四分之一波长支路。

## 2. 标准 branch-line 的最小同层包络

若横向 series arms 采用约 35.35 Ω、纵向 branches 采用约 50 Ω，则中心线尺寸约：

\[
W_c\approx16.54\ {\rm mm},
\qquad
H_c\approx16.92\ {\rm mm}.
\]

计入导体本身宽度后，同层铜包络至少约：

\[
\boxed{
W_{\rm env}\approx16.54+3.14\approx19.68\ {\rm mm}
}
\]

和：

\[
\boxed{
H_{\rm env}\approx16.92+5.33\approx22.25\ {\rm mm}.
}
\]

这还没有计入弯角修正、端口过渡、隔离、via fence 和制造间距。

## 3. 当前 Patch 板可用高度的硬上限

板高：

\[50\ {\rm mm}.\]

Patch 长：

\[28.5\ {\rm mm}.\]

因此即使把 Patch 完全贴到板的最上边缘，不留任何制造边距，Patch 下方的最大理论高度也只有：

\[
\boxed{
50-28.5=21.5\ {\rm mm}.
}
\]

而标准 branch-line 一阶最小包络已经约：

\[22.25\ {\rm mm}.\]

所以：

\[
\boxed{
22.25>21.5.
}
\]

即使零边距都不够。

当前 Patch 中心在 y=5 mm 时，Patch 下缘是：

\[y=-9.25\ {\rm mm},\]

板下缘为 -25 mm，所以当前实际下方空间只有：

\[
\boxed{15.75\ {\rm mm}.}
\]

与标准 hybrid 的 22.25 mm 包络相差约：

\[\boxed{6.5\ {\rm mm}.}\]

## 4. 结论：标准 branch-line fallback 应从当前 PCB 口径删除

因此在以下条件同时保持时：

- 50×50 mm board；
- 37.5×28.5 mm top-layer Patch；
- Patch 与 coupler 同层；
- bottom continuous Ground；

标准单节 branch-line 3 dB hybrid 不是一个可直接落板的 fallback。

它只有在改变至少一个条件后才可能使用：

1. miniaturized / loaded branch-line；
2. 多层/broadside 结构；
3. 外置或 SMD quadrature hybrid；
4. 改变 Patch/板尺寸或层叠；
5. 其它 compact quadrature coupler。

## 5. 为什么当前 C strong-coupler seed 仍值得保留

当前 C 的目标不仅是：

\[|p_C|^2\approx0.5,\]

还希望：

\[
\boxed{\arg p_C-\arg h_C\approx-90^\circ}
\]

这样才能与当前紧凑 D terminal route 一起保持约 +90° progression。

对于理想单节 coupled-line 3 dB coupler，所需 modal impedances 一阶为：

\[
Z_{0e}\approx120.9\ \Omega,
\qquad
Z_{0o}\approx20.7\ \Omega.
\]

阻抗分裂比：

\[
\boxed{
\frac{Z_{0e}}{Z_{0o}}\approx5.84.
}
\]

对应耦合很强，因此当前 0.30 mm gap 只能继续定义为搜索 seed，不能声称一定达到 3 dB。

但与标准 branch-line 相比，edge/compact coupled-line 至少在 footprint 上符合当前板面约束。

## 6. C 的设计决策

当前 C 采用以下分层决策：

### C0 — 现有 compact strong-coupler seed

- 17 mm 级 coupled section；
- 0.30 mm gap 仅作 HFSS 初值；
- 目标 \(|p_C|^2\approx0.48\sim0.50\)；
- 目标 relative branch phase 约 -90°；
- 目标 return loss 仍需联合优化。

### C1 — 若 C0 耦合不足

优先研究 compact quadrature topology，而不是标准 full-size branch-line：

- miniaturized branch-line；
- capacitive/loaded coupled-line；
- Lange/interdigital 类（若工艺允许）；
- 多层 broadside（若允许改 stackup）；
- 合适功率等级的外置/SMD hybrid。

### C2 — 若必须保持双层 FR4 + continuous ground + 无额外器件

则应承认 50% + 低反射 + -90° phase 可能需要放宽其中至少一项，并重新通过 Q-matrix 求最优可实现 complex taper。

## 7. 对 D 相位设计的影响

D 的紧凑 35.34 mm phase route依赖 C 使用约 -90° branch phase 的约定。

一般式：

\[
L_D
=
L_C^{\rm eff}
+
\frac{\theta_C+\alpha_D-\alpha_C-\psi_{CD}}{\beta}
\pmod{\lambda_g}.
\]

如果 C 最终无法实现 \(\alpha_C\approx-90^\circ\)，不能硬保留 D=35.34 mm，而应直接按 HFSS/解析得到的新 \(\alpha_C\) 重算 D。

所以当前 D route 是：

\[
\boxed{
\text{与 C 的 quadrature-phase seed 成对定义的参数化设计。}
}
\]

而不是与 C 无关的绝对固定尺寸。

---

## 8. 2026-09-18 更新：允许扩板后，标准 branch-line 重新成为候选

若 PCB 高度从 50 mm 增加到 60 mm，并把板中心设为

\[
y_c=0,
\]

则板中心保持 0，RF/Patch 坐标完全不变；板边界扩展到 ±35 mm。

因此 Patch、RF IN/OUT 与水平 50 mm 模块节距全部保持不变，但 Patch 下方空间从：

\[
15.75\ {\rm mm}
\]

增加到：

\[
\boxed{25.75\ {\rm mm}}.
\]

标准 3 dB branch-line 一阶铜包络高度约 22.25 mm，因此剩余：

\[
\boxed{25.75-22.25=3.50\ {\rm mm}}.
\]

所以本文前半部分的“50×50 同层布局放不下”仍然成立，但新的工程结论改为：

\[
\boxed{
\text{50×50 不适合标准 branch-line；50×60 可以把它作为真实对照方案。}
}
\]

这并不意味着标准 branch-line 自动成为首选。当前 matched-extraction T-cell 的解析几何更简单，而且 A/B/C 所需线宽全部可制造。因此后续应并行比较：

1. 50×60 matched T-cell；
2. 50×60 standard/miniaturized quadrature hybrid；
3. 必要时 unequal Wilkinson / isolated divider。


### 当前机械口径

当前工程尺寸最终统一为 50×60 mm，板中心 y=-5 mm，因此边界为：

\[
\boxed{y\in[-35,25]\ {\rm mm}}.
\]

这与 50×60、center=0 在 Patch 下方提供相同的 -35 mm 下边界，但少占 10 mm 总高度；同时保持 +25 mm 顶边和原 Patch/RF 坐标不变。

### 当前机械口径

当前工程尺寸最终统一为 50×60 mm，板中心 y=-5 mm，因此：

\[
\boxed{y\in[-35,25]\ {\rm mm}}.
\]

Patch 下缘仍为 -9.25 mm，所以其下可用高度为 25.75 mm；标准 branch-line 的约 22.25 mm 一阶包络仍可容纳，并留下约 3.50 mm 总余量。
