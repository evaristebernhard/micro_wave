# 当前 Patch 方案：复数 S 参数理论与第一轮参数设计 V1

> 本文只针对仓库当前真正采用的设计路线：
>
> \[
> \text{50 mm}\times\text{50 mm Patch board}
> +
> \text{through-line}
> +
> \text{受控耦合}
> +
> \text{A/B/C/D 梯度 Zone}
> \]
>
> 不再讨论“客户原始 100 块连续 FR4 长链”作为当前设计。
>
> 本文的目标是把当前仍停留在标量功率递推的架构升级成：
>
> \[
> \boxed{\text{复数多端口 }S\text{ 参数 + 可实现的 A/B/C/D 参数设计}}
> \]

---

## 1. 当前 PCB 的真实状态

当前 tscircuit seed：

\[
f_0=2.45\ {\rm GHz}
\]

\[
W_{\rm board}=H_{\rm board}=50\ {\rm mm}
\]

\[
W_p=37.5\ {\rm mm},\qquad
L_p=28.5\ {\rm mm}
\]

\[
w_{\rm RF}=2.9\ {\rm mm}
\]

\[
g_c=0.5\ {\rm mm}
\]

\[
l_c=6\ {\rm mm}
\]

\[
y_{\rm inset}=10.5\ {\rm mm}
\]

当前 6 mm side-coupled strip 是一个 proximity-coupling seed，不应再直接称为“已经实现 A/B/C 梯度耦合器”。

---

## 2. Patch 尺寸的一阶核查

对 FR4：

\[
\varepsilon_r\approx4.3,\qquad
h=1.6\ {\rm mm}
\]

经典矩形 Patch 一阶公式：

\[
W
\approx
\frac{c}{2f_0}
\sqrt{
\frac{2}{\varepsilon_r+1}
}
\]

得到：

\[
\boxed{
W\approx37.6\ {\rm mm}
}
\]

有效介电常数约：

\[
\varepsilon_{\rm eff}\approx3.99.
\]

考虑边缘延拓：

\[
\Delta L\approx0.74\ {\rm mm}
\]

得到裸 FR4 情况：

\[
L\approx29.1\ {\rm mm}.
\]

当前：

\[
L_p=28.5\ {\rm mm}
\]

比裸 FR4 理论值略短，方向上与 2 mm PP superstrate 提高有效介电常数、使谐振长度缩短是一致的。

所以：

\[
\boxed{
37.5\times28.5\ {\rm mm}
}
\]

作为第一版 seed 是有理论依据的。

建议 HFSS/openEMS 第一轮扫描：

\[
W_p=36\sim39\ {\rm mm}
\]

\[
L_p=27\sim30\ {\rm mm}.
\]

---

## 3. inset = 10.5 mm 也不是任意值

经典近似：

\[
R_{\rm in}(y)
\approx
R_{\rm edge}
\cos^2
\left(
\frac{\pi y}{L_p}
\right).
\]

若：

\[
L_p=28.5\ {\rm mm},
\qquad
y=10.5\ {\rm mm}
\]

并令：

\[
R_{\rm in}\approx50\Omega,
\]

反推：

\[
R_{\rm edge}
\approx310\Omega.
\]

这个数量级对普通矩形 Patch 是合理的。

因此当前：

\[
\boxed{
y_{\rm inset}=10.5\ {\rm mm}
}
\]

可以继续作为 seed。

建议扫描：

\[
y_{\rm inset}=8.5\sim12.5\ {\rm mm}.
\]

---

## 4. 100 MHz 工作带宽对应的 loaded-Q 要求

工作频段：

\[
2.40\sim2.50\ {\rm GHz}
\]

分数带宽：

\[
FBW
=
\frac{0.10}{2.45}
\approx4.08\%.
\]

单谐振器若要覆盖这个数量级的带宽，需要 loaded Q 大致满足：

\[
Q_L
\lesssim
\frac{1}{FBW}
\approx24.5.
\]

因此 Patch + 工件加载后的第一轮目标可写成：

\[
\boxed{
Q_L\approx15\sim25
}
\]

作为带宽设计区间。

注意：降低 Q 不能主要靠 FR4 发热实现；理想情况是工件吸收占主要有用损耗。

---

## 5. 当前标量功率模型为什么还不够

旧模型：

\[
P_{i+1}
=
\tau_i(1-\kappa_i)P_i
\]

忽略了相位。

