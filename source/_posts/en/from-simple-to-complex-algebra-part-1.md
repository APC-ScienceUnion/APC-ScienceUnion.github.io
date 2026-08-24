---
layout: post
title: 'From Simple to Complex: Algebra, Part 1'
date: 2019-12-28 12:00:00
lang: en
translation_key: "由简入繁——代数学·Part1"
translation_source_sha256: "46fd744886e103374e6ee92cdede977ecefc588a1c48636babcfe55e77deda12"
permalink: en/2019/12/28/from-simple-to-complex-algebra-part-1/
aside: true
comments: false
tags: []
categories: []
katex: true
copyright_author: 'delta'
cover: /images/%E7%94%B1%E7%AE%80%E5%85%A5%E7%B9%81%E2%80%94%E2%80%94%E4%BB%A3%E6%95%B0%E5%AD%A6%C2%B7Part1/cover-5540868fdb.jpg
---

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Algebra is the branch of mathematics concerned with numbers, quantities, relationships, structures, and general methods for solving algebraic equations and systems. Elementary algebra, usually taught in secondary school, introduces the basic ideas: how addition and multiplication behave, what variables are, and how to construct polynomials and find their roots. The subject reaches far beyond numbers to encompass all kinds of abstract structures.
{% endnote %}

> &emsp;&emsp;Author: delta

&emsp;&emsp;Algebra is one of the central branches of modern mathematics. It divides into many subjects of its own, from elementary algebra to higher algebra, which branches still further. If mathematics is Yggdrasil, then algebra is Asgard.

&emsp;&emsp;Geometry is Vanaheim.

&emsp;&emsp;Within this Asgard, abstract algebra plainly wields the same authority that Odin commands in Valhalla. Our goal is to seek an audience with him. But no kingdom lets a traveler walk straight up to its king without first passing the gatekeeper. So let us step onto Bifrost and have a heart-to-heart with Heimdall, who plays the part of elementary algebra.

# Origins

&emsp;&emsp;Diophantus, a Greek mathematician of the third century BCE, is widely regarded as the father of algebra, while al-Khwarizmi, a mathematician of the medieval Arab world, is credited with founding the subject itself. Chinese students often make fun of al-Khwarizmi because of how his name sounds in Chinese.

&emsp;&emsp;That ill-judged teasing has not exactly made al-Khwarizmi famous. Only a small minority have heard of him. Diophantus, by contrast, is widely known for the elementary math-contest puzzle on his tombstone and for Diophantine equations.

&emsp;&emsp;Here the story takes another amusing turn: many people have heard of Diophantine equations, but not only can they not solve one, they do not even know what one is.

&emsp;&emsp;If you think this article is about to explain Diophantine equations, think again. We promised to work from the simple to the complex, and a Diophantine equation is not nearly simple enough. Its essence, however, is.

&emsp;&emsp;What is the essence of an equation? An equality.

&emsp;&emsp;What lies at the heart of an equality? “${=}$”.

&emsp;&emsp;Let us begin with the equals sign and descend into Mímir's well.

# The Equals Sign

&emsp;&emsp;To begin, we know that the following statements are true:

$$
\begin{aligned}
1 &= 1 \\
2 &= 1 + 1 \\
2 \times 5 - 6 &= 2 \times 2
\end{aligned}
$$

&emsp;&emsp;Why are they true? Because Odin's divine authority says so. We will have to wait for our audience with him to ask why. For now, the point is simply that we all recognize these statements as true.

&emsp;&emsp;But we could replace the numbers on either side of these equalities in infinitely many ways. Our time is limited, and video games are always calling, so we need a way to talk about numbers in general. Since the job begins by finding substitutes for specific numbers, we shall call it the “algebra project.”

&emsp;&emsp;That gives us the following equalities, which are also plainly true:

$$
\begin{aligned}
x &= x \\
(a + b)x &= ax + bx \\
(a - b)x &= ax - bx
\end{aligned}
$$

&emsp;&emsp;(Odin, speaking from behind the scenes: In fact, this is because $(R - \{0\}, +, \cdot)$ is a commutative ring. Never mind my circular definition.)

&emsp;&emsp;For the real numbers and the four basic arithmetic operations, these equalities follow from the “Thrud-commutative law,” the “Hildr-associative law,” and the “Olrun-distributive law.” Heimdall taught you how to use those operations and laws.

&emsp;&emsp;What? You have forgotten who Heimdall is? He is elementary algebra in this story. Keep up!

&emsp;&emsp;(Heimdall: You have hurt my feelings. Sniff.)

&emsp;&emsp;Since you forgot him, Heimdall wants revenge. Asgard is a civilized realm, however, so his revenge takes a civilized form: a set of problems. Fail to solve them, and you will never reach Asgard.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 1: Prove that $(a + b)^2 = a^2 + 2ab + b^2$.
{% endnote %}

