---
title: 'Hilbert第十问题的硬科普（五）：MRDP定理'
date: '2025-10-26 14:53:20'
tags: ['数学', '数论', '希尔伯特第十问题']
categories: '数学'
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%94%EF%BC%89%EF%BC%9AMRDP%E5%AE%9A%E7%90%86/fig-001-d4db078819.png'
copyright_author: 'silverxz'
katex: true
---

> 作者：silverxz
校对：Acidmoon

&emsp;&emsp;本篇证明丢番图集等价于递归可枚举集。

&emsp;&emsp;我们已经说过，丢番图集是递归可枚举集这个方向是比较显然的。设有丢番图集$S$和对应的丢番图方程$D(x_1,...,x_n,y_1,...,y_m)=0$，对于$(a_1,...,a_n)\in \mathbb{N}^n$，只需令图灵机$M$不断地尝试所有$y_1,...,y_m$是不是$D(a_1,...,a_n,y_1,...,y_m)=0$的解即可，若$(a_1,...,a_n)\in S$则总会停机。当然，解要以合理的方式枚举，保证任意可能的解都会在有限时间内被枚举到。

&emsp;&emsp;这里有一个微妙之处：给定一个$S$，我们并不知道$D$是什么。但是这样的$D$总是存在的，因此对应的图灵机$M$也总是存在的。

&emsp;&emsp;这样这个方向就证完了。我们真正关注的是**如何证明每个递归可枚举集都是丢番图集**。我们的证明方法是，构造丢番图函数和丢番图关系来模拟图灵机每一步的计算过程。这种方法其实并不罕见，如果读者学过基本的可计算理论，应当了解“计算历史方法”(computation history method)这种证明不可判定性的一类通用方法，我们这里用到的想法和那里差不多。

# 丢番图关系

&emsp;&emsp;虽然我们已经提过，丢番图关系无非和丢番图集是一回事，而丢番图函数也可以视为一种特殊的丢番图集/关系。但读者对此或许还没什么实际的感受，不知道我们可以做怎样的“构造”。因此在步入证明之前，我先展示一些简单的例子。

&emsp;&emsp;最简单的例子或许是“偶数”这个一元关系（谓词），如下刻画

$$
\text{Even}(a) := \exists y (a=2y)
$$

&emsp;&emsp;为什么这是一个丢番图关系？设$D(x,y)=x-2y$，则$D(x,y)=0$以$x$为参数、$y$为未知数的丢番图集$S$就定义为

$$
S=\{a\in \mathbb{N}\mid \exists y\left( D(a,y)=0\right)\}
$$

&emsp;&emsp;这就说明$\text{Even}$是一个丢番图关系。注意，因为我们已经把丢番图方程的解限制在自然数，因此所有存在量词$\exists$都**默认是在自然数中取值**。

&emsp;&emsp;与之类似，$\geq, >,=,<,\leq, \mid$（整除）这些二元关系也都是丢番图关系，以$\geq$为例，可以写作

$$
\geq (a,b):= \exists x(a=b+x)
$$

&emsp;&emsp;当然，$\geq (a,b)$这种写法还是比较别扭，我们之后对于这种二元关系还是按习惯的$a\geq b$去写。

&emsp;&emsp;然后是丢番图函数。我们记得，定义在自然数上的多元函数$f(x_1,...,x_n)$本质上也是其笛卡尔积的子集$F=\{(a_1,...,a_n,f(a_1,...,a_n))\mid (a_1,...,a_n)\in \mathbb{N}^n\}\subset \mathbb{N}^{n+1}$，当我们说$f$是丢番图函数时，说的其实是$F$是一个丢番图集/丢番图关系。加、减、乘自然都是丢番图函数。另一个例子是带余除法$\text{rem}(b,c)$，定义为$b$除以$c$的余数。由于

$$
a = \text{rem}(b,c) \Leftrightarrow a < c\ \&\ c \mid (b-a)
$$

&emsp;&emsp;即$a$是$b$除以$c$的余数等价于$a < c$且$c$整除$b-a$，因此这是丢番图函数。等等，你说“$\&$”？那是逻辑与。还记得我们已经证明了丢番图集对交和并封闭么？翻译成丢番图关系的语言，这就意味着**丢番图关系对逻辑与和逻辑或封闭**。于是我们可以把简单的丢番图关系和函数用逻辑符号连在一起，构造非常复杂的关系。这样，上面没有提到的$\neq$就也是丢番图关系，因为它是$>$或$<$。同理，取整除法也是丢番图函数，由于我们一直在自然数集上做运算，所以**后面的除法默认是取整除法**。

