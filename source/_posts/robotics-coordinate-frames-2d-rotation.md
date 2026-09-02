---
title: 机器人学基础：坐标系与二维旋转
date: 2026-09-03 00:02:41
type: note
series: robotics-fundamentals
tags: [坐标系, 二维旋转, MATLAB, 机器人学基础]
description: 从坐标表示出发推导二维旋转矩阵，辨析主动旋转与坐标系变换，并介绍旋转复合、相对旋转及含平移的二维坐标转换。
mathjax: true
---

机器人需要同时在世界坐标系、机体坐标系和传感器坐标系中描述位置与方向。一个物理点没有改变，并不意味着它的坐标不会改变；一个旋转矩阵形式相同，也不意味着它表达的是同一种旋转。

本文从坐标系的基本含义出发，逐步建立二维旋转与坐标转换的统一认识。全文采用列向量约定，并使用 MATLAB 进行数值验证。

完成本文后，应当能够：

- 解释点与点的坐标之间的区别；
- 读懂 ${}^A\mathbf p_P$、${}^A R_B$ 和 ${}^A\mathbf t_B$ 等记号；
- 推导并使用二维旋转矩阵；
- 区分主动旋转和被动旋转；
- 正确组合多个坐标系之间的旋转；
- 计算两个坐标系之间的相对旋转；
- 完成同时包含旋转和平移的二维坐标转换。

## 1. 所需数学工具

本文需要以下基础工具：

- 二维列向量及向量减法；
- 正弦、余弦、弧度制及三角函数和角公式；
- 矩阵与向量相乘；
- 矩阵乘法的作用顺序；
- 单位矩阵、转置和逆矩阵；
- 内积、单位向量和正交。

后文统一使用逆时针为正方向，并将二维向量写成列向量。

## 2. 坐标系与坐标表示

### 2.1 坐标系是什么

一个二维坐标系 $\{A\}$ 包含：

- 一个原点 $O_A$；
- 一条 $x_A$ 轴；
- 一条 $y_A$ 轴；
- 两条轴各自的正方向。

通常假设两个坐标轴相互垂直，对应的基向量长度均为 1。

坐标系规定了两个问题：

1. 从哪里开始测量；
2. 沿哪些方向测量。

因此，单独给出：

$$
\begin{bmatrix}
2\\3
\end{bmatrix}
$$

并不能完整描述一个位置。只有说明它属于哪个坐标系，这两个数字才有确定的几何意义。

### 2.2 点与点的坐标

设空间中存在一个物理点 $P$。点 $P$ 本身不依赖坐标系，但描述它的数字依赖坐标系。

点 $P$ 在坐标系 $\{A\}$ 中的坐标记为：

$$
{}^A\mathbf p_P=
\begin{bmatrix}
p_x^A\\
p_y^A
\end{bmatrix}
$$

其中：

- 左上角的 $A$ 表示坐标是在 $\{A\}$ 中表达的；
- 下标 $P$ 表示被描述的对象是点 $P$；
- $\mathbf p$ 表示位置向量。

左上角的 $A$ 不是指数。上下文明确时，也可以将 ${}^A\mathbf p_P$ 简写为 ${}^A\mathbf p$。

### 2.3 坐标是一组分解系数

若：

$$
{}^A\mathbf p_P=
\begin{bmatrix}
2\\3
\end{bmatrix}
$$

它表示：

$$
\overrightarrow{O_AP}
=2\mathbf e_x^A+3\mathbf e_y^A
$$

也就是从 $O_A$ 出发，沿 $x_A$ 轴移动 2 个单位，再沿 $y_A$ 轴移动 3 个单位。

坐标 $[2,3]^T$ 本质上是位置向量在一组基向量上的分解系数。当坐标轴方向改变时，用于分解的基向量改变，同一个物理点的坐标也随之改变。

## 3. 原点平移但坐标轴方向不变

考虑坐标系 $\{A\}$ 和 $\{B\}$。暂时假设它们的坐标轴方向完全相同，只有原点位置不同。

若 $O_B$ 在 $\{A\}$ 中的位置为：

$$
{}^A\mathbf p_{O_B}=
\begin{bmatrix}
2\\1
\end{bmatrix}
$$

点 $P$ 在 $\{B\}$ 中的坐标为：

$$
{}^B\mathbf p_P=
\begin{bmatrix}
1\\2
\end{bmatrix}
$$

