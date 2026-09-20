# micro_wave 理论闭合主线 V1

> **状态：当前理论总基线（2026-09-20）。**
>
> 本文统一此前 docs/01–23 中尺寸、功率、Zone、T-cell、复幅相与工件加载的冲突口径。
>
> 优先级：本文 > `docs/27_fast_tcell_design_loop_v1.md` > `docs/23_few_mode_robust_field_synthesis_v1.md` > 其它当前顶层参考。equal-power、progressive-phase 和旧 footprint 文档已移入 `docs/archive/`。
>
> 这里的“闭合”是指：给定少量需要全波或实测标定的物理量后，可以沿固定方程从系统目标反推到 PCB 参数；不表示当前 PCB 已完成最终 HFSS/openEMS 或实测验收。

---

## 1. 尺寸口径

### 1.1 产品/理论机械目标

当前产品机械目标为：

\[
\boxed{50\times60\ {\rm mm}}.
\]

保持水平方向 50 mm Patch pitch 和既有 RF reference coordinates。

推荐有效机械坐标：

\[
x\in[-25,25]\ {\rm mm},
\qquad
y\in[-35,25]\ {\rm mm}.
\]

因此早期 50 × 50 mm 只保留为历史 footprint，不再是当前最终板尺寸。

### 1.2 当前 PCB 已直接使用真实 50 × 60 mm 板框

早期 tscircuit 曾因居中 outline 使用 50 × 70 mm workaround。当前 calibration board 与 full engineering board V2 已改用 `boardAnchorPosition=(0,-5)`，真实板框直接为：

\[
\boxed{x\in[-25,25]\ {\rm mm},\qquad y\in[-35,25]\ {\rm mm}}.
\]

因此 50 × 70 mm 仅保留在 archive/legacy variants 中，不再是当前设计约束。

---

## 2. 功率术语必须分开

全文统一使用：

\[
P_{\rm inc}
\]

表示单板或 Zone 入口前向 RF 功率；

\[
P_{\rm ext}
\]

表示从主链抽取并送入 Patch branch 的 RF 功率；

\[
P_{\rm abs}
\]

表示工件真正吸收的功率；

\[
P_{\rm loss}
\]

表示铜、FR4、触点、分配网络等寄生损耗。

客户原始“5–8 W/板”在工件材料和 RF→工件效率未冻结前，只能先作为 \(P_{\rm ext}\) 的设计目标，不能直接等同于 \(P_{\rm abs}\)。

---

## 3. 500 W、1–100 块与 5–8 W 的硬边界

源功率上限：

\[
\boxed{P_{\rm src,max}=500\ {\rm W}}.
\]

设系统端到端效率为 \(\eta_{\rm sys}\)，总板数为 \(N\)，平均目标有用功率为 \(\bar P_b\)，则功率守恒要求：

\[
\boxed{
N\bar P_b
\le
\eta_{\rm sys}P_{\rm src,max}.
}
\]

所以可统一写成：

\[
\boxed{
N_{\max}(P_{\min})
=
\left\lfloor
\frac{\eta_{\rm sys}P_{\rm src,max}}{P_{\min}}
\right\rfloor.
}
\]

当前系统端到端效率 \(\eta_{\rm sys}\) **尚未由当前主方案得到**。此前使用 \(\eta_{\rm sys}=0.80\) 只作为敏感性示例，不应再作为规划基线或能力声明。

若仅作示例取：

\[
\eta_{\rm sys}=0.80,
\]

则有：

| 总板数 \(N\) | 平均有用功率预算 |
|---:|---:|
| 50 | 8.0 W/板 |
| 60 | 6.67 W/板 |
| 80 | 5.0 W/板 |
| 100 | 4.0 W/板 |

因此当前统一表述为：

\[
\boxed{
\text{机械/识别架构支持 1–100 块；在 500 W 与 80\% 规划效率下，5 W/板约对应 80 块预算上限。}
}
\]

其中 **80 块不是已经验证的保证值**。真实可同时供能板数必须用最终实测/全波得到的 \(\eta_{\rm sys}\) 重算。

如果要求 100 块都至少 5 W，则：

\[
P_{\rm src}
\ge
\frac{100\times5}{\eta_{\rm sys}}.
\]

在 \(\eta_{\rm sys}=0.8\) 时：

\[
\boxed{P_{\rm src}\ge625\ {\rm W}}.
\]

所以“500 W + 100 块 + 每块至少 5 W”不能继续作为同时硬指标。

---

## 4. 系统架构：100 块不是一条 FR4 长链

当前主架构：

\[
\boxed{
\text{source}
\rightarrow
\text{low-loss manifold}
\rightarrow
\text{local RF Zones}
\rightarrow
\text{boards}
\rightarrow
\text{workpiece}.
}
\]

