# Few-mode 分层谱模型与鲁棒四板参数综合 V1

> 目标：把 docs/21 的自由空间四点模型与 docs/22 的单一 TM10 分层负载模型统一起来，形成一个仍可解析/快速计算、但已经包含 Patch 有限宽度、PP、空气间隙、有损工件和有限吸收厚度的 few-mode reduced-order model。然后直接用它反推出下一版 A/B/C/D 的幅度、相位、T-cell 阻抗和 phase-section 参数。
>
> 本文仍然不是最终全波验收结果。它的作用是把下一轮 PCB 设计中心从“经验 seed”推进到“鲁棒优化 seed”。

---

## 1. 模型升级：从单一 \(k_t\) 到少量 \(k_x\) 谱模态

当前 Patch：

\[
W_p=37.5\ \mathrm{mm},
\qquad
L_p=28.5\ \mathrm{mm}.
\]

TM10 沿 Patch 长度方向的 dominant transverse wavenumber 继续取：

\[
\boxed{
k_y\approx\frac{\pi}{L_{\mathrm{eff}}},
\qquad
L_{\mathrm{eff}}\approx30.3\ \mathrm{mm}.
}
\]

沿四板排列方向 \(x\)，Patch 有有限宽度 \(W_p\)，所以不能再只用 \(k_x=0\)。

把该方向上的 aperture spectrum 一阶近似为：

\[
\boxed{
A(k_x)
=
\operatorname{sinc}
\left(
\frac{k_xW_p}{2}
\right).
}
\]

于是每一个谱模态的总横向波数：

\[
\boxed{
k_t^2
=
k_x^2+k_y^2.
}
\]

这就是当前 few-mode model 相比 docs/22 的主要升级。

---

## 2. 每个谱模态都经过同一个分层介质网络

对第 \(n\) 个 \(k_{x,n}\)：

\[
k_{z,j,n}
=
\sqrt{
\varepsilon_{r,j}k_0^2
-k_{x,n}^2
-k_y^2
}.
\]

TM modal impedance：

\[
Z_{j,n}^{\mathrm{TM}}
=
\frac{
k_{z,j,n}
}{
\omega\varepsilon_j
}.
\]

PP 和 air-gap 分别用标准 transmission matrix：

\[
M_j
=
\begin{pmatrix}
\cos k_z t & j Z_j\sin k_z t\\
j Z_j^{-1}\sin k_z t & \cos k_z t
\end{pmatrix}.
\]

工件作为 complex semi-infinite load：

\[
Z_{w,n}^{\mathrm{TM}}.
\]

因此：

\[
M_n
=
M_{\mathrm{PP},n}
M_{\mathrm{air},n},
\]

并得到该谱模态从 Patch 平面到工件表面的 transmission factor：

\[
\boxed{
T_n
=
\frac1{
(M_n)_{11}
+
(M_n)_{12}/Z_{w,n}^{\mathrm{TM}}
}.
}
\]

进入工件后再乘：

\[
e^{-jk_{z,w,n}z}.
\]

所以 material loading、gap 和吸收深度全部进入同一个低阶模型。

---

## 3. 单块 Patch 的 lateral field kernel

四块 Patch 沿 \(x\) 排列。

设某块 Patch 中心为 \(x_i\)，评价点为 \(x\)，则 lateral offset：

\[
\Delta x=x-x_i.
\]

利用谱的偶对称性：

\[
\boxed{
K(\Delta x,z)
\approx
2\sum_{n=1}^{N_m}
w_n
A(k_{x,n})
T_n
\cos(k_{x,n}\Delta x)
e^{-jk_{z,w,n}z}.
}
\]

其中：

- \(w_n\)：Gauss–Legendre quadrature weight；
- \(N_m\)：保留的谱模态数。

本轮采用：

\[
\boxed{
0\le k_x\le400\ \mathrm{m^{-1}}.
}
\]

原因是当前：

\[
\frac{2\pi}{W_p}
\approx167.6\ \mathrm{m^{-1}},
\]

