# Full Engineering Board V2 快速 openEMS 模型 V1

> 日期：2026-09-20
>
> 目的：补齐 tscircuit 工程验证与完整板电磁验证之间的缺口。该模型用于快速筛选 Full Engineering Board V2 是否因为 launch、pad taper、ID 支路、Patch 和有限 ground 而破坏 T-cell core 的良好结果。

## 1. 当前工程状态

Full Engineering Board V2 已通过 tscircuit：

- netlist；
- placement；
- ID trace-length；
- routing difficulty；
- build；
- shorts；
- 0 errors / warnings。

但这只证明 PCB 工程结构一致，不等于 RF 性能达标。

因此新增：

scripts/openems/simulate_full_v2_fast.py

## 2. 与 PCB 同步的几何源

RF 主参数读取：

design/tcell_candidate_v2.json

完整板特有参数读取：

pcb/tscircuit/src/full-engineering-board-v2-geometry.json

后者同时被 tscircuit Full V2 读取，因此以下参数不再在 TSX/Python 两边手抄：

- launch taper length；
- branch-to-feed taper；
- octagonal T-junction；
- ID pad/trace/10 kΩ；
- ID EM gap。

## 3. 快速模型包含

- 真实 50 × 60 mm PCB；
- FR4 1.6 mm；
- front PP 2 mm；
- finite bottom ground；
- RF IN/OUT signal pads；
- ground pads + return vias；
- V2 calibrated T-cell；
- octagonal T-junction；
- branch-to-feed taper；
- 37.5 × 28.5 mm inset-fed Patch；
- ID IN/OUT pads 和 ID copper traces。

RF input/output 采用**顶层 coplanar signal pad ↔ 相邻 GND pad 的 50 Ω lumped port**。这比垂直穿 FR4 到 bottom ground 更符合当前磁吸接触对结构；ground return vias 和 bottom plane 会自然参与回流。

因此该模型已经把 pad/taper discontinuity 和顶层 signal/GND launch geometry 纳入 S 参数。

## 4. 为何仍然较快

快速模型默认：

\[
\boxed{\text{zero-thickness PEC copper}}
\]

因此不会因为 35 μm 铜厚引入极小 z-cell。

另外：

- 不做场 dump；
- 不做 NF2FF；
- 不做工件热模型；
- rear PP 因连续 bottom ground 的一阶屏蔽先省略；
- 只扫 2.30–2.60 GHz（fast）或 2.25–2.65 GHz（screen）。

这一步解决 PCB RF topology，不解决最终铜损和加热效率。

## 5. ID 支路的三种模式

### off

完全删除 ID 铜。

用途：获得 RF-only reference。

### open（默认）

保留完整 ID 铜线和 pad，但 10 kΩ resistor 在 RF 上近似为开路。

这是最便宜、最合理的第一阶 2.45 GHz 模型。

### 10k

在中间 gap 加入 CSXCAD lumped 10 kΩ series element。

用途：检查 open approximation 是否足够。

如果 open 与 10k 的：

\[
\Delta S_{11},\quad\Delta S_{21}
\]

非常小，以后 screen 可以只跑 open。

## 6. 输出指标

2.45 GHz 自动输出：

\[
S_{11},\quad S_{21},\quad VSWR
\]

以及：

\[
P_{\rm non-through}
=
1-|S_{11}|^2-|S_{21}|^2.
\]

注意：

\[
P_{\rm non-through}
\]

**不是工件吸收功率。**

它包含：

- Patch radiation；
- FR4/PP dielectric loss；
- T-cell/launch accepted loss；
- 其它离开二端口的功率。

当前只把它作为“完整板是否仍然能把目标量级功率从 through path 抽走”的 screening observable。

还会自动计算：

\[
BW_{\rm VSWR\le2}
\]

并使用 50 MHz 作为第一道客户带宽 gate。

## 7. 推荐运行

第一步 smoke：

    python scripts/openems/simulate_full_v2_fast.py --profile smoke --id-mode open --threads 4

第二步 fast：

    python scripts/openems/simulate_full_v2_fast.py --profile fast --id-mode open --threads 4

当前 gate：

\[
S_{11}(2.45)\le-10\ \mathrm{dB},
\]

\[
BW_{\rm VSWR\le2}\ge50\ \mathrm{MHz},
\]

并要求：

\[
|S_{11}|^2+|S_{21}|^2\le1.05.
\]

第三步只在有必要时检查 ID：

    python scripts/openems/simulate_full_v2_fast.py --profile fast --id-mode off

    python scripts/openems/simulate_full_v2_fast.py --profile fast --id-mode 10k

只有 ID sensitivity 明显时才继续优化 ID 位置/走线。

第四步 screen：

    python scripts/openems/simulate_full_v2_fast.py --profile screen --id-mode open

screen 通过以后才值得建立 loaded-workpiece / finite-conductivity 模型。

## 8. 当前设计层级

现在项目的 EM 验证链为：

\[
\boxed{
\text{thru coupon}
\rightarrow
\text{T-cell coupon}
\rightarrow
\text{Full V2 fast board}
\rightarrow
\text{Full V2 screen}
\rightarrow
\text{loaded workpiece}
\rightarrow
\text{A/B/C/D Zone}
}
\]

因此不再从 T-cell coupon 直接跳到四板/100 板系统。