局部 Zone 采用 1–4 块：

\[
D,
\qquad
C\rightarrow D,
\qquad
B\rightarrow C\rightarrow D,
\qquad
A\rightarrow B\rightarrow C\rightarrow D.
\]

系统总计可以达到 1–100 块，但通过多个局部 Zone 组成。

对于普通 FR4 50 mm cell，当前理论 through-loss 基线约为：

\[
L_{\rm cell}\approx0.42\ {\rm dB}.
\]

功率传输系数：

\[
\tau
=
10^{-L_{\rm cell}/10}
\approx0.9078.
\]

因此 100 个 50 mm cell 连成约 5 m 普通 FR4 微带链会产生指数级累计损耗。该结构的问题不是“参数还没调好”，而是架构级不可行。

---

## 5. 单 Zone 通用功率递推

四板 Zone：

\[
A\rightarrow B\rightarrow C\rightarrow D.
\]

设第 \(i\) 块希望送入 Patch branch 的目标 RF 功率为 \(e_i\)，中间级 through-path 功率传输效率为 \(\tau_i\)。

末端：

\[
P_D=e_D.
\]

由后向前：

\[
\boxed{
P_i
=
e_i
+
\frac{P_{i+1}}{\tau_i},
\qquad
i=C,B,A.
}
\]

每一级所需抽取比例：

\[
\boxed{
\kappa_i
=
\frac{e_i}{P_i}.
}
\]

这是当前幅度综合的核心闭合式。

它同时覆盖：

- equal-RF-power benchmark；
- 当前 field-aware unequal-power 目标；
- 后续任何由工件优化反推出的 \(e_i\)。

以后不再把某一组固定 coupling dB 当成永久参数。

---

## 6. Equal-power 解的正确地位

若：

\[
e_A=e_B=e_C=e_D=E,
\]

并且：

\[
\tau_A=\tau_B=\tau_C
=
10^{-0.42/10},
\]

则：

\[
\kappa_A=0.214983,
\]

\[
\kappa_B=0.301666,
\]

\[
\kappa_C=0.475842.
\]

对应：

\[
6.676\ {\rm dB},
\qquad
5.205\ {\rm dB},
\qquad
3.225\ {\rm dB}.
\]

这套结果仍然有价值，因为它证明了：

1. 四板 Zone 可以解析闭合；
2. A/B/C 必须位置专用；
3. fixed 10% tap 不合理；
4. 可用于全波/网络模型校准。

但它现在只作为 **equal-power benchmark**，不再是最终工件场设计。

---

## 7. 当前主设计：field-aware mirror taper

docs/23 已把目标从“每块 Patch RF 功率相等”升级为：

\[
\boxed{\text{工件有限体积内的吸收场均匀性}}.
\]

当前推荐复激励：

\[
\boxed{
\mathbf u
\propto
\left(
1,\,
0.801e^{-j5.3^\circ},\,
0.801e^{-j5.3^\circ},\,
1
\right).
}
\]

accepted RF power 比例：

\[
\boxed{
e_A:e_B:e_C:e_D
=
1:0.6412:0.6412:1.
}
\]

若四板平均 accepted RF 取 6.5 W：

\[
\boxed{
(e_A,e_B,e_C,e_D)
\approx
(7.92,\ 5.08,\ 5.08,\ 7.92)\ {\rm W}.
}
\]

四块均落在原始 5–8 W 区间内。

加入当前 phase-section 后的 cell-loss 估计：

\[
\tau_A\approx0.8768,
\qquad
\tau_B\approx0.8785,
\qquad
\tau_C\approx0.8802.
\]

代入通用递推得到：

\[
\boxed{
\kappa_A\approx24.76\%,
\qquad
\kappa_B\approx24.07\%,
\qquad
\kappa_C\approx36.08\%.
}
\]

对应：

\[
6.06\ {\rm dB},
\qquad
6.19\ {\rm dB},
\qquad
4.43\ {\rm dB}.
\]

因此当前主线已经从：

\[
\text{equal power + 90° travelling mode}
\]

更新为：

\[
\boxed{
\text{outer-strong power taper + near-in-phase mirror mode}.
}
\]

---

## 8. T-cell 反综合

参考阻抗：

\[
Z_0=50\ \Omega.
\]

目标抽取比例为 \(\kappa\)，Patch 在设计频率处目标实部为 \(R_L\)。

输入侧 quarter-wave transformer：

\[
\boxed{
Z_t
=
Z_0\sqrt{1-\kappa}.
}
\]

Patch branch quarter-wave transformer：

