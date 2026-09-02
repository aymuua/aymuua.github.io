---
title: 机器人学基础：线性代数工具速览
date: 2026-08-27 01:01:51
type: note
series: robotics-fundamentals
tags: [线性代数, MATLAB, 机器人学基础]
description: 面向机器人学入门的线性代数教程，介绍向量、内积、叉积、矩阵运算、逆矩阵、行列式、秩以及特征值与特征向量。
mathjax: true
---

机器人学中的位置、速度、力、姿态和坐标变换，都离不开向量与矩阵。本文不追求完整覆盖线性代数，而是集中学习后续机器人运动学所必需的基础工具，并使用 MATLAB 进行数值验证。

完成本文后，应当能够：

- 区分标量、位置向量与位移向量；
- 使用内积计算夹角和投影；
- 理解三维叉积的方向和基本物理意义；
- 正确进行矩阵乘法，并判断运算维度；
- 理解逆矩阵、行列式和矩阵秩之间的关系；
- 使用 MATLAB 求解线性方程组；
- 理解特征值和特征向量的基本含义。

## 1. 向量

### 1.1 标量与向量

标量只有大小，例如时间、质量和温度。向量同时具有大小和方向，例如位置、位移、速度、加速度和力。

机器人学中通常将向量写成列向量。二维向量和三维向量分别写作：

$$
\mathbf v=
\begin{bmatrix}
v_x\\
v_y
\end{bmatrix},
\qquad
\mathbf p=
\begin{bmatrix}
p_x\\
p_y\\
p_z
\end{bmatrix}
$$

MATLAB 中可以直接使用分号创建列向量：

```matlab
v = [3; 4];
p = [1; 2; 3];
```

### 1.2 位置与位移

设机器人从位置 $\mathbf p_A$ 移动到位置 $\mathbf p_B$：

$$
\mathbf p_A=
\begin{bmatrix}
1\\2
\end{bmatrix},
\qquad
\mathbf p_B=
\begin{bmatrix}
4\\6
\end{bmatrix}
$$

机器人的位移为：

$$
\Delta\mathbf p
=\mathbf p_B-\mathbf p_A
=
\begin{bmatrix}
3\\4
\end{bmatrix}
$$

位置描述一个点相对于坐标系原点的位置，位移描述两个位置之间的变化。二者都可以用数组存储，但物理意义不同。

### 1.3 向量的模与单位向量

向量的模表示其长度：

$$
\|\mathbf v\|
=\sqrt{v_1^2+v_2^2+\cdots+v_n^2}
$$

对于位移 $\Delta\mathbf p=[3,4]^T$：

$$
\|\Delta\mathbf p\|=\sqrt{3^2+4^2}=5
$$

非零向量除以自身长度，可以得到方向相同、长度为 1 的单位向量：

$$
\hat{\mathbf v}=\frac{\mathbf v}{\|\mathbf v\|}
$$

MATLAB 实现如下：

```matlab
displacement = [3; 4];

lengthValue = norm(displacement);
direction = displacement / lengthValue;

disp(lengthValue);
disp(direction);
```

零向量的模为零，因此不能进行单位化。

## 2. 向量内积

对于两个同维度向量 $\mathbf a,\mathbf b\in\mathbb R^n$，内积定义为：

$$
\mathbf a^T\mathbf b
=\sum_{i=1}^{n}a_i b_i
$$

结果是一个标量。

### 2.1 夹角与正交

内积的几何形式为：

$$
\mathbf a^T\mathbf b
=\|\mathbf a\|\|\mathbf b\|\cos\theta
$$

因此，两个非零向量之间的夹角满足：

$$
\theta=arccos\left(
\frac{\mathbf a^T\mathbf b}
{\|\mathbf a\|\|\mathbf b\|}
\right)
$$

由内积的符号可以判断大致的方向关系：

- $\mathbf a^T\mathbf b>0$：夹角小于 $90^\circ$；
- $\mathbf a^T\mathbf b=0$：两个向量正交；
- $\mathbf a^T\mathbf b<0$：夹角大于 $90^\circ$。

MATLAB 中使用 `a' * b` 或 `dot(a,b)` 计算实向量内积：

```matlab
a = [1; 2; 3];
b = [4; 1; -2];

innerProduct = a' * b;

cosTheta = innerProduct / (norm(a) * norm(b));
cosTheta = max(-1, min(1, cosTheta));
theta = acos(cosTheta);
thetaDegree = rad2deg(theta);
```

