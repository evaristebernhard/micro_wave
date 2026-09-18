# C 耦合相位与 D 终端相位闭合 V1

> 目的：在全波仿真之前，把 A/B/C/D 四板 Zone 的第一版复激励全部闭合到一个可制造的解析 seed，并把结果落实到 PCB 几何。

---

## 1. 相位约定

对 A/B/C 的 quarter-wave / quadrature coupler，预仿真统一采用：

\[
\boxed{\alpha_A\approx\alpha_B\approx\alpha_C\approx-90^\circ}
\]

即 Patch 支路取 lagging quadrature port。

这样做的目的不是宣称真实 coupler 必然精确为 -90°，而是给所有 A/B/C 使用同一个 reference-plane convention。后续 HFSS 只需把真实 \(\alpha_i\) 回填。

C 若采用 3 dB branch-line hybrid，应选择 port orientation，使 Patch 端在中心频率附近保持同样的 -90° branch-phase convention。

---

## 2. A/B/C 第一版解析复激励

采用：

\[
\varepsilon_{\rm eff}=3.25,
\qquad
\lambda_g=67.88\ {\rm mm},
\]

\[
\beta\approx5.3035^\circ/{\rm mm},
\qquad
\theta_h\approx94.81^\circ.
\]

当前 coupled-line center 到 Patch inset reference 的基础路径近似：

\[
L_A=15.65\ {\rm mm},
\]

\[
L_B=15.90\ {\rm mm},
\]

\[
L_C=16.05\ {\rm mm}.
\]

加入当前 phase trim：

\[
\Delta L_A=0,
\quad
\Delta L_B=0.66\ {\rm mm},
\quad
\Delta L_C=1.41\ {\rm mm},
\]

则相邻 Patch progression 一阶为：

\[
\psi_{AB}
\approx
94.81^\circ
-\beta[(15.90+0.66)-15.65]
\approx89.98^\circ,
\]

\[
\psi_{BC}
\approx
94.81^\circ
-\beta[(16.05+1.41)-(15.90+0.66)]
\approx90.04^\circ.
\]

因此 A/B/C 已经得到：

\[
\boxed{
\psi_{AB}\approx90^\circ,
\qquad
\psi_{BC}\approx90^\circ.
}
\]

在上述相位约定下，以 A 输入相位为 0，可得到一组等价 Patch phase：

\[
\boxed{
(\phi_A,\phi_B,\phi_C)
\approx
(187.00^\circ,276.98^\circ,7.02^\circ).
}
\]

全局常相位没有物理重要性；重要的是相邻差接近 90°。

---

## 3. D 不能直接复制 A/B/C 的局部 feed

D 是 direct-fed terminal radiator：

\[
\alpha_D\approx0^\circ.
\]

而 C 的 Patch 支路采用：

\[
\alpha_C\approx-90^\circ.
\]

因此 C→D 多出了约 90° 的 topology phase difference。

要求：

\[
\phi_D-\phi_C
=
90^\circ,
\]

有：

\[
\theta_C
+\alpha_D-\alpha_C
-\beta(L_D-L_C^{\rm eff})
=
90^\circ.
\]

所以：

\[
\boxed{
L_D
=
L_C^{\rm eff}
+
\frac{\theta_C+\alpha_D-\alpha_C-90^\circ}{\beta}.
}
\]

其中：

\[
L_C^{\rm eff}
=
16.05+1.41
=
17.46\ {\rm mm}.
\]

代入：

\[
L_D
\approx
17.46
+
\frac{94.81+90-90}{5.3035}
\]

得到：

\[
\boxed{
L_D\approx35.34\ {\rm mm}.
}
\]

---

## 4. 原 D 直角路径为什么要改

原 D 路径近似为：

\[
22.5\ {\rm mm}
+
19.25\ {\rm mm}
=
41.75\ {\rm mm}.
\]

相对目标：

\[
41.75-35.34
\approx
\boxed{6.41\ {\rm mm}}
\]

过长。

如果直接保留原直角路径，D 会相对目标额外产生约：

\[
6.41\times5.3035^\circ
\approx
34.0^\circ
\]

相位滞后。

因此 D 不能继续使用原正交 feed。

---

## 5. D 的可制造 phase-route seed

保持 RF input contact：

\[
P_0=(-22.5,-18.0)\ {\rm mm},
\]

