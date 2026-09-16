---
title: 机器人学基础：姿态表示
date: 2026-09-16 11:09:48
type: note
series: robotics-fundamentals
tags: [姿态表示, 欧拉角, 四元数, MATLAB, 机器人学基础]
description: 系统介绍RPY角、万向节锁、轴角、Rodrigues公式和四元数，并给出常用姿态转换方法及MATLAB实现。
mathjax: true
---

三维旋转矩阵可以完整描述物体姿态，但它使用 9 个元素，并且必须满足正交约束。实际机器人系统还会根据任务需要使用 RPY 角、轴角和四元数。它们描述的是同一个三维姿态，只是参数形式、数值性质和适用场景不同。

本文采用以下统一约定：

- 使用右手坐标系；
- 向量写成列向量；
- 旋转正方向遵循右手定则；
- 旋转矩阵主动作用于向量；
- RPY 采用 $R=R_z(\psi)R_y(\theta)R_x(\phi)$；
- 四元数采用标量在前的 $[w,x,y,z]^T$ 顺序。

完成本文后，应当能够：

- 根据 RPY 角构造旋转矩阵；
- 从旋转矩阵提取 RPY 角并解释万向节锁；
- 使用轴角和 Rodrigues 公式描述任意轴旋转；
- 使用单位四元数表示、组合和执行旋转；
- 在旋转矩阵、RPY、轴角和四元数之间进行转换；
- 根据具体任务选择合适的姿态表示。

## 1. 前置知识与基本约定

### 1.1 三个基本旋转矩阵

绕 $x$、$y$、$z$ 轴的主动旋转矩阵分别为：

$$
R_x(\alpha)=
\begin{bmatrix}
1&0&0\\
0&\cos\alpha&-\sin\alpha\\
0&\sin\alpha&\cos\alpha
\end{bmatrix}
$$

$$
R_y(\beta)=
\begin{bmatrix}
\cos\beta&0&\sin\beta\\
0&1&0\\
-\sin\beta&0&\cos\beta
\end{bmatrix}
$$

$$
R_z(\gamma)=
\begin{bmatrix}
\cos\gamma&-\sin\gamma&0\\
\sin\gamma&\cos\gamma&0\\
0&0&1
\end{bmatrix}
$$

合法旋转矩阵满足：

$$
R^TR=I,\qquad R^{-1}=R^T,\qquad \det(R)=1
$$

### 1.2 三维旋转具有顺序性

对于列向量，矩阵从右向左作用。例如，先绕固定 $x$ 轴旋转 $\alpha$，再绕固定 $y$ 轴旋转 $\beta$，最后绕固定 $z$ 轴旋转 $\gamma$：

$$
R=R_z(\gamma)R_y(\beta)R_x(\alpha)
$$

绕不同轴的三维旋转通常不能交换顺序：

$$
R_xR_y\neq R_yR_x
$$

因此，任何欧拉角都必须同时说明旋转轴、旋转顺序，以及使用固定轴还是运动轴。

### 1.3 `atan2` 与矩阵的迹

提取姿态角时应优先使用：

$$
\theta=\operatorname{atan2}(y,x)
$$

而不是简单使用 $\arctan(y/x)$。`atan2` 可以根据 $x,y$ 的符号区分象限，并能处理 $x=0$。

矩阵的迹是主对角线元素之和：

$$
\operatorname{tr}(R)=r_{11}+r_{22}+r_{33}
$$

后面会用它从旋转矩阵提取轴角。

## 2. 欧拉角与 RPY 角

欧拉角的基本思想，是把一个三维姿态分解成三次依次进行的基本旋转。它使用 3 个角度，因此表示紧凑，但高度依赖旋转约定。

### 2.1 两类欧拉角

正规欧拉角的第一次和第三次旋转使用同一根轴，例如：

$$
ZXZ,\qquad ZYZ,\qquad XYX
$$

Tait–Bryan 角的三次旋转使用三根不同的轴，例如：

