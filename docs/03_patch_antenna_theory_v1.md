# 2.45 GHz 前向辐射 Patch 天线板：数学物理基线 V1

## 1. 设计目标

当前单板路线明确采用 **矩形微带 Patch 前向辐射**，用于 50 mm × 50 mm 磁吸模块化加热板。

单板不是孤立天线，而是下面这个网络的一部分：

```text
左侧 RF 磁吸接口
      │
      ▼
50 Ω 贯通主线 ─────────────→ 右侧 RF 磁吸接口
          │
          └── 弱耦合支路 ──→ Patch ──→ 前向辐射 / 工件
```

设计目标不是让 Patch 吃掉全部输入，而是：

1. 主线继续向后传输；
2. 每块板从主线抽取一部分功率；
3. Patch 向 +z 方向、即工件方向辐射；
4. 2.40–2.50 GHz 内保持可接受匹配；
5. 作为 tscircuit 的参数化 PCB 种子，再由 HFSS 优化。

---

## 2. 基础参数

| 参数 | 数值 |
|---|---:|
| 中心频率 | 2.45 GHz |
| 工作频段 | 2.40–2.50 GHz |
| PCB 尺寸 | 50 mm × 50 mm |
| FR4 相对介电常数 | 4.3 |
| FR4 损耗角正切 | 0.02 |
| FR4 厚度 | 1.6 mm |
| 铜厚 | 35 μm |
| 前 PP | εr≈2.2, 厚 2 mm |
| 后 PP | εr≈2.2, 厚 6 mm |
| 系统参考阻抗 | 50 Ω |
| 最大主干功率 | 500 W |

自由空间波长：

[
lambda_0=rac{c}{f_0}approx122.36	ext{ mm}.
]

---

## 3. 矩形 Patch 初始尺寸

经典矩形微带 Patch 的宽度初值：

[
W_p=
rac{c}{2f_0}
sqrt{rac{2}{arepsilon_r+1}}.
]

代入 (f_0=2.45) GHz、(arepsilon_r=4.3)：

[
W_papprox37.6	ext{ mm}.
]

对该宽度，有效介电常数近似：

[
arepsilon_{m eff}
=
rac{arepsilon_r+1}{2}
+
rac{arepsilon_r-1}{2}
left(1+rac{12h}{W_p}ight)^{-1/2},
]

得到：

[
arepsilon_{m eff}approx3.99.
]

有效谐振长度：

[
L_{m eff}
=
rac{c}{2f_0sqrt{arepsilon_{m eff}}}
approx30.62	ext{ mm}.
]

边缘延长：

[
rac{Delta L}{h}
=
0.412
rac{
(arepsilon_{m eff}+0.3)(W_p/h+0.264)
}{
(arepsilon_{m eff}-0.258)(W_p/h+0.8)
},
]

得到：

[
Delta Lapprox0.74	ext{ mm}.
]

因此裸 FR4 + 空气的一阶物理长度：

[
L_p
=
L_{m eff}-2Delta L
approx29.1	ext{ mm}.
]

所以理论中心尺寸为：

[
oxed{
W_p	imes L_papprox37.6	imes29.1	ext{ mm}
}
]

---

## 4. PP 覆盖后的第一版几何

真实结构中 Patch 前方还有 2 mm PP：

[
arepsilon_{r,m PP}approx2.2.
]

该覆盖会增加边缘场介电加载，使谐振频率相对裸板下降。因此 PCB 不应把 29.1 mm 完全写死，推荐第一轮 HFSS 搜索：

[
W_p=35sim39	ext{ mm},
]

[
L_p=27sim30.5	ext{ mm}.
]

tscircuit 第一版种子：

[
oxed{
W_p=37.5	ext{ mm},qquad
L_p=28.5	ext{ mm}
}
]

最终尺寸由“PP + 工件”完整 HFSS 模型校正。

---

## 5. 前向辐射物理机制

Patch 工作在近似 TM(_{10}) 基模。

长度方向场可以近似写为：

[
E_z(x)
=
E_0
cosleft(
rac{pi x}{L_{m eff}}
ight).
]

两个辐射边缘可以视为两个等效 slot。背面完整 Ground 抑制背向辐射，因此主要能量流向：

[
oxed{+z}
]

即透明 PP 前盖和工件方向。

该结构比原来的“2–4 圈任意螺旋”具有更明确的 2.45 GHz 基模解释。

---

## 6. Patch 不能直接并接在 50 Ω 主线上

若贯通主线后端等效为 50 Ω，而 Patch 也直接匹配成 50 Ω，则 T 结点等效阻抗：

