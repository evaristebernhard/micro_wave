# T-cell 精确等功率综合 V1

> 目的：在 matched-extraction T-cell 已经具备可制造拓扑后，不再沿用旧 6.5/5/3 dB 的近似 coupling，而是把 0.42 dB/cell through-loss 显式纳入，精确反解四块 Patch 等功率。

## 1. 递推

设每块 Patch 目标吸收相同 RF 功率 (E)，每个 cell 通过路径功率传输系数：

[
	au=10^{-0.42/10}approx0.907821.
]

D 为终端板，因此：

[
P_4=E.
]

C 前端功率：

[
P_3=E+rac{P_4}{	au}.
]

所以：

[
kappa_C=rac{E}{P_3}.
]

继续向前：

[
P_2=E+rac{P_3}{	au},
qquad
kappa_B=rac{E}{P_2},
]

[
P_1=E+rac{P_2}{	au},
qquad
kappa_A=rac{E}{P_1}.
]

令 (E=1) 做归一化，得到：

[
oxed{
kappa_A=0.214983,
quad
kappa_B=0.301666,
quad
kappa_C=0.475842.
}
]

对应：

[
oxed{
6.676 {m dB},
quad
5.205 {m dB},
quad
3.225 {m dB}.
}
]

因此旧 6.5/5/3 dB 只保留为早期 scalar seed；T-cell 主方案使用 loss-corrected 精确值。

## 2. 精确 T-cell 阻抗

仍使用：

[
Z_t=50sqrt{1-kappa},
]

[
Z_b=50sqrt{rac{1-kappa}{kappa}}.
]

得到：

| Board | κ | Zt | Zb |
|---|---:|---:|---:|
| A | 0.214983 | 44.301 Ω | 95.545 Ω |
| B | 0.301666 | 41.783 Ω | 76.074 Ω |
| C | 0.475842 | 36.199 Ω | 52.477 Ω |

Hammerstad 单微带反解：

| Board | Wt | λg,t/4 | Wb | λg,b/4 |
|---|---:|---:|---:|---:|
| A | 3.810 mm | 16.785 mm | 0.819 mm | 17.664 mm |
| B | 4.169 mm | 16.721 mm | 1.415 mm | 17.422 mm |
| C | 5.153 mm | 16.568 mm | 2.892 mm | 16.977 mm |

全部属于常规 PCB 尺寸。

## 3. 更新后的 T-junction

reference plane 保持：

[
P_{m in}=(-20.2,-18.0) {m mm},
]

[
P_{m patch}=(0,-9.25) {m mm}.
]

解：

[
|P_{m in}-J_i|=L_{t,i},
]

[
|J_i-P_{m patch}|=L_{b,i},
]

取下方交点：

| Board | T-junction |
|---|---|
| A | (-5.469, -26.046) mm |
| B | (-5.414, -25.809) mm |
| C | (-5.356, -25.360) mm |

最深铜仍约：

[
yapprox-28.81 {m mm},
]

因此 50×70 mm 当前 tscircuit 工程板仍有足够余量。

## 4. inter-cell phase

T 点到本板 RF OUT 内缘：

| Board | onboard tail |
|---|---:|
| A | 26.900 mm |
| B | 26.778 mm |
| C | 26.595 mm |

为了让 T 点到下一板 input reference 等效为 50 Ω 半波：

[
L_{1/2,50}=33.842 {m mm},
]

inter-cell section 需要补：

| Board | 50 Ω 等效长度 | phase |
|---|---:|---:|
| A | 6.943 mm | 36.93° |
| B | 7.064 mm | 37.57° |
| C | 7.248 mm | 38.55° |

因此统一接口目标可取：

[
oxed{
phi_{m intercell}approx37.7^circ
}
]

并在 HFSS 中允许 A/B/C 各自约 ±1° 的微调。

## 5. 完整复激励

由于每块目标功率相同：

[
E/P_{m in}=kappa_A=0.214983.
]

所以归一化电压/波幅：

[
|u_i|=sqrt{0.214983}approx0.463663.
]

取 phase progression：

[
0^circ, 90^circ, 180^circ, 270^circ,
]

得到：

[
oxed{
mathbf u_{m T,seed}
=
(0.463663, 0.463663j, -0.463663, -0.463663j)^T.
}
]

这比旧 complex seed 更干净：四块 amplitude 在 reduced-order model 中完全一致。

## 6. 设计意义

当前 T-cell 主方案同时满足：

[
oxed{
	ext{loss-corrected equal power}
+
	ext{center-frequency input matching}
+
	ext{ordinary manufacturable line widths}
+
	ext{+90° progressive phase}
}
]

后续 HFSS 不再负责“从零寻找 κ”，而是只校正：

- 实际 through loss；
- T-junction discontinuity；
- loaded Patch impedance；
- inter-cell interface phase；
- workpiece-induced reflection。

如果真实 through loss 不再是 0.42 dB/cell，只需重新代入 (	au) 递推，即可直接生成下一版 (kappa_A,kappa_B,kappa_C)。