$$
XYZ,\qquad ZYX,\qquad YXZ
$$

机器人学和航空航天中常用的 Roll–Pitch–Yaw 属于 Tait–Bryan 角。

### 2.2 RPY 角的含义

本文记：

- Roll 为 $\phi$，对应 $x$ 轴旋转；
- Pitch 为 $\theta$，对应 $y$ 轴旋转；
- Yaw 为 $\psi$，对应 $z$ 轴旋转。

采用固定轴解释时，依次执行：

$$
x\rightarrow y\rightarrow z
$$

即先 Roll，再 Pitch，最后 Yaw。因为矩阵从右向左作用，所以组合矩阵为：

$$
\boxed{
R=R_z(\psi)R_y(\theta)R_x(\phi)
}
$$

虽然矩阵从左到右写成 $Z-Y-X$，实际固定轴执行顺序是 $X-Y-Z$。

### 2.3 固定轴与运动轴

同一个矩阵：

$$
R=R_z(\psi)R_y(\theta)R_x(\phi)
$$

还可以解释为依次绕运动轴旋转：

$$
Z\rightarrow Y'\rightarrow X''
$$

其中 $Y'$ 是第一次旋转后的局部 $y$ 轴，$X''$ 是前两次旋转后的局部 $x$ 轴。因此：

$$
\boxed{
\text{固定轴 }XYZ
\quad\Longleftrightarrow\quad
\text{运动轴 }ZYX
}
$$

在本文的列向量和主动旋转约定下：

- 绕固定轴增加旋转时，新旋转矩阵左乘；
- 绕运动轴增加旋转时，新旋转矩阵右乘。

例如，绕运动轴依次执行 $z,y,x$：

$$
R_1=R_z(\psi)
$$

$$
R_2=R_1R_y(\theta)
$$

$$
R_3=R_2R_x(\phi)
$$

最终仍为：

$$
R_3=R_z(\psi)R_y(\theta)R_x(\phi)
$$

### 2.4 RPY 旋转矩阵

为简化表达，记：

$$
c_\phi=\cos\phi,\qquad s_\phi=\sin\phi
$$

其他角度使用相同记法。展开 RPY 矩阵可得：

$$
\boxed{
R=
\begin{bmatrix}
c_\psi c_\theta&
c_\psi s_\theta s_\phi-s_\psi c_\phi&
c_\psi s_\theta c_\phi+s_\psi s_\phi
\\
s_\psi c_\theta&
s_\psi s_\theta s_\phi+c_\psi c_\phi&
s_\psi s_\theta c_\phi-c_\psi s_\phi
\\
-s_\theta&
c_\theta s_\phi&
c_\theta c_\phi
\end{bmatrix}
}
$$

不建议死记整个展开矩阵。真正需要记住的是：

$$
R=R_z(\psi)R_y(\theta)R_x(\phi)
$$

### 2.5 MATLAB 构造 RPY 旋转矩阵

```matlab
clear;
clc;

roll  = deg2rad(20);
pitch = deg2rad(30);
yaw   = deg2rad(40);

Rx = [1, 0, 0;
      0, cos(roll), -sin(roll);
      0, sin(roll),  cos(roll)];

Ry = [ cos(pitch), 0, sin(pitch);
      0, 1, 0;
      -sin(pitch), 0, cos(pitch)];

Rz = [cos(yaw), -sin(yaw), 0;
      sin(yaw),  cos(yaw), 0;
      0, 0, 1];

R = Rz * Ry * Rx;

orthogonalError = norm(R.' * R - eye(3));
determinantValue = det(R);
```

正常情况下：

$$
R^TR\approx I,\qquad \det(R)\approx1
$$

## 3. 从旋转矩阵提取 RPY 角

设：

$$
R=
\begin{bmatrix}
r_{11}&r_{12}&r_{13}\\
r_{21}&r_{22}&r_{23}\\
r_{31}&r_{32}&r_{33}
\end{bmatrix}
$$

### 3.1 非奇异情况下的提取公式

