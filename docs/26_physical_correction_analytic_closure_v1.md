# 物理修正量的解析闭合 V1

> 目的：在进入下一轮 full-wave 之前，把 1–80 块系统中仍未闭合的物理修正量全部写成可计算的解析模型、预算不等式和 design gate。
>
> 本文不替代 HFSS/openEMS。它的目标是把仿真的职责从“重新发现系统架构”压缩为“校准少数物理参数”。

---

## 1. 首先修正一个系统级逻辑：固定无源 PCB 不能实现 board-count-adaptive taper

在线性无源网络中，如果几何、材料和负载状态不变，端口波满足：

\[
\mathbf b = S \mathbf a.
\]

把输入功率整体乘一个比例，只会把所有波幅整体按平方根比例缩放，不会改变归一化功率分配比例。

因此，如果 A/B/C/D 铜结构固定，则：

\[
\frac{P_A}{P_B},\quad
\frac{P_B}{P_C},\quad
\frac{P_C}{P_D}
\]

不能仅靠“磁控管根据板数调总功率”自动改变。

所以此前定义的：

\[
q^*(N)
\]

只有在存在以下机制之一时才是可实现的：

1. 可调/开关耦合器；
2. PIN/MEMS/机械 RF switching；
3. 可变匹配网络；
4. 不同板数使用不同 A/B/C/D 硬件版本；
5. 外部分配网络主动改变各板激励。

如果系统要求同一套纯无源 PCB 覆盖 1–80 块，则必须采用一个固定的功率分配基线。

---

## 2. 80 块端点强迫 universal passive baseline 为 equal-power

80 块时硬要求：

\[
P_i\ge5\ {\rm W},
\qquad i=1,\ldots,80.
\]

而当前端到板 useful RF 预算为：

\[
P_{\rm useful,budget}=400\ {\rm W}.
\]

于是：

\[
\sum_{i=1}^{80}P_i\ge400\ {\rm W}.
\]

若仍希望系统在 400 W useful budget 内闭合，则只能取等号：

\[
\boxed{
P_1=P_2=\cdots=P_{80}=5\ {\rm W}.
}
\]

所以在 80 块 endpoint：

\[
\boxed{
q=P_{\rm inner}/P_{\rm outer}=1.
}
\]

任何固定的 outer-strong taper，例如：

\[
q=0.6412,
\]

都会要求 outer board 大于 5 W，从而使总 useful RF 超过 400 W。

事实上若 inner=5 W 且 \(q=0.6412\)，则：

\[
P_{\rm outer}
=
\frac{5}{0.6412}
\approx7.80\ {\rm W},
\]

四板平均约：

\[
6.40\ {\rm W}.
\]

80 块总 useful RF：

\[
80\times6.40
\approx512\ {\rm W},
\]

即使系统零损耗也超过 500 W 源上限。

因此：

\[
\boxed{
\text{field-aware taper 是低板数/可重构优化模式，}
}
\]

而：

\[
\boxed{
\text{equal-power 是 1–80 通用无源硬件的唯一闭合基线。}
}
\]

---

## 3. 任意 1–80 块的统一 equal-power Zone 模型

定义每个 local Zone 最多四板：

\[
A\to B\to C\to D_{\rm term}.
\]

总板数：

\[
\boxed{
N=4M+r,\qquad
r\in\{0,1,2,3\}.
}
\]

设每块目标 accepted RF power 为：

\[
E.
\]

设相邻取能级之间的寄生功率传输效率为：

\[
\tau
=
10^{-L_{\rm cell}/10}.
\]

定义：

\[
\boxed{
A_m(\tau)
=
\sum_{k=0}^{m-1}\tau^{-k},
\qquad
A_0=0.
}
\]

则一个 \(m\)-board partial Zone 的入口功率为：

\[
\boxed{
P_{\rm zone}^{(m)}
=
E A_m(\tau).
}
\]

完整四板 Zone：

