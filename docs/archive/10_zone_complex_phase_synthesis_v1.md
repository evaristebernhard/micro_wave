# 四板 Zone 的复相位综合与设计判据 V1

> 本文在当前 Patch + A/B/C/D Zone 方案上继续推进理论分析，目标不是增加抽象层，而是把“复数激励”直接转化成可执行的 PCB/HFSS 设计规则。
>
> 核心结论：
>
> \[
> \boxed{
> \text{A/B/C/D 的设计变量不能只写成 coupling magnitude，必须同时设计 coupling phase 与 through phase。}
> }
> \]
>
> 特别地，当前 50 mm cell 在 2.45 GHz 下天然约为 \(265^\circ\) 电长度，因此把板级 through phase 固定为 \(-270^\circ\) 并不能自动得到四个 Patch 的同相辐射。相反，在相同局部耦合相位下，相邻 Patch 会出现约 \(+90^\circ\) 的渐进相位。

---

## 1. 从功率递推到复数递推

定义第 \(i\) 个 cell 输入处的前向复波为：

\[
F_i.
\]

定义该 cell 到 Patch 支路的复数抽取系数：

\[
p_i
=
|p_i|e^{j\chi_i},
\]

以及继续向下一块传播的复数 through 系数：

\[
h_i
=
|h_i|e^{j\theta_i}.
\]

则：

\[
\boxed{
u_i=p_iF_i
}
\]

是第 \(i\) 个 Patch 的实际复激励，并且：

\[
\boxed{
F_{i+1}=h_iF_i.
}
\]

因此相邻两个 Patch 的激励比为：

\[
\boxed{
\frac{u_{i+1}}{u_i}
=
\frac{p_{i+1}h_i}{p_i}.
}
\]

这个式子是当前 A/B/C/D 复数设计的核心递推。

---

## 2. 旧 equal-power 递推只是这个复数公式的模长部分

若：

\[
|p_i|^2=\kappa_i,
\]

并把 cell 中未抽取功率的寄生传输系数记为：

\[
\tau_i,
\]

则：

\[
|h_i|^2
\approx
\tau_i(1-\kappa_i).
\]

若目标是相邻 Patch 等幅：

\[
|u_{i+1}|=|u_i|,
\]

则由复数递推得到：

\[
|p_{i+1}||h_i|
=
|p_i|.
\]

即：

\[
\boxed{
\kappa_{i+1}
=
\frac{\kappa_i}
{\tau_i(1-\kappa_i)}.
}
\]

所以之前的梯度耦合数学没有失效，而是被确认成了完整复数设计方程的幅值投影。

这也解释了为什么当前：

\[
A\approx6.5\ {\rm dB},
\quad
B\approx5\ {\rm dB},
\quad
C\approx3\ {\rm dB}
\]

仍然是合理第一轮 seed。

---

## 3. 新增的相位递推

把目标相邻 Patch 相位差定义为：

\[
\psi_i
=
\arg u_{i+1}-\arg u_i.
\]

则：

\[
\boxed{
\psi_i
=
\theta_i+\chi_{i+1}-\chi_i
\pmod{2\pi}.
}
\]

这给出非常直接的设计结论：

### 如果希望相邻 Patch 同相

\[
\psi_i=0,
\]

则必须：

\[
\boxed{
\chi_{i+1}-\chi_i
=
-\theta_i
\pmod{2\pi}.
}
\]

也就是说，如果 through path 自身具有明显电长度，而 A/B/C 的 coupled-port phase 全都相同，则四个 Patch 不会同相。

---

## 4. 当前 50 mm cell 的天然相位

取当前一阶：

\[
\varepsilon_{\rm eff}\approx3.25.
\]

2.45 GHz：

\[
\lambda_0
\approx122.36\ {\rm mm},
\]

\[
\lambda_g
=
\frac{\lambda_0}{\sqrt{\varepsilon_{\rm eff}}}
\approx67.88\ {\rm mm}.
\]

50 mm 对应电长度：

\[
360^\circ
\frac{50}{67.88}
\approx265.19^\circ.
\]

所以理想无反射传播的 \(S_{21}\) 相位约为：

\[
-265.19^\circ
\equiv
+94.81^\circ
\pmod{360^\circ}.
\]

因此：

\[
\boxed{
\theta_{\rm cell}\approx+95^\circ
}
\]

若 A/B/C 的 branch phase 近似相同，则相邻 Patch 自然得到：