由 RPY 矩阵可知：

$$
r_{31}=-\sin\theta
$$

如果将 Pitch 主值范围规定为：

$$
-\frac{\pi}{2}\leq\theta\leq\frac{\pi}{2}
$$

可以使用：

$$
\boxed{
\theta=
\operatorname{atan2}
\left(
-r_{31},
\sqrt{r_{11}^2+r_{21}^2}
\right)
}
$$

当 $\cos\theta\neq0$ 时：

$$
r_{32}=\cos\theta\sin\phi,qquad
r_{33}=\cos\theta\cos\phi
$$

因此：

$$
\boxed{
\phi=\operatorname{atan2}(r_{32},r_{33})
}
$$

同理：

$$
r_{21}=\sin\psi\cos\theta,qquad
r_{11}=\cos\psi\cos\theta
$$

所以：

$$
\boxed{
\psi=\operatorname{atan2}(r_{21},r_{11})
}
$$

综合得到：

$$
\boxed{
\begin{aligned}
\phi&=\operatorname{atan2}(r_{32},r_{33})\\
\theta&=\operatorname{atan2}
\left(-r_{31},\sqrt{r_{11}^2+r_{21}^2}\right)\\
\psi&=\operatorname{atan2}(r_{21},r_{11})
\end{aligned}
}
$$

### 3.2 万向节锁

当：

$$
\theta=\pm\frac{\pi}{2}
$$

有：

$$
\cos\theta=0
$$

于是：

$$
r_{11}=r_{21}=r_{32}=r_{33}=0
$$

Roll 和 Yaw 的提取公式均退化为 `atan2(0,0)`，无法分别求解。这就是万向节锁。

从运动轴的角度看，当 Pitch 达到 $\pm90^\circ$ 时，最终的 Roll 轴与初始 Yaw 轴共线。原本独立的两根旋转轴变成同一条轴，因此只能观察到两个角度的组合效果。

需要特别注意：万向节锁是欧拉角参数化的奇异性，并不是物体在物理空间中真的失去旋转能力。

### 3.3 矩阵为什么不能区分 Roll 和 Yaw

当：

$$
\theta=\frac{\pi}{2}
$$

旋转矩阵变为：

$$
R=
\begin{bmatrix}
0&\sin(\phi-\psi)&\cos(\phi-\psi)\\
0&\cos(\phi-\psi)&-\sin(\phi-\psi)\\
-1&0&0
\end{bmatrix}
$$

矩阵只依赖：

$$
\phi-\psi
$$

而不再分别依赖 $\phi$ 和 $\psi$。只要保持 $\phi-\psi$ 不变，多组 RPY 角就会产生完全相同的旋转矩阵。

当：

$$
\theta=-\frac{\pi}{2}
$$

矩阵只依赖 $\phi+\psi$，同样无法分别恢复两个角度。

### 3.4 奇异位置的处理

万向节锁位置通常人为固定一个角度，例如令：

$$
\phi=0
$$

再由剩余矩阵元素计算一个等效 Yaw：

$$
\psi=\operatorname{atan2}(-r_{12},r_{22})
$$

这只是一种约定，不表示真实 Roll 一定为零。不同软件可能选择不同约定，因此可能返回不同的欧拉角，但仍对应相同姿态。

### 3.5 MATLAB 提取函数

```matlab
function rpy = rotmToRpyZYX(R)
    % 输出顺序：[roll; pitch; yaw]

    tolerance = 1e-9;

    pitch = atan2( ...
        -R(3,1), ...
        hypot(R(1,1), R(2,1)) ...
    );

    if abs(cos(pitch)) > tolerance
        roll = atan2(R(3,2), R(3,3));
        yaw  = atan2(R(2,1), R(1,1));
    else
        % 万向节锁：人为令roll为0
        roll = 0;
        yaw = atan2(-R(1,2), R(2,2));
    end

    rpy = [roll; pitch; yaw];
end
```