400 m\(^{-1}\) 已覆盖 aperture spectrum 的前几个主要 lobe，而更高 \(k_x\) 又会被 PP + air-gap 强烈 evanescent 衰减。

---

## 4. 四块场由一个小矩阵完成

四块中心：

\[
x_i
=
(-75,-25,25,75)\ \mathrm{mm}.
\]

复激励：

\[
\mathbf u
=
(u_A,u_B,u_C,u_D)^T.
\]

工件中的标量 reduced-order 场：

\[
\boxed{
E(x,z)
=
\sum_{i=1}^{4}
u_i
K(x-x_i,z).
}
\]

把工件横向分成四个 50 mm cell，并对 cell \(m\) 的工件体积积分：

\[
H_m
\propto
\int_{\Omega_m}
\varepsilon_w''
|E|^2\,dV.
\]

因此重新得到：

\[
\boxed{
H_m
=
\mathbf u^\dagger Q_m\mathbf u.
}
\]

与 full-wave Q-matrix 方法相同，但当前的 \(Q_m\) 是由 few-mode layered spectral model 直接构造，不需要先跑 HFSS。

---

## 5. 模型降维：只搜索 mirror-even 子空间

若四板几何、工件和目标都关于中心镜像对称，则第一版直接限制：

\[
\boxed{
\mathbf u
=
(a,b,b,a)^T.
}
\]

取 \(a=1\) 为全局参考，定义：

\[
\boxed{
r
=
\frac ba
=
\rho e^{j\phi}.
}
\]

因此整个四板场优化只剩两个实自由度：

\[
\boxed{
\rho,\phi.
}
\]

这比直接优化八个幅相变量更适合当前理论阶段。

---

## 6. 鲁棒工况集合

当前需求尚未冻结真实工件，因此不对单一材料“过拟合”。

采用仓库现有代表范围：

\[
\varepsilon_r'
\in
\{5,10,20\},
\]

\[
\tan\delta
\in
\{0.1,0.2,0.4\},
\]

\[
g_{\mathrm{air}}
\in
\{5,10,20\}\ \mathrm{mm},
\]

并额外把有限工件吸收厚度取：

\[
t_w
\in
\{10,20,40\}\ \mathrm{mm}.
\]

因此一共：

\[
\boxed{
3^4=81
}
\]

个代表工况。

这不是说真实产品会同时覆盖全部范围，而是用来避免下一版 PCB seed 对某一个假设工件极端敏感。

---

## 7. 优化目标

对每个场景 \(s\)，mirror symmetry 下定义：

\[
H_{\mathrm{outer},s}
=
\frac{H_A+H_D}{2},
\]

\[
H_{\mathrm{inner},s}
=
\frac{H_B+H_C}{2}.
\]

功率不均匀度：

\[
\Delta_s
=
10\log_{10}
\frac{
H_{\mathrm{inner},s}
}{
H_{\mathrm{outer},s}
}.
\]

严格 robust-minimax 问题：

\[
\boxed{
\min_{\rho,\phi}
\max_s
|\Delta_s|.
}
\]

同时固定总激励尺度：

\[
\|\mathbf u\|_2^2=4,
\]

所以不同 taper 的总输入波功率可直接比较。

---

## 8. 谱模态收敛

对全部 81 个代表工况，分别用 20、24、30 个 \(k_x\) quadrature modes 求 robust-minimax optimum。

| modes | \(\rho^*\) | \(\phi^*\) | worst imbalance |
|---:|---:|---:|---:|
| 20 | 0.7965 | −16.35° | 0.719 dB |
| 24 | 0.7986 | −16.24° | 0.715 dB |
| 30 | 0.7984 | −16.24° | 0.717 dB |

因此：

\[
\boxed{
N_m\approx20
}
\]

已经足够作为下一轮快速 reduced-order model。

更重要的是：

\[
\boxed{
\rho\approx0.80
}
\]

这一结论对谱截断非常稳定。

---

## 9. 严格均匀性最优解

81 工况 minimax 解约为：

\[
\boxed{
r_{\mathrm{minimax}}
=
0.799
e^{-j16.2^\circ}.
}
\]

