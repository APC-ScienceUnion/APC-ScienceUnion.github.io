---
layout: post
title: 'Hilbert''s Tenth Problem, Part III: The Road to a Solution'
date: '2025-07-13 12:17:00'
lang: en
translation_key: "Hilbert第十问题的硬科普（三）：一段历史（下）"
translation_source_sha256: "c4914034b243f2561056e65952e9042fcf444cdab6bb06fb99162b7e051fdf2f"
permalink: en/2025/07/13/hilberts-tenth-problem-part-three-a-history-concluded/
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-001-d4db078819.png'
copyright_author: 'silverxz'
aside: true
comments: false
tags: []
categories: []
---

> Author: silverxz
Proofreader: Shiguang

&emsp;&emsp;Many years later, when Hilbert's Tenth Problem had finally been laid to rest, Martin Davis would surely remember that distant afternoon when his teacher said, “Hilbert's Tenth Problem begs for an unsolvability proof.”

&emsp;&emsp;We have already seen how **Gödel, Turing, and others shattered the completeness, consistency, and decidability sought by Hilbert's program**. Hilbert's Tenth Problem is simply a special case of the decision problem. The negative answer to that broader question transformed almost all optimism about Hilbert's Tenth Problem into pessimism within a decade.

&emsp;&emsp;Emil Post was one of the founders of computability theory, but fortune rarely favored him. At twelve, he lost his left arm in a car accident, which led him to abandon astronomy for mathematics. He earned his doctorate at twenty-three and went to Princeton for postdoctoral study, only to develop a manic illness that limited him to three hours of research a day. While at Princeton, he came close to discovering Gödel's incompleteness theorem a decade before Gödel, but withheld publication because he thought the analysis needed further development. At fifty-seven, he died of a heart attack brought on by electroconvulsive treatment for depression. With a little more luck, his name might now loom much larger in history.

&emsp;&emsp;Back to our story. In 1944, forty-four years after Hilbert posed the problem, Post—then chair of mathematics at the City College of New York—offered his view of Hilbert's Tenth Problem: **“Hilbert's Tenth Problem begs for an unsolvability proof.”**

&emsp;&emsp;Perhaps it was only an offhand opinion. Post could not have known that, in a sense, this very remark would lead to the problem's solution. Martin Davis, then an undergraduate at the City College of New York, heard him say it. That moment launched Davis's work on Hilbert's Tenth Problem and made him one of the central figures in this story.

# Davis: Diophantine Sets

&emsp;&emsp;In retrospect, the first key step toward resolving Hilbert's Tenth Problem was to introduce the concept of a **Diophantine set** and recognize its importance. A Diophantine set is tied to the solvability of Diophantine equations. Because it is a subset of the natural numbers, it can be studied with the tools of computability theory. Put simply: **If some Diophantine set can be shown to be undecidable, Hilbert's Tenth Problem must be unsolvable.**

&emsp;&emsp;The mathematics here is not yet too difficult, and even readers interested only in the history may wish to see what a Diophantine set is. We will therefore insert a short mathematical interlude, which may also be skipped:

&emsp;&emsp;Recall that a Diophantine equation is a multivariate polynomial equation with integer coefficients. We write it in the form <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-002-09633b24f4.png" alt="" /> , where <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-003-e6edff0636.png" alt="" /> are its variables. Strictly speaking, they take integer values, but standard technical transformations let us work equivalently over the natural numbers; we omit those details here.

&emsp;&emsp;A Diophantine set is a set <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-004-acfeae4e28.png" alt="" /> of ordered n-tuples of natural numbers. It must satisfy the following condition: there is a Diophantine equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-005-9569450a05.png" alt="" /> such that <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-006-227371264f.png" alt="" /> has a solution.

&emsp;&emsp;A brief clarification: the order of the quantifiers matters. Once the Diophantine equation D has been chosen, it is fixed, and the same D must be used for every <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-007-732e6989f5.png" alt="" /> . Meanwhile, <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-008-f65207bb33.png" alt="" /> is the m-variable Diophantine equation obtained by replacing the variables <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-003-e6edff0636.png" alt="" /> with the constants <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-009-7ef7239436.png" alt="" /> .