\[
\boxed{
\psi\approx+95^\circ.
}
\]

这不是小修正，而是四板场合成的一阶效应。

---

## 5. 因此不能因为“4×270° 是整数周”就冻结 270°

之前曾提出：

\[
\angle S_{21}\approx-270^\circ
\]

作为模块化 cell seed。

这个值仍然可以作为待测试候选，但不能再以：

\[
4\times270^\circ
=
1080^\circ
\]

是 \(360^\circ\) 整数倍作为最终理由。

原因是工件看到的是四个 Patch 的相对相位：

\[
u_A,u_B,u_C,u_D,
\]

而不是从 Zone 输入端绕完整个级联后的总相位。

如果：

\[
\chi_A\approx\chi_B\approx\chi_C,
\]

则：

\[
-270^\circ
\]

的 through phase 实际对应相邻 Patch 约：

\[
+90^\circ
\]

的相位推进。

所以以后 cell phase 的目标必须由：

\[
\boxed{
\mathbf u_*
}
\]

决定，而不能先验冻结。

---

## 6. 一个简单的阵列 surrogate 已经说明 90° progression 不能忽略

四块板若沿一条直线拼接，每块中心间距：

\[
d=50\ {\rm mm}.
\]

自由空间：

\[
k_0d
=
2\pi
\frac{50}{122.36}
\approx2.567\ {\rm rad}
\approx147.1^\circ.
\]

若把 Patch 暂时近似为四元线阵，并采用：

\[
\psi\approx+94.8^\circ,
\]

远场阵因子主方向满足近似：

\[
k_0d\sin\theta+\psi=0.
\]

从而：

\[
\sin\theta
\approx
-\frac{94.8^\circ}{147.1^\circ}
\approx-0.645,
\]

即：

\[
\boxed{
\theta\approx-40^\circ.
}
\]

本项目主要是近场加热，因此这个角度不能作为真实加热结果。

但它足以说明：

\[
\boxed{
+90^\circ\text{ 级别的 progression 完全可能把能量中心明显推离板法向。}
}
\]

所以不能忽略 phase taper。

---

## 7. 30 mm 工件距离下，真正最优相位甚至不一定是同相

若四块 50 mm 板沿一行排列，并把几何中心设为：

\[
x=
(-75,-25,25,75)\ {\rm mm},
\]

工件目标点位于阵列中心正前方：

\[
z=30\ {\rm mm},
\]

则内侧 Patch 到目标点距离：

\[
R_{\rm in}
\approx39.05\ {\rm mm},
\]

外侧 Patch：

\[
R_{\rm out}
\approx80.78\ {\rm mm}.
\]

路径差：

\[
\Delta R
\approx41.73\ {\rm mm}.
\]

对应自由空间相位约：

\[
360^\circ
\frac{41.73}{122.36}
\approx122.8^\circ.
\]

因此如果目标只是“在中心一点相干聚焦”，一个简单 Fresnel seed 会要求外侧 Patch 相对内侧 Patch 约补偿：

\[
\boxed{
-123^\circ
}
\]

左右。

这进一步说明：

\[
\boxed{
\text{最终目标既不应预设为 }0^\circ\text{ progression，也不应预设为 }90^\circ.
}
\]

真正目标应由工件体积沉积矩阵 \(Q^{(k)}\) 优化得到。

---

## 8. 但可以先扫描四个 canonical phase modes

由于四个 cell 尺寸接近、间距相同，第一轮完整 3D 仿真不必立即做连续高维相位搜索。

先测试：

\[
\mathbf v_0=
(1,1,1,1)^T,
\]

\[
\mathbf v_{+90}
=
(1,j,-1,-j)^T,
\]

\[
\mathbf v_{180}
=
(1,-1,1,-1)^T,
\]

\[
\mathbf v_{-90}
=
(1,-j,-1,j)^T.
\]

即四种 progression：

\[
0^\circ,
\quad
+90^\circ,
\quad
180^\circ,
\quad
-90^\circ.
\]

如果系统在空间上近似周期/平移对称，那么这些 DFT-like modes 是最自然的第一组电磁基模。

当前 50 mm through-line 天然相位最接近：

\[
\mathbf v_{+90}.
\]

所以第一轮 HFSS 应直接比较：

\[
\boxed{
0^\circ / +90^\circ / 180^\circ / -90^\circ
}
\]

