# Full Engineering Board V2 快速 openEMS 模型 V1

> 日期：2026-09-20；结果解释修订：2026-09-21
>
> 目的：补齐 tscircuit 工程验证与完整板电磁验证之间的缺口。该模型用于快速筛选 Full Engineering Board V2 的数值稳定性、输入匹配和功率流趋势。
>
> **重要修订：当前脚本中的 `screen_gate` 只表示数值/匹配 gate，不表示 Zone 功率分配功能通过。最新 Full V2 screen 虽然 `screen_gate=true`，但 through power 仅约 6.78%，与 A-stage 需要保留约 66% 功率给后级的系统目标明显不符。**

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

当前只能把它作为**未归因的非直通功率**。在没有单独积分 Patch radiation、介质损耗、PML outward flux 和工件吸收之前，不能把它称为“有用抽取”，更不能直接与 \(\kappa_A,\kappa_B,\kappa_C\) 等 Patch accepted-power 目标等同。

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

当前脚本内置的**数值/匹配 gate**：

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

已有三份 summary 后可零成本比较：

    python scripts/openems/compare_full_v2_id.py \
      --off results/openems_full_v2_fast/full_v2_fast_off_summary.json \
      --open results/openems_full_v2_fast/full_v2_fast_open_summary.json \
      --tenk results/openems_full_v2_fast/full_v2_fast_10k_summary.json

第四步 screen：

    python scripts/openems/simulate_full_v2_fast.py --profile screen --id-mode open

`screen_gate=true` 以后仍必须做**功能 gate**。对 A/B/C 级联板，至少应检查 through power 是否与 loss-aware Zone 递推一致，并确认非直通功率的物理去向。只有数值 gate 与功能 gate 都合理后，才值得进入 loaded-workpiece / finite-conductivity 模型。

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


---

## 9. 2026-09-21 最新 Full V2 结果

当前 `open` ID 模式下：

| profile | S11 @ 2.45 GHz | S21 @ 2.45 GHz | reflected | through | non-through |
|---|---:|---:|---:|---:|---:|
| fast | -19.34 dB | -12.49 dB | 1.16% | 5.63% | 93.20% |
| screen | -17.15 dB | -11.69 dB | 1.93% | 6.78% | 91.29% |

screen 的 VSWR 约 1.322，且在 2.25–2.65 GHz 内均满足 VSWR≤2，因此**输入匹配本身不是当前主要矛盾**。

但当前 field-aware 四板目标要求 A-stage extraction 约：

\[
\kappa_A=24.76\%.
\]

按 `docs/23_few_mode_robust_field_synthesis_v1.md` 的 loss-aware 递推：

\[
(P_A,P_B,P_C,P_D)\approx(4.0386,2.6643,1.7773,1),
\]

所以 A 板之后仍需保留：

\[
T_{A,\rm target}
\approx
\frac{P_B}{P_A}
\approx0.6597.
\]

对应理想量级：

\[
S_{21,A}\approx10\log_{10}(0.6597)\approx-1.81\ \mathrm{dB}
\]

（这里是功率比转 dB；实际还应把接口和局部寄生损耗单独列入）。

而当前 Full V2 screen：

\[
T_{\rm sim}=|S_{21}|^2\approx0.0678.
\]

因此：

\[
\frac{T_{\rm sim}}{T_{A,\rm target}}
\approx0.103.
\]

也就是当前完整板向后级保留的功率只有 A-stage 目标量级的约 **10%**。

所以最新结果的正确标签是：

\[
\boxed{
\text{matching/numerical gate passed; Zone power-flow functional gate failed}
}
\]

而不是“Full V2 已通过”。

## 10. 为什么不能把 91.3% non-through 解释为 Patch 有用取能

二端口后处理只知道：

\[
R=|S_{11}|^2,
\qquad
T=|S_{21}|^2,
\]

以及：

\[
1-R-T.
\]

开放 full-board 模型中更完整的功率守恒应写为：

\[
1
=
R+T
+P_{\rm patch,rad}
+P_{\rm diel}
+P_{\rm metal}
+P_{\rm PML/other}
+P_{\rm workpiece}.
\]

当前 fast/screen 使用 PEC，因此：

\[
P_{\rm metal}\approx0
\]

只是一阶近似；同时模型没有真实工件，所以：

\[
P_{\rm workpiece}=0.
\]

因此当前：

\[
1-R-T\approx91.3\%
\]

只能说明大量功率没有从端口 2 返回，不能证明这些功率被 Patch 以目标方式接收，更不能证明它们转化为工件加热。

## 11. 频率响应给出的诊断线索

screen 在 2.25–2.65 GHz 内：

- S11 约从 -16.7 dB 平滑变化到 -17.6 dB；
- S21 约从 -11.8 dB 平滑变化到 -11.3 dB；
- non-through 始终约 91%。

这个响应缺少明显的窄带 Patch resonance 结构。

这**不能单独证明模型错误**，但说明下一步应同时验证两类假设：

1. 完整板几何确实形成了很强的宽带辐射/泄漏路径；
2. coplanar lumped-port、PML、有限 ground 或端口功率分解让大量能流被统一记入 `non-through`，从而掩盖真实的 Patch/through 分功。

因此下一轮不是继续调 S11，而是做 power-flow decomposition。

## 12. 下一轮必须增加的功能观测量

建议至少增加：

\[
P_{\rm port1,ref},
\quad
P_{\rm port2,out},
\quad
P_{\rm patch/rad},
\quad
P_{\rm dielectric},
\quad
P_{\rm boundary},
\]

并做以下最小对照：

- Full V2，Patch present；
- 同一 launch/through 几何，Patch/branch removed 或 matched-terminated；
- ID off / open / 10k；
- 必要时独立 magnetic-interface coupon。

只有这些量闭合后，才能把：

\[
\kappa_i
\]

从“二端口剩余量”恢复成真正的 Patch accepted-power / workpiece-power 目标。
