# 四板串联 Zone 的解析闭合 V1

> **状态更新（2026-09-20）：本文的通用递推和 T-cell 公式仍有效；其中 equal-power 与 +90° progressive phase 只保留为解析 benchmark。当前 field-aware 主解与统一优先级见 `docs/23_few_mode_robust_field_synthesis_v1.md`、`docs/24_theory_closure_master_v1.md`。**
>
> 目标：在不依赖下一轮全波参数搜索的前提下，把 A→B→C→D 四块独立磁吸板串联组成一个 RF Zone 的功率递推、T-cell 分流、相位闭合和系统功率尺度先解析确定。后续 openEMS/HFSS 只负责校正实际传播常数、损耗、Patch 负载和不连续效应。

## 1. 架构定义

当前主架构为：

\[
\boxed{
\text{Zone input}
\to A \to B \to C \to D_{\mathrm{term}}
}
\]

A/B/C 是取能 + 继续传输的中间板；D 是终端辐射板。

四块板不是焊成一张大 PCB，而是四块独立模块，通过磁吸 RF 接口串联。每块都有自己的 Patch。

设第 \(i\) 块入口前向功率为 \(P_i\)，目标每块 Patch 接受相同 RF 功率 \(E\)，through path 的功率传输效率为 \(\tau_i\)。

则中间级满足

\[
P_{i+1}=\tau_i(P_i-E),
\]

因此

\[
\boxed{
P_i=E+\frac{P_{i+1}}{\tau_i}.
}
\]

终端板取尽剩余目标功率，故

\[
P_4=E.
\]

这个递推是四板等 RF 取能的基本式。

## 2. 统一 cell loss 时的闭式解

若 A/B/C 的 through loss 近似相同，

\[
\tau_A=\tau_B=\tau_C=\tau,
\]

则

\[
P_i
=
E\sum_{m=0}^{4-i}\tau^{-m}.
\]

相应第 \(i\) 块需要从本级入口抽取的比例为

\[
\boxed{
\kappa_i=\frac{E}{P_i}.
}
\]

对于当前理论基线

\[
L_{\mathrm{cell}}=0.42\ \mathrm{dB},
\qquad
\tau=10^{-0.42/10}=0.90782053,
\]

得到

\[
\boxed{
\kappa_A=0.214983,\quad
\kappa_B=0.301666,\quad
\kappa_C=0.475842,\quad
\kappa_D=1.
}
\]

对应功率耦合量：

\[
\boxed{
6.676\ \mathrm{dB},\quad
5.205\ \mathrm{dB},\quad
3.225\ \mathrm{dB},\quad
\text{terminal}.
}
\]

这说明 A/B/C/D 不是四个“候选板”，而是同一四级 Zone 内的四个位置专用板。

## 3. 5–8 W/板对应的 Zone 输入功率

由于 \(\kappa_i\) 与绝对功率尺度无关，只要线性工作，改变目标 \(E\) 只会等比例改变 \(P_i\)。

### \(E=5\) W/板

\[
(P_A,P_B,P_C,P_D)
=
(23.258,\ 16.575,\ 10.508,\ 5.000)\ \mathrm{W}.
\]

所以 Zone input 约

\[
\boxed{23.26\ \mathrm{W}}.
\]

### \(E=6.5\) W/板

\[
(P_A,P_B,P_C,P_D)
=
(30.235,\ 21.547,\ 13.660,\ 6.500)\ \mathrm{W}.
\]

所以 Zone input 约

\[
\boxed{30.23\ \mathrm{W}}.
\]

### \(E=8\) W/板

\[
(P_A,P_B,P_C,P_D)
=
(37.212,\ 26.519,\ 16.812,\ 8.000)\ \mathrm{W}.
\]

所以 Zone input 约

\[
\boxed{37.21\ \mathrm{W}}.
\]

因此当前 5–8 W/板的四板局部 Zone 与 500 W 主机功率尺度并不冲突。真正不合理的是把 100 块全部串成一条连续 FR4 链，而不是四板局部 Zone 本身。

## 4. 必须区分 RF 取能与工件实际加热功率

上面的 \(E\) 是 Patch 支路接受的 RF 功率。

