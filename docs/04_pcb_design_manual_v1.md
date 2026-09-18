# 2.45 GHz 磁吸 Patch 天线板 PCB 设计手册 V1

> 本手册是当前 **tscircuit 画板 + HFSS 验证** 的执行基线。  
> 适用对象：50 mm × 50 mm 磁吸模块化微波加热天线板。  
> 当前路线：**50 Ω 贯通主线 + 弱耦合支路 + 前向矩形 Patch + 背面完整 Ground**。
>
> 本手册解决的是“PCB 第一版到底怎么画”。未冻结的机械细节继续参数化，不允许用未知参数阻塞第一版 PCB。

---

## 1. 画板前先明确：当前还剩哪些问题

目前已经可以画第一版 PCB，但仍有 4 个参数必须保持可调，不能当成最终制造冻结值：

1. **磁吸触点的真实机械尺寸**：目前没有最终结构图；
2. **工件材料和板到工件距离**：会显著移动 Patch 谐振点；
3. **PP 覆盖后的最终 50 Ω 主线宽度**：2.9 mm 只是 HFSS seed；
4. **Patch 最终长度与耦合强度**：需要 HFSS 在真实 PP + 工件负载下优化。

因此第一版 PCB 是 **参数化仿真板**，但其拓扑、层叠、布线规则和尺寸范围已经足够明确。

---

## 2. PCB 总体结构

### 2.1 板框

- 外形：**50.0 mm × 50.0 mm**
- 建议坐标原点：板中心 ((0,0))
- x 方向：左右磁吸拼接方向
- y 方向：Patch 长度方向
- +z：工件方向 / 前向辐射方向

坐标范围：

[
-25le xle25	ext{ mm},
qquad
-25le yle25	ext{ mm}.
]

### 2.2 PCB 层叠

两层 PCB：

```text
+z / 工件方向

2 mm 透明 PP      ← HFSS 外部结构，不进入 Gerber stackup
────────────────
Top Copper 35 μm  ← Patch / RF主线 / 耦合线 / 识别线
FR4 1.6 mm
Bottom Copper     ← 连续整面 RF Ground
────────────────
6 mm PP 背板       ← HFSS 外部结构，不进入 Gerber stackup
```

PCB 制造层只定义：

- Top copper：35 μm
- FR4：1.6 mm
- Bottom copper：35 μm

材料：

[
arepsilon_r=4.3,
qquad
	andelta=0.02.
]

HFSS 再加入前 2 mm PP 和后 6 mm PP。

---

## 3. 第一版 PCB 的 RF 拓扑

PCB 不允许把 Patch 直接 T 接到贯通主线。

必须采用：

```text
LEFT RF
  │
  ▼
==================================================  50 Ω through-line
                         ║
                         ║ 弱耦合
                         ▼
                 coupled feed line
                         │
                         │
                   inset feed
                         │
                 ┌─────────────┐
                 │    PATCH    │
                 │             │
                 └─────────────┘

                                                RIGHT RF
```

主线承担：

- 左右磁吸接口之间的连续 RF 传输；
- 每块板只通过弱耦合从主线上抽取一部分功率。

---

## 4. 第一版尺寸总表

### 4.1 必须使用的 tscircuit seed

| 参数 | 符号 | 第一版值 | HFSS 扫描范围 |
|---|---:|---:|---:|
| PCB 宽 | — | 50.0 mm | 固定 |
| PCB 高 | — | 50.0 mm | 固定 |
| Patch 宽 | (W_p) | **37.5 mm** | 35–39 mm |
| Patch 长 | (L_p) | **28.5 mm** | 27–30.5 mm |
| 主 RF 线宽 | (w_f) | **2.9 mm** | 2.6–3.2 mm |
| inset 深度 | (y_i) | **10.5 mm** | 9–12 mm |
| inset 侧缝 | (g_i) | **0.5 mm** | 0.3–0.8 mm |
| 耦合边间距 | (g_c) | **0.5 mm** | 0.3–0.8 mm |
| 平行耦合长度 | (l_c) | **6.0 mm** | 3–10 mm |
| 识别线宽 | (w_{id}) | **0.30 mm** | 固定 |
| 识别电阻 | (R_{id}) | **100 Ω, 0.1%** | 固定 |
| FR4 厚度 | (h) | **1.6 mm** | 固定 |
| 铜厚 | (t_{Cu}) | **35 μm** | 固定 |

