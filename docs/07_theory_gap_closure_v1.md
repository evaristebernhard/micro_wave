# 理论缺口闭合：串联系统损耗、耦合器可实现性与验收指标 V1

> 本文针对当前 micro_wave 方案中仍未闭合的几个关键理论问题做进一步分析。
>
> 重点回答：
>
> 1. 当前采用的 0.42 dB / 50 mm cell 是否有合理的一阶理论依据；
> 2. 为什么 25/100 块连续 FR4 串联即使采用梯度耦合仍然不可行；
> 3. 为什么“灰板直通插损 ≤0.5 dB”不能直接作为带取能支路的单板验收指标；
> 4. 21.5% / 30.2% / 47.6% 梯度 tap 是否能靠当前简单 side-coupled geometry 直接实现；
> 5. D 终端板和上游 distribution manifold 应该如何进入统一功率模型。

---

## 1. 0.42 dB/cell 的一阶理论核查

当前 through-line seed：

\[
f_0=2.45\ {\rm GHz},\qquad
h=1.6\ {\rm mm},\qquad
w=2.9\ {\rm mm},
\]

FR4：

\[
\varepsilon_r=4.3,\qquad
\tan\delta=0.02.
\]

忽略 PP superstrate，先用标准微带一阶近似。宽高比：

\[
u=\frac{w}{h}=\frac{2.9}{1.6}\approx1.8125.
\]

有效介电常数：

\[
\varepsilon_{\rm eff}
\approx
\frac{\varepsilon_r+1}{2}
+
\frac{\varepsilon_r-1}{2}
\left(
1+\frac{12}{u}
\right)^{-1/2}
\approx3.25.
\]

自由空间波数：

\[
k_0=\frac{2\pi f}{c}\approx51.35\ {\rm rad/m}.
\]

微带介质损耗的一阶近似：

\[
\alpha_d
\approx
\frac{
k_0\varepsilon_r(\varepsilon_{\rm eff}-1)\tan\delta
}{
2\sqrt{\varepsilon_{\rm eff}}(\varepsilon_r-1)
}.
\]

代入得到：

\[
\alpha_d
\approx0.835\ {\rm Np/m}
\approx7.25\ {\rm dB/m}.
\]

因此仅介质损耗在 50 mm 上就约为：

\[
\boxed{
L_d(50{\rm mm})\approx0.36\ {\rm dB}
}
\]

2.45 GHz 铜表面电阻：

\[
R_s
=
\sqrt{
\frac{\pi f\mu_0}{\sigma}
}
\approx12.9\ {\rm m}\Omega/\square.
\]

只按顶层 strip 粗估：

\[
\alpha_{c,\rm strip}
\sim
\frac{R_s}{Z_0w}
\approx0.089\ {\rm Np/m},
\]

约：

\[
0.77\ {\rm dB/m},
\]

即：

\[
\approx0.039\ {\rm dB/50mm}.
\]

实际还存在 Ground return conductor loss、Rz≈5 μm 铜粗糙度、磁吸接口、几何不连续以及 PP 覆盖对场分布的改变。

所以：

\[
\boxed{
0.40\sim0.45\ {\rm dB/50mm}
}
\]

作为第一轮 benchmark 是合理数量级，并不是随意给出的数字。

但这一结论仍然只是解析估算：

\[
\boxed{
0.42\ {\rm dB}
\text{ 不能代替 HFSS/openEMS 的正式结果。}
}
\]

PP superstrate 会改变 \(\varepsilon_{\rm eff}\) 和各介质中的能量参与率，因此最终值必须全波求解。

---

## 2. 梯度耦合并不能拯救 100 块连续 FR4 串联

equal-extraction 梯度递推：

\[
P_{i+1}
=
\tau(P_i-E),
\]

其中：

\[
\tau
=
10^{-L_s/10}.
\]

若最后一块为 terminal radiator，并要求每块抽取相同 RF 功率 \(E\)，则：

