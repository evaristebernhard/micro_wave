# Q 矩阵提取、相位自由度与 PCB 设计决策 V1

> 本文继续把复数场综合理论落到可执行的 HFSS/openEMS 与 PCB 决策。
>
> 当前最重要的工程结论：现有 A/B/C 参数只有 coupling gap / coupling length，能够形成耦合幅值梯度，但尚未提供独立 phase-trim 自由度。是否需要增加 phase trim，应由四板工件功率沉积矩阵决定，而不是现在盲目增加走线。

---

## 1. 当前几何自由度还不够完备

当前 `pcb/tscircuit/src/geometry.ts` 对 A/B/C 主要提供：

- `targetCouplingDb`；
- `couplingLengthSeed`；
- `couplingGapSeed`；
- even/odd impedance seed。

这些变量会同时改变：

\[
|p_i|,\quad \arg p_i,\quad |h_i|,\quad \arg h_i.
\]

因此现在并没有一个真正独立的：

\[
\boxed{\text{phase trim degree of freedom}}
\]

这意味着，如果 HFSS 得到的最优目标 \(\mathbf u_*\) 需要与天然约 \(+90^\circ\) progression 明显不同，仅靠调 gap 不一定能实现。

---

## 2. 先量化：把天然约 +95° progression 补成 0° 需要多少电长度

取：

\[
\varepsilon_{\rm eff}\approx3.25,
\qquad
\lambda_g\approx67.88\ {\rm mm}.
\]

当前 50 mm cell：

\[
\theta_{\rm cell}\approx94.81^\circ\pmod{360^\circ}.
\]

若希望通过纯传输线把这个相位补到一个完整 \(360^\circ\) cell，则额外电长度约为：

\[
\Delta l
=
\lambda_g\frac{94.81^\circ}{360^\circ}
\approx17.88\ {\rm mm}.
\]

所以一个非常直接但有代价的方案是：

\[
\boxed{50\ {\rm mm}\rightarrow67.9\ {\rm mm}\text{ electrical path}}
\]

即在 50 mm PCB 内加入约 18 mm 的 meander / slow path，使 through phase 在 2.45 GHz 附近接近：

\[
-360^\circ\equiv0^\circ.
\]

这样若各 coupler 的 branch phase 近似相同，相邻 Patch 可以天然接近同相。

---

## 3. 但 360° cell 不是免费午餐

当前 FR4 through-path 一阶损耗约：

\[
0.42\ {\rm dB}/50\ {\rm mm}.
\]

若额外增加 17.88 mm 同类 FR4 走线，一阶附加损耗约：

\[
0.42\times\frac{17.88}{50}
\approx0.15\ {\rm dB/cell}.
\]

因此 4 板 Zone 会额外引入约数个十分之一 dB 的 through loss。

所以不能现在直接把所有板改成 360° cell。

正确做法是先问：

\[
\boxed{\text{工件是否真的需要接近 0° progression？}}
\]

如果天然 \(+90^\circ\) mode 本来就有更好的工件沉积，则加 meander 反而同时损失效率和空间。

---

## 4. 为什么首先扫描 0/±90/180° 四个 mode 有理论依据

若四块 Patch 间距相同，工件近似均匀，并忽略边缘破坏，则总功率沉积矩阵可以近似看成 Hermitian Toeplitz / circulant 结构：

\[
Q\approx\operatorname{circ}(q_0,q_1,q_2,q_1^*).
\]

此时离散 Fourier 模式天然对角化这个矩阵：

\[
v_m
=
(1,e^{jm\pi/2},e^{jm\pi},e^{j3m\pi/2})^T,
\qquad m=0,1,2,3.
\]

即：

\[
0^\circ,\quad+90^\circ,\quad180^\circ,\quad-90^\circ.
\]

因此 `docs/10_zone_complex_phase_synthesis_v1.md` 中建议的四种 phase mode 并不是随便挑的测试点，而是周期近似下的自然电磁本征基。

当前 50 mm feed 的天然 progression 恰好接近：

\[
\boxed{v_{+90}}.
\]

HFSS 第一件事应该判断这个天然 mode 对当前工件到底是好是坏。

---

## 5. Q 矩阵不需要大量盲扫才能得到

对于四个 Patch，设第 \(i\) 个 Patch 单独以单位 incident-wave 激励时产生复场：

\[
E_i(\mathbf r).
\]

则工件区域 \(\Omega_k\) 的沉积矩阵为：

\[
\boxed{
Q^{(k)}_{ij}
=
\frac12
\int_{\Omega_k}
\sigma_{\rm eff}(\mathbf r)
E_i^*(\mathbf r)\cdot E_j(\mathbf r)
\,dV.
}
\]