&emsp;&emsp;At first sight, the point of this construction may be obscure. The key is that D is a subset of the natural numbers, which means that tools from computability theory can be brought to bear on it.

&emsp;&emsp;Recall when a subset S of the natural numbers is called **decidable** (also computable or recursive): precisely when there is a Turing machine M that, given a natural number a, can determine in finite time whether a belongs to S.

&emsp;&emsp;If Hilbert's Tenth Problem were solvable, we would have a Turing machine M′ that could determine whether any Diophantine equation has a solution. For a Diophantine set S, we would simply ask M′ whether the equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-008-f65207bb33.png" alt="" /> has a solution. This would tell us whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-007-732e6989f5.png" alt="" /> belongs to S, making every Diophantine set S decidable.

&emsp;&emsp;The contrapositive is equally important: if we can find an undecidable Diophantine set S, then no such M′ exists, and Hilbert's Tenth Problem is unsolvable. Decidability of sets was already familiar territory in computability theory, with a rich supply of approaches and tools. That is why Diophantine sets mattered so much—though this is admittedly clearer in hindsight.

&emsp;&emsp;Davis was the first to make progress through Diophantine sets—hopefully our mathematical detour has not made the reader forget him. After college, he pursued a doctorate under Alonzo Church, studying the hyperarithmetic hierarchy, an extension of Kleene's work on the arithmetic hierarchy. It was a fresh, unexplored field: interesting and virtually certain to yield results. A researcher could hardly ask for a better topic.

&emsp;&emsp;Yet Davis was torn. Hilbert's Tenth Problem was irresistible. He knew he was unlikely to make headway on something so difficult, but he could not stop thinking about it. In the end he pursued both subjects, and his dissertation covered both the hyperarithmetic hierarchy and Hilbert's Tenth Problem.

&emsp;&emsp;Our concern is the part of Davis's dissertation devoted to Hilbert's Tenth Problem. What did that 1953 paper accomplish?

&emsp;&emsp;Davis showed that the intersection or union of finitely many Diophantine sets is still Diophantine, although the complement of a Diophantine set need not be. These properties match those of recursively enumerable sets in computability theory. Davis was therefore led naturally to ask whether the Diophantine sets might be exactly the recursively enumerable sets. If so, a basic fact of computability theory—the existence of an undecidable recursively enumerable set—would imply the existence of an undecidable Diophantine set, and hence the unsolvability of Hilbert's Tenth Problem.

&emsp;&emsp;The conjecture was elegant and concise, but proving it was hard. Davis's result seemed to fall only one step short. To see why, we need another short mathematical interlude.

&emsp;&emsp;Our goal is to prove that Diophantine sets and recursively enumerable sets coincide. Recursive enumerability is a concept from computability theory and closely resembles the “recursive” or decidable sets introduced above. A recursive set S requires a Turing machine M such that, for any given <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-010-67285d74ea.png" alt="" /> , M can determine in finite time whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-011-2819958103.png" alt="" /> holds. That is, when <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-011-2819958103.png" alt="" /> , M must answer yes, and otherwise it must answer no. A recursively enumerable set S′ need satisfy only half of this requirement: when <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-012-a0fa34cd29.png" alt="" /> , M must correctly answer that a belongs to S′; but when <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-013-2f9d989127.png" alt="" /> , M may not answer incorrectly, but it is allowed not to halt—it may run forever without returning an answer. For this reason, recursively enumerable sets were also described as <strong>semidecidable</strong>.

