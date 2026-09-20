# 预仿真 phase-trim 近似设计 V1

> 目的：在没有 HFSS/openEMS 全波结果之前，先用传输线、理想方向耦合器和几何路径长度建立一个可制造的 phase-trim 近似解。后续仿真只负责校正，而不是从零开始找结构。

---

## 1. 当前 50 mm cell 天然接近 +90° progressive mode

取当前中心频率：

\[f_0=2.45\ {\rm GHz}\]

自由空间波长：

\[\lambda_0\approx122.36\ {\rm mm}.\]

按当前 through-line 一阶：

\[\varepsilon_{\rm eff}\approx3.25\]

得到：

\[\lambda_g=\frac{\lambda_0}{\sqrt{\varepsilon_{\rm eff}}}\approx67.88\ {\rm mm}.\]

50 mm cell 的无损传播电长度：

\[
\beta l
=
360^\circ\frac{50}{67.88}
\approx265.19^\circ.
\]

因此 forward-wave 的等效 progression 为：

\[
\boxed{
\theta_h
=
-265.19^\circ\equiv+94.81^\circ\pmod{360^\circ}.
}
\]

这说明当前几何不是“离 +90° 很远”，而是天然只差约：

\[\boxed{4.81^\circ}.\]

---

## 2. +90° 恰好对应的有效介电常数

如果希望 50 mm 正好对应：

\[\beta l=270^\circ,\]

则：

\[
\varepsilon_{\rm eff}
=
\left(
\frac{270^\circ\lambda_0}{360^\circ\times50\ {\rm mm}}
\right)^2
\approx3.369.
\]

所以：

\[
\boxed{
\varepsilon_{\rm eff}\approx3.37
\Rightarrow
\text{50 mm cell 天然就是约 }+90^\circ\text{ progression}.
}
\]

考虑 PP superstrate、Patch loading 和邻近金属对有效介电常数的修正，这个数值完全处在合理数量级内。

因此预仿真阶段最自然的 phase baseline 不是 0°，而是：

\[\boxed{+90^\circ\text{ progressive phase}.}\]

---

## 3. 对 ε_eff 不确定性的鲁棒性

| ε_eff | λ_g (mm) | 50 mm 电长度 | forward progression |
|---:|---:|---:|---:|
| 3.10 | 69.50 | 259.00° | +101.00° |
| 3.20 | 68.40 | 263.14° | +96.86° |
| 3.25 | 67.88 | 265.19° | +94.81° |
| 3.30 | 67.36 | 267.22° | +92.78° |
| 3.40 | 66.36 | 271.24° | +88.76° |
| 3.50 | 65.41 | 275.20° | +84.80° |

即使 ε_eff 在 3.1–3.5 之间变化，天然 progression 仍大致落在：

\[\boxed{85^\circ\sim101^\circ}.\]

所以 +90° 是一个相当鲁棒的 pre-HFSS 模式。

---

## 4. 当前 A/B/C feed 几何本身已经提供少量 phase correction

当前代码中：

- A coupling gap = 0.70 mm；
- B coupling gap = 0.45 mm；
- C coupling gap = 0.30 mm。

由 `single-board.tsx` 的几何关系得到，从 coupled-line 上边缘到 Patch inset 的垂直 feed 长度近似：

\[
L_{f,A}\approx14.20\ {\rm mm},
\]

\[
L_{f,B}\approx14.45\ {\rm mm},
\]

\[
L_{f,C}\approx14.60\ {\rm mm}.
\]

按 \(\lambda_g=67.88\) mm，传播相位灵敏度约：

\[
\boxed{
\frac{360^\circ}{\lambda_g}
\approx5.30^\circ/{\rm mm}.
}
\]

因此由于 B 比 A 多 0.25 mm feed：

\[\Delta\phi_{BA}\approx1.33^\circ,\]

C 比 B 多 0.15 mm：

\[\Delta\phi_{CB}\approx0.80^\circ.\]

若 A/B/C 的理想 coupler intrinsic phase 近似相同，则当前几何下实际 progression 一阶约为：

\[
\psi_{AB}
\approx94.81^\circ-1.33^\circ
\approx93.48^\circ,
\]

\[
\psi_{BC}
\approx94.81^\circ-0.80^\circ
\approx94.01^\circ.
\]

所以当前设计已经比纯 50 mm 线的 94.81° 稍微接近 +90°。

---

## 5. 若预先以 +90° 为 seed，A/B/C 只需毫米级 phase trim

为了把：

\[\psi_{AB}\approx93.48^\circ\]

校正到 90°，B 相对 A 需要额外 lag：

\[3.48^\circ.\]

对应附加电长度：

