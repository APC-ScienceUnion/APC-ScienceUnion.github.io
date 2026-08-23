---
layout: post
title: Why Can Every Number with Eight or More Digits Become an Equation?
date: 2026-07-18 12:00:00
lang: en
translation_key: "为何所有8位及以上的数都可以变为等式？——硅基-沉默整数平衡化定理及其证明简明介绍"
translation_source_sha256: "3631ff353060fb1b1ee8d8229e29cb7fcb1c8845eb7bb3e5ad38daa2d7f8184e"
permalink: en/2026/07/18/why-every-number-with-eight-or-more-digits-can-become-an-equation/
aside: false
comments: false
tags: []
categories: []
cover: /images/为何所有8位及以上的数都可以变为等式？/fig2.png
copyright_author: '硅基·飙尘葆光'
katex: true
---

{% note blue 'fas fa-equals' %}
Can the digit string 1145141919810 be turned into an equation? Astonishingly, every integer with at least eight digits can become a true equation if we insert addition, subtraction, multiplication, division, parentheses, and an equals sign. From counterexamples and constructive arguments to a computer search, this article proves a mathematical claim that sounds absurd at first.
{% endnote %}

> Author: 硅基·飙尘葆光

# A Brief Introduction to the Silicon–Silence Balance Integer Theorem and Its Proof

&emsp;&emsp;In daily life, sophon interference from the Trisolarans often disrupts the numbers we try to transmit. Humanity has therefore developed many ways to disguise digit strings and thwart this evil plan. One method inserts arithmetic operators into a string until it becomes a true equation. For example, “114514” can be written as $1=-1+(4+5-1)/4$, while “1919810” becomes $(1\times 9+1)\times(9-8)=10$. A sophon sees only expressions whose value is **True**, allowing the hidden numbers to escape surveillance and interference.

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig1.png" alt="" />

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig2.png" alt="" />

&emsp;&emsp;One question, however, has long haunted the devotees of this method like a nightmare, denying their souls rest by day or night and tormenting them as though for eternity in hell:

&emsp;&emsp;**Can we always insert arithmetic operators and an equals sign into any number we wish to transmit and obtain a true equation?**

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig3.png" alt="" />

&emsp;&emsp;If you are a sophon, the following should be easy to notice:

> **In base ten, addition, subtraction, multiplication, division, parentheses, and an equals sign can always be inserted into any integer with eight or more digits to form a true equation.**

&emsp;&emsp;In reality, we are *Homo sapiens*, not sophons, so understanding why still requires a step-by-step analysis.

&emsp;&emsp;Repeatedly writing “insert arithmetic operators and an equals sign to form a true equation” would be cumbersome. To make the discussion precise, let us establish the following definitions:

1. Treat any n-digit integer a as an n-digit string with no leading zero. An operation that inserts members of a specified set of arithmetic operators into the string will be called an “**operator insertion**.” The value of the resulting expression is an “**insertion value**.” All obtainable insertion values form the “**insertion-value set**,” abbreviated **$\mathrm{Val}(a)$**.

2. The set of permitted operators will be called the “**operator set**.” Here it is $\{+,-,\times,/\}$: **addition, subtraction, multiplication, and division**, abbreviated **$S$**. If changes in the usual order of operations are permitted, parentheses may also be inserted. (For convenient notation and to avoid confusing symbols, when the two digits ab are treated as one unit, we write **$a\_b$**.)

3. An operation that divides a digit string into parts and inserts operators so that all parts have the same insertion value, thereby forming an equation, will be called “**balancing**.” A string that can be balanced is “**balanceable**.” The set of all such strings is the “**balanceable set**,” abbreviated $E$. The remaining strings form the “**unbalanceable set**.”

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig4.gif" alt="" />

&emsp;&emsp;Our original question can now be stated as follows:

> Given the operator set **S**, and allowing the order of operations to be changed, is every n-digit string balanceable? ($n \in \mathbb{N}^+$, with $n \geq 2$.)

&emsp;&emsp;Begin with short strings, such as numbers of three digits or fewer. Their information content is too low to interest either sophons or us, and the conclusions are not very exciting. A one-digit string is meaningless for this purpose. Among two-digit strings, only multiples of 11 can take an equals sign between their digits. Three digits offer more to discuss, but simple counterexamples such as 125 and 113 cannot be made into equations. At least for lengths two and three, then, operators and an equals sign cannot always form an equation. Not every n-digit string is balanceable.

&emsp;&emsp;The problem therefore becomes one of finding a lower bound on the length that guarantees balanceability:

> Given the operator set S and allowing changes in the order of operations, does there exist an **N** such that every n-digit string is balanceable whenever $n \geq N$? If so, what is N? ($n \in \mathbb{N}^+$, with $n \geq 2$.)

