# 分层介质加载的 Patch 主模传输线模型 V1

> 目的：在不依赖完整 3D 全波求解的情况下，用 Patch 的主空间谐波 + 分层介质传输线模型，解析描述“2 mm PP + 空气间隙 + 有损工件”如何改变 Patch 的外部负载。该模型服务下一版几何设计与参数缩减，不替代最终 HFSS/openEMS 验证。

## 1. 为什么需要从“自由空间 Patch”升级到“分层负载 Patch”

当前真实结构不是：

\[
\text{Patch}\to\text{air half-space},
\]

而更接近：

\[
\boxed{
\text{Patch}
\to
2\ \mathrm{mm\ PP}
\to
\text{air gap}
\to
\text{lossy workpiece}.
}
\]

对微波加热而言，工件不是“远场接收器”，而是天线电磁边界条件的一部分。

因此真正需要的 loaded-Patch 参数是：

\[
\boxed{
Z_{L,\mathrm{patch}}
=
R_L+jX_L
}
\]

以及由工件引入的：

\[
G_{\mathrm{work}},
\qquad
B_{\mathrm{work}}.
\]

其中：

- \(G_{\mathrm{work}}\) 对应可进入工件的有用功率通道；
- \(B_{\mathrm{work}}\) 主要表现为谐振频移/电抗加载。

这比单独讨论自由空间 S11 更接近实际加热问题。

---

## 2. Patch TM10 主空间谐波

对当前 Patch：

\[
L_{\mathrm{eff}}\approx30.3\ \mathrm{mm}.
\]

TM10 主模的主要横向空间波数取：

\[
\boxed{
k_t
\approx
\frac{\pi}{L_{\mathrm{eff}}}
\approx103.7\ \mathrm{m^{-1}}.
}
\]

2.45 GHz：

\[
k_0
=
\frac{2\pi f}{c}
\approx51.35\ \mathrm{m^{-1}}.
\]

所以：

\[
\frac{k_t}{k_0}
\approx2.019.
\]

定义临界相对介电常数：

\[
\boxed{
\varepsilon_c
=
\left(\frac{k_t}{k_0}\right)^2
\approx4.08.
}
\]

这个数是本模型最重要的尺度之一。

---

## 3. 空气中该空间谐波是 evanescent

任意均匀介质中的法向波数：

\[
\boxed{
k_{z,j}
=
\sqrt{
\varepsilon_{r,j}k_0^2-k_t^2
}.
}
\]

空气：

\[
\varepsilon_r=1<\varepsilon_c.
\]

所以：

\[
k_{z,\mathrm{air}}=j\alpha_{\mathrm{air}},
\]

其中：

\[
\alpha_{\mathrm{air}}
=
\sqrt{k_t^2-k_0^2}
\approx90.1\ \mathrm{m^{-1}}.
\]

场幅：

\[
E\propto e^{-\alpha_{\mathrm{air}}z}.
\]

因此空气中的 amplitude decay length：

\[
\boxed{
1/\alpha_{\mathrm{air}}
\approx11.1\ \mathrm{mm}.
}
\]

这解释了为什么工件间隙从数毫米增加到数十毫米会强烈改变加载。

---

## 4. 2 mm PP 中仍然是 evanescent，但衰减更慢

PP：

\[
\varepsilon_{r,\mathrm{PP}}\approx2.2<4.08.
\]

因此该主空间谐波在 PP 内仍为 evanescent：

\[
k_{z,\mathrm{PP}}
=
j\alpha_{\mathrm{PP}},
\]

\[
\alpha_{\mathrm{PP}}
=
\sqrt{
k_t^2-\varepsilon_{r,\mathrm{PP}}k_0^2
}
\approx70.4\ \mathrm{m^{-1}}.
\]

通过 2 mm PP 后，单一主谐波的场能量因子约：

\[
\exp(
-2\alpha_{\mathrm{PP}}t_{\mathrm{PP}}
)
\approx
\boxed{0.755}.
\]

所以：

\[
\boxed{
\text{2 mm PP 并不会把 Patch 近场“屏蔽掉”。}
}
\]

在该单谐波模型下，约 75% 的相对近场能量尺度仍可传到 PP 前表面。