\[
\boxed{
Z_b
=
\sqrt{
R_L Z_0
\frac{1-\kappa}{\kappa}
}.
}
\]

若：

\[
R_L=50\ \Omega,
\]

则：

\[
Z_b
=
50\sqrt{
\frac{1-\kappa}{\kappa}
}.
\]

代入当前 field-aware \(\kappa\)：

| Board | \(\kappa\) | \(Z_t\) | \(Z_b\)（\(R_L=50\Omega\) seed） |
|---|---:|---:|---:|
| A | 0.2476 | 43.37 Ω | 87.16 Ω |
| B | 0.2407 | 43.57 Ω | 88.81 Ω |
| C | 0.3608 | 39.98 Ω | 66.55 Ω |

裸 FR4 Hammerstad 线宽只能作为几何 seed。最新可信 openEMS 结果已经给出 PP-loaded 校准：历史 3.137 mm nominal-50Ω line 的 native impedance 约 45.5 Ω；当前 V2 surrogate 反推出 50 Ω width seed 约 2.670 mm。详见 `docs/27_fast_tcell_design_loop_v1.md`。

真实 PP + FR4 stack 下继续按：

\[
Z_c(W)=Z_{\rm target},
\]

以及：

\[
\beta(W,f_0)L
=
\frac{\pi}{2}.
\]

---

## 9. Loaded Patch gate

设真实 loaded Patch：

\[
Z_L=R+jX.
\]

不能只用 Zone input S11 判断 Patch 是否调好。

对于复场设计，若希望局部相位误差控制在约 5°：

\[
\boxed{
|X/R|
\lesssim
\tan5^\circ
\approx0.087.
}
\]

所以单板/单 cell 标定至少应输出：

- \(\operatorname{Re}Z_L\)；
- \(\operatorname{Im}Z_L\)；
- Patch accepted power；
- Patch complex phase；
- cell through magnitude / phase；
- parasitic loss。

即使入口 S11 很好，只要 \(|X/R|\) 过大，复场综合仍可能失效。

---

## 10. 从 RF 激励到工件吸收

对第 \(m\) 个工件目标区域，定义功率沉积矩阵：

\[
\boxed{
H_m
=
\mathbf u^\dagger Q_m\mathbf u.
}
\]

当前 layered few-mode model 已包含：

- Patch 有限孔径谱；
- PP superstrate；
- air gap；
- complex workpiece permittivity；
- finite workpiece depth。

因此当前完整设计链应写成：

\[
\boxed{
\text{workpiece target}
\rightarrow
Q_m
\rightarrow
\mathbf u^*
\rightarrow
(e_i,\phi_i)
\rightarrow
\kappa_i
\rightarrow
(Z_{t,i},Z_{b,i},L_{\phi,i})
\rightarrow
\text{PCB geometry}.
}
\]

这才是当前项目的理论闭合主线。

---

## 11. 相位综合：+90° 只保留为网络 benchmark

理想 T-cell 很容易得到约 +90° 相邻 phase progression，因此旧文档中：

\[
0^\circ,\ 90^\circ,\ 180^\circ,\ 270^\circ
\]

仍是有价值的网络 benchmark。

但当前工件场模型推荐：

\[
\phi_A=0^\circ,
\]

\[
\phi_B=\phi_C=-5.3^\circ,
\]

\[
\phi_D=0^\circ.
\]

因此网络天然相位与工件目标之间的差值应该由 phase section / trim 修正，而不是强迫工件优化服从 +90° travelling-wave。

当前等效 50 Ω phase-section seed：

\[
\boxed{
L_{\phi,AB/BC/CD}
\approx
17.97,\ 16.97,\ 15.97\ {\rm mm}.
}
\]

这仍是电长度 seed，不是制造冻结值。

---

## 12. 单 Zone 额定尺度与 500 W 系统

按当前 field-aware 6.5 W/板平均点：

\[
\sum_i e_i
=
26\ {\rm W}.
\]

当前 loss-aware 递推估计：

\[
\boxed{
P_{\rm Zone,in}
\approx31.99\ {\rm W}.
}
\]

局部 Zone accepted-RF 分配效率：

\[
\eta_{\rm Zone}
=
\frac{26}{31.99}
\approx81.3\%.
\]

这说明“80 块 × 5 W = 400 W”为什么已经非常接近 500 W 系统边界：

- 80 块若按 4 板/Zone，共约 20 个 Zone；
- Zone 自身就存在明显分配损耗；
- 上游 manifold、接口、反射还需要功率余量。

因此以后统一写成：

\[
\boxed{
\text{80 块 × 5 W 是约 80\% 端到端效率下的预算上限，不是已验证保证值。}
}
\]

最终应使用：