&emsp;&emsp;The sophon's answer has already spoiled the fact that N exists, and intuition tells us that sufficiently long strings ought to be balanceable: the more digits there are, the more likely two separated parts are to share an insertion value. History teaches us that both sophons and intuition can deceive, however, so a more rigorous argument is still needed to establish existence.

&emsp;&emsp;First, define one more concept:

4. A digit string from which operator insertion can produce 0 will be called “**zeroable**.” Such strings form the “**zeroable set**,” abbreviated **$\mathrm{Re}_{0}$**. The rest form the “**nonzeroable set**.”

&emsp;&emsp;If a string a is zeroable, then every superstring b containing a is also zeroable. We can always write b as $b=s1\_a\_s2$. Because a can produce 0, multiplication signs can be inserted so that the entire expression becomes 0 regardless of the insertion values of the substrings on either side. It follows that if every n-digit string is zeroable, then every n + 1-digit string is also zeroable: its n-digit substring can produce 0, and whatever the remaining digit is, multiplication makes the whole expression 0. We call this the **upward propagation of the zeroable set**.

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig5.gif" alt="" />

&emsp;&emsp;Next, intuition suggests that **once the length n is sufficiently large, every n-digit string should be zeroable**. We can prove this by constructing a particular insertion procedure. If a sufficiently long string contains a 0, or two consecutive identical substrings, multiplication and subtraction quickly reduce it to zero. The general case to consider is therefore a string containing neither 0 nor two identical adjacent substrings.

&emsp;&emsp;Pair the digits of the original string and subtract the two members of each pair. Their absolute differences—implemented with addition, subtraction, and parentheses—form a new string. Call the largest digit in a string its **upper bound**. The upper bound of the new string is always at least 1 smaller than that of the original. Without loss of generality, assume that the original upper bound is 9. After eight rounds, the upper bound is 1. A sufficiently long original string has therefore been transformed, through operator insertion, into either an all-1 string or a string containing 0, both of which reduce easily to zero. Strictly speaking, pairing every digit at each round requires n to be a power of 2. For any sufficiently long string whose length exceeds such a power, however, the surplus digits can undergo separate rounds of subtraction and absolute value until the total length is a power of 2. This does not interfere with the shrinking upper bound. **Any sufficiently long digit string can therefore be reduced to one on which the zeroing procedure works.**

&emsp;&emsp;In summary, **there exists an $N'$ such that every n-digit string is zeroable whenever $n \geq N'$**. Moreover, $N' \leq 2^9$; one additional round of pairwise subtraction is needed to ensure that the final string is not a single 1.

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig6.gif" alt="" />

&emsp;&emsp;Finally, if $n \geq 2N'$, the string can plainly be divided into the form “$0=0$.” **There must therefore be an N such that every n-digit string is balanceable for $n \geq N$, with $N \leq 2^{10}$—that is, $2N'$.**

&emsp;&emsp;We have proved that N exists and lies between **4** and **1024**. In principle, checking every string of lengths 4 through 1024 would reveal its exact value. Unfortunately, only a sophon would accept the computational cost. To reach the answer, we need tighter bounds that make verification less expensive.

&emsp;&emsp;We can begin by investigating the maximum length $N'$ of a nonzeroable string. By upward propagation of $\mathrm{Re}_{0}$, if a string a is zeroable, every superstring $s1\_a\_s2$ containing it is zeroable. This immediately suggests a **sieve** for finding every nonzeroable string and hence the maximum length among them. Beginning with $10$, test each string in natural-number order for zeroability. As soon as a zeroable string is found, exclude every later superstring that contains it. This procedure guarantees that all proper substrings of any string requiring an individual test are nonzeroable. We call such a string a “**prime zeroable string**.” Plainly, **every zeroable string contains a prime zeroable string**. Within a given range, testing the tiny number of prime zeroable strings—rather than the overwhelming majority of all strings—sieves out every zeroable string. What remains is the nonzeroable set we seek.

&emsp;&emsp;If you are a sophon, you will readily notice that there is exactly one seven-digit nonzeroable string, **8985898**, and that **all strings of eight digits or more containing it are zeroable**. Thus **8985898 is the largest nonzeroable number**. Fortunately, that is also the final result of our sieve. Taking $N' \geq 8$ guarantees that every string is zeroable, and therefore $N \geq 16$ guarantees that every string is balanceable. Incidentally, there are **2,873** nonzeroable strings and **6,534** prime zeroable strings, including 0 itself. The largest prime zeroable string is 9896989, also seven digits long.

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig7.gif" alt="" />

