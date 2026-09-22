# Full Engineering Board V2：ID 支路 RF 敏感性 V1

> 日期：2026-09-21
>
> 目的：在 Full V2 fast board 已通过 `open` 状态筛选后，比较 RF-only、保留 ID 铜但电阻开路、以及显式 10 kΩ lumped resistor 三种状态，判断 ID 结构是否需要进入后续 RF 几何优化。

## 1. 仿真范围

三种状态使用同一套 Full Engineering Board V2 几何、2.45 GHz FR4/PP stack、零厚度 PEC 铜、共面顶层 signal-to-ground lumped ports 和 `fast` profile：

| 状态 | RF 模型 |
|---|---|
| `off` | 完全删除 ID 铜 |
| `open` | 保留 ID pad/trace，电阻 gap 开路 |
| `10k` | 保留 ID pad/trace，在 gap 放入 10 kΩ lumped series element |

复现命令（使用仓库 openEMS venv）：

```text
/home/ubuntu/opt/openEMS/venv/bin/python scripts/openems/simulate_full_v2_fast.py --profile fast --id-mode off --threads 4
/home/ubuntu/opt/openEMS/venv/bin/python scripts/openems/simulate_full_v2_fast.py --profile fast --id-mode 10k --threads 4
```

已有 `fast/open` 结果与新结果由以下文件直接比较：

- `results/openems_full_v2_fast/full_v2_fast_off_summary.json`
- `results/openems_full_v2_fast/full_v2_fast_open_summary.json`
- `results/openems_full_v2_fast/full_v2_fast_10k_summary.json`

## 2. 2.45 GHz 结果

| 指标 | `off` | `open` | `10k` |
|---|---:|---:|---:|
| S11 (dB) | -19.3715 | -19.3383 | -19.3389 |
| S21 (dB) | -12.4839 | -12.4913 | -12.4913 |
| VSWR | 1.24091 | 1.24194 | 1.24192 |
| non-through accepted fraction | 0.932000 | 0.932008 | 0.932009 |
| VSWR≤2 带宽 | 300 MHz | 300 MHz | 300 MHz |
| screen gate | true | true | true |

这里的 `non-through accepted fraction` 仍不是工件吸收功率；它包含 Patch 辐射、介质损耗和其它离开二端口的功率。

## 3. 敏感性结论

在 2.45 GHz：

| 差分 | ΔS11 | ΔS21 | ΔVSWR | Δnon-through |
|---|---:|---:|---:|---:|
| `open - off` | +0.0332 dB | -0.00742 dB | +0.00103 | +7.83×10⁻⁶ |
| `10k - open` | -0.000545 dB | +0.000024 dB | -0.000017 | +1.15×10⁻⁶ |

在整个 2.30–2.60 GHz fast 扫频内，`open - off` 的最大绝对变化也只有：

- S11：0.0341 dB；
- S21：0.00750 dB；
- VSWR：0.00108；
- non-through fraction：2.13×10⁻⁵。

因此当前结论为：

\[
\boxed{\text{ID 铜与 10 kΩ 电阻对 Full V2 的 2.45 GHz RF 筛选可忽略。}}
\]

后续 RF 参数优化可以固定使用 `id-mode open`，无需每个候选重复跑 `10k`。`10k` 仅在 ID 走线位置、接触 pad 或产品封装发生明显变化时重新抽查。

## 4. 收敛口径

两次新仿真均在 `fast` profile 的 28,000 steps 达到步数上限，openEMS 报告尚未达到 -30 dB end criterion。结果仍满足：

- 被动性：`|S11|² + |S21|² ≤ 1`；
- S11 ≤ -10 dB；
- VSWR≤2 带宽 ≥ 50 MHz。

所以本轮结果适合作为 ID sensitivity screen，不应替代最终 loaded-workpiece verify。对于后续正式频响结论，应提高 time steps 或单独运行更长的 verify profile，并检查端口频域结果随收敛时间的变化。

## 5. 下一项仿真

Full V2 `screen/open` 已通过，且 ID sensitivity 已被排除为主要误差源。下一项最有信息量的工作是把真实加载引入 Patch 上方：

```text
Patch → 2 mm front PP → air gap → finite lossy workpiece
```

首轮应固定代表工件：

\[
\varepsilon'_r=10,\qquad \tan\delta=0.2,
\]

并扫描 `air gap = 0, 5, 10, 20 mm`，同时提取 S11、S21、工件体内吸收功率和 loaded resonance。只有得到该加载结果后，才应重新判断 Patch 长度、T-cell branch extraction 和单板有用功率。