\[
P_{\rm zone}^{(4)}
=
E A_4.
\]

整个 N-board 系统所有 Zone 入口所需总功率为：

\[
\boxed{
P_{\rm zones}(N,E)
=
E\left[
M A_4+A_r
\right].
}
\]

定义：

\[
\boxed{
C_N(\tau)
=
M A_4+A_r.
}
\]

于是：

\[
P_{\rm zones}=E C_N.
\]

---

## 4. 固定硬件的 extraction coefficients

一个 \(m\)-board Zone 从 terminal 向前递推：

\[
P_m=E,
\]

\[
P_i
=
E+\frac{P_{i+1}}{\tau}.
\]

所以：

\[
P_i
=
E A_{m-i+1}.
\]

因此：

\[
\boxed{
\kappa_i
=
\frac{E}{P_i}
=
\frac1{A_{m-i+1}}.
}
\]

关键结论：

\[
\boxed{
\kappa_i
\text{ 与绝对功率 }E\text{ 无关。}
}
\]

所以只要 \(\tau\) 固定，一套 A/B/C/D 被动硬件可以从 5 W/板缩放到 8 W/板，而不需要改变耦合比例。

对当前：

\[
L_{\rm cell}=0.42\ {\rm dB},
\]

有：

\[
\tau=0.9078205,
\]

得到完整四板：

\[
\boxed{
\kappa_A=21.498\%,
}
\]

\[
\boxed{
\kappa_B=30.167\%,
}
\]

\[
\boxed{
\kappa_C=47.584\%,
}
\]

\[
\kappa_D=100\%.
\]

这组 equal-power κ 应重新成为 universal passive baseline。

---

## 5. 任意 N 的系统效率闭式

定义一个 partial Zone 的 useful extraction efficiency：

\[
\eta_m
=
\frac{mE}{EA_m}
=
\frac{m}{A_m}.
\]

整个 N-board Zone 集合：

\[
\boxed{
\eta_{\rm zones}(N)
=
\frac{N}{C_N(\tau)}.
}
\]

对 \(N=4M\)：

\[
\eta_{\rm zones}
=
\frac4{A_4}
\equiv
\eta_4.
\]

由于 1/2/3-board partial Zone 的损耗链更短，完整四板 Zone 是保守 worst case。

当前 \(L_{\rm cell}=0.42\) dB：

\[
A_4=4.65152,
\]

\[
\boxed{
\eta_4
=
85.993\%.
}
\]

---

## 6. 上游网络进入同一个公式

把：

- 输入同轴；
- WR340→coax adapter；
- distribution manifold；
- 平面/直角/跨区 bridge；
- 其它上游连接器；

统一压缩成 worst-path insertion loss：

\[
L_{\rm up}.
\]

对应：

\[
\eta_{\rm up}
=
10^{-L_{\rm up}/10}.
\]

源功率需求：

\[
\boxed{
P_{\rm src}
=
\frac{
E C_N(\tau)
}{
\eta_{\rm up}
}
=
E C_N(\tau)
10^{L_{\rm up}/10}.
}
\]

于是给定 500 W 源后，每块允许的最大 accepted RF 是：

\[
\boxed{
E_{\max}(N)
=
\frac{
500\eta_{\rm up}
}{
C_N(\tau)
}.
}
\]

真正闭合的控制律应该是：

\[
\boxed{
E_{\rm cmd}(N)
=
\min\left(
6.5,\;
E_{\max}(N)
\right),
}
\]

同时必须检查：

\[
\boxed{
E_{\rm cmd}(N)\ge5.
}
\]

这比简单使用：

\[
400/N
\]

更完整，因为它显式包含了真实链路损耗。

---

## 7. 80 块的总损耗闭合不等式

80 块：

\[
M=20,\qquad r=0.
\]

要求：

\[
E=5\ {\rm W}.
\]

于是：

\[
P_{\rm src}
=
100 A_4
10^{L_{\rm up}/10}.
\]

500 W gate：

