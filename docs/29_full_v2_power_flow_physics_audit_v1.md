# Full V2 功率流数学物理审计 V1

> 日期：2026-09-21
>
> 目的：用功率守恒、S 参数、等效多端口网络与 Zone 递推重新解释 Full Engineering Board V2 的最新 openEMS 结果，区分“输入匹配良好”“功率被非直通通道接受”“Patch 有用取能”“工件实际吸收”四个不同概念。
>
> 本文是当前 Full V2 仿真结果的解释基线。它不替代最终 loaded-workpiece full-wave，而是规定下一轮仿真必须闭合哪些物理量。

---

## 1. 当前观测事实

最新 Full V2 `screen/open` 在 2.45 GHz：

\[
S_{11}=-17.153\ \mathrm{dB},
\qquad
S_{21}=-11.688\ \mathrm{dB}.
\]

因此：

\[
R=|S_{11}|^2\approx0.01926,
\]

\[
T=|S_{21}|^2\approx0.06779,
\]

以及二端口残余：

\[
A_{2p}
=1-R-T
\approx0.91295.
\]

这里用 \(A_{2p}\) 而不是“absorption”，因为它只表示：

\[
\boxed{
\text{没有返回 port 1、也没有到达 port 2 的归一化功率}
}
\]

并没有告诉我们这部分功率去了哪里。

fast profile 给出的同类结果：

\[
R\approx0.01165,
\qquad
T\approx0.05635,
\qquad
A_{2p}\approx0.93201.
\]

两种网格/收敛 profile 都得到相同数量级，所以“through 极低”不是 smoke 粗网格的偶然现象。

---

## 2. Zone 目标实际上约束的是功率分区，而不是单独约束 S11

当前四板 field-aware 目标来自：

\[
\mathbf u
\propto
(1,\ 0.801e^{-j5.3^\circ},\ 0.801e^{-j5.3^\circ},\ 1),
\]

对应 accepted-power 比：

\[
(e_A,e_B,e_C,e_D)
\propto
(1,0.6412,0.6412,1).
\]

加入 phase-section loss 后，当前理论递推为：

\[
P_D=e_D,
\]

\[
P_i=e_i+\frac{P_{i+1}}{\tau_i},
\]

并得到：

\[
(P_A,P_B,P_C,P_D)
\approx
(4.0386,2.6643,1.7773,1).
\]

因此 A 板的 extraction fraction：

\[
\kappa_A
=
\frac{e_A}{P_A}
\approx0.2476.
\]

### 2.1 A 板 T-cell 后立即剩余的功率

忽略后续段损耗，A 板完成目标抽取后仍应留下：

\[
1-\kappa_A
\approx0.7524.
\]

相当于：

\[
10\log_{10}(0.7524)
\approx-1.24\ \mathrm{dB}.
\]

### 2.2 到下一块板参考面应剩余的功率

包含当前理论段损耗：

\[
\frac{P_B}{P_A}
=
\frac{2.6643}{4.0386}
\approx0.6597.
\]

所以若 port 2 的 reference plane 对应下一板输入附近，则目标 through power 应是约：

\[
\boxed{T_{A,\rm next}\approx66\%}
\]

对应：

\[
\boxed{S_{21,A}\approx-1.81\ \mathrm{dB}}
\]

的量级。

因此 Full V2 screen 的：

\[
T_{\rm sim}\approx6.78\%
\]

与目标的比值约：

\[
\frac{0.0678}{0.6597}\approx0.103.
\]

即：

\[
\boxed{
\text{当前向后级保留的功率只有 A-stage 目标量级的约 10%}
}
\]

---

## 3. 为什么“低 S11”不能证明设计正确

对于一个输入端，低反射只说明：

\[
R\ll1.
\]

它并不区分输入功率进入：

- 输出端口；
- Patch 辐射；
- 材料损耗；
- 开放边界；
- 寄生模；
- 工件。

例如当前：

\[
R\approx1.93\%
\]

确实意味着输入匹配很好。

但是系统真正要求的是一个带功率路由功能的网络：

\[
\boxed{
R\ \text{小},
\quad
U_A\approx24.76\%,
\quad
T_A\approx66\%\text{（到下一板）},
\quad
L_A\ \text{受控}
}
\]

其中：

- \(U_A\)：A 板目标有用取能；
- \(T_A\)：继续给后级的功率；
- \(L_A\)：寄生损耗/非目标泄漏。

所以：

\[
\boxed{
S_{11}\text{ 很好}
\not\Rightarrow
\text{Zone 功率分配正确}
}
\]