\[
P_{\rm in}
=
E
\sum_{m=0}^{N-1}\tau^{-m}.
\]

定义：

\[
A_N(\tau)
=
\sum_{m=0}^{N-1}\tau^{-m},
\]

则：

\[
P_{\rm in}=EA_N.
\]

Zone 的 RF 抽取效率：

\[
\eta_N
=
\frac{NE}{P_{\rm in}}
=
\frac{N}{A_N}.
\]

---

## 3. 在 0.42 dB/cell 下，长串链会指数恶化

当前：

\[
\tau
=
10^{-0.42/10}
\approx0.90782.
\]

对应：

| 连续板数 N | \(A_N\) | RF 抽取效率 \(\eta_N\) |
|---:|---:|---:|
| 4 | 4.6515 | 85.99% |
| 5 | 6.1238 | 81.65% |
| 8 | 11.5000 | 69.57% |
| 25 | 100.6525 | 24.84% |
| 100 | 156076.8 | 0.0641% |

25 块如果每块都要抽取 5 W：

\[
P_{\rm in}
=
5\times100.6525
\approx503.3\ {\rm W}.
\]

但实际有用 RF 只有：

\[
25\times5=125\ {\rm W}.
\]

还没有计入上游 WR340→同轴、长馈线和 distribution loss，就已经接近 500 W 源上限。

100 块如果按当前 V2 目标每块抽取 4 W：

\[
P_{\rm in}
=
4\times156076.8
\approx624\ {\rm kW}.
\]

这个数字不是说实际系统会真的运行到 624 kW，而是说明：

\[
\boxed{
\text{在 0.42 dB/cell 假设下，要求 100 块连续 FR4 链末端仍保持 4 W 是数学上不可行的。}
}
\]

根本原因是 99 个 50 mm cell 已形成约 5 m 普通 FR4 微带路径，累计损耗达到几十 dB。

---

## 4. 即使真实损耗比 0.42 dB 小很多，100 块连续链仍然很困难

为了避免结论完全依赖 0.42 dB，反过来问：

> 100 块连续链若总共要抽取 400 W，而源只有 500 W，每 cell 最多允许多少寄生损耗？

这要求 Zone 本身：

\[
\eta_{100}\ge\frac{400}{500}=80\%.
\]

解：

\[
\eta_{100}(L_s)=0.8
\]

得到：

\[
\boxed{
L_s\lesssim0.0189\ {\rm dB/cell}
}
\]

这还是假设上游馈线、WR340 转换、分配器均为零损耗。

若上游 distribution efficiency 只有：

\[
\eta_{\rm dist}=95\%,
\]

则 Zone 必须满足：

\[
\eta_{100}
\ge
\frac{400}{500\times0.95}
\approx84.21\%.
\]

此时每 cell 要求：

\[
\boxed{
L_s\lesssim0.0147\ {\rm dB/cell}
}
\]

这远低于普通 FR4 在 2.45 GHz、50 mm 路径上的理论介质损耗数量级。

所以：

\[
\boxed{
\text{100 块连续 FR4 串联不是“优化一下 coupler”就能解决的问题。}
}
\]

它需要改变系统架构。

---

## 5. 50 / 80 / 100 块连续链的理论损耗上限

若总 RF 抽取目标都为约 400 W，500 W 源意味着 Zone 至少 80% 效率。

对应连续链每 cell 最大允许寄生损耗：

| 板数 | 零上游损耗时 \(L_{s,\max}\) | 上游效率95%时 \(L_{s,\max}\) |
|---:|---:|---:|
| 50 | 0.0381 dB | 0.0296 dB |
| 80 | 0.0237 dB | 0.0184 dB |
| 100 | 0.0189 dB | 0.0147 dB |

和当前普通 FR4 的约 0.4 dB/50mm 数量级相比，相差一个数量级以上。

因此“分区”不是可选的小优化，而是系统级必要条件。

