# openEMS T-cell 端口与计算量审计 V1

> 日期：2026-09-20
>
> 结论：上一轮粗仿真中出现 S21 > 0 dB，不应首先归咎于 T-cell 理论。当前脚本对 openEMS MSLPort 的端口方向和终止方式存在实质性错误。修复端口后，应先用直通 coupon 验证仿真测量链，再运行 T-cell 三端口。

## 1. 已确认的问题

### 1.1 MSLPort 默认不是 50 Ω 终止

openEMS MSLPort 的 Feed_R 默认值是无穷大，即开路。

旧脚本三个端口都位于计算域内部，却没有设置 Feed_R。它们也没有延伸到吸收边界，因此不是规范的匹配 S 参数端口。

修正：

\[
\boxed{\mathrm{Feed\_R}=50\ \Omega}
\]

所有 calibration network 端口都显式加入 50 Ω 终止。

### 1.2 输出端口方向写反

MSLPort 的 start → stop 决定 propagation direction，进而决定 current probe 符号和 incident/reflected wave decomposition。

规范约定：

\[
\boxed{\text{passive output port: OUTSIDE}\rightarrow\text{DUT}}
\]

这样离开 DUT 的 transmitted wave 才出现在该端口的 uf_ref 中。

旧脚本：

- Port 1：方向基本正确；
- Port 2：DUT → OUTSIDE，反了；
- Port 3：DUT → OUTSIDE，反了。

这会直接污染：

\[
S_{21}=\frac{u_{2,\rm ref}}{u_{1,\rm inc}},
\qquad
S_{31}=\frac{u_{3,\rm ref}}{u_{1,\rm inc}}.
\]

### 1.3 fast profile 不应使用有限长度 sinus 作为正式 S 参数

单频 sinus 可以做 solver smoke test，但当前任务需要同时判断：

- 是否收敛；
- 2.45 GHz 是否处于局部异常；
- S 参数是否满足被动性；
- reference plane 是否稳定。

因此 fast profile 改为 Gaussian pulse，小频带只扫 2.2–2.7 GHz。

---

## 2. 新的仿真层级

新增脚本：

scripts/openems/simulate_tcell_network_coupon.py

不再一上来跑整块 Patch PCB。

### Stage A：thru fixture

仅保留相同 PP/FR4 stackup 和一条 50 Ω 直线：

\[
\text{Port 1}\rightarrow\text{50 Ω line}\rightarrow\text{Port 2}
\]

用途只有一个：

\[
\boxed{\text{验证 openEMS 端口 + mesh + termination}}
\]

粗筛 gate：

\[
S_{11}\le-12\ {\rm dB},
\]

\[
S_{21}\ge-1.5\ {\rm dB},
\]

\[
|S_{11}|^2+|S_{21}|^2\le1.05.
\]

若 thru coupon 失败，禁止调 T-cell PCB。

### Stage B：T-cell coupon

thru 通过以后，使用完全相同的 port fixture，仅把中间直线替换成：

\[
43.37\Omega\text{ series}
+
T
+
50\Omega\text{ through}
+
87.16\Omega\text{ branch}.
\]

输出：

\[
S_{11},S_{21},S_{31},
\]

并自动检查：

\[
\boxed{
|S_{11}|^2+|S_{21}|^2+|S_{31}|^2\le1.05
}
\]

作为 coarse passivity gate。

只有这一关通过后，才比较：

\[
|S_{31}|^2
\]

与理论目标：

\[
\kappa_A=0.2476.
\]

---

## 3. 为什么新的 coupon 计算量更小

旧 calibration network 仍接近完整 50 × 60 mm PCB 模型，并显式保留 35 μm 铜厚。

35 μm 铜厚会迫使 z 方向出现很小 cell，再通过 mesh growth ratio 向外逐层扩张，显著增加 z 网格数。

第一阶段 calibration 并不需要求铜损。2.45 GHz 下 35 μm 铜已经远厚于 skin depth，因此 network coupon 改用：

\[
\boxed{\text{zero-thickness PEC sheet}}
\]

先解决：

- 匹配；
- coupling；
- phase；
- port correctness。

铜导体损耗在主网络闭合以后单独作为 sensitivity sweep 加回。

同时 coupon：

- 不放 Patch；
- 不放 magnetic launch；
- 不跑场 dump；
- 只保留 T-cell 附近 stackup；
- fast 只用 30000 time steps；
- 频带缩为 2.2–2.7 GHz。

因此其目的不是代替最终 full-wave，而是用低成本把网络参数先校准正确。

---

## 4. native MSL impedance 也必须输出

MSLPort 自身可以从局部场的有限差分计算：

\[
Z_{\rm native}
\]

和：

\[
\beta.
\]

新脚本首先使用 native impedance 做一次 CalcPort，然后才重新归一化到系统 50 Ω。

这可以直接检查：

- 当前 3.137 mm 是否真的接近 50 Ω；
- PP 覆盖后 2.9/3.137 mm 的差异；
- coarse mesh 是否已经严重扭曲 line impedance。

如果 native fixture impedance 本身例如只有 40 Ω 或达到 65 Ω，则此时讨论 T-cell coupling 没有意义，应先校准传输线。

---

## 5. 推荐运行顺序

第一步运行：

    python scripts/openems/simulate_tcell_network_coupon.py --dut thru --profile fast --threads 4

只有 summary 中 fixture_valid 为 true，才运行：

    python scripts/openems/simulate_tcell_network_coupon.py --dut tcell --profile fast --threads 4

然后再根据结果决定是否跑：

    --profile verify

不要直接跑完整 production/full PCB。

---

## 6. 当前解释原则

上一轮：

\[
S_{11}=-3.82\ {\rm dB},
\]

\[
S_{21}=+1.05\ {\rm dB},
\]

\[
S_{31}=-9.89\ {\rm dB}
\]

对应功率和约 1.79。

因此它首先说明：

\[
\boxed{\text{S-parameter extraction fixture 无效}}
\]

而不是：

\[
\boxed{\text{T-cell 理论抽取率错误}}
\]

在新 thru fixture 通过之前，不使用旧 -9.89 dB 去重新综合 branch width。