[
Z_{m eq}=50parallel50=25Omega.
]

对应：

[
Gamma
=
rac{25-50}{25+50}
=-rac13,
]

所以：

[
|Gamma|=rac13,
qquad
VSWR=2.
]

这只是一块板就已经达到系统硬上限，多板级联不可接受。

因此必须采用：

[
oxed{
	ext{50 Ω贯通主线}
+
	ext{弱耦合支路}
+
	ext{Patch}
}
]

而不是直接 T 接。

---

## 7. 目标抽取比例对应的等效支路阻抗

设 Patch 希望从当前结点抽取功率比例 (kappa)，主线继续向后仍为 50 Ω。

若弱耦合后的 Patch 支路从主线看等效为纯电阻 (R_b)，则：

[
kappa
=
rac{P_b}{P_b+P_t}.
]

由于同结点电压相同：

[
rac{P_b}{P_t}
=
rac{50}{R_b}.
]

解得：

[
oxed{
R_b
=
50rac{1-kappa}{kappa}
}
]

典型值：

| 抽取比例 (kappa) | 等效支路阻抗 |
|---:|---:|
| 5% | 950 Ω |
| 10% | 450 Ω |
| 15% | 283 Ω |
| 20% | 200 Ω |

因此主线不应该直接看到一个 50 Ω Patch，而应该看到约数百欧姆的弱耦合支路。

---

## 8. 弱耦合方式：优先采用分布电容耦合

如果采用四分之一波阻抗变换器把 50 Ω Patch 变换到 450 Ω：

[
Z_t=sqrt{50	imes450}=150Omega.
]

在 1.6 mm FR4 上，150 Ω 微带会非常窄，对 500 W 主干系统和加工公差都不友好。

因此第一版推荐：

[
oxed{
	ext{主线与 Patch feed 之间采用 gap / overlap 电容性弱耦合}
}
]

近似等效：

```text
main line ──────||────── inset feed ── Patch
                 Cc
```

在 Patch 谐振点附近，将 Patch 输入近似为 50 Ω：

[
Z_b
approx
50-rac{j}{omega C_c}.
]

一阶目标耦合量级：

| 目标抽取比例 | 等效耦合电容量级 |
|---:|---:|
| 5% | ~0.3 pF |
| 10% | ~0.45 pF |
| 15% | ~0.6 pF |
| 20% | ~0.75 pF |

所以第一版重点搜索：

[
oxed{
C_csim0.4	ext{–}0.6	ext{ pF}
}
]

实际 PCB 不使用离散 0.5 pF 器件，而通过铜图形的 gap / overlap 实现分布电容。

初始几何搜索：

[
g_c=0.3sim0.8	ext{ mm},
]

[
l_c=3sim10	ext{ mm}.
]

第一版 seed：

[
oxed{
g_c=0.5	ext{ mm},qquad
l_c=6	ext{ mm}
}
]

---

## 9. Patch 自身的馈电位置

矩形 Patch 边缘输入阻抗通常显著高于 50 Ω。

采用 inset feed 时可用一阶模型：

[
R_{m in}(y)
=
R_{m edge}
cos^2left(
rac{pi y}{L_p}
ight).
]

若边缘电阻取约：

[
R_{m edge}sim250	ext{–}350Omega,
]

要求：

[
R_{m in}approx50Omega,
]

得到 inset depth 约：

[
oxed{
y_{m inset}approx9	ext{–}12	ext{ mm}
}
]

第一版 seed：

[
oxed{
y_{m inset}=10.5	ext{ mm}
}
]

HFSS 中将其作为高敏感度变量扫描。

---

## 10. 带宽要求

要求工作频带：

[
2.40	ext{–}2.50	ext{ GHz}.
]

总带宽：

[
BW=100	ext{ MHz}.
]

分数带宽：

[
FBW
=
rac{100}{2450}
approx4.08%.
]

对应加载品质因数量级：

[
Q_L
sim
rac{1}{FBW}
approx24.5.
]

因此第一版普通矩形 Patch 的目标并不是超宽带，而是验证在真实 PP / 工件加载后能否达到：

[
oxed{
S_{11}<-10	ext{ dB},
quad
2.40	ext{–}2.50	ext{ GHz}
}
]

如果只能得到约 60–80 MHz，再考虑 slot / notch / 双谐振结构，而不是第一版直接复杂化。

---

## 11. 功率守恒与单板 S 参数目标

单板可以抽象成：

[
P_{m in}
=
P_{m refl}
+
P_{m thru}
+
P_{m rad/useful}
+
P_{m loss}.
]