---

## 6. 原始“灰板直通插损 ≤0.5 dB”存在定义问题

对于普通连接桥，没有有用支路，所以：

\[
IL=-20\log_{10}|S_{21}|
\]

可以直接解释成传输损耗。

但灰板不同。灰板故意从主线取走功率：

\[
P_{\rm in}
=
P_{\rm refl}
+
P_{\rm thru}
+
P_{\rm useful}
+
P_{\rm parasitic}.
\]

归一化：

\[
R+T+U+L=1
\]

其中：

\[
R=|S_{11}|^2,\quad
T=|S_{21}|^2,\quad
U=\frac{P_{\rm useful}}{P_{\rm in}},\quad
L=\frac{P_{\rm parasitic}}{P_{\rm in}}.
\]

如果板故意抽取 20% 功率，那么即使：

\[
R=0,\qquad L=0,
\]

也只有：

\[
T=0.8.
\]

对应 raw through insertion loss：

\[
-10\log_{10}(0.8)
\approx0.97\ {\rm dB}.
\]

这不是“板损耗太大”，而是 20% 功率被有意送去 Patch。

---

## 7. 0.5 dB raw S21 最多只允许约 10.9% 抽取

如果坚持：

\[
IL_{\rm raw}\le0.5\ {\rm dB},
\]

则：

\[
T
\ge
10^{-0.5/10}
\approx0.8913.
\]

在理想：

\[
R=L=0
\]

情况下：

\[
U_{\max}
=
1-T
\le10.87\%.
\]

即“灰板 raw S21 插损≤0.5 dB”和梯度 A/B/C 高于约 11% 的有用取能不能同时成立。

当前梯度目标的理想 through attenuation 本身就是：

| 板型 | 目标抽取 \(\kappa\) | 即使无寄生损耗时 raw through attenuation |
|---|---:|---:|
| A | 21.5% | 1.05 dB |
| B | 30.2% | 1.56 dB |
| C | 47.6% | 2.81 dB |
| D | 100% | 无 through 输出 |

所以灰板应该停止使用“raw S21 ≤0.5 dB”作为总损耗验收指标。

---

## 8. 灰板正确的验收指标应该拆开

推荐：

### 8.1 反射

\[
|S_{11}|
\]

或 VSWR。

### 8.2 有用抽取

\[
U
=
\frac{P_{\rm extract/useful}}{P_{\rm in}}.
\]

A/B/C/D 分别有自己的目标范围。

### 8.3 寄生损耗

单独计算：

\[
L
=
\frac{
P_{\rm Cu}
+
P_{\rm FR4}
+
P_{\rm contact}
+
P_{\rm unintended}
}{
P_{\rm in}
}.
\]

### 8.4 through power

\[
T=|S_{21}|^2
\]

只作为功率平衡的一部分，不再单独用 ≤0.5 dB 判定。

最终检查：

\[
\boxed{
R+T+U+L\approx1
}
\]

才是最清楚的验收方式。

桥、同轴线和无取能连接件仍可继续使用普通 insertion loss 指标。

---

## 9. 当前简单 T/shunt 模型无法实现 C 板约 47.6% 且低反射

做一个最简单的 lumped surrogate：

主线后端仍是：

\[
50\Omega.
\]

Patch 支路在谐振附近近似：

\[
Z_b=50-jX.
\]

主线节点看到：

\[
Z_{\rm eq}
=
50\parallel Z_b.
\]

这个最简单 shunt branch 的功率分析表明：

- branch 直接变成 50 Ω，即 \(X=0\) 时；
- 支路最多获得约 44.44% 的输入功率；
- 同时反射功率约 11.11%，即 VSWR=2。

所以：

\[
\boxed{
\text{简单 50 Ω T/shunt branch 连 C 板的 47.6% 目标都无法达到。}
}
\]

更不用说 D 板 100%。

---

## 10. A/B 的 simple-shunt 近似也会产生明显反射

