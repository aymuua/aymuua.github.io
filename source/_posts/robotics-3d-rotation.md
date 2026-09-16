---
title: 机器人学基础：三维旋转与齐次变换
date: 2026-09-10 00:00:00
type: note
series: robotics-fundamentals
tags: [三维旋转, 旋转矩阵, 齐次变换, 坐标变换, MATLAB, 机器人学基础]
description: 从三维旋转矩阵出发，系统讲解旋转复合、坐标系变换、齐次坐标、位姿连乘与求逆及其MATLAB实现。
mathjax: true
---

二维空间中的旋转只需要一个角度；进入三维空间后，物体可以分别绕 $x$、$y$、$z$ 三个方向旋转，而且不同旋转的先后顺序会影响最终结果。

本文讨论三维空间中最基础的两类工具：用 $3\times3$ 旋转矩阵描述方向，用 $4\times4$ 齐次变换矩阵统一描述方向和位置。欧拉角、轴角和四元数等姿态参数化方法将在下一篇“姿态表示”中介绍。

全文采用以下约定：

- 使用右手坐标系；
- 向量写成列向量；
- 旋转正方向遵循右手定则；
- 除非特别说明，旋转矩阵主动旋转向量；
- MATLAB 三角函数中的角度使用弧度。

完成本文后，应当能够：

- 写出绕三个坐标轴的基本旋转矩阵；
- 根据矩阵判断旋转后各坐标轴的方向；
- 检验一个矩阵是否为合法的三维旋转矩阵；
- 按正确顺序组合多个旋转；
- 区分向量旋转和坐标系变换；
- 计算两个坐标系之间的相对旋转；
- 使用齐次矩阵统一表示旋转和平移；
- 完成齐次变换的连乘和求逆；
- 区分位置点与方向向量的齐次坐标；
- 使用 MATLAB 完成并验证上述计算。

## 1. 所需数学工具

本文需要以下数学工具：

- 三维列向量；
- 正弦、余弦和弧度制；
- 矩阵与向量相乘；
- 矩阵乘法；
- 单位矩阵、转置矩阵和逆矩阵；
- 向量内积、向量长度和正交；
- 行列式的基本概念。

其中最需要注意的是矩阵乘法顺序。一般情况下：

$$
R_1R_2\ne R_2R_1
$$

因此，三维旋转不能只说明“分别转了哪些角度”，还必须说明“按照什么顺序旋转”。

## 2. 三维坐标系与右手定则

### 2.1 右手坐标系

三维直角坐标系由三条两两垂直的坐标轴组成。若 $x$ 轴、$y$ 轴和 $z$ 轴的方向满足：

$$
\mathbf e_x\times\mathbf e_y=\mathbf e_z
$$

则称其为右手坐标系。

可以用右手判断三个轴的方向：

1. 右手食指指向 $x$ 轴正方向；
2. 中指指向 $y$ 轴正方向；
3. 此时拇指指向 $z$ 轴正方向。

本文全部使用右手坐标系。

### 2.2 旋转的正方向

绕某一坐标轴旋转时，也使用右手定则判断正方向：

1. 右手拇指指向旋转轴的正方向；
2. 其余四指自然弯曲的方向就是正旋转方向。

例如，从 $z$ 轴正方向朝原点看，绕 $z$ 轴的正旋转表现为 $x$ 轴转向 $y$ 轴。这与二维平面中的逆时针正方向一致。

容易出错的原因在于：观察方向改变以后，视觉上的顺时针与逆时针也会改变。因此，不应只凭图形判断正负，而应始终使用右手定则。

## 3. 绕坐标轴的基本旋转

### 3.1 绕 $x$ 轴旋转

绕 $x$ 轴旋转角度 $\alpha$ 时，向量的 $x$ 分量不变，$y$、$z$ 分量在 $yz$ 平面中旋转。因此：

$$
R_x(\alpha)=
\begin{bmatrix}
1&0&0\\
0&\cos\alpha&-\sin\alpha\\
0&\sin\alpha&\cos\alpha
\end{bmatrix}
$$

它对三个标准基向量的作用为：

$$
R_x(\alpha)\mathbf e_x=\mathbf e_x
$$

$$
R_x(\alpha)\mathbf e_y=
\begin{bmatrix}
0\\
\cos\alpha\\
\sin\alpha
\end{bmatrix}
$$

$$
R_x(\alpha)\mathbf e_z=
\begin{bmatrix}
0\\
-\sin\alpha\\
\cos\alpha
\end{bmatrix}
$$

当 $\alpha=90^\circ$ 时，$y$ 轴正方向转向 $z$ 轴正方向。

