# 当前能力与客户需求 Gap 审计 V1

> 日期：2026-09-20
>
> 本文回答两个问题：
>
> 1. 客户原始需求距离当前项目还有多少 gap；
> 2. 当前仓库“真正已经做到”的能力是什么。
>
> 结论先行：**当前项目已完成较强的理论架构与 PCB 参数化，但尚未完成当前主方案的单板全波闭环，更没有完成四板 Zone、25/100 块系统或 500 W 实物验证。**
>
> 因此任何“80 块”“100 块”“5–8 W/板”的数字，目前都不能表述为已实现能力。

---

## 1. 五层成熟度定义

### L0 — 理论架构

包括：

- 功率守恒；
- 多 Zone 架构；
- loss-aware 递推；
- T-cell 反综合；
- few-mode 工件模型；
- field-aware 幅相目标。

**当前状态：基本完成。**

### L1 — PCB/CAD 可实现性

包括：

- 参数化 PCB；
- A/B/C/D；
- matched T-cell 版本；
- Gerber/Circuit JSON 导出；
- 50 × 60 mm 产品机械目标与 50 × 70 mm tscircuit CAD workaround 的区分。

**当前状态：已实现 true 50 × 60 mm calibration board，并新增包含 RF 接口、T-cell、Patch、bottom ground、10 kΩ ID 支路的 full engineering board V2；仍不是 manufacturing freeze。**

### L2 — 当前主方案单板全波闭环

要求当前推荐的 T-cell / field-aware 结构在真实 PP+FR4 stack、loaded Patch、磁吸接口条件下验证：

- S11/VSWR；
- target extraction；
- Patch accepted power；
- Patch complex phase；
- through loss；
- loaded R+jX。

**当前状态：T-cell core network 已完成可信 thru/T-cell coupon verify；完整单板（launch + Patch + ID + workpiece）尚未闭环。**

### L3 — 四板 Zone 全波/网络闭环

要求：

\[
A\rightarrow B\rightarrow C\rightarrow D
\]

在当前 field-aware 目标下验证：

- 四板 accepted power；
- 四板 phase；
- Zone 输入匹配；
- ±25% 或更好的均匀性；
- 工件吸收分布；
- mutual coupling。

**当前状态：未完成。**

### L4 — 多 Zone 系统级闭环

包括：

- manifold；
- 连接桥；
- 磁吸接口；
- 长线；
- 25/100 块复数 S 参数网络模型；
- 不同板数的功率控制。

**当前状态：未完成。**

### L5 — 500 W 实物验证

包括：

- 实物 S 参数；
- 500 W 功率承载；
- 热；
- 打火/击穿；
- 触点温升；
- 工件加热；
- 板间一致性。

**当前状态：未开始。**

---

## 2. 当前唯一现有 openEMS 数值结果是什么

仓库当前 results/openems/summary.json 是**旧 edge-coupled A/B/C/D seed 的第一轮单板提取**，不是当前推荐 T-cell / field-aware PCB 的验证。

2.45 GHz 结果：

| Board | S11 | 约 VSWR | Patch-port transmission |
|---|---:|---:|---:|
| A | -7.67 dB | 2.41 | -27.86 dB |
| B | -9.43 dB | 2.02 | -20.27 dB |
| C | -10.59 dB | 1.84 | -14.91 dB |
| D | -3.07 dB | 5.72 | -7.34 dB |

其中 A/B/D 的输入匹配并不满足当前 VSWR≤2 的硬目标；C 仅初步通过。

Patch-port 功率比粗略对应：

\[
A\approx0.16\%,
\quad
B\approx0.94\%,
\quad
C\approx3.22\%,
\quad
D\approx18.4\%.
\]

但必须注意：

- 这是端口提取模型；
- 不是工件吸收功率；
- 不是当前 T-cell 结构；
- 不应直接换算成“每板多少 W”。

所以这批结果的正确意义只是：

\[
\boxed{\text{仿真链路已跑通，但旧结构性能未达标。}}
\]

---

## 3. 客户原需求逐项 Gap