当前 50 mm cell 的一阶有效介电常数约：

\[
\varepsilon_{\rm eff}\approx3.25\sim3.4
\]

对应：

\[
\lambda_g
\approx66\sim68\ {\rm mm}.
\]

因此：

\[
50\ {\rm mm}
\approx0.74\lambda_g.
\]

单板 through-path 相位约：

\[
\boxed{
\phi_{\rm cell}
\approx265^\circ\sim270^\circ
}
\]

而不是一个“无相位功率块”。

所以真实 Zone 必须按：

\[
\boxed{
\mathbf b=\mathbf S\mathbf a
}
\]

处理。

---

## 6. 50 mm cell 的 through phase：保留天然值作为 seed，但不再冻结 270°

当前 50 mm cell 的一阶传播相位接近：

\[
-265^\circ\sim-270^\circ.
\]

这个值作为 HFSS 搜索起点是合理的，因为它接近真实 FR4 through-line 的天然电长度。

但不再以：

\[
4\times270^\circ\equiv0^\circ
\pmod{360^\circ}
\]

作为冻结该相位的理由。

真正决定工件场的是各 Patch 的复激励：

\[
\mathbf u=(u_A,u_B,u_C,u_D)^T.
\]

若第 \(i\) 个 cell 的 Patch 抽取系数和 through 系数分别为：

\[
p_i=|p_i|e^{j\chi_i},
\qquad
h_i=|h_i|e^{j\theta_i},
\]

则：

\[
u_i=p_iF_i,
\qquad
F_{i+1}=h_iF_i,
\]

从而：

\[
\boxed{
\frac{u_{i+1}}{u_i}=\frac{p_{i+1}h_i}{p_i}.
}
\]

所以相邻 Patch 的目标相位差满足：

\[
\boxed{
\psi_i=\theta_i+\chi_{i+1}-\chi_i.
}
\]

若 A/B/C 的 coupled-branch phase 近似相同，则天然 \(\theta_i\approx+90^\circ\sim+95^\circ\) 会直接形成约 \(+90^\circ\) 的 Patch progressive phase。

因此当前 through-phase 口径改为：

\[
\boxed{
-265^\circ\sim-270^\circ
\text{ 是 candidate phase state，不是最终固定目标。}
}
\]

第一轮完整 Zone 必须比较：

- natural \(+90^\circ\) progression；
- 近同相 progression；
- \(Q\)-matrix 优化得到的目标 progression。

详细综合公式见 docs/10_zone_complex_phase_synthesis_v1.md。

## 7. 反射容差应该比原 VSWR≤2 严格

若局部反射：

\[
|\Gamma|=g,
\]

最坏驻波功率极值比：

\[
\frac{P_{\max}}{P_{\min}}
=
\left(
\frac{1+g}{1-g}
\right)^2.
\]

若希望反射本身不要使功率波动超过原 ±25% 量级：

\[
\frac{P_{\max}}{P_{\min}}
\le
\frac{1.25}{0.75}
=
1.667
\]

得到：

\[
g\lesssim0.127.
\]

即：

\[
\boxed{
RL\gtrsim18\ {\rm dB}
}
\]

\[
\boxed{
VSWR\lesssim1.29
}
\]

所以当前设计不应满足于：

\[
VSWR\le2.
\]

建议板级目标：

- 2.45 GHz：
  \[
  |S_{11}|\le-20\ {\rm dB}
  \]
- 2.40–2.50 GHz：
  \[
  |S_{11}|\le-18\ {\rm dB}
  \]

第一轮若做不到，可放宽到 band 内 -15 dB，但需要在 4 板级联中重新验证功率均匀性。

---

## 8. A/B/C/D 的梯度比例：从“理论精确值”改成“可制造目标值”

在：

\[
L_s\approx0.42\ {\rm dB/cell}
\]

标量模型下，精确 equal-RF-extraction 目标为：

\[
21.5\%,\quad30.2\%,\quad47.6\%,\quad D_{\rm term}.
\]

这些数字不需要保留到 0.1%。

第一轮设计目标建议写成：

\[
\boxed{
\kappa_A=22\%
}
\]

\[
\boxed{
\kappa_B=30\%
}
\]

\[
\boxed{
\kappa_C=48\%\ \text{或直接用 3 dB / 50\% 候选}
}
\]

\[
\boxed{
D=\text{matched terminal radiator}
}
\]

如果 C 直接采用标准 3 dB：