### 3.2 绕 $y$ 轴旋转

绕 $y$ 轴旋转角度 $\beta$ 时，$y$ 分量不变：

$$
R_y(\beta)=
\begin{bmatrix}
\cos\beta&0&\sin\beta\\
0&1&0\\
-\sin\beta&0&\cos\beta
\end{bmatrix}
$$

当 $\beta=90^\circ$ 时：

$$
R_y\left(\frac{\pi}{2}\right)\mathbf e_z=\mathbf e_x
$$

$$
R_y\left(\frac{\pi}{2}\right)\mathbf e_x=-\mathbf e_z
$$

$R_y$ 中正弦项的位置最容易写错。可以用上面两个 $90^\circ$ 旋转结果检查符号，而不必机械记忆。

### 3.3 绕 $z$ 轴旋转

绕 $z$ 轴旋转角度 $\gamma$ 时，$z$ 分量不变，$x$、$y$ 分量在 $xy$ 平面中旋转：

$$
R_z(\gamma)=
\begin{bmatrix}
\cos\gamma&-\sin\gamma&0\\
\sin\gamma&\cos\gamma&0\\
0&0&1
\end{bmatrix}
$$

当 $\gamma=90^\circ$ 时：

$$
R_z\left(\frac{\pi}{2}\right)\mathbf e_x=\mathbf e_y
$$

这就是二维旋转矩阵在三维空间中的扩展。

### 3.4 三个矩阵的共同结构

三个基本旋转矩阵都具有相同规律：

- 旋转轴对应的分量保持不变；
- 另外两个分量构成一个二维旋转；
- 正弦项的符号由右手定则确定。

因此，真正需要理解的是“哪个平面在旋转”和“正方向是什么”，而不是孤立地背诵三个矩阵。

## 4. MATLAB 构造基本旋转矩阵

```matlab
alpha = deg2rad(30);
beta  = deg2rad(45);
gamma = deg2rad(60);

Rx = [1, 0,          0;
      0, cos(alpha), -sin(alpha);
      0, sin(alpha),  cos(alpha)];

Ry = [ cos(beta), 0, sin(beta);
       0,         1, 0;
      -sin(beta), 0, cos(beta)];

Rz = [cos(gamma), -sin(gamma), 0;
      sin(gamma),  cos(gamma), 0;
      0,           0,          1];
```

若直接使用角度值，也可以使用 `sind` 和 `cosd`：

```matlab
gammaDeg = 90;

Rz = [cosd(gammaDeg), -sind(gammaDeg), 0;
      sind(gammaDeg),  cosd(gammaDeg), 0;
      0,               0,              1];
```

不要将弧度函数和角度数值混用。例如，`cos(90)` 中的 `90` 会被 MATLAB 当作 $90$ 弧度，而不是 $90^\circ$。

## 5. 如何理解旋转矩阵的每一列

设：

$$
R=
\begin{bmatrix}
|&|&|\\
\mathbf r_1&\mathbf r_2&\mathbf r_3\\
|&|&|
\end{bmatrix}
$$

由于：

$$
R\mathbf e_x=\mathbf r_1,
\qquad
R\mathbf e_y=\mathbf r_2,
\qquad
R\mathbf e_z=\mathbf r_3
$$

所以，旋转矩阵的三列分别是三个标准基向量旋转后的方向。

这是理解旋转矩阵最重要的几何方式之一。矩阵不是九个互不相关的数字，而是把旋转后的三个互相垂直的单位轴并排放在一起。

例如：

$$
R_z\left(\frac{\pi}{2}\right)=
\begin{bmatrix}
0&-1&0\\
1&0&0\\
0&0&1
\end{bmatrix}
$$

它的三列说明：

- 原来的 $x$ 轴转到了 $y$ 轴正方向；
- 原来的 $y$ 轴转到了 $x$ 轴负方向；
- 原来的 $z$ 轴保持不变。

因此，只要观察矩阵的列，就能快速读出旋转后的坐标轴朝向。

## 6. 三维旋转矩阵的性质

### 6.1 列向量相互正交且长度为 1

旋转只改变方向，不改变长度和夹角。因此，旋转矩阵的三个列向量必须：

- 长度均为 1；
- 两两垂直；
- 仍构成一个右手坐标系。

前两个条件可以统一写成：

$$
R^TR=I
$$

满足该关系的矩阵称为正交矩阵。

### 6.2 逆矩阵等于转置矩阵

由：

$$
R^TR=I
$$

可知：

$$
R^{-1}=R^T
$$

