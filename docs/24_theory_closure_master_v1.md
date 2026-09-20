# micro_wave 理论闭合主线 V1

> **状态：当前理论总基线（2026-09-20）。**
>
> 本文用于统一此前 `docs/01–23` 中已经出现但口径不一致的尺寸、功率、Zone、T-cell、复幅相和工件加载模型。
>
> 优先级：本文 > `docs/23_few_mode_robust_field_synthesis_v1.md` > `docs/20_four_board_zone_analytic_closure_v1.md` / `docs/19_tcell_exact_equal_power_synthesis_v1.md` > 更早历史 seed。
>
> 本文所称“闭合”是指：在给定少量可测/可仿真的物理参数后，系统目标可以沿明确方程逐级反推到 PCB 设计参数；不表示当前 PCB 已经通过最终 HFSS/openEMS 或实测验收。

---

## 1. 先统一四个最容易混淆的口径

### 1.1 产品机械尺寸：50 × 60 mm

当前产品/理论机械目标为：

[
oxed{50	imes60 {m mm}}.
]

保持水平 50 mm Patch pitch 和既有 RF reference coordinates，不再把早期 50 × 50 mm 当成最终机械边界。

推荐物理坐标口径：

[
xin[-25,25] {m mm},qquad yin[-35,25] {m mm}.
]

当前 RF 铜、Patch 和 T-cell 几何可放在该 50 × 60 mm 有效机械包络内。

### 1.2 为什么代码里仍是 50 × 70 mm

当前 tscircuit 的 board outline 采用以原点为中心的矩形。为了在**不平移现有 RF/Patch 坐标**的前提下得到所需的下边界 (y=-35) mm，CAD seed 暂用：

[
oxed{50	imes70 {m mm}},qquad yin[-35,35] {m mm}.
]

因此：

- **50 × 60 mm = 产品/理论机械目标；**
- **50 × 70 mm = 当前 tscircuit 居中外框 workaround；**
- 多出的上侧 10 mm 不是新增 RF 需求，也不应进入产品尺寸说明；
- 加工冻结前应把机械外形裁切/平移回真实 50 × 60 mm，同时保持 RF reference 不变。

### 1.3 机械板数与同时供能板数不是一个概念

系统机械/识别架构可以支持：

[
oxed{1	ext{–}100 {m boards}}.
]

但“100 块都同时达到 5–8 W/块”不能与 500 W 源上限同时写成硬指标。

### 1.4 5–8 W 必须先说明是哪一种功率

全文统一区分：

[
P_{m inc}quad	ext{单板入口前向 RF},
]

[
P_{m ext}quad	ext{从主链抽取并送入 Patch branch 的 RF},
]

[
P_{m abs}quad	ext{工件实际吸收功率},
]

[
P_{m loss}quad	ext{铜/介质/触点/分配网络寄生损耗}.
]

如果客户只写“5–8 W/板”，在工件材料与负载效率未冻结前，默认它只能作为 (P_{m ext}) 的设计目标；不能直接宣称等于 (P_{m abs})。

---

## 2. 系统功率边界：500 W、80 块和 100 块如何同时写得自洽

源硬件上限：

[
oxed{P_{m src,max}=500 {m W}}.
]

设端到端效率为 (eta_{m sys})，总板数为 (N)，平均目标有用功率为 (ar P_b)，则必要条件：

[
oxed{Nar P_ble eta_{m sys}P_{m src,max}}.
]

因此可供规划使用的统一公式是：

[
oxed{
N_{max}(P_{min})
=
leftlfloor
rac{eta_{m sys}P_{m src,max}}{P_{min}}
ightfloor.
}
]

当前前期预算继续取：

[
eta_{m sys,plan}=0.80,
]

则可用总有用功率预算：

[
oxed{P_{m useful,budget}=400 {m W}}.
]

于是：

| 总板数 N | 平均有用功率预算上限 |
|---:|---:|
| 50 | 8.0 W/板 |
| 60 | 6.67 W/板 |
| 80 | 5.0 W/板 |
| 100 | 4.0 W/板 |

所以统一工程表述为：

[
oxed{
	ext{系统机械支持 1–100 块；在 500 W + 80% 规划效率下，5 W/板的预算上限约为 80 块。}
}
]

注意：**80 块是功率预算上限，不是已经验证的保证值。** 当前四板 Zone 本身已有约 20% 左右的 RF 分配损耗预算，因此真实 manifold、接口和工件效率加入后，能同时保持 5 W/板的数量只能由实测 (eta_{m sys}) 再确定。

100 块仍可作为机械/网络组态存在，但 500 W 源下应降低平均单板目标，当前第一版预算为约：

[
oxed{4 {m W/board}}.
]

若要求 100 块都至少 5 W，则至少需要：