在该简化模型中，寻找约：

\[
U_A=21.5\%
\]

需要：

\[
X\approx77.4\Omega,
\]

相当于 2.45 GHz 下：

\[
C\approx0.84\ {\rm pF}.
\]

这时：

\[
R\approx5.38\%,
\qquad
VSWR\approx1.60.
\]

B 板：

\[
U_B\approx30.2\%
\]

需要：

\[
X\approx51.6\Omega,
\]

约：

\[
C\approx1.26\ {\rm pF}.
\]

但：

\[
R\approx7.54\%,
\qquad
VSWR\approx1.76.
\]

所以“简单 side capacitor + 50 Ω Patch”并不是理想的梯度 coupler 拓扑。

这解释了为什么仅仅继续把 \(g_c,l_c\) 调大，不一定能同时得到目标抽取比例、低反射、正确谐振和稳定 through path。

---

## 11. 更合适的 coupler 应该接近匹配的功率分配结构

理想 matched directional coupler 可以表示为：

\[
|S_{31}|^2=\kappa,
\]

\[
|S_{21}|^2=1-\kappa,
\]

同时：

\[
S_{11}\approx0,\qquad
S_{41}\approx0.
\]

这正好对应：

- Port 1：输入；
- Port 2：through；
- Port 3：Patch / useful branch；
- Port 4：isolated port / 等效隔离通道。

对于四端口定向耦合结构，从网络理论上可以同时做到低反射和指定功率分配。

因此 A/B/C 后续不应只局限于“短 6 mm 平行线 + gap”这一种形态。

---

## 12. 四分之一波 coupled-line 的数量级

按：

\[
\varepsilon_{\rm eff}\approx3.25
\]

估计：

\[
\lambda_g
\approx
\frac{122.4}{\sqrt{3.25}}
\approx67.9\ {\rm mm}.
\]

四分之一导波波长：

\[
\boxed{
\lambda_g/4
\approx17.0\ {\rm mm}.
}
\]

因此如果采用经典 quarter-wave coupled-line / branch-hybrid 思路，耦合结构长度量级可能在 15–20 mm，而不是当前 seed 的 6 mm。

当前 6 mm coupler 仍可作为局部电容耦合 seed，但不能预先假定它一定能实现 C 板近 3 dB 的强耦合。

---

## 13. A/B/C 对应的理想耦合等级

功率耦合目标：

\[
\kappa_A=0.215,\quad
\kappa_B=0.3017,\quad
\kappa_C=0.4758.
\]

对应 coupling level：

\[
C_{\rm dB}
=
-10\log_{10}\kappa.
\]

得到：

| 板型 | 功率耦合 | Coupling level |
|---|---:|---:|
| A | 21.5% | 6.68 dB |
| B | 30.17% | 5.20 dB |
| C | 47.58% | 3.23 dB |

C 已经接近 3 dB hybrid 的量级。

如果采用单节 quarter-wave coupled-line，令 amplitude coupling：

\[
c=\sqrt{\kappa},
\]

一阶 even/odd impedance 要求：

\[
Z_{0e}
=
Z_0
\sqrt{
\frac{1+c}{1-c}
},
\]

\[
Z_{0o}
=
Z_0
\sqrt{
\frac{1-c}{1+c}
}.
\]

得到：

| 板型 | \(Z_{0e}\) | \(Z_{0o}\) |
|---|---:|---:|
| A | 82.6 Ω | 30.3 Ω |
| B | 92.7 Ω | 27.0 Ω |
| C | 116.7 Ω | 21.4 Ω |

这说明 C 的强耦合要求已经比较激进。

在 1.6 mm FR4 上是否能用简单 edge-coupled microstrip 实现，需要 HFSS 具体判断；如果线间距和阻抗不可制造，应考虑 broadside coupler、branch-line hybrid、stepped impedance、transformer + matched branch 或其它更强耦合拓扑。

---

