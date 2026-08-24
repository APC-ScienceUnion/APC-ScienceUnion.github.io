---
layout: post
title: "A Rigorous Introduction to Hilbert's Tenth Problem (IV): Basic Concepts and Proof Framework"
date: '2025-09-02 12:23:00'
lang: en
translation_key: "Hilbert第十问题的硬科普（四）：基本概念、证明框架"
translation_source_sha256: "0f847d13acf7ce09f0fe27fccdc2f10881c1fb45fdaf37504f78d8a0077c926d"
permalink: en/2025/09/02/hilberts-tenth-problem-part-4/
aside: true
comments: false
tags: []
categories: []
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-001-d4db078819.png'
copyright_author: 'silverxz'
---

> Author: silverxz
Proofreader: Shiguang

&emsp;&emsp;We now turn to the proof itself. This is not the original proof, but Matiyasevich's greatly simplified version from his book *Hilbert's Tenth Problem*, so its route differs somewhat from the history described earlier. We will simplify parts of the argument further and skip details that are laborious without adding new ideas. The exposition often works backward: it starts from a result, asks what tools are needed to prove it, and then supplies those tools one by one. I will also use ordinary language to give an intuitive account of the proof and explain its motivation. That approach is better suited to a popular introduction.

# What is Hilbert's Tenth Problem?

&emsp;&emsp;Let us first restate the problem we want to solve.

&emsp;&emsp;A Diophantine equation is a multivariable polynomial equation with integer coefficients, written as <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" />. When its variables are known or irrelevant to the discussion, we abbreviate it as D.

&emsp;&emsp;We want to know whether this equation has an integer solution. For a given D, the yes-or-no question is an individual instance, whose information is completely determined by the polynomial D itself.

&emsp;&emsp;Every Diophantine equation determines one such instance. Taken together, these instances form a decision problem: does an algorithm—a Turing machine M—exist such that, for every Diophantine equation D, M gives the correct answer to the corresponding instance, namely whether D has an integer solution?

&emsp;&emsp;This is Hilbert's Tenth Problem. Our goal is to prove that no such algorithm exists.

&emsp;&emsp;In fact, we will not analyze algorithms directly. Instead, we prove another statement:

> MRDP theorem: the Diophantine sets are exactly the recursively enumerable sets.

&emsp;&emsp;As is well known—if it is not, there is a short discussion of recursive sets below that you can try to follow—some recursively enumerable sets are undecidable. The MRDP theorem then gives undecidable Diophantine sets, hence families of Diophantine equations for which the existence of integer solutions is undecidable. If solvability cannot be decided even for one such family, it certainly cannot be decided for all Diophantine equations. Hilbert's Tenth Problem is therefore unsolvable.

&emsp;&emsp;This article first presents some elementary properties of Diophantine equations and explains the relevant concepts in more detail. The next article will prove the MRDP theorem by using Diophantine relations to simulate the operation of a Turing machine. To keep that article to a reasonable length, however, we will have to assume that “exponentiation is Diophantine.” A proof may appear in the article after that—or it may never materialize. The plan, then, is to finish the proof of Hilbert's Tenth Problem over the next two or three articles. Let us begin.

# Two important observations: systems of equations and natural-number solutions

&emsp;&emsp;The first important observation is that solvability of a system of Diophantine equations is equivalent to solvability of a single Diophantine equation.

&emsp;&emsp;This is because the system <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-003-85abbbe16f.png" alt="" /> is equivalent to:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-004-fdfbc2441b.png" alt="" />

&emsp;&emsp;Expanding the left-hand side above plainly produces another multivariable polynomial with integer coefficients, so the result is still a Diophantine equation. This observation lets us safely “stack” Diophantine equations into systems: in the end, they can always be combined into one.

&emsp;&emsp;The second important observation is that **deciding whether an integer solution exists is equivalent to deciding whether a natural-number solution exists**. (Here, natural numbers include 0.)

&emsp;&emsp;More precisely, a Diophantine equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-005-9d338bd22e.png" alt="" /> = 0 has an integer solution if and only if another Diophantine equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-006-ea95bde82d.png" alt="" /> = 0 has a natural-number solution. We can compute <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-006-ea95bde82d.png" alt="" /> from <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-005-9d338bd22e.png" alt="" />, and conversely. Thus, a Turing machine M that decides the existence of integer solutions can easily be turned into a Turing machine M′ that decides the existence of natural-number solutions, and vice versa. In this sense, the two decision problems have the same difficulty. Natural-number solutions are simply easier for us to handle.

