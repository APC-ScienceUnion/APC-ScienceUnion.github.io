---
layout: post
title: 'Elementary Number Theory: Introductory Methods'
date: '2020-06-20 18:00:00'
lang: en
translation_key: "初等数论入门方法"
translation_source_sha256: "667e984252757d1306606719e1d15a33eaeeea85d12cc4ce01037bce247b003d"
permalink: en/2020/06/20/introductory-methods-in-elementary-number-theory/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/cover-b079168c37.png
copyright_author: 'Delta'
---

> Author: Delta

&emsp;&emsp;Note: “introductory methods” here means methods used at the introductory level of elementary number theory, not ways to begin studying the subject. I am clarifying that distinction up front to avoid ambiguity.

&emsp;&emsp;Before we begin, let me ask a question:

&emsp;&emsp;Is √2 an integer?

&emsp;&emsp;There are only two possible answers: yes or no. Most readers will probably say no, because √2 is an ordinary irrational number, whereas the integers are 0, ±1, ±2, and so on. What comes next, however, may upend that assumption.

&emsp;&emsp;√2 really is an integer.

&emsp;&emsp;To see why, we first need the definition of an algebraic number:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-003-49764ed081.png" alt="" />

&emsp;&emsp;Every rational number, and every irrational number that can be expressed in radicals, is algebraic: each is a root of some polynomial with rational coefficients. An algebraic integer must meet a stricter condition:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-002-57af218d44.png" alt="" />

&emsp;&emsp;The equation x²-2=0 satisfies the required polynomial conditions, so its root √2 is an algebraic integer, or simply an “integer” in this context. Algebraic integers generalize the rational integers 0, ±1, ±2, and so on. They include every rational integer, but no nonintegral rational number—that is, no reduced fraction whose denominator is not 1.

&emsp;&emsp;Now back to √2. Why would mathematicians introduce a definition that calls it an integer? This is the viewpoint of algebraic number theory, a field developed largely in pursuit of Fermat's Last Theorem. More generally, solving problems about Diophantine equations requires extending number-theoretic properties of the ring of integers to broader classes of integral domains. That need gave rise to algebraic number theory, which studies such domains through their algebraic structure.

&emsp;&emsp;(Audience: Stop, stop, stop! Why do you keep throwing more unfamiliar terms at us?)

&emsp;&emsp;All right. Let me explain them one at a time:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-005-7c92e00b37.png" alt="" />

&emsp;&emsp;Algebraic number theory is only one branch of number theory, developed to address problems that arose in pure mathematics. It cannot solve every problem in number theory, so the field has grown many other branches, including analytic, computational, geometric, transcendental, and combinatorial number theory. In short, a particular problem calls for the right mathematical tools and, when necessary, broader definitions. This is standard practice in mathematics:

&emsp;&emsp;If a definition is too narrow, generalize it. If the generalization still fails to provide the properties you need, revise it. If that does not work either, discard it.

&emsp;&emsp;Our real subject today is the simplest branch of number theory: elementary number theory, which deals mainly with positive integers and their properties. I brought up algebraic number theory only to catch your attention, since its use of the word “integer” overturns many people's expectations. There is no real contradiction, only a change in terminology. If you said √2 was not an integer, you were entirely right: you meant the integers of elementary number theory, the ones you have studied for more than a decade, not the algebraic integers of algebraic number theory. I simply switched meanings on you.

&emsp;&emsp;Now we can begin the actual introduction to elementary number theory. From this point on, every term has its familiar elementary-number-theory meaning.

&emsp;&emsp;We will begin again with our protagonist, √2. Here is another question: Is √2 rational?

&emsp;&emsp;Of course not! The last question may have made some readers wary, but first I need to clear up a common misconception:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-004-ec9fff81b5.png" alt="" />

&emsp;&emsp;We usually call a number of the form p/q a “fraction.” The reduced fraction mentioned earlier is a particular kind of fraction, used so that the set of rational numbers does not contain duplicate representations. What exactly is a reduced fraction? Before wading into the formal definition, let us look at a few examples:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-008-21a24b7785.png" alt="" />

&emsp;&emsp;You have probably spotted the difference already. In primary school, we learned to reduce fractions. A fraction that has not been reduced completely is not in lowest terms. That makes the idea fairly easy to understand, doesn't it?

