# 为什么采用矩形 Patch：从原方形螺旋方案到当前微波加热天线板的设计理由 V1

> 本文专门回答两个问题：
>
> 1. **什么是矩形 Patch？它为什么能够从 2.45 GHz RF 主线上取能并向前方工件输送微波能量？**
> 2. **为什么当前工程方案没有继续把“2–4 圈方形螺旋线圈”作为唯一基线，而改为矩形 Patch + 受控耦合 + 梯度分配？**
>
> 本文不是说“方形螺旋不能工作”。方形螺旋完全可以作为一个待比较的分布参数谐振结构。本文的结论是：在本项目的 **2.45 GHz、50 mm × 50 mm、背面整面 Ground、多板级联、要求可控取能和均匀加热** 的条件下，矩形 Patch 更容易把“谐振、匹配、耦合比例、前向场”分开设计和验证。

---

## 1. 先说明：这里的 Patch 到底是什么

这里的“矩形 Patch”不是一个普通铜片，也不是一块简单焊盘。

它是一个典型的 **微带贴片谐振器 / 微带贴片天线（microstrip patch resonator / antenna）**。

基本结构：

\`\`\`text
                 +z / 工件方向

            前方 PP / 空气 / 工件
                     ↑
                     │
        ┌────────────────────────┐
        │      矩形铜 Patch       │  Top Copper
        └────────────────────────┘
                FR4 1.6 mm
════════════════════════════════════  Bottom Ground
\`\`\`

本项目当前第一版结构是：

\`\`\`text
RF IN  ====================================  RF OUT
                 主 50 Ω through-line

                       || 受控边耦合
                       ||
                       ||
                       │
                       │ feed
                 ┌─────┴─────┐
                 │           │
                 │   PATCH   │
                 │           │
                 └───────────┘

                 ↓ 背面完整 Ground
                 ↑ 前方工件
\`\`\`

因此，一块板内部实际上存在两个不同功能：

1. **through-line**：把大部分 RF 功率继续向后传；
2. **Patch 支路**：从主线抽取指定比例 RF 功率，并在 2.45 GHz 附近形成谐振场，向前方工件耦合能量。

所以 Patch 不是“替代主线”，而是主线旁边的一个受控 RF 能量出口。

---

## 2. Patch 为什么能够辐射 / 向工件输送能量

矩形 Patch 的核心不是“铜片本身会发热”，而是它和背面 Ground 之间构成了一个高频分布参数谐振结构。

在最基本的 TM10 模式下，Patch 长度方向接近半个导波波长：

\[
L_{\rm eff}\approx\frac{\lambda_g}{2}
=
\frac{c}{2f_0\sqrt{\varepsilon_{\rm eff}}}.
\]

在 Patch 两个开路边缘附近，电场不能突然终止，因此会产生明显的边缘场（fringing field）。

可以把两个主要辐射边缘近似理解成两个等效 slot：

\`\`\`text
        radiation / near field
          ↑             ↑
          │             │
      ┌───┴─────────────┴───┐
      │        PATCH         │
      └─────────────────────┘
               FR4
════════════════════════════════  Ground
\`\`\`

这两个边缘场共同形成前向电磁场。

由于背面有连续 Ground：

- 背向场被明显抑制；
- 电磁能量主要集中到 Patch 前侧；
- 因而适合把工件放在 +z 方向。

这正好符合本项目“天线板朝前作用于加热物体”的要求。

---

## 3. “辐射”不等于“必须在远场工作”

本项目并不是在做通信天线。

工件可能距离板面只有几厘米。

2.45 GHz 自由空间波长：

\[
\lambda_0
=
\frac{c}{f}
\approx122.4\ {\rm mm}.
\]

原需求的 3 cm 场均匀性评价面：

\[
30\ {\rm mm}
\approx0.245\lambda_0.
\]

所以这里相当大一部分工作区域仍然处于天线近场 / 过渡区，而不是经典远场。

因此本项目真正关心的并不是“天线增益最高是多少”，而是：

\[
E(\mathbf r),\quad
H(\mathbf r),\quad
P_{\rm abs,workpiece}
\]

以及工件内部的功率沉积是否均匀。

这也是为什么在正式 HFSS/openEMS 模型中，工件必须作为电磁负载进入模型。

---

## 4. Patch 如何把微波能量变成工件加热

工件如果是有损介质，其复介电常数可以写为：

\[
\varepsilon_r
=
\varepsilon_r'
-j\varepsilon_r''.
\]

在时谐场中，工件吸收的平均功率可写成类似：

\[
P_{\rm abs}
=
\frac12
\int_V
\left[
\sigma |E|^2
+
\omega\varepsilon_0\varepsilon_r''|E|^2
\right]dV.
\]

因此过程是：

\[
\boxed{
\text{RF 主线}
\rightarrow
\text{耦合器}
\rightarrow
\text{Patch 谐振场}
\rightarrow
\text{工件中的有损电磁场}
\rightarrow
\text{热}
}
\]

也就是说：

**Patch 本身承担的是“把主线 RF 功率转换成合适的局部电磁场分布”，而不是直接作为电阻发热。**

---

## 5. 为什么原来的方形螺旋方案在本项目中比较难控制

原始需求写的是：

- 2–4 圈方形螺旋；
- 直通线；
- 耦合段；
- 背面整片 Ground；
- 2.45 GHz；
- 50 mm × 50 mm 板。

这个方案并非不可行，但需要注意：在 2.45 GHz 下，这个“线圈”已经不能按低频电感线圈来理解。

### 5.1 尺寸已经和波长同量级

自由空间波长约：

\[
\lambda_0\approx122.4\ {\rm mm}.
\]

而板边长已经：

\[
50\ {\rm mm}\approx0.41\lambda_0.
\]

假设一个方形螺旋外边长为 30 mm，仅最外圈周长就有：

\[
4\times30=120\ {\rm mm},
\]

已经接近一个自由空间波长。

如果再做 2–4 圈，总导体长度会进一步增加。

因此它实际上会表现成：

\[
\boxed{\text{distributed resonator}}
\]

而不是：

\[
\boxed{\text{lumped inductor}}
\]

---

## 6. 方形螺旋里有很多互相耦合的参数

一个 2.45 GHz 方形螺旋至少同时包含：

\[
L_{\rm spiral}
\]

\[
C_{\rm interturn}
\]

\[
C_{\rm ground}
\]

\[
R_{\rm conductor}
\]

以及相邻导体间的分布式电磁耦合。

所以：

- 改圈数；
- 改匝间距；
- 改线宽；
- 改外边长；
- 改耦合段长度；

往往会同时改变：

\[
f_r,\quad
Z_{\rm in},\quad
Q,\quad
\kappa,\quad
E(\mathbf r).
\]

这就是原方案最明显的优化困难之一：

\[
\boxed{
\text{谐振频率、匹配、取能比例、场分布很难彼此解耦。}
}
\]

---

## 7. 背面整片 Ground 会进一步改变“线圈”的性质

原始方案要求背面整片铜 Ground。

因此前面的方形螺旋和下面的 Ground 之间只有：

\[
1.6\ {\rm mm\ FR4}.
\]

这会形成明显的：

\[
C_{\rm ground}.
\]

因此这个结构不再是自由空间中的普通平面线圈，而更接近：

\[
\boxed{
\text{planar spiral resonator above ground}
}
\]

它的工作模式会严重依赖：

- FR4 介电常数；
- FR4 厚度；
- 前方 PP；
- 工件介电参数；
- 工件距离；
- Ground 尺寸。

所以只凭“2 圈 / 3 圈 / 4 圈”无法直接预测 2.45 GHz 性能。

---

## 8. 多板固定螺旋结构还存在功率逐级下降的问题

即使单个方形螺旋设计成功，如果 100 块都完全相同、每块固定抽取相同比例 \(\kappa\)，仍然会出现：

\[
P_i
=
\kappa P_0(1-\kappa)^{i-1}
\]

这样的几何衰减。

加入主线损耗后：

\[
P_{i+1}
=
\tau(1-\kappa)P_i.
\]

因此后面的板天然比前面的板功率小。

这和原始需求中的：

\[
1\sim100\text{ 块},
\]

\[
5\sim8\ {\rm W/块},
\]

\[
\pm25\%\text{ 均匀性}
\]

之间存在直接的系统矛盾。

问题不在于“螺旋一定不好”，而在于：

\[
\boxed{
\text{固定、同构的取能结构不能自动实现长链等功率。}
}
\]

这也是我们后来引入梯度耦合的重要原因。

---

## 9. Patch 相比方形螺旋最大的优势是什么

Patch 最大的价值不是“看起来更简单”，而是它的几个关键设计自由度相对容易分工。

### 9.1 谐振频率主要由 Patch 长度控制

第一阶：

\[
f_r
\sim
\frac{c}
{2L_{\rm eff}\sqrt{\varepsilon_{\rm eff}}}.
\]

因此：

\[
L_p
\]

主要决定中心谐振频率。

---

### 9.2 输入阻抗主要由馈电位置控制

采用 inset feed 时，沿 Patch 长度方向改变 feed 位置，可以显著改变输入阻抗。

近似：

\[
R_{\rm in}(y)
\approx
R_{\rm edge}
\cos^2
\left(
\frac{\pi y}{L_p}
\right).
\]

因此：

\[
y_{\rm inset}
\]

可以主要用于调匹配。

---

### 9.3 主线到 Patch 的取能比例主要由 coupler 控制

我们当前不是把 Patch 直接 T 接到主线。

而是：

\`\`\`text
main line  =========================

                ||  gap
                ||
coupled line  ========
                   |
                   |
                 PATCH
\`\`\`

因此：

\[
g_c,\quad
l_c,\quad
w_c,\quad
{\rm overlap}
\]

可以主要用来控制：

\[
\kappa
=
\frac{P_{\rm extract}}{P_{\rm incident}}.
\]

这意味着设计变量可以近似按功能分成：

\[
\boxed{
L_p\rightarrow f_r
}
\]

\[
\boxed{
y_{\rm inset}\rightarrow Z_{\rm in}
}
\]

\[
\boxed{
g_c,l_c,\text{overlap}\rightarrow\kappa
}
\]

虽然真实全波模型中仍然存在互相影响，但比方形螺旋中“所有几何同时影响所有结果”更容易优化。

---

## 10. Patch 为什么特别适合梯度耦合

我们当前系统不是要求每一块结构都完全一样，而是希望：

\[
\kappa_A
<
\kappa_B
<
\kappa_C
<
\kappa_D.
\]

按当前 0.42 dB/cell 的理论估计：

\[
\kappa_A\approx21.5\%,
\]

\[
\kappa_B\approx30.2\%,
\]

\[
\kappa_C\approx47.6\%,
\]

\[
\kappa_D\approx100\%.
\]

Patch 本体的谐振尺寸可以基本保持一致，而主要通过耦合器和末端匹配改变抽取比例：

\`\`\`text
A: Patch + weak/medium coupler
B: Patch + stronger coupler
C: Patch + strong coupler
D: terminal matched Patch
\`\`\`

这比用 2 圈、3 圈、4 圈螺旋同时改变天线本体模式更容易控制。

---

## 11. 为什么不能简单说“Patch 一定比螺旋好”

当前不能这样下结论。

真正的性能要看：

\[
S_{11}(f),
\]

\[
S_{21}(f),
\]

\[
P_{\rm extract},
\]

\[
P_{\rm abs,workpiece},
\]

\[
E(\mathbf r),
\]

\[
\Delta P_{\rm board},
\]

以及：

\[
E_{\max}.
\]

原方形螺旋可能在某些工件和间距下形成更强的局部磁场或特定近场分布。

因此工程上正确的说法是：

\[
\boxed{
\text{Patch 是当前优先优化路线，不是未经仿真证明的绝对最优路线。}
}
\]

---

## 12. 为什么当前设计选择 Patch 作为主基线

综合当前项目约束，我们选择矩形 Patch 作为主基线，理由是：

### 12.1 2.45 GHz 下物理模式更明确

矩形 Patch 的 TM10 基模、有效长度、边缘场和 Ground 作用都有明确的经典模型。

第一版尺寸可以先由解析公式得到，再进入全波优化。

### 12.2 更容易实现前向场

背面完整 Ground 与 Patch 天生匹配。

这与“工件位于板前侧”的结构要求一致。

### 12.3 谐振、匹配、耦合比例更容易分别调节

这直接服务于梯度耦合架构。

### 12.4 更容易定义 A/B/C/D 四类板

同一个 Patch 基体可以通过 coupler 和 terminal matching 生成不同位置等级。

### 12.5 更容易做参数化 HFSS/openEMS 扫描

可定义：

\[
\mathbf{x}
=
(
L_p,\,
W_p,\,
y_{\rm inset},\,
g_c,\,
l_c,\,
w_c,\,
d_{\rm workpiece}
).
\]

这样便于自动优化和结果复现。

### 12.6 更容易解释仿真结果

例如：

- \(L_p\) 改变 → 谐振频率移动；
- inset 改变 → 输入阻抗变化；
- coupler 改变 → 抽取比例变化；

工程调试链条相对清晰。

---

## 13. 当前第一版 Patch 尺寸从哪里来

当前理论 seed：

\[
W_p\approx37.5\ {\rm mm},
\]

\[
L_p\approx28.5\ {\rm mm}.
\]

它来自 2.45 GHz 矩形微带 Patch 的经典一阶估算，再考虑前方 PP 介质加载后把长度留作可优化变量。

当前扫描范围：

\[
W_p=35\sim39\ {\rm mm},
\]

\[
L_p=27\sim30.5\ {\rm mm}.
\]

这些尺寸不是最终加工冻结值。

工件、PP、磁吸接口和真实材料损耗全部加入后，谐振频率会移动，因此必须通过 HFSS/openEMS 重调。

---

## 14. 当前设计真正要验证的不是“它会不会发射”

Patch 会形成电磁场这一点不是本项目最大的不确定性。

真正需要验证的是：

1. 在 PP + 工件加载下，2.45 GHz 是否仍在目标谐振附近；
2. coupler 是否能分别实现 A/B/C 的目标抽取比例；
3. D 终端板是否能在使用剩余 RF 功率的同时保持低反射；
4. 板间磁吸接口是否破坏 50 Ω 主线；
5. 4 板 Zone 的实际功率是否能做到：
   \[
   P_A\approx P_B\approx P_C\approx P_D;
   \]
6. 工件在 3 cm 或实际距离下的场 / 功率沉积是否满足均匀性要求；
7. 局部高场和打火风险是否可接受。

---

## 15. 与原需求的关系：这是结构优化，不是原方案的同义替换

对外沟通时必须明确：

**原始方案：**

\[
\text{through-line}
+
\text{coupling section}
+
\text{2–4 turn square spiral}
\]

**当前优化方案：**

\[
\text{through-line}
+
\text{controlled coupler}
+
\text{rectangular Patch}
+
\text{gradient power extraction}.
\]

二者实现目的相近：

- 从 RF 主线取能；
- 在板前形成电磁场；
- 向工件输送微波能量。

但二者不是同一个几何，也不是同一个谐振机理。

因此当前方案应被表述为：

\[
\boxed{
\text{针对原结构在高频参数耦合和多板均匀取能方面问题提出的优化方案。}
}
\]

而不是说“Patch 就是原来的线圈”。

---

## 16. 如果客户要求必须保留方形螺旋怎么办

方形螺旋路线仍然可以保留为对照方案。

建议单独建立：

\[
N_{\rm turn}=2,\ 3,\ 4
\]

的全波模型，并扫描：

\[
l_c=5\sim15\ {\rm mm},
\]

\[
g_c=0.3\sim0.8\ {\rm mm},
\]

\[
w_{\rm RF}=1.5\sim3.0\ {\rm mm},
\]

以及螺旋：

\[
w_{\rm spiral},\quad
s_{\rm spiral},\quad
D_{\rm outer}.
\]

然后和 Patch 用完全相同的评价口径比较：

| 指标 | 方形螺旋 | 矩形 Patch |
|---|---:|---:|
| 2.45 GHz 匹配 | HFSS结果 | HFSS结果 |
| 抽取比例可控性 | HFSS结果 | HFSS结果 |
| 工件吸收功率 | HFSS结果 | HFSS结果 |
| 3 cm 场均匀性 | HFSS结果 | HFSS结果 |
| 局部最大场强 | HFSS结果 | HFSS结果 |
| 多板梯度实现难度 | 比较 | 比较 |
| 对工件参数敏感度 | 比较 | 比较 |

在仿真结果出来以前，不提前宣布哪一种绝对优胜。

---

## 17. 对客户/仿真工程师的简短说明建议

可以用下面这段口径：

> 原始方案采用 2–4 圈方形螺旋作为 2.45 GHz 取能结构。由于 5 cm 板尺寸和 2.45 GHz 波长已经处于同一量级，2–4 圈螺旋在此频率下实际属于分布参数谐振结构，圈数、匝距和耦合段会同时影响谐振频率、输入阻抗、取能比例和局部场分布；同时如果 1–100 块都使用完全相同的固定耦合结构，后级板功率会逐级下降，不利于满足取能均匀性。因此当前增加矩形微带 Patch 作为优化方案。Patch 同样可以从主线抽取 RF 功率并向前方工件建立微波场，但其谐振长度、阻抗匹配位置和主线耦合强度可以相对独立地参数化，更适合后续的梯度取能设计。原螺旋方案仍可保留为对照仿真，最终通过 S 参数、单板取能、工件吸收功率、场均匀性和局部高场结果决定最终结构。

---

## 18. 当前结论

当前设计选择矩形 Patch 的真正理由可以归纳为：

\[
\boxed{
\text{不是因为 Patch 更“高级”，而是因为它更适合把本项目的关键变量拆开控制。}
}
\]

即：

\[
\boxed{
\text{谐振}
+
\text{阻抗匹配}
+
\text{功率耦合}
+
\text{前向场}
+
\text{梯度分配}
}
\]

能够形成一条更清晰的设计和验证链路。

当前仍需通过全波仿真完成最终验证，尤其是：

\[
\boxed{
\text{工件加载后的真实取能与加热性能。}
}
\]


---

## 19. 设计思想升级：从“耦合百分比设计”转向“目标复激励设计”

前面的设计理由解决了“为什么当前优先采用 Patch”这一层问题。继续向下推进后，当前方案的设计思想需要进一步升级。

早期方案的逻辑是：

\[
\text{给定 } \kappa_A,\kappa_B,\kappa_C
\rightarrow
\text{设计 coupler}
\rightarrow
\text{希望各板加热均匀}.
\]

这个顺序只在以下近似成立时可靠：

1. 每一级主要单向传播；
2. Patch 反射足够小；
3. 相邻 Patch 互耦足够弱；
4. 工件对各 Patch 的反馈可近似独立；
5. “等 RF 抽取”可以近似代表“等工件吸收”。

在 2.45 GHz、50 mm cell 条件下，这些假设不能直接预设成立。当前设计思想因此改为：

\[
\boxed{
\text{先确定工件侧所需的复数激励}
\rightarrow
\text{再反求无源 RF 网络}
\rightarrow
\text{最后映射为 PCB 几何}
}
\]

也就是说，A/B/C/D 不再首先被定义为“22%、30%、50%、terminal”四个数字，而首先被定义为四个具有幅度和相位要求的 RF cell。

---

## 20. 当前设计链条必须分成四个空间

今后的参数设计统一按下面四层组织。

### 20.1 几何空间

用：

\[
\boldsymbol{\theta}
=
(
L_p,W_p,y_{\rm inset},
l_c,g_c,w_c,
l_{\rm line},
\text{topology},
d_{\rm workpiece},\ldots
)
\]

表示 PCB 和负载几何。

### 20.2 网络空间

全波求解得到：

\[
\mathbf S(\omega;\boldsymbol{\theta}).
\]

这里必须保留复数：

\[
|S_{ij}|,
\qquad
\angle S_{ij}.
\]

不允许只保存 coupling dB 和 VSWR。

### 20.3 激励空间

四块 Patch 的实际复激励写成：

\[
\mathbf u
=
(u_A,u_B,u_C,u_D)^T.
\]

其中：

\[
u_i
=
|u_i|e^{j\phi_i}.
\]

系统真正送给工件的是 \(\mathbf u\)，而不是单独的 \(\kappa_i\)。

### 20.4 功率沉积空间

工件第 \(k\) 个区域的吸收功率写成：

\[
\boxed{
H_k
=
\mathbf u^\dagger
\mathbf Q^{(k)}
\mathbf u
}
\]

其中：

\[
\mathbf Q^{(k)}\succeq0.
\]

因此完整设计映射是：

\[
\boxed{
\boldsymbol{\theta}
\rightarrow
\mathbf S
\rightarrow
\mathbf u
\rightarrow
\{H_k\}.
}
\]

这条链以后作为当前项目最核心的设计思想。

---

## 21. 为什么不能再把 A/B/C 的百分比当作最终设计目标

当前：

\[
A\approx6.5\ {\rm dB},
\qquad
B\approx5.0\ {\rm dB},
\qquad
C\approx3.0\ {\rm dB}
\]

仍然非常有价值，但它们的角色变了。

它们现在定义为：

\[
\boxed{
\text{第一轮功率预算 seed}
}
\]

而不是：

\[
\boxed{
\text{最终物理最优解}.
}
\]

原因是同样的 \(|u_i|\) 在不同相位下可能得到完全不同的工件场：

\[
\mathbf E(\mathbf r)
=
\sum_i
u_i\mathbf E_i(\mathbf r).
\]

于是：

\[
\left|
\sum_i
u_i\mathbf E_i
\right|^2
\neq
\sum_i
|u_i\mathbf E_i|^2
\]

一般成立。

所以后续优化变量必须至少包含：

\[
\boxed{
|u_i|,\quad \phi_i.
}
\]

也就是说：

\[
\boxed{
\text{amplitude taper}
+
\text{phase taper}
}
\]

要一起设计。

---

## 22. 50 mm 模块本身就是相位器件

当前一阶：

\[
\lambda_g\approx66\sim68\ {\rm mm}.
\]

因此 50 mm cell 的 through phase 约：

\[
265^\circ\sim270^\circ.
\]

这意味着板间相位不是二阶修正，而是一级设计变量。

当前建议继续以：

\[
\angle S_{21}(2.45{\rm GHz})
\approx-270^\circ
\]

作为 modular cell 的第一轮 reference-plane seed，但其目的不是为了追求一个漂亮整数，而是为了让：

1. A/B/C 的 reference plane 一致；
2. 复数网络级联可重复；
3. 后续 phase taper 可以通过明确的传输相位预算实现；
4. 频率扫描时可以直接计算 group delay 和相位漂移。

因此以后修改 coupler 几何时，不能只问：

> coupling 变成多少？

必须同时问：

> through phase 和 coupled-port phase 变成多少？

---

## 23. 两个理论判据决定“简化模型还能不能用”

设计阶段允许使用简化模型，但必须通过判据确认。

### 23.1 多重反射判据

将内部 radiator / load 端口消去后，多次散射由：

\[
(I-S_{rr}\Gamma_L)^{-1}
\]

控制。

定义：

\[
\boxed{
m_{\rm refl}
=
\|S_{rr}\Gamma_L\|_2.
}
\]

若：

\[
m_{\rm refl}<1,
\]

则：

\[
(I-S_{rr}\Gamma_L)^{-1}
=
I+
S_{rr}\Gamma_L+
(S_{rr}\Gamma_L)^2+\cdots .
\]

并且：

\[
\left\|
(I-S_{rr}\Gamma_L)^{-1}-I
\right\|_2
\le
\frac{m_{\rm refl}}{1-m_{\rm refl}}.
\]

因此 \(m_{\rm refl}\) 小时，单向模型才有明确依据。

更直接的 internal-resonance margin 为：

\[
\boxed{
r_{\rm int}
=
\sigma_{\min}
(I-S_{rr}\Gamma_L).
}
\]

设计上希望它远离 0。

### 23.2 相干沉积判据

将某一区域的沉积矩阵分成：

\[
Q=D+C,
\]

其中：

\[
D=\operatorname{diag}(Q).
\]

定义：

\[
\boxed{
\rho_C
=
\left\|
D^{-1/2}
C
D^{-1/2}
\right\|_2.
}
\]

则对任意激励：

\[
\frac{
|H-H_{\rm incoherent}|
}{
H_{\rm incoherent}
}
\le
\rho_C.
\]

所以：

- \(\rho_C\ll1\)：独立板近似有依据；
- \(\rho_C\) 较大：必须按相干多源问题优化。

这两个量以后作为判断理论层级的“设计 gate”。

---

## 24. 优化顺序必须反过来：先求理想场，再做无源综合

后续优化分为两阶段。

### Stage A — Ideal Maxwell excitation

先暂时假设四个 Patch 可以由四个独立理想 RF 源激励，求：

\[
\mathbf u_*.
\]

目标例如：

\[
\min_{\mathbf u}
\max_k
\frac{
|H_k-\bar H|
}{
\bar H
}
\]

同时限制：

\[
P_{\rm total},
\qquad
E_{\max},
\qquad
P_{\rm parasitic}.
\]

这一阶段回答：

\[
\boxed{
\text{在当前 Patch + 工件几何下，电磁场本身最多能做到多均匀？}
}
\]

### Stage B — Passive RF synthesis

再要求：

\[
\mathbf u=\mathbf u(\boldsymbol{\theta})
\]

必须由：

\[
\text{single magnetron}
+
\text{passive reciprocal network}
\]

产生。

第二阶段求：

\[
\min_{\boldsymbol{\theta}}
\left\|
\mathbf u(\boldsymbol{\theta})
-
\mathbf u_*
\right\|.
\]

这一阶段回答：

\[
\boxed{
\text{当前 A/B/C/D PCB 拓扑能多接近理想 Maxwell 激励？}
}
\]

这样可以明确区分：

- 几何/Maxwell 本身的限制；
- 无源 coupler 拓扑的限制；
- 加工尺寸和材料的限制。

---

## 25. A/B/C/D 的新定义

以后四类板不优先按 coupling percentage 定义，而按“网络功能”定义。

### A — early-stage extraction cell

要求：

- 较弱功率抽取；
- 很低反射；
- through phase 受控；
- 不显著扰乱后级。

### B — mid-stage extraction cell

要求：

- 中等抽取；
- 低反射；
- 与 A 保持兼容 reference plane；
- 调整幅相以逼近目标 \(\mathbf u_*\)。

### C — strong extraction / phase-conditioning cell

C 不再只等价于“约 3 dB coupler”。

它可能需要同时承担：

\[
\boxed{
\text{strong extraction}
+
\text{phase conditioning}
}
\]

因此 branch-line / hybrid / broadside 等结构是否采用，应由目标复传输系数决定，而不是只由 50% coupling 决定。

### D — terminal radiating load

D 的核心目标：

\[
\boxed{
\text{matched terminal field source}
}
\]

不保留 RF OUT，并负责使 Zone 的终端边界条件可控。

---

## 26. 设计目标从“等 RF 功率”升级为“等目标区域吸收”

旧目标：

\[
P_A\approx P_B\approx P_C\approx P_D.
\]

它仍可用于无工件或早期调试。

最终目标改成：

\[
\boxed{
H_1\approx H_2\approx H_3\approx H_4
}
\]

其中：

\[
H_k
=
\mathbf u^\dagger Q^{(k)}\mathbf u.
\]

必要时还要加入：

\[
H_{\rm edge},
\qquad
H_{\rm hotspot},
\qquad
E_{\max}.
\]

因此“板功率均匀”降级为中间变量，“工件功率沉积均匀”才是最终物理目标。

---

## 27. 可以预先计算一个 Patch + 工件几何的效率上界

将端口阻抗矩阵实部分解为：

\[
R
=
R_{\rm work}
+
R_{\rm Cu}
+
R_{\rm FR4}
+
R_{\rm rad}
+\cdots .
\]

则任意端口电流 \(\mathbf I\) 下：

\[
P_{\rm work}
=
\frac12
\mathbf I^\dagger
R_{\rm work}
\mathbf I,
\]

\[
P_{\rm acc}
=
\frac12
\mathbf I^\dagger
R
\mathbf I.
\]

因此最大可能工件吸收效率满足：

\[
\boxed{
\eta_{\max}
=
\lambda_{\max}
\left(
R^{-1/2}
R_{\rm work}
R^{-1/2}
\right).
}
\]

这个量应在 coupler 深度优化之前计算。

如果当前 radiator + workpiece geometry 的 \(\eta_{\max}\) 本身很低，那么继续优化 A/B/C coupling 没有意义，应先修改：

- Patch；
- 板距；
- 工件距离；
- superstrate；
- Ground / aperture；
- radiator topology。

---

## 28. 当前 PCB 参数的角色重新定义

以下仍保留：

\[
W_p=37.5\ {\rm mm},
\quad
L_p=28.5\ {\rm mm},
\quad
y_{\rm inset}=10.5\ {\rm mm},
\quad
w_{\rm RF}=2.9\ {\rm mm}.
\]

但统一定义为：

\[
\boxed{\text{搜索起点，而非设计真值}}
\]

同样：

\[
A=6.5{\rm dB},
\quad
B=5{\rm dB},
\quad
C=3{\rm dB}
\]

定义为：

\[
\boxed{\text{scalar-budget seed}}
\]

后续若复数场优化要求：

\[
|u_A|:|u_B|:|u_C|:|u_D|
\]

或：

\[
\phi_A,\phi_B,\phi_C,\phi_D
\]

偏离这套 seed，应允许修改 A/B/C coupling 和 cell electrical length。

不能为了保持旧百分比而牺牲最终加热性能。

---

## 29. 仿真数据必须能够反推设计，而不是只给图片

以后单板和 Zone 仿真必须输出能够进入上述数学模型的数据。

至少包括：

1. 完整 complex Touchstone S 参数；
2. reference-plane 定义；
3. port phase；
4. group delay；
5. Patch / workpiece loaded reflection；
6. 四个基激励对应的复数场；
7. 分区 \(Q^{(k)}\)；
8. \(\rho_C\)；
9. \(r_{\rm int}=\sigma_{\min}(I-S_{rr}\Gamma_L)\)；
10. Cu / FR4 / workpiece / radiation 的功率分解。

场图仍然需要，但场图是解释结果，不是替代这些数据。

---

## 30. 当前设计思想的最终表述

当前主方案不再表述成：

\[
\text{“用 6.5/5/3 dB 梯度耦合器给四块 Patch 等功率。”}
\]

更准确的设计思想是：

\[
\boxed{
\begin{aligned}
&\text{用 Patch 建立可参数化的局部场基函数；}\\
&\text{用全波模型得到复数多端口网络和工件沉积矩阵；}\\
&\text{先求满足均匀加热的目标复激励；}\\
&\text{再用 A/B/C/D 无源 RF cell 去逼近该复激励；}\\
&\text{最后通过几何参数、材料和接口完成可制造实现。}
\end{aligned}
}
\]

所以当前项目真正优化的是：

\[
\boxed{
\text{field synthesis}
+
\text{passive network synthesis}
}
\]

而不仅仅是：

\[
\boxed{
\text{coupling-ratio tuning}.
}
\]

这条原则从现在起应作为 Patch、coupler、Zone、HFSS/openEMS 和 PCB 代码继续推进时的统一设计思想。
