# 下一版四板 Zone 设计参数 V2（field-aware 可重构/低板数分支）

> **状态修正（V4.1）：本文不再是 1–80 通用无源 PCB 的默认参数。** 固定无源网络不能仅靠源功率变化实现 board-count-adaptive taper；80×5 W endpoint 又强迫 universal passive baseline 为 equal-power。因此本文的 outer-strong taper 与额外 phase sections 只保留给低板数、可切换 coupling/phase、独立外部分配或不同硬件 SKU。通用 baseline 见 `docs/25_1_to_80_closed_power_framework_v1.md` 与 `docs/26_physical_correction_analytic_closure_v1.md`。

> 目的：把已合并的四板解析闭合、loaded-Patch 分层模型和 few-mode 鲁棒场综合，转换成下一版 PCB 可直接使用的设计中心值与理论容差区间。
>
> 本文中的“中心值”用于版图设计；“范围”用于容差/校准。除明确写成制造冻结外，均不等于最终生产值。

## 1. 系统架构

四块独立磁吸板串联为一个 RF Zone：

\[
\boxed{
A\to B\to C\to D_{\rm term}
}
\]

A/B/C 为取能 + 继续传输板，D 为终端辐射板。

当前 field-aware 目标不再是 equal-RF-power，也不再采用固定 \(+90^\circ\) travelling-wave 相位。

推荐复激励：

\[
\boxed{
\mathbf u
\propto
\left(
1,\;
0.801e^{-j5.3^\circ},\;
0.801e^{-j5.3^\circ},\;
1
\right).
}
\]

因此目标 RF accepted-power 比例：

\[
\boxed{
P_A:P_B:P_C:P_D
=
1:0.6412:0.6412:1.
}
\]

若四板平均 accepted RF 取：

\[
6.5\ \mathrm{W/board},
\]

则：

\[
\boxed{
P_A=P_D\approx7.92\ \mathrm W,
}
\]

\[
\boxed{
P_B=P_C\approx5.08\ \mathrm W.
}
\]

四块都落在原 5–8 W/板范围内。

---

## 2. Patch 参数冻结级别

当前继续保留：

\[
\boxed{
W_p=37.5\ \mathrm{mm},
\quad
L_p=28.5\ \mathrm{mm},
\quad
y_{\rm inset}=10.5\ \mathrm{mm}.
}
\]

其中：

- \(W_p\) 已通过 TM10 cavity seed 和 few-mode width sensitivity 支持；
- \(L_p\) 暂不因场均匀性修改；
- inset 继续作为约 50 Ω loaded-resonance 的第一阶 seed。

下一轮 full-wave 只允许围绕小范围修正，而不是重新大范围搜索：

\[
W_p=37.0\text{–}38.0\ \mathrm{mm},
\]

\[
L_p=27.8\text{–}29.0\ \mathrm{mm},
\]

\[
y_{\rm inset}=9.8\text{–}11.2\ \mathrm{mm}.
\]

---

## 3. field-aware extraction targets

考虑推荐 phase section 的 FR4 损耗反馈后：

\[
\boxed{
\kappa_A=0.2476,
\quad
\kappa_B=0.2407,
\quad
\kappa_C=0.3608.
}
\]

对应：

\[
\boxed{
C_A=6.06\ \mathrm{dB},
\quad
C_B=6.19\ \mathrm{dB},
\quad
C_C=4.43\ \mathrm{dB}.
}
\]

因此 A/B 已经非常接近，可以视为同一弱取能等级的两个轻微不同 phase/loss 版本；C 是明显更强的取能级。

---

## 4. T-cell 理论阻抗

对参考 Patch 谐振电阻：

\[
R_L=50\ \Omega,
\]

采用：

\[
Z_t=50\sqrt{1-\kappa},
\]

\[
Z_b
=
50\sqrt{\frac{1-\kappa}{\kappa}}.
\]

得到：

| Board | \(Z_t\) | \(Z_b\) |
|---|---:|---:|
| A | 43.37 Ω | 87.16 Ω |
| B | 43.57 Ω | 88.81 Ω |
| C | 39.98 Ω | 66.55 Ω |

如果 loaded Patch 的真实谐振电阻不是 50 Ω，而落在：

\[
40\text{–}60\ \Omega,
\]

则 branch transformer 应使用：

\[
Z_b
=
\sqrt{
50R_L\frac{1-\kappa}{\kappa}
}.
\]

相应设计包络：

| Board | \(Z_b(R_L=40Ω)\) | \(Z_b(50Ω)\) | \(Z_b(60Ω)\) |
|---|---:|---:|---:|
| A | 77.96 Ω | 87.16 Ω | 95.48 Ω |
| B | 79.43 Ω | 88.81 Ω | 97.28 Ω |
| C | 59.53 Ω | 66.55 Ω | 72.90 Ω |

所以制造前必须先确认 loaded \(R_L\)，但 series transformer \(Z_t\) 基本不受 \(R_L\) 影响。

---