&emsp;&emsp;Under this definition, every Diophantine set is recursively enumerable. Given a Diophantine set S, we let a Turing machine M enumerate <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-014-3ed4bff427.png" alt="" /> , testing whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-015-01e7bfa03d.png" alt="" /> is a solution of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-008-f65207bb33.png" alt="" /> . If <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-016-6c90f2d5c7.png" alt="" /> , some solution tuple exists and will eventually be reached. If no solution exists, M keeps enumerating forever and never halts. Thus S is recursively enumerable. (One detail not mentioned earlier is that <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-007-732e6989f5.png" alt="" /> is an n-tuple in <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-017-713e769dc6.png" alt="" /> but can be encoded as an element of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-017-713e769dc6.png" alt="" /> , so S can be regarded as a subset of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-017-713e769dc6.png" alt="" /> . This is a minor technicality that need not concern us here.)

&emsp;&emsp;The real difficulty, then, is to prove that every recursively enumerable set is Diophantine. First write the definition of a one-variable Diophantine set formally:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-018-aa822e88de.png" alt="" />

&emsp;&emsp;If every recursively enumerable set could be written in this form, the proof would be complete. Davis did not achieve exactly that, but he proved a closely related representation: if S is recursively enumerable, then

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-019-f0493271ff.png" alt="" />

&emsp;&emsp;The extra element is a bounded universal quantifier, namely <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-020-68aacb677c.png" alt="" /> . If it were replaced by <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-021-7f59a2ced8.png" alt="" /> , the expression would match the one above. This representation of a recursively enumerable set became known as **Davis normal form**.

&emsp;&emsp;Davis appeared to be only one step—and a single symbol—away from the solution. Yet that tiny gap proved immense. For decades afterward, mathematicians struggled to eliminate the bounded universal quantifier.

# Robinson: A Conjecture about Exponential Diophantine Equations

&emsp;&emsp;Meanwhile, Davis was not the only person thinking about Diophantine sets. In 1948, Alfred Tarski conjectured that the set of all powers of two was not Diophantine—in other words, that Diophantine equations could not express exponentiation.

&emsp;&emsp;Tarski was a major figure whose work left a deep mark across many branches of mathematics. Readers may have heard of the famous Banach–Tarski paradox: assuming the axiom of choice, a ball can be “cut” into a finite number of pieces and reassembled into two balls, each the same size as the original. That is the attention-grabbing version; the mathematical statement is more precise. Yet it was merely one result Tarski produced in 1924, at the age of twenty-three.

&emsp;&emsp;Returning to the story, Tarski asked his student Julia Robinson to prove his conjecture that Diophantine equations could not express exponential functions. Robinson's life had been marked by hardship: she lost her mother as a child, suffered poor health, and at eighteen lost her father to suicide amid financial difficulty. None of this could obscure her mathematical talent. She is the second central figure in our story.

&emsp;&emsp;Even a great mathematician does not conjecture correctly every time—the collapse of Hilbert's program has already shown us that. Tarski's conjecture was also false, so Robinson naturally could not prove it. After her attempts failed, she reversed the question: might Diophantine equations actually be able to represent exponentiation? She made the bold conjecture: <strong>Could every exponential Diophantine equation be equivalent to an ordinary Diophantine equation?</strong> An exponential Diophantine equation permits variables in exponents, as in <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-022-34d1d3bd94.png" alt="" /> .

&emsp;&emsp;In fairness, Tarski's mistake was understandable. It is natural to suppose that polynomial equations cannot express exponentiation; Robinson's contrary guess was the truly audacious one. The eventual solution of Hilbert's Tenth Problem would depend repeatedly on her exceptional instinct for the right direction.

&emsp;&emsp;Robinson pursued the conjecture and published her findings in 1952. Although she did not prove it, she showed how exponential Diophantine equations could express binomial coefficients, factorials, and primes, demonstrating their remarkable expressive power. She then found a sufficient condition under which an exponential Diophantine equation could be represented by an ordinary Diophantine equation. This condition later became known as the **J. R. hypothesis**. At the time, this work was chiefly an exploration of Diophantine sets and equations, with no obvious direct connection to Hilbert's Tenth Problem. Perhaps no one yet realized how important it would become.