---

## 5. 高介电工件会把同一个 evanescent 谐波变成传播通道

当：

\[
\varepsilon'_{r,\mathrm{work}}
>
\varepsilon_c
\approx4.08,
\]

则忽略损耗时：

\[
\varepsilon'_{r,\mathrm{work}}k_0^2-k_t^2>0,
\]

从而：

\[
k_{z,\mathrm{work}}
\]

变成实数，主空间谐波在工件内从 evanescent 转变成 propagating wave。

当前需求书用于代表工件的：

\[
\varepsilon_r'=5,\ 10,\ 20
\]

全部满足：

\[
\boxed{
\varepsilon_r'>4.08.
}
\]

对应无损近似法向波数约：

| \(\varepsilon_r'\) | \(k_{z,\mathrm{work}}\) |
|---:|---:|
| 5 | 49.3 m\(^{-1}\) |
| 10 | 125.0 m\(^{-1}\) |
| 20 | 204.9 m\(^{-1}\) |

因此当前 Patch 的近场加热机制可以更清楚地描述为：

\[
\boxed{
\text{air/PP 中的 evanescent field}
\to
\text{高-}\varepsilon\text{ 工件中的传播/耗散通道}.
}
\]

这比单纯说“Patch 向前辐射”更符合近距离介质加热的物理图像。

---

## 6. 有损工件中是 complex propagation

对工件写：

\[
\varepsilon_{r,w}^c
=
\varepsilon'_r
-
j\varepsilon''_r
=
\varepsilon'_r(1-j\tan\delta_w).
\]

则：

\[
\boxed{
k_{z,w}
=
\sqrt{
\varepsilon_{r,w}^c k_0^2-k_t^2
}
}
\]

为复数。

其实部/虚部分别对应：

- 工件内部的相位传播；
- 工件内部的吸收衰减。

因此一旦近场跨过空气/PP 间隙耦合进入工件，就会形成真正的耗散通道，而不仅是改变 Patch 的静态电容。

---

## 7. 每个空间谐波都可以看成一条 TM 传输线

对给定 \(k_t\)，定义 TM wave impedance：

\[
\boxed{
Z_j^{\mathrm{TM}}
=
\frac{k_{z,j}}
{\omega\varepsilon_j}.
}
\]

对 evanescent 层，

\[
k_z=j\alpha,
\]

所以 \(Z^{\mathrm{TM}}\) 主要呈电抗性。

对有损工件，\(Z_w^{\mathrm{TM}}\) 为复数，并具有实部，对应能量可被输送/吸收。

因此分层介质问题可转换为：

\[
\boxed{
\text{PP transmission line}
+
\text{air-gap transmission line}
+
\text{complex workpiece load}.
}
\]

---

## 8. 分层阻抗递推

对任意均匀层 \(j\)，厚度 \(t_j\)，特性阻抗 \(Z_j\)，法向传播常数 \(k_{z,j}\)，若右端负载为 \(Z_L\)，左端看到：

\[
\boxed{
Z_{\mathrm{in},j}
=
Z_j
\frac{
Z_L+jZ_j\tan(k_{z,j}t_j)
}{
Z_j+jZ_L\tan(k_{z,j}t_j)
}.
}
\]

这个公式对 complex \(k_z\) 同样成立。

当：

\[
k_z=j\alpha
\]

时：

\[
\tan(j\alpha t)=j\tanh(\alpha t),
\]

自然退化成 evanescent tunnelling 的双曲函数形式。

因此当前结构可以从工件向 Patch 方向逐层递推：

\[
Z_w^{\mathrm{TM}}
\to
Z_{\mathrm{air,in}}
\to
Z_{\mathrm{PP,in}}.
\]

最终得到 Patch fringing field 所看到的 dominant-mode 外部负载：

\[
\boxed{
Z_{\mathrm{ext}}^{(10)}
(f,g,\varepsilon_w^c,t_w).
}
\]

---

## 9. 外部负载可直接分解为“有用电导 + 调谐电纳”

定义：

\[
Y_{\mathrm{ext}}^{(10)}
=
\frac1{Z_{\mathrm{ext}}^{(10)}}
=
G_{\mathrm{ext}}
+
jB_{\mathrm{ext}}.
\]

再减去无工件时 PP+air 的参考：

\[
\Delta Y_{\mathrm{work}}
=
Y_{\mathrm{ext,work}}
-
Y_{\mathrm{ext,baseline}}.
\]

写成：

\[
\boxed{
\Delta Y_{\mathrm{work}}
=
G_{\mathrm{work}}
+
jB_{\mathrm{work}}.
}
\]

于是：

\[
\boxed{
G_{\mathrm{work}}>0
}
\]

代表工件打开了新的有用耗散/传播通道；

而：

\[
\boxed{
B_{\mathrm{work}}
}
\]

主要负责 Patch 谐振位置和输入电抗的改变。

这正好与前一份文档中的：

\[
Z_L=R+jX
\]

接口对接。

---

## 10. loaded Patch 可以用一个低阶并联谐振模型表示

在主谐振附近，把 Patch 表示为：

\[
Y_{\mathrm{patch}}
=
G_{\mathrm{rad}}
+
G_{\mathrm{FR4}}
+
G_{\mathrm{Cu}}
+
G_{\mathrm{work}}
+
jB_{\mathrm{tot}}(\omega).
\]

其中：

\[
B_{\mathrm{tot}}
=
B_{\mathrm{patch},0}
+
B_{\mathrm{PP}}
+
B_{\mathrm{air}}
+
B_{\mathrm{work}}.
\]

loaded resonance 满足：

\[
\boxed{
B_{\mathrm{tot}}(\omega_r)=0.
}
\]

loaded resonant resistance：

\[
\boxed{
R_L
=
\frac1{
G_{\mathrm{rad}}
+
G_{\mathrm{FR4}}
+
G_{\mathrm{Cu}}
+
G_{\mathrm{work}}
}.
}
\]

因此工件靠近时同时发生两件事：

1. \(B_{\mathrm{work}}\) 改变谐振频率；
2. \(G_{\mathrm{work}}\) 增加有用功率通道并降低 loaded Q。

这两者必须同时设计。

---

## 11. useful heating efficiency 在低阶模型中的表达

accepted power 分到四个主要通道：

\[
G_{\mathrm{rad}},
\quad
G_{\mathrm{FR4}},
\quad
G_{\mathrm{Cu}},
\quad
G_{\mathrm{work}}.
\]

因此主谐振附近的工件功率效率一阶可写为：

\[
\boxed{
\eta_{\mathrm{work}}
\approx
\frac{
G_{\mathrm{work}}
}{
G_{\mathrm{rad}}
+
G_{\mathrm{FR4}}
+
G_{\mathrm{Cu}}
+
G_{\mathrm{work}}
}.
}
\]

这个式子说明：

\[
\boxed{
S_{11}\text{ 很低}
}
\]

并不自动代表：

\[
\boxed{
\eta_{\mathrm{work}}\text{ 很高}.
}
\]

一个 Patch 完全可能匹配得很好，但大部分 accepted power 消耗在 FR4 或自由空间辐射里。

因此未来单板优化的核心量应转向：

\[
\boxed{
G_{\mathrm{work}}/G_{\mathrm{parasitic}}.
}
\]

---

## 12. 空气间隙是一级设计变量

因为主空间谐波在空气中：

\[
E\propto e^{-\alpha_{\mathrm{air}}g},
\]

所以进入工件的该通道功率量级会近似包含：

\[
\boxed{
e^{-2\alpha_{\mathrm{air}}g}.
}
\]

取：

\[
\alpha_{\mathrm{air}}\approx90\ \mathrm{m^{-1}},
\]

则：

| 额外空气 gap | 近场功率尺度 |
|---:|---:|
| 0 mm | 1 |
| 5 mm | 0.407 |
| 10 mm | 0.165 |
| 20 mm | 0.0273 |
| 30 mm | 0.00452 |

所以对于当前结构：

\[
\boxed{
\text{工件间隙可能比 0.1–0.2 mm 的普通 PCB 微调更重要一个数量级。}
}
\]

如果产品实际要求隔着 30 mm 空气加热，则设计物理机制将逐渐从 evanescent coupling 转向 radiative coupling；这与工件贴近 PP 表面的工作状态不是同一个天线优化问题。

---

## 13. 100 MHz 带宽需要区分“有用加载宽带化”和“寄生损耗宽带化”

总 Q：

\[
\frac1{Q_L}
=
\frac1{Q_{\mathrm{rad}}}
+
\frac1{Q_{\mathrm{FR4}}}
+
\frac1{Q_{\mathrm{Cu}}}
+
\frac1{Q_{\mathrm{work}}}.
\]

如果工件靠近使：

\[
G_{\mathrm{work}}
\]

增加，则：

\[
Q_{\mathrm{work}}
\]

下降，这种带宽增宽是有用的。

但如果只是 FR4 的：

\[
\tan\delta\approx0.02
\]

导致：

\[
Q_{\mathrm{FR4}}
\]

下降，同样会让 S11 曲线变宽，却把功率变成板内热。

所以设计判据应是：

\[
\boxed{
\text{bandwidth}
+
\eta_{\mathrm{work}}
+
P_{\mathrm{FR4}}
}
\]

联合验收。

---

## 14. 与四板 mirror taper 的关系

docs/21_loaded_patch_nearfield_analytic_synthesis_v1.md 的自由空间 Green 模型主要服务：

\[
\text{30 mm air-plane field uniformity}.
\]

它得到的：

\[
(1,\ 1.13e^{j21.8^\circ},\ 1.13e^{j21.8^\circ},\ 1)
\]

不应直接当成工件内部最终加热 taper。

当工件：

\[
\varepsilon_r'>4.08
\]

并且足够靠近时，传播常数、波长、衰减和界面透射都会改变。

因此真正的工件侧解析模型应把自由空间核：

\[
\frac{e^{-jk_0R}}R
\]

升级为 layered-medium spectral Green function。

但一个结论仍然保留：

\[
\boxed{
\text{若几何与工件镜像对称，优先搜索 mirror-even taper }(a,b,b,a).
}
\]

这仍然比无条件冻结 travelling-wave \(+90^\circ\) 更合理。

---

## 15. 下一阶段可以继续使用 Sommerfeld / spectral Green 模型，而不是立刻回到全波

对 Patch aperture 的空间谱 \(\tilde E_t(k_x,k_y)\)，分层介质中的场原则上可写成：

\[
\mathbf E(\boldsymbol\rho,z)
=
\iint
\tilde{\mathbf E}_t(k_x,k_y)
\,
T(k_x,k_y)
\,
e^{j(k_xx+k_yy)}
e^{jk_z z}
\,dk_x\,dk_y.
\]

其中：

\[
T(k_x,k_y)
\]

由 PP / air gap / workpiece 的 TE/TM 分层传输矩阵给出。

当前可以先只保留 TM10 主谱峰：

\[
k_x\approx\pi/L_{\mathrm{eff}},
\qquad
k_y\approx0,
\]

把二维谱积分继续降阶成本文的一维 dominant-mode transmission-line model。

所以理论推进顺序建议为：

\[
\boxed{
\text{TM10 dominant spectral line}
\to
\text{layered transmission model}
\to
\text{few-mode spectral model}
\to
\text{full-wave validation}.
}
\]

而不是：

\[
\boxed{
\text{直接盲扫 full-wave geometry}.
}
\]

---

## 16. 对下一版设计的直接影响

当前可以先冻结以下理论方向：

1. Patch 37.5×28.5 mm 仍保留为 TM10 主基线；
2. 2 mm PP 不会消灭主要近场耦合；
3. 工件 \(\varepsilon_r'=5\text{–}20\) 已高于当前主空间谐波的传播阈值 \(\varepsilon_c\approx4.08\)；
4. 工件 gap 必须作为一级设计参数；
5. loaded Patch 目标应直接写成 \(G_{\mathrm{work}},B_{\mathrm{work}},R_L,X_L\)；
6. T-cell 按 loaded \(R_L\) 综合，而不是强迫 Patch 裸端口固定 50 Ω；
7. 30 mm air-plane uniformity 与贴近工件 heating optimization 是两个不同目标；
8. 四板相位最终应由 layered-medium field target 决定，+90° 只保留为 comparison mode。

这套模型提供了下一轮理论设计与最终全波模型之间的明确接口。


---

## 17. dominant-mode 归一化加载的一个数值例子

为了把上面的解析结构变成可直接判断量级的设计工具，取代表工件：

\[
\varepsilon_r'=10,
\qquad
\tan\delta=0.2,
\]

并仍采用：

\[
k_t\approx103.7\ \mathrm{m^{-1}}.
\]

使用第 8 节的 TM 分层阻抗递推，并把 modal impedance 用自由空间阻抗归一化。无工件时，2 mm PP + air half-space 的 dominant-mode 归一化导纳约为：

\[
y_{\mathrm{baseline}}
\approx
0.00015+j0.75695.
\]

加入半无限工件后得到：

| air gap | \(y_{\mathrm{stack}}\) | \(\Delta G_{\mathrm{work}}\) | \(\Delta B_{\mathrm{work}}\) |
|---:|---:|---:|---:|
| 0 mm | \(3.627+j1.387\) | 3.627 | +0.630 |
| 5 mm | \(0.269+j1.337\) | 0.269 | +0.580 |
| 10 mm | \(0.0634+j0.944\) | 0.0633 | +0.187 |
| 20 mm | \(0.00818+j0.784\) | 0.00803 | +0.0274 |

这里的数值是“单一 TM10 空间谐波的归一化 spectral admittance”，不是完整 Patch 端口的绝对西门子值；从 aperture spectrum 映射到真实端口还需要 modal coupling factor。

但趋势非常明确：

\[
\boxed{
g_{\mathrm{air}}
\text{ 从 5 mm 增到 20 mm 时，}
G_{\mathrm{work}}
\text{ 可下降超过一个数量级。}
}
\]

同时：

\[
B_{\mathrm{work}}
\]

也快速下降，所以 gap 会同时改变：

- useful coupling；
- resonance detuning；
- loaded impedance。

因此下一版参数设计中，工件 gap 必须在 Patch 长宽微调之前先冻结一个典型工作区间。

---

## 18. \(\tan\delta\) 更直接控制进入工件后的吸收深度

对：

\[
k_{z,w}
=
\beta_z-j\alpha_w,
\]

若采用 \(e^{j\omega t}\) 相量并沿 +z 传播，则场幅衰减：

\[
|E(z)|\propto e^{-\alpha_w z},
\]

功率尺度衰减：

\[
P(z)\propto e^{-2\alpha_w z}.
\]

定义：

\[
L_{\mathrm{amp}}=\frac1{\alpha_w},
\qquad
L_{\mathrm{power}}=\frac1{2\alpha_w}.
\]

对代表参数可得到：

| \(\varepsilon_r'\) | \(\tan\delta\) | power \(1/e\) depth |
|---:|---:|---:|
| 5 | 0.1 | 38.7 mm |
| 5 | 0.2 | 20.8 mm |
| 5 | 0.4 | 12.2 mm |
| 10 | 0.1 | 47.6 mm |
| 10 | 0.2 | 24.0 mm |
| 10 | 0.4 | 12.4 mm |
| 20 | 0.1 | 38.9 mm |
| 20 | 0.2 | 19.6 mm |
| 20 | 0.4 | 10.0 mm |

所以：

\[
\boxed{
\text{gap 主要控制“有多少近场能量能进入工件”，}
}
\]

而：

\[
\boxed{
\tan\delta
\text{ 很大程度控制“进入以后在多深的范围内变成热”。}
}
\]

这两种效应不能混成同一个“加热效率”参数。

对有限厚度 \(t_w\)，如果忽略背面反射，进入工件后的单程吸收比例一阶为：

\[
\boxed{
A_w
\approx
1-e^{-2\alpha_w t_w}.
}
\]

因此最终有用功率应至少拆成：

\[
\boxed{
P_{\mathrm{heat}}
\approx
P_{\mathrm{launched\ into\ work}}
\times
A_w.
}
\]

这进一步说明真实工件厚度也是与 \(\varepsilon'\)、\(\tan\delta\)、gap 同等级的输入参数。
