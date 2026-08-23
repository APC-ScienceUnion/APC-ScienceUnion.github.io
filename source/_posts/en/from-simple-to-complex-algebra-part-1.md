---
layout: post
title: 'From Simple to Complex: Algebra, Part 1'
date: 2019-12-28 12:00:00
lang: en
translation_key: "由简入繁——代数学·Part1"
translation_source_sha256: "46fd744886e103374e6ee92cdede977ecefc588a1c48636babcfe55e77deda12"
permalink: en/2019/12/28/from-simple-to-complex-algebra-part-1/
aside: false
comments: false
tags: []
categories: []
katex: true
copyright_author: 'delta'
cover: /images/%E7%94%B1%E7%AE%80%E5%85%A5%E7%B9%81%E2%80%94%E2%80%94%E4%BB%A3%E6%95%B0%E5%AD%A6%C2%B7Part1/cover-5540868fdb.jpg
---

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Algebra is the branch of mathematics that studies numbers, quantities, relations, structures, and general methods for solving algebraic equations and systems, together with their properties. Elementary algebra is usually taught in secondary school. It introduces the subject's basic ideas: what happens when we add or multiply numbers, what variables are, and how to construct polynomials and find their roots. Algebra studies not only numbers but all kinds of abstract structures.
{% endnote %}

> &emsp;&emsp;Author: delta

&emsp;&emsp;Algebra is one of the most important branches of mathematics today. It has many branches of its own, including elementary algebra and higher algebra, while higher algebra divides into still more offshoots. If mathematics is Yggdrasil, then algebra is Asgard.

&emsp;&emsp;Geometry is Vanaheim.

&emsp;&emsp;Clearly, within Asgard, modern algebra wields power comparable to Odin's in Valhalla. Our purpose on this journey is to seek an audience with Odin. Yet in any kingdom, no one can meet the king directly without first obtaining a pass from the gatekeeper. So let us at least step onto Bifrost and have a heart-to-heart with Heimdall—elementary algebra.

# Origins

&emsp;&emsp;Diophantus, a Greek mathematician of the third century BCE, is now widely regarded as the father of algebra, while its true founder is considered to be al-Khwarizmi, a mathematician of the medieval Arab Empire. Chinese students often make fun of the latter because of how his name sounds in Chinese.

&emsp;&emsp;That ill-judged teasing has not brought al-Khwarizmi much fame, however. Only a small minority have heard of him. Diophantus, by contrast, is known to most people because of the elementary math-olympiad puzzle on his tombstone and the famous Diophantine equations.

&emsp;&emsp;Amusingly, the story takes another dramatic turn: although many people have heard of Diophantine equations, far from being able to solve such problems, they do not even know what a Diophantine equation is.

&emsp;&emsp;If you think this article is about to discuss Diophantine equations, you are quite mistaken. Since we are proceeding from the simple to the complex, we must begin with what is genuinely “simple.” A Diophantine equation is plainly not simple enough; its essence is.

&emsp;&emsp;What is the essence of an equation? An equality.

&emsp;&emsp;What lies at the heart of an equality? “${=}$”.

&emsp;&emsp;Let us begin with the equals sign and enter Mímir's well.

# The Equals Sign

&emsp;&emsp;First, we know that the following statements are true:

$$
\begin{aligned}
1 &= 1 \\
2 &= 1 + 1 \\
2 \times 5 - 6 &= 2 \times 2
\end{aligned}
$$

&emsp;&emsp;Why are they true? Because Odin's divine authority decrees it. We will have to wait until our audience with Odin to ask why he made that decree. For now, one thing is plain: we all know these statements are true.

&emsp;&emsp;Yet the numbers on either side of these three equalities can be changed in infinitely many combinations. Our time is limited—the allure of video games is always in the air—so we need a way to describe numbers in general terms. This undertaking began as a search for substitutes for numbers, so we shall call it the “algebra project.”

&emsp;&emsp;And so we obtain the following equalities, which are plainly also true:

$$
\begin{aligned}
x &= x \\
(a + b)x &= ax + bx \\
(a - b)x &= ax - bx
\end{aligned}
$$

&emsp;&emsp;(Odin, speaking from behind the scenes: In fact, this is because $(R - \{0\}, +, \cdot)$ is a commutative ring. Never mind my circular definition.)

&emsp;&emsp;For the real numbers and the four basic arithmetic operations we are using, these equalities follow from those operations and several laws known as the “Thrud-commutative law,” the “Hildr-associative law,” and the “Olrun-distributive law.” Heimdall is the one who teaches you the rules for using these operations and laws.

&emsp;&emsp;What? You have forgotten who Heimdall is? Do not forget that he plays the role of “elementary algebra” in this article!

&emsp;&emsp;(Heimdall: That hurts my feelings. Sob, sob.)