即：

\[
\boxed{
\mathbf u_{\mathrm{minimax}}
\propto
(
1,\;
0.799e^{-j16.2^\circ},\;
0.799e^{-j16.2^\circ},\;
1
).
}
\]

对应最坏 inner/outer 加热不均匀：

\[
\boxed{
|\Delta_s|_{\max}
\approx0.715\ \mathrm{dB}.
}
\]

与 equal excitation 相比：

\[
(1,1,1,1),
\]

后者在同一 81 工况集合上的最坏不均匀约：

\[
\boxed{
1.79\ \mathrm{dB}.
}
\]

所以 layered few-mode model 明确支持：

\[
\boxed{
\text{外侧 A/D 比内侧 B/C 激励更强}
}
\]

而不是旧 30 mm free-space point model 得到的“内板略强”。

这并不矛盾，因为现在优化的是：

\[
\boxed{
\text{有限工件体积吸收均匀性}
}
\]

而不是空气平面上的四点场值。

---

## 10. 为什么不直接采用严格 minimax 点

严格 minimax 会牺牲一部分总工件场能量。

归一化到 equal-excitation：

\[
\eta_{\mathrm{rel,avg}}
\approx0.962,
\]

最差场景约：

\[
\eta_{\mathrm{rel,min}}
\approx0.943.
\]

也就是说，为了把 worst imbalance 从 1.79 dB 压到 0.715 dB，需要牺牲约几个百分点的平均 absorbed-field surrogate。

这并不大，但工程上可以做一个更合适的 Pareto 选择。

---

## 11. 推荐工程 Pareto 点

增加约束：

\[
\boxed{
|\Delta_s|\le0.75\ \mathrm{dB}
\quad
\forall s
}
\]

然后最大化 81 工况平均的 absorbed-field surrogate。

得到：

\[
\boxed{
r_{\mathrm{design}}
=
0.801
e^{-j5.30^\circ}.
}
\]

即推荐下一版：

\[
\boxed{
\mathbf u_{\mathrm{design}}
\propto
(
1,\;
0.801e^{-j5.3^\circ},\;
0.801e^{-j5.3^\circ},\;
1
).
}
\]

其性质：

\[
\boxed{
|\Delta_s|_{\max}
\approx0.75\ \mathrm{dB},
}
\]

平均 absorbed-field surrogate 相对 equal excitation：

\[
\boxed{
\eta_{\mathrm{rel,avg}}
\approx96.9\%.
}
\]

最差场景仍约：

\[
\boxed{
\eta_{\mathrm{rel,min}}
\approx95.4\%.
}
\]

因此它只用约 3% 的平均场能量代价，就把 worst-case 均匀性从 1.79 dB 改善到约 0.75 dB。

当前更推荐这个点，而不是严格 minimax。

---

## 12. 对应的目标 RF 功率 taper

推荐幅度比：

\[
\rho=0.80076.
\]

所以目标 accepted RF power 比例：

\[
e_i
\propto
|u_i|^2
\]

给出：

\[
\boxed{
(e_A,e_B,e_C,e_D)
\propto
(
1,\;
0.6412,\;
0.6412,\;
1
).
}
\]

这说明下一版不再采用 equal-RF-power：

\[
1:1:1:1.
\]

而建议：

\[
\boxed{
A:D
\text{ 为高功率外板，}
B:C
\text{ 为较低功率内板。}
}
\]

---

## 13. 一个非常有利的 5–8 W/板结果

客户原目标范围：

\[
5\text{–}8\ \mathrm{W/board}.
\]

若仍希望四板平均约：

\[
6.5\ \mathrm{W},
\]

则总 accepted RF：

\[
26\ \mathrm{W}.
\]

按：

\[
1:0.6412:0.6412:1
\]

缩放，得到：

\[
\boxed{
P_A=P_D\approx7.92\ \mathrm{W},
}
\]

\[
\boxed{
P_B=P_C\approx5.08\ \mathrm{W}.
}
\]

所以：

