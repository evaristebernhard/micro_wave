# Loaded Patch 与四板近场解析综合 V1

> 目标：继续沿“理论先行、仿真校正”的路线，把两个目前最关键的问题先解析化：
>
> 1. 前方工件如何改变 Patch 的谐振频率、Q 与输入阻抗；
> 2. A→B→C→D 四块 Patch 在对称近场加热目标下，是否真的应该采用 0/90/180/270° travelling-wave 相位。
>
> 本文不把下面的零阶模型写成最终全波结论。它的作用是先确定下一轮 PCB 的合理参数结构和搜索中心，使 HFSS/openEMS 只负责修正系数，而不是从零寻找拓扑。

---

## 1. Patch 裸板尺寸仍然是合理解析基线

当前矩形 Patch：

[
W_p=37.5 {m mm},qquad L_p=28.5 {m mm}.
]

对

[
f_0=2.45 {m GHz},qquad
arepsilon_r=4.3,qquad
h=1.6 {m mm},
]

经典矩形 Patch 一阶模型给出：

[
W_p
approx
rac{c}{2f_0}
sqrt{rac{2}{arepsilon_r+1}}
approx37.6 {m mm},
]

并得到裸 FR4 + 空气物理长度约

[
L_papprox29.1 {m mm}.
]

所以当前 37.5×28.5 mm 并不是依赖仿真得到的偶然尺寸，而是已经接近 TM10 腔体模型的解析解。2 mm PP superstrate 与工件加载会进一步提高边缘场的等效介电加载，使实际最优长度相对 29.1 mm 略短是合理方向。

因此当前理论基线仍保留：

[
oxed{
W_papprox37.5 {m mm},qquad
L_papprox28.5 {m mm}.
}
]

---

## 2. 工件加载对谐振频率的方向可以先由变分原理确定

把 Patch 的 TM10 模式近似看成开放谐振腔的主模。对固定金属边界的理想化本征问题，

[

abla	imesmu^{-1}
abla	imes mathbf E
=
omega^2arepsilonmathbf E,
]

Rayleigh quotient 为

[
omega^2
=
rac{
int mu^{-1}|
abla	imesmathbf E|^2,dV
}{
int arepsilon|mathbf E|^2,dV
}.
]

因此在强电场区域加入更高的正实部介电常数，会增大分母，并使主谐振频率向下移动。

所以即使不做全波仿真，也可以先确定：

[
oxed{
arepsilon'_{m work}>arepsilon'_{m background}
quadLongrightarrowquad
f_{r,m loaded}<f_{r,m unloaded}
}
]

作为第一阶设计方向。

对真实开放 Patch，这不是严格封闭腔定理，但对 TM10 主模的加载方向仍是可靠的一阶物理判据。

这意味着如果典型工件距离较近，最终 PCB 有可能需要设计成：

[
oxed{
f_{r,m unloaded}>2.45 {m GHz}
}
]

使其在典型工件加载后回落到约 2.45 GHz，而不是盲目要求空载恰好 2.45 GHz。

---

## 3. 一阶频移公式

定义未加载参考场 (mathbf E_0)，以及电介质扰动区域 (Omega_w)。

对小扰动，

[
rac{Delta f}{f_0}
approx
-rac12
rac{
int_{Omega_w}
Deltaarepsilon,|mathbf E_0|^2,dV
}{
int_{Omega}
arepsilon,|mathbf E_0|^2,dV
}.
]

定义归一化电场填充系数

[
F_w
=
rac{
int_{Omega_w}
arepsilon_0|mathbf E_0|^2,dV
}{
int_{Omega}
arepsilon|mathbf E_0|^2,dV
},
]

