# micro_wave 当前情况

> 更新时间：2026-09-22  
> 当前主线：`main` @ `2e478df29fb07fb03904a909d1c13fc03a340828`
>
> 这份文档只回答一个问题：**项目现在真实做到哪一步了。**
>
> 它不是需求书，不是理论总纲，也不把历史方案当成当前目标。后续如果仓库状态发生实质变化，应优先更新本文。

---

## 1. 一句话结论

当前项目已经有一块完整的 **Full Engineering Board V2** 工程 PCB，并且完成了可信的 T-cell coupon 验证、完整板空载 RF 筛选和 ID 支路敏感性检查。

但是当前还不能说“单板已经实现 5–8 W 有效取能”，也不能说“4 板 Zone 或 5/25/100 板系统已经闭合”。

现在真正没有闭合的是：

1. Full V2 输入功率到底分到 through、Patch、介质损耗、辐射和工件吸收中的哪一部分；
2. loaded-workpiece 仿真目前时域记录不足，工件吸收功率还没有可信结果；
3. A/B/C/D 的真实 extraction 还没有基于 loaded Patch 重新闭合；
4. bridge / cable-tab / 5-25-100 系统链已经在 PR #22 开发，但还没有合入 main，也没有形成最终 S 参数验证；
5. 500 W 实物、热、打火、触点温升和真实加热测试还没有开始。

所以当前项目处于：

[
oxed{	ext{工程 PCB + 单件 RF 验证阶段，系统功率闭环尚未完成}}
]

---

## 2. 当前主线到底有什么

### 2.1 Full Engineering Board V2

当前主 PCB：

`pcb/tscircuit/index-full-v2.tsx`

当前结构：

- 50 × 60 mm；
- FR4 1.6 mm；
- front PP 2 mm；
- bottom full ground；
- RF IN / RF OUT 磁吸 signal + GND 接口；
- surrogate-calibrated V2 T-cell；
- rectangular Patch；
- 10 kΩ / 0603 ID resistor；
- ID IN / ID OUT；
- RF 走线、回流过孔、Patch、ID 链已经落到完整工程板。

这块板现在是 **engineering candidate**，不是 manufacturing freeze。

原始“50 × 50 mm + 方形螺旋线圈”不再作为当前主设计。若以后必须恢复该结构，应当作为独立 variant 重新设计，不能把它和 Full V2 的结果混在一起。

### 2.2 PCB 工程状态

Full V2 已经完成现有 tscircuit 工程检查链：

```text
netlist
-> placement
-> build
-> shorts
-> Gerber / Circuit JSON / PCB-SVG / 3D preview
```

这说明当前 PCB 在 CAD/连接关系层面已经是完整工程候选。

它不等于 RF 功能已经最终通过，也不等于可以直接量产。

---

## 3. 当前最可信的 RF 结果

### 3.1 T-cell coupon

修正 openEMS MSL port fixture 后，当前可信的 T-cell 核心结果为：

[
S_{11}approx -26.81 {m dB}
]

[
S_{21}approx -2.285 {m dB},qquad
S_{31}approx -7.800 {m dB}
]

conditional branch split 约：

[
21.9%
]

当前 A-stage 理论 extraction seed 约：

[
24.76%
]

因此可以认为：

**T-cell 核心拓扑已经有可信 full-wave 支撑，但还没有和真实 loaded Patch 功率闭合。**

### 3.2 Full V2 空载完整板

2.45 GHz 当前结果：

| 工况 | S11 | S21 | VSWR | 当前含义 |
|---|---:|---:|---:|---|
| fast / ID open | -19.338 dB | -12.491 dB | 1.242 | 空载工程筛选可用 |
| screen / ID open | -17.153 dB | -11.688 dB | 1.322 | 空载工程筛选可用 |

需要特别注意：

**这里的“通过”只表示当前匹配门、被动性门和数据质量门通过，不表示 Zone 功率功能已经通过。**

screen/open 的 through power 为：

[
|S_{21}|^2approx 6.78%
]

而当前 A-stage loss-aware 理论里，到下一块板参考面应该保留的功率量级约为：

[
rac{P_B}{P_A}approx 66%
]

两者并不在同一量级。

因此当前 Full V2 最大的问题不是 S11 不够好，而是：

[
oxed{	ext{大部分输入功率去了哪里，目前还没有被单独观测出来}}
]

这部分功率不能直接写成 Patch 取能，更不能写成工件吸收。

---

## 4. ID 支路状态

Full V2 已经比较：