[
P_{m src}
ge
rac{500}{eta_{m sys}}.
]

在 (eta_{m sys}=0.8) 时：

[
oxed{P_{m src}ge625 {m W}}.
]

---

## 3. 系统架构：100 块不是一条 FR4 长链

当前唯一合理的系统层级为：

[
oxed{
	ext{500 W source}
ightarrow
	ext{low-loss manifold}
ightarrow
	ext{local RF Zones}
ightarrow
	ext{boards}
ightarrow
	ext{workpiece}.
}
]

局部 Zone 取 1–4 块：

[
D,
quad
Cightarrow D,
quad
Bightarrow Cightarrow D,
quad
Aightarrow Bightarrow Cightarrow D.
]

100 块系统通过多个局部 Zone 组成，而不是 100 块沿约 5 m 普通 FR4 微带连续串联。

若普通 FR4 每 50 mm cell 的 through-loss 约：

[
L_{m cell}approx0.42 {m dB},
]

则：

[
	au=10^{-L_{m cell}/10}approx0.9078.
]

连续长链的损耗随级数指数累积，故 100-cell FR4 chain 不是“参数还没调好”，而是架构级错误。

---

## 4. 单 Zone 的通用功率递推：这是幅度综合的闭合核心

设四板 Zone 为：

[
Aightarrow Bightarrow Cightarrow D.
]

令第 (i) 块希望送入 Patch branch 的目标 RF 功率为 (e_i)，中间级 through-path 功率传输效率为 (	au_i)。

从末端向前递推：

[
P_D=e_D,
]

[
oxed{
P_i=e_i+rac{P_{i+1}}{	au_i},
qquad i=C,B,A.
}
]

于是每一级需要的抽取比例：

[
oxed{
kappa_i=rac{e_i}{P_i}.
}
]

这一定义同时覆盖：

- 旧的 equal-RF-power 目标；
- 当前 field-aware unequal-power 目标；
- 后续任意从工件优化反推出的 (e_i)。

因此以后不再把某一组 6.5/5/3 dB 或 21.5/30.2/47.6% 当作永久常数；它们只是特定 (e_i,	au_i) 下的一个解。

---

## 5. 旧 equal-power 解的地位：解析基准，不再是最终场设计

若：

[
e_A=e_B=e_C=e_D=E,
]

且：

[
	au_A=	au_B=	au_C=10^{-0.42/10},
]

则递推得到：

[
kappa_A=0.214983,
quad
kappa_B=0.301666,
quad
kappa_C=0.475842.
]

对应：

[
6.676 {m dB},
quad
5.205 {m dB},
quad
3.225 {m dB}.
]

这套结果仍有价值，因为它证明：

1. 四板局部 Zone 的功率分配可以解析闭合；
2. A/B/C 必须位置专用；
3. 原固定弱耦合方案不对；
4. 它可以作为全波校准 benchmark。

但它已经被工件场模型进一步更新，**不再作为当前最终功率 taper。**

---

## 6. 当前主设计目标：field-aware mirror taper

`docs/23` 的 layered few-mode robust model 已把优化对象从“每块 Patch RF 功率相等”升级为：

[
oxed{	ext{工件有限体积内的吸收场均匀性}}.
]

当前推荐复激励方向为：

[
oxed{
mathbf u
propto
(1, 0.801e^{-j5.3^circ}, 0.801e^{-j5.3^circ}, 1).
}
]

因此 accepted RF power 比例：

[
oxed{
e_A:e_B:e_C:e_D
=
1:0.6412:0.6412:1.
}
]

若四板平均 accepted RF 仍取 6.5 W：

[
oxed{
(e_A,e_B,e_C,e_D)
approx
(7.92, 5.08, 5.08, 7.92) {m W}.
}
]

这恰好全部位于 5–8 W 区间。

在加入当前 phase-section 后的损耗估计：

[
	au_Aapprox0.8768,
quad
	au_Bapprox0.8785,
quad
	au_Capprox0.8802,
]

通用递推给出：

[
oxed{
kappa_Aapprox24.76%,
quad
kappa_Bapprox24.07%,
quad
kappa_Capprox36.08%.
}
]

对应约：

[
6.06 {m dB},
quad
6.19 {m dB},
quad
4.43 {m dB}.
]

因此当前设计主线已经从：

[
	ext{equal power + 90° travelling mode}
]

更新为：

[
oxed{
	ext{outer-strong power taper + near-in-phase mirror mode}.
}
]

---

## 7. T-cell：从目标抽取比例直接反综合阻抗

设参考阻抗：

[
Z_0=50 Omega.
]

对某一级目标 (kappa)，T-junction 下游 through arm 为 (Z_0)，Patch 在设计频率处的目标实部为 (R_L)。

输入侧 quarter-wave transformer：

[
oxed{
Z_t=Z_0sqrt{1-kappa}.
}
]

