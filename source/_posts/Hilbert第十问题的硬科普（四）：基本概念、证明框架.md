---
title: 'Hilbert第十问题的硬科普（四）：基本概念、证明框架'
date: '2025-09-02 12:23:00'
tags: ['数学', '数论', '希尔伯特第十问题']
categories: '数学'
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-001-d4db078819.png'
copyright_author: 'silverxz'
---

> 作者：silverxz
校对：时光

&emsp;&emsp;我们开始进入真正的证明。这个证明并不是原始的证明，而是Matiyasevich大幅度简化后的证明(来自其著作Hilbert's Tenth Problem)，因此会和我们介绍的历史中的路线不太一样。我们也会进一步简化一些论述，跳过一些过于繁琐但没有什么新东西的地方。我们的证明会频繁采用“倒叙”，从结论出发，描述证明这个结论需要什么工具，然后逐步填补这些工具。同时，我也会用大量的自然语言去感性描述证明过程、并阐述证明的动机。我认为这是更符合科普的讲法。

# 什么是Hilbert第十问题

&emsp;&emsp;我们先重新叙述我们要解决的问题。

&emsp;&emsp;丢番图方程是一个整系数多变量多项式方程，用<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" /> 来表示。若我们不关心或已知其自变量，也将它简写做 D 。

&emsp;&emsp;我们关注的是这个方程有没有整数解。对于给定的 D ，这个答案为“是”或“否”的问题就称为“单一问题”，这个问题的信息就由 D 这个多项式本身确定。

&emsp;&emsp;每一个丢番图方程都确定了一个这样的单一问题。所有这样的单一问题放在一起，就构成了判定问题：是否存在一个算法（图灵机 M ），使给定任何一个丢番图方程 D ，M 都能给出 D 对应的单一问题（即 D 有没有整数解）的正确结果？

&emsp;&emsp;这个问题就是Hilbert第十问题。我们的目标是：证明不存在这样的算法。

&emsp;&emsp;但实际上我们并不是真的去讨论算法，而是证明另一个命题：

> MRDP定理：丢番图集与递归可枚举集等价。

&emsp;&emsp;然后如我们熟知的（假如你不知道的话，我后面有一段关于递归集的简短叙述，你可以试试能不能看懂），存在不可判定的递归可枚举集，于是存在不可判定的丢番图集，也就存在一族不可判定有无整数解的丢番图方程。连其中一族丢番图方程的可解性都无法判定，自然就更不可能判定全部丢番图方程的可解性了，这就宣告Hilbert第十问题不可解。

&emsp;&emsp;本篇，我们会先给出丢番图方程的一些简单性质，同时将涉及到的概念予以更详细的阐述。下一篇我们证明MRDP定理，基本的思想是使用丢番图关系模拟图灵机的运行。但是为了篇幅，我们不得不在下一篇默认“指数函数是丢番图的”，这可能会在下下一篇补充一个证明（也可能咕掉）。所以按计划就是，接下来的2-3篇完成Hilbert第十问题的证明。现在正式开始。

# 两个重要的观察：方程组&自然数解

&emsp;&emsp;第一个重要的观察：丢番图方程组的可解性等价于某个丢番图方程的可解性。

&emsp;&emsp;这是因为，方程组 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-003-85abbbe16f.png" alt="" />等价于：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-004-fdfbc2441b.png" alt="" />

&emsp;&emsp;而上式左端展开后，毫无疑问也是一个整系数多变量多项式，因此仍然是一个丢番图方程。这个观察就让我们可以放心地“堆叠”丢番图方程，去处理方程组——反正最后总能捏成一个。

&emsp;&emsp;第二个重要的观察：**判定有无整数解，等价于判定有无自然数解**。（我们认为自然数包括0）

&emsp;&emsp;它的意思是：某个丢番图方程 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-005-9d338bd22e.png" alt="" />=0 有整数解，等价于另一个丢番图方程 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-006-ea95bde82d.png" alt="" /> =0有自然数解；反之亦然。并且，我们能从 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-005-9d338bd22e.png" alt="" />计算出 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-006-ea95bde82d.png" alt="" />，反之亦然。这样，如果我们有判定有无整数解的图灵机 M，就能简单构造出判定有无自然数解的图灵机 M′，反之亦然。在这种意义下，判定有无整数解和判定有无自然数解是“相同难度”的。而自然数解更方便我们处理。

&emsp;&emsp;证明如下：若我们要判定 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" /> 有无整数解，这等价于判定 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-007-5153ea665e.png" alt="" /> 是否有自然数解，这个方向就立刻得到了。反过来，若我们要判定 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" /> 有无自然数解，根据**Lagrange四平方和定理**（每个自然数都能分解为4个自然数的平方和），这就等价于判定：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-008-8e20706703.png" alt="" />

&emsp;&emsp;有没有整数解。显然这两个方向的构造都是可以用图灵机做到的。这样就证明了第二个观察。

&emsp;&emsp;我们会看到自然数解更方便。因此后面我们直接只研究有无自然数解的判定问题。

# 丢番图集

&emsp;&emsp;**丢番图集**，是指一个 n 元自然数序对构成的集合<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-009-5e8820990e.png" alt="" />，满足：存在一个丢番图方程<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-010-8682e650ed.png" alt="" />，使：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-011-227371264f.png" alt="" />

&emsp;&emsp;有(自然数)解

&emsp;&emsp;称 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-012-d60ebac3c8.png" alt="" /> 是 S 对应的丢番图方程。这里，我们其实把 D 当成了类似参数方程的东西，或者说“**一族丢番图方程**”，每个 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-013-9812c8c6a3.png" alt="" /> 代入 D 后都确定了一个新的丢番图方程。于是，我们称 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-014-cf9dd98f0e.png" alt="" /> 为 D 的参数，<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-015-3ed4bff427.png" alt="" /> 为 D 的未知数。参数决定了它对应的丢番图集的元素是几元组，因此也是丢番图集的一个必要的信息。但为了方便，我们往往**用不同的字母默认区分参数和未知数**，而不特意指明。

&emsp;&emsp;读者应该熟悉集合论的一些基本术语。我们知道“关系”是笛卡尔积的子集，所以若自然数上的 n 元关系 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-016-33cef19d4e.png" alt="" /> 是丢番图集，我们就称之为**丢番图关系**。

&emsp;&emsp;同理，定义在自然数上的多元函数 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-017-7db73d85c9.png" alt="" /> 本质上也是其笛卡尔积的子集 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-018-3af8e472c8.png" alt="" /> ，比如指数函数：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-019-bff0d458a5.png" alt="" />

&emsp;&emsp;实际上由以下集合来刻画

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-020-27fb724329.png" alt="" />

&emsp;&emsp;因此，若一个函数对应的集合是丢番图集，我们就称之为**丢番图函数**。实际上我们谈论“一个函数能否被丢番图方程表达”的含义，就是在说它是不是一个丢番图函数。

# 丢番图集的简单性质

&emsp;&emsp;我们先验证丢番图集的一些简单性质：**对交和并封闭**。

&emsp;&emsp;设有丢番图集 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-021-190b7820ac.png" alt="" />，它们对应丢番图方程 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-022-e43492c44c.png" alt="" /> 和 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-023-13dbbee516.png" alt="" />。

&emsp;&emsp;考虑 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-024-428a02a3e3.png" alt="" /> 。若 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-025-60546af466.png" alt="" />，则 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-026-4099e3765e.png" alt="" /> 代入后至少有一个有解，这就等价于：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-027-435992b46c.png" alt="" />

&emsp;&emsp;有解。这就说明，S 是丢番图集，其对应的丢番图方程为：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-028-9e5f388ab9.png" alt="" />

&emsp;&emsp;因此丢番图集对并封闭。

&emsp;&emsp;再考虑 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-029-b0575bd606.png" alt="" /> 。若 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-030-d12d04248c.png" alt="" />，则可以类似构造使之等价于：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-031-8054e48bd6.png" alt="" />

&emsp;&emsp;有解。因此 S′ 也是丢番图集，其对应的丢番图方程为：

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-032-c5b9e3afce.png" alt="" />

&emsp;&emsp;即丢番图集对交也封闭。

# 递归集、递归可枚举集

&emsp;&emsp;我不清楚是否真的有“知道点图灵机，但是不知道递归集和递归可枚举集”的读者。但我还是提一句吧。我们知道图灵机的输入可以视为一个有限字符集 Σ 上的字符串，里面可能包含0,1，空格，或随便什么你想要的东西。但这实际上总等价于输入一个自然数（以 |Σ| 为进制的base）。所以，我们可以把图灵机看成是一个 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" />上的函数，以一个自然数 a 作为输入时，图灵机有三种可能：**有限时间内停机并输出True**、**有限时间内停机并输出False**、**始终不停机**。

&emsp;&emsp;对于集合 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-034-c228f47fe5.png" alt="" />，若存在一个图灵机 M，使 a ∈ S 时M 输出True，a ∉ S 时 M 输出False，则称 S 是**递归集**，或称之为**可判定**。若存在一个图灵机 M ，使 a ∈ S 时 M 输出True，a ∉ S 时始终不停机，则称 S 是一个**递归可枚举集**。所谓一个判定问题是否可判定，就是将这个判定问题的每个单一问题编码成自然数，问答案为True的单一问题的编码构成的集合 S 是否是递归集。

&emsp;&emsp;依照这种定义，我们又可以把这两个概念类推到 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-035-cf29b6804d.png" alt="" /> 的子集上，因为元组也可以编码成整数，视作是 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" /> 的子集。这里的编码并不突兀，其实我们上一段已经用了一次从字符串到整数的编码，并且我们后面会看到，编码方法其实不重要，“怎么做都可以”。

&emsp;&emsp;我们还可以看出，递归集总是一个递归可枚举集，只要让 M 在本该输出False时进入一个死循环就可以了。但反之不是，读者可以默认这个结论（存在一个递归可枚举集不是递归集），或者稍微学一下基本的可计算理论。

&emsp;&emsp;回到我们的问题，Hilbert第十问题就是在说，“**所有有解的丢番图方程构成的集合”是一个递归集吗？**”但这里仍然不得不面对一个问题：**编码问题**。我们必须把丢番图方程编码成自然数，这样才能讨论“丢番图方程构成的集合”是不是递归集、递归可枚举集这些事。这几个小段我们已经频繁提到编码，现在我们对编码进行一个简单的讨论。

# 编码

&emsp;&emsp;我们会涉及两种类型的编码：“泛指”的编码，和具体的编码方法。

&emsp;&emsp;比如当我们阐述Hilbert第十问题时，我们说把丢番图方程 D 作为图灵机的输入，这就需要把 D 编码成可以作为图灵机输入的信息；说“所有有解丢番图方程的集合是不是递归集”，这也需要把丢番图方程编码成自然数。而这种编码就是“泛指”的，我们没有明确说应该如何编码。是把多项式每一项的系数、次数以某种格式输入进去，还是如何？这都不清楚。

&emsp;&emsp;这就带来了一个问题：为什么不说清楚？会不会有一种可能，Hilbert第十问题在丢番图方程的某种编码下可解，在另一种编码下不可解？

&emsp;&emsp;这其实并不是一个局限于Hilbert第十问题的问题，而是可计算理论的一个基本问题——当你对图灵机编码、探讨图灵停机问题不可解的时候，也会遇到相同的问题：编码会不会对问题的可解性造成影响？

&emsp;&emsp;相应地，这个问题在可计算理论的教材中一般也会予以解答。但以防读者不具备相关知识，我们简要地阐述一下：结论是，**编码的选择不会导致结果差异**。

&emsp;&emsp;因为，若两种编码方式之间可以“可计算地”相互转换，那么我们嵌套一个图灵机作为中转就可以了，这样可解性自然是等价的。在此基础上，援引Church-Turing议题，我们相信任何“能计算出”的丢番图方程编码必定都是以图灵机可计算的方式得到的。在这种意义下，任何合理的丢番图方程编码都可以相互转换，因此编码并不对Hilbert第十问题的答案造成影响，所以在叙述时我们只采用了这种“泛指”的编码。而在具体解决问题时，只需要**选取一种我们用起来最方便的具体的（图灵机可计算的）编码即可**。

&emsp;&emsp;这里我们强调了“合理的”，实际上就是你能获得的。一种编码方式是：直接把问题的答案编码进去，把 D 编码成(...,True/False)。这种编码下，Hilbert第十问题当然就平凡地可解。但问题是：你是怎么获得答案的呢？实际上Hilbert第十问题的不可解（加上Church-Turing议题）就反过来说明了这样的编码是不合理的、无法通过计算手段获得的。

&emsp;&emsp;与上述的论述同理，我们也可以谈论 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-036-6d7e584eef.png" alt="" /> 上的递归集、递归可枚举集。至于它们是如何编码成 <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" /> 的子集，这也完全不重要，只要是可计算的编码即可（而我们后面会给出一种具体的编码）。

&emsp;&emsp;至此，基本知识的罗列就完成了。下一篇我们证明MRDP定理。