- ID copper off；
- ID copper open；
- 显式 10 kΩ。

2.45 GHz 下 `open - off`：

- ΔS11 ≈ +0.033 dB；
- ΔS21 ≈ -0.007 dB。

`10k - open` 更小。

当前可以认为：

[
oxed{	ext{现有 ID 铜和 10 kΩ 对 Full V2 RF 筛选影响可忽略}}
]

所以后续 RF 优化不需要每次重复跑 10 kΩ，可以继续用 `id-mode open` 做主筛选。

---

## 5. loaded-workpiece 到哪一步了

当前已经建立：

```text
Patch
-> 2 mm front PP
-> air gap
-> finite lossy workpiece
```

代表工件参数：

[
arepsilon_r'=10,qquad 	andelta=0.2,qquad t=20 {m mm}
]

也已经有 0 / 5 / 10 / 20 mm gap 的试算记录。

但这些 loaded 结果现在 **不能用于设计判断**。

5 mm gap 不同 profile 的端口记录：

| profile | S11 | S21 | 最短时窗 | 判定 |
|---|---:|---:|---:|---|
| smoke | -19.236 dB | -45.140 dB | 0.318 ns | 不可用 |
| loaded | -33.437 dB | -85.574 dB | 0.182 ns | 不可用 |
| fast 中断记录 | -25.014 dB | -300 dB | 0.045 ns | 不可用 |

同一几何跨 profile 漂移很大，说明频域结果还没有收敛。

因此目前不能把：

[
1-|S_{11}|^2-|S_{21}|^2
]

解释为工件吸收率。

当前脚本已经增加 data-quality gate，可以自动把这些短时窗结果标成：

`insufficient-time-record`

这是正确状态。

---

## 6. bridge / cable / 5-25-100 系统链现在是什么状态

这部分已经在 **PR #22 — Complete bridge, cable-tab and 5/25/100 delivery chain** 开发，但截至本文更新时间仍未合入 main。

PR #22 已包含：

- 100 × 50 mm flat bridge PCB；
- corner bridge PCB；
- 30 × 50 mm cable magnetic tab；
- 三类连接件的 openEMS 建模脚本；
- RG142 / replacement-cable loss calculator；
- 5 / 25 / 100 zoned power-budget calculator；
- 静态几何检查；
- tscircuit / CI 验证。

因此这部分准确状态不是“还没做”，而是：

[
oxed{	ext{工程实现已在分支完成，最终验证和主线合并未完成}}
]

### 6.1 5 / 25 / 100 当前预算结果

PR #22 中已有一份 **假设性预算**：

- mean board power = 6.5 W；
- upstream loss = 0.8 dB；
- zone efficiency = 80%；
- zone profile = ([1, 0.6412, 0.6412, 1])。

在这些假设下：

| 板数 | 单板范围 | 最大偏差 | 估算 source power | 500 W 内 |
|---:|---:|---:|---:|---|
| 5 | 5.08–7.92 W | 21.86% | 48.84 W | 是 |
| 25 | 5.08–7.92 W | 21.86% | 244.21 W | 是 |
| 100 | 5.08–7.92 W | 21.86% | 976.84 W | 否 |

这只是 budget calculator 的演示结果，不是已验证能力。

尤其 100 块时：

[
100	imes 5 {m W}=500 {m W}
]

已经等于源最大功率，因此只要系统存在任何损耗，“500 W 输入同时保证 100 块都至少 5 W”就不可能成立。

### 6.2 RG142 5 m

PR #22 对 RG142 的估算：

[
	ext{loss}approx0.707 {m dB/m}
]

所以 5 m cable-only：

[
oxed{3.54 {m dB}}
]

还没有计 N connector 和 magnetic tab。

因此“RG142 + 5 m 总插损 ≤ 0.5 dB”不能继续作为同时成立的约束。

---

## 7. 两个未合并 PR 要怎么理解

### PR #22

作用：补齐 bridge、cable-tab、5/25/100 network chain。

当前评价：

- CAD/脚本/预算链已经做出来；
- 但 bridge/tab 的最终全波 S 参数还没有形成可信验收结果；
- 系统预算里的损耗和效率仍有假设项；
- 应在单件 S 参数可信后再替换预算参数。

### PR #23

作用：修正 Full V2 power-flow 的物理解读。

这个 PR 提出的核心判断应继续保留：

- 低 S11 不等于功率分配正确；
- `1-|S11|²-|S21|²` 不能叫“吸收功率”；
- Full V2 当前 through power 只有约 6.78%；
- 当前 A-stage 到下一板的目标量级约 66%；
- 下一步应优先做 power decomposition，而不是继续盲调 S11。