计算反余弦之前，将数值限制在 $[-1,1]$ 内，可以避免浮点误差导致 `acos` 得到无效结果。

### 2.2 向量投影

向量 $\mathbf a$ 在非零向量 $\mathbf b$ 方向上的向量投影为：

$$
\operatorname{proj}_{\mathbf b}(\mathbf a)
=\frac{\mathbf a^T\mathbf b}{\mathbf b^T\mathbf b}\mathbf b
$$

这个公式容易因为分母而显得抽象，可以分成两步理解。先把 $\mathbf b$ 单位化：

$$
\hat{\mathbf b}=\frac{\mathbf b}{\|\mathbf b\|}
$$

$\mathbf a^T\hat{\mathbf b}$ 是 $\mathbf a$ 在该单位方向上的有符号长度，再乘以单位方向，就得到投影向量：

$$
\operatorname{proj}_{\mathbf b}(\mathbf a)
=(\mathbf a^T\hat{\mathbf b})\hat{\mathbf b}
$$

将 $\hat{\mathbf b}=\mathbf b/\|\mathbf b\|$ 代入：

$$
(\mathbf a^T\hat{\mathbf b})\hat{\mathbf b}
=\frac{\mathbf a^T\mathbf b}{\|\mathbf b\|^2}\mathbf b
=\frac{\mathbf a^T\mathbf b}{\mathbf b^T\mathbf b}\mathbf b
$$

因此，分母 $\mathbf b^T\mathbf b$ 的作用是消除 $\mathbf b$ 自身长度的影响。无论用 $\mathbf b$ 还是 $2\mathbf b$ 表示同一个方向，最终得到的投影向量都相同。

相对于该方向的垂直分量为：

$$
\mathbf a_\perp
=\mathbf a-\operatorname{proj}_{\mathbf b}(\mathbf a)
$$

MATLAB 实现如下：

```matlab
a = [3; 4];
b = [1; 1];

aParallel = (a' * b) / (b' * b) * b;
aPerpendicular = a - aParallel;
```

机器人可以利用内积判断自身朝向与目标方向的接近程度，也可以计算速度在指定方向上的分量。

## 3. 三维向量叉积

叉积只在本课程的三维向量运算中使用。对于：

$$
\mathbf a=
\begin{bmatrix}
a_x\\a_y\\a_z
\end{bmatrix},
\qquad
\mathbf b=
\begin{bmatrix}
b_x\\b_y\\b_z
\end{bmatrix}
$$

叉积为：

$$
\mathbf a\times\mathbf b=
\begin{bmatrix}
a_yb_z-a_zb_y\\
a_zb_x-a_xb_z\\
a_xb_y-a_yb_x
\end{bmatrix}
$$

结果同时垂直于 $\mathbf a$ 和 $\mathbf b$，方向由右手定则确定，大小为：

$$
\|\mathbf a\times\mathbf b\|
=\|\mathbf a\|\|\mathbf b\|\sin\theta
$$

叉积的顺序不能交换：

$$
\mathbf a\times\mathbf b
=-\mathbf b\times\mathbf a
$$

### 3.1 力矩

如果力 $\mathbf F$ 作用在距离旋转中心 $\mathbf r$ 的位置，则产生的力矩为：

$$
\boldsymbol\tau=\mathbf r\times\mathbf F
$$

例如，长度为 $0.3\,\mathrm m$ 的水平力臂末端受到 $20\,\mathrm N$ 的竖直力：

```matlab
r = [0.3; 0; 0];
F = [0; 20; 0];

tau = cross(r, F);

disp(tau);
```

得到的力矩沿 $z$ 轴正方向，大小为 $6\,\mathrm{N\cdot m}$。

### 3.2 旋转产生的线速度

刚体以角速度 $\boldsymbol\omega$ 转动时，刚体上位置为 $\mathbf r$ 的点具有线速度：

$$
\mathbf v=\boldsymbol\omega\times\mathbf r
$$

MATLAB 示例：

```matlab
omega = [0; 0; 2];
r = [0.5; 0; 0];

v = cross(omega, r);

disp(v);
```

当前只需掌握叉积的方向、顺序，以及上述两个基本物理应用。

## 4. 矩阵与矩阵乘法

一个 $m$ 行、$n$ 列的矩阵记作：

$$
A\in\mathbb R^{m\times n}
$$

例如：

$$
A=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix}
\in\mathbb R^{2\times3}
$$

