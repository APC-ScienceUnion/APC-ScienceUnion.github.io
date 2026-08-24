---
layout: post
title: 'Introductory Methods in Elementary Number Theory'
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

&emsp;&emsp;Note: “introductory methods” does not mean “methods for getting started with elementary number theory.” It means “methods used at the introductory level of elementary number theory.” This distinction is stated upfront to avoid ambiguity.

&emsp;&emsp;Before the article begins, let me ask a question:

&emsp;&emsp;Is √2 an integer?

&emsp;&emsp;There are only two possible answers: yes or no. I expect most readers to say no, because √2 is ordinarily understood as an irrational number, while the integers are 0, ±1, ±2, and so on. What I say next, however, may overturn some people's assumptions.

&emsp;&emsp;√2 really is an integer.

&emsp;&emsp;To explain this, we must first understand the concept of an algebraic number:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-003-49764ed081.png" alt="" />

&emsp;&emsp;Clearly, every rational number and every irrational number expressible using radicals is algebraic, because each must be a root of some polynomial with rational coefficients. The definition of an algebraic integer is stricter. It requires:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-002-57af218d44.png" alt="" />

&emsp;&emsp;We can readily see that x²-2=0 satisfies the polynomial conditions for an algebraic integer. Its root √2 is therefore an algebraic integer, or an “integer” in this context. Algebraic integers generalize the rational integers 0, ±1, ±2, and so on. They include all rational integers but not noninteger rational numbers—that is, reduced fractions whose denominator is not 1.

&emsp;&emsp;Let us return to √2. Why would mathematicians invent a new definition that classifies it as an integer? This is the perspective of algebraic number theory, a field developed largely to solve Fermat's Last Theorem. To solve problems involving Diophantine equations more generally, we need to extend the number-theoretic properties of the ring of integers to more general integral domains. This need gave rise to algebraic number theory, which studies integral domains through algebraic structures.

&emsp;&emsp;(Audience: Stop, stop, stop! Why are there more and more terms we cannot understand?)

&emsp;&emsp;All right, I will explain them one by one:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-005-7c92e00b37.png" alt="" />

&emsp;&emsp;Algebraic number theory is only one branch of number theory, created to solve problems that arose in pure mathematics. It cannot solve every number-theory problem, so the field has evolved many other branches, including analytic, computational, geometric, transcendental, and combinatorial number theory. In short, solving a particular problem requires developing the appropriate mathematical tools and extending the necessary definitions. This is common practice in mathematics:

&emsp;&emsp;If a definition is inadequate, generalize it. If the generalized definition still lacks certain properties, revise it. If that still fails, abandon it.

&emsp;&emsp;Our main subject today is the simplest part of number theory: elementary number theory, which primarily studies positive integers and their properties. The introduction to algebraic number theory was merely intended to attract your attention, since its concept of an integer overturns many people's assumptions. The apparent contradiction is simply a difference in terminology. If you said √2 was not an integer, you were entirely correct, because the “integers” you meant were those of elementary number theory, which you have studied for more than a decade, not the algebraic integers of algebraic number theory. I simply switched between the two meanings.

&emsp;&emsp;Now let us begin the actual introduction to elementary number theory. Every term below has its elementary-number-theory meaning: the familiar meaning you already remember.

&emsp;&emsp;We will again begin with our protagonist, √2. Here is another question: Is √2 rational?

&emsp;&emsp;Of course not! The previous question may have made some readers wary, but I first need to correct a common assumption:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-004-ec9fff81b5.png" alt="" />

&emsp;&emsp;We usually call a number p/q a “fraction.” A reduced fraction, mentioned earlier, is one type of fraction. It is defined so that the set of rational numbers contains no duplicate elements. What is a reduced fraction? Before giving the obscure definition, let us look at some examples:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-008-21a24b7785.png" alt="" />

&emsp;&emsp;You have probably already spotted the difference. In primary school, we learned an operation on fractions called reduction. A fraction that has not been reduced completely is not a reduced fraction. That makes the idea easy to understand, does it not?

&emsp;&emsp;We also learned the next concepts in primary school: the greatest common divisor (gcd) and least common multiple (lcm). If the greatest common divisor of two numbers is 1, the numbers are coprime, or relatively prime. If they are not coprime, the fraction they form cannot be reduced. For brevity, we generally write the greatest common divisor of a and b as (a,b), and their least common multiple as [a,b]. The rest of this article will use the same notation.

