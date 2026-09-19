# 射频仿真设计需求书（物理闭合版 V4.1）

> 状态：**当前推荐工程基线。**
>
> V4.1 修正了 V4 中“board-count-adaptive taper 可由固定无源 PCB 自动实现”的隐含假设。1–80 通用硬件改用 equal-power passive baseline；field-aware taper 降为可重构/低板数优化模式。
>
> 系统功率闭合：docs/25_1_to_80_closed_power_framework_v1.md  
> 物理修正量闭合：docs/26_physical_correction_analytic_closure_v1.md

---

## 1. 项目对象

开发 2.45 GHz 微波加热设备用：

- 50 mm × 50 mm 磁吸灰板；
- 平面连接桥；
- 立体直角桥；
- 输入/跨区连接线；
- 1–80 块可配置 RF 系统；
- 10 kΩ/板的板数识别；
- 板数相关源功率控制。

灰板：

- FR4 1.6 mm；
- 透明 PP 外壳；
- 正面 RF 辐射/耦合结构 + 直通线 + extraction network + 独立 ID line；
- 背面连续 Ground；
- 板间磁吸 RF/ID 接口。

客户原始方形螺旋必须保留为正式 baseline。Patch / matched T-cell 是优化路线。

---

## 2. 频率与端口

\[
\boxed{f_0=2.45\ {\rm GHz}}
\]

\[
\boxed{2.40\text{–}2.50\ {\rm GHz}}
\]

全局 sweep：

\[
2.0\text{–}3.0\ {\rm GHz}.
\]

RF reference：

\[
\boxed{Z_0=50\ \Omega}.
\]

---

## 3. 正式板数与单板功率

\[
\boxed{1\le N\le80}
\]

代表验收：

\[
\boxed{N=5,\ 25,\ 80}.
\]

源：

\[
\boxed{P_{\rm src,max}=500\ {\rm W}}.
\]

单板 useful accepted RF：