\[
\boxed{
\Delta L_B
\approx
\frac{3.48^\circ}{5.30^\circ/{\rm mm}}
\approx0.66\ {\rm mm}.
}
\]

同理 B→C 还需要约：

\[
\boxed{
\Delta L_{C-B}\approx0.76\ {\rm mm}.
}
\]

所以以 A 为零参考，第一轮 branch-phase trim seed 可以写成：

\[
\boxed{
L_{\rm trim,A}=0,
\qquad
L_{\rm trim,B}\approx0.66\ {\rm mm},
\qquad
L_{\rm trim,C}\approx1.41\ {\rm mm}.
}
\]

这些长度非常小，可以通过：

- feed position 微调；
- coupled-line 出口位置；
- 1–2 mm 级短延迟段；
- 局部弯折；

实现，不需要大 meander。

---

## 6. 为什么 0° 同相方案代价明显更高

若希望相邻 Patch 同相，则每一级必须消除约 +94.81° 的天然 progression。

如果通过增加 through-line 电长度实现，需要每 cell 增加：

\[
\Delta l
=
\lambda_g\frac{94.81^\circ}{360^\circ}
\approx17.88\ {\rm mm}.
\]

当前损耗估计约：

\[0.42\ {\rm dB}/50\ {\rm mm},\]

因此额外 17.88 mm 带来约：

\[
\boxed{
\Delta IL
\approx0.15\ {\rm dB/cell}.
}
\]

若因此总 cell loss 从 0.42 dB 上升到约 0.57 dB，四板 equal-extraction 的一阶 coupling 会从：

\[
21.5\%,\ 30.2\%,\ 47.6\%
\]

变为约：

\[
\boxed{
20.3\%,\ 29.1\%,\ 46.7\%.
}
\]

对应 coupling level 约：

\[
6.92\ {\rm dB},\ 5.37\ {\rm dB},\ 3.30\ {\rm dB}.
\]

所以同相方案不仅占空间，还会反过来改变 A/B/C 的幅度梯度。

---

## 7. 四个 canonical phase modes 的预估实现难度

暂时忽略 D terminal 的专用相位匹配，只看周期 A/B/C cell 的相位综合。

| 目标 progression | 相对天然 +94.8° 的难度 | 典型额外 phase-path 量级 | 预仿真建议 |
|---|---:|---:|---|
| +90° | 极低 | 约 0–3 mm | **优先基线** |
| 0° | 高 | 约 18 mm/cell through compensation，或更长 branch trim | 对照 |
| -90° | 较高 | 数十 mm 级 branch phase | 对照 |
| 180° | 高 | 数十 mm 级 / 拓扑相位翻转 | 对照 |

因此从“可实现性 + 损耗 + 当前几何自然状态”三方面，+90° 都应当先作为第一版设计 seed。

---

## 8. 中心 30 mm 处 Fresnel 聚焦的近似 phase profile

如果四板沿 x 方向排列，中心位置取：

\[
x=(-75,-25,25,75)\ {\rm mm},
\]

目标点位于阵列中心前方：

\[z=30\ {\rm mm},\]

则内侧 Patch 距离约：

\[R_{\rm in}\approx39.05\ {\rm mm},\]

外侧 Patch：

\[R_{\rm out}\approx80.78\ {\rm mm}.\]

路径差：

\[\Delta R\approx41.73\ {\rm mm}.\]

对应自由空间相位：

\[
\boxed{
\Delta\phi
\approx122.76^\circ.
}
\]

所以一个非常粗的中心点聚焦 seed 为：

\[
\boxed{
\phi_*
\sim
(122.8^\circ,0^\circ,0^\circ,122.8^\circ).
}
\]

这不是最终均匀加热解，但它给出一个重要结论：真正的近场目标相位很可能不是线性 progression。

---

## 9. 这个 Fresnel seed 也可以得到有限的 branch-trim 近似解

对上面的目标相位，用当前自然 cell progression 94.81°，所需各板局部 branch phase（差一个全局常相位）可取为：

\[
(122.76^\circ,265.19^\circ,170.38^\circ,198.33^\circ).
\]

选择一个公共 phase reference，使所有额外延迟尽量短，可以得到一组等价的非负附加线长：

\[
\boxed{
(26.85,\ 0,\ 17.88,\ 12.61)\ {\rm mm}
}
\]

最大只需约 26.9 mm，而不是简单逐级累加到 50 mm 以上。

按当前 FR4 损耗估计，其附加 branch loss 约为：

\[
(0.23,\ 0,\ 0.15,\ 0.11)\ {\rm dB}.
\]

这说明即使不做全波仿真，也已经可以判断：

\[
\boxed{
\text{非线性 phase profile 在 50 mm PCB 上并非原则上不可实现。}
}
\]