\[
\boxed{
(7.92,\ 5.08,\ 5.08,\ 7.92)\ \mathrm{W}
}
\]

恰好四块都落在原始：

\[
5\text{–}8\ \mathrm{W}
\]

范围内。

更一般地，为了同时满足：

\[
P_{\mathrm{outer}}\le8\ \mathrm W
\]

与：

\[
P_{\mathrm{inner}}\ge5\ \mathrm W,
\]

outer board 目标必须落在：

\[
7.80\text{–}8.00\ \mathrm W.
\]

对应四板平均：

\[
\boxed{
6.40\text{–}6.56\ \mathrm{W/board}.
}
\]

因此：

\[
\boxed{
6.5\ \mathrm{W/board}
}
\]

恰好是当前 robust field-aware taper 与客户 5–8 W 区间都比较协调的系统工作点。

---

## 14. 推荐相位目标

取 A 为 0° reference：

\[
\boxed{
\phi_A=0^\circ,
}
\]

\[
\boxed{
\phi_B=\phi_C=-5.30^\circ,
}
\]

\[
\boxed{
\phi_D=0^\circ.
}
\]

因此相邻 Patch phase increments：

\[
\boxed{
\Delta\phi_{AB}=-5.30^\circ,
}
\]

\[
\boxed{
\Delta\phi_{BC}=0^\circ,
}
\]

\[
\boxed{
\Delta\phi_{CD}=+5.30^\circ.
}
\]

这基本是一个：

\[
\boxed{
\text{near-in-phase mirror mode}
}
\]

而不是 travelling-wave mode。

---

## 15. 从天然 +90° network phase 反推 phase section

当前 T-cell/network-native progression 近似：

\[
+90^\circ.
\]

增加传输线会增加 phase lag。

为了达到：

\[
(-5.30^\circ,\ 0^\circ,\ +5.30^\circ),
\]

三段需要附加 lag：

\[
95.30^\circ,\quad
90.00^\circ,\quad
84.70^\circ.
\]

仍用当前：

\[
\lambda_g\approx67.88\ \mathrm{mm},
\]

则：

\[
1\ \mathrm{mm}
\approx5.30^\circ.
\]

对应额外等效 50 Ω phase length：

\[
\boxed{
L_{\phi,AB}\approx17.97\ \mathrm{mm},
}
\]

\[
\boxed{
L_{\phi,BC}\approx16.97\ \mathrm{mm},
}
\]

\[
\boxed{
L_{\phi,CD}\approx15.97\ \mathrm{mm}.
}
\]

非常接近：

\[
\boxed{
\lambda_g/4
+
(1,\ 0,\ -1)\ \mathrm{mm}.
}
\]

因此下一版 phase network 可以围绕一个统一 quarter-wave section 做 ±1 mm 级微调，而不是设计几十毫米差异很大的 meander。

---

## 16. phase section loss 反馈后的 \(\tau_i\)

继续采用当前 FR4 一阶损耗：

\[
0.42\ \mathrm{dB}/50\ \mathrm{mm}.
\]

phase section 增加后，三段总 cell loss 约：

\[
\boxed{
L_A=0.571\ \mathrm{dB},
}
\]

\[
\boxed{
L_B=0.563\ \mathrm{dB},
}
\]

\[
\boxed{
L_C=0.554\ \mathrm{dB}.
}
\]

因此：

\[
\boxed{
\tau_A\approx0.8768,
\quad
\tau_B\approx0.8785,
\quad
\tau_C\approx0.8802.
}
\]

这个 loss gradient 很小，但应反馈回 power synthesis。

---

## 17. field-aware A/B/C extraction targets

对：

\[
(e_A,e_B,e_C,e_D)
=
(1,\ 0.6412,\ 0.6412,\ 1)
\]

以及上面的：

\[
\tau_A,\tau_B,\tau_C,
\]

递推：

\[
P_4=e_D,
\]

\[
P_i
=
e_i+\frac{P_{i+1}}{\tau_i},
\]

得到：

\[
(P_A,P_B,P_C,P_D)
\approx
(4.0386,\ 2.6643,\ 1.7773,\ 1).
\]