MATLAB 中使用分号分隔矩阵的各行：

```matlab
A = [1, 2, 3;
     4, 5, 6];
```

### 4.1 矩阵乘向量

设：

$$
A=
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix},
\qquad
\mathbf x=
\begin{bmatrix}
x\\y
\end{bmatrix}
$$

则：

$$
A\mathbf x=
\begin{bmatrix}
ax+by\\
cx+dy
\end{bmatrix}
$$

矩阵可以理解为一种变换：它接收一个向量，并产生一个新的向量。

还可以从矩阵的列来理解这件事。若：

$$
A=
\begin{bmatrix}
\mathbf a_1&\mathbf a_2
\end{bmatrix},
\qquad
\mathbf x=
\begin{bmatrix}
x_1\\x_2
\end{bmatrix}
$$

那么：

$$
A\mathbf x=x_1\mathbf a_1+x_2\mathbf a_2
$$

也就是说，输入向量中的数值不是简单地与矩阵“混合计算”，而是在指定如何组合矩阵的各列。这个观点可以帮助理解矩阵的秩：如果矩阵的所有列都指向同一方向，那么无论怎样组合，输出也只能落在这一方向上。

```matlab
A = [2, 0;
     0, 3];
x = [1; 2];

y = A * x;
```

这里矩阵将输入向量的第一维放大 2 倍，将第二维放大 3 倍。

### 4.2 矩阵乘法的维度

若：

$$
A\in\mathbb R^{m\times n},
\qquad
B\in\mathbb R^{n\times p}
$$

则：

$$
AB\in\mathbb R^{m\times p}
$$

两个矩阵相乘时，中间维度必须相同：

$$
(m\times\boxed n)(\boxed n\times p)
\longrightarrow m\times p
$$

### 4.3 连续变换与乘法顺序

如果向量先经过 $B$，再经过 $A$：

$$
\mathbf y=B\mathbf x,
\qquad
\mathbf z=A\mathbf y
$$

那么：

$$
\mathbf z=A(B\mathbf x)=(AB)\mathbf x
$$

因此，矩阵乘法应当从右向左阅读：$AB\mathbf x$ 表示先执行 $B$，再执行 $A$。

原因并不是人为规定的阅读习惯，而是由运算的嵌套关系决定的：

$$
AB\mathbf x=A(B\mathbf x)
$$

离 $\mathbf x$ 最近的 $B$ 必须先得到结果，$A$ 才能继续作用在这个结果上。可以把它类比为函数复合：如果先将照片裁剪，再调整亮度，那么第二步接收到的是已经裁剪后的照片；交换顺序，就变成先调整整张照片的亮度，再进行裁剪。

一般情况下：

$$
AB\ne BA
$$

所以不能随意交换矩阵的顺序。

下面的 MATLAB 代码展示了交换顺序后结果发生变化：

```matlab
x = [1; 1];

A = [1, 1;
     0, 1];
B = [2, 0;
     0, 1];

resultAB = A * B * x;  % 先执行 B，再执行 A
resultBA = B * A * x;  % 先执行 A，再执行 B
```

这里 `resultAB` 为 $[3,1]^T$，而 `resultBA` 为 $[4,1]^T$。矩阵相同，仅改变顺序就得到了不同结果。

### 4.4 单位矩阵与转置

单位矩阵满足：

$$
AI=IA=A
$$

MATLAB 使用 `eye` 创建单位矩阵：

```matlab
I2 = eye(2);
I3 = eye(3);
```

矩阵转置会交换矩阵的行和列，并满足：

$$
(AB)^T=B^TA^T
$$

MATLAB 中：

```matlab
AT = A.';
```

`A.'` 表示普通转置；`A'` 表示共轭转置。处理实数矩阵时，两者结果相同。

### 4.5 矩阵运算与逐元素运算

MATLAB 中需要区分矩阵运算与逐元素运算：

```matlab
C1 = A * B;    % 矩阵乘法
C2 = A .* B;   % 对应元素相乘

D1 = A ^ 2;    % 矩阵平方，即 A * A
D2 = A .^ 2;   % 每个元素分别平方
```

## 5. 逆矩阵、行列式与矩阵的秩

### 5.1 逆矩阵

对于方阵 $A$，如果存在矩阵 $A^{-1}$，使得：

$$
A^{-1}A=AA^{-1}=I
$$

那么 $A^{-1}$ 称为 $A$ 的逆矩阵。

