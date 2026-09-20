# T-cell 最终参考面与磁吸桥相位模型 V1

> 本文把 matched-extraction T-cell 的最新 PCB seed 与参考面口径固定下来。它覆盖 `docs/16_extended_board_tcell_design_v1.md` 中较早的几何近似值。

## 1. 当前参考面

当前 PCB 工程采用：

\[
f_0=2.45\ {\rm GHz},
\qquad
Z_0=50\ \Omega.
\]

50 Ω FR4 微带一阶参数：

\[
w_{50}\approx3.137\ {\rm mm},
\]

\[
\lambda_{g,50}/4\approx16.921\ {\rm mm},
\qquad
\lambda_{g,50}/2\approx33.842\ {\rm mm}.
\]

Patch inset 长度：

\[
L_{\rm inset}=10.5\ {\rm mm},
\]

对应约：

\[
\boxed{\phi_{\rm inset}\approx55.84^\circ}.
\]

因此 inset 不再被忽略，而是作为所有 A/B/C/D 共同的 Patch-local phase。

## 2. A/B/C T 点

最新解析/PCB seed：

| Board | T junction (mm) | Zt / width / λ/4 | Zb / width / λ/4 |
|---|---|---|---|
| A | (-6.967, -25.453) | 44.045 Ω / 3.845 mm / 16.779 mm | 93.063 Ω / 0.877 mm / 17.637 mm |
| B | (-6.919, -25.196) | 41.352 Ω / 4.235 mm / 16.710 mm | 73.562 Ω / 1.521 mm / 17.382 mm |
| C | (-6.878, -24.708) | 35.320 Ω / 5.337 mm / 16.543 mm | 49.900 Ω / 3.147 mm / 16.919 mm |

输入 quarter-wave transformer 从：

\[
(-22.0,-18.0)
\]

开始；左侧磁吸 signal contact reference 仍在约：

\[
(-22.5,-18.0).
\]

所以两者之间保留一个很短的 contact transition/reference section。

## 3. 板内 through tail

T junction 到 RF OUT reference：

| Board | on-board through tail | 半波尚缺的 FR4-equivalent length |
|---|---:|---:|
| A | 30.395 mm | 3.448 mm |
| B | 30.286 mm | 3.556 mm |
| C | 30.134 mm | 3.708 mm |

如果错误地把真实 5 mm 磁吸桥全部当成 FR4 50 Ω 微带，会产生过多相位。

正确做法是把桥作为独立传播介质/不连续结构处理。

## 4. 5 mm 物理磁吸桥只需要约 19° electrical phase

当前物理 contact span seed：

\[
\boxed{L_{\rm bridge,physical}=5.0\ {\rm mm}}.
\]

要求的桥相位分别约：

\[
\phi_{b,A}=18.34^\circ,
\qquad
\phi_{b,B}=18.92^\circ,
\qquad
\phi_{b,C}=19.72^\circ.
\]

统一工程 seed：

\[
\boxed{\phi_b\approx19.0^\circ}.
\]

于是三板残差仅：

\[
\boxed{
(-0.66^\circ,-0.08^\circ,+0.72^\circ)
}
\]

数量级已经属于 HFSS/openEMS fine calibration。

若把 5 mm bridge 粗略等效为均匀传播段，则对应的有效介电常数约：

\[
\varepsilon_{\rm eff,bridge}
\approx
(1.55,1.65,1.80)
\]

这不是材料介电常数声明，而是把接触片、空气/PP、局部磁吸结构和不连续效应压缩成一个 phase-equivalent 参数。

## 5. 为什么这个模型比“5 mm=5 mm FR4”更合理

磁吸连接处并不是连续 FR4 microstrip：

- 存在接触片/弹片/磁吸结构；
- 局部场有较大空气与塑料占比；
- ground return 路径发生改变；
- 存在 step/discontinuity capacitance 与 inductance；
- phase delay 不能仅用板内 \(\varepsilon_{\rm eff}\) 外推。

因此 bridge 本来就应该是独立的二端口 S-parameter block。

后续全波流程应单独求：

\[
S^{(bridge)}(f)
\]

然后再与板内 transmission-line / extraction cell 做复数级联。

## 6. D terminal

D 使用直接的 pre-inset half-wave feed：

\[
\boxed{L_D^{\rm pre-inset}\approx33.842\ {\rm mm}}.
\]

当前折线路径 seed：

\[
(-22.5,-18)
\rightarrow
(-6.952,-24.677)
\rightarrow
(0,-9.25).
\]

之后再经过共同的：

\[
10.5\ {\rm mm}\quad(55.84^\circ)
\]

inset feed。

所以 D 的 local Patch phase seed 为：

\[
\boxed{-235.84^\circ}.
\]

## 7. PCB 设计决策

当前 T-cell Gerber seed 采用：

1. 50×60 mm engineering envelope，board center y=-5 mm，边界 y∈[-35,25] mm；
2. 50 mm 水平 Patch pitch 不变；
3. A/B/C 使用普通可制造线宽的 unequal extraction T-cell；
4. RF conductor 用单一连续 polygon 表示，避免多 pad 伪断路；
5. 5 mm 磁吸 bridge 单独建模，不硬套 FR4 phase velocity；
6. A/B/C 共用约 19° bridge phase seed；
7. D 使用 33.842 mm pre-inset half-wave direct feed。

这已经形成一套可以直接进入 HFSS/openEMS 校正的完整 reduced-order geometry，而不是等待仿真从零搜索。