\[
\kappa_C\approx50\%
\]

在 \(L_s=0.42\) dB/cell 下，4 板功率 spread 仍只有约：

\[
0.42\ {\rm dB}
\]

远小于 ±25% 允许范围。

因此：

\[
\boxed{
C\text{ 优先尝试标准 3 dB 结构}
}
\]

比硬追 47.58% 更合理。

---

## 9. 一个更工程化的耦合等级组合

也可以直接用 RF 工程常用 dB 规格：

\[
\boxed{
A=6.5\ {\rm dB}
}
\]

\[
\boxed{
B=5.0\ {\rm dB}
}
\]

\[
\boxed{
C=3.0\ {\rm dB}
}
\]

对应功率耦合：

\[
\kappa_A
=
10^{-6.5/10}
\approx22.4\%
\]

\[
\kappa_B
=
10^{-5/10}
\approx31.6\%
\]

\[
\kappa_C
=
10^{-3/10}
\approx50.1\%.
\]

在：

\[
L_s=0.42\ {\rm dB/cell}
\]

下，若令 D 板抽取：

\[
P_D=5\ {\rm W},
\]

则一阶标量模型得到：

| 板 | RF 抽取功率 |
|---|---:|
| A | 约 5.65 W |
| B | 约 5.62 W |
| C | 约 5.53 W |
| D | 5.00 W |

spread 仅约：

\[
0.52\ {\rm dB}.
\]

而 Zone 输入约：

\[
\boxed{
25.25\ {\rm W}
}
\]

这套参数非常适合作为第一轮 HFSS 参数设计。

---

## 10. 对 cell loss 不确定性的鲁棒性

取：

\[
A=6.5\ {\rm dB},
\quad
B=5\ {\rm dB},
\quad
C=3\ {\rm dB}
\]

并让 D 归一化为 1。

不同 \(L_s\) 下：

| \(L_s\) | A | B | C | D | max/min spread |
|---:|---:|---:|---:|---:|---:|
| 0.20 dB | 0.969 | 1.014 | 1.047 | 1.000 | 0.34 dB |
| 0.30 dB | 1.038 | 1.062 | 1.072 | 1.000 | 0.30 dB |
| 0.42 dB | 1.128 | 1.122 | 1.102 | 1.000 | 0.52 dB |
| 0.50 dB | 1.192 | 1.164 | 1.122 | 1.000 | 0.76 dB |
| 0.60 dB | 1.277 | 1.219 | 1.148 | 1.000 | 1.06 dB |

所以：

\[
\boxed{
6.5/5/3\ {\rm dB}
}
\]

这一组对：

\[
0.2\sim0.6\ {\rm dB/cell}
\]

有很好的容差。

这比过早追求 21.50/30.17/47.58% 更适合作为第一轮制造/仿真参数。

---

## 11. 当前 6 mm proximity coupler 的理论问题

当前：

\[
l_c=6\ {\rm mm}.
\]

而：

\[
\lambda_g/4
\approx16\sim17\ {\rm mm}.
\]

因此：

\[
6\ {\rm mm}
\approx0.09\lambda_g.
\]

它更像一个短的 capacitive/proximity tap，而不是完整的 quarter-wave directional coupler。

这类结构可以作为弱耦合 seed，但不能预先保证：

\[
-6.5\ {\rm dB},
\quad
-5\ {\rm dB},
\quad
-3\ {\rm dB}
\]

同时保持低反射。

所以第一轮设计必须有一个明确 decision gate：

### Route P0 — 保留当前 proximity geometry

扫描：

\[
l_c=4\sim12\ {\rm mm}
\]

\[
g_c=0.2\sim1.0\ {\rm mm}
\]

检查是否能同时满足：

\[
\kappa
\]

和：

\[
RL\ge18\ {\rm dB}.
\]

如果 A/B 能满足，则可保留简单结构。

如果 C 无法达到：

\[
\kappa\approx48\sim50\%
\]

且低反射，则 C 进入 P1。

### Route P1 — quarter-wave matched coupler / hybrid

目标电长度：

\[
\theta_c\approx90^\circ.
\]

物理长度第一版：

\[
\boxed{
l_c=16\sim18\ {\rm mm}
}
\]

---

## 12. quarter-wave coupled-line 的一阶 modal impedance

理想 coupled-line directional coupler：

\[
c=\sqrt{\kappa}
\]