即使没有恰好达到万向节锁，只要 $|\cos\theta|$ 很小，RPY 提取也会变得非常敏感。旋转矩阵的微小扰动可能引起 Roll 和 Yaw 的大幅变化。

## 4. 轴角表示

轴角表示使用一根单位旋转轴和一个旋转角描述姿态：

$$
(\mathbf u,\theta)
$$

其中：

$$
\mathbf u=
\begin{bmatrix}
u_x\\u_y\\u_z
\end{bmatrix},qquad
\|\mathbf u\|=1
$$

按照右手定则，绕 $\mathbf u$ 旋转角度 $\theta$，就能表示任意三维旋转。

轴角具有以下等价关系：

$$
(\mathbf u,\theta)
\equiv
(-\mathbf u,-\theta)
$$

以及：

$$
(\mathbf u,\theta)
\equiv
(\mathbf u,\theta+2k\pi)
$$

通常将旋转角限制为：

$$
0\leq\theta\leq\pi
$$

当 $\theta=0$ 时没有发生旋转，此时旋转轴可以是任意方向。

### 4.1 叉积的反对称矩阵

定义：

$$
[\mathbf u]_\times=
\begin{bmatrix}
0&-u_z&u_y\\
u_z&0&-u_x\\
-u_y&u_x&0
\end{bmatrix}
$$

它满足：

$$
\boxed{
[\mathbf u]_\times\mathbf v
=\mathbf u\times\mathbf v
}
$$

并且：

$$
[\mathbf u]_\times^T=-[\mathbf u]_\times
$$

### 4.2 向量的平行与垂直分解

设待旋转向量为 $\mathbf v$。沿旋转轴的分量为：

$$
\boxed{
\mathbf v_\parallel
=\mathbf u(\mathbf u^T\mathbf v)
}
$$

垂直于旋转轴的分量为：

$$
\boxed{
\mathbf v_\perp
=\mathbf v-\mathbf u(\mathbf u^T\mathbf v)
}
$$

旋转过程中，平行分量保持不变，垂直分量在垂直于 $\mathbf u$ 的平面内沿圆周运动。

### 4.3 Rodrigues 向量旋转公式

垂直分量旋转后为：

$$
\mathbf v_\perp'
=\cos\theta\,\mathbf v_\perp
+\sin\theta(\mathbf u\times\mathbf v)
$$

加上不变的平行分量：

$$
\boxed{
\mathbf v'
=\cos\theta\,\mathbf v
+(1-\cos\theta)\mathbf u(\mathbf u^T\mathbf v)
+\sin\theta(\mathbf u\times\mathbf v)
}
$$

三项分别描述：

1. 原向量保留的余弦部分；
2. 沿旋转轴方向需要补回的分量；
3. 由叉积产生的旋转方向分量。

### 4.4 Rodrigues 旋转矩阵

将向量公式写成矩阵形式：

$$
\boxed{
R=
\cos\theta I
+(1-\cos\theta)\mathbf u\mathbf u^T
+\sin\theta[\mathbf u]_\times
}
$$

利用单位向量恒等式：

$$
[\mathbf u]_\times^2
=\mathbf u\mathbf u^T-I
$$

还可以写成：

$$
\boxed{
R=
I+\sin\theta[\mathbf u]_\times
+(1-\cos\theta)[\mathbf u]_\times^2
}
$$

三个基本旋转矩阵 $R_x,R_y,R_z$ 都是 Rodrigues 公式的特殊情况。

### 4.5 MATLAB 构造轴角旋转矩阵

```matlab
clear;
clc;

axisVector = [1; 1; 1];
axisVector = axisVector / norm(axisVector);

theta = deg2rad(60);

ux = axisVector(1);
uy = axisVector(2);
uz = axisVector(3);

K = [  0, -uz,  uy;
      uz,   0, -ux;
     -uy,  ux,   0];

R = eye(3) ...
    + sin(theta) * K ...
    + (1 - cos(theta)) * K^2;

orthogonalError = norm(R.' * R - eye(3));
determinantValue = det(R);
```