| 客户目标 | 当前状态 | 当前能否宣称做到 |
|---|---|---|
| 2.45 GHz 工作 | 理论和模型中心频率已固定 | **可以作为设计中心，不能作为最终验收** |
| 2.40–2.50 GHz 带宽 | 有理论/seed，没有当前 T-cell 全波带宽验证 | **不能** |
| 单板 5–8 W | 只有理论 target；没有当前结构 full-wave accepted power，更无实物 | **不能** |
| 1–100 块 | 只有系统架构思路和理论分区 | **不能说 100 块已实现** |
| 5/25/100 块均匀 | 当前只有 reduced-order 四板模型 | **不能** |
| ±25% 均匀性 | few-mode 模型给出优于该目标的 surrogate，但未 full-wave 验证 | **只能说理论上有可行 seed** |
| 500 W 输入 | 只做功率预算，没有高功率 EM/热/击穿验证 | **不能** |
| 磁吸串联接口 | 有 PCB 接口 seed；没有接口 S 参数闭环 | **不能** |
| 平面桥 | 理论指出原 0.2 dB 指标过严；无当前完整仿真验收 | **不能** |
| 立体直角桥 | 同上 | **不能** |
| 跨区连接 | 系统概念有，具体网络未闭环 | **不能** |
| 工件实际加热 | few-mode surrogate 有；没有真实工件 full-wave/thermal | **不能** |
| 方形螺旋 | 已降为历史/对照路线，目前主方案是 Patch | **属于需求变更，需客户确认** |
| 50 × 50 mm | 当前主结构理论需要 50 × 60 mm | **属于需求变更，需客户确认** |
| 10 kΩ 识别 | 当前理论改成其它计数方案 | **属于控制方案变更，需客户确认** |

---

## 4. “80 块”应该如何定位

80 块不是当前能力，也不是当前正式设计要求。

它只来自一个假设：

\[
P_{\rm src}=500\ {\rm W},
\qquad
P_b=5\ {\rm W},
\qquad
\eta_{\rm sys}=0.8.
\]

于是：

\[
N=\frac{500\times0.8}{5}=80.
\]

但当前：

\[
\boxed{\eta_{\rm sys}\ \text{尚未由当前主结构得到。}}
\]

所以 80 只能写成：

\[
\boxed{\text{在假设系统效率 80% 时的敏感性示例。}}
\]

不能写成：

- 推荐上限；
- 可保证板数；
- 当前工程能力；
- 客户应接受的新指标。

真正板数上限必须在以下量得到后再计算：

\[
\eta_{\rm sys}
=
\eta_{\rm manifold}
\eta_{\rm interface}
\eta_{\rm zone}
\eta_{\rm load}.
\]

---

## 5. 当前理论真正做到的程度

理论上目前已经比较扎实的是：

### 5.1 证明原 100-cell FR4 连续长链不可行

这一结论是架构层面的，可以保留。

### 5.2 给出局部四板 Zone 的通用递推

\[
P_D=e_D,
\]

\[
P_i
=
e_i+\frac{P_{i+1}}{\tau_i},
\]

\[
\kappa_i
=
\frac{e_i}{P_i}.
\]

这部分是闭合的。

### 5.3 T-cell 可以从 \(\kappa\) 解析反推阻抗

\[
Z_t
=
Z_0\sqrt{1-\kappa},
\]

\[
Z_b
=
\sqrt{
R_LZ_0\frac{1-\kappa}{\kappa}
}.
\]

这部分也是闭合的。

### 5.4 工件侧已经有 reduced-order 优化 seed

当前理论建议：

\[
\mathbf u
\propto
(1,\ 0.801e^{-j5.3^\circ},\ 0.801e^{-j5.3^\circ},\ 1).
\]

但它的正确标签是：

\[
\boxed{\text{next-design target}}
\]

而不是：

\[
\boxed{\text{validated performance}}.
\]

---

## 6. 当前真正“能交付”的东西

当前如果停止继续研发，能够较可靠交付的是：