&emsp;&emsp;Because you forgot him, Heimdall now wants revenge. Asgard is a civilized realm, however, so his revenge is civilized too: Heimdall gives you several problems. If you cannot solve them, you will never reach Asgard for as long as you live.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 1: Prove that $(a + b)^2 = a^2 + 2ab + b^2$.
{% endnote %}

&emsp;&emsp;Far too easy. With help from the Valkyries, you quickly solve the problem.

$$
\begin{aligned}
(a + b)^2 &= (a + b)(a + b) \\
&= a(a + b) + b(a + b) \\
&= a^2 + ab + ba + b^2 \\
&= a^2 + ab + ab + b^2 \\
&= a^2 + 2ab + b^2.
\end{aligned}
$$

&emsp;&emsp;Heimdall refuses to concede and sets you another problem.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 2: Prove that $(a + b + e)^2 = a^2 + b^2 + e^2 + 2ab + 2be + 2ca$.
{% endnote %}

&emsp;&emsp;This problem is more complicated than the last because it has one more quantity, but with the Valkyries' assistance, you still work it out.

> The result follows at once and is plainly trivial; imitate the previous example. Left as an exercise, answer omitted; the proof is not difficult.
The converse is likewise identical, and the corollary follows naturally. The steps are omitted. QED. Hence proved.

&emsp;&emsp;Just as Heimdall is reluctantly about to let you pass, you cannot resist asking, “Who are these three goddesses beside me who have been calling themselves Valkyries and helping me all this time?”

&emsp;&emsp;The three Valkyries—the “Thrud-commutative law,” the “Hildr-associative law,” and the “Olrun-distributive law”—are most displeased that you have never read any Norse mythology (mathematics). So they detain you. While you are wondering how to escape, Heimdall offers a helping hand.

&emsp;&emsp;There is, of course, no such thing as a free lunch. You must help Heimdall solve his problem first.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 3: Prove that $\left(\sum_{i=1}^n a_i\right)^2 = \sum_{i=1}^n a_i^2 + 2 \sum_{1 \le i < j \le n} a_i a_j.$
{% endnote %}

&emsp;&emsp;You now have two choices: admit that you do not know what $\sum$ means, or prove the result.

&emsp;&emsp;Then you suddenly remember:

$$
\begin{aligned}
\sum_{i=1}^n a_i &= a_1 + a_2 + \Lambda + a_n. \\[0.9em]
\sum_{1 \le i < j \le n} a_i a_j &= a_1 a_2 + a_1 a_3 + \Lambda + a_1 a_n \\[0.9em]
&+ a_2 a_3 + a_2 a_4 + \Lambda + a_2 a_n \\[0.9em]
&+ \Lambda \\[0.9em]
&+ a_{n-1} a_n.
\end{aligned}
$$

&emsp;&emsp;Now only the second path remains. But how should you handle the expansion of a squared sum with $n$ terms?

&emsp;&emsp;You suddenly remember (again): mathematical induction.

&emsp;&emsp;&emsp;&emsp;Prove that the proposition holds when $n = 1$;

&emsp;&emsp;&emsp;&emsp;assume it holds when $n = m$, and then show that it also holds when $n = m + 1$.

&emsp;&emsp;&emsp;&emsp;The equality clearly holds for $n = 1,2,3$, so:

&emsp;&emsp;&emsp;&emsp;Assume the proposition holds when $n = m$. When $n = m + 1$:

$$
\begin{aligned}
\left(\sum_{i=1}^{m+1} a_i\right)^2 &= \left(\sum_{i=1}^m a_i + a_{m+1}\right)^2 \\[0.9em]
&= \left(\sum_{i=1}^m a_i\right)^2 + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^m a_i^2 + 2 \sum_{1 \le i < j \le m} a_i a_j + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^{m+1} a_i^2 + 2 \sum_{1 \le i < j \le m+1} a_i a_j.
\end{aligned}
$$

&emsp;&emsp;Heimdall is pleased, but this is not enough:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 4: Prove that $\sum_{1 \le i < j \le n} (a_i - a_j)^2 = n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.$
{% endnote %}

&emsp;&emsp;In this equality, we need to count how many times each $a$ occurs, so you search your memory once more.

&emsp;&emsp;You suddenly remember (for the third time—the protagonist's plot armor is getting rather strong): the Fubini principle.

&emsp;&emsp;Also called double counting, it proves an equality by observing that two different methods of counting the same quantity must give the same result. The principle extends to the evaluation of multiple integrals, though it can also be confined to applications in combinatorics.

&emsp;&emsp;Clearly, for $a^2$, the cases $j = 2,3,\Lambda,n$ make it appear a total of $n - 1$ times;

&emsp;&emsp;For $a$, the cases $j = 3,4,\Lambda,n$ make it appear a total of $n - 2$ times, but when $i = 1$, there is also the case $j = 2$. Including that occurrence gives $n-1$ in all;

&emsp;&emsp;similarly, every $a_i$ occurs $n-1$ times. You therefore obtain:

$$
\begin{aligned}
\sum_{1 \le i < j \le n} (a_i - a_j)^2 &= (n-1) \sum_{i=1}^n a_i^2 - 2 \sum_{1 \le i < j \le n} a_i a_j \\[0.9em]
&= n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.
\end{aligned}
$$

&emsp;&emsp;This technique of proving an equality by counting how often terms occur is extremely convenient, so you glide effortlessly through the next problem:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 5: Prove that $\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).$
{% endnote %}