## 5. 旋转矩阵与轴角的转换

### 5.1 旋转矩阵转旋转角

旋转矩阵的迹满足：

$$
\operatorname{tr}(R)=1+2\cos\theta
$$

因此：

$$
\boxed{
\theta=
\arccos
\left(
\frac{\operatorname{tr}(R)-1}{2}
\right)
}
$$

数值计算时应将反余弦输入限制在 $[-1,1]$，避免浮点误差。

### 5.2 旋转矩阵转旋转轴

当 $\sin\theta\neq0$ 时：

$$
R-R^T=2\sin\theta[\mathbf u]_\times
$$

所以：

$$
\boxed{
\mathbf u=
\frac{1}{2\sin\theta}
\begin{bmatrix}
r_{32}-r_{23}\\
r_{13}-r_{31}\\
r_{21}-r_{12}
\end{bmatrix}
}
$$

这个一般公式在 $\theta\approx0$ 或 $\theta\approx\pi$ 时会变得不稳定，因为 $\sin\theta$ 接近零。实际程序需要对这两种情况单独处理。

MATLAB 中的一般情况实现：

```matlab
cosTheta = (trace(R) - 1) / 2;
cosTheta = max(-1, min(1, cosTheta));

thetaRecovered = acos(cosTheta);

if abs(sin(thetaRecovered)) > 1e-8
    axisRecovered = ...
        [R(3,2) - R(2,3);
         R(1,3) - R(3,1);
         R(2,1) - R(1,2)] ...
        / (2 * sin(thetaRecovered));

    axisRecovered = ...
        axisRecovered / norm(axisRecovered);
else
    axisRecovered = NaN(3,1);
end
```

## 6. 四元数

本文采用标量在前的四元数顺序：

$$
\boxed{
\mathbf q=
\begin{bmatrix}
w\\x\\y\\z
\end{bmatrix}
=
\begin{bmatrix}
w\\\mathbf q_v
\end{bmatrix}
}
$$

其中 $w$ 是标量部分，$\mathbf q_v=[x,y,z]^T$ 是向量部分。

表示旋转的四元数必须是单位四元数：

$$
\boxed{
\|\mathbf q\|
=\sqrt{w^2+x^2+y^2+z^2}=1
}
$$

四元数有 4 个分量，但单位长度约束减少了一个自由度，因此仍然对应三维旋转的 3 个自由度。

### 6.1 轴角转四元数

单位旋转轴 $\mathbf u$、旋转角 $\theta$ 对应：

$$
\boxed{
\mathbf q=
\begin{bmatrix}
\cos\frac{\theta}{2}\\
\mathbf u\sin\frac{\theta}{2}
\end{bmatrix}
}
$$

四元数使用半角，是因为向量旋转时四元数会从左右两侧共同参与乘法，内部角度 $\alpha$ 最终产生 $2\alpha$ 的空间旋转。

当 $\theta=0$ 时：

$$
\mathbf q=
\begin{bmatrix}
1\\0\\0\\0
\end{bmatrix}
$$

当 $\theta=\pi$ 时：

$$
\mathbf q=
\begin{bmatrix}
0\\\mathbf u
\end{bmatrix}
$$

### 6.2 共轭与逆

四元数共轭为：

$$
\boxed{
\mathbf q^*=
\begin{bmatrix}
w\\-\mathbf q_v
\end{bmatrix}
}
$$

一般四元数的逆为：

$$
\mathbf q^{-1}
=\frac{\mathbf q^*}{\|\mathbf q\|^2}
$$

对于单位四元数：

$$
\boxed{
\mathbf q^{-1}=\mathbf q^*
}
$$

### 6.3 Hamilton 乘积

设：

$$
\mathbf q_1=
\begin{bmatrix}
w_1\\\mathbf v_1
\end{bmatrix},qquad
\mathbf q_2=
\begin{bmatrix}
w_2\\\mathbf v_2
\end{bmatrix}
$$

