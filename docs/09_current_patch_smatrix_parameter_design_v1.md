# 当前 Patch 方案：复数 S 参数理论与第一轮参数设计 V1

> 本文只针对仓库当前真正采用的设计路线：
>
> \\\[
\boxed{
\text{若 side-coupled seed 无法同时达到约 3 dB coupling 和高 return loss，直接切换 hybrid / matched divider。}
}
\]

PCB 代码现在的任务是让 A/B/C/D 设计空间、端口角色和 Gerber/Circuit JSON 交付链路先一致，不能把代码里的 seed 尺寸写成已经完成的电磁优化结果。