## 14. D 板不是“100% coupler”，而是 matched terminal radiator

数学递推里写：

\[
\kappa_D=100\%
\]

容易产生误解。

正确物理含义是：

\[
\boxed{
\text{Zone 最后一块不再保留 through 功率。}
}
\]

D 应设计为：

\[
\boxed{
\text{matched terminal radiator / matched terminal absorber}
}
\]

目标：

\[
|S_{11,D}|\rightarrow0.
\]

输入功率最终分成：

\[
P_{\rm in,D}
=
P_{\rm workpiece}
+
P_{\rm radiation}
+
P_{\rm Cu}
+
P_{\rm FR4}
+
P_{\rm other}.
\]

因此 \(\kappa_D=1\) 只表示“没有继续传给下一块”，并不表示 100% 都被工件吸收。

---

## 15. equal RF extraction 不等于 equal heating

之前梯度推导先按：

\[
E_i=E
\]

即每块 RF 抽取相同。

但真正的加热目标应是：

\[
Q_i
=
P_{{\rm abs,workpiece},i}.
\]

定义每块从抽取 RF 到工件吸收的效率：

\[
\eta_i
=
\frac{Q_i}{E_i}.
\]

则要让：

\[
Q_i=Q
\]

必须：

\[
\boxed{
E_i
=
\frac{Q}{\eta_i}.
}
\]

因此完整递推应写成：

\[
P_{i+1}
=
\tau_i
\left(
P_i-\frac{Q_i}{\eta_i}
\right).
\]

反向：

\[
\boxed{
P_i
=
\frac{Q_i}{\eta_i}
+
\frac{P_{i+1}}{\tau_i}.
}
\]

所以 A/B/C/D 的 21.5% / 30.2% / 47.6% / terminal 只是一阶 equal RF extraction baseline，不是最终 equal thermal deposition solution。

真实工件加入 HFSS 后，应使用每个位置的 \(\eta_i\) 重新标定。

---

## 16. 500 W 总功率边界进一步量化

当前 4 板 Zone 理论：

\[
\eta_{\rm zone}\approx0.8599.
\]

500 W 源经过上游 distribution efficiency：

\[
\eta_{\rm dist}
\]

后，最大总 RF 抽取：

\[
\boxed{
P_{\rm extract,total,max}
=
500\eta_{\rm dist}\eta_{\rm zone}.
}
\]

例如：

| \(\eta_{\rm dist}\) | 最大总 RF 抽取 |
|---:|---:|
| 98% | 421.4 W |
| 95% | 408.5 W |
| 93% | 399.9 W |
| 90% | 387.0 W |
| 85% | 365.5 W |

因此 \(\eta_{\rm dist}\approx93\%\) 正好对应约 400 W 总 RF 抽取。

如果上游只有 90%，则：

- 100 块平均 RF 抽取最多约 3.87 W；
- 80 块平均约 4.84 W；
- 50 块平均约 7.74 W。

这说明 V2 的 50 块约 8 W、80 块约 5 W、100 块约 4 W，实际上对应的上游总效率已经要求接近 93–95%。

---

## 17. 上游 distribution manifold 也可以使用同一套梯度数学

如果有 \(M\) 个 Zone，第 \(j\) 个 Zone 需要输入：

\[
Q_j,
\]

主干传输系数：

\[
\tau_{m,j},
\]

则主干也可以用：

\[
T_{j+1}
=
\tau_{m,j}
(T_j-Q_j).
\]

对应第 \(j\) 个 Zone 的 tap ratio：

\[
\boxed{
\kappa_{m,j}
=
\frac{Q_j}{T_j}.
}
\]

也就是说当前系统实际上是两层梯度：

\[
\boxed{
\text{Layer 1: trunk → Zones}
}
\]

\[
\boxed{
\text{Layer 2: Zone → A/B/C/D boards}
}
\]

但 500 W 主干层不能直接照搬 PCB 小功率 coupler。