从 $O_A$ 到 $P$ 可以分成两段：

$$
\overrightarrow{O_AP}
=\overrightarrow{O_AO_B}+\overrightarrow{O_BP}
$$

因为两个坐标系的轴方向相同，所以可以直接将对应坐标相加：

$$
{}^A\mathbf p_P
=
\begin{bmatrix}
2\\1
\end{bmatrix}
+
\begin{bmatrix}
1\\2
\end{bmatrix}
=
\begin{bmatrix}
3\\3
\end{bmatrix}
$$

于是，同一个点具有两组不同坐标：

$$
{}^A\mathbf p_P=
\begin{bmatrix}
3\\3
\end{bmatrix},
\qquad
{}^B\mathbf p_P=
\begin{bmatrix}
1\\2
\end{bmatrix}
$$

如果两个坐标系的轴方向不同，就不能直接相加，因为两组数字对应的测量方向不同。此时需要先使用旋转矩阵统一坐标表达。

## 4. 二维旋转矩阵

先考虑一种明确的情况：坐标系保持不动，向量本身绕原点逆时针旋转角度 $\theta$。

设旋转前后的向量分别为：

$$
\mathbf p=
\begin{bmatrix}
x\\y
\end{bmatrix},
\qquad
\mathbf p'=
\begin{bmatrix}
x'\\y'
\end{bmatrix}
$$

我们希望找到矩阵 $R(\theta)$，使：

$$
\mathbf p'=R(\theta)\mathbf p
$$

### 4.1 从基向量推导旋转矩阵

二维坐标系的单位基向量为：

$$
\mathbf e_x=
\begin{bmatrix}
1\\0
\end{bmatrix},
\qquad
\mathbf e_y=
\begin{bmatrix}
0\\1
\end{bmatrix}
$$

将 $\mathbf e_x$ 逆时针旋转 $\theta$，得到：

$$
\mathbf e_x'=
\begin{bmatrix}
\cos\theta\\
\sin\theta
\end{bmatrix}
$$

$\mathbf e_y$ 原本位于 $90^\circ$ 方向，旋转后位于 $90^\circ+\theta$ 方向，因此：

$$
\mathbf e_y'=
\begin{bmatrix}
\cos(90^\circ+\theta)\\
\sin(90^\circ+\theta)
\end{bmatrix}
=
\begin{bmatrix}
-\sin\theta\\
\cos\theta
\end{bmatrix}
$$

任意向量均可以写成：

$$
\mathbf p=x\mathbf e_x+y\mathbf e_y
$$

旋转后：

$$
\mathbf p'=x\mathbf e_x'+y\mathbf e_y'
$$

代入两个旋转后的基向量：

$$
\mathbf p'
=x
\begin{bmatrix}
\cos\theta\\
\sin\theta
\end{bmatrix}
+y
\begin{bmatrix}
-\sin\theta\\
\cos\theta
\end{bmatrix}
$$

整理为矩阵形式：

$$
\boxed{
R(\theta)=
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix}
}
$$

旋转矩阵的第一列是 $\mathbf e_x$ 旋转后的结果，第二列是 $\mathbf e_y$ 旋转后的结果。这就是两个结果必须按列排列的原因。

### 4.2 坐标计算公式

展开矩阵乘法：

$$
\begin{bmatrix}
x'\\y'
\end{bmatrix}
=
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
$$

得到：

$$
x'=x\cos\theta-y\sin\theta
$$

$$
y'=x\sin\theta+y\cos\theta
$$

### 4.3 特殊角度

不旋转时：

$$
R(0)=I
$$

逆时针旋转 $90^\circ$：

$$
R\left(\frac{\pi}{2}\right)
=
\begin{bmatrix}
0&-1\\
1&0
\end{bmatrix}
$$

顺时针旋转 $90^\circ$：

$$
R\left(-\frac{\pi}{2}\right)
=
\begin{bmatrix}
0&1\\
-1&0
\end{bmatrix}
$$

旋转 $180^\circ$：

$$
R(\pi)=-I
$$

### 4.4 旋转矩阵的基本性质

旋转只改变方向，不改变向量长度，因此：

$$
\|R\mathbf p\|=\|\mathbf p\|
$$

旋转矩阵的两列都是单位向量，并且相互垂直，所以：

$$
R^TR=I
$$

由此得到：

$$
\boxed{R^{-1}=R^T}
$$

二维旋转矩阵还满足：