四种激励对应的：

- workpiece absorbed power；
- 区域均匀性；
- hotspot；
- \(E_{\max}\)；
- 总接受功率。

这样可以很快判断“天然 +90° mode”究竟是优势还是问题。

---

## 9. 对 PCB 的直接设计规则

设优化得到目标：

\[
\frac{u_{i+1}}{u_i}
=
r_i
=
|r_i|e^{j\psi_i}.
\]

则必须满足：

\[
\boxed{
p_{i+1}h_i=r_ip_i.
}
\]

这是从目标场反推 PCB 网络的直接综合方程。

拆成幅度：

\[
\boxed{
|p_{i+1}|
=
\frac{|r_i|\,|p_i|}
{|h_i|}
}
\]

和相位：

\[
\boxed{
\chi_{i+1}
=
\chi_i+\psi_i-\theta_i
\pmod{2\pi}.
}
\]

因此 A/B/C 的结构以后至少需要提供两类自由度：

1. coupling magnitude；
2. coupled branch electrical phase。

若单一 edge-coupled geometry 只能调 magnitude，不能独立调 phase，则需要：

- branch delay；
- meander phase section；
- hybrid orientation；
- stepped phase line；
- 或其它 matched phase-conditioning structure。

---

## 10. 对 A/B/C/D 的新参数表应增加 phase columns

后续参数表不能只写：

| cell | coupling |
|---|---:|
| A | 6.5 dB |
| B | 5 dB |
| C | 3 dB |

而至少应写：

| cell | \(|p_i|^2\) | \(\angle p_i\) | \(|h_i|^2\) | \(\angle h_i\) |
|---|---:|---:|---:|---:|
| A | target | target | target | target |
| B | target | target | target | target |
| C | target | target | target | target |
| D | terminal | field phase | — | — |

最终这些目标来自：

\[
\mathbf u_*.
\]

---

## 11. 对当前 270° through-phase seed 的处理

当前不建议马上删除：

\[
-270^\circ
\]

seed，因为它接近真实 50 mm FR4 cell 的天然电长度，容易实现。

但从现在起它的状态应改成：

\[
\boxed{
\text{candidate phase state, not frozen design target}.
}
\]

HFSS 第一轮应至少比较：

1. natural \(-265^\circ\sim-270^\circ\) cell；
2. 经过 phase compensation 后使 Patch 近同相；
3. 针对 \(Q\)-matrix 优化得到的目标 progression。

如果第二/第三类明显改善工件吸收均匀性，则 PCB 必须为 branch phase 提供额外自由度。

---

## 12. 下一轮最小仿真集

### Step 1 — 单板复数标定

A/B/C 分别输出：

\[
p_i(f),
\qquad
h_i(f).
\]

不能只输出 coupling dB。

### Step 2 — 四理想源 Patch model

暂时移除串联 coupler 约束，用四个独立端口激励四个 Patch。

至少运行：

\[
\mathbf v_0,
\mathbf v_{+90},
\mathbf v_{180},
\mathbf v_{-90}.
\]

### Step 3 — 建立 \(Q^{(k)}\)

由基激励场恢复：

\[
H_k
=
\mathbf u^\dagger
Q^{(k)}
\mathbf u.
\]

### Step 4 — 求目标 \(\mathbf u_*\)

先解决：

\[
\min_{\mathbf u}
\max_k
\frac{|H_k-\bar H|}{\bar H}.
\]

### Step 5 — 无源反综合

用：

\[
p_{i+1}h_i=r_ip_i
\]

把 \(\mathbf u_*\) 映射回 A/B/C/D。

---

## 13. 当前最重要的新设计结论

现在可以明确：

\[
\boxed{
\text{梯度 coupling magnitude 决定“每块拿多少功率”，}
}
\]

而：

\[
\boxed{
\text{cell/coupler phase 决定“这些功率如何在工件中相干叠加”。}
}
\]

这两个问题同等重要。

所以当前方案真正应当优化的是：

\[
\boxed{
\text{complex taper}
=
\text{amplitude taper}
+
\text{phase taper}.
}
\]

A/B/C/D 的设计从现在起应以这条复数综合方程为核心：

\[
\boxed{
p_{i+1}h_i
=
\frac{u_{i+1}^*}{u_i^*}\,p_i.
}
\]

这把“目标工件场”与“实际 PCB coupler 参数”直接连接起来。