## 5. 2 mm PP 覆盖后的微带解析修正

裸 FR4 Hammerstad 不能直接作为最终线宽，因为实际结构前方有：

\[
t_{\rm PP}=2\ \mathrm{mm},
\qquad
\varepsilon_{r,\rm PP}\approx2.2.
\]

使用 quasi-static field-participation 近似：

\[
\varepsilon_{\rm eff,sup}
\approx
\varepsilon_{\rm eff,air}
+
\xi(1-q)(\varepsilon_{\rm PP}-1),
\]

其中：

\[
q
=
\frac{
\varepsilon_{\rm eff,air}-1
}{
\varepsilon_{\rm FR4}-1
},
\]

而有限 2 mm superstrate participation 取保守包络：

\[
\boxed{
0.6\le\xi\le1.0.
}
\]

中心设计采用：

\[
\boxed{
\xi=0.8.
}
\]

这不是最终 conformal-mapping 精确解，而是为了在 full-wave 前得到物理合理的 PP-corrected 几何中心和范围。

---

## 6. PP-corrected 推荐线宽

中心值 \(\xi=0.8\)：

| 功能 | 目标阻抗 | 推荐线宽中心 |
|---|---:|---:|
| 50 Ω 主线 | 50 Ω | **2.91 mm** |
| A series | 43.37 Ω | **3.69 mm** |
| B series | 43.57 Ω | **3.66 mm** |
| C series | 39.98 Ω | **4.20 mm** |
| A branch | 87.16 Ω | **0.89 mm** |
| B branch | 88.81 Ω | **0.85 mm** |
| C branch | 66.55 Ω | **1.67 mm** |

按：

\[
0.6\le\xi\le1.0
\]

得到理论宽度包络：

| 功能 | width range |
|---|---:|
| 50 Ω | 2.85–2.96 mm |
| A series | 3.63–3.75 mm |
| B series | 3.61–3.72 mm |
| C series | 4.14–4.26 mm |
| A branch | 0.86–0.93 mm |
| B branch | 0.82–0.88 mm |
| C branch | 1.63–1.72 mm |

因此下一版实际版图建议优先采用中心值，而 full-wave 只在上述小范围内校正。

---

## 7. PP-corrected quarter-wave lengths

中心 \(\xi=0.8\) 下，解析有效介电常数给出：

| section | \(\varepsilon_{\rm eff}\) | \(\lambda_g/4\) |
|---|---:|---:|
| A series | 3.600 | **16.12 mm** |
| B series | 3.598 | **16.13 mm** |
| C series | 3.626 | **16.07 mm** |
| A branch | 3.386 | **16.63 mm** |
| B branch | 3.381 | **16.64 mm** |
| C branch | 3.461 | **16.44 mm** |
| 50 Ω line | 3.554 | **16.23 mm** |

这比裸 FR4 的 16.7–17.6 mm 普遍更短。

因此下一版不能继续直接沿用裸 FR4 quarter-wave length。

---

## 8. 目标 phase network

推荐 Patch phase：

\[
\boxed{
\phi_A=0^\circ,
\quad
\phi_B=-5.3^\circ,
\quad
\phi_C=-5.3^\circ,
\quad
\phi_D=0^\circ.
}
\]

相邻 progression：

\[
\boxed{
\Delta\phi_{AB}=-5.3^\circ,
\quad
\Delta\phi_{BC}=0^\circ,
\quad
\Delta\phi_{CD}=+5.3^\circ.
}
\]

若基础 T-cell topology 仍提供约 \(+90^\circ\) natural progression，则额外 phase lag 需要：

\[
95.3^\circ,\quad
90.0^\circ,\quad
84.7^\circ.
\]

PP-corrected 50 Ω 线中心：

\[
\varepsilon_{\rm eff}\approx3.554,
\]

因此：

\[
\boxed{
5.55^\circ/\mathrm{mm}
}
\]

附近。

推荐 phase-section 中心长度更新为：

\[
\boxed{
L_{\phi,AB}=17.18\ \mathrm{mm},
}
\]

\[
\boxed{
L_{\phi,BC}=16.22\ \mathrm{mm},
}
\]

\[
\boxed{
L_{\phi,CD}=15.27\ \mathrm{mm}.
}
\]

考虑 PP participation 不确定性，建议版图允许约：

\[
\boxed{
\pm0.20\ \mathrm{mm}
}
\]

的 fine-trim 几何余量。

---

## 9. nominal power recursion

推荐相对 Patch accepted power：

\[
(1,\ 0.6412,\ 0.6412,\ 1).
\]

phase section 加入后的 cell loss 先按：

\[
L_A\approx0.571\ \mathrm{dB},
\]

\[
L_B\approx0.563\ \mathrm{dB},
\]

\[
L_C\approx0.554\ \mathrm{dB}
\]

作为第一阶预算。

因此：

\[
\tau_A\approx0.8768,
\quad
\tau_B\approx0.8785,
\quad
\tau_C\approx0.8802.
\]