Patch branch quarter-wave transformer：

[
oxed{
Z_b
=
sqrt{
R_L Z_0rac{1-kappa}{kappa}
}.
}
]

若 (R_L=50Omega)，化为：

[
Z_b=50sqrt{rac{1-kappa}{kappa}}.
]

代入当前 field-aware (kappa)：

| Board | (kappa) | (Z_t) | (Z_b)（(R_L=50Omega) seed） |
|---|---:|---:|---:|
| A | 0.2476 | 43.37 Ω | 87.16 Ω |
| B | 0.2407 | 43.57 Ω | 88.81 Ω |
| C | 0.3608 | 39.98 Ω | 66.55 Ω |

当前裸 FR4 Hammerstad 线宽仅用于 PCB seed；最终必须在真实 PP + FR4 stack 下重新求：

[
Z_c(W)=Z_{m target},
]

以及：

[
eta(W,f_0)L=rac{pi}{2}.
]

---

## 8. Loaded Patch 的闭合 gate：不能只看 Zone input S11

设实际 loaded Patch：

[
Z_L=R+jX.
]

对于复场设计，关键不是只让入口 S11 很小，而是控制 Patch branch 的幅相误差。

当前相位误差约 5° 的一阶 gate：

[
oxed{
|X/R|lesssim	an5^circapprox0.087.
}
]

因此单板/单 cell 标定至少必须输出：

- (operatorname{Re}Z_L)；
- (operatorname{Im}Z_L)；
- Patch accepted power；
- Patch complex phase；
- cell through magnitude/phase；
- parasitic loss。

若 (|X/R|) 过大，即使系统入口 S11 看起来很好，也不能认为场综合已经成立。

---

## 9. 场模型：从复激励到工件吸收

对第 (m) 个目标工件区域，定义功率沉积二次型：

[
oxed{
H_m=mathbf u^dagger Q_mmathbf u.
}
]

当前 few-mode layered spectral model 用：

- Patch 有限孔径谱；
- PP superstrate；
- air gap；
- complex workpiece permittivity；
- finite workpiece depth；

构造近似 (Q_m)。

这一步的作用是把“RF 网络设计”与“真正工件加热目标”连接起来。

因此当前完整设计链是：

[
oxed{
	ext{workpiece target}
ightarrow
Q_m
ightarrow
mathbf u^*
ightarrow
(e_i,phi_i)
ightarrow
kappa_i
ightarrow
(Z_{t,i},Z_{b,i},L_{phi,i})
ightarrow
	ext{PCB geometry}.
}
]

这才是当前仓库中应称为“理论闭合”的主线。

---

## 10. 相位综合：当前不再冻结 +90° travelling-wave

旧 T-cell 网络天然容易得到约 +90° 相邻 progression，这仍是一个方便的网络 benchmark。

但当前工件场模型的推荐 phase target 为：

[
phi_A=0^circ,
]

[
phi_B=phi_C=-5.3^circ,
]

[
phi_D=0^circ.
]

所以网络天然相位与工件目标相位之间的差，应由额外 phase section / trim 修正，而不是反过来强迫工件优化服从网络天然 +90°。

当前等效 50 Ω phase-section seed：

[
oxed{
L_{phi,AB/BC/CD}
approx
17.97, 16.97, 15.97 {m mm}.
}
]

这些是电长度 seed，不是加工冻结值。

---

## 11. 当前单 Zone 额定尺度与 500 W 系统如何连接

按当前 field-aware 6.5 W/板平均点：

[
sum e_i=26 {m W}.
]

当前递推估算 Zone input：

[
oxed{
P_{m Zone,in}approx31.99 {m W}.
}
]

局部 Zone 的 accepted-RF 分配效率约：

[
eta_{m Zone}
=
rac{26}{31.99}
approx81.3%.
]

这个数解释了为什么“80 块 × 5 W = 400 W”已经非常接近 500 W 系统边界：

- 80 块若按 4 板/Zone，共约 20 个 Zone；
- 仅局部 Zone 分配损耗就会把 source-side 需求推近 500 W；
- 上游 manifold、接口和反射还需要额外余量。

因此以后不再把“80 块 × 5 W”写成无条件保证，而写成：

[
oxed{
	ext{500 W 系统在约 80% 端到端效率规划下，5 W/板对应约 80 块的理论预算上限。}
}
]

真实板数必须由最终：

[
eta_{m sys}
=
eta_{m manifold}
eta_{m Zone}
eta_{m interface}
eta_{m load}
]

重新计算。

---

## 12. 当前结构选择：为什么 T-cell 是主方案，但不是无条件最终方案

T-cell 的优势：

- (kappa) 可解析反综合；
- 线宽可制造；
- 不需要几十微米超强 edge-coupled gap；
- 容易把幅度设计与相位 trim 分离；
- 适合先做单 cell 全波标定。

