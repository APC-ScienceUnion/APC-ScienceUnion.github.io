---
title: 由简入繁——代数学·Part1
date: 2019-12-28 12:00:00
tags: ['数学', '代数', '科普', '初等代数', '不等式','科普组第8小组']
categories: '数学'
katex: true
copyright_author: 'delta'
cover: https://i3.wp.com/wx4.sinaimg.cn/large/006UcwnJgy1ickpgpo99gj30de07agmz.jpg
---

{% note blue 'fas fa-equals' %}
&emsp;&emsp;代数是研究数、数量、关系、结构与代数方程（组）的通用解法及其性质的数学分支。初等代数一般在中学时讲授，介绍代数的基本思想：研究当我们对数字作加法或乘法时会发生什么，以及了解变量的概念和如何建立多项式并找出它们的根。代数的研究对象不仅是数字，还是各种抽象化的结构。
{% endnote %}

> &emsp;&emsp;作者：delta

&emsp;&emsp;代数是当今数学中最重要的分支之一。在它下面还能分出许多其他的分支，比如初等代数、高等代数，而高等代数还能分出更多枝叶。如果说数学是尤克特拉希尔的话，那么代数就是其中的阿斯加德。

&emsp;&emsp;顺带一提，几何是华纳海姆。

&emsp;&emsp;显然，近世代数在阿斯加德中拥有着等同于英灵殿的奥丁相同的权能。我们此行的目的便是觐见奥丁。然而，无论哪个国家，不先从守门人那里拿到通行证，我们都不可能直接觐见国王。所以，至少让我们先走上比弗罗斯特，跟海姆达尔——初等代数来一场交心的攀谈。

# 起源

&emsp;&emsp;目前普遍认为，公元前三世纪的古希腊数学家丢番图是代数学的鼻祖，而真正创立代数的则是古阿拉伯帝国时期的数学家花拉子米。后者常常因为名字而被中国的学生嘲笑。

&emsp;&emsp;然而，这种不恰当的嘲笑也没能给花拉子米带来多少名声。听说过他的终究只是少数人。相反，丢番图则因为他墓碑上的小学奥数练习题和著名的丢番图方程而被大多数人所知。

&emsp;&emsp;说来好笑，情况再次发生了戏剧般的转折：尽管很多人都听说过丢番图方程，但别说解决这类问题了，他们甚至连丢番图方程究竞是什么都不知道：仅仅停留在名词党的层面。

&emsp;&emsp;如果你以为这篇文章准备讲丢番图方程，那就大错特错了。我们说由简入繁，就要从真正的“简”入手：显然丢番图方程还不算真正的“简”，其本质才算。

&emsp;&emsp;方程的本质是什么？等式。

&emsp;&emsp;等式的核心是什么？“${=}$”。

&emsp;&emsp;让我们从等号开始，走入密米尔之泉。

# 等号

&emsp;&emsp;首先我们知道，如下的式子是正确的：

$$
\begin{aligned}
1 &= 1 \\
2 &= 1 + 1 \\
2 \times 5 - 6 &= 2 \times 2
\end{aligned}
$$

&emsp;&emsp;为什么是对的？因为这是奥丁的大神权能规定的。至于如此规定的原因，得等我们觐见到了奥丁才能与他探讨。但是，目前有一个显然的事实就是，我们都知道这是对的。

&emsp;&emsp;然而，对于这三行等式，左右的数字可以更换，并且有无数种更换组合模式。我们时间有限，毕竞游戏的香味在身边时时缭绕，必须找出一种手段来定性表达数字。这项工程是因为要找到数字的替代品而启动的，所以我们将其称为“代数工程”。

&emsp;&emsp;于是我们就得到了如下的等式，它们显然也是正确的：

$$
\begin{aligned}
x &= x \\
(a + b)x &= ax + bx \\
(a - b)x &= ax - bx
\end{aligned}
$$

&emsp;&emsp;（奥丁幕后发言：实际上这是因为 $(R - \{0\}, +, \cdot)$ 是一个可换环。不要在意我的循环定义。）

&emsp;&emsp;对于我们目前使用的实数和四则运算而言，这些等式都是通过四则运算和一些被称作“交换律(斯露德)”“结合律(希露德)”“分配律(奥特琳德)”的定律实现的。而这些运算和定律的使用规则，则是由海姆达尔告诉你的。

&emsp;&emsp;什么？你忘记海姆达尔是谁了？不要忘记他在本文中“初等代数”的设定啊喂！

&emsp;&emsp;（海姆达尔：我会伤心。）

&emsp;&emsp;因为你忘记了海姆达尔，所以他现在要报复你。然而，阿斯加德神界是一个文明的国度，所以报复的手段也很文明：海姆达尔给你出了几道题，如果解决不了这几道题，你这辈子都去不了阿斯加德了。

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 1：证明 $(a + b)^2 = a^2 + 2ab + b^2$。
{% endnote %}