当前 Full V2 的主要问题正是：

\[
R\text{ 很小},
\qquad
T\text{ 也很小}.
\]

---

## 4. 当前 full-board 实际上是“开放多端口”，不是严格二端口

从 Maxwell 能流角度，时均 Poynting 定理可写为：

\[
P_{\rm in}
=
P_{\rm refl}
+
P_{\rm out}
+
P_{\rm rad}
+
P_{\rm diel}
+
P_{\rm cond}
+
P_{\rm work}
+
P_{\rm other}.
\]

归一化后：

\[
1
=
R+T
+U_{\rm rad}
+L_{\rm diel}
+L_{\rm cond}
+U_{\rm work}
+L_{\rm other}.
\]

当前 fast/screen：

- zero-thickness PEC，因此 \(L_{\rm cond}\) 被人为压到近零；
- 没有真实工件，因此 \(U_{\rm work}=0\)；
- 有 PML 开放边界；
- 有 Patch；
- 有有限 ground；
- 有 top coplanar lumped launch；
- 有 FR4/PP dielectric。

因此：

\[
1-R-T
\]

至少混合了：

\[
U_{\rm rad}
+
L_{\rm diel}
+
L_{\rm other}.
\]

这就是为什么当前的：

\[
A_{2p}\approx91.3\%
\]

**不能被解释成 Patch accepted power，更不能被解释成工件吸收功率。**

---

## 5. 等效网络解释：当前缺少第三端口/辐射端口的可观测性

T-cell coupon 是显式三端口：

\[
\text{input}
\rightarrow
\begin{cases}
\text{through}\ (S_{21})\\
\text{branch}\ (S_{31})
\end{cases}
\]

因此可以直接定义：

\[
k_{\rm out}
=
\frac{|S_{31}|^2}
{|S_{21}|^2+|S_{31}|^2}.
\]

这也是为什么 coupon 的 21.9% conditional branch split 是可解释的。

Full V2 把 branch 直接接到 Patch，并只保留两个 circuit ports，于是原来的第三端口被展开成：

\[
\boxed{
\text{branch}
\rightarrow
\text{Patch stored field}
\rightarrow
\text{radiation / dielectric / workpiece}
}
\]

此时仅凭 \(S_{11},S_{21}\)，无法反推出：

\[
P_{\rm branch}
\]

更无法区分：

\[
P_{\rm useful}
\quad\text{和}\quad
P_{\rm parasitic}.
\]

从系统辨识角度说，当前观测量不足。

---

## 6. 频率响应为何值得怀疑但不能直接判错

screen 在 2.25–2.65 GHz 内：

\[
S_{11}\approx-16.7\sim-17.6\ \mathrm{dB},
\]

\[
S_{21}\approx-11.8\sim-11.3\ \mathrm{dB},
\]

\[
1-R-T\approx91\%.
\]

变化非常平滑。

若主要由一个中等 Q 的 2.45 GHz Patch resonance 控制，通常预期至少在：

- 输入导纳；
- S11；
- through notch；
- 辐射/储能比例

上看到更明显的频率结构。

当前没有明显结构，有三种主要解释：

### H1 — 真正存在宽带强泄漏/强辐射路径

例如 launch、finite ground、branch-to-patch 几何形成宽带开放耦合，使大量能量不经 port 2。

### H2 — Patch loaded Q 很低

FR4 + PP + 开放边缘可能把 resonance 展宽到当前扫描内看起来较平。

### H3 — 端口/边界/功率分解造成观测偏差

coplanar lumped port 与实际传播模不完全匹配，或 PML 接收了大量非目标场；二端口后处理把这些统一计入：

\[
1-R-T.
\]

现有数据无法只凭频率平滑性在 H1/H2/H3 中做唯一判断。

---

## 7. 最小可辨识实验设计

下一步不应先做大范围参数 sweep，而应先增加可辨识性。

### Case 0 — Through/launch reference

保留：

- 两侧 magnetic launch；
- through line；
- finite ground；
- 相同 stack/boundary。

删除：

- branch；
- Patch。

目标：

\[
S_{21,\rm ref}
\]

应接近一个合理的低损耗 through baseline。

如果 Case 0 已经只有 -10 dB 量级，则问题主要在 launch/port/boundary，不应继续调 T-cell。

### Case 1 — T-cell + matched branch termination

保留 T-cell，但把 branch 终止为已知负载。

目标是重新获得显式三端口/可控负载意义下的：

\[
R,T,U.
\]