&emsp;&emsp;Here is the proof. Deciding whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" /> has an integer solution is equivalent to deciding whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-007-5153ea665e.png" alt="" /> has a natural-number solution, which immediately establishes one direction. Conversely, suppose we want to decide whether <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-002-09633b24f4.png" alt="" /> has a natural-number solution. By **Lagrange's four-square theorem**—every natural number is a sum of four squares of natural numbers—this is equivalent to deciding whether:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-008-8e20706703.png" alt="" />

&emsp;&emsp;has an integer solution. A Turing machine can clearly carry out both constructions. This proves the second observation.

&emsp;&emsp;Natural-number solutions will be more convenient, so from this point on we study only the decision problem for their existence.

# Diophantine sets

&emsp;&emsp;A **Diophantine set** is a set <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-009-5e8820990e.png" alt="" /> of ordered n-tuples of natural numbers for which there exists a Diophantine equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-010-8682e650ed.png" alt="" /> such that:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-011-227371264f.png" alt="" />

&emsp;&emsp;has a (natural-number) solution.

&emsp;&emsp;We call <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-012-d60ebac3c8.png" alt="" /> the Diophantine equation corresponding to S. Here D is treated like a parametric equation, or a **family of Diophantine equations**: substituting each <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-013-9812c8c6a3.png" alt="" /> into D determines a new Diophantine equation. We call <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-014-cf9dd98f0e.png" alt="" /> the parameters of D and <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-015-3ed4bff427.png" alt="" /> its unknowns. The parameters determine the arity of the elements in the corresponding Diophantine set, so that arity is essential information about the set. For convenience, however, we usually **distinguish parameters from unknowns by using different letters** rather than stating the distinction explicitly.

&emsp;&emsp;The reader should know some basic set-theoretic terminology. A relation is a subset of a Cartesian product. Thus, if an n-ary relation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-016-33cef19d4e.png" alt="" /> on the natural numbers is a Diophantine set, we call it a **Diophantine relation**.

&emsp;&emsp;Likewise, a multivariable function <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-017-7db73d85c9.png" alt="" /> on the natural numbers is itself represented by a subset <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-018-3af8e472c8.png" alt="" /> of the relevant Cartesian product. Consider the exponential function:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-019-bff0d458a5.png" alt="" />

&emsp;&emsp;It is represented by the following set:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-020-27fb724329.png" alt="" />

&emsp;&emsp;If the set representing a function is Diophantine, we call the function a **Diophantine function**. To ask whether a function can be expressed by a Diophantine equation is precisely to ask whether it is a Diophantine function.

# Elementary properties of Diophantine sets

&emsp;&emsp;We first verify an elementary property of Diophantine sets: they are **closed under intersection and union**.

&emsp;&emsp;Let <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-021-190b7820ac.png" alt="" /> be Diophantine sets corresponding to the Diophantine equations <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-022-e43492c44c.png" alt="" /> and <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-023-13dbbee516.png" alt="" />.

&emsp;&emsp;Consider <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-024-428a02a3e3.png" alt="" />. If <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-025-60546af466.png" alt="" />, then after substituting <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-026-4099e3765e.png" alt="" />, at least one of the two equations has a solution. This is equivalent to:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-027-435992b46c.png" alt="" />

&emsp;&emsp;having a solution. Hence S is a Diophantine set, with corresponding Diophantine equation:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-028-9e5f388ab9.png" alt="" />

&emsp;&emsp;Therefore, Diophantine sets are closed under union.

&emsp;&emsp;Now consider <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-029-b0575bd606.png" alt="" />. If <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-030-d12d04248c.png" alt="" />, an analogous construction makes this equivalent to:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-031-8054e48bd6.png" alt="" />

&emsp;&emsp;having a solution. Hence S′ is also a Diophantine set, with corresponding Diophantine equation:

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-032-c5b9e3afce.png" alt="" />

&emsp;&emsp;Thus, Diophantine sets are also closed under intersection.

# Recursive sets and recursively enumerable sets