\[
\boxed{5\le E_i\le8\ {\rm W}}.
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

V4.1 不再包含“1–100 块 + 500 W + 5–8 W/块”。

---

## 4. 通用无源硬件采用 equal-power baseline

由于固定线性无源 PCB 的 normalized power split 不会随源总功率改变，1–80 通用硬件不得依赖 board-count-adaptive coupling ratio。

正式 baseline：

\[
\boxed{
E_1=E_2=\cdots=E_N=E.
}
\]

因此理论目标层：

\[
\delta_P=0,
\]

天然满足 ±25%。

此前 field-aware：

\[
1:0.6412:0.6412:1
\]

仅保留为：

- 低板数优化；
- 可切换 coupling/phase；
- 外部独立分配；
- 或不同 hardware SKU。

它不再是 1–80 同一 passive PCB 的默认结构。

---

## 5. Zone 架构

\[
\boxed{
N=4M+r,\qquad r=0,1,2,3.
}
\]

full Zone：

\[
\boxed{
A\to B\to C\to D_{\rm term}.
}
\]

80 块：

\[
\boxed{20\times4\text{-board Zone}}.
\]

1/2/3 块余数使用 partial Zone。

机械上可连续磁吸；RF 上不使用 80 块连续普通 FR4 长链。

---

## 6. loss-aware equal-power extraction

定义：

\[
\tau=10^{-L_{\rm cell}/10}.
\]

\[
A_m(\tau)
=
\sum_{k=0}^{m-1}\tau^{-k}.
\]

m-board Zone：

\[
P_{\rm zone}^{(m)}
=
EA_m.
\]

fixed extraction：

\[
\boxed{
\kappa_i
=
\frac1{A_{m-i+1}}.
}
\]

对当前理论基线：

\[
L_{\rm cell}=0.42\ {\rm dB},
\]

full 4-board Zone：

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

这些 κ 是 universal passive seed；最终按真实 \(L_{\rm cell}\) 更新。

---

## 7. 任意 N 的 source-power 模型

\[
C_N
=
M A_4+A_r.
\]

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

则：

\[
\boxed{
P_{\rm src}
=
E C_N
10^{L_{\rm up}/10}.
}
\]

所以：

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

控制目标：

\[
\boxed{
E_{\rm cmd}(N)
=
\min(6.5,E_{\max}(N)),
}
\]

并必须满足：

\[
\boxed{
E_{\rm cmd}(N)\ge5.
}
\]

---

## 8. 80-board system gate

80×5 W 要求：

\[
\boxed{
\eta_{\rm zone}\eta_{\rm up}
\ge0.80.
}
\]

等效 dB：

\[
\boxed{
L_{\rm zone}
+
L_{\rm up}
\le0.9691\ {\rm dB}.
}
\]

当前：

\[
L_{\rm cell}=0.42\ {\rm dB}
\]

时：

\[
\eta_{\rm zone}\approx85.99\%,
\]

因此：

\[
\boxed{
L_{\rm up,max}\approx0.314\ {\rm dB}.
}
\]

所以当前理论下：

\[
\boxed{
\text{5 m cable + adapter + manifold + bridge}
}
\]

必须总计 ≤约 0.314 dB 才能闭合 80×5 W。

---

## 9. cell-loss / upstream-loss trade-off

| \(L_{\rm cell}\) | upstream total max |
|---:|---:|
| 0.30 dB | 0.506 dB |
| 0.32 dB | 0.474 dB |
| 0.35 dB | 0.426 dB |
| 0.36 dB | 0.410 dB |
| 0.38 dB | 0.378 dB |
| 0.40 dB | 0.346 dB |
| 0.42 dB | 0.314 dB |

一阶：

\[
\boxed{
L_{\rm up}
+
1.5L_{\rm cell}
\lesssim0.969\ {\rm dB}.
}
\]

因此所有 cable / bridge 指标必须按同一 RF path 累加验收。

---

## 10. 5 m ≤0.5 dB 的新口径

如果 5 m 连接线本体已：

\[
0.5\ {\rm dB},
\]

那么当前 0.42 dB/cell 下 80-board 不闭合。

若坚持 upstream≈0.5 dB，则至少要求：

\[
\boxed{
L_{\rm cell}\lesssim0.304\ {\rm dB}
}
\]

才到理论边界，而且还没有给 adapter/manifold/bridge 留余量。

因此：

- 5 m ≤0.5 dB 可以作为低/中板数指标；
- 80-board 模式必须使用完整 path budget；
- 若 80-board 仍要求 5 W/板，必须进一步降低 cable loss、cell loss，或二者同时降低。

RG142 不再作为“5 m≤0.5 dB”默认 cable type。

---

## 11. PP + FR4 propagation baseline

PP-corrected：

\[
3.48
\lesssim
\varepsilon_{\rm eff}
\lesssim
3.63.
\]

中心：

\[
\varepsilon_{\rm eff}\approx3.555.
\]

因此：

\[
\boxed{
\beta\approx96.8\ {\rm rad/m}
}
\]

\[
\boxed{
5.49\text{–}5.61^\circ/{\rm mm}
}
\]

50 Ω quarter-wave：

\[
\boxed{
16.05\text{–}16.40\ {\rm mm},
}
\]

中心约：

\[
16.22\ {\rm mm}.
\]

50 Ω width 当前 quasi-static center：

\[
\boxed{
w_{50}\approx2.91\ {\rm mm}.
}
\]

最终由真实 PP stack/full-wave 校准。

---

## 12. cell loss 不再冻结为 0.42 dB

解析模型：

\[
\alpha
=
\alpha_c+\alpha_d,
\]

\[
\alpha_d
\approx
\frac{\beta}{2}
\sum_jp_j\tan\delta_j,
\]

\[
\alpha_c
\approx
\frac{R'}{2Z_0}.
\]

PP participation center 下，50 mm line dielectric loss 一阶约：

\[
0.29\ {\rm dB}.
\]

加入 conductor/roughness 后：

\[
\boxed{
L_{\rm line}(50{\rm mm})
\sim0.33\text{–}0.43\ {\rm dB}
}
\]

作为当前理论区间。

0.42 dB 保留为 conservative reference，不是制造冻结常数。

---

## 13. magnetic contact model

每个短接口采用：

\[
Z_s=R_c+j\omega L_c,
\]

\[
Y_p=G_p+j\omega C_p.
\]

一阶：

\[
\Gamma_c
\approx
\frac12
\left(
\frac{Z_s}{Z_0}
-
Y_pZ_0
\right).
\]

dissipative IL：

\[
IL_c
\approx
4.343
\left(
\frac{R_c}{Z_0}
+
G_pZ_0
\right)
{\rm dB}.
\]

RL≥20 dB 的单参数数量级：

\[
L_c\lesssim0.65\ {\rm nH},
\]

\[
C_p\lesssim0.26\ {\rm pF}.
\]

preferred contact loss：

\[
\boxed{
IL_c\lesssim0.02\ {\rm dB}
}
\]

对应 purely-series 等效电阻约：

\[
R_c\lesssim0.23\ \Omega.
\]

---

## 14. 5 mm magnetic bridge phase

目标：

\[
\phi_b\approx19^\circ.
\]

对应：

\[
\boxed{
\varepsilon_{\rm eff,bridge}
\approx1.67.
}
\]

因此磁吸 bridge 使用独立 S-parameter/lumped two-port，不按 5 mm FR4 处理。

---

## 15. 平面连接桥

若仍要求：

\[
IL_{\rm planar}\le0.2\ {\rm dB}
\]

且路径约 100 mm，则普通 FR4 不作为基线。

解析要求：

- 不预留 contact/discontinuity 时，材料约需：
  \[
  \tan\delta\lesssim0.0034;
  \]
- 若给接口预留约 0.04 dB：
  \[
  \boxed{
  \tan\delta\lesssim0.0023.
  }
  \]

因此保留 0.2 dB 目标时应使用 low-loss RF laminate / shorter path / coaxial-type bridge。

---

## 16. 立体直角桥

100 mm 量级路径、≤0.3 dB 时，给 conductor + bend/contact 预留后：

\[
\boxed{
\tan\delta\lesssim0.004
}
\]

是合理材料级 gate。

---

## 17. loaded Patch / Spiral gate

主谐振附近：

\[
Y_L
=
G_L+jB_L.
\]

定义：

\[
\frac{B_L}{G_L}
=
Q_L
\left(
\frac{f}{f_r}
-
\frac{f_r}{f}
\right).
\]

因此：

\[
\frac{X_L}{R_L}
=
-\frac{B_L}{G_L}.
\]

若希望 local phase error≈±5°：

\[
\boxed{
|X_L/R_L|
\lesssim0.0875.
}
\]

在 \(X=0\) 时，若要求 loaded reflection：

\[
|\Gamma_L|\le0.10,
\]

则：

\[
\boxed{
40.9\ \Omega
\lesssim R_L\lesssim
61.1\ \Omega.
}
\]

这作为 T-cell branch-transformer 的 loaded-resistance gate。

---

## 18. workpiece efficiency

\[
\eta_{\rm work}
=
\frac{
G_{\rm work}
}{
G_{\rm rad}
+
G_{\rm FR4}
+
G_{\rm Cu}
+
G_{\rm work}
}.
\]

必须单独报告：

- accepted RF；
- parasitic board loss；
- free/radiative loss；
- workpiece absorption。

S11 低不能替代 \(\eta_{\rm work}\) 高。

---

## 19. 50×50 mm mechanical gate

正式灰板：

\[
\boxed{50\times50\ {\rm mm}}.
\]

当前超过该 envelope 的 T-cell/phase-section seed 只能作为理论参考，不能作为 final PCB。

下一版必须使用：

- compact transformer；
- folded route；
- multilayer/broadside（若允许）；
- 或重新综合网络。

---

## 20. phase-shaping 的优先级下调

额外 15–17 mm FR4 phase section 约增加：

\[
0.13\text{–}0.15\ {\rm dB/cell}
\]

量级损耗。

这会显著伤害 80-board loss budget。

所以 universal baseline：

\[
\boxed{
\text{loss first}
\to
\text{equal-power}
\to
\text{loaded match}
\to
\text{workpiece efficiency}
\to
\text{optional field shaping}.
}
\]

field-aware phase/taper 只在功率余量或可重构硬件允许时启用。

---

## 21. 10 kΩ board identification

恢复：

\[
\boxed{
10\ {\rm k\Omega/board}.
}
\]

独立串联 ID：

\[
R_{\rm ID}(N)
=
10N\ {\rm k\Omega}.
\]

1–80：

\[
10\ {\rm k\Omega}
\to
800\ {\rm k\Omega}.
\]

ID network 不进入 RF extraction model。

---

## 22. 下一轮 full-wave 的唯一任务

只校准：

\[
L_{\rm cell}(f),
\]

\[
\beta(f),
\]

\[
S_{\rm contact}(f),
\]

\[
S_{\rm bridge}(f),
\]

\[
Z_{\rm loaded}(f),
\]

\[
\eta_{\rm work}.
\]

然后代回：

\[
\kappa_i,
\quad
C_N,
\quad
E_{\max}(N),
\quad
P_{\rm src}(N).
\]

后续仿真不再从零搜索系统架构。