&emsp;&emsp;太简单了。在瓦尔基里的帮助下，你很快解决了这个问题。

$$
\begin{aligned}
(a + b)^2 &= (a + b)(a + b) \\
&= a(a + b) + b(a + b) \\
&= a^2 + ab + ba + b^2 \\
&= a^2 + ab + ab + b^2 \\
&= a^2 + 2ab + b^2.
\end{aligned}
$$

&emsp;&emsp;海姆达尔不甘心，于是他又出了一题。

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 2：证明 $(a + b + e)^2 = a^2 + b^2 + e^2 + 2ab + 2be + 2ca$。
{% endnote %}

&emsp;&emsp;这个问题比之前的问题复杂，毕竟多了一个量，但是在瓦尔基里的协助下，你还是做出来了。

> 即得易见平凡，仿照上例显然。留作习题答案略，读者自证不难。
反之亦然同理，推论自然成立，略去过程QED，由上可知证毕。

&emsp;&emsp;正当海姆达尔无奈想给你放行时，你嘴欠地突然问了一句：“这个从刚刚开始就一直在我旁边帮我的自称瓦尔基里的三位女神是谁啊？”

&emsp;&emsp;三位瓦尔基里，也就是“交换律(斯露德)”“结合律(希露德)”“分配律(奥特琳德)”，对你完全没有读过北欧神话（数学）感到十分不爽。于是她们把你扣押了。在你想着怎么才能逃离扣押的时候，海姆达尔向你伸出了援手。

&emsp;&emsp;当然，天底下没有免费的午餐，你必须帮助海姆达尔解决他的问题才行。

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 3：证明 $\left(\sum_{i=1}^n a_i\right)^2 = \sum_{i=1}^n a_i^2 + 2 \sum_{1 \le i < j \le n} a_i a_j.$
{% endnote %}

&emsp;&emsp;你目前有两个选择：承认自己不知道 $\sum$，或是证明这道题。

&emsp;&emsp;你突然想起：

$$
\begin{aligned}
\sum_{i=1}^n a_i &= a_1 + a_2 + \Lambda + a_n. \\[0.9em]
\sum_{1 \le i < j \le n} a_i a_j &= a_1 a_2 + a_1 a_3 + \Lambda + a_1 a_n \\[0.9em]
&+ a_2 a_3 + a_2 a_4 + \Lambda + a_2 a_n \\[0.9em]
&+ \Lambda \\[0.9em]
&+ a_{n-1} a_n.
\end{aligned}
$$

&emsp;&emsp;现在你只有第二条路能走了。然而，对于 $n$ 项平方的展开，应该怎么处理？

&emsp;&emsp;你突然想起（再次）了数学归纳法：

&emsp;&emsp;&emsp;&emsp;证明 $n = 1$ 时命题成立；

&emsp;&emsp;&emsp;&emsp;假设 $n = m$ 时命题成立，那么可以推导出在 $n = m + 1$ 时命题也成立。

&emsp;&emsp;&emsp;&emsp;显然这个等式在 $n = 1,2,3$ 的时候都成立，于是：

&emsp;&emsp;&emsp;&emsp;假设 $n = m$ 时命题成立，$n = m + 1$ 时：

$$
\begin{aligned}
\left(\sum_{i=1}^{m+1} a_i\right)^2 &= \left(\sum_{i=1}^m a_i + a_{m+1}\right)^2 \\[0.9em]
&= \left(\sum_{i=1}^m a_i\right)^2 + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^m a_i^2 + 2 \sum_{1 \le i < j \le m} a_i a_j + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^{m+1} a_i^2 + 2 \sum_{1 \le i < j \le m+1} a_i a_j.
\end{aligned}
$$

&emsp;&emsp;海姆达尔很高兴，但这还不够：

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 4：证明 $\sum_{1 \le i < j \le n} (a_i - a_j)^2 = n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.$
{% endnote %}

&emsp;&emsp;在这个等式里我们需要计算 $a$ 出现的次数，所以你又开始搜索你的记忆。

&emsp;&emsp;你突然想起（第三次了，这主角光环有点强烈）了富比尼原理：

&emsp;&emsp;&emsp;&emsp;也叫算两次。根据对同一个量的两次不同方法计算得到的结果一定相同为基础证明等式。可扩展到重积分的计算，也可局限于组合数学的应用。

&emsp;&emsp;显然，对于 $a^2$ 而言，在 $j = 2,3,\Lambda,n$ 时共出现了 $n - 1$ 次；

&emsp;&emsp;而对于 $a$ 而言，在 $j = 3,4,\Lambda,n$ 时共出现了 $n - 2$ 次，但在 $i = 1$ 时存在 $j = 2$ 的情况，加上这一次也是共出现了 $n-1$ 次；

