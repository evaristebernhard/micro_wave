# 扩展板高 + matched-extraction T-cell 解析设计 V1

> 目标：允许 PCB 尺寸增大后，重新比较标准 quadrature coupler 与 matched extraction T-cell。核心约束是不改变 50 mm 水平 Patch 节距，因此只增加板高。

## 1. 当前工程包络：RF 约需 50×60 mm；tscircuit 工程板采用 50×70 mm 居中外形

原始机械目标是：

\[
50\times50\ {\rm mm}.
\]

当前预仿真工程包络采用：

\[
\boxed{50\times70\ {\rm mm}}.
\]

板中心设为：

\[
\boxed{y_c=0}.
\]

因此 y 边界由原来的：

\[
[-25,+25]\ {\rm mm}
\]

变为：

\[
\boxed{[-35,+35]\ {\rm mm}}.
\]

额外 10 mm 全部增加在下方 RF/控制网络一侧。Patch、RF IN/OUT、磁吸接口及顶部边界保持原参考坐标。

板宽仍为：

\[
\boxed{50\ {\rm mm}},
\]

所以相邻 Patch 的水平节距仍是 50 mm，不改变 progressive-phase 参考。这个方案与 50×60、center=0 具有相同的 -35 mm 下边界，但总高度少 10 mm。

## 2. 扩板以后标准 C branch-line hybrid 已经从“放不下”变成“可以作为真实候选”

前一轮算得标准 3 dB branch-line 的同层最小铜包络约：

\[
W_{\rm env}\approx19.68\ {\rm mm},
\qquad
H_{\rm env}\approx22.25\ {\rm mm}.
\]

当前 Patch 下缘仍为：

\[y=-9.25\ {\rm mm}.\]

新板底为：

\[y=-35\ {\rm mm}.\]

所以 Patch 下方总空间为：

\[
-9.25-(-35)
=
\boxed{25.75\ {\rm mm}}.
\]

扣除 hybrid 高度：

\[
25.75-22.25
=
\boxed{3.50\ {\rm mm}}.
\]

这 3.5 mm 可以分配给 Patch/hybrid 间距和底部制造余量。

因此之前“standard branch-line 不能作为 fallback”的结论需要更新为：

\[
\boxed{
\text{50×50 下放不下；50×60 下重新成为可实现候选。}
}
\]

## 3. 但扩大板子并不能解决 A/B/C 普通 edge-coupled gap 的问题

板子变大只解决 footprint。

它不会把：

\[
0.70/0.45/0.30\ {\rm mm}
\]

自动变成 6.5/5/3 dB edge coupling。

前一轮准静态反算仍然有效：

- A 当前 seed 约 13.2 dB；
- B 当前 seed 约 11.5 dB；
- C 当前 seed 约 10.3 dB。

所以 amplitude topology 仍然必须重新设计。

## 4. matched-extraction T-cell

设局部下游等效负载为：

\[Z_0=50\ \Omega,\]

目标从该 cell 抽取功率比例：

\[\kappa.\]

希望 junction 的 branch conductance 占总 conductance 的比例为 \(\kappa\)。

则 Patch branch 在 T 点应呈现：

\[
\boxed{
R_b
=
50\frac{1-\kappa}{\kappa}.
}
\]

T junction 总等效阻抗：

\[
R_J
=
50\parallel R_b
=
\boxed{50(1-\kappa)}.
\]

输入侧使用四分之一波阻抗变换器：

\[
\boxed{
Z_t
=
50\sqrt{1-\kappa}.
}
\]

Patch 支路使用四分之一波变换器：

\[
\boxed{
Z_b
=
50\sqrt{\frac{1-\kappa}{\kappa}}.
}
\]

这在中心频率下同时实现指定 extraction 与 input match。

## 5. A/B/C 的一阶 T-cell 参数

取 FR4：

\[
\varepsilon_r=4.3,
\qquad
h=1.6\ {\rm mm},
\qquad
f_0=2.45\ {\rm GHz}.
\]

按 Hammerstad 单微带近似得到：