所以：

\[
\boxed{
\kappa_A\approx24.76\%,
}
\]

\[
\boxed{
\kappa_B\approx24.07\%,
}
\]

\[
\boxed{
\kappa_C\approx36.08\%.
}
\]

对应 coupling：

\[
\boxed{
6.06\ \mathrm{dB},
\quad
6.19\ \mathrm{dB},
\quad
4.43\ \mathrm{dB}.
}
\]

这是当前模型对旧：

\[
21.5\%,30.2\%,47.6\%
\]

equal-power seed 的重要更新。

注意现在 A/B 不再需要明显不同的强弱等级。

---

## 18. 6.5 W/板平均工作点对应 Zone input

第 13 节中：

\[
P_A^{\mathrm{patch}}
=
P_D^{\mathrm{patch}}
\approx7.921\ \mathrm W,
\]

\[
P_B^{\mathrm{patch}}
=
P_C^{\mathrm{patch}}
\approx5.079\ \mathrm W.
\]

使用第 17 节的 loss-aware power recursion，得到 Zone input 约：

\[
\boxed{
P_{\mathrm{Zone,in}}
\approx31.99\ \mathrm W.
}
\]

所以当前推荐的 nominal 4-board Zone 可以写成：

\[
\boxed{
32\ \mathrm W
\rightarrow
(7.9,\ 5.1,\ 5.1,\ 7.9)\ \mathrm W
}
\]

的 field-aware RF distribution seed。

---

## 19. 推荐 T-cell target impedances

仍先以：

\[
R_L=50\ \Omega
\]

作为 resonant Patch reference。

公式：

\[
Z_t
=
50\sqrt{1-\kappa},
\]

\[
Z_b
=
50\sqrt{
\frac{1-\kappa}{\kappa}
}.
\]

得到：

| Board | \(\kappa\) | \(Z_t\) | \(Z_b\) |
|---|---:|---:|---:|
| A | 0.2476 | 43.37 Ω | 87.16 Ω |
| B | 0.2407 | 43.57 Ω | 88.81 Ω |
| C | 0.3608 | 39.98 Ω | 66.55 Ω |

因此当前 field-aware T-cell 反而比之前 95 Ω / 76 Ω / 52 Ω 的 branch range 更集中。

---

## 20. 裸 FR4 Hammerstad 几何 seed

注意：下面只是：

\[
\varepsilon_r=4.3,
\quad
h=1.6\ \mathrm{mm}
\]

裸 FR4 的几何 seed。

真实 2 mm PP superstrate 下必须重新解实际 \(Z_c(W)\) 和 \(\beta(W)\)。

一阶 Hammerstad 反解：

| Board/section | target Z | width seed | quarter-wave seed |
|---|---:|---:|---:|
| A series | 43.37 Ω | 3.92 mm | 16.75 mm |
| B series | 43.57 Ω | 3.89 mm | 16.76 mm |
| C series | 39.98 Ω | 4.43 mm | 16.66 mm |
| A branch | 87.16 Ω | 1.04 mm | 17.59 mm |
| B branch | 88.81 Ω | 0.99 mm | 17.61 mm |
| C branch | 66.55 Ω | 1.86 mm | 17.27 mm |

所以当前推荐结构仍然全部处于普通 PCB 可制造尺寸。

---

## 21. Patch 宽度灵敏度

在 reduced-order field model 中，把：

\[
W_p=35,\ 37.5,\ 39\ \mathrm{mm}
\]

分别重新优化，robust optimum 的 \(\rho\) 只从约：

\[
0.804
\rightarrow
0.792
\]

缓慢变化，worst imbalance 约：

\[
0.72\ \mathrm{dB}
\]

量级。

因此当前没有理论理由为了 field uniformity 大改：

\[
\boxed{
W_p=37.5\ \mathrm{mm}.
}
\]

宽度仍优先由 Patch resonance、input resistance 和实际 finite-ground 条件校正，而不是拿来承担四板 taper 功能。

---