&emsp;&emsp;同理，对任意 $a_i$，都出现了 $n-1$ 次，于是你得到了：

$$
\begin{aligned}
\sum_{1 \le i < j \le n} (a_i - a_j)^2 &= (n-1) \sum_{i=1}^n a_i^2 - 2 \sum_{1 \le i < j \le n} a_i a_j \\[0.9em]
&= n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.
\end{aligned}
$$

&emsp;&emsp;这种计算出现次数证明等式的方法非常方便，于是你行云流水地证明了下一个问题：

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 5：证明 $\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).$
{% endnote %}

&emsp;&emsp;注意到在固定 $a_i$ 时，每一个 $b_j$ 都将出现 $n$ 次：对于固定 $b_j$ 也是一样的结果，所以：

$$
\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \sum_{i=1}^n \sum_{j=1}^n a_i b_j = \sum_{i=1}^n \sum_{j=1}^n a_j b_i = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).
$$

&emsp;&emsp;俗话说的好，事不过三。虽然不知道阿斯加德有没有这句谚语，然而毕竟秦始皇的歼星舰科技如此发达，也许把这句谚语从中国异闻带传到了北欧也说不定。海姆达尔同意把你救出去。

&emsp;&emsp;然而刚走出牢门，就碰到了三只瓦尔基里。

&emsp;&emsp;哦不，三柱。

&emsp;&emsp;为了不背弃自己的誓言，海姆达尔和瓦尔基里开启了内战。根据鲁迅说过的经典的“内战北方必胜理论”（鲁迅：我没有），效力于北方帝国的海姆达尔最终获得了胜利（这就是另一个世界的故事了，比如某腾讯游戏）。支持这个理论的例子很多，比如美国内战。

&emsp;&emsp;瓦尔基里同意让海姆达尔带走你，当然前提还是必须解题：

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Valkyrie's question：证明 $\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) \ge \left( \sum_{i=1}^{n} a_i b_i \right)^2$
{% endnote %}

&emsp;&emsp;这个问题你熟悉啊。这不就是~~柯西洗袜子~~柯西施瓦茨不等式吗？

&emsp;&emsp;等下？不等式？说好的讲等式来着，怎么扯到不等式了？

&emsp;&emsp;(奥丁幕后发言：不等式源于等式。)

&emsp;&emsp;啊，好，源于等式。

&emsp;&emsp;奥丁启发了你。聪明的你思考了一下。

&emsp;&emsp;你突然想起（第四次）了拉格朗日恒等式。通过之前回答海姆达尔问题的练习，你迅速得到了：

$$
\begin{aligned}
\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) - \left( \sum_{i=1}^{n} a_i b_i \right)^2
&= \sum_{i=1}^{n} \sum_{j=1}^{n} a_i^2 b_j^2 - \sum_{i=1}^{n} \sum_{j=1}^{n} a_i b_i a_j b_j \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i^2 b_j^2 + a_j^2 b_i^2 - 2a_i b_i a_j b_j \right) \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i b_j - a_j b_i \right)^2 \\[0.9em]
&= \sum_{1 \le i < j \le n} \left( a_i b_j - a_j b_i \right)^2 \ge 0.
\end{aligned}
$$

&emsp;&emsp;去掉末尾的大于等于零，就是拉格朗日恒等式的证明过程。这充分说明了，不等式也是来源于等式的。

&emsp;&emsp;实际上，对于均值不等式，也有其利用等式结构证明的方法。然而由于过于繁杂，本科普文不予给出，只是指出该证明可以在陈计著的代数不等式上找到。

&emsp;&emsp;同时，为了避免你再次遭遇被扣押的命运，海姆达尔告诉了你一些北欧神话（数学）中的故事：

&emsp;&emsp;阿贝尔变换：

$$
\sum_{k=m}^{n} f_k \left( g_{k+1} - g_k \right) = \left[ f_{n+1} g_{n+1} - f_m g_m \right] - \sum_{k=m}^{n} g_{k+1} \left( f_{k+1} - f_k \right)
$$

&emsp;&emsp;其中 $\{f_k\}$ 和 $\{g_k\}$ 是两个任意的数列。

&emsp;&emsp;舒尔不等式：

$$
a,b,c>0,\ r\in\mathbb{R} \implies a^r(a-b)(a-c) + b^r(b-c)(b-a) + c^r(c-a)(c-b) \ge 0
$$

&emsp;&emsp;同样也是用等式证明的。读者自证不难。

&emsp;&emsp;终于，海姆达尔带领着你走过了彩虹桥比弗罗斯特。你终于踏出了觐见奥丁的第一步。你并不知道，前方等待着你的，是索尔、希芙和邪神洛基…