\[
Z_{0e}
=
Z_0
\sqrt{
\frac{1+c}{1-c}
}
\]

\[
Z_{0o}
=
Z_0
\sqrt{
\frac{1-c}{1+c}
}.
\]

取：

\[
Z_0=50\Omega.
\]

得到：

| 板型 | Coupling | \(\kappa\) | \(Z_{0e}\) | \(Z_{0o}\) |
|---|---:|---:|---:|---:|
| A | 6.5 dB | 22.4% | 83.6 Ω | 29.9 Ω |
| B | 5.0 dB | 31.6% | 94.5 Ω | 26.5 Ω |
| C | 3.0 dB | 50.1% | 120.9 Ω | 20.7 Ω |

结论：

- A：中等耦合；
- B：较强耦合；
- C：非常强，接近标准 3 dB hybrid。

C 的 even/odd impedance 分裂非常大，因此：

\[
\boxed{
C\text{ 不应默认用普通 2 层 edge-coupled microstrip 强行实现}
}
\]

优先候选：

1. branch-line hybrid；
2. broadside coupler；
3. 更复杂的 coupled-line；
4. 其它 matched power-divider topology。

---

## 13. C 板的第一候选：3 dB branch-line hybrid

对标准 3 dB branch-line，第一轮理论值：

- 四条支路电长度：
  \[
  90^\circ
  \]
- 约：
  \[
  16\sim18\ {\rm mm}
  \]
- 50 Ω 臂：
  \[
  w\approx2.8\sim3.2\ {\rm mm}
  \]
- 35.35 Ω 臂：
  \[
  w\approx5.0\sim5.5\ {\rm mm}
  \]

裸 FR4 一阶理论宽度约：

\[
w_{50}\approx3.1\ {\rm mm}
\]

\[
w_{35.4}\approx5.3\ {\rm mm}.
\]

有 PP 覆盖后必须重新由 2D/HFSS 调整。

因为 C 的目标只是约 48%，直接采用标准 3 dB / 50% hybrid 是合理第一候选。

---

## 14. A/B 可以先保留 edge-coupled 方向耦合器路线

A：

\[
C_A\approx6.5\ {\rm dB}
\]

B：

\[
C_B\approx5.0\ {\rm dB}.
\]

第一轮都采用：

\[
l_c=16\sim18\ {\rm mm}
\]

然后用 2D eigenmode / HFSS 求：

\[
Z_{0e},Z_{0o}
\]

到：

A：

\[
83.6/29.9\Omega
\]

B：

\[
94.5/26.5\Omega.
\]

不要直接从 gap 猜最终值。

几何变量：

\[
w_c,
\quad
g_c,
\quad
l_c
\]

由 modal impedance 反解。

---

## 15. 当前板子需要新增 isolated-port 设计意识

理想方向耦合器是 4-port：

- Port 1：RF IN；
- Port 2：RF THROUGH；
- Port 3：PATCH；
- Port 4：ISOLATED。

当前 6 mm proximity strip 并没有真正的 isolated port。

如果改成标准方向耦合器，Port 4 需要：

\[
\boxed{
50\Omega\ \text{RF termination}
}
\]

在理想匹配情况下几乎不耗功率，但 Patch mismatch 时会接收反射能量。

因此第一轮 PCB 结构需要预留：

- isolated-port pad；
- RF termination；
- 就近 ground vias。

这属于当前 PCB 下一版必须补的结构。

---

## 16. Patch mismatch 如何反馈到主线

理想方向耦合器中，Patch 端反射系数：

\[
\Gamma_p
\]

通过 coupled port 返回主线输入的一阶量级约：

\[
|\Gamma_{\rm in}|
\sim
\kappa |\Gamma_p|.
\]

因此 C 板最严格。

若：

\[
\kappa_C\approx0.5
\]

并希望：

\[
|\Gamma_{\rm in}|\le0.1
\]

则 Patch 自身最好：

\[
|\Gamma_p|\lesssim0.2.
\]

即：

\[
\boxed{
RL_{\rm patch}\gtrsim14\ {\rm dB}
}
\]

第一轮统一目标建议：

\[
\boxed{
RL_{\rm patch}\ge15\ {\rm dB}
}
\]

中心频点争取：

\[
20\ {\rm dB}.
\]

---

## 17. Zone 不能再用 S 参数直接相乘

每块加载 Patch 后先得到有效 2-port：

\[
S^{(2)}_i.
\]