---

## 5. 推荐坐标布局

下面的坐标用于第一版 tscircuit PCB，方便以后脚本参数化。

### 5.1 Patch

第一版 Patch：

[
W_p=37.5	ext{ mm},
qquad
L_p=28.5	ext{ mm}.
]

建议 Patch 中心：

[
(x_p,y_p)=(0, 5.0	ext{ mm}).
]

因此 Patch 外边界为：

[
x=-18.75sim18.75	ext{ mm},
]

[
y=-9.25sim19.25	ext{ mm}.
]

这样：

- 左右各留约 6.25 mm；
- 上边留约 5.75 mm；
- 下方留足空间给 through-line 和耦合器。

### 5.2 贯通 RF 主线

主线沿 x 方向贯穿全板。

中心线：

[
oxed{y_f=-18.0	ext{ mm}}
]

宽度：

[
oxed{w_f=2.9	ext{ mm}}
]

路径：

[
x=-25ightarrow25	ext{ mm}.
]

不要自动绕线，不要产生 45°/90° 随机拐角。

### 5.3 耦合支路

推荐采用 **edge-coupled parallel section**，而不是把主线切断后串联一个电容。

第一版：

- 主线中心：(y=-18.0) mm
- 耦合支路线宽：先取 **2.9 mm**
- 两线边缘间距：

[
g_c=0.5	ext{ mm}.
]

因此两根 2.9 mm 宽线的中心间距：

[
d_c=2.9+0.5=3.4	ext{ mm}.
]

耦合支路中心：

[
oxed{y_c=-14.6	ext{ mm}}
]

耦合段长度：

[
oxed{l_c=6.0	ext{ mm}}
]

第一版取：

[
x=-3.0sim3.0	ext{ mm}.
]

耦合段结束后，通过垂直 feed line 向上进入 Patch inset。

### 5.4 inset feed

Patch 下边缘：

[
y=-9.25	ext{ mm}.
]

inset 深度：

[
y_i=10.5	ext{ mm}.
]

所以 feed 接入位置：

[
y_{m feed,end}
=
-9.25+10.5
=
1.25	ext{ mm}.
]

feed line 中心：

[
x=0.
]

feed line 宽度第一版：

[
oxed{w_{m feed}=2.9	ext{ mm}}
]

inset notch 侧边与 feed line 之间各保留：

[
g_i=0.5	ext{ mm}.
]

因此 notch 总宽：

[
w_{m notch}
=
w_{m feed}+2g_i
=
3.9	ext{ mm}.
]

tscircuit 里建议直接把 Patch 做成 polygon：矩形 Patch 减去一个中央 inset notch，而不是用若干重叠矩形拼凑。

---

## 6. Patch 画法

### 6.1 必须保持矩形主体

第一版禁止：

- 开槽；
- U-slot；
- E-shape；
- 多层叠片；
- 螺旋；
- 任意艺术化缺口。

原因：第一版要先验证最基本 TM(_{10}) Patch 是否能在真实 PP / 工件负载下满足 2.45 GHz。

### 6.2 关键可调参数只有四个

Patch 优先优化：

[
L_p,quad
W_p,quad
y_i,quad
g_c/l_c.
]

调参顺序：

1. **先调 (L_p)**：把谐振拉到 2.45 GHz；
2. **再调 inset (y_i)**：改善 Patch 支路自身阻抗；
3. **再调 (g_c,l_c)**：控制每块抽取比例；
4. 最后微调 (W_p,w_f)：带宽和阻抗细修。

