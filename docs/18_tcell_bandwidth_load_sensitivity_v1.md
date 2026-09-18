# Matched T-cell 预仿真频带与负载敏感性 V1

> 本文继续用理想传输线 reduced-order model 审核 matched-extraction T-cell。目标是提前回答两个问题：100 MHz 工作带宽是否困难，以及没有隔离的 3-port T-cell 对 Patch/workpiece 反射有多敏感。

## 1. 理想传输线模型

对每块 A/B/C：

- input series transformer：\(Z_t\)，中心频率 \(\lambda/4\)；
- Patch branch transformer：\(Z_b\)，中心频率 \(\lambda/4\)；
- through arm：50 Ω；
- nominal Patch load：50 Ω。

设计关系：

\[
Z_t=50\sqrt{1-\kappa},
\]

\[
Z_b=50\sqrt{\frac{1-\kappa}{\kappa}}.
\]

branch input impedance：

\[
Z_b^{\rm in}(f)
=
Z_b
\frac{
Z_L+jZ_b\tan\theta_b
}{
Z_b+jZ_L\tan\theta_b
}.
\]

T 点：

\[
Z_J
=
50\parallel Z_b^{\rm in}.
\]

再经 series transformer：

\[
Z_{\rm in}(f)
=
Z_t
\frac{
Z_J+jZ_t\tan\theta_t
}{
Z_t+jZ_J\tan\theta_t
}.
\]

## 2. 2.40–2.50 GHz 理想带宽

先假设：

\[
Z_L=50\ \Omega
\]

且忽略微带色散，只令：

\[
\theta(f)
\approx
\frac{\pi}{2}\frac{f}{2.45\ {\rm GHz}}.
\]

得到：

| Board | 2.40 GHz input RL | 2.45 GHz | 2.50 GHz input RL | extraction drift |
|---|---:|---:|---:|---:|
| A | 62.85 dB | 理想匹配 | 62.85 dB | 22.40% → 22.41% |
| B | 53.42 dB | 理想匹配 | 53.42 dB | 31.60% → 31.61% |
| C | 38.86 dB | 理想匹配 | 38.86 dB | 50.10% → 50.10% |

因此：

\[
\boxed{
\text{100 MHz 本身不是 T-cell 的主要 gap。}
}
\]

真实带宽主要由：

- Patch resonance；
- T-junction discontinuity；
- FR4 色散/损耗；
- magnetic interface；
- workpiece loading；

决定，而不是 quarter-wave transformer 的理想窄带性。

## 3. Patch 反射是关键敏感量

设 loaded Patch 的 50 Ω 参考反射系数：

\[
\Gamma_L
=
\rho e^{j\phi}.
\]

在中心频率扫描 \(\phi\in[0,2\pi]\)，得到以下 worst-case reduced-order 结果。

### 当 \(|\Gamma_L|=0.10\)（约 −20 dB）

| Board | cell worst input RL | extraction range |
|---|---:|---:|
| A | 32.29 dB | 19.11%–26.08% |
| B | 29.39 dB | 27.43%–36.09% |
| C | 25.56 dB | 45.10%–55.10% |

这时 T-cell 本身相当稳健。

### 当 \(|\Gamma_L|=0.20\)（约 −14.0 dB）

| Board | cell worst input RL | extraction range |
|---|---:|---:|
| A | 25.51 dB | 16.14%–30.22% |
| B | 22.71 dB | 23.55%–40.93% |
| C | 19.07 dB | 40.10%–60.10% |

入口匹配仍然不差，但 extraction 已出现明显负载依赖。

### 当 \(|\Gamma_L|=0.316\)（约 −10 dB）

| Board | cell worst input RL | extraction range |
|---|---:|---:|
| A | 20.56 dB | 13.05%–35.71% |
| B | 17.90 dB | 19.36%–47.06% |
| C | 14.52 dB | 34.29%–65.89% |

这时 T-cell 虽未必失配到不可用，但“固定 extraction fraction”模型已经明显失效。

## 4. 设计判据

因此 matched T-cell 是否适合作为主方案，不应该由“它是 3-port、没有 isolation”一句话决定。

更明确的 gate 是：

\[
\boxed{
|\Gamma_{\rm Patch,loaded}|
\lesssim0.10
}
\]

时，T-cell 很有竞争力。

若：

\[
0.10<|\Gamma_{\rm Patch,loaded}|\lesssim0.20,
\]

仍可使用，但必须在 cascade model 中把 loaded Patch impedance 显式纳入，不能继续使用固定 \(\kappa_i\)。

若经工件加载扫描出现：

\[
|\Gamma_{\rm Patch,loaded}|\gtrsim0.20
\]

甚至接近 −10 dB，则 quadrature / Wilkinson / isolation topology 的价值显著增加。

## 5. 对 HFSS 的直接要求

第一轮 HFSS 不需要同时把所有东西扫完。

优先得到每块 Patch 在工件加载下：

\[
\boxed{
\Gamma_{\rm Patch}(f,d,\varepsilon',\varepsilon'',T)
}
\]

尤其检查：

- 2.40–2.50 GHz；
- 工件距离；
- 空载 / 典型负载 / 强反射负载；
- 温度引起的介电参数变化。

如果绝大部分工作域满足：

\[
|\Gamma_{\rm Patch}|<0.10,
\]

则 matched T-cell 可以直接进入主优化。

如果大量工作点超过 0.20，则把 50×60 mm 扩板空间用于 isolated divider / hybrid 更合理。

## 6. 当前结论

当前预仿真设计优先级更新为：

\[
\boxed{
\text{先测 loaded Patch reflection}
\rightarrow
\text{决定 T-cell vs isolated topology}
}
\]

而不是继续盲调 edge-coupled gap。

T-cell 已经证明：

- nominal match 可解析闭合；
- 100 MHz 带宽不是主要障碍；
- 线宽均可制造；
- amplitude 与 +90° phase progression 可共同闭合；
- 主要剩余风险被压缩为 loaded-Patch reflection 与 T-junction discontinuity。
