---
title: 平面腿的机构与驱动选型
date: 2026-08-13 19:00:00
type: note
series: robot-leg-design
tags: [电机选型, 逆动力学, 扭矩计算]
mathjax: true
---

## 1. 机构选型

## 2. 电机选型

### 2.1 选型指标

$$\tau_{peak},\tau_{RMS},\omega_{max},P_{max}$$

分别为峰值扭矩、RMS 扭矩、最大转速、峰值功率。其中 RMS 值（均方根）计算方式为：

$$T_{rms}=\sqrt{\frac{T^2_{1}t_{1}+T^2_{2}t_{2}+\cdots+T_{n}^2t_{n}}{t_{total}}}$$

### 2.2 工况分析

设机总质量为 $M$。

#### 2.2.1 静止站立

两条腿均匀承担整机重量：

$$F_{z,leg}\approx\frac{Mg}{2}$$

但实际会有重心偏移，初步可以按 60% 载荷落在一条腿上：

$$F_{z,leg,max}\approx0.6Mg$$

#### 2.2.2 支撑相（单腿支撑）

一条腿近似承担全部质量：

$$F_{z,leg}\approx Mg$$

行走时还会有垂向加速度和水平加速度，因此实际地面反力为：

$$
\begin{gather*}
&F_{z}=M(g+\ddot{z})\\
&F_{x}=M\ddot{x}
\end{gather*}
$$

#### 2.2.3 起跳

目标跳跃高度为 $h_j$，则离地速度为：

$$v_0 = \sqrt{2gh_{j}}$$

如果蹬地加速时间为 $t_p$，平均地面反力为：

$$\overline{F_z}=M(g+\frac{v_0}{t_p})$$

如果能够测量下蹲至完全蹬伸的有效行程 $s_p$，则可用：

$$\overline{F_z}=M(g+\frac{v_0^2}{2s_p})$$

代入 $v^2_0=2gh_j$：

$$\overline{F_z}=Mg(1+\frac{h_j}{s_p})$$

峰值力为：

$$F_{z,peak}=k_F\overline{F_z}$$

系数可初步估算为：

$$k_F=1.2\sim1.5$$

#### 2.2.4 落地冲击

落地可能产生大的反向扭矩和电流。

**需要检查：**

- 电机是否允许反驱；
- 驱动器是否支持能量回馈或制动电阻；
- 减速器和四连杆是否能承受冲击；
- 电机轴承是否直接承受连杆侧向力。

落地冲击不能简单全部交给电机。Toe 扭簧、脚底弹性、机械限位缓冲和控制减速应该共同承担。

### 2.3 逆动力学

设足端接触力为：

$$\mathbf{F}_c =
\begin{bmatrix}
F_x \\
F_z
\end{bmatrix}$$

髋、踝关节的坐标为：

$$\mathbf{q}=
\begin{bmatrix}
q_h \\
q_a
\end{bmatrix}$$

足端位置向量为 $\mathbf{p}_c$，那么其雅可比：

$$\mathbf{J}_c(\mathbf{q})=\frac{\partial \mathbf{p}_c}{\partial \mathbf{q}}$$

地面反力对应的关节扭矩是：

$$\boldsymbol{\tau}_\mathrm{contact}=-\mathbf{J}_c^T \mathbf{F}_c$$

根据拉格朗日动力学方程：

$$\mathbf{M}(\mathbf{q})\ddot{\mathbf{q}}+\mathbf{C}(\mathbf{q},\dot{\mathbf{q}})\dot{\mathbf{q}}+\mathbf{G}(\mathbf{q})
=\boldsymbol{\tau}_q+\mathbf{J}_c^T \mathbf{F}_c$$

因此所需的主动关节扭矩是：

$$\boxed{\boldsymbol{\tau}_q=\mathbf{M}\ddot{\mathbf{q}}+\mathbf{C}\dot{\mathbf{q}}+\mathbf{G}-\mathbf{J}_c^T \mathbf{F}_c}$$

其中：

$$\boldsymbol{\tau}_q=
\begin{bmatrix}
\tau_h \\
\tau_a
\end{bmatrix}$$

在估算阶段，可以使用力臂形式：

$$\begin{align*}
|\tau_h| \approx \left| F_z d_{hx} + F_x d_{hz} \right|\\
|\tau_a| \approx \left| F_z d_{ax} + F_x d_{az} \right|
\end{align*}$$

其中：

- $d_{hx}$：足端相对于髋关节的水平力臂。
- $d_{hz}$：足端相对于髋关节的垂直力臂。
- $d_{ax}$：足端相对于踝关节的水平力臂。
- $d_{az}$：足端相对于踝关节的垂直力臂。

### 2.4 传动

定义两个电机角度：

$$
\boldsymbol{\theta}_m =
\begin{bmatrix}
\theta_H \\
\theta_A
\end{bmatrix}
$$

关节角和电机角之间存在关系：

$$\boldsymbol{q} = f(\boldsymbol{\theta}_m)$$

定义传动雅可比：

$$\boldsymbol{B}= \frac{\partial \boldsymbol{q}}{\partial \boldsymbol{\theta}_m}$$

那么速度关系为：

$$\dot{\boldsymbol{q}} = \boldsymbol{B}\dot{\boldsymbol{\theta}}_m$$

根据虚功原理，理想情况下的电机扭矩为：

$$\boldsymbol{\tau}_m = \boldsymbol{B}^T \boldsymbol{\tau}_q$$

考虑效率：

$$\boldsymbol{\tau}_{m,\text{required}} \approx \boldsymbol{D}_\eta^{-1}\boldsymbol{B}^T \boldsymbol{\tau}_q$$

$\boldsymbol{D}_\eta^{-1}$ 是对角效率矩阵。

电机角和关节角存在如下关系：

$$\begin{gather*}
q_h = \theta_H \\
q_a = \theta_A - \theta_H
\end{gather*}$$

这时：

$$\boldsymbol{B}=
\begin{bmatrix}
1 & 0 \\
-1 & 1
\end{bmatrix}$$

于是：

$$\begin{bmatrix}
\tau_{mH} \\
\tau_{mA}
\end{bmatrix}
=
\begin{bmatrix}
1 & -1 \\
0 & 1
\end{bmatrix}
\begin{bmatrix}
\tau_h \\
\tau_a
\end{bmatrix}$$

也即：

$$
\begin{gather*}
\tau_{mH} = \tau_h - \tau_a \\
\tau_{mA} = \tau_a
\end{gather*}$$

### 2.5 计算选型指标

#### 2.5.1 峰值扭矩

完成一个完整的站立、单腿支撑、摆腿、下蹲、起跳、落地运动周期后，得到每台电机扭矩曲线：

$$\tau_m(t)$$

峰值扭矩：

$$\tau_\mathrm{peak}= \max_{t}\left|\tau_m(t)\right|$$

乘以裕度：

$$\tau_{\mathrm{motor},\mathrm{peak}} \ge 1.3 \sim 1.8\,\tau_{\mathrm{calculated},\mathrm{peak}}$$

#### 2.5.2 RMS 扭矩

$$\tau_\mathrm{RMS}=
\sqrt{\frac{1}{T}\int_{0}^{T}\tau_m^2(t)\,\mathrm{d}t}$$

离散数据可以写成：

$$\tau_\mathrm{RMS}=
\sqrt{\frac{\sum_i \tau_i^2 \Delta t_i}{\sum_i \Delta t_i}}$$

乘以裕度：

$$\tau_{\mathrm{continuous},\mathrm{rated}} \ge 1.2 \sim 1.5\,\tau_\mathrm{RMS}$$

## 3. 结构标准件选型