PR #23 目前未合并，但这部分物理判断与 main 最新 loaded-workpiece 结果并不冲突。

---

## 8. 当前真正的技术阻塞

现在最需要解决的不是“再画一块 PCB”，而是下面这条链：

[
oxed{
	ext{launch reference}
ightarrow
	ext{power decomposition}
ightarrow
	ext{Patch accepted power}
ightarrow
	ext{workpiece absorbed power}
ightarrow
	ext{re-synthesize }A/B/C/D
ightarrow
	ext{4-board Zone}
ightarrow
	ext{5/25/100 network}
}
]

具体来说：

1. **先做 through/launch reference**  
   删除 branch 和 Patch，只保留两侧接口、through line、ground 和相同边界，确认 launch 本身不是主要漏功率来源。

2. **把 branch / Patch 功率变成可观测量**  
   不能只看二端口 S11/S21。需要显式 branch termination、field/Poynting monitor 或功率积分。

3. **重新跑一个可信 loaded 代表点**  
   先做 5 mm gap，强制足够时窗并做 1 ns / 2 ns / 更长记录稳定性比较。

4. **对工件体积做损耗积分**  
   得到真正的：
   [
   P_{m abs,workpiece}
   ]
   再谈单板 5–8 W。

5. **根据 loaded 结果重新综合 A/B/C/D**  
   现在 24.76% 等 extraction 仍是 reduced-order target，不能直接当最终 loaded-board 实现值。

6. **再合 bridge/cable 的真实 S 参数**  
   把 PR #22 的假设损耗替换成 full-wave / 实测结果。

7. **最后跑 5 / 25 / 100 network**  
   到这一步才有资格给客户写每板功率范围、±25%、最大可支持板数和 500 W feasibility。

---

## 9. 现在可以说什么 / 不能说什么

### 可以说

- T-cell 核心 topology 已有可信 full-wave 验证；
- Full V2 完整工程 PCB 已完成并通过现有 PCB 检查；
- Full V2 空载匹配和基础 RF screen 没有明显失效；
- ID 支路对 2.45 GHz RF 的影响很小；
- loaded-workpiece 几何链已经建立；
- loaded 数据质量问题已经被识别，并增加了自动质量门；
- bridge / cable-tab / 5-25-100 工程链已经在 PR #22 中实现；
- 当前已经知道 100 块 × 5 W 在 500 W 源下没有任何系统损耗余量。

### 现在不能说

- “Full V2 已经功能性通过”；
- “当前单板已经稳定取 5–8 W”；
- “91% non-through 就是 Patch/工件吸收”；
- “4 板 Zone 已闭合”；
- “5 / 25 / 100 已通过真实系统验证”；
- “bridge 已达到 0.2 / 0.3 dB”；
- “RG142 5 m 可以做到 0.5 dB”；
- “500 W 可以保证 100 块每块至少 5 W”；
- “当前文件已经 manufacturing freeze”。

---

## 10. 当前文件入口

### 当前主状态

- `docs/00_current_status.md` — **当前唯一项目现状入口**

### 单板与仿真

- `pcb/tscircuit/index-full-v2.tsx`
- `docs/26_openems_port_fixture_audit_v1.md`
- `docs/27_fast_tcell_design_loop_v1.md`
- `docs/28_full_v2_fast_em_v1.md`
- `docs/29_full_v2_id_sensitivity_v1.md`
- `docs/30_full_v2_loaded_simulation_closure_v1.md`
- `scripts/openems/simulate_full_v2_fast.py`

### 系统链（PR #22，未合并）

- `pcb/tscircuit/index-flat-bridge.tsx`
- `pcb/tscircuit/index-corner-bridge.tsx`
- `pcb/tscircuit/index-cable-tab.tsx`
- `scripts/openems/simulate_connection_hardware.py`
- `scripts/system/cable_model.py`
- `scripts/system/cascade_power_budget.py`

---

## 11. 下一次什么时候更新本文

只有在下面任意一项发生后才需要改“当前情况”：

- Full V2 power decomposition 得到可信结果；
- 5 mm loaded representative point 收敛；
- 得到工件真实 absorbed power；
- A/B/C/D 重新综合完成；
- PR #22 合并；
- bridge/tab 获得可信 S 参数；
- 5/25/100 网络使用真实损耗重新计算；
- 进入加工冻结或实物测试。

不要因为又多跑了一次局部 sweep 就新建一份“总状态文档”。
