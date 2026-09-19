# 1–80 块磁吸天线系统闭合功率理论框架 V1

> 状态：用于替代原“1–100 块 + 500 W + 每块 5–8 W”的不自洽口径，并作为后续 PCB / openEMS / HFSS / 系统级级联的统一理论框架。
>
> 本文不把解析估算写成已经通过全波验证。所有损耗、阻抗和耦合参数最终必须由单板与接口 S 参数校准。

---

## 1. 修订后的系统边界

正式支持板数改为

[
oxed{1le Nle80}
]

代表验收工况：

[
oxed{N=5, 25, 80}
]

最大源功率：

[
oxed{P_{m src,max}=500 {m W}}
]

单板 RF 有用取能硬区间：

[
oxed{5le P_ile8 {m W}}
]

组内功率均匀性定义为：

[
oxed{
delta_P=
max_ileft|
rac{P_i}{ar P}-1
ight|
le25%
}
]

其中 (P_i) 指板的 useful accepted RF power；工件实际吸收功率 (P_{m abs,workpiece}) 作为第二层指标单独计算，不能与 RF 取能混为同一量。

---

## 2. 为什么上限改为 80

定义端到板的设计有效功率预算：

[
P_{m useful,budget}=400 {m W}.
]

这相当于要求在 500 W 源下，整个 feed + manifold + Zone 系统达到：

[
oxed{eta_{m sys}ge0.80}.
]

于是仅按每块最低 5 W：

[
N_{max}
=
rac{400}{5}
=
80.
]

因此 80 不是任意修改，而是由

[
500 {m W}	imes80%
]

的工程预算与

[
5 {m W/board}
]

硬下限共同给出的系统上界。

如果后续全波/实测证明 (eta_{m sys}<0.80)，则三种选择只能三选一：

1. 降低最大板数；
2. 降低单板最低功率；
3. 提高源功率上限。

---

## 3. 不能再使用 80 块连续 FR4 长链

支持 1–80 块是系统能力，不等于 RF 必须沿一条 4 m 普通 FR4 微带连续通过 80 块。

当前统一架构：

[
oxed{
	ext{500 W source}
	o
	ext{low-loss distribution}
	o
	ext{local RF Zones}
}
]

板数分解：

[
oxed{
N=4M+r,qquad
rin{0,1,2,3}.
}
]

完整 Zone 为四板：

[
A	o B	o C	o D_{m term}.
]

余数 (r) 使用 1/2/3 板 partial Zone，并用同一套 backward power synthesis 求解，不再用“80 块一条 FR4 链”的模型。

80 块对应：

[
oxed{20	ext{ 个四板 Zone}}.
]

---

## 4. 板数自适应的平均功率目标

保留当前低/中板数的 6.5 W/板 nominal 工作点，同时在高板数下自动进入 power-limited mode：

[
oxed{
ar P(N)
=
minleft(
6.5,;
rac{400}{N}
ight)
 {m W}.
}
]

因此：

- (Nle61)：(ar P=6.5) W；
- (62le Nle80)：逐步降到 (400/N)；
- (N=80)：(ar P=5.0) W。

代表值：

| N | (ar P(N)) | useful RF total |
|---:|---:|---:|
| 5 | 6.50 W | 32.5 W |
| 25 | 6.50 W | 162.5 W |
| 50 | 6.50 W | 325 W |
| 61 | 6.50 W | 396.5 W |
| 70 | 5.714 W | 400 W |
| 75 | 5.333 W | 400 W |
| 80 | 5.000 W | 400 W |

这使“根据板数智能调节输入功率”有了明确数学定义。

---

## 5. 低板数 field-aware taper 与高板数功率约束必须统一

当前 few-mode 工件加载模型的低/中板数推荐 power taper 为：

[
P_A:P_B:P_C:P_D
=
1:0.6412:0.6412:1.
]

在四板平均 6.5 W 时：

[
(7.92, 5.08, 5.08, 7.92) {m W}.
]

它满足：

[
5le P_ile8
]

并且相对于四板平均值：

[
rac{7.92}{6.5}-1
approx+21.9%,
]

[
rac{5.08}{6.5}-1
approx-21.9%,
]

所以：

[
oxed{delta_Papprox21.9%<25%}.
]

问题在于：如果把该 taper 原样缩放到 80 块的 5 W 平均值，内板会低于 5 W。因此高板数必须自动把 taper 压平。

---

## 6. 可闭合的板数自适应 taper

定义四板 Zone 的 inner/outer accepted-power ratio：

[
q(N)
=
rac{P_B}{P_A}
=
rac{P_C}{P_D},
qquad
0<qle1.
]

当前 field-aware 自由最优中心：

[
oxed{q_0=0.6412}.
]

若四板平均功率为 (ar P)，则：

[
P_{m outer}
=
rac{2ar P}{1+q},
]

[
P_{m inner}
=
rac{2qar P}{1+q}.
]

为了保证：

[
P_{m inner}ge5 {m W},
]

必须：

[
q
ge
rac{5}{2ar P-5}.
]

因此定义：