如果：

$$
\mathbf y=A\mathbf x
$$

那么逆矩阵可以撤销该变换：

$$
\mathbf x=A^{-1}\mathbf y
$$

MATLAB 可以使用 `inv(A)` 观察逆矩阵：

```matlab
A = [2, 0;
     0, 4];

AInverse = inv(A);
checkValue = AInverse * A;
```

只有不丢失信息的方阵才存在逆矩阵。

### 5.2 行列式

对于二维方阵：

$$
A=
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}
$$

行列式为：

$$
\det(A)=ad-bc
$$

在二维空间中，$|\det(A)|$ 可以理解为面积的缩放倍数。

- $\det(A)\ne0$：变换没有压缩掉一个完整方向；
- $\det(A)=0$：二维区域被压成直线或点，变换不能恢复；
- $\det(A)<0$：除缩放外还发生了方向翻转。

MATLAB 使用 `det` 计算行列式：

```matlab
A = [2, 0;
     0, 3];

detA = det(A);
```

### 5.3 矩阵的秩

矩阵的秩表示矩阵包含多少个相互独立的方向或信息。

例如：

$$
B=
\begin{bmatrix}
1&2\\
2&4
\end{bmatrix}
$$

第二列是第一列的 2 倍，因此只有一个独立方向：

$$
\operatorname{rank}(B)=1
$$

为了更直观地看出“独立方向”的含义，令输入为：

$$
\mathbf x=
\begin{bmatrix}
x\\y
\end{bmatrix}
$$

矩阵 $B$ 的输出为：

$$
B\mathbf x
=
\begin{bmatrix}
x+2y\\
2x+4y
\end{bmatrix}
=
\begin{bmatrix}
s\\2s
\end{bmatrix},
\qquad s=x+2y
$$

无论输入 $x,y$ 如何变化，输出的第二个分量始终是第一个分量的 2 倍。因此，所有输出都落在同一条直线上，二维输入被压缩成了一维信息。

这也解释了为什么该矩阵不可逆。例如 $[2,0]^T$ 和 $[0,1]^T$ 都满足 $x+2y=2$，经过 $B$ 后得到完全相同的输出 $[2,4]^T$。只看到输出时，无法判断原来的输入是哪一个，所以不可能构造唯一的逆变换。

MATLAB 使用 `rank` 计算矩阵秩：

```matlab
B = [1, 2;
     2, 4];

rankB = rank(B);
```

对于 $A\in\mathbb R^{m\times n}$，秩的最大值是 $\min(m,n)$。达到这个最大值时，称矩阵满秩。

对于 $n\times n$ 方阵，下面三个条件相互等价：

$$
A^{-1}\text{存在}
\quad\Longleftrightarrow\quad
\det(A)\ne0
\quad\Longleftrightarrow\quad
\operatorname{rank}(A)=n
$$

这三个条件描述的是同一件事：

- 满秩表示所有输入方向的信息都被保留；
- 行列式不为零表示面积或体积没有被压缩为零；
- 信息没有丢失时，每个输出才对应唯一输入，因此逆矩阵存在。

## 6. 求解线性方程组

线性方程组可以写成：

$$
A\mathbf x=\mathbf b
$$

例如：

$$
\begin{cases}
2x+y=5\\
x-y=1
\end{cases}
$$

对应矩阵形式：

$$
\begin{bmatrix}
2&1\\
1&-1
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
=
\begin{bmatrix}
5\\1
\end{bmatrix}
$$

理论上可以写成 $\mathbf x=A^{-1}\mathbf b$，但 MATLAB 中通常使用左除运算直接求解：

```matlab
A = [2,  1;
     1, -1];
b = [5; 1];

x = A \ b;

disp(x);
```

应当优先使用：

```matlab
x = A \ b;
```

而不是：

```matlab
x = inv(A) * b;
```

前者通常更高效，也具有更好的数值稳定性。

## 7. 特征值与特征向量

矩阵通常会同时改变一个向量的长度和方向，但某些特殊方向经过矩阵变换后，方向保持不变，只发生缩放。

如果非零向量 $\mathbf v$ 满足：

$$
A\mathbf v=\lambda\mathbf v
$$

那么：

- $\mathbf v$ 是矩阵 $A$ 的特征向量；
- $\lambda$ 是对应的特征值。

特征值描述这个方向上的缩放：

- $\lambda>1$：向量变长；
- $0<\lambda<1$：向量变短；
- $\lambda<0$：方向反转并发生缩放；
- $\lambda=0$：该方向被压缩为零向量。