如果 $R$ 表示正向旋转，那么 $R^T$ 就表示撤销这次旋转。

这项性质非常实用，因为计算转置通常比计算一般矩阵的逆更简单、更稳定。

### 6.3 行列式等于 1

合法的三维旋转矩阵还必须满足：

$$
\det(R)=1
$$

只有 $R^TR=I$ 还不够。某些镜像反射矩阵同样满足正交条件，但其行列式为 $-1$。旋转不会把右手坐标系变为左手坐标系，所以旋转矩阵的行列式必须为 $1$。

全部三维旋转矩阵构成的集合记作：

$$
SO(3)=\left\{R\in\mathbb R^{3\times3}\mid R^TR=I,\ \det(R)=1\right\}
$$

这里暂时只需把 $SO(3)$ 理解为“所有合法三维旋转矩阵的集合”，无需进一步讨论它的高级数学结构。

### 6.4 旋转保持长度和夹角

设旋转后的向量为：

$$
\mathbf a'=R\mathbf a,
\qquad
\mathbf b'=R\mathbf b
$$

则：

$$
{\mathbf a'}^T\mathbf b'
=\mathbf a^TR^TR\mathbf b
=\mathbf a^T\mathbf b
$$

内积保持不变，因此向量长度和两向量夹角都保持不变。这正是“刚性旋转”的含义。

## 7. MATLAB 检验旋转矩阵

由于浮点数计算存在舍入误差，判断矩阵时不应直接使用完全相等，而应检查误差是否足够小：

```matlab
orthogonalityError = norm(R' * R - eye(3), 'fro');
determinantError   = abs(det(R) - 1);

tol = 1e-10;
isRotationMatrix = orthogonalityError < tol && ...
                   determinantError < tol;
```

可以写成函数：

```matlab
function tf = isRotationMatrix(R, tol)
    if nargin < 2
        tol = 1e-10;
    end

    tf = isequal(size(R), [3, 3]) && ...
         norm(R' * R - eye(3), 'fro') < tol && ...
         abs(det(R) - 1) < tol;
end
```

这里同时检查正交性和行列式，是为了排除镜像反射矩阵。

## 8. 使用旋转矩阵旋转向量

设向量 $\mathbf p$ 在某一坐标系中的坐标为：

$$
\mathbf p=
\begin{bmatrix}
p_x\\p_y\\p_z
\end{bmatrix}
$$

使用 $R$ 主动旋转该向量：

$$
\mathbf p'=R\mathbf p
$$

这里的含义是：

- 坐标系保持不动；
- 物理向量发生旋转；
- $\mathbf p$ 和 $\mathbf p'$ 都在同一个坐标系中表达。

MATLAB 示例：

```matlab
p = [1; 0; 0];

Rz90 = [0, -1, 0;
        1,  0, 0;
        0,  0, 1];

pRotated = Rz90 * p;
% pRotated = [0; 1; 0]
```

旋转前后向量长度应当相同：

```matlab
lengthError = abs(norm(pRotated) - norm(p));
```

## 9. 多次旋转的复合

### 9.1 最先执行的矩阵靠近向量

先使用 $R_1$ 旋转向量，再使用 $R_2$ 旋转结果：

$$
\mathbf p_1=R_1\mathbf p
$$

$$
\mathbf p_2=R_2\mathbf p_1
$$

代入得到：

$$
\mathbf p_2=R_2R_1\mathbf p
$$

所以总旋转矩阵是：

$$
R=R_2R_1
$$

对于列向量约定，计算顺序从右向左读取：最右侧的旋转最先作用。

### 9.2 三维旋转一般不可交换

绕不同轴旋转时，改变次序通常会改变结果：

$$
R_x(\alpha)R_y(\beta)
\ne
R_y(\beta)R_x(\alpha)
$$

这一点比二维旋转更重要。在二维中，所有旋转都绕同一条垂直于平面的轴，因此旋转矩阵可以交换；三维旋转可能绕不同方向，顺序便不能随意改变。

用 $90^\circ$ 旋转可以直接验证：

```matlab
Rx90 = [1, 0,  0;
        0, 0, -1;
        0, 1,  0];

Ry90 = [ 0, 0, 1;
         0, 1, 0;
        -1, 0, 0];

p = [0; 0; 1];

result1 = Ry90 * Rx90 * p;  % 先绕 x，再绕 y
result2 = Rx90 * Ry90 * p;  % 先绕 y，再绕 x
```

一般情况下，`result1` 与 `result2` 不相同。

### 9.3 为什么顺序会影响结果

第一次旋转会改变物体的朝向。如果第二次旋转是绕物体自身的轴进行，那么这个轴也已经随第一次旋转改变了方向。

即使两次旋转都绕固定坐标轴进行，不同顺序产生的空间运动路径也不同，因此最终姿态仍可能不同。

所以，看到一串旋转矩阵时，至少要确认：

1. 使用列向量还是行向量；
2. 每个旋转绕固定轴还是运动轴；
3. 矩阵从哪一侧开始作用。

## 10. 固定轴旋转与运动轴旋转

这是三维旋转中最容易混淆的内容之一。

### 10.1 固定轴旋转

固定轴也称空间轴或世界轴。无论物体已经怎样转动，后续旋转始终围绕最初坐标系中的轴进行。

若物体当前姿态为 $R$，再绕世界坐标系中的轴施加旋转 $Q$，则：

$$
R_{\mathrm{new}}=QR
$$

新的旋转从左侧乘入。

### 10.2 运动轴旋转

运动轴也称物体轴或自身轴。坐标轴固定在物体上，会随着物体一起转动。

若物体当前姿态为 $R$，再绕物体自身坐标轴施加旋转 $Q$，则：

$$
R_{\mathrm{new}}=RQ
$$

新的旋转从右侧乘入。

### 10.3 左乘和右乘为什么不同

$R$ 的列向量表示物体三个自身轴在世界坐标系中的方向。

- 左乘 $Q$：$Q$ 同时旋转这三列，即在世界坐标系中旋转整个物体坐标架；
- 右乘 $Q$：先在物体自身坐标中组合增量，再由 $R$ 将结果表达至世界坐标系。

因此，“左乘还是右乘”不是记号上的小差别，而是在说明旋转轴属于哪个坐标系。

## 11. 主动旋转与坐标系变换

### 11.1 主动旋转

主动旋转中，坐标系不变，物理向量被旋转：

$$
\mathbf p'=R\mathbf p
$$

### 11.2 被动变换

被动变换中，物理向量没有移动，只是换一个坐标系描述它。

设 ${}^A R_B$ 表示坐标系 $\{B\}$ 的三个轴在坐标系 $\{A\}$ 中的表达：

$$
{}^A R_B=
\begin{bmatrix}
|&|&|\\
{}^A\mathbf e_{x_B}&{}^A\mathbf e_{y_B}&{}^A\mathbf e_{z_B}\\
|&|&|
\end{bmatrix}
$$

同一向量在两个坐标系中的坐标满足：

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

该矩阵把“在 $B$ 中表达的坐标”转换为“在 $A$ 中表达的坐标”。

反向转换为：

$$
{}^B\mathbf p
=({}^A R_B)^{-1}{}^A\mathbf p
=({}^A R_B)^T{}^A\mathbf p
$$

因此：

$$
{}^B R_A=({}^A R_B)^T
$$

### 11.3 为什么两种情况会出现转置

主动旋转是让向量沿一个方向转动；坐标系变换则是物理向量不动，但观察它的坐标轴发生改变。

如果坐标系本身正向转过 $R$，那么同一向量在新坐标系中的坐标相当于执行反向旋转，因此出现 $R^{-1}=R^T$。

判断应使用 $R$ 还是 $R^T$ 时，不要只看“顺时针还是逆时针”，而应先回答：

- 是物理向量在动，还是坐标系在变？
- 已知坐标属于哪个坐标系？
- 结果需要在哪个坐标系中表达？

## 12. 多坐标系之间的旋转链

若已知坐标系 $\{C\}$ 相对于 $\{B\}$ 的方向 ${}^B R_C$，以及 $\{B\}$ 相对于 $\{A\}$ 的方向 ${}^A R_B$，则：

$$
{}^A\mathbf p
={}^A R_B{}^B\mathbf p
={}^A R_B{}^B R_C{}^C\mathbf p
$$

因此：

$$
{}^A R_C={}^A R_B{}^B R_C
$$

可以用相邻上下标检查乘法是否合理：

$$
{}^A R_{\cancel B}\,{}^{\cancel B}R_C
={}^A R_C
$$

中间坐标系 $B$ 被消去，只剩下起点 $C$ 和终点 $A$。

这一规则比死记矩阵顺序更可靠。只要每个矩阵的来源坐标系和目标坐标系写清楚，就能像连接链条一样组合旋转。

MATLAB 中直接按同一顺序相乘：

```matlab
R_A_B = Rz;
R_B_C = Ry;

R_A_C = R_A_B * R_B_C;
```

## 13. 相对旋转

设已知坐标系 $\{A\}$ 和 $\{B\}$ 相对于世界坐标系 $\{W\}$ 的方向：

$$
{}^W R_A,
\qquad
{}^W R_B
$$

现在希望求 $\{B\}$ 相对于 $\{A\}$ 的方向 ${}^A R_B$。

由旋转链：

$$
{}^W R_B={}^W R_A{}^A R_B
$$

两侧左乘 $({}^W R_A)^T$：

$$
{}^A R_B
=({}^W R_A)^T{}^W R_B
$$

这个公式可以理解为两步：

1. 使用 $({}^W R_A)^T$ 撤销坐标系 $A$ 在世界坐标系中的旋转；
2. 再观察坐标系 $B$ 剩余的相对方向。

MATLAB 写法：

```matlab
R_W_A = Rx;
R_W_B = Rz * Ry;

R_A_B = R_W_A' * R_W_B;
```

反向相对旋转为：

```matlab
R_B_A = R_A_B';
```

## 14. 含平移的三维坐标变换

纯方向向量只需要旋转，但位置点还会受到坐标系原点差异的影响。

设 ${}^A\mathbf t_B$ 表示坐标系 $\{B\}$ 的原点在坐标系 $\{A\}$ 中的位置，则点 $P$ 的坐标转换为：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B
$$

其含义是：

1. 使用 ${}^A R_B$ 将点相对于 $B$ 原点的坐标转换到 $A$ 的方向；
2. 加上 $B$ 原点在 $A$ 中的位置。

反向变换为：

$$
{}^B\mathbf p_P
=({}^A R_B)^T
\left({}^A\mathbf p_P-{}^A\mathbf t_B\right)
$$

反向时应先减去平移，再执行反向旋转。矩阵乘法不能随意调整这两个操作的顺序。

MATLAB 写法：

```matlab
p_B = [0.4; 0.2; 0.1];
t_A_B = [1.0; 0.5; 0.3];

p_A = R_A_B * p_B + t_A_B;

% 反向验证
p_B_recovered = R_A_B' * (p_A - t_A_B);
recoveryError = norm(p_B_recovered - p_B);
```

速度、力、位移等自由向量没有固定作用点，只转换方向，不添加平移：

$$
{}^A\mathbf v={}^A R_B{}^B\mathbf v
$$

## 15. 为什么需要齐次坐标

上一节的位置转换为：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B
$$

其中同时存在矩阵乘法和向量加法。若机器人包含许多依次连接的坐标系，每次都分开处理旋转和平移，公式会变得很长，也不方便统一连乘。

齐次坐标的作用，就是增加一个额外分量，把旋转和平移统一为一次矩阵乘法。

### 15.1 位置点的齐次坐标

三维位置点：

$$
\mathbf p=
\begin{bmatrix}
p_x\\p_y\\p_z
\end{bmatrix}
$$

写成齐次坐标后为：

$$
\widetilde{\mathbf p}=
\begin{bmatrix}
p_x\\p_y\\p_z\\1
\end{bmatrix}
$$

最后一个分量 $1$ 表示它是一个位置点。位置点会同时受到旋转和平移的影响。

### 15.2 方向向量的齐次坐标

方向、速度或位移等自由向量写成：

$$
\widetilde{\mathbf v}=
\begin{bmatrix}
v_x\\v_y\\v_z\\0
\end{bmatrix}
$$

最后一个分量为 $0$。这样做会让齐次矩阵中的平移部分自动失效，因此方向向量只旋转、不平移。

### 15.3 最后一个分量为什么不同

位置点表示空间中的具体位置，坐标系原点改变时，其坐标会改变；方向向量只描述大小和方向，与坐标系原点放在哪里无关。

因此：

- 点使用 $1$，使平移项保留下来；
- 向量使用 $0$，使平移项被消去。

这不是为了凑出四维矩阵，而是在代数中明确区分两种不同的几何对象。

## 16. 齐次变换矩阵

将旋转 ${}^A R_B$ 和平移 ${}^A\mathbf t_B$ 放入同一个矩阵：

$$
{}^A T_B=
\begin{bmatrix}
{}^A R_B&{}^A\mathbf t_B\\
\mathbf 0^T&1
\end{bmatrix}
$$

展开后为：

$$
{}^A T_B=
\begin{bmatrix}
r_{11}&r_{12}&r_{13}&t_x\\
r_{21}&r_{22}&r_{23}&t_y\\
r_{31}&r_{32}&r_{33}&t_z\\
0&0&0&1
\end{bmatrix}
$$

其中：

- 左上角 $3\times3$ 部分描述坐标系 $B$ 相对于 $A$ 的方向；
- 右上角 $3\times1$ 部分描述 $B$ 原点在 $A$ 中的位置；
- 最后一行使矩阵能够统一完成旋转和平移。

因此，${}^A T_B$ 完整描述了坐标系 $B$ 相对于坐标系 $A$ 的位姿。

“姿态”和“位姿”含义不同：

- 姿态只表示方向，使用旋转矩阵 $R$；
- 位姿同时表示方向和位置，使用齐次变换矩阵 $T$。

## 17. 齐次矩阵如何作用于点和向量

### 17.1 变换位置点

对位置点进行齐次变换：

$$
{}^A\widetilde{\mathbf p}_P
={}^A T_B{}^B\widetilde{\mathbf p}_P
$$

展开矩阵乘法：

$$
\begin{bmatrix}
{}^A\mathbf p_P\\1
\end{bmatrix}
=
\begin{bmatrix}
{}^A R_B&{}^A\mathbf t_B\\
\mathbf 0^T&1
\end{bmatrix}
\begin{bmatrix}
{}^B\mathbf p_P\\1
\end{bmatrix}
=
\begin{bmatrix}
{}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B\\1
\end{bmatrix}
$$

上面的前三行正好恢复了普通坐标变换公式。

### 17.2 变换方向向量

方向向量的最后一个分量为 $0$：

$$
\begin{bmatrix}
{}^A\mathbf v\\0
\end{bmatrix}
=
\begin{bmatrix}
{}^A R_B&{}^A\mathbf t_B\\
\mathbf 0^T&1
\end{bmatrix}
\begin{bmatrix}
{}^B\mathbf v\\0
\end{bmatrix}
=
\begin{bmatrix}
{}^A R_B{}^B\mathbf v\\0
\end{bmatrix}
$$

平移向量乘以 $0$ 后消失，所以方向向量不会被平移。

## 18. 齐次变换的复合

设存在三个坐标系 $\{A\}$、$\{B\}$ 和 $\{C\}$：

$$
{}^A\widetilde{\mathbf p}
={}^A T_B{}^B\widetilde{\mathbf p}
$$

$$
{}^B\widetilde{\mathbf p}
={}^B T_C{}^C\widetilde{\mathbf p}
$$

代入可得：

$$
{}^A\widetilde{\mathbf p}
={}^A T_B{}^B T_C{}^C\widetilde{\mathbf p}
$$

因此：

$$
{}^A T_C={}^A T_B{}^B T_C
$$

齐次变换与旋转矩阵使用完全相同的下标消去规则：

$$
{}^A T_{\cancel B}\,{}^{\cancel B}T_C
={}^A T_C
$$

### 18.1 连乘后旋转和平移怎样变化

设：

$$
T_1=
\begin{bmatrix}
R_1&\mathbf t_1\\
\mathbf0^T&1
\end{bmatrix},
\qquad
T_2=
\begin{bmatrix}
R_2&\mathbf t_2\\
\mathbf0^T&1
\end{bmatrix}
$$

则：

$$
T_1T_2=
\begin{bmatrix}
R_1R_2&R_1\mathbf t_2+\mathbf t_1\\
\mathbf0^T&1
\end{bmatrix}
$$

这里最容易误解的是平移部分并不是简单的 $\mathbf t_1+\mathbf t_2$，而是：

$$
R_1\mathbf t_2+\mathbf t_1
$$

原因是 $\mathbf t_2$ 原本在第二个局部坐标系中表达。将它与 $\mathbf t_1$ 相加之前，必须先用 $R_1$ 把方向转换到同一个坐标系中。

齐次矩阵乘法自动完成了这一步，这正是它在机器人运动链中非常实用的原因。

## 19. 齐次变换的逆

若：

$$
{}^A T_B=
\begin{bmatrix}
{}^A R_B&{}^A\mathbf t_B\\
\mathbf0^T&1
\end{bmatrix}
$$

则反向变换为：

$$
{}^B T_A=({}^A T_B)^{-1}
$$

其具体形式为：

$$
({}^A T_B)^{-1}
=
\begin{bmatrix}
({}^A R_B)^T&-({}^A R_B)^T{}^A\mathbf t_B\\
\mathbf0^T&1
\end{bmatrix}
$$

### 19.1 为什么逆变换的平移不是 $-\mathbf t$

从 $B$ 转到 $A$ 时：

$$
{}^A\mathbf p=R{}^B\mathbf p+\mathbf t
$$

求解 ${}^B\mathbf p$：

$$
{}^A\mathbf p-\mathbf t=R{}^B\mathbf p
$$

两侧左乘 $R^T$：

$$
{}^B\mathbf p
=R^T{}^A\mathbf p-R^T\mathbf t
$$

所以逆变换中的平移为：

$$
-R^T\mathbf t
$$

而不是简单的 $-\mathbf t$。平移向量也必须先被表达在反向变换所使用的坐标系中。

### 19.2 齐次矩阵的逆不等于转置

旋转矩阵满足：

$$
R^{-1}=R^T
$$

但一般的齐次变换矩阵不满足：

$$
T^{-1}=T^T
$$

原因是齐次矩阵包含平移，它不是正交矩阵。只能对左上角旋转部分使用转置，并按前面的公式处理平移。

## 20. 固定坐标系与自身坐标系中的位姿增量

与旋转矩阵相同，齐次变换从左侧还是右侧乘入具有不同含义。

设物体当前位姿为 $T$，增量变换为 $\Delta T$。

若增量相对于世界坐标系定义：

$$
T_{\mathrm{new}}=\Delta T\,T
$$

若增量相对于物体自身坐标系定义：

$$
T_{\mathrm{new}}=T\,\Delta T
$$

左乘表示在外部固定坐标系中施加运动，右乘表示在物体当前的局部坐标系中施加运动。由于矩阵乘法不可交换，两者通常产生不同结果。

## 21. MATLAB 实现齐次变换

### 21.1 构造齐次变换矩阵

```matlab
R_A_B = Rz * Ry * Rx;
t_A_B = [1.0; 0.5; 0.3];

T_A_B = [R_A_B, t_A_B;
         0, 0, 0, 1];
```

也可以先创建单位矩阵，再填入旋转和平移：

```matlab
T_A_B = eye(4);
T_A_B(1:3, 1:3) = R_A_B;
T_A_B(1:3, 4)   = t_A_B;
```

### 21.2 变换位置点

```matlab
p_B = [0.4; 0.2; 0.1];
p_B_h = [p_B; 1];

p_A_h = T_A_B * p_B_h;
p_A = p_A_h(1:3);
```

### 21.3 变换方向向量

```matlab
v_B = [1; 0; 0];
v_B_h = [v_B; 0];

v_A_h = T_A_B * v_B_h;
v_A = v_A_h(1:3);
```

由于 `v_B_h` 的最后一个分量为 `0`，结果不包含平移。

### 21.4 连乘多个变换

```matlab
T_A_C = T_A_B * T_B_C;
```

使用列向量时，最右侧的变换最先作用。下标则提供了更直接的检查方法：中间的 `B` 应当可以消去。

### 21.5 计算逆变换

可以直接使用：

```matlab
T_B_A = inv(T_A_B);
```

但已知矩阵是刚体齐次变换时，更能体现结构的写法是：

```matlab
R_B_A = R_A_B';
t_B_A = -R_A_B' * t_A_B;

T_B_A = [R_B_A, t_B_A;
         0, 0, 0, 1];
```

后一种写法明确利用了旋转矩阵的性质，也避免把齐次矩阵错误地整体转置。

## 22. 一组完整的 MATLAB 验证

下面的代码同时验证旋转矩阵性质、齐次坐标变换和逆变换：

```matlab
alpha = deg2rad(20);
beta  = deg2rad(-35);
gamma = deg2rad(50);

Rx = [1, 0,          0;
      0, cos(alpha), -sin(alpha);
      0, sin(alpha),  cos(alpha)];

Ry = [ cos(beta), 0, sin(beta);
       0,         1, 0;
      -sin(beta), 0, cos(beta)];

Rz = [cos(gamma), -sin(gamma), 0;
      sin(gamma),  cos(gamma), 0;
      0,           0,          1];

% 对列向量依次执行：先绕 x，再绕 y，最后绕 z
R_A_B = Rz * Ry * Rx;
t_A_B = [1.0; 0.5; 0.3];

T_A_B = [R_A_B, t_A_B;
         0, 0, 0, 1];

% 按刚体变换的结构求逆
T_B_A = [R_A_B', -R_A_B' * t_A_B;
         0, 0, 0, 1];

% 位置点：最后一个分量为 1
p_B_h = [0.6; -0.2; 0.8; 1];
p_A_h = T_A_B * p_B_h;
p_B_recovered = T_B_A * p_A_h;

% 方向向量：最后一个分量为 0
v_B_h = [1; 0; 0; 0];
v_A_h = T_A_B * v_B_h;

orthogonalityError = norm(R_A_B' * R_A_B - eye(3), 'fro');
determinantError   = abs(det(R_A_B) - 1);
inverseError       = norm(T_B_A * T_A_B - eye(4), 'fro');
recoveryError      = norm(p_B_recovered - p_B_h);
directionError     = norm(v_A_h(1:3) - R_A_B * v_B_h(1:3));

fprintf('正交性误差：%.3e\n', orthogonalityError);
fprintf('行列式误差：%.3e\n', determinantError);
fprintf('齐次逆变换误差：%.3e\n', inverseError);
fprintf('位置点恢复误差：%.3e\n', recoveryError);
fprintf('方向向量误差：%.3e\n', directionError);
```

这些误差应接近机器浮点精度，而不一定严格等于零。

## 23. 常见错误

### 23.1 写错 $R_y$ 的正弦符号

可以检查正 $90^\circ$ 旋转是否满足：

$$
R_y\left(\frac{\pi}{2}\right)\mathbf e_z=\mathbf e_x
$$

### 23.2 把矩阵书写顺序当成执行顺序

使用列向量时：

$$
R_3R_2R_1\mathbf p
$$

表示先执行 $R_1$，再执行 $R_2$，最后执行 $R_3$。

### 23.3 认为三维旋转可以交换

绕不同轴的旋转一般不可交换。调整乘法顺序之前，必须重新确认实际旋转过程。

### 23.4 混淆主动旋转和坐标变换

主动旋转中物理向量改变；坐标变换中物理向量不变，只改变其坐标表达。两者经常相差一个转置矩阵。

### 23.5 不说明旋转轴属于哪个坐标系

“绕 $x$ 轴旋转”仍不够完整。必须说明它是固定在世界中的 $x$ 轴，还是随物体一起运动的自身 $x$ 轴。

### 23.6 只检查 $R^TR=I$

镜像矩阵也可能满足正交条件。合法旋转矩阵还必须满足 $\det(R)=1$。

### 23.7 对位置点漏加平移

坐标系原点不重合时，位置点的转换需要旋转和平移；方向向量只需要旋转。

### 23.8 混淆位置点和方向向量

位置点的齐次坐标最后一项为 $1$，方向向量为 $0$。若将方向向量误写成 $1$，它会被错误地添加平移。

### 23.9 把齐次矩阵的逆写成转置

只有旋转矩阵满足 $R^{-1}=R^T$。齐次矩阵的逆还必须包含 $-R^T\mathbf t$。

### 23.10 直接将两个平移向量相加

复合两个变换时，第二个平移可能在局部坐标系中表达。正确的平移部分是 $R_1\mathbf t_2+\mathbf t_1$。

### 23.11 直接比较浮点结果是否相等

数值计算中应比较误差是否小于容差，例如：

```matlab
isClose = norm(R' * R - eye(3), 'fro') < 1e-10;
```

## 24. 公式总结

三个基本旋转矩阵：

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

旋转矩阵条件：

$$
R^TR=I,
\qquad
\det(R)=1,
\qquad
R^{-1}=R^T
$$

旋转复合：

$$
\mathbf p'=R_2R_1\mathbf p
$$

坐标转换：

$$
{}^A\mathbf p={}^A R_B{}^B\mathbf p
$$

旋转链：

$$
{}^A R_C={}^A R_B{}^B R_C
$$

相对旋转：

$$
{}^A R_B=({}^W R_A)^T{}^W R_B
$$

含平移的位置转换：

$$
{}^A\mathbf p_P
={}^A R_B{}^B\mathbf p_P+{}^A\mathbf t_B
$$

齐次变换矩阵：

$$
{}^A T_B=
\begin{bmatrix}
{}^A R_B&{}^A\mathbf t_B\\
\mathbf0^T&1
\end{bmatrix}
$$

齐次变换链：

$$
{}^A T_C={}^A T_B{}^B T_C
$$

齐次变换的逆：

$$
({}^A T_B)^{-1}
=
\begin{bmatrix}
({}^A R_B)^T&-({}^A R_B)^T{}^A\mathbf t_B\\
\mathbf0^T&1
\end{bmatrix}
$$

点与方向向量的齐次坐标：

$$
\widetilde{\mathbf p}=
\begin{bmatrix}\mathbf p\\1\end{bmatrix},
\qquad
\widetilde{\mathbf v}=
\begin{bmatrix}\mathbf v\\0\end{bmatrix}
$$

三维刚体变换的核心不是背诵矩阵，而是始终明确：哪个对象在运动、旋转或平移相对于哪个坐标系定义、各个量当前在哪个坐标系中表达，以及变换链的起点和终点分别是什么。