1. 完整需求可行性审计；
2. 原始需求中物理冲突的证明；
3. 多 Zone 系统架构方案；
4. 单板/T-cell 的理论参数 seed；
5. 参数化 PCB/Gerber 生成代码；
6. 第一轮 openEMS 模型与旧结构结果；
7. 下一轮全波标定的明确变量清单；
8. 不能达到的旧指标及修改建议。

当前还不能可靠交付为“已达标结果”的是：

1. 最终单板；
2. 最终 5–8 W/板；
3. 最终 ±25% 多板均匀性；
4. 最终 2.40–2.50 GHz 性能；
5. 四板 Zone 达标结果；
6. 25/100 块系统达标结果；
7. 500 W 功率承载；
8. 实际工件温升/加热效率；
9. 加工冻结文件。

---

## 7. 当前最大的 Gap 排序

### Gap A — T-cell core 已验证，但完整工程板还没有 full-wave 闭环

当前 thru/T-cell coupon 已得到可信被动结果，说明核心 T-cell topology 不再是完全未验证状态。下一优先级是 full engineering board V2 的 launch、ID 支路、Patch 和真实 PP/workpiece 加载。

### Gap B — loaded Patch 的 R+jX 未标定

没有它就不能确定：

- branch transformer；
- phase；
- reflection sensitivity；
- 工件加载后的真实工作点。

### Gap C — 磁吸接口没有 S 参数

多板串联时接口 loss/phase/reflection 会直接破坏理论递推。

### Gap D — 四板 mutual coupling / workpiece full-wave 未验证

目前 few-mode 模型不能替代最终 vector full-wave。

### Gap E — manifold 还只是架构概念

从 4 块 Zone 扩到 25/100 块的关键实际上是低损耗功率分配器，而当前仓库还没有一个完成的 manifold 设计。

### Gap F — 500 W 高功率问题完全未闭环

低功率线性 S 参数模型不能自动证明：

- 铜温升；
- connector heating；
- dielectric heating；
- arcing；
- power handling。

---

## 8. 当前项目成熟度判断

如果以最终客户系统为 100%：

- **理论架构：约 75–85%**
- **PCB 参数化/可制造 seed：约 60–70%**
- **当前主方案单板 EM 验证：核心 network 已验证；完整单板仍处于早期验证阶段**
- **四板 Zone 验证：约 0–10%**
- **25/100 块系统验证：接近 0%**
- **500 W 实物验证：0%**

这些百分比是工程进度估计，不是性能评分。

因此项目整体不应该描述成“快完成了”，更准确的是：

\[
\boxed{
\text{理论架构已经成形，但验证链只刚进入单板阶段。}
}
\]

---

## 9. 下一步最短闭环路径

现在不应该继续研究 80 块或 100 块参数。

最短路径是：

### Step 1
把 openEMS/HFSS 模型切换到当前 T-cell PCB。

### Step 2
只做一块标准单板/单 cell，标定：

\[
Z_c(W),\quad
\beta,\quad
R_L+jX_L,\quad
\tau,\quad
S_{11},\quad
S_{21},\quad
S_{\rm patch}.
\]

### Step 3
根据 full-wave 标定结果重新求：

\[
\kappa_A,\kappa_B,\kappa_C,
\]

再生成 A/B/C/D。

### Step 4
跑四板完整 Zone + 工件。

只有到这一步通过，才能开始讨论：

\[
5,\quad25,\quad100
\]

块系统。

---

## 10. 当前结论

目前最准确的项目状态是：

\[
\boxed{
\text{已经有闭合的设计理论，但还没有闭合的工程验证。}
}
\]

当前可以说：

- 我们知道原需求哪里不合理；
- 我们已经提出可行的替代架构；
- 我们已经有当前主方案的 PCB 参数 seed；
- 我们知道下一轮仿真需要标定什么。

当前不能说：

- 80 块能做到；
- 100 块能做到；
- 单板已经 5–8 W；
- 四板已经均匀；
- 500 W 已经安全；
- 当前 PCB 已经可以直接加工冻结。

下一阶段的核心目标不是再增加系统级理论，而是：

\[
\boxed{
\text{把当前 T-cell 主方案做成第一块真正 full-wave 闭环的板。}
\]