&emsp;&emsp;We also learned the next two ideas in primary school: the greatest common divisor (gcd) and least common multiple (lcm). Two numbers are coprime, or relatively prime, if their greatest common divisor is 1. If they are not coprime, the fraction formed from them is not in lowest terms. For brevity, we will write the greatest common divisor of a and b as (a,b), and their least common multiple as [a,b].

&emsp;&emsp;With that background in place, we can prove that √2 is irrational.

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-013-b87dbd96aa.png" alt="" />

&emsp;&emsp;Similar arguments work for other radicals. To digress briefly into algebraic number theory once more, this method can establish the irrationality of every irrational algebraic number. In other words, these numbers share a common property that elementary number theory treats case by case. That is one reason a separate field, algebraic number theory, became necessary.

&emsp;&emsp;All right, back to elementary number theory. With what we now know, plus Vieta's formulas for quadratic equations that we learned in middle school, we already know enough to enter the IMO and win a bronze medal—at least at the 1988 IMO:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-007-85968bb7d8.png" alt="" />

&emsp;&emsp;Here is the proof:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-006-29ac30c26c.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-009-590b2d8a37.png" alt="" />

&emsp;&emsp;The part about “winning an IMO bronze medal” was only a joke. In fact, if I had not shown you this solution, you might spend your entire life without finding it. Why? Is the problem really that hard?

&emsp;&emsp;Terence Tao earned only two points on this problem. Experts from the entire Olympiad committee, along with four Australian number theorists, worked for 4.5 hours without making meaningful progress. So as we explore the mathematics, I would also advise against showing off after learning only a little. All of us, myself included, may still lack the experience to judge our own ability or to know whether we truly understand the deeper ideas. A little humility goes a long way.

&emsp;&emsp;What matters is the central idea. In the proof, we assume a minimum and then construct something smaller, creating a contradiction. Number theorists call this method infinite descent, and they commonly use it to solve Diophantine equations. When infinite descent is combined with Vieta's formulas as it is here, the technique is called Vieta jumping.

&emsp;&emsp;Infinite descent is useful for more than solving Diophantine equations. It can also prove that √2 is irrational. The argument is quite simple, so try working it out for yourself before consulting the version from Baidu below—I was too lazy to type it out:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-010-9b5c09b704.png" alt="" />

&emsp;&emsp;As we can see, this is a powerful form of proof by contradiction. There is also a corresponding method called infinite ascent, though ascent and descent are essentially the same idea. With an infinite-ascent argument, we can prove the following fact:

&emsp;&emsp;<strong>There are infinitely many primes.</strong>

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-014-08adbb1f46.png" alt="" />

&emsp;&emsp;Of course not. Believe it or not, this probability is connected to pi!

&emsp;&emsp;(Audience: ??? Doesn't elementary number theory deal mainly with positive integers? At most, shouldn't it bring in a few rational numbers? How did pi get involved?)

&emsp;&emsp;(An audience member who knows some algebraic number theory: Exactly! Even algebraic number theory deals with algebraic numbers, while pi is transcendental. How could they possibly be related?)

&emsp;&emsp;The story begins 400 years ago. Legend has it that Wu Cheng'en dreamed of Sun Wukong wreaking havoc in heaven, woke up, and wrote Journey to the West... Ahem, wrong script. It was not more than 400 years ago, but almost 400: 376 years, to be exact.

&emsp;&emsp;In 1644, Pietro Mengoli posed a famous problem about an infinite series:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-019-1681695126.png" alt="" />

&emsp;&emsp;The problem stumped mathematicians for 91 years before Leonhard Euler solved it in 1735. Named for Basel, Switzerland's third-largest city and Euler's hometown, it became known as the Basel problem.

&emsp;&emsp;Today, the Basel problem is considered elementary and fairly simple. Anyone with a command of advanced mathematics can give a nonrigorous derivation. Euler presented such a derivation in 1735, then supplied a rigorous version in 1741.

&emsp;&emsp;To explain Euler's method, we begin with the Maclaurin series expansion:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-011-293c1f22e9.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-012-da641d62bb.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-015-1e2b94a04b.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-016-5a34d78ad7.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-017-04b9503b1f.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-018-4773f3fc15.png" alt="" />

&emsp;&emsp;A Fourier-series proof of the Basel problem follows directly from Parseval's identity.