\[
100 A_4
10^{L_{\rm up}/10}
\le500.
\]

即：

\[
\boxed{
A_4
10^{L_{\rm up}/10}
\le5.
}
\]

等价地：

\[
\boxed{
\eta_4\eta_{\rm up}
\ge0.80.
}
\]

定义 Zone equivalent loss：

\[
L_{\rm zone}
=
-10\log_{10}\eta_4.
\]

则：

\[
\boxed{
L_{\rm zone}
+
L_{\rm up}
\le
-10\log_{10}(0.8)
=
0.9691\ {\rm dB}.
}
\]

这是 80-board 系统最重要的理论预算式。

---

## 8. cell loss 与 upstream loss 的精确 trade-off

对不同 \(L_{\rm cell}\)：

| \(L_{\rm cell}\) | \(\eta_4\) | \(L_{\rm up,max}\) for 80×5 W |
|---:|---:|---:|
| 0.30 dB | 89.89% | 0.506 dB |
| 0.32 dB | 89.23% | 0.474 dB |
| 0.35 dB | 88.25% | 0.426 dB |
| 0.36 dB | 87.93% | 0.410 dB |
| 0.38 dB | 87.28% | 0.378 dB |
| 0.40 dB | 86.64% | 0.346 dB |
| 0.42 dB | 85.99% | 0.314 dB |

对于小损耗，还可得到非常有用的一阶式：

\[
\boxed{
L_{\rm zone}
\approx
1.5 L_{\rm cell}.
}
\]

所以：

\[
\boxed{
L_{\rm up}
+
1.5L_{\rm cell}
\lesssim
0.969\ {\rm dB}.
}
\]

这可以直接用于早期设计预算。

---

## 9. 一个重要结论：5 m ≤0.5 dB 与当前 0.42 dB/cell 不能同时支持 80 块

若 5 m 输入线本身已经：

\[
L_{\rm cable}=0.5\ {\rm dB},
\]

则：

\[
L_{\rm up}\ge0.5\ {\rm dB}.
\]

但当前 \(L_{\rm cell}=0.42\) dB 时：

\[
L_{\rm up,max}=0.314\ {\rm dB}.
\]

所以：

\[
\boxed{
0.5>0.314,
}
\]

80×5 W 无法闭合。

即使忽略 adapter、manifold、bridge，0.5 dB cable 也已经超过剩余预算。

若坚持：

\[
L_{\rm cable}=0.5\ {\rm dB},
\]

则理论上要求：

\[
\boxed{
L_{\rm cell}\lesssim0.304\ {\rm dB}
}
\]

才勉强达到 80-board 零额外上游损耗边界。

所以 80-board 设计必须在下面两条路线中至少选一条：

### 路线 A：继续普通 FR4 cell

若实际：

\[
L_{\rm cell}\approx0.35\text{–}0.42\ {\rm dB},
\]

则整个：

\[
\text{cable + adapter + manifold + bridge}
\]

必须压到约：

\[
0.31\text{–}0.43\ {\rm dB}.
\]

### 路线 B：保留 5 m≈0.5 dB 线缆目标

则 local RF cell 必须显著降损：

\[
L_{\rm cell}\lesssim0.30\ {\rm dB},
\]

而且还需要继续给 adapter/manifold 留余量，实际设计目标应低于 0.30 dB。

---

## 10. PP + FR4 主线的损耗解析模型

微带可写成每单位长度：

\[
R',L',G',C'.
\]

低损耗条件：

\[
R'\ll\omega L',
\qquad
G'\ll\omega C'.
\]

传播常数：

\[
\gamma
=
\alpha+j\beta
\approx
\alpha_c+\alpha_d+j\beta.
\]

其中：

\[
\boxed{
\beta
\approx
\omega\sqrt{L'C'}
=
k_0\sqrt{\varepsilon_{\rm eff}}.
}
\]

介质损耗用 electric-energy participation 表示：