不要六个参数同时大范围随机扫。

---

## 7. Bottom Ground 规则

Bottom copper 使用：

[
oxed{	ext{完整、连续整面地}}
]

原则：

- Patch 正下方不得挖空；
- through-line 正下方不得挖空；
- 耦合区域正下方不得挖空；
- 不在 Bottom 层走识别线；
- 不做 split ground；
- 不允许在 RF 路径下开槽；
- RF 接口接地必须直接连接 Bottom Ground。

对本项目而言，Bottom Ground 是 Patch 正向辐射和 50 Ω 微带成立的基础条件。

---

## 8. 磁吸 RF 接口画法

真实磁吸机械件尚未冻结，因此第一版 PCB 使用“参数化接口占位”，不能伪装成最终机械设计。

### 8.1 Signal Pad 占位参数

左右各一个 signal pad：

- 初始 pad：**5.0 mm × 4.0 mm**
- pad 中心 y 与主线一致：

[
y=-18.0	ext{ mm}.
]

左 pad 靠左边缘，右 pad 靠右边缘。

主线必须平滑、居中连接 signal pad。

### 8.2 Ground Return

每个 RF signal pad 附近必须预留 Ground return。

第一版建议：

- signal pad 上下各预留 ground-contact 区；
- 使用至少 2 个接地 via 将 Top ground-contact pad 直接接到底层 Ground；
- 不使用 thermal relief；
- via 尽可能靠近接触点。

第一版 via 建议：

- finished drill：0.30 mm
- pad：0.60 mm

这是仿真/PCB seed，不代表最终磁吸连接器结构。

### 8.3 接口 keepout

每侧磁吸接口预留至少：

[
8	ext{ mm}	imes10	ext{ mm}
]

机械/电磁 keepout 区。

磁铁、金属壳、弹片以后必须在 HFSS 中加入，不允许未经仿真直接压到 Patch 或主线附近。

---

## 9. 识别电阻和低频识别线

### 9.1 电阻

每板：

[
oxed{R_{id}=100Omega, 0.1%, le25	ext{ ppm/°C}}
]

建议封装：

- 0603 优先；
- 0402 也可以；
- 不需要大功率封装，因为测量电流仅约 100 μA。

### 9.2 识别线位置

识别线不能穿过 Patch 下方或紧贴主 RF 线。

推荐在 PCB **最下方边缘**建立低频 lane：

[
yapprox-23	ext{ mm}.
]

识别线宽：

[
0.30	ext{ mm}.
]

与主 RF through-line 最近边缘保持：

[
oxed{ge2.0	ext{ mm}}
]

建议实际做到：

[
3	ext{–}4	ext{ mm}.
]

识别线只承担低频/直流计数，不允许参与 RF 回流。

---

## 10. 顶层 RF keepout

Patch、through-line、耦合器周围不要加入无关铜。

### 10.1 Patch keepout

Patch 周边第一版至少保留：

[
oxed{2.0	ext{ mm}}
]

无其它顶层铜/器件。

能做到 3 mm 更好。

### 10.2 耦合器 keepout

主线—耦合线平行区域两侧至少：

[
2.0	ext{ mm}
]

不放：

- 电阻；
- 测试点；
- 数字线；
- 铜岛；
- 磁铁金属件。

### 10.3 through-line keepout

主线两侧优先保持：

[
ge2.0	ext{ mm}
]

不放低频走线。

---

## 11. Solder Mask / Silkscreen

为了让 HFSS 模型和制造 PCB 尽量一致，第一版 RF 区建议：

### 11.1 Solder mask

建议对以下区域做 solder-mask opening：

- Patch 全部铜面；
- inset feed；
- coupling section；
- through-line RF 主干；
- RF 接触 pad。

如果最终决定保留 solder mask，则必须把其：

[
arepsilon_r,quad	andelta,quad t
]

加入 HFSS，不能制造板有 mask、仿真却没有。

第一版为了减少未知量，推荐：

