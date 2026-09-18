# T-cell 正确参考面与可落板几何 V2

> 本文统一 matched-extraction T-cell 的最终预仿真参考面。关键修正：10.5 mm inset feed 保留为共同的 50 Ω Patch feed；A/B/C 的 unequal branch transformer 只到 inset 底部。磁吸 RF pad 的**内缘**作为传输线 reference plane，使所有合成铜都落在 50 mm 板宽内。

## 1. PCB 外形

最终预仿真机械包络取：

\[
\boxed{50\times60\ {\rm mm}}
\]

且板中心：

\[
\boxed{y_c=-5\ {\rm mm}}.
\]

因此边界为：

\[
x\in[-25,25]\ {\rm mm},
\qquad
y\in[-35,25]\ {\rm mm}.
\]

由于当前 tscircuit board outline 以原点居中处理，工程文件采用 50×70 mm 对称外形，以获得 y=-35 mm 的下边界；横向 50 mm 节距和所有 RF/Patch reference 均保持不变。

## 2. reference plane

磁吸信号 pad 宽：

\[
4.6\ {\rm mm},
\]

中心在：

\[
x=\pm22.5\ {\rm mm}.
\]

因此传输线 reference plane 取 pad 内缘：

\[
P_{\rm in}=(-20.2,-18.0)\ {\rm mm},
\]

\[
P_{\rm out}=(20.2,-18.0)\ {\rm mm}.
\]

Patch branch transformer 的终点取 inset 底部：

\[
P_{\rm patch}=(0,-9.25)\ {\rm mm}.
\]

inset feed 从该点继续 10.5 mm 到 Patch 内部，其线宽保持约 50 Ω。

## 3. 公共 inset 相位

50 Ω microstrip 的一阶半波：

\[
L_{1/2,50}\approx33.842\ {\rm mm}.
\]

因此：

\[
\beta_{50}\approx5.319^\circ/{\rm mm}.
\]

10.5 mm inset 对应：

\[
\boxed{
\phi_{\rm inset}\approx-55.84^\circ.
}
\]

该项对 A/B/C/D 是公共相位，不改变相邻板的 phase progression。

## 4. A/B/C T-junction

输入 series transformer 和 Patch branch transformer 分别满足：

\[
|P_{\rm in}-J_i|=L_{t,i},
\]

\[
|J_i-P_{\rm patch}|=L_{b,i}.
\]

取下方圆交点：

| Board | \(J_i=(x,y)\) mm | \(L_t\) | \(L_b\) |
|---|---|---:|---:|
| A | (-5.462, -26.020) | 16.779 mm | 17.637 mm |
| B | (-5.406, -25.770) | 16.710 mm | 17.382 mm |
| C | (-5.355, -25.299) | 16.543 mm | 16.919 mm |

最深铜边界约到：

\[
y\approx-28.87\ {\rm mm},
\]

距离 50×70 mm 板底：

\[
-28.87-(-35)\approx6.13\ {\rm mm},
\]

理论几何本身只需要约 60 mm 的有效纵向包络；当前使用 70 mm 是 tscircuit 居中板框实现上的工程余量，不是 RF 电长度要求。

## 5. amplitude synthesis

目标 extraction：

\[
\kappa_A=0.224,
\qquad
\kappa_B=0.316,
\qquad
\kappa_C=0.501.
\]

解析式：

\[
Z_t=50\sqrt{1-\kappa},
\]

\[
Z_b=50\sqrt{\frac{1-\kappa}{\kappa}}.
\]

Hammerstad 微带 seed：

| Board | \(Z_t\) | \(W_t\) | \(Z_b\) | \(W_b\) |
|---|---:|---:|---:|---:|
| A | 44.045 Ω | 3.845 mm | 93.063 Ω | 0.877 mm |
| B | 41.352 Ω | 4.235 mm | 73.562 Ω | 1.521 mm |
| C | 35.320 Ω | 5.337 mm | 49.900 Ω | 3.147 mm |

这套尺寸不再依赖几十微米 coupled gap。

## 6. through path + 磁吸接口

T 点到本板 RF OUT 内缘的直线长度：

| Board | 板内 T→RF OUT | 距 50 Ω 半波还差 | inter-cell target phase |
|---|---:|---:|---:|
| A | 26.886 mm | 6.956 mm(eq.) | 37.00° |
| B | 26.759 mm | 7.083 mm(eq.) | 37.67° |
| C | 26.577 mm | 7.266 mm(eq.) | 38.65° |

相邻 50 mm 板贴合时，从本板 RF OUT 内缘到下一板 RF IN 内缘的物理跨度为：

\[
50-20.2-20.2
=
\boxed{9.6\ {\rm mm}}.
\]

把 pad、磁吸接触、空气/PP/fringing 作为一个统一 inter-cell section，要达到上述 37–39°，其等效介电常数约为：

\[
\boxed{
\varepsilon_{\rm eff,link}\approx1.72\sim1.87.
}
\]

因此接口设计的第一版目标取：

\[
\boxed{
\phi_{\rm intercell}\approx37.8^\circ.
}
\]

连接桥不能再被当成零长度理想连接。

## 7. phase closure

从 cell input 到 T 点：

\[
-90^\circ.
\]

从 T 点到 inset 底部：

\[
-90^\circ.
\]

再加共同 inset：

\[
-55.84^\circ.
\]

所以每个 A/B/C Patch 相对本地 input：

\[
\boxed{
\phi_{\rm patch,local}\approx-235.84^\circ.
}
\]

而 T 点到下一 cell input 的 through section设计为：

\[
-180^\circ,
\]

故整 cell：

\[
\boxed{
\phi_{\rm through}\approx-270^\circ
\equiv+90^\circ.
}
\]

因此相邻 Patch 仍满足：

\[
\boxed{
\Delta\phi_{\rm patch}\approx+90^\circ.
}
\]

## 8. D terminal

D 不需要 T-junction。

从左 RF pad 内缘：

\[
(-20.2,-18.0)
\]

到 inset 底部：

\[
(0,-9.25)
\]

设计一条 50 Ω 半波：

\[
\boxed{
L_{D,\rm pre-inset}=33.842\ {\rm mm}.
}
\]

用两段等长 V 路径时，下方顶点取：

\[
\boxed{
V_D\approx(-4.992,-25.418)\ {\rm mm}.
}
\]

两段各约：

\[
16.921\ {\rm mm}.
\]

再加共同 10.5 mm inset，D 的 local Patch phase 与 A/B/C 相同，因此整个四板解析 seed 保持：

\[
\boxed{
0^\circ, 90^\circ, 180^\circ, 270^\circ
}
\]

的等价 phase progression。

## 9. 当前设计定位

现在 T-cell PCB 已经是明确的预仿真几何：

- 50×70 mm；
- 50 mm 水平 Patch pitch；
- A/B/C 普通可制造阻抗线宽；
- 解析 T-junction 坐标；
- 37–39° inter-cell magnetic-interface phase target；
- D 半波 V-feed；
- 10.5 mm common inset 明确保留。

HFSS/openEMS 后续只需校正：

1. T-junction discontinuity；
2. loaded Patch impedance；
3. inter-cell interface 的真实 complex S；
4. FR4/PP 下的实际 \(\beta\)；
5. 3-port load sensitivity 与反射传播。