它应优先研究 waveguide distribution、high-power coaxial manifold、directional coupler manifold 或 corporate divider tree。

---

## 18. 当前系统级推荐拓扑进一步明确

~~~text
500 W magnetron
      |
      v
WR340 / matching
      |
      v
low-loss high-power distribution manifold
      |
      +---- Zone 1 input
      |       A -> B -> C -> D_term
      |
      +---- Zone 2 input
      |       A -> B -> C -> D_term
      |
      +---- ...
      |
      +---- partial Zone
              B -> C -> D
              or C -> D
              or D
~~~

其中：

- 500 W 层负责低损耗输电；
- FR4 板只承担局部数十瓦级 Zone；
- Zone 内用梯度取能；
- D 负责终端匹配/辐射；
- 不再让 100 块普通 FR4 构成一条 5 m 微带链。

---

## 19. 本轮理论分析闭合了什么

### 已经可以认为理论上闭合

1. 为什么 100 块连续 FR4 串联不可行：已有一般效率公式和每 cell 最大损耗上限。
2. 为什么固定 10% tap 不适合 4 板 equal-extraction Zone：梯度递推已经给出。
3. 为什么灰板不能用 raw S21≤0.5 dB 作为唯一插损指标：intentional extraction 会天然降低 S21。
4. 为什么当前 6 mm side coupler 不能直接假定能实现 A/B/C：simple-shunt 模型和 quarter-wave coupling 数量级都表明 C 是强耦合问题。
5. 为什么 D 必须单独设计：D 是 matched terminal radiator，不是普通 through-board。
6. 为什么 equal RF extraction 还不是最终加热均匀性：还需乘上工件吸收效率 \(\eta_i\)。

---

## 20. 仍然必须由仿真闭合的 gap

以下不能继续靠纸面推导替代：

1. PP 覆盖后 50 Ω 主线真实宽度；
2. 50 mm through-line 的真实 \(S_{11},S_{21},\tau(f)\)；
3. A/B/C coupler 是否可在 50×50 mm 尺寸内实现；
4. C 约 3.2 dB 强耦合是否需要 branch-line/broadside 结构；
5. D 终端 Patch 的真实匹配与工件吸收效率；
6. 磁吸触点造成的寄生电感、电阻和局部高场；
7. 工件的复介电常数和温度变化；
8. 每块 \(\eta_i=P_{\rm abs,workpiece}/P_{\rm extract}\)；
9. 上游 500 W distribution manifold 的真实效率；
10. A/B/C/D 四板全波级联后的相干反射与相位效应。

---

## 21. 下一阶段的仿真优先级

### Priority 1 — through-line benchmark

先求：

\[
\tau(f).
\]

如果真实 \(L_s\) 不是 0.42 dB，则所有梯度比例重算。

### Priority 2 — coupler feasibility map

建立：

\[
(g,l,w,\text{topology})
\rightarrow
(\kappa,S_{11},S_{21}).
\]

不要只扫 0.3–0.8 mm gap。

### Priority 3 — terminal D

单独解决：

\[
S_{11,D}
\]

和：

\[
P_{\rm abs,workpiece}.
\]

### Priority 4 — full A/B/C/D Zone

最终判断：

\[
\Delta P_{\rm extract},
\qquad
\Delta P_{\rm abs,workpiece}.
\]

### Priority 5 — high-power manifold

再把 500 W 层接入系统级网络模型。

---

## 22. 当前结论

理论分析现在支持以下判断：

\[
\boxed{
\text{梯度耦合方向是正确的，但不能把它简化成“把 gap 越做越小”。}
}
\]

真正的工程问题已经分成三层：

\[
\boxed{
\text{低损耗输电}
}
\]

\[
\boxed{
\text{匹配的功率分配 / coupling}
}
\]

\[
\boxed{
\text{Patch → workpiece 能量沉积}
}
\]

这三层必须分别优化，然后再做全系统级联。