\[
\eta_{\rm sys}
=
\eta_{\rm manifold}
\eta_{\rm Zone}
\eta_{\rm interface}
\eta_{\rm load}
\]

重新计算可同时供能板数。

---

## 13. T-cell 是当前主方案，但不是无条件最终方案

T-cell 的优势：

- \(\kappa\) 可解析反综合；
- 线宽可制造；
- 不需要几十微米级超强 edge-coupled gap；
- 幅度设计与 phase trim 可以解耦；
- 适合先做单 cell full-wave calibration。

主要风险：

\[
\boxed{
\text{reciprocal 3-port T-cell 没有理想 output isolation}.
}
\]

工件变化导致 Patch reflection 增大时，反射会沿 through chain 回传。

因此拓扑 gate：

- loaded Patch reflection 小：优先 T-cell；
- loaded Patch reflection / mutual loading 大：比较 isolated hybrid、Wilkinson、compact quadrature 等路线。

---

## 14. 旧文档如何解释

### 仍有效

- 500 W / 100 块 / 5–8 W 的功率守恒审计；
- 100-cell 普通 FR4 长链不可行；
- T-cell matched-extraction 公式；
- loaded Patch \(R+jX\) gate；
- layered workpiece model 与 \(Q_m\) 设计链。

### 降级为历史 seed / benchmark

- 50 × 50 mm 最终机械边界；
- 所有板 fixed 10% tap；
- 6.5 / 5 / 3 dB 作为最终 coupling；
- equal-power 的 21.50 / 30.17 / 47.58% 作为最终 taper；
- 0/90/180/270° 作为最终加热 phase；
- 100 块 × 5–8 W 在 500 W 下同时成立；
- raw S21≤0.5 dB 与 intentional extraction 混用。

### 当前优先参数

- 产品机械目标：50 × 60 mm；
- tscircuit CAD workaround：50 × 70 mm；
- Patch seed：37.5 × 28.5 mm；
- power ratio：1 : 0.6412 : 0.6412 : 1；
- phase：0°, -5.3°, -5.3°, 0°；
- \(\kappa_A,\kappa_B,\kappa_C\)：24.76%, 24.07%, 36.08%；
- series \(Z_t\)：43.37, 43.57, 39.98 Ω；
- branch \(Z_b\)：87.16, 88.81, 66.55 Ω（50 Ω resonant-load seed）；
- equivalent phase section：17.97, 16.97, 15.97 mm。

---

## 15. 下一轮 full-wave 只标定有限物理量

下一轮 HFSS/openEMS 不应再次大范围 blind sweep 架构，只标定：

1. 真实 PP + FR4 stack 下的 \(Z_c(W)\)；
2. 真实 \(\beta(W,f)\) 与 phase/mm；
3. loaded Patch 的 \(R_L+jX_L\)；
4. 单 cell \(\tau_i\)；
5. magnetic interface insertion loss / phase / return loss；
6. T-junction discontinuity；
7. Patch mutual coupling；
8. 真实工件下 \(Q_m\) 的修正。

标定后直接重新代入：

\[
\mathbf u^*
\rightarrow
e_i
\rightarrow
P_i
\rightarrow
\kappa_i
\rightarrow
Z_t,Z_b,L_\phi.
\]

---

## 16. 最终闭合结论

当前项目唯一理论主线：

\[
\boxed{
\begin{aligned}
&\text{500 W source budget}\\
&\Downarrow\\
&\text{multi-Zone architecture}\\
&\Downarrow\\
&\text{layered workpiece model }Q_m\\
&\Downarrow\\
&\text{optimal complex Patch excitation }\mathbf u^*\\
&\Downarrow\\
&\text{target }e_i,\phi_i\\
&\Downarrow\\
&\text{loss-aware recursion }P_i=e_i+P_{i+1}/\tau_i\\
&\Downarrow\\
&\kappa_i=e_i/P_i\\
&\Downarrow\\
&Z_t=Z_0\sqrt{1-\kappa_i}\\
&Z_b=\sqrt{R_LZ_0(1-\kappa_i)/\kappa_i}\\
&\Downarrow\\
&\text{phase trim + 50 × 60 mm PCB mapping}\\
&\Downarrow\\
&\text{single-cell full-wave calibration}\\
&\Downarrow\\
&\text{Zone/network validation}.
\end{aligned}
}
\]

其中：

- **架构、功率守恒、递推和 T-cell 反综合已经解析闭合；**
- **工件场目标已有 reduced-order robust 解；**
- **仍需全波/实测标定的是材料、负载、接口与不连续引起的修正量。**

后续设计、文档和参数更新都应从本文出发，不再并列引用多套互相冲突的“最终方案”。