若原网络是多端口，加载 reduction：

\[
\boxed{
S_{\rm eff}
=
S_{aa}
+
S_{ab}\Gamma_L
(I-S_{bb}\Gamma_L)^{-1}
S_{ba}
}
\]

然后将每个 2-port 转成 ABCD / chain matrix：

\[
M_i=
\begin{bmatrix}
A_i&B_i\\
C_i&D_i
\end{bmatrix}.
\]

4 板 Zone：

\[
\boxed{
M_{\rm zone}
=
M_A M_B M_C
}
\]

最后以 D 的终端输入阻抗：

\[
Z_D
\]

作为 load。

由：

\[
Z_{\rm in}
=
\frac{AZ_D+B}
{CZ_D+D}
\]

得到 Zone 输入匹配。

这才是后续正式的理论级联方法。

---

## 18. D 板的参数目标

D 不再叫：

\[
\kappa_D=100\%
\]

的“强 coupler”。

D 是：

\[
\boxed{
\text{matched terminal radiator}
}
\]

第一轮目标：

\[
S_{11,D}(2.45{\rm GHz})
\le-20\ {\rm dB}
\]

band 内：

\[
S_{11,D}
\le-15\sim-18\ {\rm dB}.
\]

D 的输入直接匹配到 Patch/workpiece，不再保留 RF OUT。

D 的初始 Patch 几何仍从：

\[
37.5\times28.5\ {\rm mm}
\]

和：

\[
y_{\rm inset}=10.5\ {\rm mm}
\]

开始。

---

## 19. 第一轮 A/B/C/D 参数表

| 参数 | A | B | C | D |
|---|---:|---:|---:|---:|
| 功率耦合目标 | 22–24% | 30–32% | 48–50% | terminal |
| RF coupling level | 6.5–6.7 dB | 5.0–5.2 dB | 3.0–3.2 dB | — |
| coupler electrical length | 90°候选 | 90°候选 | 90° hybrid | — |
| coupler physical length seed | 16–18 mm | 16–18 mm | 16–18 mm | — |
| \(Z_{0e}\) seed | 84 Ω | 94 Ω | 121 Ω | — |
| \(Z_{0o}\) seed | 30 Ω | 26.5 Ω | 20.7 Ω | — |
| Patch W | 36–39 mm | 36–39 mm | 36–39 mm | 36–39 mm |
| Patch L | 27–30 mm | 27–30 mm | 27–30 mm | 27–30 mm |
| inset | 8.5–12.5 mm | 8.5–12.5 mm | 8.5–12.5 mm | 8.5–12.5 mm |
| board RL @2.45 | ≥20 dB | ≥20 dB | ≥20 dB | ≥20 dB |
| band RL target | ≥18 dB | ≥18 dB | ≥18 dB | ≥15–18 dB |
| through phase | -270°±10° | -270°±10° | -270°±10° | terminal |

---

## 20. 第一轮 Zone 功率设计

采用：

\[
A=6.5\ {\rm dB},
\quad
B=5\ {\rm dB},
\quad
C=3\ {\rm dB}
\]

和：

\[
L_s=0.42\ {\rm dB/cell}.
\]

若：

\[
P_D=5\ {\rm W},
\]

则：

\[
P_A\approx5.65\ {\rm W}
\]

\[
P_B\approx5.62\ {\rm W}
\]

\[
P_C\approx5.53\ {\rm W}
\]

\[
P_D=5.00\ {\rm W}.
\]

Zone 输入：

\[
\boxed{
P_{\rm zone,in}\approx25.25\ {\rm W}
}
\]

全部落在原 5–8 W/块区间。

如果板数少、允许提高单板功率，可整体线性缩放。

例如：

\[
P_D=7\ {\rm W}
\]

则约：

\[
7.91,\ 7.87,\ 7.75,\ 7.00\ {\rm W}.
\]

仍基本落在 5–8 W 区间。

---

## 21. 多 Zone 的输入功率比例

在同一组 A/B/C/D 参数下，以 D 板目标功率 \(q\) 为单位：

完整 4 板 Zone：

\[
P_{ABCD,\rm in}
\approx5.05q.
\]

3 板 B-C-D：

\[
P_{BCD,\rm in}
\approx3.56q.
\]

2 板 C-D：

\[
P_{CD,\rm in}
\approx2.21q.
\]

1 板 D：

\[
P_{D,\rm in}=q.
\]