因此只要 HFSS/openEMS 能导出四个单位端口基激励的复数场，就可以直接计算整个 \(4\times4\) Hermitian 矩阵。

也就是说，线性 Maxwell 模型下不需要对每一个幅相组合重新跑完整求解。

原则上：

\[
\boxed{4\text{ 个复场基解 }\Rightarrow Q^{(k)}\text{ 对任意 }\mathbf u\text{ 可重建}}
\]

然后：

\[
H_k(\mathbf u)
=
\mathbf u^\dagger Q^{(k)}\mathbf u
\]

可以在 Python 中极快扫描。

---

## 6. 如果只能导出吸收功率，也可以用 polarization identity 重建 Q

单端口：

\[
Q_{ii}=H(e_i).
\]

对每一对 \(i<j\)：

\[
\operatorname{Re}Q_{ij}
=
\frac{
H(e_i+e_j)-H(e_i)-H(e_j)
}{2}.
\]

再运行：

\[
u=e_i+j e_j,
\]

有：

\[
H(e_i+j e_j)
=
Q_{ii}+Q_{jj}-2\operatorname{Im}Q_{ij}.
\]

因此：

\[
\boxed{
\operatorname{Im}Q_{ij}
=
\frac{Q_{ii}+Q_{jj}-H(e_i+j e_j)}{2}.
}
\]

这样即使仿真软件只方便输出区域吸收功率，也能恢复完整 Hermitian Q。

四端口 Q 总共有 16 个实自由度；4 个单端口 + 每对两个组合即可完全重建。

但如果复场可导出，优先使用复场重叠积分，因为只需四个基场。

---

## 7. 第一次真正的设计优化应该在 Q 上做，而不是在 gap 上做

得到各区域：

\[
Q^{(1)},Q^{(2)},Q^{(3)},Q^{(4)},
\]

先在理想四源空间中优化：

\[
\min_{\mathbf u}
\max_k
\frac{|\mathbf u^\dagger Q^{(k)}\mathbf u-\bar H|}{\bar H}.
\]

同时可以加入：

- 总输入功率约束；
- 总工件吸收效率；
- hotspot penalty；
- 最大场强 penalty。

得到：

\[
\boxed{\mathbf u_*}.
\]

此时才有资格决定：

- natural +90° mode 是否保留；
- 是否需要接近 0° progression；
- 是否需要某个 Fresnel-like phase profile；
- 是否值得为了 phase trim 增加走线损耗。

---

## 8. 从 Q 最优解反推 A/B/C/D

目标相邻复激励比：

\[
r_i
=
\frac{u^*_{i+1}}{u^*_i}.
\]

PCB 网络必须满足：

\[
\boxed{
p_{i+1}h_i=r_i p_i.
}
\]

幅度条件：

\[
|p_{i+1}|
=
\frac{|r_i||p_i|}{|h_i|}.
\]

相位条件：

\[
\boxed{
\chi_{i+1}
=
\chi_i+\arg r_i-\theta_i
\pmod{2\pi}.
}
\]

因此下一版 PCB 只有在算出 \(\mathbf u_*\) 后，才应该决定是否新增：

- branch meander；
- phase-delay section；
- hybrid orientation 变化；
- through-line meander；
- 额外 impedance phase equalizer。

---

## 9. 对当前 tscircuit 代码的结论

当前代码适合作为：

\[
\boxed{\text{coupling-magnitude seed geometry}}
\]

但暂时还不是：

\[
\boxed{\text{complex-taper synthesis geometry}}.
\]

当前不建议立即凭理论猜一个 phase trim 尺寸写进 Gerber。

建议下一步先在参数层预留：

- `targetPatchPhaseDeg`；
- `targetThroughPhaseDeg`；
- `branchPhaseTrimLength`；

初始均设为未冻结 / 0。

等 Q-matrix 结果出来以后再把它们变成真实铜走线。

---

## 10. 当前设计决策

因此现阶段：

1. **保留** A/B/C = 6.5/5/3 dB 幅度 seed；
2. **不冻结** -270° through phase；
3. **不立即增加** 18 mm meander；
4. HFSS 优先输出四个单位 Patch 基场；
5. 建立 Q 矩阵；
6. 先比较 0/±90/180° 四个 canonical modes；
7. 求出 \(\mathbf u_*\)；
8. 最后再增加 PCB phase-trim 自由度。

这条顺序可以避免为了一个未经工件验证的相位目标，提前牺牲 FR4 损耗、板内空间和可制造性。