&emsp;&emsp;With this background, we can begin proving that √2 is not rational.

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-013-b87dbd96aa.png" alt="" />

&emsp;&emsp;Other radicals can be treated by similar proofs. To digress briefly into algebraic number theory again, every irrational algebraic number can be proved irrational by this method; in other words, they share a common property that elementary number theory separates into individual cases. This also shows why a new discipline, algebraic number theory, had to be developed.

&emsp;&emsp;All right, back to elementary number theory. With this knowledge and Vieta's formulas for quadratic equations, which we learned in middle school, we can already enter the IMO and win a bronze medal—at least in 1988:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-007-85968bb7d8.png" alt="" />

&emsp;&emsp;The proof is as follows:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-006-29ac30c26c.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-009-590b2d8a37.png" alt="" />

&emsp;&emsp;The claim about “winning an IMO bronze medal” was only a joke. In fact, if I had not shown you this solution, you might never solve the problem in your entire life. Why? Is it really that difficult?

&emsp;&emsp;Terence Tao earned only two points on this problem. Experts from the entire Olympiad committee, together with four Australian masters of number theory, worked for 4.5 hours without making substantive progress. So while introducing the mathematics, I also suggest that readers avoid showing off after learning only a little. All of us, myself included, may still lack the experience to estimate our own ability accurately or to know whether we have understood the deeper ideas. A little humility is in order.

&emsp;&emsp;What we should really understand is the problem's central idea. Examine the proof and you will see that it assumes a minimum, then finds something smaller, producing a contradiction. In number theory, this method is called infinite descent and is generally used to solve Diophantine equations. When infinite descent is combined with Vieta's formulas as above, the method is called Vieta jumping.

&emsp;&emsp;Infinite descent is useful not only for solving Diophantine equations. It can also prove the irrationality of √2. The proof is very simple, so you can think it through yourself and then consult the version on Baidu—I was too lazy to type it out—shown below:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-010-9b5c09b704.png" alt="" />

&emsp;&emsp;As we can see, this is an effective and powerful proof by contradiction. A corresponding method called infinite ascent also exists, though ascent and descent are essentially the same. Using the same idea in an infinite-ascent argument, we can prove the following fact:

&emsp;&emsp;<strong>There are infinitely many primes.</strong>

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-014-08adbb1f46.png" alt="" />

&emsp;&emsp;Of course not. I can tell you with confidence that, remarkably, this probability is connected to pi!

&emsp;&emsp;(Audience: ??? Does elementary number theory not mainly study positive integers? At most it should involve a few rational numbers. How did pi get involved?)

&emsp;&emsp;(An audience member with a background in algebraic number theory: Exactly! Even algebraic number theory discusses algebraic numbers, while pi is transcendental. How can they be related?)

&emsp;&emsp;The story begins 400 years ago. According to legend, Wu Cheng'en dreamed that Sun Wukong caused havoc in heaven, woke up, and wrote Journey to the West... Ahem, wrong script. It was not more than 400 years ago, but nearly 400—376 years, to be exact.

&emsp;&emsp;In 1644, Pietro Mengoli posed a famous problem involving a series:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-019-1681695126.png" alt="" />

&emsp;&emsp;The problem troubled mathematicians for 91 years before Leonhard Euler solved it in 1735. It is named after Basel, Switzerland's third-largest city and Euler's hometown, and is known as the Basel problem.

&emsp;&emsp;Today, the Basel problem is elementary and quite simple. Anyone familiar with advanced mathematics can give a nonrigorous derivation. Euler produced that nonrigorous argument in 1735 and presented a rigorous version in 1741.

&emsp;&emsp;We will explain Euler's method beginning with the Maclaurin-series expansion:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-011-293c1f22e9.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-012-da641d62bb.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-015-1e2b94a04b.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-016-5a34d78ad7.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-017-04b9503b1f.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-018-4773f3fc15.png" alt="" />

&emsp;&emsp;A proof of the Basel problem using Fourier series follows directly from Parseval's identity.

&emsp;&emsp;Next, we take:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-020-1769a23154.png" alt="" />

&emsp;&emsp;and perform a few simple transformations.

&emsp;&emsp;For a more concise and readable expression, we remove the limit notation and write:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-021-69cfcf35b8.png" alt="" />