&emsp;&emsp;另外两个比较朴素的事实：第一，我们嵌套丢番图关系、在丢番图关系外面添更多的存在量词，这都仍然是丢番图关系，因为我们总可以展开成定义式，把存在量词都拎到最外层。我们要善用“丢番图关系中可以随便用存在量词”这件事，后面的很多构造其实都是基于此：**并不是直接构造想要的对象，而是描述这个对象的性质，用存在量词把它“取”出来**。第二，对于丢番图集$S$，$S\times \mathbb{N}^k$仍然是丢番图集，无非就是在对应方程中加几个无关变量的事，因此在做逻辑连接的时候不用考虑变量数是否匹配——都“扩充”一下就可以了。

&emsp;&emsp;综合以上的知识、利用数论的Bézout等式，读者可以验证最大公约数$\gcd$也是丢番图函数

$$
a=\gcd(b,c)\Leftrightarrow bc>0 \ \&\ a\mid b\ \&\ a\mid c\ \&\ \exists xy(a=bx-cy)
$$

&emsp;&emsp;现在，读者应该对我们的证明有了更多信心。丢番图关系的表达能力确实不弱。而我们的目标是用丢番图关系来表达这句话：设递归可枚举集$S\subset \mathbb{N}^n$，则存在一个图灵机$M$，一个输入$(a_1,...,a_n)$，和一个步数$k$，使$(a_1,...,a_n)\in S$等价于$M$在$k$步后停机（达到终状态$q_f$）。这就需要我们弄出一个丢番图函数，能模拟图灵机的$k$步运行。

&emsp;&emsp;为了模拟$k$步运行，当然就需要先模拟单步运行。而为了模拟单步运行，我们至少要先把图灵机的各种状态和运行的编码方式搞清楚。关键是，这种编码方式也得是“丢番图的”。

# 图灵机编码

&emsp;&emsp;我们回顾一下图灵机都有什么“信息”：一个**有限状态集**$Q=\{q_1,...,q_{|Q|}\}$，其中$q_1$是**初始状态**，$q_{|Q|}$是**终止状态**（也记作$q_f$）；一个**有限字符集**$\Sigma=\{0, 1,...,{|\Sigma|}-1\}$，其中$0$是空字符。我们就用$|Q|$和$|\Sigma|$表示状态集大小和字符集大小，少用点字母。最后，还有一个**转移函数**。

&emsp;&emsp;一般把图灵机的转移函数定义为一个整体。这里为了方便，我们把它拆开成三部分：设图灵机处于状态$q_i$，当前位置的字符是$s_j$，记转移到的状态下标为$Q(i,j)\in \{1,...,|Q|\}$，记图灵机写入的字符下标为$\Sigma(i,j)\in \{0, 1, ..., |\Sigma|-1\}$，记图灵机带头位置的移动方向为$D(i,j) \in \{-,\text{L},\text{R}\}$（不动、左移、右移，可视为$\{0,1,2\}$）。这样，我们获得了三个函数$Q(i,j),\Sigma(i,j),D(i,j)$，其中$Q$和$\Sigma$再次“重载”了它的含义，也是为了少用一些字母。读者应该能从上下文理解其含义。

&emsp;&emsp;对于图灵机来说，只有在$1\leq i\leq |Q|,0\leq j\leq |\Sigma|-1$时这些函数才有意义。但是我们需要让它们是丢番图函数，于是需要把定义域扩展到$\mathbb{N}\times \mathbb{N}$上。扩展处的取值其实依赖于我们后面的需求，这里就直接给出：令函数$Q(i,j)$在这些无意义的情况下取$i$，$\Sigma(i,j)$取$j$，$D(i,j)$取$-$（意为在不合法参数下保持状态、字符、方向不变）。现在我们断言，函数$Q,\Sigma,D$**都是丢番图函数**。

&emsp;&emsp;这是因为，它们相当于修改了一个丢番图函数（$f(i,j)=j$等）在有限个点（$1\leq i\leq |Q|,1\leq j\leq |\Sigma|$）处的取值，于是我们可以直接用逻辑表达式暴力地分类讨论它。举一个最简单的例子，如果我想表示一个“在$1$取$2$，在其他地方取$g(x)$”的函数$f(x)$，我只需要这样做

$$
y=f(x)\Leftrightarrow (x=1 \ \&\ y=2) \vee (x\neq 1\ \&\ y=g(x))
$$