\[
\boxed{
\tan\delta_{\rm eff}
=
\sum_j p_j\tan\delta_j,
\qquad
\sum_jp_j=1.
}
\]

于是：

\[
\boxed{
\alpha_d
\approx
\frac{\beta}{2}
\tan\delta_{\rm eff}.
}
\]

导体损耗：

\[
\boxed{
\alpha_c
\approx
\frac{R'}{2Z_0}.
}
\]

其中：

\[
R'
\]

由铜表面电阻、strip/ground current-return geometry 和 roughness correction 决定。

---

## 11. PP-corrected 传播常数可以先解析闭合

当前 quasi-static 模型：

\[
\varepsilon_{\rm eff,air}
\approx3.25.
\]

定义：

\[
q
=
\frac{
\varepsilon_{\rm eff,air}-1
}{
\varepsilon_{\rm FR4}-1
}
\approx0.682.
\]

2 mm PP participation 参数：

\[
0.6\le\xi\le1.0.
\]

则：

\[
\varepsilon_{\rm eff}
\approx
3.25
+
\xi(1-q)(2.2-1).
\]

得到：

\[
\boxed{
3.48
\lesssim
\varepsilon_{\rm eff}
\lesssim
3.63.
}
\]

中心：

\[
\varepsilon_{\rm eff}\approx3.555.
\]

所以 2.45 GHz：

\[
\boxed{
\beta
\approx96.8\ {\rm rad/m}.
}
\]

phase per mm：

\[
\boxed{
5.55^\circ/{\rm mm}.
}
\]

理论范围约：

\[
\boxed{
5.49\text{–}5.61^\circ/{\rm mm}.
}
\]

因此 50 Ω quarter-wave：

\[
\boxed{
L_{\lambda/4}
\approx16.22\ {\rm mm},
}
\]

理论范围约：

\[
16.05\text{–}16.40\ {\rm mm}.
\]

所以 \(\beta\) 已经可以在 full-wave 前压缩到约 ±1.1% 的解析范围。

---

## 12. PP 对介质损耗也有有利影响

用 quasi-static participation 中心近似：

\[
p_{\rm FR4}\approx0.682,
\]

\[
p_{\rm PP}\approx0.255,
\]

\[
p_{\rm air}\approx0.064.
\]

取：

\[
\tan\delta_{\rm FR4}=0.02,
\]

\[
\tan\delta_{\rm PP}=0.0005.
\]

则：

\[
\tan\delta_{\rm eff}
\approx
0.682(0.02)
+
0.255(0.0005)
\approx0.01376.
\]

于是 50 mm 线段 dielectric loss 一阶约：

\[
\boxed{
L_d(50{\rm mm})
\approx0.29\ {\rm dB}.
}
\]

再加铜损/roughness 后，合理解析范围大约：

\[
\boxed{
L_{\rm line}(50{\rm mm})
\sim0.33\text{–}0.43\ {\rm dB}.
}
\]

因此旧的：

\[
0.42\ {\rm dB/cell}
\]

可看成偏保守的一阶上侧值，而不是必须固定的常数。

这也说明 80-board 是否能闭合，对真实 PP 场参与和 copper roughness 非常敏感。

---

## 13. 磁吸触点的 lumped two-port 闭合

把一个短磁吸 RF 接口写成：

\[
Z_s
=
R_c+j\omega L_c,
\]

以及一个等效 shunt：

\[
Y_p
=
G_p+j\omega C_p.
\]

在：

\[
|Z_s|\ll Z_0,
\qquad
|Y_pZ_0|\ll1
\]

时，一阶有：

\[
\boxed{
\Gamma_c
\approx
\frac12
\left(
\frac{Z_s}{Z_0}
-
Y_pZ_0
\right).
}
\]

dissipative insertion loss：

\[
\boxed{
IL_{c,\rm diss}
\approx
4.343
\left(
\frac{R_c}{Z_0}
+
G_pZ_0
\right)
\ {\rm dB}.
}
\]

因此 contact 的损耗与失配可以被分开：

- \(R_c,G_p\)：真正耗散；
- \(L_c,C_p\)：主要造成反射/相位。

---

## 14. contact 的数量级 gate

2.45 GHz：

\[
\omega
\approx1.539\times10^{10}\ {\rm rad/s}.
\]

若要求单接口：

\[
|\Gamma_c|\le0.10
\]

（约 RL≥20 dB），且只考虑 series inductance，则：

\[
\frac{\omega L_c}{2Z_0}\le0.1,
\]

所以：

\[
\boxed{
L_c\lesssim0.65\ {\rm nH}.
}
\]

若只考虑 shunt capacitance：

\[
\frac{\omega C_pZ_0}{2}\le0.1,
\]

得到：

\[
\boxed{
C_p\lesssim0.26\ {\rm pF}.
}
\]

若希望 RL≥26 dB，即：

\[
|\Gamma_c|\lesssim0.05,
\]

则近似要求：

\[
L_c\lesssim0.325\ {\rm nH},
\]

\[
C_p\lesssim0.13\ {\rm pF}.
\]

实际磁吸接口可以利用 series L 与 shunt C 的部分补偿，但必须检查整个 2.40–2.50 GHz 频带，而不能只在单频点抵消。

---

## 15. contact 电阻预算

如果：

\[
L_{\rm cell,max}
=
0.476\ {\rm dB}
\]

且 line 已经占：

\[
0.42\ {\rm dB},
\]

则所有 contact + junction + extra discontinuity 只剩约：

\[
0.056\ {\rm dB}.
\]

若极端地全部给一个 series contact resistor：

\[
4.343\frac{R_c}{50}
\le0.056,
\]

则：

\[
\boxed{
R_c
\lesssim0.64\ \Omega.
}
\]

更合理的 preferred target 是把 contact 本身压到：

\[
IL_c\lesssim0.02\ {\rm dB},
\]

对应：

\[
\boxed{
R_{c,\rm eff}
\lesssim0.23\ \Omega
}
\]

数量级，从而给 T-junction、铜粗糙度和其它不连续继续留余量。

---

## 16. 5 mm 磁吸 interface 的相位已经可以解析闭合

当前 5 mm physical bridge 目标相位约：

\[
\phi_b\approx19^\circ.
\]

于是：

\[
\beta_b
=
\frac{19^\circ\pi/180}{5{\rm mm}}
\approx66.3\ {\rm rad/m}.
\]

与：

\[
k_0\approx51.35\ {\rm rad/m}
\]

比较，phase-equivalent：

\[
\boxed{
\varepsilon_{\rm eff,bridge}
\approx
\left(
\frac{\beta_b}{k_0}
\right)^2
\approx1.67.
}
\]

这与旧文档得到的：

\[
1.55\text{–}1.80
\]

一致。

因此磁吸接口在理论上可以统一成：

\[
\boxed{
\text{phase-equivalent TL}
+
(R_c,L_c,C_p,G_p)
}
\]

的二端口，而不再把它误认为 5 mm FR4 微带。

---

## 17. 100 mm 平面桥的材料损耗条件

现有普通 FR4 dielectric-loss 一阶值：

\[
L_{d,\rm FR4}
\approx0.725\ {\rm dB/100mm}
\]

对应：

\[
\tan\delta\approx0.02.
\]

100 mm conductor loss 的一阶平滑铜数量级约：

\[
L_c\approx0.078\ {\rm dB},
\]

实际 roughness 会更高。

若要求：

\[
IL_{\rm planar}\le0.2\ {\rm dB},
\]

即使完全不预留 contact/discontinuity，只允许 dielectric：

\[
0.2-0.078
=
0.122\ {\rm dB}.
\]

按介质损耗近似随 \(\tan\delta\) 线性：

\[
\boxed{
\tan\delta
\lesssim
0.02
\frac{0.122}{0.725}
\approx0.0034.
}
\]

如果再给磁吸触点和 transition 预留：

\[
0.04\ {\rm dB},
\]

则：

\[
\boxed{
\tan\delta
\lesssim0.0023.
}
\]

所以原：

\[
\text{100 mm普通FR4}\le0.2\ {\rm dB}
\]

的真正理论修正版应是：

\[
\boxed{
\text{100 mm低损耗RF基材}
\quad
\tan\delta\sim0.002\text{–}0.003
}
\]

数量级。

---

## 18. 立体直角桥 ≤0.3 dB 的理论条件

若路径仍约 100 mm，且给：

- conductor 约 0.078 dB；
- bend/contact/discontinuity 预留约 0.08 dB；

则 dielectric budget：

\[
0.3-0.078-0.08
=
0.142\ {\rm dB}.
\]

得到：

\[
\boxed{
\tan\delta
\lesssim
0.02
\frac{0.142}{0.725}
\approx0.0039.
}
\]

因此：

\[
\boxed{
\tan\delta\lesssim0.004
}
\]

是直角桥保留 ≤0.3 dB 目标时合理的材料级理论 gate。

---

## 19. loaded radiator 的并联谐振闭合

把 loaded Patch/Spiral 在主谐振附近写成：

\[
Y_L
=
G_L+jB_L.
\]

定义：

\[
R_r=\frac1{G_L}.
\]

对低阶并联谐振器：

\[
\boxed{
\frac{B_L}{G_L}
=
b(f)
=
Q_L
\left(
\frac{f}{f_r}
-
\frac{f_r}{f}
\right).
}
\]

于是：

\[
Z_L
=
\frac{R_r}{1+jb}
=
\frac{
R_r(1-jb)
}{
1+b^2
}.
\]

所以：

\[
\boxed{
\frac{X_L}{R_L}
=
-b.
}
\]

这直接闭合了此前独立使用的：

\[
R+jX
\]

模型与 loaded-Q / resonance-detuning 模型。

---

## 20. loaded radiator 的 phase gate

如果希望 branch local phase error：

\[
|\phi_{\rm err}|
\lesssim5^\circ,
\]

则：

\[
\boxed{
|X_L/R_L|
=
|b|
\lesssim
\tan5^\circ
\approx0.0875.
}
\]

近谐振：

\[
b
\approx
2Q_L
\frac{\Delta f}{f_r}.
\]

所以：

\[
\boxed{
\left|
\frac{\Delta f}{f_r}
\right|
\lesssim
\frac{0.0875}{2Q_L}.
}
\]

2.45 GHz 下：

| \(Q_L\) | 为保持约 ±5° phase error 的 \(|\Delta f|\) |
|---:|---:|
| 5 | 21.4 MHz |
| 10 | 10.7 MHz |
| 20 | 5.36 MHz |
| 30 | 3.57 MHz |

因此：

\[
\boxed{
\text{loaded resonance 的中心频率校准比 100 MHz nominal band 更严格。}
}
\]

这不表示整个 2.40–2.50 GHz 必须维持 ±5°，而表示 heating-field phase synthesis 应在实际 magnetron operating frequency 附近完成。

---

## 21. loaded resistance 的 reflection gate

若：

\[
X_L=0,
\]

且要求：

\[
|\Gamma_L|\le0.10,
\]

则：

\[
\left|
\frac{R_L-50}{R_L+50}
\right|
\le0.10.
\]

得到：

\[
\boxed{
40.9\ \Omega
\lesssim
R_L
\lesssim
61.1\ \Omega.
}
\]

若允许：

\[
|\Gamma_L|\le0.20,
\]

则：

\[
\boxed{
33.3\ \Omega
\lesssim
R_L
\lesssim
75.0\ \Omega.
}
\]

因此此前 T-cell 采用 40–60 Ω loaded resistance sensitivity range 有明确的 reflection-theory 支持。

---

## 22. 工件 loading efficiency 的低阶闭合

loaded radiator 总 conductance：

\[
G_{\rm tot}
=
G_{\rm rad}
+
G_{\rm FR4}
+
G_{\rm Cu}
+
G_{\rm work}.
\]

accepted RF 进入工件的比例：

\[
\boxed{
\eta_{\rm work}
=
\frac{
G_{\rm work}
}{
G_{\rm tot}
}.
}
\]

定义 parasitic/background：

\[
G_0
=
G_{\rm rad}
+
G_{\rm FR4}
+
G_{\rm Cu}.
\]

则：

\[
\eta_{\rm work}
=
\frac{
G_{\rm work}
}{
G_0+G_{\rm work}
}.
\]

因此若想要：

\[
\eta_{\rm work}\ge\eta_*,
\]

必须：

\[
\boxed{
\frac{G_{\rm work}}{G_0}
\ge
\frac{\eta_*}{1-\eta_*}.
}
\]

例如：

| target \(\eta_{\rm work}\) | required \(G_{\rm work}/G_0\) |
|---:|---:|
| 50% | ≥1 |
| 70% | ≥2.33 |
| 80% | ≥4 |

所以：

\[
S_{11}
\]

不能作为加热效率的替代指标。

---

## 23. 工件 gap 的理论作用继续保留

dominant-mode 空气衰减：

\[
\alpha_{\rm air}
\approx90\ {\rm m^{-1}}.
\]

near-field power scale：

\[
\boxed{
P_{\rm coupled}
\propto
e^{-2\alpha_{\rm air}g}.
}
\]

因此 gap 每增加：

\[
10\ {\rm mm},
\]

该 dominant near-field power channel 约乘：

\[
e^{-1.8}
\approx0.165.
\]

所以实际：

- PP 厚度；
- air gap；
- workpiece flatness；

会直接改变：

\[
G_{\rm work},
\quad
B_{\rm work},
\quad
R_L+jX_L.
\]

这些属于系统一级物理参数，不是小公差。

---

## 24. 为什么 80-board baseline 不应使用额外 15–17 mm FR4 phase section

当前普通 FR4 loss baseline：

\[
0.42\ {\rm dB}/50{\rm mm}.
\]

额外：

\[
16\ {\rm mm}
\]

线路的简单损耗尺度已经约：

\[
0.42
\frac{16}{50}
\approx0.134\ {\rm dB}.
\]

如果每个 cell 都增加类似 phase section，则：

\[
L_{\rm cell}
\]

会从约：

\[
0.42
\]

上升到：

\[
0.55\text{–}0.57\ {\rm dB},
\]

明显超过 80-board power budget 可接受范围。

因此 universal 1–80 baseline 应：

\[
\boxed{
\text{优先使用 natural low-loss network phase，}
}
\]

而不是为了低板数 field-shaping 在每个 cell 增加长 FR4 delay。

field-aware phase trim 只适合：

1. 低板数功率余量充足的工作模式；
2. external low-loss phase network；
3. 可切换 phase path；
4. 更低损耗 RF substrate。

---

## 25. 平面桥、直角桥、线缆必须进入同一个 worst-path budget

对某个 Zone 的最坏上游路径：

\[
\boxed{
L_{\rm up}
=
L_{\rm cable}
+
L_{\rm adapter}
+
n_pL_{\rm planar}
+
n_rL_{\rm corner}
+
L_{\rm manifold}
+
L_{\rm conn}.
}
\]

它必须满足第 8 节的：

\[
L_{\rm up}
\le
L_{\rm up,max}(L_{\rm cell}).
\]

所以不能分别说：

- cable ≤0.5 dB；
- planar bridge ≤0.2 dB；
- corner ≤0.3 dB；

然后默认它们可以全部串起来。

系统验收必须检查：

\[
\boxed{
\text{同一 worst RF path 的总和。}
}
\]

---

## 26. 对当前需求参数的最终理论分类

### 可以直接保留

\[
f_0=2.45\ {\rm GHz}
\]

\[
2.40\text{–}2.50\ {\rm GHz}
\]

\[
Z_0=50\ \Omega
\]

\[
1\le N\le80
\]

\[
5\le P_i\le8\ {\rm W}
\]

\[
\delta_P\le25\%
\]

50×50 mm mechanical board gate。

### 必须使用解析修正版

- main-line width：由 PP-corrected \(Z(W)\) 求，不冻结 2 mm；
- \(\beta\)：约 5.49–5.61°/mm；
- cell loss：不固定 0.42，使用理论/仿真校准；
- contact：用 \(R,L,C,G\) lumped model；
- bridge：用 S-parameter block + material-loss gate；
- loaded radiator：用 \(R_r,Q_L,f_r,G_{\rm work}\)；
- source command：用 \(E C_N/\eta_{\rm up}\)。

### 不能继续作为 universal baseline

- fixed outer-strong field taper；
- 每个 cell 的 15–17 mm FR4 phase delay；
- 80 块连续普通 FR4 长链；
- 把多个 bridge/cable loss 分别验收而不做 path sum；
- RG142 与 5 m ≤0.5 dB 同时无条件冻结；
- 普通 FR4 100 mm 与 0.2/0.3 dB 同时无条件冻结。

---

## 27. 理论已经闭合后的 full-wave 输入/输出

下一轮 full-wave 不再搜索架构，只需要标定：

\[
\boxed{
L_{\rm cell}(f),
}
\]

\[
\boxed{
R_c,L_c,C_p,G_p,
}
\]

\[
\boxed{
S_{\rm bridge}(f),
}
\]

\[
\boxed{
R_r,Q_L,f_r,
}
\]

\[
\boxed{
G_{\rm work},B_{\rm work},
}
\]

以及：

\[
\boxed{
\beta(f).
}
\]

这些数值代回：

\[
A_m(\tau),
\quad
\kappa_i,
\quad
C_N,
\quad
E_{\max}(N),
\quad
P_{\rm src}(N)
\]

即可完成 1–80 块系统级预测。

因此当前架构层面的理论链已经变成：

\[
\boxed{
\text{materials/geometry}
\to
(R',L',G',C')
\to
(\alpha,\beta)
\to
S_{\rm cell}
\to
A_m,\kappa_i
\to
C_N
\to
P_{\rm src}
}
\]

以及独立的 heating branch：

\[
\boxed{
\text{PP/gap/workpiece}
\to
G_{\rm work}+jB_{\rm work}
\to
R_L+jX_L
\to
\eta_{\rm work}.
}
\]

这两条链最后通过 accepted RF power 汇合。

---

## 28. 当前最重要的设计结论

### 结论 1

1–80 通用纯无源方案的 power baseline 应回到：

\[
\boxed{
\text{equal accepted RF power per board}.
}
\]

### 结论 2

当前 0.42 dB/cell 下，80×5 W 要求：

\[
\boxed{
L_{\rm up}\le0.314\ {\rm dB}.
}
\]

所以原 5 m≤0.5 dB 的上游线缆指标仍然过松，不能与当前 cell loss 同时闭合。

### 结论 3

若希望保留约 0.5 dB upstream loss，则必须：

\[
\boxed{
L_{\rm cell}\lesssim0.30\ {\rm dB}
}
\]

且实际还需更低，以给 adapter/manifold/bridge 留余量。

### 结论 4

PP-corrected theory 给出的主线 loss 可能低于旧 0.42 dB，但普通 FR4 是否能稳定进入 ≤0.30–0.35 dB/cell，仍是下一轮最关键的材料/几何问题。

### 结论 5

因此现在最值得优化的不是 field taper，而是：

\[
\boxed{
\text{loss budget first}
\rightarrow
\text{equal-power extraction}
\rightarrow
\text{loaded-radiator efficiency}
\rightarrow
\text{optional field shaping}.
}
\]

这是下一版 PCB 参数设计的正确优先顺序。