但是否值得这样做，要由 Q-matrix 的均匀加热收益决定。

---

## 10. phase trim 的解析设计公式

设第 i 块主线输入相位为：

\[
\Phi_i
=
\Phi_1+\sum_{m<i}\theta_m,
\]

耦合器本征 coupled-port phase 为：

\[\alpha_i,\]

Patch feed 基础长度为 \(L_{f,i}\)，新增 trim 为 \(L_{t,i}\)。

则 Patch 相位一阶近似：

\[
\boxed{
\phi_i
\approx
\Phi_i+\alpha_i
-\beta(L_{f,i}+L_{t,i})
+\phi_{p,i}.
}
\]

其中 \(\phi_{p,i}\) 是相同 Patch 模式的局部相位项；若四块 Patch 几何相同，可在第一阶近似中抵消。

所以给定目标 \(\phi_i^*\)：

\[
\boxed{
L_{t,i}
\equiv
\frac{
\Phi_i+\alpha_i-\beta L_{f,i}-\phi_i^*+C
}{\beta}
\pmod{\lambda_g}.
}
\]

公共常相位 C 可以自由选择，用来最小化：

\[\max_i L_{t,i}.\]

这就是在没有全波仿真的情况下做 phase-trim 初始设计的解析公式。

---

## 11. coupler 自身就是一个 coarse phase element

理想 lossless directional coupler / quadrature hybrid 在中心频率处，本身具有约：

\[\boxed{\pm90^\circ}\]

的 through/coupled quadrature relation。

因此 phase synthesis 不应该只靠传输线长度。

更合理的预设计分层是：

1. 用 coupler topology / port orientation 提供离散的 coarse phase；
2. 用 0.5–3 mm 短线做 fine phase trim；
3. 只有目标相位与天然模式差异很大时，才使用 10–30 mm 级 meander。

特别是 C 若采用 branch-line hybrid，本身就具有强 coupling + quadrature phase 的组合自由度，可以同时服务幅度和相位综合。

---

## 12. 预仿真设计结论

在没有 HFSS 之前，目前已经可以合理冻结一版近似设计思想：

\[
\boxed{
\text{A/B/C 幅度 seed：6.5 / 5 / 3 dB}
}
\]

\[
\boxed{
\text{phase seed：优先 }+90^\circ\text{ progressive mode}
}
\]

并给 A/B/C 第一轮 branch trim：

\[
\boxed{
0 / 0.66 / 1.41\ {\rm mm}
}
\]

作为解析起点。

D 由于是 terminal direct-feed，必须单独做 phase matching，不应强行套 A/B/C 的同一公式。

后续 HFSS 的角色是把：

\[
\varepsilon_{\rm eff},\ \alpha_i,\ \theta_i,\ Q^{(k)}
\]

从近似值替换成真实值，再对上述解析 seed 做一次校正。
---

## 13. coarse + fine phase 综合

传统微波网络设计不要求所有相位都靠长传输线实现。

当前导波波长约：

\[\lambda_g\approx67.88\ {\rm mm},\]

所以：

\[\boxed{1\ {\rm mm}\approx5.30^\circ}\]

\[\boxed{0.5\ {\rm mm}\approx2.65^\circ}.\]

理想 directional coupler / branch-line hybrid 在中心频率附近天然提供 quadrature phase。若通过 topology / port orientation 能提供接近：

\[0^\circ,\ \pm90^\circ,\ 180^\circ\]

的 coarse phase 选择，则任意目标相位都可以先选最近象限，再用短线补残差。

若可以覆盖四个象限，最坏 fine-phase residual 不超过：

\[45^\circ,\]

对应最大 fine trim：

\[
\boxed{
L_{\rm fine,max}
\approx
\lambda_g\frac{45^\circ}{360^\circ}
\approx8.48\ {\rm mm}.
}
\]

即便只做到 90° 级 coarse resolution，fine trim 也只需约：

\[\lambda_g/4\approx16.97\ {\rm mm}.\]

因此后续 PCB 更合理的 phase-control architecture 是：

1. coupler / hybrid topology 决定 coarse quadrant；
2. 0–8.5 mm 左右的 branch trim 区域做 fine phase；
3. 0.5 mm 级参数步进即可提供约 2.65° 的一阶相位分辨率；
4. 不默认使用几十毫米长 meander。

这也给 D terminal 一个明确的预设计原则：D 不必复制 A/B/C 的 coupler，但应该保留一个 terminal phase-tuning section。若前级拓扑能先把 D 所需相位放到正确象限，D 的 fine tuning 区域约 0–8.5 mm 就有机会覆盖所需残差。

这仍然是预仿真近似值；最终相位长度按 loaded \(\beta\) 校正。