&emsp;&emsp;One might expect Davis and Robinson to meet, combine their results, and solve Hilbert's Tenth Problem together. They did meet at the 1950 International Congress of Mathematicians in Cambridge, shortly before Robinson published her paper, and exchanged accounts of their work. Robinson explained that she was seeking Diophantine definitions for particular sets, especially those connected with exponentiation, and described the J. R. hypothesis. Davis immediately said that he did not think her approach would go far. Privately, Robinson thought much the same of his—perhaps a case of scholars underestimating one another. Davis later called his verdict “surely one of the especially stupid things I have said in my life.”

# Davis, Putnam, and Robinson: Collaboration

&emsp;&emsp;In the summer of 1957, Cornell University hosted a five-week conference attended by nearly every logician in the United States. There Davis met the third principal figure in this history: Hilary Putnam, a logician and philosopher. They lodged together during the conference, got along immediately, and decided almost without hesitation to collaborate.

&emsp;&emsp;Recall Davis normal form, which fell short by just one bounded universal quantifier. Davis had constructed it by adapting Gödel's encoding method based on the Chinese remainder theorem. Putnam now suggested applying the Chinese remainder theorem a second time.

&emsp;&emsp;Davis was skeptical at first; he had surely considered the idea many times already. Yet the approach worked. They collaborated further over the next three summers and, in Davis's words, “we had a wonderful time.” He recalled, “We talked about everything. Hilary taught me a little classical European philosophy, and I taught him functional analysis. We talked about Freudian psychology, current affairs, and the foundations of quantum mechanics, but mostly we talked about mathematics.”

&emsp;&emsp;In the summer of 1959 they obtained their most important result. They applied the Chinese remainder theorem to Davis normal form, incorporated Robinson's methods, and carried out a long and intricate analysis. At last they eliminated the bounded universal quantifier—but at the cost of introducing **two new conditions**. The first was Robinson's conjecture that exponential Diophantine equations could be represented by ordinary Diophantine equations. The second concerned the primes: the sequence 2, 3, 5, 7, 11,... contains arithmetic progressions of arbitrary length.

&emsp;&emsp;The second conjecture was not proved until 2004, by Ben Green and Terence Tao, and is now the Green–Tao theorem. Davis and Putnam certainly could not settle it. Here collaboration showed its value: they sent their results to Robinson, perhaps simply because her conjecture appeared in the proof. Their lines of research had converged unexpectedly.

&emsp;&emsp;What they did not expect was Robinson's breakthrough on the second condition. She ingeniously modified and extended their proof, using number-theoretic techniques to bypass that conjecture altogether. Her command of number theory was evidently formidable. An interesting detail is that she had long been married to Raphael Robinson, the very teacher who had once taught her number theory.

&emsp;&emsp;Once Robinson had bypassed the second conjecture, they had in fact proved: **Every recursively enumerable set is exponential Diophantine**. The three published the result jointly in 1961. Their collaboration made each of them reassess the other. Davis had thought Robinson's approach a dead end, only to discover that her machinery was indispensable and that she was an exceptional mathematician. Robinson had likewise doubted the promise of Davis's ideas, but his work changed her mind. In her own words, ***“I am very pleased, surprised, and impressed with your results on Hilbert's Tenth Problem.”***

&emsp;&emsp;Let us take stock. To prove Hilbert's Tenth Problem unsolvable, it is enough to prove that Diophantine sets are exactly the recursively enumerable sets. By the result just obtained, this is equivalent to proving that Diophantine sets are exactly the exponential Diophantine sets. Robinson's earlier work supplied a sufficient condition: the J. R. hypothesis. In short: **Proving the J. R. hypothesis would prove Hilbert's Tenth Problem unsolvable.** Research on Hilbert's Tenth Problem had entered a new phase.

# Matiyasevich: Through the Fog to the Final Piece

&emsp;&emsp;Over the next several years, the three tried without success to prove the J. R. hypothesis. Throughout the 1960s they found many new conditions that would imply it, but never a proof. Even Robinson, who had formulated the hypothesis, became so pessimistic that she briefly tried to prove Hilbert's Tenth Problem solvable instead.