$$
\det(R)=1
$$

转置矩阵对应相反方向的旋转：

$$
\boxed{R(\theta)^T=R(-\theta)}
$$

## 5. 主动旋转与被动旋转

两种旋转可能使用外形相同的矩阵，但物理含义不同。这是本章最容易混淆的部分。

### 5.1 主动旋转：向量发生旋转

在主动旋转中：

- 坐标系保持不动；
- 物理向量发生旋转；
- 输入与输出是在同一个坐标系中描述的不同向量。

公式为：

$$
\boxed{\mathbf p'=R(\theta)\mathbf p}
$$

例如：

$$
\mathbf p=
\begin{bmatrix}
1\\0
\end{bmatrix}
$$

主动逆时针旋转 $90^\circ$ 后：

$$
\mathbf p'
=R\left(\frac{\pi}{2}\right)\mathbf p
=
\begin{bmatrix}
0\\1
\end{bmatrix}
$$

向量确实从 $x$ 轴正方向转到了 $y$ 轴正方向。

### 5.2 被动旋转：更换坐标系

在被动旋转中：

- 物理向量保持不动；
- 用于描述向量的坐标系发生改变；
- 输入和输出是同一个物理向量的不同坐标表示。

假设固定向量在 $\{A\}$ 中为：

$$
{}^A\mathbf p=
\begin{bmatrix}
1\\0
\end{bmatrix}
$$

坐标系 $\{B\}$ 相对于 $\{A\}$ 逆时针旋转 $90^\circ$。此时：

- $x_B$ 轴指向 $y_A$ 轴正方向；
- $y_B$ 轴指向 $x_A$ 轴负方向。

原向量没有移动，仍然指向 $x_A$ 轴正方向。但从 $\{B\}$ 看，它指向 $y_B$ 轴负方向，因此：

$$
{}^B\mathbf p=
\begin{bmatrix}
0\\-1
\end{bmatrix}
$$

坐标轴逆时针旋转时，固定向量的坐标看起来向相反方向变化。因此：

$$
\boxed{
{}^B\mathbf p=R(-\theta){}^A\mathbf p
}
$$

也可以写成：

$$
{}^B\mathbf p=R(\theta)^T{}^A\mathbf p
$$

### 5.3 为什么两种旋转容易混淆

主动旋转和坐标转换都可能写成“矩阵乘向量”，但需要观察输入和输出的意义。

主动旋转：

$$
\mathbf p'=R(\theta)\mathbf p
$$

- 坐标系不变；
- 输入和输出代表不同的物理向量。

坐标转换：

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

- 物理向量不变；
- 输入和输出是同一向量在不同坐标系中的表示。

因此，不能只看旋转矩阵的数值，必须同时说明谁在旋转，以及向量使用哪个坐标系表达。

## 6. 坐标系旋转矩阵的记号

机器人学中常用：

$$
{}^A R_B
$$

表示将一个在坐标系 $\{B\}$ 中表达的向量，转换为在坐标系 $\{A\}$ 中表达。

因此：

$$
\boxed{
{}^A\mathbf p={}^A R_B{}^B\mathbf p
}
$$

可以把上下标理解为：

$$
{}^{\text{目标坐标系}}R_{\text{来源坐标系}}
$$

即：

$$
{}^A R_B:\quad B\longrightarrow A
$$

### 6.1 矩阵的列表示什么

如果 $\{B\}$ 相对于 $\{A\}$ 逆时针旋转 $\theta$，那么 $B$ 的两个坐标轴在 $A$ 中分别表示为：

$$
{}^A\mathbf e_{x_B}=
\begin{bmatrix}
\cos\theta\\
\sin\theta
\end{bmatrix}
$$

$$
{}^A\mathbf e_{y_B}=
\begin{bmatrix}
-\sin\theta\\
\cos\theta
\end{bmatrix}
$$

因此：

$$
{}^A R_B
=
\begin{bmatrix}
{}^A\mathbf e_{x_B}&{}^A\mathbf e_{y_B}
\end{bmatrix}
=
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix}
$$

判断旋转矩阵方向时，可以直接检查其各列是否确实表示了来源坐标系的轴在目标坐标系中的方向。

### 6.2 反向转换

已知：

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

则：

$$
{}^B\mathbf p
=({}^A R_B)^{-1}{}^A\mathbf p
=({}^A R_B)^T{}^A\mathbf p
$$

