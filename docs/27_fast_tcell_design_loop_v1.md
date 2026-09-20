# T-cell 快速迭代设计闭环 V1

> 日期：2026-09-20
>
> 目标：把一次约 15 min 的 openEMS verify 仿真从“每改一个参数就重跑”改成“已有 full-wave 结果校准 surrogate，绝大多数设计计算在毫秒级完成，只对最终候选做 1 次 screen + 1 次 verify”。

## 1. 最新 full-wave 已经给出的信息

当前可信的 thru verify：

\[
S_{11}=-24.27\ \mathrm{dB},\qquad
S_{21}=-0.376\ \mathrm{dB}.
\]

当前 nominal 3.137 mm “50 Ω”线的 native MSL impedance 为：

\[
Z_{0,\rm thru}\approx45.53\ \Omega.
\]

T-cell verify 中 branch output fixture 使用 2.90 mm 线，其 native impedance 为：

\[
Z_{0,2.9}\approx47.63\ \Omega.
\]

裸 FR4 Hammerstad 模型分别给：

\[
Z_{\rm bare}(3.137)\approx50.00\ \Omega,
\]

\[
Z_{\rm bare}(2.90)\approx52.39\ \Omega.
\]

因此两个独立 full-wave 点对应的阻抗缩放：

\[
\alpha_1\approx0.91066,\qquad
\alpha_2\approx0.90908.
\]

二者相对差异只有约：

\[
0.17\%.
\]

所以在当前 2.9–3.14 mm 附近可以先使用：

\[
\boxed{
Z_{\rm PP-loaded}(W)
\approx
0.90987\, Z_{\rm Hammerstad,bare}(W)
}
\]

作为局部 surrogate。

它不是最终闭式电磁定律，但足够代替 5–10 次盲目 width sweep。

---

## 2. 由现有数据直接反推出新的线宽

由上述校准模型：

### 真正 50 Ω through seed

\[
\boxed{
W_{50}\approx2.670\ {\rm mm}
}
\]

而不是现在的 3.137 mm。

### 若坚持理想 24.76% junction split

对应理论：

\[
Z_t=43.37\Omega,\qquad Z_b=87.16\Omega,
\]

则 PP-loaded 几何约为：

\[
W_t\approx3.392\ {\rm mm},
\]

\[
W_b\approx0.813\ {\rm mm}.
\]

但目前 EM 已经显示，branch 输出路径相对 through 有明显额外 penalty，因此不能只照搬理想 lossless split。

---

## 3. 当前 T-cell 的 circuit surrogate 已经能解释输入匹配

把当前尺寸：

\[
W_t=3.92\ {\rm mm},
\quad
W_b=1.04\ {\rm mm},
\quad
W_{50}=3.137\ {\rm mm}
\]

代入 PP-loaded surrogate 后，得到近似：

\[
Z_t\approx39.6\Omega,
\quad
Z_b\approx79.1\Omega,
\quad
Z_{50}\approx45.5\Omega.
\]

由于 superstrate 同时提高了 effective permittivity，当前 transformer 实际电长度约为：

\[
\theta_t\approx98.8^\circ,
\qquad
\theta_b\approx99.0^\circ.
\]

即现在的：

\[
16.75\ {\rm mm},
\qquad
17.59\ {\rm mm}
\]

在 PP-loaded 环境中都偏长约 9–10%。

这个简单 circuit surrogate 给出的输入：

\[
Z_{\rm in}\approx44.5-j2.0\Omega
\]

和：

\[
S_{11}\approx-24.1\ {\rm dB}.
\]

而 full-wave verify 是：

\[
Z_{\rm in}\approx46.4-j2.54\Omega,
\]

\[
S_{11}\approx-26.8\ {\rm dB}.
\]

说明这个低成本 surrogate 已经足以用于“下一版应该往哪里改”的参数设计。

---

## 4. 为什么不直接把 branch 改成 0.813 mm

当前 full-wave：

\[
|S_{31}|^2\approx16.60\%,
\]

\[
|S_{21}|^2\approx59.09\%.
\]

如果只看两个输出之间的 split：

\[
k_{\rm out}
=
\frac{P_3}{P_2+P_3}
\approx21.93\%.
\]

当前 circuit surrogate 在 junction 处预测约：

\[
k_{\rm junction}\approx28.31\%.
\]

因此 branch path 相对 through 的经验效率比约为：

\[
r
=
\frac{\eta_b}{\eta_t}
\approx0.711.
\]

换成相对 penalty：

\[
10\log_{10}r
\approx-1.48\ {\rm dB}.
\]

这个 penalty 中混合了：

- narrow branch field concentration；
- dielectric loss；
- T-junction discontinuity；
- branch fixture；
- mesh/port residual。

因此它不能被当成永久常数，但也不能忽略。