“方向不变”是这里最关键、也最容易混淆的含义。仍以：

$$
A=
\begin{bmatrix}
2&1\\
1&2
\end{bmatrix}
$$

为例。普通向量 $[1,0]^T$ 经过变换后成为 $[2,1]^T$，方向发生了改变，因此它不是特征向量。向量 $[1,1]^T$ 经过变换后成为 $[3,3]^T$，它仍然指向原来的方向，只是长度变为原来的 3 倍，因此它是特征向量，对应特征值为 3。

特征向量描述的是方向而不是某个固定长度，所以 $[1,1]^T$、$[2,2]^T$ 和 $[-1,-1]^T$ 都表示同一条特征方向。MATLAB 通常会把返回的特征向量单位化，使其长度为 1。

### 7.1 求解特征值

将特征值定义移项：

$$
(A-\lambda I)\mathbf v=0
$$

为了使该方程存在非零解，必须满足：

$$
\det(A-\lambda I)=0
$$

这个方程称为特征方程。

这里的推理可以逐步理解：

1. 如果 $A-\lambda I$ 可逆，那么在 $(A-\lambda I)\mathbf v=0$ 两边同时乘其逆矩阵，只能得到 $\mathbf v=0$；
2. 但特征向量按定义必须是非零向量；
3. 所以 $A-\lambda I$ 必须不可逆；
4. 方阵不可逆等价于行列式为零，于是得到 $\det(A-\lambda I)=0$。

求特征值的本质，就是寻找一个合适的 $\lambda$，使 $A-\lambda I$ 恰好变成不可逆矩阵，从而允许非零的 $\mathbf v$ 满足方程。

考虑矩阵：

$$
A=
\begin{bmatrix}
2&1\\
1&2
\end{bmatrix}
$$

它的两个特征值为：

$$
\lambda_1=3,
\qquad
\lambda_2=1
$$

对应的特征向量方向可以分别取为：

$$
\mathbf v_1=
\begin{bmatrix}
1\\1
\end{bmatrix},
\qquad
\mathbf v_2=
\begin{bmatrix}
1\\-1
\end{bmatrix}
$$

验证可得：

$$
A\mathbf v_1=3\mathbf v_1,
\qquad
A\mathbf v_2=\mathbf v_2
$$

### 7.2 MATLAB 计算

MATLAB 使用 `eig` 同时计算特征值和特征向量：

```matlab
A = [2, 1;
     1, 2];

[V, D] = eig(A);

disp(V);
disp(D);

errorValue = norm(A * V - V * D);
disp(errorValue);
```

其中：

- `D` 的对角线元素是特征值；
- `V` 的第 $i$ 列是与 `D(i,i)` 对应的特征向量；
- $AV=VD$，所以 `norm(A*V-V*D)` 应当接近零。

如果矩阵存在零特征值，就存在一个非零方向被映射为零，因此该矩阵不可逆。

## 8. MATLAB 运算速查

| 目标 | MATLAB 写法 |
|---|---|
| 创建列向量 | `v = [1; 2; 3]` |
| 向量长度 | `norm(v)` |
| 内积 | `a' * b` 或 `dot(a,b)` |
| 三维叉积 | `cross(a,b)` |
| 矩阵乘法 | `A * B` |
| 逐元素相乘 | `A .* B` |
| 普通转置 | `A.'` |
| 单位矩阵 | `eye(n)` |
| 逆矩阵 | `inv(A)` |
| 行列式 | `det(A)` |
| 矩阵的秩 | `rank(A)` |
| 求解 $A\mathbf x=\mathbf b$ | `x = A \ b` |
| 特征值和特征向量 | `[V,D] = eig(A)` |

## 9. 小结

本文各部分可以用一条主线联系起来：

1. 向量表示位置、方向、速度和力等物理量；
2. 内积描述向量之间的夹角与投影；
3. 叉积描述三维空间中的垂直方向、力矩和旋转速度；
4. 矩阵把一个向量映射为另一个向量，矩阵乘法组合多个变换；
5. 逆矩阵用于撤销变换，行列式和秩用于判断变换是否丢失信息；
6. 线性方程组把已知关系转化为未知量求解问题；
7. 特征向量是在矩阵作用下方向不变的特殊方向，特征值表示该方向的缩放程度。

这些工具将在下一篇的坐标系与二维旋转中直接使用。