[
oxed{	ext{RF 区无 solder mask}}
]

### 11.2 Silkscreen

禁止 silkscreen 覆盖：

- Patch；
- inset；
- coupling；
- main RF line；
- RF pads。

文字和标记放在非 RF 区。

---

## 12. 表面处理

当前需求使用沉金。

第一版：

[
oxed{	ext{ENIG}}
]

可用于磁吸接触和裸露 Patch。

HFSS 第一轮可以仍以铜为主体导体进行电磁设计，但最终高精度模型若需要，可再加入表面处理的薄层影响。

---

## 13. tscircuit 建模要求

### 13.1 必须参数化

建议把以下参数集中定义，不得散落 magic numbers：

```text
BOARD_W = 50
BOARD_H = 50

PATCH_W = 37.5
PATCH_L = 28.5
PATCH_Y = 5.0

RF_TRACE_W = 2.9
RF_TRACE_Y = -18.0

INSET_DEPTH = 10.5
INSET_GAP = 0.5

COUPLING_GAP = 0.5
COUPLING_LENGTH = 6.0

ID_TRACE_W = 0.30
ID_TRACE_Y = -23.0

ID_RESISTOR = 100
```

单位统一使用 mm。

### 13.2 禁止 autorouter 改 RF 几何

以下网络必须手工固定路径：

- through-line；
- coupled section；
- inset feed；
- Patch。

autorouter 仅可用于低频识别网络。

### 13.3 Gerber 输出至少包含

- Top Copper
- Bottom Copper
- Top Solder Mask
- Bottom Solder Mask
- Top Silkscreen
- Drill
- Board outline / mechanical

如果 RF 区不覆 solder mask，要确认 Gerber mask opening 正确。

---

## 14. HFSS 导入后必须补的内容

Gerber 只能给 HFSS 铜图形和板轮廓，导入后仍需明确：

### PCB

- FR4：εr=4.3
- tanδ=0.02
- h=1.6 mm
- Copper：35 μm
- σ=5.8×10^7 S/m
- roughness：Rz=5 μm

### 外部机械

- 前 PP：2 mm
- 后 PP：6 mm

### RF 接口

- 接触电阻 seed：10 mΩ
- 寄生电感 seed：0.3 nH
- 空气隙 seed：0.2 mm

### 工件

真实参数没有时先扫描：

[
arepsilon_r'=5, 10, 20
]

[
	andelta=0.1, 0.2, 0.4
]

距离：

[
5, 10, 20	ext{ mm}.
]

---

## 15. HFSS 第一轮优化顺序

不要直接上 4–5 块板。

### Step 1：单独 50 mm through-line

先建立：

```text
Port1 ───────── 50 mm microstrip ───────── Port2
```

保留：

- FR4；
- 铜；
- PP；
- roughness。

目标：

[
Z_0approx50Omega
]

并测：

[
L_{m line,50mm}.
]

当前理论预期：

[
oxed{L_{m line}approx0.40	ext{ dB}}
]

含接口的单 cell 预算：

[
0.42	ext{–}0.45	ext{ dB}.
]

如果 HFSS：

- ≤0.30 dB：很好，可考虑扩大 Zone；
- 0.30–0.45 dB：正常；
- >0.50 dB：必须重新检查材料/线宽/PP/接口。

### Step 2：单 Patch 支路

加入 Patch、inset、coupler。

先调整：

[
L_p
]

让主要谐振落在：

[
2.45	ext{ GHz}.
]

然后调整：

[
y_i
]

改善局部匹配。

再调：

[
g_c, l_c
]

使单板抽取功率约：

[
8%	ext{–}12%.
]

第一版中心：

[
oxed{10%}
]

### Step 3：加入工件

检查：

- 谐振移动；
- 工件吸收功率；
- 前向场；
- Patch 自身损耗。

### Step 4：2 块

确认磁吸接口和级联相位。

### Step 5：4 块

当前普通 FR4 推荐 Zone：

[
oxed{4	ext{ 块}}
]

