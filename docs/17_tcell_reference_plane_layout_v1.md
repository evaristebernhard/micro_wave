# T-cell 正确参考面与可落板几何 V1

> 本文修正上一版 T-cell 中对 10.5 mm inset feed 的处理：inset feed 是 Patch 自身的 50 Ω feed 段，不能直接并入 A/B/C 的不同阻抗 branch transformer。

## 1. 参考面定义

统一定义：

- RF IN reference：左侧磁吸 RF 接点附近；
- input transformer 起点：\((-22.0,-18.0)\) mm；
- branch transformer 终点：Patch inset 底部 \((0,-9.25)\) mm；
- inset feed：从 \(y=-9.25\) 到 \(y=1.25\)，长度 10.5 mm，继续保持约 50 Ω；
- Patch radiator：从 inset feed 末端进入 Patch。

因此 branch transformer 看到的是“50 Ω inset feed + 约匹配 Patch”的 50 Ω 输入。

只要该负载接近 50 Ω，四分之一波 branch transformer 的阻抗变换仍然成立；10.5 mm inset 只额外加入所有 A/B/C 共有的相位。

## 2. inset feed 的公共相位

50 Ω microstrip 的一阶导波半波约：

\[L_{1/2,50}\approx33.842\ {\rm mm}.\]

所以：

\[
\beta_{50}\approx\frac{180^\circ}{33.842}
\approx5.319^\circ/{\rm mm}.
\]

10.5 mm inset 对应：

\[
\boxed{
\phi_{\rm inset}\approx-55.84^\circ.
}
\]

这个相位对 A/B/C 是公共项，因此不会破坏相邻 Patch 的 +90° progression。

## 3. A/B/C 的几何交点

series transformer 必须满足：

\[|P_{\rm in}-J_i|=L_{t,i},\]

branch transformer 必须满足：

\[|J_i-P_{\rm patch}|=L_{b,i}.\]

取位于板下方的圆交点，得到：

| Board | T 结点 J=(x,y) mm | series λ/4 | branch λ/4 |
|---|---|---:|---:|
| A | (-6.967, -25.453) | 16.779 mm | 17.637 mm |
| B | (-6.919, -25.196) | 16.710 mm | 17.382 mm |
| C | (-6.878, -24.708) | 16.543 mm | 16.919 mm |

这些点全部位于 50×60 mm 新板的合法区域：

\[y\in[-35,25]\ {\rm mm}.\]

因此新增板高正好把 T-cell 变成无 meander 的直线几何。

## 4. 幅度设计参数

| Board | κ | Zt | Wt | Zb | Wb |
|---|---:|---:|---:|---:|---:|
| A | 0.224 | 44.045 Ω | 3.845 mm | 93.063 Ω | 0.877 mm |
| B | 0.316 | 41.352 Ω | 4.235 mm | 73.562 Ω | 1.521 mm |
| C | 0.501 | 35.320 Ω | 5.337 mm | 49.900 Ω | 3.147 mm |

这些全部是普通 PCB 线宽；不再需要 0.02–0.06 mm 级 coupled gap。

## 5. through path 与磁吸桥

T 结点到本板 RF OUT 的直线距离为：

| Board | J→RF OUT | 距 50 Ω 半波还差 | 所需 bridge phase |
|---|---:|---:|---:|
| A | 30.395 mm | 3.448 mm(eq.) | 18.34° |
| B | 30.286 mm | 3.556 mm(eq.) | 18.92° |
| C | 30.134 mm | 3.708 mm(eq.) | 19.72° |

所以统一 bridge target 可先取：

\[
\boxed{\phi_{\rm bridge}\approx19^\circ.}
\]

两块 50 mm 板贴合时，RF contact center 的物理间距约为 5 mm。

如果 5 mm magnetic bridge 的有效介电常数处于约 1.55–1.80，则它的相位正好落在上述 18–20° 区间；对空气/PP/fringing 主导的连接结构，这是合理的预仿真数量级。

因此 bridge 应被视为 cell electrical length 的一部分，而不是零长度理想连接。

## 6. A/B/C 的局部 Patch 相位

从 cell input 到 T 结点：

\[-90^\circ.\]

T 结点到 inset 底部：

\[-90^\circ.\]

inset feed：

\[-55.84^\circ.\]

所以每块 Patch 相对本地 cell input 的相位约：

\[
\boxed{
\phi_{\rm patch,local}\approx-235.84^\circ.
}
\]

而 cell through phase设计为：

\[-270^\circ.\]

因此相邻 Patch：

\[
(-270-235.84)-(-235.84)
=-270
\equiv
\boxed{+90^\circ}.
\]

## 7. D terminal

D 也保留相同 10.5 mm inset feed。

因此 D 从 RF IN 到 inset 底部只需要 50 Ω 半波：

\[
\boxed{L_{D,\rm pre-inset}=33.842\ {\rm mm}.}
\]

从 \((-22.5,-18)\) 到 \((0,-9.25)\) 用一个两段 V 形路径即可实现。取对称等长两段，低点为：

\[
\boxed{
V_D\approx(-6.952,-24.677)\ {\rm mm}.
}
\]

两段各约：

\[16.921\ {\rm mm},\]

总计：

\[33.842\ {\rm mm}.\]

再接原 10.5 mm inset，D 的局部 Patch 相位同样约为 -235.84°，因此和 A/B/C 完全使用同一相位约定。

## 8. 当前设计结论

在 50×60 mm 外形下，matched T-cell 已经形成一套完整的解析 PCB seed：

\[
\boxed{
\text{指定抽取率}
+
\text{input match}
+
\text{+90° Patch progression}
+
\text{普通制造线宽}
}
\]

后续 HFSS 的主要任务从“找 topology”缩减为：

1. 校正 T-junction discontinuity；
2. 校正 Patch loaded input impedance；
3. 校正 magnetic bridge 的 18–20° phase；
4. 检查 3-port load sensitivity；
5. 与 enlarged-board quadrature hybrid 做 isolation 对照。