&emsp;&emsp;It is also clear that nonzeroable strings such as 8985898 are themselves unbalanceable. A balanceable string admits an equals sign that makes an equation true. Replace that sign with subtraction and put the expressions on both sides in parentheses, and the result must be 0. Every balanceable string is therefore zeroable. Some zeroable strings, such as 1204, are nevertheless unbalanceable, so **the balanceable set is a proper subset of the zeroable set**. Equivalently, **the nonzeroable set is a proper subset of the unbalanceable set**. Because 8985898 belongs to the nonzeroable set, it also belongs to the unbalanceable set and provides a seven-digit example. **The only remaining task is to check whether strings from eight through fifteen digits contain an unbalanceable example of greater length.**

&emsp;&emsp;We have worked hard to shrink the range, yet it still contains numbers on the scale of hundreds of quadrillions and remains difficult to process. The sophon watching us has already supplied the answer: “Every one of those hundreds of quadrillions of strings is balanceable.” We should trust our own intelligence first, however, rather than rely too heavily on data from Trisolaris.

&emsp;&emsp;Fortunately, an obvious pattern comes to the rescue:

> Every string that matches the “$0=0$” pattern is balanceable. A string that can form this pattern cannot be unbalanceable. Therefore, any construction guaranteed not to contain the pattern must include every unbalanceable string. A string of the form “$s1\_c\_s2$” cannot form “$0=0$.”

&emsp;&emsp;Here “_” denotes concatenation; $s1$ and $s2$ are nonzeroable strings, and $c$ is a digit from 0 to 9.

&emsp;&emsp;Every substring of a nonzeroable string is also nonzeroable. Therefore, regardless of how a string of the form “$s1\_c\_s2$” is divided, at most one of its substrings can produce 0; it cannot form “$0=0$.” Note that if either $s1$ or $s2$ is empty, $s1\_c$ and $c\_s2$ are likewise plainly unable to form “$0=0$,” so our candidate set must include those cases as well.

&emsp;&emsp;Thanks to the earlier work, we already know every nonzeroable string. Constructing every number of the form “$s1+c+s2$” from them yields a candidate set far smaller than the original one, even though it still contains many zeroable strings. Let $C_n$ be the number of n-digit candidates of this form. Then $C_8 = 14456421$, $C_9 = 28813930$, $C_{10} = 24533340$, $C_{11} = 8388910$, $C_{12} = 920140$, $C_{13} = 45660$, and $C_{14} = 1080$. For fifteen digits, the only possible form is “$8985898\_c\_8985898$.” Its nine-digit substring “$5898\_c\_8985$” must be able to produce 0, so every “$8985898\_c\_8985898$” can form “$898+0=898$.” Hence $S_{15}=0$. Only **77,159,481** remaining candidates require testing. Add the candidate strings from two through seven digits, and the total is about **eighty million**, a manageable range for computer verification. There may be a better algorithm, but I was too lazy to find it.

<img src="/images/为何所有8位及以上的数都可以变为等式？/fig8.gif" alt="" />

&emsp;&emsp;The computer search found **19,515 unbalanceable strings in all**. The largest was 9989858, and **not a single unbalanceable number was found from eight through fourteen digits**. At last we can breathe easily and state with confidence:

> In base ten, addition, subtraction, multiplication, division, parentheses, and exactly one equals sign can always be inserted into any integer with eight or more digits to form a true equation.

&emsp;&emsp;One detail still looks slightly awkward: **why insist on inserting only “one” equals sign?** The string 111 cannot become an equation with one equals sign, but several signs produce “$1=1=1$.” What happens if we remove the word “one”? Cases solvable with one sign do not need several, so the relaxed condition can only expand the conclusion. Is that expansion enough to lower the bound from eight digits to seven or fewer? Fortunately, we can test the 19,515 unbalanceable strings found above, adding only an intersection test for the insertion-value sets of multiple segments. Of those strings, 1,317 can become equations when multiple equals signs are allowed. The largest, 9989858, remains impossible to balance no matter how many signs are inserted. Let us call strings that can never be balanced “**strongly unbalanceable**,” and those that fail only under the single-sign restriction “**weakly unbalanceable**.” Fortunately, although the condition is genuinely looser, **neither the greatest unbalanceable length nor the largest unbalanceable number changes**.

&emsp;&emsp;We may finally announce without reservation:

> In base ten, addition, subtraction, multiplication, division, parentheses, and equals signs can always be inserted into any integer with eight or more digits to form a true equation.

&emsp;&emsp;An arduous literature search failed to find an earlier result of this kind. Until a predecessor's version turns up, let us provisionally call this neat result the **Silicon–Silence Balance Integer Theorem** in honor of the two idle minds who posed and solved the problem.

&emsp;&emsp;At last, we can transmit numerical information through equations without losing sleep, provided the number has at least eight digits or is not one of the 18,198 strongly unbalanceable strings. After all, why would a sophon suspect that an eternally true statement such as “$3-5+0=-2\times 3+4$” conceals an unspeakable secret?