四元数乘法定义为：

$$
\boxed{
\mathbf q_1\otimes\mathbf q_2
=
\begin{bmatrix}
w_1w_2-\mathbf v_1^T\mathbf v_2\\
w_1\mathbf v_2+w_2\mathbf v_1+
\mathbf v_1\times\mathbf v_2
\end{bmatrix}
}
$$

四元数乘法通常不能交换：

$$
\mathbf q_1\otimes\mathbf q_2
\neq
\mathbf q_2\otimes\mathbf q_1
$$

这与三维旋转不可交换相对应。

### 6.4 使用四元数旋转向量

将三维向量 $\mathbf p$ 写成纯四元数：

$$
\mathbf p_q=
\begin{bmatrix}
0\\\mathbf p
\end{bmatrix}
$$

使用单位四元数执行旋转：

$$
\boxed{
\mathbf p_q'
=\mathbf q\otimes\mathbf p_q\otimes\mathbf q^*
}
$$

结果的标量部分为零，向量部分就是旋转后的三维向量。

若先执行 $\mathbf q_1$，再执行 $\mathbf q_2$，复合四元数为：

$$
\boxed{
\mathbf q=\mathbf q_2\otimes\mathbf q_1
}
$$

和旋转矩阵一样，最先执行的旋转写在右侧。

### 6.5 $\mathbf q$ 与 $-\mathbf q$

单位四元数：

$$
\mathbf q
$$

和：

$$
-\mathbf q
$$

表示完全相同的空间旋转。这称为四元数对旋转的双重覆盖。

因此，不能只通过分量是否相等判断两个四元数姿态是否相同，还要考虑：

$$
\mathbf q_1\approx\mathbf q_2
$$

或：

$$
\mathbf q_1\approx-\mathbf q_2
$$

### 6.6 MATLAB 四元数乘法

```matlab
function q = quaternionMultiply(q1, q2)
    w1 = q1(1);
    v1 = q1(2:4);

    w2 = q2(1);
    v2 = q2(2:4);

    scalarPart = w1 * w2 - dot(v1, v2);

    vectorPart = ...
        w1 * v2 ...
        + w2 * v1 ...
        + cross(v1, v2);

    q = [scalarPart;
         vectorPart];
end
```

轴角构造四元数并旋转向量：

```matlab
axisVector = [1; 1; 1];
axisVector = axisVector / norm(axisVector);
theta = deg2rad(60);

q = [cos(theta / 2);
     axisVector * sin(theta / 2)];

q = q / norm(q);
qConjugate = [q(1); -q(2:4)];

p = [1; 0; 0];
pQuaternion = [0; p];

pRotatedQuaternion = quaternionMultiply( ...
    quaternionMultiply(q, pQuaternion), ...
    qConjugate ...
);

pRotated = pRotatedQuaternion(2:4);
```

## 7. 四元数与其他表示的转换

### 7.1 四元数转旋转矩阵

对单位四元数：

$$
\mathbf q=
\begin{bmatrix}
w\\x\\y\\z
\end{bmatrix}
$$

对应旋转矩阵为：

$$
\boxed{
R(\mathbf q)=
\begin{bmatrix}
1-2(y^2+z^2)&2(xy-wz)&2(xz+wy)\\
2(xy+wz)&1-2(x^2+z^2)&2(yz-wx)\\
2(xz-wy)&2(yz+wx)&1-2(x^2+y^2)
\end{bmatrix}
}
$$

计算前应确保四元数已经单位化。

### 7.2 旋转矩阵转四元数

当旋转角不接近 $180^\circ$ 时，可以先计算：

$$
\boxed{
w=\frac12\sqrt{1+\operatorname{tr}(R)}
}
$$

然后：

$$
\boxed{
x=\frac{r_{32}-r_{23}}{4w},\qquad
y=\frac{r_{13}-r_{31}}{4w},\qquad
z=\frac{r_{21}-r_{12}}{4w}
}
$$