&emsp;&emsp;Too easy. With help from the Valkyries, you solve it in no time.

$$
\begin{aligned}
(a + b)^2 &= (a + b)(a + b) \\
&= a(a + b) + b(a + b) \\
&= a^2 + ab + ba + b^2 \\
&= a^2 + ab + ab + b^2 \\
&= a^2 + 2ab + b^2.
\end{aligned}
$$

&emsp;&emsp;Heimdall refuses to give in and sets you another problem.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 2: Prove that $(a + b + e)^2 = a^2 + b^2 + e^2 + 2ab + 2be + 2ca$.
{% endnote %}

&emsp;&emsp;This one has an extra quantity and is therefore a little more complicated, but the Valkyries help you through it.

> Immediate, obvious, and trivial; proceed as in the previous example. Left as an exercise. Solution omitted. The proof is straightforward.
The converse is similar, and the corollary follows. Details omitted. QED. Thus proved.

&emsp;&emsp;Just as Heimdall is reluctantly preparing to let you pass, you cannot resist asking, “Who are these three goddesses beside me, the ones calling themselves Valkyries and helping me all this time?”

&emsp;&emsp;The three Valkyries, the “Thrud-commutative law,” the “Hildr-associative law,” and the “Olrun-distributive law,” are furious that you have never read any Norse mythology (mathematics). They promptly detain you. While you are wondering how to escape, Heimdall offers a hand.

&emsp;&emsp;There is no such thing as a free lunch, of course. First, you must help Heimdall with a problem.

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 3: Prove that $\left(\sum_{i=1}^n a_i\right)^2 = \sum_{i=1}^n a_i^2 + 2 \sum_{1 \le i < j \le n} a_i a_j.$
{% endnote %}

&emsp;&emsp;You have two choices: admit that you do not know what $\sum$ means, or prove the result.

&emsp;&emsp;Then it comes back to you:

$$
\begin{aligned}
\sum_{i=1}^n a_i &= a_1 + a_2 + \Lambda + a_n. \\[0.9em]
\sum_{1 \le i < j \le n} a_i a_j &= a_1 a_2 + a_1 a_3 + \Lambda + a_1 a_n \\[0.9em]
&+ a_2 a_3 + a_2 a_4 + \Lambda + a_2 a_n \\[0.9em]
&+ \Lambda \\[0.9em]
&+ a_{n-1} a_n.
\end{aligned}
$$

&emsp;&emsp;That leaves only the second option. But how do you expand the square of a sum with $n$ terms?

&emsp;&emsp;Suddenly, you remember again: mathematical induction.

&emsp;&emsp;&emsp;&emsp;First prove the statement for $n = 1$;

&emsp;&emsp;&emsp;&emsp;then assume it holds for $n = m$ and show that it must also hold for $n = m + 1$.

&emsp;&emsp;&emsp;&emsp;The equality plainly holds for $n = 1,2,3$. Now:

&emsp;&emsp;&emsp;&emsp;Assume the statement holds for $n = m$. For $n = m + 1$:

$$
\begin{aligned}
\left(\sum_{i=1}^{m+1} a_i\right)^2 &= \left(\sum_{i=1}^m a_i + a_{m+1}\right)^2 \\[0.9em]
&= \left(\sum_{i=1}^m a_i\right)^2 + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^m a_i^2 + 2 \sum_{1 \le i < j \le m} a_i a_j + 2 \sum_{i=1}^m a_i a_{m+1} + a_{m+1}^2 \\[0.9em]
&= \sum_{i=1}^{m+1} a_i^2 + 2 \sum_{1 \le i < j \le m+1} a_i a_j.
\end{aligned}
$$

&emsp;&emsp;Heimdall is pleased, but not satisfied:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 4: Prove that $\sum_{1 \le i < j \le n} (a_i - a_j)^2 = n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.$
{% endnote %}

&emsp;&emsp;This time, we need to count how often each $a$ appears, so you search your memory once more.