若客户所说的 5–8 W 实际指工件吸收功率 \(H\)，且第 \(i\) 块局部 RF→工件效率为 \(\eta_i\)，则应改为

\[
B_i=\frac{H}{\eta_i},
\]

其中 \(B_i\) 是该板需要从主链抽取的 RF 功率。

递推变成

\[
\boxed{
P_i
=
\frac{H}{\eta_i}
+
\frac{P_{i+1}}{\tau_i}.
}
\]

抽取比例则为

\[
\boxed{
\kappa_i
=
\frac{H/\eta_i}{P_i}.
}
\]

如果四块 \(\eta_i=\eta_h\) 近似相同，则所有 \(\kappa_i\) 不变，但整个 Zone 输入功率放大 \(1/\eta_h\)。

以 6.5 W/板实际加热为例：

- \(\eta_h=1\)：Zone input ≈ 30.23 W；
- \(\eta_h=0.8\)：≈ 37.79 W；
- \(\eta_h=0.7\)：≈ 43.19 W；
- \(\eta_h=0.6\)：≈ 50.39 W。

因此下一阶段必须把“每板 5–8 W”明确区分为 RF accepted power 还是 workpiece absorbed power。

## 5. T-cell 在中心频率的精确分流综合

设参考阻抗

\[
Z_0=50\ \Omega,
\]

目标抽取比例为 \(\kappa\)。

为了使 Patch branch 在 T-junction 的电导占总电导的比例为 \(\kappa\)，其等效输入电阻应满足

\[
\boxed{
R_b
=
Z_0\frac{1-\kappa}{\kappa}.
}
\]

T-junction 总阻抗为

\[
R_J=Z_0\parallel R_b
=
Z_0(1-\kappa).
\]

所以输入侧四分之一波变换器应取

\[
\boxed{
Z_t=Z_0\sqrt{1-\kappa}.
}
\]

若 Patch 在设计频率处的实际谐振电阻为 \(R_L\)，并不要求必须等于 50 Ω。branch quarter-wave transformer 应满足

\[
\boxed{
Z_b
=
\sqrt{
R_L Z_0\frac{1-\kappa}{\kappa}
}.
}
\]

当前 docs/19 中

\[
Z_b=50\sqrt{\frac{1-\kappa}{\kappa}}
\]

只是 \(R_L=50\Omega\) 的特殊情况。

这个推广很重要：最终设计的第一要求应是 Patch 在 2.45 GHz 附近接近纯电阻，而不是强迫裸 Patch 本身正好 50 Ω。

## 6. Patch 电抗是比入口 S11 更严格的限制

设 loaded Patch

\[
Z_L=R+jX.
\]

令 \(x=X/R\)。

在中心频率的理想 T-cell 一阶模型中，可以得到输入归一化阻抗近似

\[
\boxed{
\frac{Z_{\mathrm{in}}}{Z_0}
\approx
1+j\kappa x.
}
\]

所以

\[
\boxed{
\Gamma_{\mathrm{in}}
\approx
\frac{j\kappa x}{2+j\kappa x}.
}
\]

当 \(|x|\ll1\) 时，

\[
\boxed{
|\Gamma_{\mathrm{in}}|
\approx
\frac{\kappa}{2}|x|.
}
\]

因此 T-cell 的输入匹配会“掩盖”一部分 Patch 电抗。

例如 C 板 \(\kappa_C\approx0.476\)。即便

\[
|X/R|=0.2,
\]

一阶仍只有

\[
|\Gamma_{\mathrm{in}}|\approx0.048,
\]

入口 return loss 仍可能很好。

所以不能用 Zone input S11 单独判断 Patch 是否调好。

对复场设计，更严格的量是 Patch branch phase error。若希望局部相位误差控制在约 5°，一阶要求

\[
\boxed{
|X/R|\lesssim\tan5^\circ\approx0.087.
}
\]

因此后续 loaded-Patch 的设计 gate 应至少同时检查

\[
\operatorname{Re}Z_L,\quad
\operatorname{Im}Z_L,\quad
\arg u_{\mathrm{patch}},
\]

而不是只检查 S11。

## 7. 四板相位闭合

对理想 matched T-cell：