Patch inset bottom：

\[
P_2=(0,-9.25)\ {\rm mm}.
\]

设计：

### 第一段

沿 x 水平走：

\[
\boxed{7.29\ {\rm mm}}
\]

到：

\[
P_1\approx(-15.21,-18.0)\ {\rm mm}.
\]

### 第二段

从 \(P_1\) 斜走到 \(P_2\)：

\[
\boxed{L_{\rm diag}\approx17.55\ {\rm mm}}
\]

角度：

\[
\boxed{\theta_{\rm diag}\approx29.91^\circ}.
\]

### 第三段

保留原 inset 深度：

\[
\boxed{10.5\ {\rm mm}}.
\]

总路径：

\[
7.29+17.55+10.5
\approx
\boxed{35.34\ {\rm mm}}.
\]

因此 D 不需要 meander，只需把原 90° 大拐角改成一段斜向 feed。

---

## 6. D 修改后的理论相位

D 输入相位相对 A 输入约：

\[
\Phi_D
=
3\times94.81^\circ
=
284.43^\circ.
\]

所以：

\[
\phi_D
\approx
284.43^\circ
-
5.3035^\circ/{\rm mm}\times35.34\ {\rm mm}
\approx
97.0^\circ.
\]

而：

\[
\phi_C\approx7.02^\circ.
\]

因此：

\[
\boxed{
\phi_D-\phi_C\approx90.0^\circ.
}
\]

于是完整四板第一版解析 phase seed 为：

\[
\boxed{
(\phi_A,\phi_B,\phi_C,\phi_D)
\sim
(187^\circ,277^\circ,7^\circ,97^\circ)
}
\]

等价地减去全局 187°：

\[
\boxed{
(0^\circ,90^\circ,180^\circ,270^\circ).
}
\]

这说明目前已经得到一个完整的 +90° progressive-mode PCB seed，而不是只解决 A/B/C。

---

## 7. A/B/C phase trim 的铜实现

为了不改变：

- coupler gap；
- coupler length；
- Patch inset depth；

当前 B/C 的 phase trim 不通过改 coupler，而是在 coupled-line 与 Patch bottom 之间的空白区增加一个短 V-shaped transition。

### B

基础上升高度约：

\[3.95\ {\rm mm}.\]

目标路径：

\[3.95+0.66=4.61\ {\rm mm}.\]

采用两个等长斜段，每段：

\[2.305\ {\rm mm},\]

横向峰值偏移约：

\[\boxed{1.19\ {\rm mm}}.\]

### C

基础上升高度约：

\[4.10\ {\rm mm}.\]

目标路径：

\[4.10+1.41=5.51\ {\rm mm}.\]

两个等长斜段，每段：

\[2.755\ {\rm mm},\]

峰值横向偏移约：

\[\boxed{1.84\ {\rm mm}}.\]

两者都位于 Patch 下缘之外，不需要改变 inset 本身。

---

## 8. 当前 PCB 的设计状态

现在 PCB 已经不只是 coupling-magnitude geometry。

第一版解析 geometry 同时包含：

\[
\boxed{
\text{A/B/C amplitude taper}
+
\text{A/B/C fine phase trim}
+
\text{D terminal phase route}
}
\]

具体 seed：

| Board | Amplitude seed | Phase implementation |
|---|---:|---|
| A | 6.5 dB | 0 mm trim |
| B | 5.0 dB | +0.66 mm V-feed trim |
| C | 3.0 dB | +1.41 mm V-feed trim; lagging quadrature port |
| D | terminal | 35.34 mm total phase-route |

因此当前 PCB 已经形成一版完整的 complex-taper seed。

---

## 9. 后续 HFSS 只需要校正哪些量

下一轮不再从零找结构，而是校正：

\[
\varepsilon_{\rm eff},
\quad
\alpha_A,\alpha_B,\alpha_C,
\quad
\theta_A,\theta_B,\theta_C,
\quad
\phi_D,
\]

以及：

\[
Q^{(k)}.
\]

如果真实相位与当前 seed 差 \(\delta\phi\)，对应一阶线长修正仍可直接用：

\[
\boxed{
\delta L
\approx
\frac{\delta\phi}{5.30^\circ/{\rm mm}}.
}
\]

因此当前设计不是等待仿真，而是已经给 HFSS 一个明确且可制造的近似起点。