&emsp;&emsp;Eight years passed. No progress.

&emsp;&emsp;Many colleagues had never expected the Davis–Putnam–Robinson approach to succeed. Even a referee of their important 1961 paper wrote: “The authors' proof is ingenious, but it uses no deep number theory or computability theory, so it is unlikely to be closely connected with Hilbert's Tenth Problem. The conjecture about exponential Diophantine equations is unlikely to hold either.”

&emsp;&emsp;As noted earlier, Tarski's intuition—that exponential Diophantine equations are strictly more expressive than ordinary Diophantine equations—is the more natural one. Davis and his collaborators persisted because their work gave them deeper insight into the problem. By now, however, even they had begun to doubt themselves.

&emsp;&emsp;In 1968, Davis obtained a modest new result. Robinson's response reveals how pessimistic she had become: “I am glad to see your result. My faith in the J. R. hypothesis has not returned, but for the first time I can see how it might be proved. Your method may indeed work, though it seems to require infinitely much luck.” When a mathematician who studies decidability appeals to “infinitely much” luck, it is plainly a tactful way of expressing no confidence at all.

&emsp;&emsp;During these years, Davis often lectured on Hilbert's Tenth Problem. When asked what came next, he may have smiled ruefully to himself and deflected with a joke: “I believe the J. R. hypothesis will be proved by a clever young Russian.”

&emsp;&emsp;There may have been two reasons for the remark. Soviet education had a reputation for producing youthful prodigies, a tradition that to some extent continues in Russia and China. At the same time, the Cold War left Soviet scholarship relatively isolated. Mathematics enjoyed more exchange than most fields, but communication remained difficult, and Americans such as Davis rarely spoke with Soviet colleagues. Saying that a Soviet would prove it may simply have been a wistful hope for an unforeseen miracle.

&emsp;&emsp;Yet Hilbert's Tenth Problem had not gone unnoticed in Soviet mathematics. Let us turn the clock back.

&emsp;&emsp;At seventeen, Yuri Matiyasevich won an IMO gold medal and, in the same year—1964—entered Leningrad State University without the usual examinations. He was nearly the archetype of a “young prodigy.” Perhaps Davis had acquired a gift for prophecy amid his frustrations, because Matiyasevich is the final key figure in this story.

&emsp;&emsp;By his second year, Matiyasevich had already produced results in mathematical logic substantial enough to present at the 1966 International Congress of Mathematicians. Sergei Maslov then suggested that he study Hilbert's Tenth Problem: “Try to prove that no algorithm can decide whether a Diophantine equation has a solution. The question has a name—Hilbert's Tenth Problem—but you need not worry about that.”

&emsp;&emsp;“But... I haven't learned any method for proving a decision problem undecidable,” Matiyasevich said.

&emsp;&emsp;“That does not matter,” Maslov replied. “Usually you reduce another known undecidable problem to it, and you already know reduction techniques well.” He was not wrong: Davis's attempt to prove that Diophantine sets coincide with recursively enumerable sets was itself a reduction based on the known undecidability of a recursively enumerable set.

&emsp;&emsp;“What else should I read?” Matiyasevich asked.

&emsp;&emsp;“Well... some Americans have worked on it, but you do not need to read them.”

&emsp;&emsp;“Why?”

&emsp;&emsp;“They have been at it for so long without solving it that their method must be wrong,” Maslov said.

&emsp;&emsp;It is hard to blame Maslov for dismissing Davis's group or underestimating the difficulty of the problem. Before working on a question, people routinely misjudge it. A famous but poorly substantiated story says that Minkowski once declared, “The four-color theorem has not been proved only because third-rate mathematicians have wasted their time on it.” He then tried for several weeks and failed.

