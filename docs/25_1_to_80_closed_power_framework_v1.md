# 1–80 块磁吸天线系统闭合功率理论框架 V2

> 本文已按 docs/26_physical_correction_analytic_closure_v1.md 修正。
>
> 关键修正：纯无源固定 PCB 不能仅靠改变源功率实现 board-count-adaptive taper，因此 1–80 通用硬件改用 **equal accepted RF power baseline**。field-aware outer-strong taper 仅保留为低板数/可重构优化模式。

---

## 1. 正式系统边界

\[
\boxed{1\le N\le80}
\]

代表验收：

\[
\boxed{N=5,\ 25,\ 80}
\]

最大源功率：

\[
\boxed{P_{\rm src,max}=500\ {\rm W}}
\]

单板 accepted RF：

\[
\boxed{5\le E_i\le8\ {\rm W}}
\]

组内均匀性：

\[
\boxed{
\max_i
\left|
\frac{E_i}{\bar E}-1
\right|
\le25\%.
}
\]

通用 passive baseline 直接采用：

\[
\boxed{
E_1=E_2=\cdots=E_N=E.
}
\]

因此 nominal power deviation 在理论目标层为 0%，天然满足 ±25%。

---

## 2. 为什么 80 块强迫 equal-power

80 块若每板至少 5 W：

\[
80\times5=400\ {\rm W}.
\]

如果 useful RF budget 取 400 W，则所有板必须恰好：

\[
\boxed{E_i=5\ {\rm W}}.
\]

任何固定 outer-strong taper 都会使总 useful RF 超过 400 W。

此前低/中板数得到的：

\[
7.92/5.08/5.08/7.92\ {\rm W}
\]

平均约 6.5 W。若对 80 块重复：

\[
80\times6.5=520\ {\rm W},
\]

因此不能作为 universal passive baseline。

---

## 3. Zone 分解

总板数：

\[
\boxed{
N=4M+r,\qquad
r\in\{0,1,2,3\}.
}
\]

完整 Zone：

\[
A\to B\to C\to D_{\rm term}.
\]

80 块：

\[
\boxed{20\times4\text{-board Zone}}.
\]

余数 \(r\) 使用 partial Zone。

系统机械上可以连续磁吸，但 RF 不采用一条 4 m 普通 FR4 长链。

---

## 4. loss-aware equal-power synthesis

定义：

\[
\tau
=
10^{-L_{\rm cell}/10}.
\]

并定义：

\[
\boxed{
A_m(\tau)
=
\sum_{k=0}^{m-1}\tau^{-k},
\qquad A_0=0.
}
\]

一个 m-board Zone 每板目标 E 时：

\[
\boxed{
P_{\rm zone}^{(m)}
=
EA_m.
}
\]

完整 N-board 系统所有 local Zone 入口总需求：

\[
\boxed{
P_{\rm zones}
=
E C_N,
}
\]

其中：

\[
\boxed{
C_N
=
M A_4+A_r.
}
\]

---

## 5. fixed A/B/C/D extraction

m-board Zone 中：

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
EA_{m-i+1}.
\]

于是：

\[
\boxed{
\kappa_i
=
\frac1{A_{m-i+1}}.
}
\]

因此 κ 与绝对 E 无关。

对：

\[
L_{\rm cell}=0.42\ {\rm dB},
\]

得到：

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
\kappa_C=47.584\%.
}
\]

D 为 terminal。

这组参数重新作为 universal equal-power passive seed。

---

## 6. upstream loss

定义 worst-path upstream insertion loss：

\[
L_{\rm up}
=
L_{\rm cable}
+
L_{\rm adapter}
+
L_{\rm manifold}
+
L_{\rm bridge}
+
L_{\rm connector}.
\]

\[
\eta_{\rm up}
=
10^{-L_{\rm up}/10}.
\]

因此：

\[
\boxed{
P_{\rm src}(N,E)
=
E C_N
10^{L_{\rm up}/10}.
}
\]

给定 500 W 后：

\[
\boxed{
E_{\max}(N)
=
\frac{
500\,10^{-L_{\rm up}/10}
}{
C_N
}.
}
\]

实际控制目标：

\[
\boxed{
E_{\rm cmd}(N)
=
\min
\left(
6.5,\,
E_{\max}(N)
\right)
}
\]

并必须满足：

\[
\boxed{
E_{\rm cmd}(N)\ge5.
}
\]

---

## 7. 80-board exact closure

80 块：