则若背景相对介电常数为 (arepsilon_{b,r})，工件实部为 (arepsilon'_{w,r})，

[
oxed{
rac{Delta f}{f_0}
approx
-rac12
left(
arepsilon'_{w,r}-arepsilon_{b,r}
ight)
F_w.
}
]

这里最大的未知量不是公式本身，而是：

[
oxed{F_w(d,t,	ext{geometry})}.
]

下一节可以先用 TM10 的近场衰减估计它对距离的量级变化。

---

## 4. TM10 主空间谐波给出约 11 mm 的场幅衰减长度

Patch 长度方向的主空间波数数量级：

[
k_tapproxrac{pi}{L_{m eff}}.
]

取：

[
L_{m eff}approx30.0sim30.6 {m mm},
]

有：

[
k_tapprox103sim105 {m m^{-1}}.
]

2.45 GHz 自由空间：

[
k_0=rac{2pi}{lambda_0}
approx51.35 {m m^{-1}}.
]

由于：

[
k_t>k_0,
]

该主 fringing-field 空间谐波在法向包含明显 evanescent 分量，其衰减常数量级：

[
alpha_z
=
sqrt{k_t^2-k_0^2}
approx
89sim93 {m m^{-1}}.
]

所以场幅近似：

[
|E(z)|propto e^{-alpha_z z},
]

电场能量密度近似：

[
|E(z)|^2propto e^{-2alpha_z z}.
]

于是：

[
oxed{
L_{E,m amp}sim11 {m mm},
qquad
L_{E,m energy}sim5.5 {m mm}.
}
]

这是非常重要的单板尺度：典型工件从 5 mm 移到 20–30 mm，Patch 所受到的介质加载会快速减弱。

---

## 5. 工件距离的零阶加载因子

若只保留上面的主 evanescent 谐波，可写几何加载因子：

[
G(d,t)
=
e^{-2alpha_z d}
left(
1-e^{-2alpha_z t}
ight),
]

其中：

- (d)：Patch/前盖到工件起始面的等效间距；
- (t)：工件有效厚度。

若先只比较半无限工件的距离因子：

[
G_d=e^{-2alpha_z d},
]

取 (alpha_z=90 {m m^{-1}})，得到：

| 距离 d | 相对电场能量加载因子 |
|---:|---:|
| 5 mm | 0.407 |
| 10 mm | 0.165 |
| 20 mm | 0.0273 |
| 30 mm | 0.00452 |

因此：

[
oxed{
5	ext{–}10 {m mm}
}
]

是明显强加载区域；

[
oxed{
20 {m mm}
}
]

以后主 fringing-field 加载已快速降低；

而 30 mm 更适合作为场评价平面，不能自动等同于最强工件耦合位置。

这个结论也说明“工件距离”应成为比继续盲扫 Patch 长度更优先的系统输入。

---

## 6. 工件损耗对 Q 的一阶影响

设工件复介电常数：

[
arepsilon_w
=
arepsilon'_w-jarepsilon''_w,
qquad
	andelta_w
=
rac{arepsilon''_w}{arepsilon'_w}.
]

定义 loaded field 的工件电场能量填充比例：

[
p_w
=
rac{
int_{Omega_w}
arepsilon'_w |mathbf E|^2,dV
}{
int_{Omega}
arepsilon' |mathbf E|^2,dV
}.
]

则工件介质损耗对品质因数的一阶贡献为：

[
oxed{
rac1{Q_{m work}}
approx
p_w	andelta_w.
}
]

整个 loaded Patch 可写成：

[
oxed{
rac1{Q_L}
=
rac1{Q_{m rad}}
+
rac1{Q_{m FR4}}
+
rac1{Q_{m Cu}}
+
rac1{Q_{m work}}.
}
]

这里有一个工程上非常重要的区别：

- (Q_{m work}) 降低代表更多功率进入工件，是潜在“有用加载”；
- (Q_{m FR4})、(Q_{m Cu}) 降低代表寄生损耗。

因此不能只追求更低的 (Q_L) 或更宽的 S11 带宽。

真正应该最大化的是：

[
oxed{
eta_{m work}
=
rac{P_{m abs,work}}
{P_{m accepted}}
}
]

而不是单独最小化 S11。

---

## 7. 四板近场模型先利用镜像对称性降维

四块 Patch 中心设为：

[
x=
(-75,-25,25,75) {m mm}.
]

假设工件/评价区域关于 Zone 中心镜像对称。

那么第一版理论搜索没有必要从任意四个复数激励开始。对称目标下更自然的零阶子空间是：

[
oxed{
mathbf u
=
(a,b,b,a)^T.
}
]

这与当前 travelling-wave seed：

[
(1,j,-1,-j)^T
]

有本质区别。

后者本身打破左右镜像相位对称，因此只能作为“网络天然容易实现的 travelling mode”，不能再作为均匀加热的默认场目标。

---

## 8. 自由空间 Green 核的四点近场模型

先把每块 Patch 降阶为相同等效辐射源。

在距离 (d) 的四个板中心正前方取四个评价点。

定义：

[
R_{mn}
=
sqrt{
d^2+(m-n)^2s^2
},
qquad
s=50 {m mm},
]

以及零阶标量 Green 核：

[
g_n
=
rac{
e^{-jk_0sqrt{d^2+n^2s^2}}
}{
sqrt{d^2+n^2s^2}
}.
]

于是四点场满足：

[
mathbf E
=
Gmathbf u.
]

由于 Toeplitz + mirror symmetry，令

[
mathbf u=(a,b,b,a)^T
]

并要求四个评价点复场相等，只需要满足 edge point 与 inner point 相等。

直接消元得到：

[
oxed{
rac{b}{a}
=
rac{
g_0+g_3-g_1-g_2
}{
g_0-g_2
}.
}
]

这是一个完全解析的两参数 mirror-taper seed。

---

## 9. 对不同评价距离得到的理论 taper

代入：

[
f_0=2.45 {m GHz},
qquad
s=50 {m mm},
]

得到：

| d | (|b/a|) | (arg(b/a)) | inner/outer power |
|---:|---:|---:|---:|
| 5 mm | 1.081 | +2.46° | 1.168 |
| 10 mm | 1.134 | +6.46° | 1.285 |
| 20 mm | 1.157 | +15.00° | 1.339 |
| 30 mm | 1.130 | +21.81° | 1.277 |

所以在 30 mm 零阶模型下：

[
oxed{
mathbf u_{m field,30}
propto
left(
1,;
1.130e^{j21.81^circ},;
1.130e^{j21.81^circ},;
1
ight)^T.
}
]

这不是最终全波答案，但它给出了比 0/90/180/270° 更符合镜像对称加热目标的解析 seed。

它意味着：

1. 外侧 A/D Patch 相位相同；
2. 内侧 B/C Patch 相位相同；
3. B/C 幅度略高于 A/D；
4. 所需相位差只有几十度，而不是连续 +90° travelling-wave。

---

## 10. 为什么 +90° 不应该继续作为默认 heating phase

仍使用同一个四点 Green 模型，比较等幅 canonical modes 的四点功率均匀性。

以最大相对平均偏差：

[
U_infty
=
max_i
left|
rac{P_i}{ar P}-1
ight|
]

作为零阶指标。

得到：

### d = 20 mm

- 0° progression：(U_inftyapprox3.35%)
- +90° progression：(U_inftyapprox61.9%)
- 180° progression：(U_inftyapprox27.1%)

### d = 30 mm

- 0° progression：(U_inftyapprox12.4%)
- +90° progression：(U_inftyapprox85.3%)
- 180° progression：(U_inftyapprox42.5%)

这些数字不是实物验收数据，因为模型没有包含：

- Patch aperture pattern；
- PP；
- 工件复介电常数；
- mutual coupling；
- vector polarization；
- finite workpiece volume。

但它们足以推翻一个设计逻辑：

[
oxed{
	ext{“+90° 很容易实现”}

otRightarrow
	ext{“+90° 就应当作为最终加热目标”}.
}
]

因此 +90° 从现在起只保留为 network-native mode / comparison mode。

---

## 11. 把 field taper 直接反推回 A/B/C 分功比例

这是本轮最重要的闭合。

设目标 Patch 复激励：

[
mathbf u_*=(u_A,u_B,u_C,u_D)^T.
]

若四块 Patch 的局部 accepted-wave 标定一致，则目标 RF 抽取功率比例可取：

[
e_i
propto
|u_i|^2.
]

对任意 amplitude taper，不再要求每块 (E) 相同，而使用：

[
P_4=e_4,
]

[
oxed{
P_i
=
e_i
+
rac{P_{i+1}}{	au_i}.
}
]

于是：

[
oxed{
kappa_i
=
rac{e_i}{P_i}.
}
]

这把“场综合”与“T-cell 功率综合”直接连起来。

所以 docs/19 的 equal-power 递推只是：

[
e_A=e_B=e_C=e_D
]

的特殊情况。

---

## 12. 30 mm mirror-taper 对应的新 A/B/C seed

对 30 mm Green 模型：

[
|b/a|=1.13003,
]

因此若外板归一化功率为 1：

[
(e_A,e_B,e_C,e_D)
=
(1, 1.27696, 1.27696, 1).
]

先仍采用统一：

[
	au=10^{-0.42/10}=0.9078205,
]

递推得到：

[
oxed{
kappa_A=0.18894,
qquad
kappa_B=0.32768,
qquad
kappa_C=0.53688.
}
]

对应 coupling：

[
oxed{
7.237 {m dB},
qquad
4.845 {m dB},
qquad
2.701 {m dB}.
}
]

与 equal-RF-power baseline：

[
21.50%, 30.17%, 47.58%
]

相比，场均匀化 seed 的趋势是：

[
oxed{
A	ext{ 更弱},
quad
B	ext{ 略强},
quad
C	ext{ 更强}.
}
]

这不是因为链路理论改变了，而是因为目标 Patch amplitude 已经不再等幅。

---

## 13. 对应的 matched T-cell 阻抗仍然完全可实现

若先取 resonant Patch：

[
R_L=50 Omega,
]

则使用：

[
Z_t=50sqrt{1-kappa},
]

[
Z_b=50sqrt{rac{1-kappa}{kappa}}.
]

对上面的 30 mm field-aware seed：

| Board | κ | (Z_t) | (Z_b) |
|---|---:|---:|---:|
| A | 0.18894 | 45.03 Ω | 103.59 Ω |
| B | 0.32768 | 41.00 Ω | 71.62 Ω |
| C | 0.53688 | 34.03 Ω | 46.44 Ω |

所以 field-aware taper 并没有把 T-cell 推入不可制造阻抗区。

反而 C 的 branch impedance 更接近普通 50 Ω 微带。

---

## 14. 相位综合可以围绕“近 0° mirror mode”而不是 +90° mode

30 mm mirror target 相邻 Patch phase increment 为：

[
oxed{
Deltaphi_{AB}=+21.81^circ,
}
]

[
oxed{
Deltaphi_{BC}=0^circ,
}
]

[
oxed{
Deltaphi_{CD}=-21.81^circ.
}
]

而当前 T-cell/network-native progression 约：

[
+90^circ.
]

若先通过增加约四分之一导波波长的等效延迟，把 +90° baseline 移到约 0°，再做对称 fine trim，则设计非常自然。

取当前：

[
lambda_gapprox67.88 {m mm},
qquad
1 {m mm}approx5.30^circ.
]

从 +90° 调到上述三段 target，需要额外 lag：

[
68.19^circ,quad
90^circ,quad
111.81^circ.
]

对应等效 50 Ω 增量电长度约：

[
oxed{
12.9,quad
17.0,quad
21.1 {m mm}.
}
]

也就是：

[
oxed{
L_{phi}
approx
16.97 {m mm}
+
(-4.1, 0, +4.1) {m mm}.
}
]

这个结构比让四块 Patch 固定 0/90/180/270° 更符合 mirror-field seed：

- 中间以约 (lambda_g/4) phase section 把 travelling-wave progression 拉回近 0°；
- A→B 略少延迟；
- B→C 约 quarter-wave；
- C→D 略多延迟。

---

## 15. phase section 的损耗必须反馈到 κ，而不能分开计算

若这些额外路径全部仍使用当前 FR4，并粗略按：

[
0.42 {m dB}/50 {m mm}
]

估计附加损耗，则三段 cell loss 从 0.42 dB 增加为约：

[
oxed{
0.528,quad
0.563,quad
0.597 {m dB}.
}
]

相应：

[
	au_Aapprox0.8855,
qquad
	au_Bapprox0.8785,
qquad
	au_Capprox0.8716.
]

重新对 30 mm mirror amplitude taper 递推，得到：

[
oxed{
kappa_Aapprox0.1799,
quad
kappa_Bapprox0.3163,
quad
kappa_Capprox0.5267.
}
]

对应：

[
oxed{
7.45 {m dB},
quad
5.00 {m dB},
quad
2.78 {m dB}.
}
]

这说明 amplitude design 与 phase routing 不能分成两个互不反馈的阶段：

[
oxed{
	ext{phase path}
ightarrow
	au_i
ightarrow
kappa_i
ightarrow
Z_{t,i},Z_{b,i}.
}
]

真正的下一版综合应至少迭代一次这个闭环。

---

## 16. 当前推荐的理论设计层级

### Stage A — loaded Patch

先确定：

[
f_{r,m loaded},
quad
R_L,
quad
X_L,
quad
Q_{m work},
quad
eta_{m work}.
]

理论上优先控制：

[
oxed{
|X/R|lesssim0.1
}
]

而不是只看 Zone input S11。

### Stage B — field target

对称四板优先从：

[
oxed{
(a,b,b,a)
}
]

mirror-even 子空间寻找近场目标，不再默认 travelling-wave。

当前 30 mm 零阶 seed：

[
oxed{
(1, 1.13e^{j21.8^circ}, 1.13e^{j21.8^circ}, 1).
}
]

### Stage C — power synthesis

由：

[
e_ipropto|u_i|^2
]

和真实 (	au_i) 递推：

[
oxed{
P_i=e_i+rac{P_{i+1}}{	au_i},
qquad
kappa_i=rac{e_i}{P_i}.
}
]

### Stage D — matched T-cell

对每个 (kappa_i) 和 loaded Patch resonant resistance (R_{L,i})：

[
oxed{
Z_{t,i}=50sqrt{1-kappa_i},
}
]

[
oxed{
Z_{b,i}
=
sqrt{
50R_{L,i}
rac{1-kappa_i}{kappa_i}
}.
}
]

### Stage E — phase synthesis

根据目标：

[
phi_i^*
]

调整 through phase 或 branch phase。

phase path 引入的额外 loss 必须回到 Stage C 更新 (kappa_i)。

---

## 17. 当前设计结论

本轮理论分析给出了两个重要更新。

第一，loaded Patch 的工件影响具有明显距离尺度：

[
oxed{
	ext{主 fringing-field 电场幅衰减长度约 }11 {m mm}
}
]

所以工件在 5–10 mm 与 20–30 mm 时，Patch 所看到的负载是完全不同的设计状态。

第二，四板加热相位不应由“线路天然 +90°”决定。

对于对称四板/对称评价面，最简单 Green-function 理论已经给出：

[
oxed{
	ext{mirror-even taper}
}
]

比 travelling-wave taper 更自然。

30 mm 的零阶候选为：

[
oxed{
mathbf u
propto
(1, 1.13e^{j21.8^circ}, 1.13e^{j21.8^circ}, 1).
}
]

因此下一版 PCB 的理论主线应从：

[
	ext{equal power + fixed +90°}
]

升级为：

[
oxed{
	ext{loaded-Patch-aware}
+
	ext{field-aware amplitude taper}
+
	ext{mirror phase taper}.
}
]

后续全波仿真的任务是把本文中的简化 Green kernel 与 evanescent loading coefficient 替换成真实场解，而不是重新决定整个架构。