[
oxed{
q^*(N)
=
minleft[
1,;
maxleft(
0.6412,;
rac{5}{2ar P(N)-5}
ight)
ight].
}
]

这就是 1–80 块系统的闭合功率调度律。

相应 Patch amplitude ratio：

[
oxed{ho(N)=sqrt{q^*(N)}}.
]

---

## 7. 该调度律自动满足 5–8 W 与 ±25%

代表工况：

| N | (ar P) | (q^*) | amplitude ratio (ho) | outer W | inner W |
|---:|---:|---:|---:|---:|---:|
| 5 | 6.500 | 0.6412 | 0.8008 | 7.921 | 5.079 |
| 25 | 6.500 | 0.6412 | 0.8008 | 7.921 | 5.079 |
| 50 | 6.500 | 0.6412 | 0.8008 | 7.921 | 5.079 |
| 61 | 6.500 | 0.6412 | 0.8008 | 7.921 | 5.079 |
| 62 | 6.452 | 0.6412 | 0.8008 | 7.862 | 5.041 |
| 70 | 5.714 | 0.7778 | 0.8819 | 6.429 | 5.000 |
| 75 | 5.333 | 0.8824 | 0.9393 | 5.667 | 5.000 |
| 80 | 5.000 | 1.0000 | 1.0000 | 5.000 | 5.000 |

因此：

[
oxed{
5le P_ile8 {m W}
quad
orall,1le Nle80
}
]

在该解析目标分配中成立。

同时 (q) 只会从 0.6412 向 1 增大，所以 outer/inner 相对均值的最大偏差发生在 (q=0.6412)：

[
oxed{delta_P^{max}approx21.9%<25%}.
]

即 5–8 W 与 ±25% 两个条件第一次被同一个功率调度模型同时闭合。

---

## 8. 相位也必须变成 constrained field synthesis

低/中板数当前推荐：

[
mathbf u
propto
(1,;0.801e^{-j5.3^circ},;0.801e^{-j5.3^circ},;1).
]

高板数由于 (q(N)	o1)，不能继续冻结同一复激励。

统一问题写成：

[
oxed{
min_{phi}
max_s
|Delta_s(q^*(N),phi)|
}
]

其中 (s) 遍历当前 81 个代表工件场景，并保持功率 ratio (q^*(N)) 固定。

设计边界：

- 低/中板数：(q=0.6412)，当前解 (phiapprox-5.3^circ)；
- 80 板：(q=1)，可回到 near-equal/in-phase 模式；
- 中间板数：只做一维 phase 局部优化，不再重新大范围搜索所有几何参数。

当前 few-mode 模型中 equal excitation 的 worst inner/outer imbalance 约 1.79 dB，对应两组相对均值约 ±20.3%，仍低于 ±25% 功率容差，因此 80 板 equal-power endpoint 在 reduced-order 模型中存在理论可行性。

---

## 9. 每个 Zone 的 extraction coefficient 不再固定

对一个 Zone，设目标 accepted powers 为：

[
(e_1,e_2,ldots,e_m).
]

单 cell 寄生传输系数：

[
	au_i=10^{-L_i/10}.
]

从 terminal board 向前递推：

[
P_m=e_m,
]

[
oxed{
P_i
=
e_i+rac{P_{i+1}}{	au_i}
}
qquad(i=m-1,ldots,1).
]

于是第 (i) 块所需 extraction：

[
oxed{
kappa_i
=
rac{e_i}{P_i}.
}
]

因此 A/B/C 的 (kappa) 不是永远固定为同一组数字，而应随：

- (N)；
- (q^*(N))；
- 实测/全波 (	au_i)；
- phase-section loss；
- 磁吸接口 loss；

重新反解。

两个重要端点：

### 低/中板数 field-aware endpoint

当前解析 seed：

[
(kappa_A,kappa_B,kappa_C)
approx
(24.76%,24.07%,36.08%).
]

### 80 板 equal-power endpoint

若使用旧的一阶：

[
L_s=0.42 {m dB/cell},
]

则等功率四板 Zone 约：

[
(kappa_A,kappa_B,kappa_C)
approx
(21.50%,30.17%,47.58%).
]

最终铜结构应支持这两个端点之间的 constrained synthesis，而不是只围绕单一 coupling dB 优化。

---

## 10. 80 板的效率闭合条件

系统总效率：

[
oxed{
eta_{m sys}
=
eta_{m feed}
eta_{m manifold}
eta_{m zone}.
}
]

要实现 80 块 × 5 W：

[
P_{m useful}=400 {m W}.
]

500 W 源要求：

[
oxed{eta_{m sys}ge0.80}.
]

如果把上游 feed + manifold 设计目标冻结为：

[
oxed{eta_{m dist}ge0.95},
]

则四板 Zone 必须：

[
eta_{m zone}
ge
rac{0.80}{0.95}
=
0.8421.
]

即：

[
oxed{eta_{m zone}ge84.21%}.
]

当前旧 0.42 dB/cell 的等功率四板解析模型给出：

[
eta_{m zone}approx85.99%.
]

因此：

[
0.95	imes0.8599
approx81.69%
>
80%.
]

