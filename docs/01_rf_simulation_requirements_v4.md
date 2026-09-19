# 射频仿真设计需求书（物理闭合版 V4）

> 状态：**当前推荐工程基线。**
>
> V4 在 V3 的基础上把最大组内板数由 100 修正为 80，并把“500 W、5–8 W/板、±25%、板数智能调功率”写成一个可以由功率守恒和损耗模型闭合的统一规格。
>
> 详细推导见：\`docs/25_1_to_80_closed_power_framework_v1.md\`。

---

## 1. 项目对象

开发 2.45 GHz 微波加热设备用：

- 5 cm × 5 cm 磁吸灰板；
- 平面连接桥；
- 立体直角桥；
- 输入/跨区连接线；
- 1–80 块可配置 RF 系统；
- 板数识别与源功率控制策略。

灰板机械/材料基线：

- 50 mm × 50 mm；
- FR4 厚 1.6 mm；
- 透明 PP 外壳；
- 正面 RF 辐射/耦合结构 + 直通线 + 耦合/功率分配结构 + 独立识别线；
- 背面连续 Ground；
- 板间磁吸 + RF/识别触点。

客户原始方形螺旋必须保留为正式 baseline；矩形 Patch / matched T-cell 作为优化路线，不得把替代结构写成“原始结构本来如此”。

---

## 2. 工作频率

\[
\boxed{f_0=2.45\ {\rm GHz}}
\]

工作带：

\[
\boxed{2.40\text{–}2.50\ {\rm GHz}}
\]

全局仿真扫频：

\[
2.0\text{–}3.0\ {\rm GHz}.
\]

RF 端口参考阻抗：

\[
\boxed{50\ \Omega}.
\]

50 Ω 是同轴/微带参考阻抗，不表示所有 branch、transformer、waveguide 的局部波阻抗都必须等于 50 Ω。

---

## 3. 板数与功率：V4 正式修订

正式支持：

\[
\boxed{1\le N\le80}.
\]

代表验收：

\[
\boxed{N=5,\ 25,\ 80}.
\]

源最大功率：

\[
\boxed{P_{\rm src,max}=500\ {\rm W}}.
\]

单板 useful accepted RF：

\[
\boxed{5\le P_i\le8\ {\rm W}}.
\]

组内均匀性：

\[
\boxed{
\max_i
\left|
P_i/\bar P-1
\right|
\le25\%.
}
\]

V4 不再包含：

\[
\text{100块}\times5\text{–}8\ {\rm W}
\]

这一互相冲突的验收条件。

---

## 4. 板数自适应 nominal power

V4 使用：

\[
\boxed{
\bar P(N)
=
\min\left(
6.5,\frac{400}{N}
\right)
\ {\rm W}.
}
\]

含义：

- 1–61 块：nominal 6.5 W/板；
- 62–80 块：进入 500 W power-limited 区域，平均功率逐步下降；
- 80 块：5 W/板。

400 W 是端到板 useful RF 设计预算，对应：

\[
\eta_{\rm sys}=400/500=80\%.
\]

因此 80 块不是无条件保证值，而有明确验收 gate：

\[
\boxed{\eta_{\rm sys}\ge80\%}.
\]

---

## 5. 系统 RF 架构

V4 明确区分：

\[
\text{机械上1–80块连续磁吸}
\]

与：

\[
\text{RF上80块连续普通FR4长链}.
\]

后者取消。

统一 RF 架构：

\[
\boxed{
\text{magnetron}
\to
\text{WR340 / matching}
\to
\text{low-loss feed/manifold}
\to
\text{local RF Zones}.
}
\]

板数：

\[
N=4M+r,\quad r=0,1,2,3.
\]

完整 Zone：

\[
A\to B\to C\to D_{\rm term}.
\]

80 块：

\[
20\times4\text{-board Zone}.
\]

1/2/3 块余数由 partial Zone 完成。

---

## 6. 取能分配不再固定为单一 A/B/C 参数

低/中板数 current field-aware endpoint：

\[
P_A:P_B:P_C:P_D
=
1:0.6412:0.6412:1.
\]

6.5 W 平均时：

\[
\boxed{
(7.92,\ 5.08,\ 5.08,\ 7.92)\ {\rm W}.
}
\]

高板数必须按功率约束自动 flatten。

定义：

\[
q(N)=P_{\rm inner}/P_{\rm outer}.
\]

V4 采用：

\[
\boxed{
q^*(N)=
\min\left[
1,
\max\left(
0.6412,
\frac{5}{2\bar P(N)-5}
\right)
\right].
}
\]

于是：

\[
P_{\rm outer}
=
\frac{2\bar P}{1+q^*},
\]

\[
P_{\rm inner}
=
\frac{2q^*\bar P}{1+q^*}.
\]

代表点：

| N | outer | inner |
|---:|---:|---:|
| 5 | 7.92 W | 5.08 W |
| 25 | 7.92 W | 5.08 W |
| 62 | 7.86 W | 5.04 W |
| 70 | 6.43 W | 5.00 W |
| 75 | 5.67 W | 5.00 W |
| 80 | 5.00 W | 5.00 W |

因此整个 1–80 范围解析目标都保持：

\[
5\le P_i\le8\ {\rm W}
\]

且最大 nominal deviation 约 ±21.9%，低于 ±25%。

---

## 7. phase / field synthesis

低/中板数当前 reduced-order 推荐：

\[
\mathbf u
\propto
(1,\ 0.801e^{-j5.3^\circ},\ 0.801e^{-j5.3^\circ},\ 1).
\]

该目标不能对所有 N 冻结。

V4 中：

1. 先由 \(N\) 得到 \(q^*(N)\)；
2. 固定 amplitude ratio；
3. 在当前工件场景集合上只优化 phase；
4. 再由 passive network synthesis 反推 line/transformer 参数。

80 板 endpoint：

\[
q=1,
\]

允许回到低损耗 near-equal / near-in-phase Zone。

---

## 8. loss-aware extraction synthesis

每个 Zone 目标 accepted powers 记为：

\[
(e_1,\ldots,e_m).
\]

cell transmission：

\[
\tau_i=10^{-L_i/10}.
\]

从末端向前：

\[
P_m=e_m,
\]

\[
P_i=e_i+\frac{P_{i+1}}{\tau_i}.
\]

所需抽取系数：

\[
\boxed{
\kappa_i=e_i/P_i.
}
\]

因此 A/B/C 的 coupling target 必须随：

- board count；
- power mode；
- cell loss；
- phase loss；
- magnetic interface；

动态重新反综合，而不是把某一组三个百分比当成永久规格。

当前两个解析端点：

- field-aware endpoint：
  \[
  \kappa\approx(24.76\%,24.07\%,36.08\%);
  \]
- equal-power endpoint、\(L_s=0.42\) dB/cell：
  \[
  \kappa\approx(21.50\%,30.17\%,47.58\%).
  \]

最终值由 full-wave 真实 \(\tau_i\) 更新。

---

## 9. 80 板 efficiency gate

80 块：

\[
80\times5=400\ {\rm W}.
\]

因此：

\[
\eta_{\rm sys}\ge80\%.
\]

若 feed + manifold：

\[
\eta_{\rm dist}\ge95\%,
\]

则 local Zone 必须：

\[
\boxed{
\eta_{\rm zone}\ge84.21\%.
}
\]

当前旧 \(0.42\) dB/cell 的等功率 4-board 一阶模型：

\[
\eta_{\rm zone}\approx85.99\%.
\]

所以 V4 允许保留 80 板目标，但把：

\[
\boxed{\eta_{\rm zone}\ge84.21\%}
\]

列为正式设计 gate。

如果 full-wave 后低于该值，必须：

- 降 Zone loss；
- 缩短 RF path；
- 改低损耗材料；
- 或降低最大板数；

不能通过修改报告口径“假装达标”。

---

## 10. 灰板结构路线

### 10.1 Original Spiral Baseline

客户原结构：

- 方形螺旋；
- 直通 RF line；
- coupling / extraction section；
- 10 kΩ board-ID branch；
- rear continuous Ground。

必须建模并保留。

### 10.2 Optimized Patch / T-cell Route

当前仓库理论主线：

- rectangular Patch；
- matched extraction T-cell；
- board-count-dependent power taper；
- constrained phase synthesis。

它是优化方案，不替代原始 baseline 的可追踪性。

最终 Spiral / Patch 应比较：

- \(S_{11}\)；
- useful RF extraction；
- parasitic loss；
- loaded workpiece absorption；
- field uniformity；
- local \(E_{\max}\)；
- 50×50 mm footprint；
- magnetic interface sensitivity。

---

## 11. 50×50 mm 是硬机械 gate

正式灰板：

\[
\boxed{50\times50\ {\rm mm}}.
\]

当前某些 T-cell seed 的 RF 纵向 envelope 超过 50 mm，因此目前仍是 layout gap。

下一版必须：

- compact transformer；
- folded phase section；
- multilayer / broadside（如允许）；
- 或重新综合 topology；

使最终 PCB 回到 50×50 mm，而不是直接放宽客户尺寸。

---

## 12. PP + FR4 必须进入真实 RF 模型

当前材料 seed：

- FR4：\(\varepsilon_r\approx4.3\)，\(\tan\delta\approx0.02\)，1.6 mm；
- front PP：当前暂用约 2 mm；
- rear PP：当前暂用约 6 mm。

PP 会改变：

- \(Z(W)\)；
- \(\varepsilon_{\rm eff}\)；
- guided wavelength；
- quarter-wave length；
- Patch loaded resonance。

当前 quasi-static PP-corrected 50 Ω seed：

\[
\boxed{w_{50}\approx2.91\ {\rm mm}}.
\]

正式制造前必须用真实 PP 厚度、装配间隙和 full-wave 重新标定。

---

## 13. 板数识别：恢复客户 10 kΩ

V4 恢复：

\[
\boxed{10\ {\rm k\Omega/board}}
\]

但明确采用独立识别线串联计数，不进入 RF extraction 网络。

建议：

\[
R_{\rm ID}(N)=10N\ {\rm k\Omega}.
\]

1–80 块：

\[
10\ {\rm k\Omega}
\to
800\ {\rm k\Omega}.
\]

例如 1 μA 恒流读取：

\[
V_{\rm ID}=10N\ {\rm mV},
\]

80 块约 0.80 V。

建议电阻：

- 0.1%；
- ≤25 ppm/°C；
- ID trace 与 RF 保持隔离；
- ADC 侧加入低通/RF filtering。

---

## 14. 平面连接桥

原始：

- 10×5×3 cm；
- PP 外壳；
- FR4；
- 约 100 mm RF path；
- insertion loss ≤0.2 dB。

V4：

\[
\boxed{
\text{普通FR4 + 100 mm + ≤0.2 dB}
}
\]

不作为无条件可执行组合。

两种路线：

### 保留普通 FR4

以 full-wave/实测给出的真实损耗作为验收值；当前一阶理论表明原 0.2 dB 过严。

### 保留 ≤0.2 dB

则必须同步改：

- low-loss RF substrate；
- shorter RF path；
- coaxial / stripline transition；
- 或其它低损耗桥结构。

---

## 15. 立体直角桥

原始：

- L 型 5+5 cm；
- 高约 3 cm；
- ≤0.3 dB。

同样不能把“普通 FR4”和“≤0.3 dB”同时无条件冻结。

必须全波包含：

- 90° geometry；
- ground-return reconstruction；
- magnetic contact；
- local discontinuity；
- PP loading。

若坚持 ≤0.3 dB，应优先改低损耗材料/结构。

---

## 16. 连接线

客户原始：

- N connector；
- magnetic thin-sheet endpoint；
- RG142；
- 2-core shielded ID/control line；
- 5 m ≤0.5 dB。

V4 将“RG142”和“5 m ≤0.5 dB”拆成两个不能预先同时冻结的条件。

最终必须根据实际采购 cable datasheet 在 2.45 GHz 核对：

- attenuation；
- connector loss；
- CW power rating；
- temperature derating；
- VSWR。

若 5 m ≤0.5 dB 为硬指标，则应选满足该总成预算的更低损耗 RF cable / hardline，而不是先固定 RG142 型号。

---

## 17. 功率控制

控制器 nominal law：

\[
\boxed{
P_{\rm cmd}(N)
=
\min\left[
500,
\frac{N\bar P(N)}
{\hat\eta_{\rm sys}(N)}
\right].
}
\]

其中 \(\hat\eta_{\rm sys}(N)\) 最终来自：

- full-wave S parameters；
- bridge/cable model；
- reflected-power monitoring；
- prototype calibration LUT。

初始理论验证可先使用 0.80，但不能作为量产常数冻结。

---

## 18. 仿真层级

### P0 — Physics calibration

1. PP+FR4 through-line；
2. magnetic contact；
3. Spiral baseline；
4. Patch baseline；
5. loaded radiator \(R+jX\)；
6. bridge/cable S parameters。

### P1 — Zone

7. 1-board terminal；
8. 2-board partial；
9. 3-board partial；
10. 4-board Zone；
11. field-aware endpoint；
12. equal-power 80-board endpoint。

### P2 — System network

13. N=5；
14. N=25；
15. N=80；
16. intermediate N sweep 1–80 using complex S/ABCD cascade。

25/80 不要求建立一个巨大的完整 3D 模型；采用 calibrated local full-wave block + network cascade。

---

## 19. V4 验收 gate

### 单板 / Zone

- center frequency：2.45 GHz；
- band：2.40–2.50 GHz；
- VSWR：≤2.0 hard，≤1.5 preferred；
- useful RF power：5–8 W/board；
- nominal power deviation：≤±25%；
- parasitic loss separately reported；
- loaded workpiece absorption separately reported；
- local \(E_{\max}\) separately reported。

### 80-board system

必须同时：

\[
\boxed{P_{\rm cmd}\le500\ {\rm W}}
\]

\[
\boxed{\eta_{\rm sys}\ge80\%}
\]

\[
\boxed{5\le P_i\le8\ {\rm W}}
\]

\[
\boxed{\delta_P\le25\%}.
\]

若其中任一项不能满足，80 板不能标记为已通过。

---

## 20. V4 结论

V4 把旧的：

\[
\text{1–100块}
+
\text{500 W}
+
\text{5–8 W/块}
\]

修订成：

\[
\boxed{
\text{1–80块}
+
\text{500 W}
+
\text{board-count-adaptive power/taper}
}
\]

并形成统一链：

\[
\boxed{
N
\to
\bar P(N)
\to
q^*(N)
\to
\kappa_i(N)
\to
S\text{-parameter calibrated Zone}
\to
\eta_{\rm sys}
\to
P_{\rm cmd}(N).
}
\]

因此后续 PCB 设计不再围绕单一 A/B/C coupling 数字盲调，而是服务于这个系统级闭环。