对应相对 cell input：

\[
(P_A,P_B,P_C,P_D)
\approx
(4.0386,\ 2.6643,\ 1.7773,\ 1).
\]

从而得到第 3 节的：

\[
\kappa_A=24.76\%,
\quad
\kappa_B=24.07\%,
\quad
\kappa_C=36.08\%.
\]

若平均 Patch accepted power = 6.5 W：

\[
\boxed{
P_{\rm Zone,in}\approx32.0\ \mathrm W.
}
\]

---

## 10. PCB 参数优先级

下一版不要同时放开所有参数。

### 一级冻结

先固定：

\[
W_p=37.5\ \mathrm{mm},
\]

\[
L_p=28.5\ \mathrm{mm},
\]

\[
y_{\rm inset}=10.5\ \mathrm{mm},
\]

\[
w_{50}=2.91\ \mathrm{mm}.
\]

### 二级按理论直接设计

A：

\[
w_{t,A}=3.69\ \mathrm{mm},
\quad
L_{t,A}=16.12\ \mathrm{mm},
\]

\[
w_{b,A}=0.89\ \mathrm{mm},
\quad
L_{b,A}=16.63\ \mathrm{mm}.
\]

B：

\[
w_{t,B}=3.66\ \mathrm{mm},
\quad
L_{t,B}=16.13\ \mathrm{mm},
\]

\[
w_{b,B}=0.85\ \mathrm{mm},
\quad
L_{b,B}=16.64\ \mathrm{mm}.
\]

C：

\[
w_{t,C}=4.20\ \mathrm{mm},
\quad
L_{t,C}=16.07\ \mathrm{mm},
\]

\[
w_{b,C}=1.67\ \mathrm{mm},
\quad
L_{b,C}=16.44\ \mathrm{mm}.
\]

### Phase section

\[
\boxed{
17.18,\ 16.22,\ 15.27\ \mathrm{mm}
}
\]

分别对应 AB / BC / CD。

### D

D 仍为 terminal radiator，不再向后输出 RF。其 feed route 应按：

\[
\phi_D=0^\circ
\]

与 A 对齐设计，而不再沿用旧 travelling-wave D=270° 目标。

---

## 11. 建议的实际参数容差

在 full-wave calibration 之前，设计文件中预留：

- 50 Ω width：±0.08 mm；
- series width：±0.10 mm；
- branch width：±0.07 mm；
- quarter-wave length：±0.25 mm；
- phase-section fine trim：至少 ±0.20 mm；
- inset depth：至少 ±0.5 mm 可调范围；
- Patch length：至少 ±0.6 mm 的版图参数化能力。

其中 branch transformer，尤其 A/B 的约 0.85–0.90 mm 线，是最敏感的阻抗几何。

---

## 12. 下一轮 full-wave 不再做大范围搜索

理论已经把参数空间压缩到小范围。

下一轮只需要做以下局部校准：

1. 真实 PP+FR4 stack 的 \(Z(W)\)；
2. loaded Patch 的 \(R_L+jX_L\)；
3. actual phase per mm；
4. 磁吸接口附加 phase/loss；
5. A/B/C extraction 与目标 \(\kappa\) 的局部偏差；
6. 最终四板 workpiece absorption uniformity。

原则上不再扫描：

\[
W_p=35\text{–}39\ \mathrm{mm}
\]

这种大区间，也不再从 0/90/180/270° 等多个完全不同 phase topology 里盲选。

---

## 13. 当前推荐设计中心汇总

| 参数 | A | B | C | D |
|---|---:|---:|---:|---:|
| Patch W | 37.5 mm | 37.5 | 37.5 | 37.5 |
| Patch L | 28.5 mm | 28.5 | 28.5 | 28.5 |
| Inset | 10.5 mm | 10.5 | 10.5 | 10.5 |
| Patch target W | 7.92 W | 5.08 W | 5.08 W | 7.92 W |
| Patch phase | 0° | −5.3° | −5.3° | 0° |
| \(\kappa\) | 24.76% | 24.07% | 36.08% | terminal |
| series Z | 43.37 Ω | 43.57 Ω | 39.98 Ω | — |
| series width | 3.69 mm | 3.66 mm | 4.20 mm | — |
| series \(\lambda_g/4\) | 16.12 mm | 16.13 mm | 16.07 mm | — |
| branch Z | 87.16 Ω | 88.81 Ω | 66.55 Ω | — |
| branch width | 0.89 mm | 0.85 mm | 1.67 mm | — |
| branch \(\lambda_g/4\) | 16.63 mm | 16.64 mm | 16.44 mm | — |
| next-cell phase section | 17.18 mm | 16.22 mm | 15.27 mm | terminal |

主 50 Ω line：

\[
\boxed{
w_{50}=2.91\ \mathrm{mm}.
}
\]

Nominal Zone input：

\[
\boxed{
P_{\rm in}\approx32\ \mathrm W.
}
\]

这组参数应作为下一版 PCB 的设计中心。