| Board | κ | Zt | Wt | λg,t/4 | Zb | Wb | λg,b/4 |
|---|---:|---:|---:|---:|---:|---:|---:|
| A | 0.224 | 44.05 Ω | 3.82 mm | 16.77 mm | 93.06 Ω | 0.88 mm | 17.65 mm |
| B | 0.316 | 41.35 Ω | 4.21 mm | 16.60 mm | 73.56 Ω | 1.52 mm | 17.39 mm |
| C | 0.501 | 35.32 Ω | 5.32 mm | 16.52 mm | 49.90 Ω | 3.13 mm | 16.92 mm |

所有线宽都属于普通 PCB 尺寸。

与几十微米 coupled gap 相比，可制造性明显更好。

## 6. T-cell 的相位不是额外问题，反而天然闭合

四分之一波 series transformer 从 cell input 到 T 点产生约：

\[
-90^\circ.
\]

Patch branch 再通过四分之一波 transformer：

\[
-90^\circ.
\]

所以 Patch 相位相对本 cell input 为：

\[
\boxed{-180^\circ}.
\]

若 T 点到下一 cell reference plane 的 50 Ω 总路径为半波：

\[
-180^\circ,
\]

则整 cell through phase：

\[
\boxed{
-90^\circ-180^\circ
=
-270^\circ
\equiv+90^\circ.
}
\]

于是相邻 Patch phase 自动满足：

\[
(-270^\circ-180^\circ)-(-180^\circ)
=
-270^\circ
\equiv
\boxed{+90^\circ}.
\]

所以这个 topology 同时解决 amplitude 与 phase。

## 7. 50 mm 模块节距与约 6 mm 磁吸连接桥恰好互补

50 Ω 线的一阶半波长度约：

\[
\boxed{
L_{50,1/2}\approx33.84\ {\rm mm}.
}
\]

用 0.5 mm input lead 作为 seed，并让 branch transformer 直接连到 Patch inset reference，可得到：

| Board | T 点 x | T 点 y | 板内 T→RF OUT | 为半波还需 bridge 等效长度 |
|---|---:|---:|---:|---:|
| A | -5.23 mm | -15.61 mm | 27.73 mm | 6.11 mm |
| B | -5.30 mm | -15.31 mm | 27.80 mm | 6.04 mm |
| C | -5.48 mm | -14.76 mm | 27.98 mm | 5.87 mm |

三个 board 的 bridge 需求集中在：

\[
\boxed{5.9\sim6.1\ {\rm mm}}.
\]

所以可以统一采用：

\[
\boxed{L_{\rm bridge,eff}\approx6.0\ {\rm mm}}
\]

作为磁吸连接桥的预设计电长度。

这个结果意味着无需在 through path 上人为做长 meander。

## 8. D terminal 在 T-cell architecture 下也更简单

C 的下一 cell input 已经相对 C input 滞后：

\[
-270^\circ.
\]

而 C Patch 相位是：

\[
-180^\circ.
\]

为了让 D Patch 再前进 +90°，D Patch 应相对 C input 位于：

\[
-90^\circ.
\]

所以相对 D input 需要额外：

\[
-180^\circ.
\]

即 D 只需一个约 50 Ω 半波 feed：

\[
\boxed{
L_D^{(T)}\approx33.84\ {\rm mm}.
}
\]

这与前一版 coupled-line architecture 得到的 35.34 mm 数量级非常接近。

## 9. T-cell 的真正风险

T-cell 是一个 reciprocal 3-port junction。

它的主要缺点不是匹配公式，而是：

\[
\boxed{
\text{through output 与 Patch branch 没有理想隔离。}
}
\]

工件加载导致 Patch impedance 改变时，反射可能沿 through chain 传播。

所以后续必须比较：

1. matched T-cell；
2. enlarged-board quadrature hybrid；
3. unequal Wilkinson / resistively isolated divider；
4. compact coupled/hybrid topology。

如果 Patch loaded reflection 在工作范围内已经很小，T-cell 是最简单、最可制造的方案。

如果反射敏感，则应付出板面积或器件代价换 isolation。

## 10. 当前建议

当前不再把 50×50 视为硬边界。

PCB 基准机械外形更新为：

\[
\boxed{50\\times70\ {\rm mm}}
\]

且向下单侧扩展，以保持全部已有 RF phase reference。

RF architecture 的优先顺序暂定：

\[
\boxed{
\text{T-cell 解析主方案}
\rightarrow
\text{extended-board hybrid 对照方案}
}
\]

HFSS/openEMS 应分别校正两者，而不是继续在原 0.3–0.7 mm edge-gap 上盲扫。