&emsp;&emsp;Nor was Maslov alone in his skepticism. The J. R. hypothesis was merely a sufficient condition for exponential Diophantine equations to be equivalent to ordinary Diophantine equations; that equivalence was itself only sufficient to establish the unsolvability of Hilbert's Tenth Problem. Even if the problem truly had no algorithmic solution, the J. R. hypothesis need not follow. After years without progress, perhaps it really was false.

&emsp;&emsp;More importantly, proving the J. R. hypothesis was never the only possible route. In 1965, without reading any of the work by Davis, Putnam, or Robinson, Matiyasevich followed Maslov's advice and began with the decision problem for word equations over free semigroups. Readers who have studied abstract algebra may recognize the question; if not, the details are unimportant here.

&emsp;&emsp;This was a problem with a clear algebraic setting and linguistic significance. Related questions had already been studied by many prominent mathematicians, including Post, Tarski, and Markov, so its research community was much larger than the one surrounding Hilbert's Tenth Problem. More importantly, its undecidability would directly imply the undecidability of Hilbert's Tenth Problem. It was one possible route independent of the J. R. hypothesis.

&emsp;&emsp;Without hindsight, we would probably agree that this route looked more promising and that Davis and his colleagues seemed to be fighting their way down a narrow, rocky path. In retrospect, however, the word-equation route was the dead end: that decision problem is actually decidable, a fact proved only after Hilbert's Tenth Problem had been settled.

&emsp;&emsp;Three years passed. Matiyasevich tried many ideas along this route and considered extended versions of the word-equation decision problem, but obtained no useful result. At last he abandoned it and looked at what those “Americans” had done. The notation for exponentially growing Diophantine sets initially struck him as “unnatural,” but he quickly grasped its importance to Hilbert's Tenth Problem.

&emsp;&emsp;Matiyasevich then devoted himself almost completely to the Davis–Putnam–Robinson route. He organized seminars with five logicians and five number theorists to discuss the existing results. Before long, however, everyone stopped attending, leaving him to work alone.

&emsp;&emsp;He faced much the same predicament as Davis: he knew the problem was terribly hard but could not let it go. Davis had been luckier—he had started more than a decade earlier and retained another line of research likely to yield results. Matiyasevich was in a tighter spot. He recalled that professors even laughed at him: “Have you solved Hilbert's Tenth Problem yet? No? Then you will never graduate!”

&emsp;&emsp;Matiyasevich did not solve the problem before graduation, but the work he had completed by his second year was enough for him to graduate. He then entered a research institute for doctoral study in a field unrelated to Hilbert's Tenth Problem. Accepting reality, he set it aside completely.

&emsp;&emsp;In a novel or film, this would be a tense low point: the protagonist defeated and frustrated, the audience moved to sympathy or recognition. History feels different because we already know that Matiyasevich will succeed. Yet thousands of other “Matiyaseviches” failed, while popular accounts tell only the story of the one who prevailed. That is not necessarily unfair; perhaps it is the poetry of heroic narrative. People want, and need, to pass down such epics.

&emsp;&emsp;Back to the story: Matiyasevich was not destined to leave Hilbert's Tenth Problem behind. In 1969, soon after he abandoned it, Robinson published a new paper. He knew of the paper but had no intention of reading it. Fate intervened. Soviet journals selected some foreign research for translation, and Matiyasevich, as an expert in the area, was asked to referee Robinson's paper. Now he had to read it.

&emsp;&emsp;Some habits are hard to break and need only one opportunity to return; mathematics is one of them. Robinson's new ideas immediately caught Matiyasevich's attention. She considered a special class of Pell equations, reminiscent of his earlier work with the exponentially growing Fibonacci sequence. Once again he fell into the feverish state of thinking about Hilbert's Tenth Problem all day. He followed Robinson's method, revisited his own past work, and kept going even through New Year's Eve. On January 3, 1970, he truly solved the problem.

&emsp;&emsp;But false proofs are more common than correct ones. Matiyasevich had once already believed he had solved Hilbert's Tenth Problem when he had not, an embarrassment he would never forget. However excited he must have been, he forced himself to remain calm, checked the entire proof with exceptional care, and asked those around him to examine it. No one found an error.