所以 distribution manifold 不应该给不同长度 Zone 同样输入功率，而应按：

\[
\boxed{
5.05:3.56:2.21:1
}
\]

作为当前 0.42 dB/cell 下的第一轮分配比例。

真实比例以后由实际 S 参数重算。

---

## 22. 当前最重要的参数设计决策

### 保留

- 50×50 mm board；
- 37.5×28.5 mm Patch seed；
- 2.9 mm main-line seed；
- 10.5 mm inset seed；
- Bottom continuous Ground；
- 1–4 board Zone；
- A/B/C/D 位置等级。

### 不再冻结

- 6 mm coupler length；
- 0.5 mm gap 作为最终耦合尺寸；
- 21.50/30.17/47.58% 的过度精确数值；
- VSWR≤2 作为足够匹配；
- 标量功率递推作为最终系统模型。

### 新的第一轮冻结目标

\[
\boxed{
A=6.5\ {\rm dB},
\quad
B=5.0\ {\rm dB},
\quad
C=3.0\ {\rm dB}
}
\]

\[
\boxed{
l_c\approx16\sim18\ {\rm mm}
}
\]

\[
\boxed{
RL_{\rm board}\ge20\ {\rm dB}@2.45GHz
}
\]

\[
\boxed{
\phi_{\rm through}\approx-270^\circ
}
\]

\[
\boxed{
D=\text{matched terminal Patch}
}
\]

---

## 23. 下一步仿真顺序

1. **50 mm plain through-line**
   - \(Z_0\)
   - \(S_{11}\)
   - \(S_{21}\)
   - \(\tau\)
   - phase / group delay

2. **bare Patch**
   - \(f_r\)
   - \(RL\)
   - loaded Q
   - PP sensitivity

3. **current 6 mm proximity coupler feasibility**
   - 判断 A/B 是否还能保留简单结构

4. **quarter-wave A coupler**
   - 6.5–6.7 dB

5. **quarter-wave B coupler**
   - 5.0–5.2 dB

6. **C 3 dB structure**
   - edge-coupled 先试
   - 失败则 branch-line hybrid

7. **D terminal Patch**

8. **A/B/C/D loaded multiport extraction**

9. **complex S/ABCD 4-board cascade**

10. **加入工件**
    - 再从 equal RF extraction 修正到 equal absorbed power

---

## 24. 当前理论结论

当前方案最重要的升级不是继续微调 6 mm / 0.5 mm，而是：

\[
\boxed{
\text{把“一个简单 proximity tap”升级成“可控、可匹配、可级联的 RF power-extraction cell”。}
}
\]

在此基础上，A/B/C/D 才真正具备工程意义。\n\n更高一级的设计原则见 docs/06_patch_design_rationale_v1.md 第 19–30 节；复相位综合见 docs/10_zone_complex_phase_synthesis_v1.md。这里的 6.5/5/3 dB 统一解释为第一轮 scalar-budget seed，最终允许为了目标复激励 \\(\\mathbf u_*\\) 改变 coupling magnitude、coupled-port phase 与 through phase。


---

## 25. PCB 代码落地状态

本理论已在 `pcb/tscircuit` 中落地为四个独立导出入口：

- `index-a.tsx`
- `index-b.tsx`
- `index-c.tsx`
- `index-d.tsx`

当前代码实现：

- A：6.5 dB 目标，17 mm quarter-wave-scale side-coupler seed；
- B：5.0 dB 目标，17 mm quarter-wave-scale side-coupler seed；
- C：3.0 dB 目标，17 mm strong-coupler seed；
- D：取消 RF OUT，作为 terminal Patch seed；
- A/B/C 增加 isolated-end 50 Ω termination placement seed；
- 四种板继续共用 37.5 × 28.5 mm Patch 和 10.5 mm inset 基线。

必须强调：

[
oxed{
g_A=0.70 {m mm},
quad
g_B=0.45 {m mm},
quad
g_C=0.30 {m mm}
}
]

目前只是 HFSS 搜索初值，不是由 modal solver 得出的最终 gap。

特别是 C：

[
oxed{
	ext{若 side-coupled seed 无法同时达到约 3 dB coupling 和高 return loss，直接切换 hybrid / matched divider。}
}
]

PCB 代码现在的任务是让 A/B/C/D 设计空间、端口角色和 Gerber/Circuit JSON 交付链路先一致，不能把代码里的 seed 尺寸写成已经完成的电磁优化结果。