&emsp;&emsp;Observe that, for a fixed $a_i$, every $b_j$ will occur $n$ times; the same conclusion holds for a fixed $b_j$. Therefore:

$$
\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \sum_{i=1}^n \sum_{j=1}^n a_i b_j = \sum_{i=1}^n \sum_{j=1}^n a_j b_i = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).
$$

&emsp;&emsp;As the saying goes, three strikes and that is enough. No one knows whether Asgard has the same proverb, but Qin Shi Huang's planet-destroying warship technology was so advanced that perhaps it carried the saying from China's anomalous zone all the way to Northern Europe. Heimdall agrees to rescue you.

&emsp;&emsp;The moment you step out of the cell, however, you encounter the three Valkyries.

&emsp;&emsp;Oh no—the Three Pillars.

&emsp;&emsp;Rather than break his oath, Heimdall goes to war with the Valkyries. According to Lu Xun's classic “the North always wins a civil war” theory (Lu Xun: I never said that), Heimdall, who serves the Northern Empire, ultimately prevails. (That is a story from another world—perhaps one found in a certain Tencent game.) There are plenty of examples supporting the theory, such as the American Civil War.

&emsp;&emsp;The Valkyries agree to let Heimdall take you away, but, as ever, only if you solve one more problem:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Valkyrie's question: Prove that $\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) \ge \left( \sum_{i=1}^{n} a_i b_i \right)^2$
{% endnote %}

&emsp;&emsp;You know this one! Is that not Cauchy's Wash-Socks—the Cauchy–Schwarz inequality?

&emsp;&emsp;Wait. An inequality? Weren't we supposed to be discussing equalities? How did inequalities enter the picture?

&emsp;&emsp;(Odin, speaking from behind the scenes: Inequalities arise from equalities.)

&emsp;&emsp;Oh, right. From equalities.

&emsp;&emsp;Odin has inspired you. Clever as you are, you give it some thought.

&emsp;&emsp;You suddenly remember (for the fourth time) Lagrange's identity. Thanks to your earlier practice answering Heimdall's questions, you quickly obtain:

$$
\begin{aligned}
\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) - \left( \sum_{i=1}^{n} a_i b_i \right)^2
&= \sum_{i=1}^{n} \sum_{j=1}^{n} a_i^2 b_j^2 - \sum_{i=1}^{n} \sum_{j=1}^{n} a_i b_i a_j b_j \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i^2 b_j^2 + a_j^2 b_i^2 - 2a_i b_i a_j b_j \right) \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i b_j - a_j b_i \right)^2 \\[0.9em]
&= \sum_{1 \le i < j \le n} \left( a_i b_j - a_j b_i \right)^2 \ge 0.
\end{aligned}
$$

&emsp;&emsp;Remove the final “greater than or equal to zero,” and what remains is the proof of Lagrange's identity. This fully demonstrates that inequalities, too, arise from equalities.

&emsp;&emsp;There is likewise a way to prove the mean inequalities using an equality-based structure. The method is too involved to include in this popular-science article, however, so I will merely note that the proof can be found in Chen Ji's *Algebraic Inequalities*.

&emsp;&emsp;To keep you from being detained again, Heimdall also tells you a few stories from Norse mythology (mathematics):

&emsp;&emsp;Abel transformation:

$$
\sum_{k=m}^{n} f_k \left( g_{k+1} - g_k \right) = \left[ f_{n+1} g_{n+1} - f_m g_m \right] - \sum_{k=m}^{n} g_{k+1} \left( f_{k+1} - f_k \right)
$$

&emsp;&emsp;where $\{f_k\}$ and $\{g_k\}$ are any two sequences.

&emsp;&emsp;Schur's inequality:

$$
a,b,c>0,\ r\in\mathbb{R} \implies a^r(a-b)(a-c) + b^r(b-c)(b-a) + c^r(c-a)(c-b) \ge 0
$$

&emsp;&emsp;This, too, is proved with an equality. The proof is left to the reader and is not difficult.

&emsp;&emsp;At last, Heimdall leads you across Bifrost, the rainbow bridge. You have finally taken your first step toward an audience with Odin. Little do you know that Thor, Sif, and the trickster god Loki await you ahead…