&emsp;&emsp;此时只要$g(x)$是丢番图函数，$f(x)$就是丢番图函数。于是对$Q,\Sigma, D$也同理，只需要枚举这有限个合法的位置，最后令“其余情况”都取另一个我们想要的丢番图函数就行了。这就是对图灵机本身的刻画，$Q,\Sigma,D$也是后面会用的记号。

&emsp;&emsp;但是我们还需要刻画图灵机运行时的状态：带上的字符串$(s_1,...,s_l)$，当前的状态$q_i$，以及带头在带上的哪个位置。这三个量常常被称为图灵机的**格局**(configuration)，即图灵机运行时的瞬时状态。我们要想办法用适当的方式记录它们，直白地使用$s_1,...,s_l$是不行的，因为$l$随着图灵机的运行可能线性增长，而丢番图方程的未知数数量总是有限的。因此，我们需要**元组编码**的技术。

# 元组的编码：Cantor编码和位置编码

&emsp;&emsp;（其实我们只用到位置编码。但是Cantor编码也很简单优美，所以也展示一下，让读者感受一下两种编码的差异，更好理解“为什么选择位置编码”）

&emsp;&emsp;我们先展示一种比较“古典”的编码方法：Cantor编码。先考虑怎么编码$(a,b)\in \mathbb{N}^2$为一个自然数？Cantor给出了一个非常漂亮的办法，读者可以验证下面的函数$\text{Cantor}$给出了$\mathbb{N}^2\to \mathbb{N}$的双射

$$
\text{Cantor}(a,b)\mapsto \frac{(a+b)^2+3a+b}{2}
$$

&emsp;&emsp;不感兴趣也可以默认它成立。如果读者在验证时遇到了困难，可以尝试画一个二维的表格，代入$(0,0),(0,1),(1,0),...$，看看是否会发现一些有趣的事。

&emsp;&emsp;我们发现这是很好的编码，它是丢番图函数，而且从给定Cantor编码$c$还原$a,b$值的函数$\text{ElemA}(c),\text{ElemB}(c)$也是丢番图函数。以$\text{ElemA}(c)$为例，有

$$
a = \text{ElemA}(c)\Leftrightarrow \exists b (\text{Cantor}(a,b)=c)
$$

&emsp;&emsp;进一步，三元组可以用$\text{Cantor}_3(a,b,c)=\text{Cantor}(a, \text{Cantor}(b,c))$表示，取元素函数$\text{Elem}$也类似。由此类推，我们可以归纳地给出**任意定长元组的Cantor编码**$\text{Cantor}_n$。不过要注意的是，这里的$n$是一个确定常数，它不能作为一个变量输入进去。

&emsp;&emsp;这种编码可以简单地将定长元组编码为自然数，也能简单地还原。我们就用这种方法编码元组吗？不行，这种编码好但是还不够好，难以处理变长元组，更难以处理拼接等复杂的操作。

&emsp;&emsp;为此，我们要再引入一种新的编码，称为**位置编码**(positional coding)，它适用于元组元素有上界的情况。

&emsp;&emsp;设有元组$(x_1,...,x_n)$，且有上界$b>x_i$，则我们可以采用$b$进制，设

$$
a_x=x_1+x_2b + ... + x_n b^{n-1}
$$

&emsp;&emsp;则$(a_x,b,n)$就称为$(x_1,...,x_n)$的位置编码，称$b$为编码的**基**或**进制**。它记录了元组长度$n$，进制$b$，和$b$进制下的值$a_x$。读者可以不必理解Cantor编码的原理，但需要理解位置编码的原理（无非就是进制），因为我们会切实用到这个式子的许多特性（实际上就是进制的许多特性），让我们感叹这真是非常漂亮的选择。

&emsp;&emsp;有时候，我们还可以结合Cantor编码进一步编码这个三元组；另一些时候，我们实际上只需要这个$a_x$，因为$b$会是已知的，不需要编码进去，而$n$可能不重要。这时候我们也直接称$a_x$就是**位置编码**，依赖于上下文可以明确。多提一句：位置编码的一个好处是，如果$n$比原本的编码更大，只会导致解码出更多的后置$0$，但很多场合我们不在乎额外的$0$。

&emsp;&emsp;它的取元素函数也同样是丢番图函数，但是采用进制表示的坏处是我们必须引入一些更强的东西。记$\text{Elem}(a,b,d)$为第$d$位处的元素值，则

$$
e = \text{Elem}(a,b,d) \Leftrightarrow \exists xy(a = xb^d+eb^{d-1} + y \ \&\ e \text{<} b\ \&\ y\text{<}b^{d-1}\ \&\ d\text{>}0)
$$

