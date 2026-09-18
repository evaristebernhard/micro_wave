# A/B/C edge-coupled 微带可实现性反算 V1

> 本文用 Hammerstad–Jensen 对称 coupled-microstrip 准静态公式，对当前 A/B/C quarter-wave edge-coupled 路线做预仿真反算。目的不是替代 HFSS，而是在仿真前排除数量级错误。

参考模型的适用变量为：

\[
u=w/h,\qquad g=s/h,
\]

并由 even/odd mode 得到：

\[
Z_{0S}=\sqrt{Z_{0e}Z_{0o}}.
\]

对 quarter-wave directional coupler，目标 modal impedances 为：

\[
Z_{0e}=Z_0\sqrt{\frac{1+C}{1-C}},
\qquad
Z_{0o}=Z_0\sqrt{\frac{1-C}{1+C}},
\]

其中 \(C\) 是电压耦合系数。

---

## 1. 当前几何的一阶预测

取：

\[
h=1.6\ {\rm mm},
\qquad
w=2.9\ {\rm mm},
\qquad
\varepsilon_r=4.3.
\]

对当前 gap seed：

| Board | gap seed | 预测 Ze | 预测 Zo | \(\sqrt{ZeZo}\) | 预测 coupling | 预测功率耦合 |
|---|---:|---:|---:|---:|---:|---:|
| A | 0.70 mm | 61.8 Ω | 39.7 Ω | 49.5 Ω | 13.22 dB | 4.76% |
| B | 0.45 mm | 63.2 Ω | 36.7 Ω | 48.2 Ω | 11.54 dB | 7.02% |
| C | 0.30 mm | 64.1 Ω | 34.2 Ω | 46.9 Ω | 10.34 dB | 9.24% |

这说明当前 0.70/0.45/0.30 mm 只能继续作为“有耦合结构的展示/搜索起点”，不能再被解释成 6.5/5/3 dB 的几何近似。

尤其 C：

\[
9.2\%\ll50\%.
\]

---

## 2. 反解理想 modal impedance 所需的同层几何

当前目标：

| Board | target coupling | Ze target | Zo target |
|---|---:|---:|---:|
| A | 6.5 dB | 83.6 Ω | 29.9 Ω |
| B | 5.0 dB | 94.5 Ω | 26.5 Ω |
| C | 3.0 dB | 120.9 Ω | 20.7 Ω |

用 coupled-microstrip 公式同时反解线宽 \(w\) 与 gap \(s\)：

### A

\[
\boxed{
w_A\approx2.04\ {\rm mm},
\qquad
s_A\approx0.058\ {\rm mm}.
}
\]

### B

\[
\boxed{
w_B\approx1.70\ {\rm mm},
\qquad
s_B\approx0.018\ {\rm mm}.
}
\]

### C

即使把 normalized gap 压到 Hammerstad–Jensen 常用公式有效域下沿附近：

\[
g\approx0.0101
\Rightarrow
s\approx0.016\ {\rm mm},
\]

仍只能得到约：

\[
Z_{0e}\approx102.1\ \Omega,
\qquad
Z_{0o}\approx26.9\ \Omega,
\]

明显达不到：

\[
120.9/20.7\ \Omega.
\]

所以：

\[
\boxed{
\text{C 的 3 dB 目标不能靠当前普通同层对称 edge-coupled microstrip 解决。}
}
\]

---

## 3. 即使固定 2.9 mm 线宽，结果也一样

固定：

\[w=2.9\ {\rm mm},\]

反解 6.5 dB coupling，需要：

\[
\boxed{s\approx0.023\ {\rm mm}.}
\]

而 5 dB、3 dB 在公式正常 gap 范围内已经不可达。

因此问题不是简单把 0.70 mm 改成 0.30 mm 或 0.10 mm。

---

## 4. 新结论：A/B/C 的 amplitude architecture 也需要重新综合

此前最新理论 gap 是 phase DOF；本轮结果说明 amplitude topology 本身也存在结构性 gap。

当前必须把：

\[
\boxed{
\text{single-layer edge-coupled line}
}
\]

从“默认实现方式”降级为：

\[
\boxed{
\text{calibration / weak-coupling candidate}.
}
\]

后续需要比较至少两类可制造路线：

1. compact quadrature coupler（保持四端口隔离和约 ±90° branch phase）；
2. matched extraction T-cell / unequal divider（牺牲理想方向性，以更简单的阻抗变换实现指定取能）。

第二类尤其值得继续做解析设计，因为它不依赖几十微米 coupled gap。

---

## 5. 对当前 PCB 的立即处理

当前 PCB 不应把：

\[
g_A=0.70,\quad g_B=0.45,\quad g_C=0.30\ {\rm mm}
\]

标成“接近目标 coupling 的尺寸”。

正确口径改为：

- 它们是 topology/calibration seed；
- 预计耦合只有约 13.2/11.5/10.3 dB；
- 完整 A/B/C amplitude target 必须由新的 matched extraction topology 或更强 compact coupler 实现；
- phase trim 与 Q-matrix 思路继续保留，因为它们与具体 amplitude topology 可以重新组合。

---

## 6. 为什么这个结果反而有利于后续设计

这一步把一个原本可能在 HFSS 中浪费大量参数扫描时间的问题提前排除了。

现在 HFSS 不需要花大量计算回答：

> 0.3–0.8 mm gap 能否调到 3–6 dB？

准静态反算已经说明：

\[
\boxed{\text{基本不能。}}
\]

后续计算资源应直接投入更合理的 amplitude topology。