# Full Engineering Board V2 加载仿真闭合报告 V1

> 日期：2026-09-22  
> 状态：未加载 RF 筛选闭合；加载工件趋势试算完成，但数值未收敛，不作为设计定型依据。

## 1. 本轮闭合结论

本轮对仓库内已有 openEMS 原始端口记录进行了统一后处理，并恢复了此前未生成 JSON 的两个 5 mm 工件间隙结果。

可以确认的结论：

1. Full V2 未加载板在 `fast` 与 `screen` 两种网格/时窗下均满足当前 RF 筛选门限；
2. ID 铜删除、ID 开路和显式 10 kΩ 三种状态在 2.45 GHz 的差异可忽略；
3. 当前加载工件模型已经能够建模 `2 mm PP + air gap + finite lossy workpiece`，但现有加载记录时窗不足，不能据此宣称工件吸收率、加载谐振点或有效加热效率；
4. 先前加载结果中的 `screen_gate=true` 只是 S 参数代数门限通过，并不代表时域记录有效。脚本现已增加独立的数据质量门，所有现有加载结果均被正确降级为 `insufficient-time-record`。

因此当前工程判定为：

\[
\boxed{\text{空载 RF topology 已闭合；加载工件物理性能尚未闭合。}}
\]

## 2. 判定口径

电气门限仍为：

- 2.45 GHz 处 S11 ≤ -10 dB；
- VSWR ≤ 2 的连续带宽 ≥ 50 MHz；
- \(|S_{11}|^2+|S_{21}|^2\le 1.05\)。

本轮新增原始端口记录质量门：

- 每个 `port_ut/it` 文件至少 20 个有效采样；
- 四个端口记录的最短时窗至少 1.0 ns。

该质量门只用于排除明显过短或被中断的记录，不等价于 openEMS 能量收敛证明。正式定型仍需检查跨时窗、跨网格稳定性。

## 3. 未加载基线

| 工况 | 2.45 GHz S11 | 2.45 GHz S21 | VSWR | 最短时窗 | 数据质量 | 综合 gate |
|---|---:|---:|---:|---:|---|---|
| fast / ID off | -19.371 dB | -12.484 dB | 1.2409 | 1.317 ns | 通过 | 通过 |
| fast / ID open | -19.338 dB | -12.491 dB | 1.2419 | 1.317 ns | 通过 | 通过 |
| fast / ID 10 kΩ | -19.339 dB | -12.491 dB | 1.2419 | 1.317 ns | 通过 | 通过 |
| screen / ID open | -17.153 dB | -11.688 dB | 1.3223 | 1.227 ns | 通过 | 通过 |

`fast/open` 到 `screen/open` 的差异为约 2.19 dB（S11）和 0.80 dB（S21）。这说明结果适合做工程筛选，但尚不是高精度最终解；结论与此前“screen 仍达到步数上限”的记录一致。

ID 敏感性结论保持不变：`open - off` 在 2.45 GHz 只有 +0.033 dB 的 S11 变化和 -0.007 dB 的 S21 变化，显式 10 kΩ 相对 open 的变化更小。

## 4. 加载工件试算结果

加载体统一使用：

\[
\varepsilon_r'=10,\qquad \tan\delta=0.2,\qquad t=20\ \mathrm{mm},
\]

平面尺寸为 50 × 60 mm，位于 2 mm front PP 上方，air gap 分别为 0、5、10、20 mm。

### 4.1 smoke 间隙扫描

| air gap | S11 | S21 | non-through | 最短时窗 | 判定 |
|---:|---:|---:|---:|---:|---|
| 0 mm | -18.133 dB | -51.054 dB | 98.462% | 0.318 ns | 时窗不足 |
| 5 mm | -19.236 dB | -45.140 dB | 98.805% | 0.318 ns | 时窗不足 |
| 10 mm | -19.223 dB | -44.778 dB | 98.801% | 0.318 ns | 时窗不足 |
| 20 mm | -20.567 dB | -61.544 dB | 99.122% | 0.273 ns | 时窗不足 |

这些值只保留为故障诊断记录，不用于比较 gap 优劣。特别是 `non-through` 不能解释为工件吸收，它仍混合了辐射、FR4/PP 损耗、边界流出及其它未从二端口返回的功率。

### 4.2 5 mm gap 的跨 profile 检查

| profile | S11 | S21 | 原始采样数 | 最短时窗 | 判定 |
|---|---:|---:|---:|---:|---|
| smoke | -19.236 dB | -45.140 dB | 8 | 0.318 ns | 不可用 |
| loaded | -33.437 dB | -85.574 dB | 5 | 0.182 ns | 不可用 |
| fast（中断记录） | -25.014 dB | -300 dB | 2 | 0.045 ns | 不可用 |

同一几何的 S11 漂移超过 14 dB，S21 则随记录长度跌到数值零。`fast` 记录的输出端电压全零，属于明显中断/未传播完成的数据。`loaded` profile 虽留下了可读取的端口文件，但记录在 0.182 ns 就停止；无论是能量终止条件提前触发还是外部中止，该记录都不能形成稳定频域结果。

## 5. 已完成的工程修正

`scripts/openems/simulate_full_v2_fast.py` 现会把以下字段写入完整结果和 summary：

- `port_time_domain_diagnostics`；
- `port_minimum_samples`；
- `port_minimum_time_window_ns`；
- `electrical_gate`；
- `data_quality_gate`；
- `result_status`。

`screen_gate` 现在是 `electrical_gate AND data_quality_gate`，不会再把短时窗加载结果标成通过。现有 11 组结果已全部按新口径重新后处理。

## 6. 尚未闭合项与下一轮执行

要形成可用于产品决策的 loaded-workpiece 结论，至少还需要：

1. 强制 5 mm gap 仿真保留 ≥1 ns 的端口时窗，并比较 1 ns、2 ns 或更长时窗下的 S11/S21 稳定性；
2. 对收敛后的 0、5、10、20 mm gap 统一使用同一网格与终止条件；
3. 增加工件体内频域 E 场或 SAR/损耗密度 dump，并对工件体积积分；
4. 用输入接受功率归一化，分别报告工件吸收、介质损耗、辐射/边界流出和 through 功率；
5. 最后才讨论 Patch 尺寸修调、T-cell extraction 或四板 Zone 性能。

建议先只重跑代表点 5 mm，不立即铺开四点长仿真。当前可复现后处理命令为：

```text
/home/ubuntu/opt/openEMS/venv/bin/python \
  scripts/openems/simulate_full_v2_fast.py \
  --profile loaded --id-mode open \
  --workpiece-epsilon 10 --workpiece-tan-delta 0.2 \
  --workpiece-gap-mm 5 --workpiece-thickness-mm 20 \
  --post-only
```

该命令会稳定得到 `result_status=insufficient-time-record`，用于复核本报告。重新求解时去掉 `--post-only`，但在调整 loaded profile 的终止条件并加入场损耗积分之前，不应把新值写成工件吸收效率。

## 7. 最终状态

本轮没有用不收敛数据强行给出“好/坏”设计结论。当前最可靠的交付结论是：

- PCB/launch/T-cell/Patch 的未加载完整板筛选通过；
- ID 支路对 2.45 GHz RF 可忽略；
- 工件加载模型的几何链路已建立；
- 现有加载时域记录不足，结果无资格进入功率或热设计；
- 脚本已具备自动拦截短记录的机制，后续不会静默误判。