&emsp;&emsp;你注意到我们引入了什么“更强的东西”吗？我们使用了$b^d$这样的指数函数，而我们还没有证明这是丢番图函数。事实上，如我们讲述的历史，这是非常难以证明的一部分。我们暂时**默认指数函数是丢番图函数**，这或许会留到下一篇补充证明。

&emsp;&emsp;于是，$\text{Elem}(a,b,d)$也是丢番图函数。但是别忘了我们引入它的初衷是为了能做更多复杂的操作。比如说，**对应元素加法**，只需要直接把位置编码加在一起就可以了（只要每一位的结果都不超过$b$），这对于位置编码来说几乎是平凡的。

&emsp;&emsp;再考虑另一个操作：**拼接**$\text{Cat}$。设有另一个元组$(y_1,...,y_m)$，我要把它拼接到$(x_1,...,x_n)$后面，构成$(x_1,...,x_n,y_1,...,y_m)$。若$(y_1,...,y_m)$也有上界$b$，则可以使用位置编码，编码为$(a_y,b,m)$。而拼接后的元组的$a$很容易计算，读者可以验证下面这个关系成立当且仅当$a,b,c$是拼接后的位置编码结果

$$
\text{Cat}(a_x,b_x,n,a_y,b_y,m,a,b,c) \Leftrightarrow b_x=b_y=b\ \&\ c=n+m\ \&\ a=a_x+a_yb^n
$$

&emsp;&emsp;严格来说，这里在后面还要$\&$上两个判断：$(a_x,b_x,n)$和$(a_y,b_y,m)$确实构成合法的位置编码。因为这里和Cantor编码不一样了，位置编码不一定是双射，所以可能有不合法的情况。判断合法性的关系$\text{Pos}(a,b,n)$也是丢番图关系，因为

$$
\text{Pos}(a,b,n)\Leftrightarrow b\geq 2 \ \&\ a < b^n
$$

&emsp;&emsp;同样，这也需要默认指数函数是丢番图函数。

# 图灵机格局的编码

&emsp;&emsp;有了位置编码，我们就可以回过头来完成我们没做完的图灵机格局的编码了。已经提到过，图灵机的格局包含带上字符串、带头位置、当前状态三个信息。实际上，我们可以把它们总结成两个元组：第一个元组$(0,...,0,i,0,...,0)$同时刻画带头所在的位置和图灵机当前的状态$q_i$，第二个元组$(s_1,...,s_l)$刻画图灵机当前带上的字符串。它们的长度都是$l$。

&emsp;&emsp;更重要的是，这两个元组中元素的取值都有上界。第一个元组的元素不可能超过图灵机的状态数$|Q|$，第二个元组的元素则不可能超过图灵机的字符集大小$|\Sigma|$。因此，我们选取一个固定的基$\beta>\max\{|Q|,|\Sigma|\}$，使用位置编码将第一个元组编码为$(p,\beta,l)$，第二个元组编码为$(t,\beta,l)$。

&emsp;&emsp;由于$\beta$是常量，$l$是公共长度（而且后面会看到，我们并不怎么需要它），所以我们直接把$p,t$视为**图灵机格局的编码**。为了方便，我们也使用$p,t$**指代这两个元组本身**。

# 图灵机单步运行的丢番图函数

&emsp;&emsp;好，准备工作已经完成！轮子已经造个差不多了，现在开始组装。这一部分的目标是先造出$\text{NextP}(p, t)$和$\text{NextT}(p, t)$这两个丢番图函数，分别表示格局$p,t$下图灵机单步运行后的格局的编码。这将会用于后续造出$\text{AfterP}(k,p,t)$和$\text{AfterT}(k,p,t)$这两个丢番图函数，表示格局$p,t$经过$k$步运行后的格局编码。

&emsp;&emsp;先从$\text{NextT}(p,t)$入手，它的想法比较简单。想想我们要做什么：要根据元组$p=(0,...,0,i,0,...,0),t=(s_1,...,s_l)$产生一个新的元组$t'=(s_1',...,s_l')$，其中，在元组$p$取$0$的位置处只需照搬$t$的值到$t'$即可，在取$i$的位置处（带头所指位置）则需要改变对应的字符。这就和我们已有的图灵机函数$\Sigma(i,j)$作用是一致的，因为$\Sigma(i,j)$会在$i=0$时直接输出$j$本身，否则输出改变后的字符（其实我们正是根据这种需求设计了$\Sigma(i,j)$）。

&emsp;&emsp;但是$\Sigma$函数只能处理单个位置的情况，而我们希望处理的是整个元组。为此，我们需要造一个**语法糖**，让一个函数能从单一元素扩展到一个变长元组上，对元组上的每个元素都做一遍这个函数。这对你来说一定不难理解，因为这种语法糖在现代的程序语言中已经很常见。