\[
C_{80}=20A_4.
\]

5 W/板要求：

\[
5C_{80}
10^{L_{\rm up}/10}
\le500.
\]

等价于：

\[
\boxed{
\eta_4\eta_{\rm up}\ge0.80,
}
\]

其中：

\[
\eta_4
=
\frac4{A_4}.
\]

定义：

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
\le0.9691\ {\rm dB}.
}
\]

这是 80-board 的最终理论 gate。

---

## 8. loss trade-off

| \(L_{\rm cell}\) | \(\eta_4\) | 允许的 \(L_{\rm up,max}\) |
|---:|---:|---:|
| 0.30 dB | 89.89% | 0.506 dB |
| 0.32 dB | 89.23% | 0.474 dB |
| 0.35 dB | 88.25% | 0.426 dB |
| 0.36 dB | 87.93% | 0.410 dB |
| 0.38 dB | 87.28% | 0.378 dB |
| 0.40 dB | 86.64% | 0.346 dB |
| 0.42 dB | 85.99% | 0.314 dB |

小损耗近似：

\[
\boxed{
L_{\rm zone}
\approx1.5L_{\rm cell}.
}
\]

所以：

\[
\boxed{
L_{\rm up}
+
1.5L_{\rm cell}
\lesssim0.969\ {\rm dB}.
}
\]

---

## 9. 当前 0.42 dB/cell 下的 5 / 25 / 80

取：

\[
L_{\rm cell}=0.42\ {\rm dB}
\]

且先取：

\[
L_{\rm up}=0.30\ {\rm dB}.
\]

则：

### N=5

\[
C_5
=
A_4+A_1
=
5.6515.
\]

6.5 W/板：

\[
P_{\rm src}
\approx39.4\ {\rm W}.
\]

### N=25

\[
C_{25}
=
6A_4+A_1
\approx28.909.
\]

6.5 W/板：

\[
P_{\rm src}
\approx201.3\ {\rm W}.
\]

### N=80

\[
C_{80}
=
20A_4
\approx93.030.
\]

此时：

\[
E_{\max}
\approx5.016\ {\rm W}.
\]

所以 80-board 可以达到约：

\[
5.0\ {\rm W/board}
\]

但 margin 很小。

若：

\[
L_{\rm up}=0.314\ {\rm dB},
\]

则 80×5 W 基本刚好触及 500 W。

---

## 10. 5 m ≤0.5 dB 的重新判断

如果线缆本身已经：

\[
0.5\ {\rm dB},
\]

则：

\[
L_{\rm up}\ge0.5\ {\rm dB}.
\]

当前 \(L_{\rm cell}=0.42\) dB 允许的上游总损耗只有：

\[
0.314\ {\rm dB}.
\]

所以：

\[
\boxed{
0.42\ {\rm dB/cell}
+
0.5\ {\rm dB upstream}
}
\]

不能支持 80×5 W。

若 upstream 已经 0.5 dB，则要使 80-board 勉强闭合：

\[
\boxed{
L_{\rm cell}\lesssim0.304\ {\rm dB}.
}
\]

实际还要给 adapter/manifold/bridge 留余量，因此设计目标应更低。

---

## 11. universal baseline 与 optional field-aware mode

### Universal passive mode

目标：

\[
\boxed{
E_A=E_B=E_C=E_D.
}
\]

优先级：

1. loss；
2. equal-power extraction；
3. loaded match；
4. heating efficiency；
5. field shaping。

### Optional field-aware mode

此前：

\[
\mathbf u
\propto
(1,0.801e^{-j5.3^\circ},0.801e^{-j5.3^\circ},1)
\]

继续保留，但只能用于：

- 低板数；
- 独立外部分配；
- 可切换 coupling；
- 可切换 phase network；
- 或不同 hardware SKU。

不能把它写成 1–80 同一无源 PCB 的唯一默认结构。

---

## 12. full-wave 只需要校准的量

理论架构固定后，仿真只需要给出：

\[
L_{\rm cell}(f),
\]

\[
S_{\rm contact}(f),
\]

\[
S_{\rm bridge}(f),
\]

\[
\beta(f),
\]

\[
Z_{\rm loaded}(f),
\]

以及：

\[
\eta_{\rm work}.
\]

代入本文公式即可得到：

\[
\kappa_i,
\quad
E_{\max}(N),
\quad
P_{\rm src}(N),
\quad
N_{\max}.
\]

详细物理闭合见 docs/26_physical_correction_analytic_closure_v1.md。
