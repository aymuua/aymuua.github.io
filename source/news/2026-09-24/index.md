---
layout: news-detail
news_issue: true
title: 机器人与 AI 每日观察｜2026-09-24
date: 2026-09-24 10:00:00
---

## 01｜人形机器人借环境支撑，将可用操作力提升至 60 N

### 解读

9 月 21 日提交的论文《Brace Yourself》提出 Supporting Hand Strategy（SHS）：人形机器人用一只手主动抵住墙面或工作台，形成额外支撑接触，另一只手执行推、压等强力操作。方法先根据任务区域和目标力优化支撑构型，再由两个同步强化学习策略分别协调支撑手与工作手，不依赖人体动作数据，也无需在线规划全身轨迹。

作者在 Unitree G1 上报告，采用环境支撑后可用接触力最高达到 60 N；无支撑基线能持续一秒的最大力为 13.5 N。冻结后的同一组策略还可迁移到不同任务区域，无需重新训练。

### 为什么值得关注

这项工作把环境从“需要避开的障碍”转变为可利用的机械支点。对浮动基人形机器人而言，提高强力操作能力不一定只能依赖更大的执行器或更重的机身，也可以通过改变接触拓扑，缩短力的传递链并扩大可用支撑条件。其思路可延伸到工业操作、多接触移动操作和复杂环境中的全身控制。

### 来源

[arXiv：Brace Yourself: Task-Conditioned Environmental Bracing for Forceful Humanoid Manipulation](https://arxiv.org/abs/2609.25486)

## 02｜PAKT 让人工手把手纠错保持在机器人可复现的范围内

### 解读

9 月 22 日提交的 PAKT 研究面向接触丰富的工业强化学习。人工直接拖动机械臂进行示教虽然直观，却可能产生机器人或策略无法复现的速度、加速度和加加速度。PAKT 通过导纳控制把人工施力映射为运动，并在参考轨迹生成阶段使用与策略执行相同的运动学限制，使收集到的纠错轨迹保持物理可执行。

系统还用高频控制栈将低频强化学习动作转换为高频力矩命令。论文在四项插入与工业装配任务上报告，相比 HIL-SERL 基线，端到端周期时间减少 23% 至 48%，累计人工干预次数减少 62% 至 86%。这些结果来自作者的实验报告，仍需更多独立复现来检验其泛化性。

### 为什么值得关注

真机强化学习的瓶颈不仅是算法，也包括怎样收集高质量、可执行的人工纠错。PAKT 把示教接口、物理约束和策略执行层连成一体，减少“人能拖出来、机器人却做不出来”的数据错配。这类设计有望降低真实设备上的试错成本，并让人工干预数据更适合直接用于策略改进。

### 来源

[arXiv：PAKT: Physically-Aligned Kinesthetic Teaching for Reinforcement Learning](https://arxiv.org/abs/2609.25630)

## 03｜微软研究机器人推理卸载：更强算力与网络风险必须一起权衡

### 解读

微软研究院 9 月 23 日发布的系统研究比较了移动操作任务在板载、边缘和云端 GPU 上的推理表现。研究覆盖语义建图与规划、导航、操作三类能力。微软报告称，部分较小 GPU 无法容纳完整移动操作栈；在能运行的设备上，建图与规划相对 A100 最多慢 383%，导航及时发现障碍的能力下降 30%，部分视觉—语言—动作模型的准确率下降 50%。这些数字来自微软自己的测试配置，不能直接外推到所有机器人平台。

微软同时为 Physical AI Toolchain 增加了分布式推理能力，可用容器和 Kubernetes 在机器人、边缘设备与云端之间编排负载。官方也明确指出，卸载并非无条件更优：网络延迟、带宽和可用 GPU 资源都会影响效果，实时控制与安全相关功能仍需谨慎划分部署位置。

### 为什么值得关注

机器人 AI 的实际性能取决于传感、通信、推理、控制和执行器组成的完整链路，而不是单个模型指标。推理卸载可以减轻板载重量、功耗和模型容量限制，却把网络抖动与断连引入系统设计。未来 Physical AI 的竞争很可能同时发生在模型、硬件和分布式系统基础设施三个层面。

### 来源

[Microsoft Research：Offloaded inference for real-world physical AI robotics](https://www.microsoft.com/en-us/research/blog/offloaded-inference-for-real-world-physical-ai-robotics/)

## 04｜Boston Dynamics 在现代汽车工厂启用 Atlas 训练中心

### 解读

Boston Dynamics 9 月 21 日宣布，位于美国佐治亚州 Hyundai Motor Group Metaplant America 园区内的 Robotics Metaplant Application Center（RMAC）第一阶段已经投入运营。该中心把 Atlas 的训练与测试放进真实汽车制造环境，当前任务包括汽车零部件的物流、排序和装配前摆放；公司称计划在 2030 年前扩展到部件装配。

这是一项公司披露的商业化进展。Boston Dynamics 还表示，RMAC 计划于 2027 年迁入面积约为当前十倍的新建筑，并探索制造、航空航天、半导体、物流等行业的训练与数据收集场景。

### 为什么值得关注

把训练中心直接放进工厂，意味着产品开发、任务数据收集、失败分析和部署验证可以形成更短的闭环。人形机器人能否工业化，关键不只是完成一次演示，还包括适应真实工件、生产节拍、安全规范和长期维护要求。RMAC 展示的是从实验室能力走向持续部署体系的一种路径，但其规模化效果仍需以后续实际运行数据验证。

### 来源

[Boston Dynamics：Opens Robotics Metaplant Application Center to Train Humanoid Robots for Manufacturing Tasks](https://bostondynamics.com/news/boston-dynamics-opens-robotics-metaplant-application-center-to-train-humanoid-robots-for-manufacturing-tasks/)

## 05｜IDEAI 用显式意图连接人类目标、环境约束与机器人行动

### 解读

《National Science Review》8 月 6 日在线发表的综述提出 Intent-Driven Embodied Artificial Intelligence（IDEAI），相关研究介绍于 9 月 23 日发布。该框架不把意图等同于提示词、任务或奖励，而是将其表示为可检查、可修改、可验证的中间结构，用来连接人类目标、环境条件、预期后果、执行约束和价值边界。

IDEAI 由语义落地、概念生成与学习、意图建模、价值对齐四个相互作用的层次组成。它是一套系统级组织框架，并非已经完成大规模实验验证的单一算法；作者用七类技术支柱梳理意图在感知、规划、安全和在线学习之间可能被误解或丢失的环节。

### 为什么值得关注

具身系统的错误会直接转化为物理行动，因此仅让端到端策略从观测映射到动作，往往不足以满足高风险场景的可解释与可控要求。显式意图层为重新规划、安全检查、约束执行和人工确认提供了接口。IDEAI 的价值目前主要在于系统架构和研究议程，而不是证明某个机器人已经因此更安全。

### 来源

[National Science Review：Intent-Driven Embodied Artificial Intelligence](https://academic.oup.com/nsr/advance-article/doi/10.1093/nsr/nwag476/8753686)

[EurekAlert：Why embodied AI needs to know what it’s doing—and why](https://www.eurekalert.org/news-releases/1145063)