如果完全按照 lossless 理论重新设计到 junction split=24.76%，只要该 penalty 仍存在，最终输出 split 反而会继续偏低。

---

## 5. V2 不使用全补偿，而使用 robust hedge

我们把 branch relative efficiency 的下一版不确定区间先取：

\[
r\in[0.711,\ 0.90].
\]

然后选择一个 junction target，使最终输出 split 在整个区间内对：

\[
24.76\%
\]

的最大误差最小。

minimax 结果约为：

\[
\boxed{
k_{\rm junction,V2}\approx29.09\%
}
\]

其对应：

\[
Z_{t,V2}\approx42.10\Omega,
\]

\[
Z_{b,V2}\approx78.07\Omega.
\]

再通过 PP-loaded impedance surrogate 反推：

\[
\boxed{
W_{50,V2}\approx2.670\ {\rm mm}
}
\]

\[
\boxed{
W_{t,V2}\approx3.557\ {\rm mm}
}
\]

\[
\boxed{
W_{b,V2}\approx1.074\ {\rm mm}
}
\]

这比直接把 branch 缩到 0.813 mm 更保守，也更接近当前已经验证过的 1.04 mm 几何。

---

## 6. V2 的电长度

用同一个 full-wave calibrated effective-permittivity correction，得到：

\[
\boxed{
L_{t,V2}\approx15.317\ {\rm mm}
}
\]

\[
\boxed{
L_{b,V2}\approx15.972\ {\rm mm}
}
\]

相对于当前：

\[
16.75\ {\rm mm},\qquad17.59\ {\rm mm},
\]

分别缩短约：

\[
8.6\%,\qquad9.2\%.
\]

新的 lower T-junction 几何位置为：

\[
\boxed{
J_{V2}\approx(-6.1105,\,-24.0069)\ {\rm mm}
}
\]

在 50 × 60 mm 板框内仍有足够机械余量。

---

## 7. 为什么这套设计能减少仿真次数

新增脚本：

scripts/openems/design_tcell_surrogate.py

它直接读取已有：

- thru verify；
- T-cell verify；
- canonical geometry；

自动输出：

design/tcell_candidate_v2.json

所以新的工作流不是：

\[
W=2.4,2.6,2.8,3.0,3.2
\]

分别跑 5 次 openEMS。

而是：

\[
\boxed{
2\text{ 个已有 full-wave calibration 点}
\rightarrow
\text{closed-form surrogate}
\rightarrow
\text{1 个 V2 候选}
}
\]

然后只跑一次 candidate screen。

---

## 8. 新增 screen profile

完整 verify：

- ~541k Yee cells；
- 0.70 mm XY；
- 0.40 mm Z；
- EndCriteria \(10^{-4}\)；
- 最大 70000 steps。

新增 screen：

- 0.85 mm XY；
- 0.48 mm Z；
- EndCriteria \(2\times10^{-4}\)；
- 最大 45000 steps；
- 101 个频率后处理点。

它的作用不是最终验收，而是决定：

\[
\boxed{\text{这个候选值不值得再花 15 min 跑 verify}}
\]

candidate screen gate：

\[
S_{11}\le-15\ {\rm dB},
\]

\[
|k_{\rm out}-0.2476|\le0.03,
\]

\[
P_2+P_3\ge0.75,
\]

并且必须通过 passivity 和最低记录周期 gate。

---

## 9. 已有 raw FDTD 可以免费再提取更多信息

新的 post-processing 会额外保存：

- \(S_{11},S_{21},S_{31}\) phase；
- native \(\beta\)；
- native quarter-wave length。

这不需要重新 FDTD。

对已经存在的 verify raw directory 可以执行 post-only，让 openEMS 只重新做 Fourier/port decomposition。

因此未来每次 expensive FDTD 都应该把：

\[
Z_0,\quad\beta,\quad |S|,\quad\angle S
\]

全部保存下来，避免为了“忘记输出相位”再跑 15 min。

---

## 10. 推荐下一步

### 零 FDTD 成本

先重新 post-process 现有 verify raw data，拿到：

\[
\beta(f),\quad
\angle S_{21},\quad
\angle S_{31}.
\]

### 第一次新 FDTD

只跑：

design/tcell_candidate_v2.json

的 screen。

不要再跑 thru；port fixture 已经由原 verify 验证，可以显式复用 fixture summary。

### 第二次新 FDTD

只有 V2 screen 通过才跑 verify。

因此一个参数迭代周期从：

\[
5\sim10\times15\ {\rm min}
\]

降为：

\[
\boxed{
\text{几乎零成本 surrogate}
+
1\times\text{screen}
+
\text{必要时 }1\times\text{verify}
}
\]

这才是后面适合继续优化 T-junction、miter、launch transition 的方式。