### Case 2 — Patch present, no ID

得到 RF-only full-board reference。

### Case 3 — ID open

与 Case 2 比：

\[
\Delta S_{11},
\quad
\Delta S_{21}.
\]

### Case 4 — ID 10k

确认 open approximation 是否成立。

### Case 5 — Loaded workpiece

只有在 Case 0–4 功率闭合后再加入真实工件，测：

\[
P_{\rm abs,work}.
\]

---

## 8. 下一版 power-flow functional gate

对 A-stage，建议把 gate 从单纯：

\[
S_{11}\le-10\ \mathrm{dB}
\]

升级成至少四部分。

### Gate A — 数值与被动性

\[
R+T\le1+\epsilon.
\]

### Gate B — 输入匹配

\[
S_{11}(2.45)\le-10\ \mathrm{dB}
\]

以及客户带宽要求。

### Gate C — through window

A-stage 下一板参考面应接近：

\[
T_A\sim0.66.
\]

考虑尚未标定的 launch/interface loss，第一轮 screen 不宜设过窄，可先使用工程窗口，例如：

\[
\boxed{
0.50<T_A<0.80
}
\]

作为“值得继续”的粗筛，而不是最终验收值。

B/C 板应由各自递推目标单独生成窗口，不能共用 A 的窗口。

### Gate D — 有用功率归因

必须能够单独得到：

\[
U_{\rm patch}
\quad\text{或最终}\quad
U_{\rm workpiece}.
\]

只有：

\[
U_{\rm useful}
\approx\kappa_i
\]

才有资格称为 extraction 达标。

---

## 9. 如果把当前 6.78% through 误用于级联会发生什么

仅作为数量级说明，若三块前级都保留：

\[
T\approx0.0678,
\]

那么三次传播后的功率比例为：

\[
T^3
\approx
(0.0678)^3
\approx3.1\times10^{-4}.
\]

也就是约：

\[
0.031\%.
\]

对应约：

\[
10\log_{10}(3.1\times10^{-4})
\approx-35\ \mathrm{dB}.
\]

所以这种功率流绝不可能支持当前 A→B→C→D 的 Zone 架构。

这不是说真实 B/C 一定与 A 相同，而是说明：

\[
\boxed{
\text{当前 Full V2 的 through 数量级与级联架构根本不相容}
}
\]

---

## 10. 对 5–8 W/板目标的含义

当前 reduced-order nominal 工作点：

\[
32\ \mathrm W
\rightarrow
(7.92,5.08,5.08,7.92)\ \mathrm W
\]

只是 accepted-RF / field-aware synthesis seed。

若将当前 screen 的二端口残余错误地当成“有用取能”，A 板会看起来获得：

\[
32\times0.913\approx29.2\ \mathrm W,
\]

这显然与目标：

\[
7.92\ \mathrm W
\]

不是同一个物理量。

因此文档中所有“extraction”必须明确属于以下哪一种：

1. T-cell branch power；
2. Patch accepted RF power；
3. Patch radiation；
4. 工件 absorbed RF power；
5. 热功率/温升。

这些量以后不得混写。

---

## 11. 当前可以保留的理论与必须推迟的结论

### 可以保留

- 100-cell 普通 FR4 连续长链不可行；
- multi-Zone 架构；
- loss-aware recursion；
- T-cell 反综合公式；
- few-mode mirror-even field target；
- coupon 级 T-cell topology 已有可信 full-wave 支撑。

### 必须推迟

- Full V2 已“screen passed”的功能性表述；
- 当前 Full V2 已实现 24.76% A-stage extraction；
- 91% non-through 是 Patch 有用功率；
- 当前单板已经支持 5–8 W/board；
- 当前四板 Zone 已接近可验证状态。

---

## 12. 当前最短数学—物理闭环

当前研发顺序应改成：

\[
\boxed{
\text{port/launch reference}
\rightarrow
\text{explicit power decomposition}
\rightarrow
\text{Patch accepted power}
\rightarrow
\text{loaded Patch }R+jX
\rightarrow
\text{re-synthesize }\kappa_i
\rightarrow
\text{A/B/C/D}
\rightarrow
\text{4-board loaded Zone}
}
\]

关键不是继续追求更低的 S11，而是让每一级满足：

\[
\boxed{
R_i+T_i+U_i+L_i=1
}
\]

并且：

\[
\boxed{
U_i\text{ 有明确物理定义和可测/可积的功率通道}
}
\]

这才是从“看起来匹配”走向“可以加热且可以级联”的必要条件。