&emsp;&emsp;Next, consider:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-020-1769a23154.png" alt="" />

&emsp;&emsp;and apply a few simple manipulations.

&emsp;&emsp;To keep the expression concise and readable, we omit the limit notation and write:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-021-69cfcf35b8.png" alt="" />

&emsp;&emsp;Then:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-022-2642d3c6b5.png" alt="" />

&emsp;&emsp;This gives us the exact sum of the reciprocal squares of all even positive integers.

&emsp;&emsp;Now subtract the second equation from the first:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-023-965070df91.png" alt="" />

&emsp;&emsp;This gives us the exact sum of the reciprocal squares of all odd positive integers as well.

&emsp;&emsp;Put another way, summing over all odd numbers is the same as summing over the positive integers after removing every multiple of 2. Could we repeat the process, removing the multiples of 3 that are not already multiples of 2, then the multiples of 5 that are not multiples of 2 or 3, and so on until every composite number is gone?

&emsp;&emsp;Let us carry out that process:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-024-03ebdf1ca9.png" alt="" />

&emsp;&emsp;Then:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-025-12d0f700d9.png" alt="" />

&emsp;&emsp;We also have:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-026-e039c94ef8.png" alt="" />

&emsp;&emsp;Repeating the procedure yields the equation below, where p ranges over all primes:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-032-793b27e251.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-028-1efa4e27e4.png" alt="" />

&emsp;&emsp;This proof shows how closely the branches of mathematics are connected. You might begin with number theory and soon find yourself working in calculus or complex analysis. Push the argument above a little further, and it leads to the Riemann hypothesis.

&emsp;&emsp;Now set aside the probability that two randomly chosen positive integers are coprime, and consider a simpler problem:

&emsp;&emsp;Choose n+1 numbers from the positive integers less than 2n. What is the probability that at least two of them are coprime?

&emsp;&emsp;One hundred percent.

&emsp;&emsp;(Audience: That's it, we're leaving. You're messing with us. Didn't you just say the answer involved pi?)

&emsp;&emsp;For unrestricted positive integers, it does involve pi. But the new constraints make this problem much simpler. Once we know the pigeonhole principle, the solution is easy.

&emsp;&emsp;The pigeonhole principle:

&emsp;&emsp;If more than n+1 objects are placed in n pigeonholes, at least one pigeonhole contains at least two objects.

&emsp;&emsp;The principle itself is intuitive, and I am sure everyone understands it. The hard part is deciding what the pigeonholes should be. Let us see how Louis Pósa answered this problem when he first encountered it, before he was twelve:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-027-472f848bb9.png" alt="" />

&emsp;&emsp;What a clever construction! But why must consecutive positive integers be coprime? Before moving on, try a few examples. You will notice that consecutive integers can never share a common factor. In fact, we have:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-029-66e632296c.png" alt="" />

&emsp;&emsp;How does Bézout's identity show that consecutive positive integers are always coprime? Set x=1 and y=-1, and the result follows immediately.

&emsp;&emsp;That brings us close to the end of this introduction. Looking back, we have spent most of our time on properties of positive integers: coprimality, divisibility, least common multiples, and greatest common divisors. Positive integers alone give rise to many intricate and beautiful theories, and some of their questions remain unsolved. Consider Goldbach's conjecture. On June 7, 1742, Christian Goldbach, a Prussian envoy to Russia, wrote to Euler and proposed that “every even number beginning with 4—that is, every large even number—can be expressed as the sum of two primes; every odd number beginning with 7 can be expressed as the sum of three primes. The latter follows from the former and can also be proved independently (it has now been solved).” Later mathematicians adopted a compact notation: expressing a large even number as the sum of a product of at most a primes and a product of at most b primes is called the (a+b) problem. Chen Jingrun's result, the closest step toward Goldbach's conjecture, expresses a large even number as the sum of a prime and a product of at most two primes. It is therefore written (1+2), not 1+2=3. Likewise, Goldbach's conjecture expresses a large even number as the sum of one prime and another prime, so it is written (1+1), not 1+1=2. If the generations of mathematicians worn out by Goldbach's conjecture knew how many people now repeat the claim that “1+1=2 has not been proved,” they might rise from the dead in fury.

&emsp;&emsp;That covers everything planned for this introduction. Until fate brings us together again~