&emsp;&emsp;I do not know whether any reader understands Turing machines but has never encountered recursive or recursively enumerable sets, but I will briefly explain them. A Turing machine's input can be regarded as a string over a finite alphabet Σ, containing 0, 1, spaces, or any other symbols we choose. Such a string can always be encoded as a natural number by treating it as a base-|Σ| numeral. We may therefore regard a Turing machine as a function on <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" />. Given a natural number a, it has three possible behaviors: **halt after finite time and output True**, **halt after finite time and output False**, or **never halt**.

&emsp;&emsp;For a set <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-034-c228f47fe5.png" alt="" />, suppose there is a Turing machine M such that M outputs True when a ∈ S and False when a ∉ S. Then S is a **recursive set**, also called **decidable**. If there is a Turing machine M that outputs True when a ∈ S but never halts when a ∉ S, then S is a **recursively enumerable set**. A decision problem is decidable when, after encoding each of its instances as a natural number, the set S of codes for instances whose answer is True is recursive.

&emsp;&emsp;The same definitions extend to subsets of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-035-cf29b6804d.png" alt="" />, because tuples can also be encoded as integers and thereby treated as a subset of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" />. There is nothing artificial about this encoding: the preceding paragraph already encoded strings as integers. We will later see that the particular encoding does not matter; any computable one will do.

&emsp;&emsp;Every recursive set is recursively enumerable: simply make M enter an infinite loop whenever it would otherwise output False. The converse does not hold. Readers may accept that some recursively enumerable sets are not recursive, or study a little elementary computability theory.

&emsp;&emsp;Returning to our problem, Hilbert's Tenth Problem asks: “**Is the set of all solvable Diophantine equations recursive?**” This immediately raises another issue: **encoding**. We must encode Diophantine equations as natural numbers before we can ask whether a set of such equations is recursive or recursively enumerable. Encoding has appeared repeatedly in the last few paragraphs, so we now discuss it directly.

# Encoding

&emsp;&emsp;We will use two kinds of encoding: encoding in a general, unspecified sense, and particular encoding schemes.

&emsp;&emsp;When stating Hilbert's Tenth Problem, for example, we take a Diophantine equation D as input to a Turing machine. D must therefore be encoded in a form that the machine can receive. Asking whether the set of all solvable Diophantine equations is recursive likewise requires encoding each equation as a natural number. This is encoding in the general sense: we have not specified how it works. Perhaps the coefficient and degree of every term are entered in some format; perhaps something else is done. Nothing has been fixed.

&emsp;&emsp;Why leave this unspecified? Could Hilbert's Tenth Problem be solvable under one encoding of Diophantine equations but unsolvable under another?

&emsp;&emsp;This issue is not peculiar to Hilbert's Tenth Problem. It is a basic question in computability theory. The same concern arises when Turing machines themselves are encoded in order to discuss the undecidability of the halting problem: can the encoding affect whether the problem is solvable?

&emsp;&emsp;Computability textbooks usually answer this question. For readers without that background, the conclusion is simple: **the choice of encoding does not change the result**.

&emsp;&emsp;If two encodings can be converted into one another computably, a Turing machine can perform that conversion as an intermediate step, and solvability under the two encodings is equivalent. By the Church–Turing thesis, we accept that any encoding of Diophantine equations that can actually be computed is obtainable by a Turing-computable procedure. In that sense, all reasonable encodings can be converted into one another, so the answer to Hilbert's Tenth Problem is independent of the encoding. This is why its statement uses only an unspecified encoding. When solving a concrete problem, we need only **choose a particular Turing-computable encoding that is convenient to use**.

&emsp;&emsp;Here “reasonable” means, in effect, obtainable. One proposed encoding could simply include the answer, encoding D as (..., True/False). Hilbert's Tenth Problem would then be trivially solvable. But how did we obtain that answer? The unsolvability of Hilbert's Tenth Problem, together with the Church–Turing thesis, tells us in return that such an encoding is unreasonable: it cannot be obtained by computation.

&emsp;&emsp;By the same reasoning, we can discuss recursive and recursively enumerable subsets of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-036-6d7e584eef.png" alt="" />. How they are encoded as subsets of <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E3%80%81%E8%AF%81%E6%98%8E%E6%A1%86%E6%9E%B6/fig-033-713e769dc6.png" alt="" /> is immaterial, provided the encoding is computable. We will give one concrete encoding later.

&emsp;&emsp;This completes the necessary preliminaries. In the next article, we prove the MRDP theorem.