- input reference → T-junction：约 \(-90^\circ\)；
- T-junction → Patch branch reference：约 \(-90^\circ\)；
- 因此单板 Patch 相位相对本 cell input 约 \(-180^\circ\)。

若 T-junction → 下一板 input reference 的 through path 设计成约半波：

\[
-180^\circ,
\]

则整个 cell through phase 为

\[
-90^\circ-180^\circ
=
-270^\circ
\equiv+90^\circ.
\]

于是相邻 Patch 的相位推进自然为

\[
\boxed{
+90^\circ.
}
\]

这说明当前 +90° seed 在“网络可实现性”上非常自然。

但它仍只是易实现的 phase state，不等价于最终最优加热相位。

因此建议把设计职责拆开：

\[
\boxed{
\text{T-cell负责幅度/取能}
+
\text{短 phase-trim 段负责最终场相位}
}
\]

而不要要求同一个 T-cell 几何同时承担全部 heating-field synthesis。

## 8. 推荐的设计层级

### Layer 1：Patch radiator

优先保证：

\[
f_{r,\mathrm{loaded}}\approx2.45\ \mathrm{GHz},
\]

并控制

\[
X/R
\]

足够小。

### Layer 2：power divider

按照实际 \(\tau_i\) 和 \(\eta_i\) 解

\[
P_i
=
\frac{H}{\eta_i}
+
\frac{P_{i+1}}{\tau_i}
\]

得到

\[
\kappa_A,\kappa_B,\kappa_C.
\]

然后通过 \(Z_t,Z_b\) 完成中心频率 matched extraction。

### Layer 3：phase trim

在不显著改变 \(\kappa_i\) 的前提下，用局部短线修正

\[
\phi_A,\phi_B,\phi_C,\phi_D.
\]

当前约

\[
1\ \mathrm{mm}\sim5^\circ
\]

数量级，因此 0–8.5 mm fine-trim 区域大致可覆盖 ±45° 级相位残差。

## 9. 对下一版 PCB 的直接理论约束

下一版不应继续围绕旧 edge-coupled 0.70/0.45/0.30 mm gap 做主优化。

主方案应保留 loss-corrected matched T-cell：

| Board | κ | \(Z_t\) | \(Z_b\)（若 \(R_L=50\Omega\)） |
|---|---:|---:|---:|
| A | 0.214983 | 44.301 Ω | 95.545 Ω |
| B | 0.301666 | 41.783 Ω | 76.074 Ω |
| C | 0.475842 | 36.199 Ω | 52.477 Ω |
| D | 1 | terminal | terminal |

但 PCB 映射时必须重新根据真实 PP+FR4 stack 求：

\[
Z_c(W_i)=Z_{i,\mathrm{target}},
\]

以及

\[
\beta(W_i,f_0)L_i=\pi/2.
\]

因此应冻结“目标阻抗”，而不是先冻结当前 Hammerstad 裸 FR4 线宽。

## 10. 本文结论在当前主线中的位置

四板串联 Zone 本身是可行且有明确解析结构的：

\[
\boxed{
A\to B\to C\to D
}
\]

不是四选一，而是一个完整四级功率分配单元。

在 **equal-power benchmark** 与 0.42 dB/cell 基线下：

\[
\boxed{
\kappa_A/\kappa_B/\kappa_C
=
21.50\%/30.17\%/47.58\%.
}
\]

当前 field-aware 主设计已更新为约：

\[
\boxed{24.76\%/24.07\%/36.08\%}
\]

并使用 near-in-phase mirror phase，而不是把 +90° progression 作为最终工件场目标。

若每块 RF 取能 6.5 W：

\[
\boxed{
P_{\mathrm{Zone,in}}\approx30.23\ \mathrm{W}.
}
\]

因此后续理论重点不再是“是否需要四块”，而是：

1. loaded Patch 的 \(R+jX\)；
2. 实际 \(\tau_A,\tau_B,\tau_C\)；
3. RF→工件效率 \(\eta_i\)；
4. matched T-cell 的真实 stack 映射；
5. phase-trim 与加热场目标的解耦。

下一轮全波求解应只用于标定这些物理量，而不是重新从零搜索架构。