定义：

$$
{}^B R_A=({}^A R_B)^T
$$

因此：

$$
\boxed{
{}^B R_A=({}^A R_B)^T
}
$$

## 7. 二维旋转的复合

设向量先旋转 $\theta_1$：

$$
\mathbf p_1=R(\theta_1)\mathbf p
$$

再旋转 $\theta_2$：

$$
\mathbf p_2=R(\theta_2)\mathbf p_1
$$

代入得到：

$$
\boxed{
\mathbf p_2=R(\theta_2)R(\theta_1)\mathbf p
}
$$

离向量最近的矩阵先作用，所以应当从右向左读取旋转顺序。

利用三角函数和角公式可以证明：

$$
\boxed{
R(\theta_2)R(\theta_1)=R(\theta_1+\theta_2)
}
$$

因此，先逆时针旋转 $30^\circ$，再逆时针旋转 $20^\circ$，等价于一次逆时针旋转 $50^\circ$。

绕同一个原点的纯二维旋转是特殊情况，它们可以交换顺序：

$$
R(\theta_2)R(\theta_1)=R(\theta_1)R(\theta_2)
$$

但一般矩阵、包含平移的变换以及三维旋转通常不能交换顺序，所以仍应保持从右向左读取的习惯。

### 7.1 多坐标系转换链

考虑三个坐标系 $\{A\}$、$\{B\}$ 和 $\{C\}$：

$$
{}^B\mathbf p={}^B R_C{}^C\mathbf p
$$

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

将第一式代入第二式：

$$
{}^A\mathbf p
={}^A R_B{}^B R_C{}^C\mathbf p
$$

因此：

$$
\boxed{
{}^A R_C={}^A R_B{}^B R_C
}
$$

可以使用相邻坐标系标记检查顺序：${}^A R_B$ 的来源坐标系是 $B$，${}^B R_C$ 的目标坐标系也是 $B$，所以两段转换能够首尾衔接，最终完成 $C\rightarrow A$ 的转换。这只是检查转换链的记忆方法，不是代数意义上的约分。

## 8. 两个坐标系之间的相对旋转

设 $\{A\}$ 和 $\{B\}$ 相对于世界坐标系 $\{W\}$ 的方向角分别为：

$$
\theta_A,\qquad\theta_B
$$

那么 $\{B\}$ 相对于 $\{A\}$ 的方向角为：

$$
\boxed{
\theta_{B/A}=\theta_B-\theta_A
}
$$

所以：

$$
\boxed{
{}^A R_B=R(\theta_B-\theta_A)
}
$$

### 8.1 从转换链推导

两个坐标系相对于世界坐标系的旋转矩阵分别为：

$$
{}^W R_A=R(\theta_A)
$$

$$
{}^W R_B=R(\theta_B)
$$

转换链满足：

$$
{}^W R_B={}^W R_A{}^A R_B
$$

因此：

$$
{}^A R_B
=({}^W R_A)^{-1}{}^W R_B
$$

旋转矩阵的逆等于转置，所以：

$$
{}^A R_B
=({}^W R_A)^T{}^W R_B
=R(-\theta_A)R(\theta_B)
=R(\theta_B-\theta_A)
$$

例如，$\theta_A=30^\circ$、$\theta_B=70^\circ$ 时，$\{B\}$ 相对于 $\{A\}$ 逆时针旋转了 $40^\circ$。

## 9. 同时包含旋转和平移的坐标转换

现在考虑两个坐标系的原点和方向都不同。

定义：

$$
{}^A\mathbf t_B
={}^A\mathbf p_{O_B}
$$

它表示从 $O_A$ 指向 $O_B$ 的向量，并且使用坐标系 $\{A\}$ 表达。

从 $O_A$ 到点 $P$ 可以分成：

$$
\overrightarrow{O_AP}
=\overrightarrow{O_AO_B}+\overrightarrow{O_BP}
$$

但 ${}^A\mathbf t_B$ 和 ${}^B\mathbf p_P$ 使用不同坐标系表达，不能直接相加。必须先把 ${}^B\mathbf p_P$ 转换到 $\{A\}$：

$$
{}^A R_B{}^B\mathbf p_P
$$

于是得到完整公式：

$$
\boxed{
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P
+{}^A\mathbf t_B
}
$$

这个公式包含两个步骤：