&emsp;&emsp;一般地，考虑一个丢番图函数$f(x)$，并假设以下涉及的元组中元素均小于$b$。我们希望构造一个丢番图函数$f_b(a,c)$，将位置编码$(a,b,c)$所编码的元组$(a_1,...,a_c)$映射成$(f(a_1),...,f(a_c))$的位置编码$(f_b(a,c),b,c)$。当$(a,b,c)$不构成一个合法编码时，$f_b(a,c)$可以任意指定。

&emsp;&emsp;这个构造需要一点“注意力”，且稍微有点啰嗦。我将给出构造的轮廓，证明由你补全。**关键在于这样的想法**：因为值域$b$是有限常量，我们枚举值域，将元组按值域拆成一些$01$向量。

&emsp;&emsp;具体来说，设$h_i(i=0,...,b-1)$是向量$(h_{i,1},...,h_{i,c})$的位置编码，其中$h_{i,j}$在$a_j=i$时取$1$，否则取$0$。意思是，$h_i$记录了$a$在哪些位置取了$i$。

&emsp;&emsp;我们还记得位置编码是可以直接做加法的。因此注意到，

$$
0\cdot h_0 + 1\cdot h_1 + \dots + (b-1)\cdot h_{b-1}=a
$$

&emsp;&emsp;同时注意到，

$$
f(0)\cdot h_0 + f(1)\cdot h_1 + \dots + f(b-1)\cdot h_{b-1}=f_{b}(a,c)
$$

&emsp;&emsp;因此，只需要说明$h_i$是可以通过丢番图函数和关系确定的向量，即可说明$f_b(a,c)$是丢番图函数。

&emsp;&emsp;定义函数$\text{Repeat}(x,b,c)$是元组$(x,x,...,x)$（$x\text{<}b$，重复$c$次）的以$b$为基的位置编码。定义关系$\text{Orth}_b(x_1,x_2, c)$表示$(x_1,b,c)$和$(x_2,b,c)$编码的元组是$01$向量且相互正交（同一个位置不会出现两个$1$）。你可以验证它们都是丢番图的。于是，你可以用这两个丢番图关系连同前面的式子（本质上也是一个丢番图关系，因为$b$是常量）唯一确定所有的$h_i$。这就说明$f_b(a,c)$是丢番图函数。注意这里就用到了之前提过的想法：我们不是直接写出$h$，而是通过$\text{Repeat}$等关系去**限制**$h$，让满足条件的$h$存在且唯一存在，然后我们再用存在量词$\exists$把它取出来。

&emsp;&emsp;更一般地，这个构造实际上可以扩展到多元函数$f(x_1,...,x_n)$，以造出$f_b(a_1,...,a_n,c)$，因为我们仍然只需要做有限的枚举。这就是我们想要的了。

&emsp;&emsp;回到我们对$\text{NextT}(p,t)$的构造上来，有了这个语法糖我们就已经做完了，它就是

$$
t' = \text{NextT}(p,t)\Leftrightarrow \exists w (t'=\Sigma_\beta (p, t, w))
$$

&emsp;&emsp;这里$w$就充当元组长度。读者可能会发现，当$w>l$时，$p,t$也能被解码，这会不会导致得到错误的$t'$？并不会，因为这只会解码出多余的$0$，经过$\Sigma$映射后还是$0$，于是也不影响$t'$的值。我们非要这样做的原因其实是：$l$会随着图灵机的运行变化，所以我们不容易且没必要维护一个变化的$l$，而是只利用$l$的存在性和“冗余$0$不改变位置编码”的良好性质。

&emsp;&emsp;于是我们就有了$\text{NextT}$，它虽然有些冗长，但思路并不复杂。然后是$\text{NextP}(p,t)$，它的思路就没那么直接了。$t$的变化是“逐元素”的，所以我们可以用那个语法糖方便地解决；然而图灵机的带头会左右移动，这导致$p$的变化依赖于“附近”的值。

&emsp;&emsp;但是，这并非不能克服的困难。注意到，位置编码可以轻松地通过乘$\beta$和除以$\beta$移位！对于一个以$\beta$为基的位置编码$a$，我们用$a^L=a/\beta$（取整除法）表示**左移**（去掉第一个元素，同时后面补$0$）；用$a^R=a\beta$表示**右移**（第一个元素变成$0$，其余元素右移一位）。