&emsp;&emsp;You suddenly remember, for the third time now (that protagonist's plot armor is getting rather strong): the Fubini principle.

&emsp;&emsp;Also known as double counting, the principle proves an equality by calculating the same quantity in two different ways. It extends to the evaluation of multiple integrals but is also a standard tool in combinatorics.

&emsp;&emsp;For $a^2$, the cases $j = 2,3,\Lambda,n$ produce a total of $n - 1$ occurrences;

&emsp;&emsp;For $a$, the cases $j = 3,4,\Lambda,n$ produce $n - 2$ occurrences, and the case $i = 1$, $j = 2$ supplies one more, for $n-1$ in all;

&emsp;&emsp;by the same reasoning, every $a_i$ occurs $n-1$ times. Therefore:

$$
\begin{aligned}
\sum_{1 \le i < j \le n} (a_i - a_j)^2 &= (n-1) \sum_{i=1}^n a_i^2 - 2 \sum_{1 \le i < j \le n} a_i a_j \\[0.9em]
&= n \sum_{i=1}^n a_i^2 - \left(\sum_{i=1}^n a_i\right)^2.
\end{aligned}
$$

&emsp;&emsp;Counting terms this way is remarkably convenient, and you glide through the next problem:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Heimdall's question 5: Prove that $\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).$
{% endnote %}

&emsp;&emsp;For each fixed $a_i$, every $b_j$ enters the expansion. Across the $n$ choices of the other index, the same relabeling works for each fixed $b_j$. Therefore:

$$
\left(\sum_{i=1}^n a_i\right) \left(\sum_{j=1}^n b_j\right) = \sum_{i=1}^n \sum_{j=1}^n a_i b_j = \sum_{i=1}^n \sum_{j=1}^n a_j b_i = \frac{1}{2} \sum_{i=1}^n \sum_{j=1}^n (a_i b_j + a_j b_i).
$$

&emsp;&emsp;As the saying goes, three strikes ought to be enough. No one knows whether Asgard has the same proverb, but perhaps Qin Shi Huang's planet-destroying warships carried it from the Chinese Lostbelt all the way to Northern Europe. Heimdall agrees to rescue you.

&emsp;&emsp;The moment you step out of the cell, however, you run into the three Valkyries.

&emsp;&emsp;Oh no—the Three Pillars.

&emsp;&emsp;Rather than break his oath, Heimdall goes to war with the Valkyries. According to Lu Xun's classic theory that “the North always wins a civil war” (Lu Xun: I never said that), Heimdall, who serves the Northern Empire, ultimately prevails. That is a story from another world, perhaps from a certain Tencent game. Plenty of examples seem to support the theory, including the American Civil War.

&emsp;&emsp;The Valkyries agree to let Heimdall take you away, but only if you solve one more problem:

{% note blue 'fas fa-equals' %}
&emsp;&emsp;Valkyrie's question: Prove that $\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) \ge \left( \sum_{i=1}^{n} a_i b_i \right)^2$
{% endnote %}

&emsp;&emsp;You know this one! It is the Cauchy–Schwarz inequality, jokingly nicknamed “Cauchy washes socks” in Chinese.

&emsp;&emsp;Wait. An inequality? Weren't we talking about equalities? Where did this come from?

&emsp;&emsp;(Odin, speaking from behind the scenes: Inequalities arise from equalities.)

&emsp;&emsp;Oh. Right. From equalities.

&emsp;&emsp;Odin has given you a hint. You stop and think.

&emsp;&emsp;For the fourth time, something suddenly comes back to you: Lagrange's identity. After all that practice with Heimdall, you quickly obtain:

$$
\begin{aligned}
\left( \sum_{i=1}^{n} a_i^2 \right)\left( \sum_{i=1}^{n} b_i^2 \right) - \left( \sum_{i=1}^{n} a_i b_i \right)^2
&= \sum_{i=1}^{n} \sum_{j=1}^{n} a_i^2 b_j^2 - \sum_{i=1}^{n} \sum_{j=1}^{n} a_i b_i a_j b_j \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i^2 b_j^2 + a_j^2 b_i^2 - 2a_i b_i a_j b_j \right) \\[0.9em]
&= \frac{1}{2} \sum_{i=1}^{n} \sum_{j=1}^{n} \left( a_i b_j - a_j b_i \right)^2 \\[0.9em]
&= \sum_{1 \le i < j \le n} \left( a_i b_j - a_j b_i \right)^2 \ge 0.
\end{aligned}
$$

&emsp;&emsp;Remove the final “greater than or equal to zero,” and the calculation is a proof of Lagrange's identity. So inequalities really can emerge from equalities.

&emsp;&emsp;The inequalities between means can likewise be proved from an equality. The argument is too involved for this article, but readers can find it in Chen Ji's *Algebraic Inequalities*.

&emsp;&emsp;To keep you from being detained again, Heimdall teaches you a few more tales from Norse mythology (mathematics):

&emsp;&emsp;Abel transformation:

$$
\sum_{k=m}^{n} f_k \left( g_{k+1} - g_k \right) = \left[ f_{n+1} g_{n+1} - f_m g_m \right] - \sum_{k=m}^{n} g_{k+1} \left( f_{k+1} - f_k \right)
$$

&emsp;&emsp;where $\{f_k\}$ and $\{g_k\}$ are any two sequences.

&emsp;&emsp;Schur's inequality:

$$
a,b,c>0,\ r\in\mathbb{R} \implies a^r(a-b)(a-c) + b^r(b-c)(b-a) + c^r(c-a)(c-b) \ge 0
$$

&emsp;&emsp;This, too, can be proved with an equality. The proof is left to the reader.

&emsp;&emsp;At last, Heimdall leads you across Bifrost, the rainbow bridge. You have taken your first real step toward an audience with Odin. Little do you know that Thor, Sif, and the trickster Loki are waiting ahead…