1. 使用 ${}^A R_B$ 将局部向量改用 $\{A\}$ 表达；
2. 加上 $O_B$ 在 $\{A\}$ 中的位置。

可以简称为“先旋转，再平移”。这里的旋转不是说点先在物理空间转了一次，而是先统一向量的坐标表达。

### 9.1 数值演示

设：

$$
{}^A\mathbf t_B=
\begin{bmatrix}
2\\1
\end{bmatrix},
\qquad
{}^A R_B=
\begin{bmatrix}
0&-1\\
1&0
\end{bmatrix}
$$

点 $P$ 在 $\{B\}$ 中为：

$$
{}^B\mathbf p_P=
\begin{bmatrix}
1\\2
\end{bmatrix}
$$

首先统一坐标方向：

$$
{}^A R_B{}^B\mathbf p_P
=
\begin{bmatrix}
-2\\1
\end{bmatrix}
$$

然后加上原点偏移：

$$
{}^A\mathbf p_P
=
\begin{bmatrix}
-2\\1
\end{bmatrix}
+
\begin{bmatrix}
2\\1
\end{bmatrix}
=
\begin{bmatrix}
0\\2
\end{bmatrix}
$$

### 9.2 反向转换

从正向公式开始：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P
+{}^A\mathbf t_B
$$

先减去平移：

$$
{}^A\mathbf p_P-{}^A\mathbf t_B
={}^A R_B{}^B\mathbf p_P
$$

再进行反向旋转：

$$
\boxed{
{}^B\mathbf p_P
=({}^A R_B)^T
\left({}^A\mathbf p_P-{}^A\mathbf t_B\right)
}
$$

反向转换必须先移除原点偏移，再将剩余向量改用 $\{B\}$ 表达。不能把仍在 $\{A\}$ 中表达的平移向量，与已经转换到 $\{B\}$ 的向量直接相减。

## 10. 位置点与方向向量

位置点的坐标转换为：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P
+{}^A\mathbf t_B
$$

方向、速度或两点之间的位移属于自由向量，其转换不包含平移：

$$
\boxed{
{}^A\mathbf v={}^A R_B{}^B\mathbf v
}
$$

原因可以通过两个位置点的差来理解。设：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B
$$

$$
{}^A\mathbf p_Q
={}^A R_B{}^B\mathbf p_Q+{}^A\mathbf t_B
$$

二者相减：

$$
{}^A\mathbf p_Q-{}^A\mathbf p_P
={}^A R_B
\left({}^B\mathbf p_Q-{}^B\mathbf p_P\right)
$$

两个相同的平移项彼此抵消。因此：

- 位置点受坐标系旋转和平移共同影响；
- 方向、位移、速度等自由向量只受坐标轴旋转影响。

## 11. MATLAB 实现与验证

### 11.1 主动旋转

MATLAB 的 `sin` 和 `cos` 默认使用弧度：

```matlab
clear;
clc;

theta = deg2rad(30);

R = [cos(theta), -sin(theta);
     sin(theta),  cos(theta)];

p = [2; 1];
pRotated = R * p;

orthogonalError = norm(R.' * R - eye(2));
lengthError = abs(norm(pRotated) - norm(p));

disp(pRotated);
disp(orthogonalError);
disp(lengthError);
```

如果直接使用角度，可以使用 `sind` 和 `cosd`：

```matlab
thetaDegree = 30;

R = [cosd(thetaDegree), -sind(thetaDegree);
     sind(thetaDegree),  cosd(thetaDegree)];
```

`cos(30)` 中的 30 会被 MATLAB 当作 30 弧度，而不是 $30^\circ$。

### 11.2 相对旋转

```matlab
clear;
clc;

thetaA = deg2rad(30);
thetaB = deg2rad(70);

R_W_A = [cos(thetaA), -sin(thetaA);
         sin(thetaA),  cos(thetaA)];

R_W_B = [cos(thetaB), -sin(thetaB);
         sin(thetaB),  cos(thetaB)];

% 方法一：利用两个旋转矩阵
R_A_B = R_W_A.' * R_W_B;

% 方法二：利用相对角度
thetaRelative = thetaB - thetaA;

R_A_B_direct = ...
    [cos(thetaRelative), -sin(thetaRelative);
     sin(thetaRelative),  cos(thetaRelative)];

errorValue = norm(R_A_B - R_A_B_direct);

disp(rad2deg(thetaRelative));
disp(errorValue);
```