这说明 80 板方案在当前一阶模型中存在约 1.7 个百分点的总效率理论余量。

但这是一个很窄的 margin，所以：

[
oxed{
eta_{m zone}ge84.21%
}
]

必须作为 80 板设计 gate，由 full-wave + 接口模型确认。

当前带较长 phase section 的 field-aware nominal Zone：

[
26/31.99approx81.3%
]

不满足 80 板高功率模式的 Zone efficiency gate，因此高板数时必须同步：

- flatten power taper；
- 减少不必要 phase-line loss；
- 或采用更低损耗材料/更短路径。

这正是为什么“只改最大板数”还不够，必须把功率模式与 RF topology 一起调度。

---

## 11. 源功率控制律

控制器不应只使用：

[
P_{m src}=N	imes6.5.
]

应使用：

[
oxed{
P_{m cmd}(N)
=
minleft[
500,;
rac{Nar P(N)}
{hateta_{m sys}(N)}
ight].
}
]

其中 (hateta_{m sys}(N)) 来自：

1. 单板/Zone full-wave；
2. bridge/cable S 参数；
3. reflected-power 监测；
4. 最终样机标定 LUT。

若初始使用：

[
hateta_{m sys}=0.80,
]

则：

| N | nominal source command |
|---:|---:|
| 5 | 40.6 W |
| 25 | 203.1 W |
| 50 | 406.3 W |
| 61 | 495.6 W |
| 62–80 | 500 W power-limited mode |

实际控制值必须按实测效率修正，不能把该表直接作为量产开环表。

---

## 12. 任意 1–80 块的 partial Zone

对：

[
N=4M+r
]

中的余数 (r=1,2,3)，不需要再定义新的系统理论。

直接对最后一个 partial Zone 使用第 9 节 backward recursion：

[
(e_1,ldots,e_r)
ightarrow
(P_1,ldots,P_r)
ightarrow
(kappa_1,ldots,kappa_{r-1}).
]

最后一块始终作为 terminal radiator。

因此系统对每一个整数：

[
oxed{N=1,2,ldots,80}
]

都有确定的功率综合路径，而不是只对 5/25/80 三个点有效。

---

## 13. 必须由 full-wave / 实测闭合的物理修正量

理论框架已经闭合，但以下量仍是模型参数，不是已验证常数：

[
oxed{
	au_{m line},
;
S_{m contact},
;
S_{m bridge},
;
Z_{m patch,loaded},
;
eta_{m actual},
;
eta_{m load}
}
]

具体包括：

1. PP + FR4 实际 (Z(W))；
2. PP + FR4 actual phase/mm；
3. 50 mm cell 的真实 dissipative loss；
4. 磁吸触点复数 S 参数；
5. 平面桥、直角桥复数 S 参数；
6. loaded Patch / Spiral 的 (R+jX)；
7. 工件 (arepsilon_r',	andelta,t,g_{m air})；
8. mutual coupling 与 vector polarization。

这些量进入模型后，只更新 (	au_i)、(kappa_i)、phase 与 (eta_{m sys})，不需要推翻整个 1–80 理论架构。

---

## 14. 下一轮验证顺序

严格按：

[
oxed{
	ext{through-line}
	o
	ext{magnetic interface}
	o
	ext{single radiator}
	o
	ext{single T-cell}
	o
	ext{4-board Zone}
	o
	ext{5/25/80 network cascade}
}
]

验收 gate：

### Gate A — 单 cell

- 2.40–2.50 GHz 匹配；
- (Z(W))；
- phase/mm；
- dissipative loss。

### Gate B — 4-board Zone

- 5–8 W/板目标；
- (delta_Ple25%)；
- (eta_{m zone}ge84.21%) for 80-board mode；
- loaded field / absorption。

### Gate C — 系统

- (N=5)；
- (N=25)；
- (N=80)；
- (eta_{m sys}ge80%) at N=80；
- source command ≤500 W。

若 Gate B 的 84.21% 无法满足，则不能继续声称 80×5 W 已闭合，应回到材料、phase-path 或 Zone topology 修改。

---

## 15. 当前结论

修订后的核心不是简单：

[
100	o80.
]

而是形成下面完整闭环：

[
oxed{
N
	o
ar P(N)
	o
q^*(N)
	o
mathbf e(N)
	o
kappa_i(N)
	o
S_i
	o
eta_{m zone}
	o
eta_{m sys}
	o
P_{m cmd}(N)
}
]

在解析层面：

- 正式板数：1–80；
- 5/25/80 为代表验收点；
- 每板 5–8 W；
- 最大相对均值偏差约 21.9%，小于 ±25%；
- 80 板时自动退化为 5/5/5/5 W equal-power Zone；
- 80 板需要 (eta_{m sys}ge80%)；
- 若 upstream efficiency =95%，则 Zone 必须 (eta_{m zone}ge84.21%)；
- 当前 0.42 dB/cell 一阶 equal-power Zone 给出约 85.99%，因此理论上可闭合，但 margin 很小，必须 full-wave 验证。

这套关系作为后续所有 PCB 参数设计、openEMS/HFSS 和系统控制的统一理论骨架。