归一化：

[
|S_{11}|^2
+
|S_{21}|^2
+
eta_{m useful}
+
eta_{m loss}
=
1.
]

假设设计目标：

[
VSWRle1.5
Rightarrow
|S_{11}|^2le4%.
]

若寄生损耗先预算：

[
eta_{m loss}approx3%.
]

则不同有用抽取比例对应：

| 有用抽取 | 主线剩余功率 | 等效 S21 |
|---:|---:|---:|
| 5% | 88% | −0.56 dB |
| 8% | 85% | −0.71 dB |
| 10% | 83% | −0.81 dB |
| 12% | 81% | −0.92 dB |
| 15% | 78% | −1.08 dB |
| 20% | 73% | −1.37 dB |

所以对这种“贯通主线 + 取能 Patch”结构：

[
oxed{
S_{21}	ext{ 并不是越接近 }0	ext{ dB越好}
}
]

合理的一阶目标区间反而可能是：

[
oxed{
S_{21}approx-0.6	ext{ 至 }-1.2	ext{ dB}
}
]

关键是区分有用抽取与寄生材料损耗。

---

## 12. 主干 500 W 与 Patch 支路功率的区别

整个系统主干最大：

[
P_{m trunk}le500	ext{ W}.
]

50 Ω 下：

[
V_{m rms}=sqrt{PZ_0}approx158.1	ext{ V},
]

[
I_{m rms}=sqrt{P/Z_0}approx3.16	ext{ A}.
]

但单个 Patch 实际目标通常只有数瓦。

例如 8 W / 50 Ω：

[
V_{m rms}=20	ext{ V},
]

[
I_{m rms}=0.4	ext{ A}.
]

因此高功率风险主要集中在：

- 贯通主线；
- 左右磁吸 RF 接口；
- 桥接件；
- 主线局部狭窄/不连续位置。

Patch 本体并不是 500 W 天线。

---

## 13. tscircuit 第一版参数化模型

建议板中心坐标定义为 ((0,0))。

PCB：

[
50	imes50	ext{ mm}.
]

主线：

- 沿 x 方向从左磁吸 RF 端到右磁吸 RF 端；
- 放在靠近 PCB 下边缘；
- 主线宽度不写死。

Patch：

- 位于板中上部；
- 长度方向取 y；
- 宽度方向取 x。

第一版参数向量：

[
mathbf{x}
=
(
W_p,
L_p,
y_{m inset},
w_f,
g_c,
l_c
).
]

推荐 seed：

[
oxed{
mathbf{x}_0
=
(
37.5,,
28.5,,
10.5,,
2.9,,
0.5,,
6.0
)	ext{ mm}
}
]

HFSS 第一轮搜索：

[
W_p=35sim39	ext{ mm},
]

[
L_p=27sim30.5	ext{ mm},
]

[
y_{m inset}=9sim12	ext{ mm},
]

[
w_f=2.6sim3.2	ext{ mm},
]

[
g_c=0.3sim0.8	ext{ mm},
]

[
l_c=3sim10	ext{ mm}.
]

---

## 14. 第一阶段 HFSS 验收

单板模型先只验证：

1. 2.45 GHz 是否存在正确 Patch 基模；
2. 主辐射方向是否为 +z；
3. 2.40–2.50 GHz 输入匹配；
4. 弱耦合抽取比例；
5. 贯通主线损耗；
6. FR4 / 铜寄生损耗；
7. PP 覆盖后的谐振偏移。

第一版目标：

| 参数 | 目标 |
|---|---:|
| 中心频率 | 2.45 GHz |
| 全工作带宽 VSWR | ≤2 |
| 优选 VSWR | ≤1.5 |
| 单板抽取比例 | 约 10–15% |
| Patch 辐射/有用效率 | >60%，争取 >70% |
| 前向辐射 | +z 主瓣明显 |
| 主线特性阻抗 | 约 50 Ω |
| 局部高场 | 无异常热点 |

---

## 15. 当前最重要的下一问题

Patch 路线已经具有可实现的数学 seed。

当前最大的系统级不确定性变成：

[
oxed{
	ext{50 mm FR4 贯通主线在 2.45 GHz 到底损失多少功率}
}
]

因为该损耗会被每块板重复累计，直接决定：

- 单区最多串几块；
- 500 W 最终能供多少块；
- 是否需要低损耗基材；
- 是否需要让 RF 主干与 FR4 Patch 板解耦。

因此下一阶段应专门对 50 mm FR4 through-line 做传输线损耗与级联分析。