相对角度应为 $40^\circ$，两种方法得到的矩阵应当一致。

### 11.3 旋转加平移

```matlab
clear;
clc;

theta = deg2rad(90);

R_A_B = [cos(theta), -sin(theta);
         sin(theta),  cos(theta)];

t_A_B = [2; 1];
p_P_B = [1; 2];

% 从B转换到A
p_P_A = R_A_B * p_P_B + t_A_B;

% 从A转换回B
p_P_B_recovered = R_A_B.' * (p_P_A - t_A_B);

disp(p_P_A);
disp(p_P_B_recovered);
```

结果应分别为 $[0,2]^T$ 和 $[1,2]^T$。

### 11.4 坐标系与点的可视化

```matlab
clear;
clc;
close all;

theta = deg2rad(45);

R_A_B = [cos(theta), -sin(theta);
         sin(theta),  cos(theta)];

t_A_B = [2; 1];
p_P_B = [1.5; 1];
p_P_A = R_A_B * p_P_B + t_A_B;

% B坐标轴在A坐标系中的方向
xAxisB_A = R_A_B * [1; 0];
yAxisB_A = R_A_B * [0; 1];

figure;
hold on;
axis equal;
grid on;

% 坐标系A
quiver(0, 0, 1, 0, 0, 'r', 'LineWidth', 1.5);
quiver(0, 0, 0, 1, 0, 'g', 'LineWidth', 1.5);
text(0, -0.2, 'O_A');

% 坐标系B
quiver(t_A_B(1), t_A_B(2), ...
       xAxisB_A(1), xAxisB_A(2), 0, ...
       'r--', 'LineWidth', 1.5);

quiver(t_A_B(1), t_A_B(2), ...
       yAxisB_A(1), yAxisB_A(2), 0, ...
       'g--', 'LineWidth', 1.5);

text(t_A_B(1), t_A_B(2) - 0.2, 'O_B');

% 点P
plot(p_P_A(1), p_P_A(2), ...
    'ko', 'MarkerFaceColor', 'k');
text(p_P_A(1) + 0.1, p_P_A(2), 'P');

xlim([-1, 5]);
ylim([-1, 5]);
xlabel('x_A');
ylabel('y_A');
title('二维坐标系之间的位置转换');
```

## 12. 常见错误

### 12.1 混淆主动旋转与坐标变换

先判断真正发生旋转的是向量还是坐标系，再检查输入和输出使用哪个坐标系表达。

### 12.2 忽略向量所属的坐标系

下面的式子通常没有意义：

$$
{}^A\mathbf a+{}^B\mathbf b
$$

两个向量相加前，应先将它们转换到同一个坐标系。

### 12.3 写反旋转矩阵顺序

连续变换从右向左作用。使用带上下标的旋转矩阵时，可以检查相邻坐标系标记是否能够衔接。

### 12.4 反向转换时先旋转再减平移

正确公式是：

$$
{}^B\mathbf p
=({}^A R_B)^T
\left({}^A\mathbf p-{}^A\mathbf t_B\right)
$$

也就是先移除平移，再反向旋转。

### 12.5 给方向向量添加平移

平移影响位置点，不影响方向、速度和位移等自由向量。

### 12.6 混淆角度与弧度

MATLAB 的 `sin` 和 `cos` 使用弧度，`sind` 和 `cosd` 使用角度。

## 13. 公式总结

二维旋转矩阵：

$$
R(\theta)=
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix}
$$

主动旋转：

$$
\mathbf p'=R(\theta)\mathbf p
$$

旋转矩阵的逆：

$$
R^{-1}(\theta)=R^T(\theta)=R(-\theta)
$$

坐标系之间的旋转转换：

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

旋转转换链：

$$
{}^A R_C={}^A R_B{}^B R_C
$$

相对旋转：

$$
{}^A R_B=({}^W R_A)^T{}^W R_B
=R(\theta_B-\theta_A)
$$

含旋转和平移的位置转换：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B
$$

反向位置转换：

$$
{}^B\mathbf p_P
=({}^A R_B)^T
\left({}^A\mathbf p_P-{}^A\mathbf t_B\right)
$$

方向向量转换：

$$
{}^A\mathbf v={}^A R_B{}^B\mathbf v
$$

理解这些公式的关键不是机械记忆正负号，而是始终回答三个问题：被描述的物理对象是什么、它当前使用哪个坐标系表达、最终需要转换到哪个坐标系。