主要风险：

[
oxed{
	ext{reciprocal 3-port T-cell 没有理想 output isolation}.
}
]

当工件变化导致 Patch reflection 增大时，反射会沿 through chain 回传。

因此拓扑决策 gate 为：

- loaded Patch reflection 小：优先 T-cell；
- loaded Patch reflection / mutual loading 大：比较 isolated hybrid / Wilkinson / compact quadrature topology。

这也是为什么不能只凭解析匹配公式直接 manufacturing freeze。

---

## 13. 50 × 60 mm 与当前 T-cell 的几何可实现性

当前最深 T-cell 铜约在：

[
yapprox-28.8 {m mm}.
]

产品目标下边界：

[
y=-35 {m mm}.
]

仍有约：

[
6.2 {m mm}
]

几何余量。

Patch 上缘也位于 (y<25) mm 内。

因此当前 RF geometry **并不要求产品板高 70 mm**；50 × 70 只是当前 tscircuit 中心化 outline 的工程实现。

---

## 14. 旧文档如何解释，不再互相打架

### 仍有效

- V3 中对 500 W / 100 块 / 5–8 W 冲突的功率守恒审计；
- 长 FR4 chain 不可行结论；
- T-cell 的 matched-extraction 公式；
- loaded Patch (R+jX) gate；
- 分层工件模型和 (Q_m) 设计链。

### 降级为历史 seed / benchmark

- 50 × 50 mm 最终机械边界；
- 所有板 fixed 10% tap；
- 6.5 / 5 / 3 dB 作为最终 coupling；
- equal-RF-power 21.50 / 30.17 / 47.58% 作为最终 taper；
-固定 0/90/180/270° 作为最终加热 phase；
- 100 块 × 5–8 W 在 500 W 下同时成立；
- raw S21≤0.5 dB 与 intentional extraction 混用。

### 当前优先设计参数

- 产品机械：50 × 60 mm；
- tscircuit CAD workaround：50 × 70 mm；
- Patch：37.5 × 28.5 mm seed；
- field-aware power ratio：1 : 0.6412 : 0.6412 : 1；
- field-aware phase：0°, -5.3°, -5.3°, 0°；
- (kappa_A,kappa_B,kappa_C)：24.76%, 24.07%, 36.08%；
- T-cell impedance target：43.37/43.57/39.98 Ω series，87.16/88.81/66.55 Ω branch（50 Ω resonant-load seed）；
- phase section equivalent length：17.97/16.97/15.97 mm。

---

## 15. 下一轮仿真只需要标定什么

理论主线已经不需要继续大范围 blind sweep。下一轮 full-wave 应只标定以下有限物理量：

1. 真实 PP + FR4 stack 下 (Z_c(W))；
2. 真实 (eta(W,f)) 与 phase/mm；
3. loaded Patch 的 (R_L+jX_L)；
4. 单 cell (	au_i)；
5. magnetic interface 的 insertion loss / phase / return loss；
6. T-junction discontinuity；
7. Patch mutual coupling；
8. 真实工件下的 (Q_m) / absorbed-power correction。

标定后直接重新代入：

[
mathbf u^*
ightarrow
e_i
ightarrow
P_i
ightarrow
kappa_i
ightarrow
Z_t,Z_b,L_phi.
]

不需要重新发明系统架构。

---

## 16. 最终闭合结论

当前项目可以用下列链条作为唯一理论主线：

[
oxed{
egin{aligned}
&	ext{500 W source power budget}\
&Downarrow\
&	ext{multi-Zone architecture}\
&Downarrow\
&	ext{workpiece layered field model }Q_m\
&Downarrow\
&	ext{optimal complex Patch excitation }mathbf u^*\
&Downarrow\
&	ext{target accepted powers }e_i	ext{ and phases }phi_i\
&Downarrow\
&	ext{loss-aware recursion }P_i=e_i+P_{i+1}/	au_i\
&Downarrow\
&kappa_i=e_i/P_i\
&Downarrow\
&Z_t=Z_0sqrt{1-kappa_i},quad
Z_b=sqrt{R_LZ_0(1-kappa_i)/kappa_i}\
&Downarrow\
&	ext{phase trim + 50 × 60 mm PCB mapping}\
&Downarrow\
&	ext{single-cell full-wave calibration}\
&Downarrow\
&	ext{Zone/network validation}.
end{aligned}
}
]

这条链中：

- **架构、功率守恒、递推和 T-cell 反综合已经解析闭合；**
- **工件场目标已有 reduced-order robust 解；**
- **仍需全波/实测标定的是材料、负载、接口和不连续引起的修正量。**

因此后续文档与 PCB 参数都应从本文出发，不再并列引用多套互相冲突的“最终方案”。