&emsp;&emsp;这样，我们就可以对左右移位后的元组使用我们刚才的语法糖，表现在单个元素上就是“同时考虑到附近的元素”。具体来说，我们希望定义一个函数$DQ$（因为它会同时结合图灵机的函数$D,Q$），令它应用语法糖后的$DQ_\beta$以如下方式给出$\text{NextP}$

$$
p'=\text{NextP}(p,t)\Leftrightarrow \exists w (p'=DQ_\beta(p^L,p,p^R,t^L,t,t^R,w))
$$

&emsp;&emsp;如果你已经明白了我们要干什么那就太好了，毕竟给出$DQ$的定义实在是很麻烦的事。如果你还没明白，可以结合对$DQ$的具体定义再验证或领会一下。我们定义$DQ(i_r, i, i_l, t_r, t, t_l)$如下（注意这里左右反过来了，因为将$p$左移，反而是把右边的元素移过来，所以$p^L$对应的变量记作$i_r$，其他同理）：

$$
DQ=\left\{\begin{matrix}
  Q(i_l,j_l) & i_l>0, i=i_r=0,D(i_l,j_l)=L \\
  Q(i,j) & i_l=i_r=0, i>0, D(i,j)=-\\
  Q(i_r,j_r) & i_l=i=0, i_r>0, D(i_r,j_r)=R\\
  0 & \text{otherwise}
\end{matrix}\right.
$$

&emsp;&emsp;于是，$\text{NextP}$就也弄出来了。

# 图灵机多步运行的丢番图函数

&emsp;&emsp;曙光就在眼前。现在我们证明$\text{AfterP}(k,p,t)$和$\text{AfterT}(k,p,t)$也都是丢番图函数，它们表示格局$p,t$经过$k$步运行后的格局编码。

&emsp;&emsp;这里的麻烦很明显是这个$k$。我们都知道把$\text{NextP}$和$\text{NextT}$迭代$k$次就能得到这两个函数，但是$k$是变量而非常量，所以这种迭代不能说明是丢番图的。

&emsp;&emsp;解决的思路是这样的：类似“计算历史方法”，我们考虑这$k$次的全部计算过程（即$k+1$个格局），找到足够的条件把它们“限制住”，再用存在量词把它们取出来。

&emsp;&emsp;仍然取前述$\beta$作为位置编码的进制。我们记$p_0=p,t_0=t$，然后记$p_i,t_i(i\leq k)$是经过$i$步迭代之后的编码结果。

&emsp;&emsp;还记得位置编码是可以把元组拼接在一起的。为了处理这$k+1$个格局，我们要把它们拼起来。但是，拼接操作需要指定元组的长度，而格局元组的长度是在变化的，怎么办？没关系，我们可以指派一个比所有元组都长的长度$l$，这样无非会导致解码时出现一些后置的$0$，但我们已经明白，额外的$0$并不会带来什么错误。

&emsp;&emsp;具体来说，设$(p_L,\beta, kl)$是$(p_0,\beta, l),(p_1,\beta,l),...,(p_{k-1},\beta, l)$这些位置编码拼起来之后的结果；设$(p_R,\beta, kl)$是$(p_1,\beta, l),(p_2,\beta,l),...,(p_{k},\beta, l)$这些位置编码拼起来之后的结果。对$t_L,t_R$也是这样。

&emsp;&emsp;为什么要这样设，而不是把$k+1$个格局全拼起来？是因为有**如下的观察**：$p_R=\text{NextP}(p_L,t_L),t_R=\text{NextT}(p_L,t_L)$。这是因为，$\text{NextT}$是逐元素做的，就算我们把多个格局拼起来，它也能一起完成；而$\text{NextP}$也几乎是逐元素做的，只不过多考虑了相邻元素，我们只需要在格局之间插入$0$就可以避免相互干扰，而这只需要让$l$取大一点就可以做到。

&emsp;&emsp;这个观察给出了重要的限制关系。此外我们还可以发现，若设$(p_M,\beta, (k-1)l)$是“中间部分”，即$(p_1,\beta,l),...,(p_{k-1},\beta,l)$拼起来的结果，再同样设$t_M$，则：$(p_L,\beta,l)$是$(p_0,\beta,l)$和$(p_M,\beta,(k-1)l)$的拼接，而$(p_R,\beta,l)$是$(p_M,\beta, (k-1)l)$和$(p_k,\beta,l)$的拼接。$t_L,t_R$同理。

&emsp;&emsp;这种变换看起来几乎是平凡的，但实质上不同：现在$p_L$不再是$k$个元组的拼接，而变成了$p_0$和$p_M$两个元组的拼接，这就变成了一个丢番图函数的操作；对$p_R,t_L,t_R$也是这样。但，$p_M,t_M$还是$k-1$个元组的拼接，看起来我们也没有真正解决问题？不。现在我们就可以断言：**上述的关系已经唯一确定了**$p_L,t_L,p_M,t_M,p_R,t_R,p_k,t_k$。

&emsp;&emsp;为了说明这一点，我们整理一下已经获得的约束关系，如下（我们用$+_c$来表示元组的拼接操作）：

<span class="katex-display"><span class="katex"><span class="katex-mathml"><math><semantics><mtable rowspacing="0.24999999999999992em" columnalign="right left" columnspacing="0em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><msub><mi>p</mi><mi>R</mi></msub></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mtext>NextP</mtext><mo stretchy="false">(</mo><msub><mi>p</mi><mi>L</mi></msub><mo separator="true">,</mo><msub><mi>t</mi><mi>L</mi></msub><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><msub><mi>t</mi><mi>R</mi></msub></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mtext>NextT</mtext><mo stretchy="false">(</mo><msub><mi>p</mi><mi>L</mi></msub><mo separator="true">,</mo><msub><mi>t</mi><mi>L</mi></msub><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mo stretchy="false">(</mo><msub><mi>p</mi><mi>L</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>k</mi><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mo stretchy="false">(</mo><mi>p</mi><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>l</mi><mo stretchy="false">)</mo><msub><mo>+</mo><mi>c</mi></msub><mo stretchy="false">(</mo><msub><mi>p</mi><mi>M</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mo stretchy="false">(</mo><mi>k</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mo stretchy="false">(</mo><msub><mi>p</mi><mi>R</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>k</mi><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mo stretchy="false">(</mo><msub><mi>p</mi><mi>M</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mo stretchy="false">(</mo><mi>k</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi>l</mi><mo stretchy="false">)</mo><msub><mo>+</mo><mi>c</mi></msub><mo stretchy="false">(</mo><msub><mi>p</mi><mi>k</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mo stretchy="false">(</mo><msub><mi>t</mi><mi>L</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>k</mi><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mo stretchy="false">(</mo><mi>t</mi><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>l</mi><mo stretchy="false">)</mo><msub><mo>+</mo><mi>c</mi></msub><mo stretchy="false">(</mo><msub><mi>t</mi><mi>M</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mo stretchy="false">(</mo><mi>k</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mo stretchy="false">(</mo><msub><mi>t</mi><mi>R</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>k</mi><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="true"><mrow><mrow></mrow><mo>=</mo><mo stretchy="false">(</mo><msub><mi>t</mi><mi>M</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mo stretchy="false">(</mo><mi>k</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi>l</mi><mo stretchy="false">)</mo><msub><mo>+</mo><mi>c</mi></msub><mo stretchy="false">(</mo><msub><mi>t</mi><mi>k</mi></msub><mo separator="true">,</mo><mi>β</mi><mo separator="true">,</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr></mtable><annotation encoding="application/x-tex">\begin{align*}
p_R&amp;=\text{NextP}(p_L,t_L)\\
t_R&amp;=\text{NextT}(p_L,t_L)\\
(p_L,\beta,kl)&amp;=(p,\beta,l)+_c(p_M,\beta,(k-1)l)\\
(p_R,\beta,kl)&amp;=(p_M,\beta,(k-1)l)+_c(p_k,\beta,l)\\
(t_L,\beta,kl)&amp;=(t,\beta,l)+_c(t_M,\beta,(k-1)l)\\
(t_R,\beta,kl)&amp;=(t_M,\beta,(k-1)l)+_c(t_k,\beta,l)
\end{align*}
</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:9.000000000000002em;vertical-align:-4.250000000000001em;"></span><span class="mord"><span class="mtable"><span class="col-align-r"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.750000000000001em;"><span style="top:-6.910000000000001em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.00773em;">R</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.00773em;">R</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.9099999999999993em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:-2.4099999999999993em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.00773em;">R</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:-0.9099999999999997em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:0.5900000000000007em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.00773em;">R</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:4.250000000000001em;"><span></span></span></span></span></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.750000000000001em;"><span style="top:-6.910000000000001em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mord text"><span class="mord">NextP</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-5.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mord text"><span class="mord">NextT</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">L</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.9099999999999993em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mopen">(</span><span class="mord mathdefault">p</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin"><span class="mbin">+</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.151392em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">c</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.10903em;">M</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mopen">(</span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:-2.4099999999999993em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.10903em;">M</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mopen">(</span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin"><span class="mbin">+</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.151392em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">c</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.33610799999999996em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.03148em;">k</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:-0.9099999999999997em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mopen">(</span><span class="mord mathdefault">t</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin"><span class="mbin">+</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.151392em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">c</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.10903em;">M</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mopen">(</span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span><span style="top:0.5900000000000007em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.32833099999999993em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.10903em;">M</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mopen">(</span><span class="mord mathdefault" style="margin-right:0.03148em;">k</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin"><span class="mbin">+</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.151392em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight">c</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathdefault">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.33610799999999996em;"><span style="top:-2.5500000000000003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathdefault mtight" style="margin-right:0.03148em;">k</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.05278em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault" style="margin-right:0.01968em;">l</span><span class="mclose">)</span></span></span></span><span class="vlist-s"></span></span><span class="vlist-r"><span class="vlist" style="height:4.250000000000001em;"><span></span></span></span></span></span></span></span></span></span></span></span>

&emsp;&emsp;首先存在性是显然的，因为我们确实能运行$k$步图灵机，我们只需要证明唯一。为此，我们逐元素地考虑$p_L$（代表的元组）等。

&emsp;&emsp;$p_L$的前$l$个元素正是$p$自己，因此已经被唯一确定了。根据$p_R=\text{NextP}(p_L,t_L)$和$p_R$的分解，这就意味着$p_M$的前$l-1$个元素已经被确定了（因为$\text{NextP}$结果的前$l-1$个元素只依赖于输入的前$l$个元素）。而确定了$p_M$的前$l-1$个元素，根据$p_L$的分解，就意味着确定了$2l-1$个元素……如此重复下去，整个$p_L,p_M$就都被确定了。

&emsp;&emsp;如果你敏锐地抓住了细节，可能会有疑惑：$p_R$的最后一个元素还没有被确定！因为$\text{NextP}$能确定的输出会比它的输入少一位。但是再回想一下：我们已经把$l$调大了一点，所以$p_R$的最后一个元素其实就是$0$。如此，我们就也确定了$p_R,p_k$。而$t_L,t_R,t_M,t_k$也是完全同理（甚至更简单）的。

&emsp;&emsp;而这就等同于$p_k=\text{AfterP}(k,p,t)$和$t_k=\text{AfterT}(k,p,t)$是丢番图函数。如果你非要显式写出来，只需要用一大堆存在量词：存在充分大的$l$，存在$p_L,p_M,...$那一大堆，然后把上面的条件用逻辑与连在一起。于是，最后的一部分就做完了。

# Hilbert第十问题不可解

&emsp;&emsp;到这里，一切已经呼之欲出了。对于一个图灵机$M$和它对应的递归可枚举集$S$，我们如前述定义那些丢番图函数。那么，$(a_1,...,a_n)\in S$的充要条件正是：

$$
\exists krpt (\text{Elem}(\text{AfterP}(k,p,t),\beta, r)=|Q|\ \&\ p=1\ \&\ t=\sum_{i=1}^n a_i \beta^{i-1})
$$

&emsp;&emsp;解释一下这三个条件的意思：$\text{Elem}(\text{AfterP}(k,p,t),\beta, r)$是说，在$k$步以后，图灵机带头停在位置$r$，且此时状态是$q_{|Q|}$（终止状态）；$p=1$是初始状态$q_1$的下标，因此是$(1,0,...)$这个元组的编码，代表图灵机初始带头和状态的编码；$t=\sum_{i=1}^n a_i \beta^{i-1}$则是图灵机初始输入的编码，注意$n$是确定常数，因此这样累加是合法的操作。综合起来就是说，图灵机以$(a_1,...,a_n)$为输入，运行$k$步后停机。

&emsp;&emsp;三个条件都是丢番图的，这就表明$S$是丢番图集。综上我们证明了MRDP定理

> 丢番图集等价于递归可枚举集。

&emsp;&emsp;而我们已经知道，确实存在不是递归集的递归可枚举集（比如图灵停机问题对应的递归可枚举集）。注意到我们上面的过程完全是构造性的，所以理论上，给定一个这样的递归可枚举集对应的图灵机，我们就能显式写出这个集合对应的一族丢番图方程的变量、系数具体是什么。而且，这样的一族丢番图方程必然是不可判定整数解存在性的（否则会导致这个集合可判定）。

&emsp;&emsp;既然连“一部分”丢番图方程的可解性都无法判定（而且我们能切实给出这些方程的变量和系数，因此不存在编码转换的障碍），那么全部丢番图方程的可解性当然也无法判定。综上，我们可以宣布：**Hilbert第十问题不可解**。

&emsp;&emsp;(\完结撒花/)