### Step 6：5 块

作为当前普通 FR4 的工程上限候选。

### Step 7：8 块

只做对照，不作为默认设计。

---

## 16. 当前 Zone 设计规则

按理论单 cell：

[
L_sapprox0.42	ext{ dB}
]

且单板 Patch 抽取：

[
kappaapprox10%
]

则相邻 Patch 可用功率大约下降：

[
0.42+0.46
approx0.88	ext{ dB/板}.
]

因此：

| Zone 板数 | 首尾功率差估计 |
|---:|---:|
| 2 | 0.88 dB |
| 3 | 1.76 dB |
| 4 | 2.63 dB |
| 5 | 3.51 dB |
| 8 | 6.14 dB |

当前设计口径：

[
oxed{4	ext{ 块/Zone 推荐}}
]

[
oxed{5	ext{ 块/Zone 可尝试上限}}
]

[
oxed{8	ext{ 块仅对照}}
]

如果 HFSS 实际得到：

[
L_sle0.25	ext{ dB},
]

才重新考虑 6–8 块 Zone。

---

## 17. PCB DRC 建议

第一版使用以下最低规则即可：

| 项目 | 建议 |
|---|---:|
| 普通信号最小线宽 | 0.20 mm |
| 普通信号最小间距 | 0.20 mm |
| RF 主线 | 2.9 mm 参数化 |
| RF 耦合最小 gap | 不低于 0.30 mm |
| Patch 周边 RF keepout | ≥2.0 mm |
| 板边到普通铜 | ≥0.5 mm |
| RF signal pad | 可到板边 |
| via drill | ≥0.30 mm |
| via pad | ≥0.60 mm |

注意：RF 几何规则优先于普通 DRC。

---

## 18. PCB 第一版禁止事项

画第一版时明确禁止：

1. 不要让 autorouter 改 through-line；
2. 不要在 Patch 下挖 Ground；
3. 不要在 Patch 上加过孔；
4. 不要用 2–4 圈 spiral 替代 Patch；
5. 不要在 RF 耦合区放元件；
6. 不要让识别线穿 Patch 或 RF 主线下面；
7. 不要加未建模的 solder mask 覆盖 RF 区；
8. 不要随意加入 top copper pour；
9. 不要为了“好看”改变 Patch 或 inset 尺寸；
10. 不要把 500 W 直接定义成单 Patch 功率。

---

## 19. 第一版 PCB 是否已经可以画

答案：

[
oxed{	ext{可以。}}
]

目前没有阻止第一版 tscircuit PCB 生成的理论缺口。

仍未冻结的内容使用参数化占位即可：

- 磁吸触点；
- 磁铁机械位置；
- 工件材料；
- 最终 Patch 长度；
- 最终主线宽度；
- 最终耦合 gap/length。

这些参数必须由 HFSS 调整，而不是在 tscircuit 阶段凭经验一次写死。

---

## 20. 第一版 PCB 交付检查表

画完 tscircuit 后，在送 HFSS 前逐项确认：

- [ ] PCB = 50 × 50 mm
- [ ] 2 layer
- [ ] Top RF geometry 固定
- [ ] Bottom Ground 连续
- [ ] Patch seed = 37.5 × 28.5 mm
- [ ] Patch center = (0, 5 mm)
- [ ] through-line = 2.9 mm
- [ ] through-line y = -18 mm
- [ ] inset depth = 10.5 mm
- [ ] inset side gap = 0.5 mm
- [ ] coupling gap = 0.5 mm
- [ ] coupling length = 6 mm
- [ ] 100 Ω identification resistor
- [ ] 0.3 mm identification trace
- [ ] RF 区无无关顶层铜
- [ ] RF 区 solder-mask 策略与 HFSS 一致
- [ ] RF pads / Ground return 已预留
- [ ] Gerber + drill 可以正常导出
- [ ] 所有关键尺寸由集中参数定义

满足以上清单后即可进入 HFSS 第一轮优化。