## 22. 当前不建议仅靠本模型改 \(L_p\)

改变 \(L_p\) 会同时改变：

- TM10 resonance；
- \(k_y\)；
- PP/workpiece loading threshold；
- loaded \(R+jX\)。

当前 few-mode model 还没有绝对 modal coupling factor 去精确闭合 loaded resonance。

因此：

\[
\boxed{
L_p=28.5\ \mathrm{mm}
}
\]

暂时继续保留。

下一步应该先用 loaded-resonance perturbation / calibrated modal admittance 求：

\[
L_p
\rightarrow
f_{r,\mathrm{loaded}},
\]

再决定是否需要毫米级修改。

这比仅根据均匀性优化 \(L_p\) 更物理。

---

## 23. 下一版 PCB 推荐参数中心

当前理论建议下一版 PCB 从下面的参数中心出发：

### Patch

\[
\boxed{
W_p=37.5\ \mathrm{mm},
\quad
L_p=28.5\ \mathrm{mm},
\quad
y_{\mathrm{inset}}=10.5\ \mathrm{mm}.
}
\]

### Field taper

\[
\boxed{
\mathbf u
\propto
(
1,\;
0.801e^{-j5.3^\circ},\;
0.801e^{-j5.3^\circ},\;
1
).
}
\]

### RF accepted-power target

\[
\boxed{
P_A:P_B:P_C:P_D
=
1:0.641:0.641:1.
}
\]

Nominal 6.5 W/board average：

\[
\boxed{
7.92:\ 5.08:\ 5.08:\ 7.92\ \mathrm W.
}
\]

### T-cell extraction

\[
\boxed{
\kappa_A=24.76\%,
\quad
\kappa_B=24.07\%,
\quad
\kappa_C=36.08\%.
}
\]

### T-cell impedance targets

\[
\boxed{
Z_{t,A/B/C}
=
43.37,\ 43.57,\ 39.98\ \Omega,
}
\]

\[
\boxed{
Z_{b,A/B/C}
=
87.16,\ 88.81,\ 66.55\ \Omega.
}
\]

### Additional phase sections

\[
\boxed{
L_{\phi,AB/BC/CD}
=
17.97,\ 16.97,\ 15.97\ \mathrm{mm}
}
\]

as the current equivalent-50-Ω electrical-length seed.

---

## 24. 这组参数的正确使用方式

这些参数现在已经足以服务下一轮 PCB 设计，但仍不应直接当成 manufacturing freeze。

正确顺序是：

\[
\boxed{
\text{few-mode robust synthesis}
\rightarrow
\text{PCB geometry seed}
\rightarrow
\text{single-cell full-wave calibration}
\rightarrow
\text{4-board validation}.
}
\]

下一轮 full-wave 不应该再次盲扫所有变量。

只需要校正：

1. 真实 PP+FR4 stack 下的 \(Z_t,Z_b\) 对应线宽；
2. loaded Patch 的 \(R_L+jX_L\)；
3. actual guided phase per mm；
4. magnetic interface phase/loss；
5. few-mode model 未包含的 mutual coupling / vector polarization。

如果这些校正不大，则当前参数可以直接作为下一版设计中心。

---

## 25. 当前结论

升级到 few-mode layered spectral model 后，当前最有价值的设计更新是：

\[
\boxed{
\text{equal-RF-power}
\rightarrow
\text{outer-strong mirror taper}
}
\]

以及：

\[
\boxed{
\text{fixed +90° travelling phase}
\rightarrow
\text{near-in-phase mirror phase}.
}
\]

推荐工程 seed：

\[
\boxed{
\mathbf u
\propto
(
1,\;
0.801e^{-j5.3^\circ},\;
0.801e^{-j5.3^\circ},\;
1
)
}
\]

并对应：

\[
\boxed{
(\kappa_A,\kappa_B,\kappa_C)
\approx
(0.2476,\ 0.2407,\ 0.3608).
}
\]

这组结果已经可以直接用于下一版 A/B/C/D PCB 参数设计，而不需要先做大范围 full-wave blind sweep。