当旋转接近 $180^\circ$ 时，$w\approx0$，上述除法会变得不稳定。实际实现通常根据旋转矩阵中最大的对角元素选择不同计算分支。

一个较稳健的 MATLAB 实现如下：

```matlab
function q = rotationMatrixToQuaternion(R)
    matrixTrace = trace(R);

    if matrixTrace > 0
        scale = 2 * sqrt(matrixTrace + 1);
        w = 0.25 * scale;
        x = (R(3,2) - R(2,3)) / scale;
        y = (R(1,3) - R(3,1)) / scale;
        z = (R(2,1) - R(1,2)) / scale;

    elseif R(1,1) > R(2,2) && R(1,1) > R(3,3)
        scale = 2 * sqrt(1 + R(1,1) - R(2,2) - R(3,3));
        w = (R(3,2) - R(2,3)) / scale;
        x = 0.25 * scale;
        y = (R(1,2) + R(2,1)) / scale;
        z = (R(1,3) + R(3,1)) / scale;

    elseif R(2,2) > R(3,3)
        scale = 2 * sqrt(1 + R(2,2) - R(1,1) - R(3,3));
        w = (R(1,3) - R(3,1)) / scale;
        x = (R(1,2) + R(2,1)) / scale;
        y = 0.25 * scale;
        z = (R(2,3) + R(3,2)) / scale;

    else
        scale = 2 * sqrt(1 + R(3,3) - R(1,1) - R(2,2));
        w = (R(2,1) - R(1,2)) / scale;
        x = (R(1,3) + R(3,1)) / scale;
        y = (R(2,3) + R(3,2)) / scale;
        z = 0.25 * scale;
    end

    q = [w; x; y; z];
    q = q / norm(q);

    % 统一选择w非负的等价表示
    if q(1) < 0
        q = -q;
    end
end
```

### 7.3 四元数转轴角

先将四元数单位化。为了将旋转角限制在 $[0,\pi]$，可以在 $w<0$ 时整体取反。

设：

$$
\mathbf q=
\begin{bmatrix}
w\\\mathbf q_v
\end{bmatrix}
$$

则：

$$
\boxed{
\theta=2\operatorname{atan2}(\|\mathbf q_v\|,w)
}
$$

若 $\|\mathbf q_v\|\neq0$：

$$
\boxed{
\mathbf u=
\frac{\mathbf q_v}{\|\mathbf q_v\|}
}
$$

MATLAB 实现：

```matlab
q = q / norm(q);

if q(1) < 0
    q = -q;
end

w = q(1);
vectorPart = q(2:4);
vectorNorm = norm(vectorPart);

theta = 2 * atan2(vectorNorm, w);

if vectorNorm > 1e-9
    axisVector = vectorPart / vectorNorm;
else
    % 无旋转时，旋转轴可以任意选择
    axisVector = [1; 0; 0];
end
```

## 8. MATLAB 工具箱函数

如果安装了相关工具箱，可以使用：

```matlab
% ZYX欧拉角，输入顺序为[yaw, pitch, roll]
R = eul2rotm([yaw, pitch, roll], 'ZYX');

% 输出顺序同样为[yaw, pitch, roll]
eul = rotm2eul(R, 'ZYX');

% 轴角格式为[ux, uy, uz, theta]
R = axang2rotm([axisVector.', theta]);
axisAngle = rotm2axang(R);

% 四元数通常采用[w, x, y, z]
quaternionRow = rotm2quat(R);
R = quat2rotm(quaternionRow);
```

使用这些函数前仍需确认：

- 欧拉角顺序；
- 角度数组的排列；
- 四元数是标量在前还是标量在后；
- 返回的是主动旋转还是坐标转换约定。

## 9. 如何选择姿态表示