&emsp;&emsp;Then:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-022-2642d3c6b5.png" alt="" />

&emsp;&emsp;We have obtained the exact value of the sum of the reciprocal squares of all even positive integers.

&emsp;&emsp;Subtracting the second equation from the first gives:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-023-965070df91.png" alt="" />

&emsp;&emsp;We have also obtained the exact value of the sum of the reciprocal squares of all odd positive integers.

&emsp;&emsp;Put differently, is the sum over all odd numbers not simply the sum over the sequence obtained by removing every multiple of 2 from the positive integers? If we follow the same procedure, can we not remove the multiples of 3 that are not multiples of 2, then the multiples of 5 that are not multiples of 2 or 3, and so on, until every composite number has been removed?

&emsp;&emsp;Let us continue:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-024-03ebdf1ca9.png" alt="" />

&emsp;&emsp;Then:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-025-12d0f700d9.png" alt="" />

&emsp;&emsp;Clearly, we also have:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-026-e039c94ef8.png" alt="" />

&emsp;&emsp;Repeating the procedure produces the equation below, where p ranges over all primes:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-032-793b27e251.png" alt="" />

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-028-1efa4e27e4.png" alt="" />

&emsp;&emsp;This proof shows that the branches of mathematics are closely connected. You may begin by studying number theory and find yourself in calculus or complex analysis. Incidentally, extending the proof above a little further would lead us to the Riemann hypothesis.

&emsp;&emsp;Let us now set aside the probability that two arbitrarily chosen positive integers are coprime and consider a simpler situation:

&emsp;&emsp;Choose n+1 numbers from all the positive integers less than 2n. What is the probability that two of them are coprime?

&emsp;&emsp;One hundred percent.

&emsp;&emsp;(Audience: That's it, we're leaving. You are messing with our heads. Did you not just say it was related to pi?)

&emsp;&emsp;For all positive integers, it is indeed related to pi. But the new constraints make this problem much simpler. If we know the pigeonhole principle, it is actually very easy.

&emsp;&emsp;The pigeonhole principle:

&emsp;&emsp;If more than n+1 objects are placed into n pigeonholes, at least one pigeonhole contains no fewer than two objects.

&emsp;&emsp;The principle is intuitive and obvious, and I am sure everyone understands it. The difficult part is constructing the pigeonholes. Let us see how the first person to encounter this problem, Louis Pósa, answered it before the age of twelve:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-027-472f848bb9.png" alt="" />

&emsp;&emsp;A remarkably clever construction! But why must consecutive positive integers be coprime? Before rushing ahead, try a few examples. Do you notice that they can never have a common factor? In fact, we have:

<img src="/images/%E5%88%9D%E7%AD%89%E6%95%B0%E8%AE%BA%E5%85%A5%E9%97%A8%E6%96%B9%E6%B3%95/fig-029-66e632296c.png" alt="" />

&emsp;&emsp;How can Bézout's identity show that consecutive positive integers are always coprime? Simply set x=1 and y=-1, and the result follows immediately.

&emsp;&emsp;This brings our introduction close to its end. Looking back, we have spent most of our time discussing properties of positive integers such as coprimality, divisibility, least common multiples, and greatest common divisors. Positive integers alone lead to many complex and beautiful theories, and some questions remain unsolved today. Consider Goldbach's conjecture: on June 7, 1742, Christian Goldbach, a Prussian envoy to Russia, wrote to Euler and proposed that “every even number beginning with 4—that is, every large even number—can be expressed as the sum of two primes; every odd number beginning with 7 can be expressed as the sum of three primes. The latter follows from the former and can also be proved independently (it has now been solved).” For convenience, later mathematicians called the representation of a large even number as the sum of a product of at most a primes and a product of at most b primes the (a+b) problem. Chen Jingrun's work, the closest step toward Goldbach's conjecture, represents a large even number as the sum of a prime and a product of at most two primes, so it is written (1+2), not 1+2=3. Likewise, Goldbach's conjecture represents a large even number as the sum of one prime and another prime, so it is written (1+1), not 1+1=2. If the generations of mathematicians exhausted by Goldbach's conjecture knew that so many people today repeat the claim that “1+1=2 has not been proved,” they might rise from the dead in fury.

&emsp;&emsp;We have now covered everything planned for this introduction. Until fate brings us together again next time~
