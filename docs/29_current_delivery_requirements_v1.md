# 当前工程交付要求 V1

> 日期：2026-09-20
>
> 本文替代“按原始客户描述逐字实现”的口径。当前交付以已经完成的 Full Engineering Board V2、可信 T-cell/openEMS 结果以及可制造连接件为基线。

## 1. 主单板

当前主单板为 **Full Engineering Board V2**：

- 50 × 60 mm；
- FR4 1.6 mm；
- front PP 2 mm；
- bottom full ground；
- RF IN / RF OUT 磁吸 signal + GND 接口；
- V2 T-cell；
- rectangular Patch；
- 10 kΩ / 0603 ID resistor；
- ID IN / ID OUT；
- calibrated 50 Ω trace seed 2.670 mm。

原始“50 × 50 mm + 方形螺旋”不再作为当前主设计；如客户强制要求回到该结构，需要作为独立 variant 重新设计，而不是与当前 V2 混用。

## 2. 功率与板数

源最大：

\[
P_{\max}=500\ {\rm W}.
\]

单板目标：

\[
5\sim8\ {\rm W}.
\]

机械/识别系统支持：

\[
1\sim100\ {\rm boards}.
\]

但 100 块不再被理解为“500 W 下保证每块至少 5 W”。因为：

\[
100\times 5=500\ {\rm W}
\]

已经等于理想无损源功率。

因此最终报告必须输出：

- 5 / 25 / 100 块网络计算；
- 实际单板功率范围；
- 最大偏差；
- 500 W 下的 feasibility；
- 在实测/仿真损耗下反算真实 \(N_{\max}\)。

## 3. 平面连接桥

当前加工目标：

- PCB：100 × 50 mm；
- 透明 PP housing：100 × 50 × 30 mm mechanical envelope；
- FR4 1.6 mm；
- RF calibrated trace：2.670 mm seed；
- ID trace：0.30 mm；
- 两端 RF / GND / ID 接触；
- 两端各 2 个磁铁机械位；
- bottom full ground；
- 目标：
  \[
  IL(2.45\,{\rm GHz})\le0.2\ {\rm dB}.
  \]

当前 tscircuit：

    pcb/tscircuit/index-flat-bridge.tsx

当前 openEMS：

    scripts/openems/simulate_connection_hardware.py --dut flat

## 4. 直角连接桥

采用平面 L 型 FR4 工程实现：

- 两个中心线臂约 50 mm + 50 mm；
- L 型 PCB arm width 30 mm；
- housing height 30 mm 作为机械包络；
- RF trace 使用 mitered / diagonal 90° transition；
- ID trace 独立 L 型走线；
- 两个外端均提供 RF / GND / ID + 2 magnet positions；
- bottom full ground；
- 目标：
  \[
  IL(2.45\,{\rm GHz})\le0.3\ {\rm dB}.
  \]

当前 tscircuit：

    pcb/tscircuit/index-corner-bridge.tsx

当前 openEMS：

    scripts/openems/simulate_connection_hardware.py --dut corner

如果客户所谓“立体直角”明确要求 PCB 本身处于两个正交平面，而不是平面 L 型 PCB，则这一项需要换成 two-panel 3D assembly；当前版本优先采用更容易制造和仿真的平面 L 型方案。

## 5. N 头连接线与磁吸薄片

磁吸薄片当前设计：

- 30 × 50 mm；
- RF / GND / ID magnetic contacts；
- coax center / shield landing；
- ID wire landing；
- bottom ground；
- 两个 magnet positions。

当前 tscircuit：

    pcb/tscircuit/index-cable-tab.tsx

当前 openEMS：

    scripts/openems/simulate_connection_hardware.py --dut tab

### RG142 可行性

原要求：

\[
5{\rm m}\le0.5{\rm dB}
\]

与标准 RG142 在 2.45 GHz 的公开衰减规格不相容。

Belden 84142 RG142 nominal attenuation：

- 2 GHz：19.3 dB / 100 ft；
- 3 GHz：24.3 dB / 100 ft。

线性插值得到 2.45 GHz 约：

\[
21.55{\rm dB}/100ft
\approx0.707{\rm dB/m}.
\]

5 m cable-only loss 约：

\[
\boxed{3.54{\rm dB}}
\]

尚未计 N connector 与 magnetic tab。

因此最终交付有两种选择：

1. 保留 RG142，并把 5 m 插损要求修正为真实可实现值；
2. 保留 0.5 dB / 5 m 目标，改用 2.45 GHz 衰减不超过：
   \[
   0.1{\rm dB/m}
   \]
   的低损耗馈线。

系统脚本：

    scripts/system/cable_model.py

## 6. 5 / 25 / 100 系统

不建立 100 块完整 3D FDTD。

采用：

\[
\text{full board}
+
\text{contact}
+
\text{bridge}
+
\text{cable/manifold}
\]

的网络/功率级联。

推荐架构仍为 local zones of up to four boards，而不是 100 块普通 FR4 微带连续串联。

系统脚本：

    scripts/system/cascade_power_budget.py

输出：

- 单板 \(P_{\min},P_{\max},P_{\rm avg}\)；
- 最大相对偏差；
- 5–8 W 是否满足；
- ±25% 是否满足；
- 所需 source power；
- 500 W 下是否 feasible；
- 5 W/board 所要求的最低系统效率。

## 7. 电磁仿真层级

交付验证按：

\[
\boxed{
\text{T-cell coupon}
\rightarrow
\text{Full V2 board}
\rightarrow
\text{Flat bridge}
\rightarrow
\text{Corner bridge}
\rightarrow
\text{Cable tab}
\rightarrow
\text{network cascade}
}
\]

执行。

单件 full-wave 负责提取 S 参数；多板只做网络级联。

## 8. 最终交付包

### PCB / 加工

- Full V2 board Gerber / PCB / SVG / STEP or DXF；
- flat bridge Gerber / PCB / SVG / STEP or DXF；
- corner bridge Gerber / PCB / SVG / STEP or DXF；
- cable magnetic tab Gerber / PCB / SVG / STEP or DXF；
- mechanical parameter sheet。

### 仿真

- Full V2 \(S_{11},S_{21},VSWR\)；
- bridge/tab \(S_{11},S_{21},IL,\angle S_{21}\)；
- 5 / 25 / 100 network power distribution；
- source-power feasibility；
- cable-loss audit。

### 报告

每个原始指标最终标注为：

- Pass；
- Conditional / requires revised component；
- Fail / physically incompatible with stated constraints。

不再为了“形式上全部 Pass”修改物理结论。