| 表示方法 | 参数数量 | 适合用途 | 主要问题 |
|---|---:|---|---|
| 旋转矩阵 | 9 | 坐标转换、正运动学、齐次变换 | 参数多，需要保持正交 |
| RPY／欧拉角 | 3 | 人工输入、显示和理解姿态 | 有顺序约定和万向节锁 |
| 轴角 | 4 | 任意轴旋转、姿态误差 | 轴需单位化，零角度时轴不唯一 |
| 四元数 | 4 | 姿态估计、组合、插值和连续计算 | 不直观，有符号和顺序约定 |

一个机器人系统通常会同时使用多种姿态表示：

1. 内部姿态计算使用旋转矩阵或四元数；
2. 与齐次变换组合时使用旋转矩阵；
3. 显示给用户时转换为 RPY 角；
4. 表达单次几何旋转或姿态误差时使用轴角；
5. 连续姿态估计和插值时使用四元数。

## 10. 四元数时间序列的符号连续性

因为 $\mathbf q$ 和 $-\mathbf q$ 表示相同姿态，四元数序列可能在数值上突然变号。

若连续两个四元数满足：

$$
\mathbf q_{k-1}^T\mathbf q_k<0
$$

通常将当前四元数取反：

$$
\boxed{
\mathbf q_k\leftarrow-\mathbf q_k
}
$$

MATLAB 中：

```matlab
if dot(qPrevious, qCurrent) < 0
    qCurrent = -qCurrent;
end
```

这不会改变姿态，但可以保持四元数数值连续，方便插值和绘图。

## 11. 常见错误与检查清单

### 11.1 只给出三个欧拉角，不说明顺序

同一组三个角度在不同旋转顺序下会产生不同姿态。必须明确是 `ZYX`、`XYZ` 还是其他约定。

### 11.2 混淆固定轴与运动轴

固定轴 $XYZ$ 与运动轴 $ZYX$ 可以产生相同矩阵，但执行叙述相反。必须明确采用哪种解释。

### 11.3 把万向节锁当成物体失去自由度

万向节锁是欧拉角参数化奇异，不是刚体不能继续旋转。

### 11.4 忘记单位化旋转轴或四元数

Rodrigues 公式要求 $\|\mathbf u\|=1$，旋转四元数要求 $\|\mathbf q\|=1$。

### 11.5 忽略四元数分量顺序

本文使用 $[w,x,y,z]$，其他库可能使用 $[x,y,z,w]$。混用会得到完全错误的姿态。

### 11.6 直接比较四元数分量

$\mathbf q$ 与 $-\mathbf q$ 表示相同旋转。比较姿态时必须考虑这一点。

### 11.7 忽略角度单位

MATLAB 的 `sin`、`cos`、`atan2` 使用弧度；带 `d` 的 `sind`、`cosd`、`atan2d` 使用角度。

使用任何姿态数据前，应明确：

- 坐标系是右手还是左手；
- 使用主动旋转还是被动旋转；
- 欧拉角采用什么轴顺序；
- 使用固定轴还是运动轴；
- 角度单位是度还是弧度；
- 四元数是标量在前还是标量在后；
- 四元数乘法采用什么约定；
- 姿态转换的来源坐标系和目标坐标系是什么。

## 12. 总结

RPY 角直观、紧凑，适合人工输入和显示，但依赖旋转顺序，并存在万向节锁。

轴角使用单位轴和旋转角描述姿态，Rodrigues 公式可以直接将轴角转换为旋转矩阵：

$$
R=I+\sin\theta[\mathbf u]_\times
+(1-\cos\theta)[\mathbf u]_\times^2
$$

单位四元数由轴角的半角构造：

$$
\mathbf q=
\begin{bmatrix}
\cos\frac{\theta}{2}\\
\mathbf u\sin\frac{\theta}{2}
\end{bmatrix}
$$

它没有欧拉角的万向节锁，适合姿态组合、估计和插值，但必须注意单位化、分量顺序及 $\mathbf q$ 与 $-\mathbf q$ 的等价性。

实际机器人系统通常不会只使用一种姿态表示，而是在不同环节之间进行转换：计算使用旋转矩阵或四元数，显示使用 RPY，几何旋转与误差表达使用轴角。