&emsp;&emsp;At last, on January 29, he presented the result publicly. Some of Robinson's colleagues attended, and news quickly reached her, Davis, and the wider mathematical world. We can finally say: seventy years after it was posed, Hilbert's Tenth Problem had been proved unsolvable.

# Epilogue

&emsp;&emsp;Slaying the demon king does not end the battle, and solving Hilbert's Tenth Problem did not end the subject. As the familiar metaphor puts it: a mathematical problem is a goose that lays golden eggs. Its value lies not simply in its answer, but in the methods used to solve it and the many further problems and results it generates.

&emsp;&emsp;Matiyasevich ultimately used a Diophantine equation to express, or encode, every recursively enumerable set. This immediately raises new questions: what is the smallest number of variables such an equation requires? Matiyasevich's initial upper bound was 200; Robinson and others later reduced it to 14 and then 9. This was more than tidying up after the proof—it was a new problem born from Hilbert's Tenth. The tools developed for the solution have also been applied to decision problems in number theory, analysis—including certain differential-equation and integration problems—and game theory, as described in Matiyasevich's book Hilbert's Tenth Problem.

&emsp;&emsp;Hilbert's Tenth Problem itself admits many extensions. Under what restrictions do Diophantine equations remain undecidable, and under what restrictions do they become decidable? If integer solutions are no longer required and the domain is extended to <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-023-34d4b75346.png" alt="" /> or another larger field, does the problem become decidable? Many of these questions remain open. They are tasks for other “heroes.” Our story of Matiyasevich, Robinson, Davis, and Putnam ends here, with their achievement compressed into one sentence:

> MRDP theorem (Matiyasevich–Robinson–Davis–Putnam): the recursively enumerable sets are exactly the Diophantine sets.

&emsp;&emsp;Matiyasevich is the only one of the four still alive. He later studied questions related to the four-color theorem and the Riemann <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8B%EF%BC%89/fig-024-831bd22ee6.png" alt="" /> function. Although he produced no result on the same scale, he never left mathematics and, at the age of seventy-six, was still submitting papers as a sole author last year.

&emsp;&emsp;Putnam may seem the least prominent figure in this story because he was, in a sense, making a guest appearance from another stage. He was primarily a philosopher, and his collaboration with Davis was one of his relatively few mathematical contributions. His work in philosophy, however, was highly influential.

&emsp;&emsp;During the 1970s, Robinson and Matiyasevich carried out extensive follow-up work on Hilbert's Tenth Problem. She is regarded as the first American-born woman to make major contributions to number theory and was elected to the National Academy of Sciences in 1975.

&emsp;&emsp;In 1982 she was nominated for president of the American Mathematical Society, serving from 1983 to 1984. She understood perfectly that the choice reflected not only her mathematics but also her identity as a woman—just as she had not forgotten the disadvantages that identity had imposed on her education and career decades earlier, though she rarely complained. As she put it, she had “no choice” but to accept the position, assume its responsibilities, and help create a better environment for future women mathematicians.

&emsp;&emsp;During her presidential term in 1984, Robinson was diagnosed with leukemia. After a temporary remission, her sister wrote Robinson's autobiography in Robinson's voice. Robinson died in 1985. Its final paragraph reads:

> “All this attention leaves me grateful but embarrassed. My true identity is that of a mathematician. Rather than being remembered as the ‘first woman to do this or that,’ I would rather be remembered as a mathematician should be—only for the theorems I proved and the problems I solved.”

&emsp;&emsp;Davis lived a long life. He died on January 1, 2023, at the age of ninety-four; his wife died only hours later.

# Selected References

&emsp;&emsp;https://en.wikipedia.org/wiki/Emil_Leon_Post

&emsp;&emsp;Hilbert's Tenth Problem, Matiyasevich

&emsp;&emsp;My Collaboration with Julia Robinson, Matiyasevich

&emsp;&emsp;The Autobiography of Julia Robinson, Constance Reid
