---
layout: post
title: 'A Rigorous Introduction to Hilbert''s Tenth Problem (I): Introduction'
date: '2025-02-22 17:45:12'
lang: en
translation_key: 'Hilbert第十问题的硬科普（一）引论'
translation_source_sha256: "9118c51645479e648d3aaf6d16a1d4d319e38fde4f6fc24e3268cb46cd1c7655"
permalink: en/2025/02/22/hilberts-tenth-problem-part-1-introduction/
aside: true
comments: false
tags: []
categories: []
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-001-d4db078819.png'
copyright_author: 'silverxz'
---

> Author: silverxz

&emsp;&emsp;People have a peculiar fascination with mathematical conjectures and the stories of how they were solved. Goldbach's conjecture and Chen Jingrun, Fermat's Last Theorem and Wiles, solutions by radicals and Abel and Galois: such examples have found their way into elementary education. Children may not even understand the statements of these problems, yet they enjoy stories in which a legendary figure resolves a long-standing conjecture, much as they enjoy tales of heroes and dragons. This is probably how Hilbert's name first reached the wider public:

&emsp;&emsp;**David Hilbert** (1862-1943) was the most celebrated mathematician of his era. In 1900, Hilbert assembled **23** mathematical problems that were then unresolved. Some were sharply defined (Problem 8, for example, is the *Riemann hypothesis*), while others were not individual questions at all, but research programs or even small fields containing many questions. They later acquired a standard collective name: **Hilbert's 23 problems**.

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-002-a679ded94f.jpg" alt="" />

<center><font size=2px color=grey>David Hilbert</font></center>

&emsp;&emsp;This much is a familiar topic in popular mathematics, but many accounts stop here. These problems stood at the frontier in 1900, and several remain unsolved today. Most people's mathematical education, meanwhile, focuses on work from the nineteenth century or earlier, developed by giants such as Newton, Euler, Gauss, Cauchy, and Riemann. For most readers, simply understanding what Hilbert's 23 problems ask is difficult, let alone understanding their solutions.

&emsp;&emsp;Fortunately, a few of them are within reach. **Hilbert's Tenth Problem** is just barely one of those. Let us first see what it asks. Hilbert's original statement can be rendered roughly as follows:

# Hilbert's Tenth Problem

> Given a **Diophantine equation** in any number of unknowns: devise a procedure that determines, in finitely many operations, whether the equation has an integer solution.

&emsp;&emsp;What is a Diophantine equation? Simply put, it is an **equation formed from a multivariable polynomial with integer coefficients**. For example, <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-003-9dd80faa88.jpg" alt="" />, or, for something more complicated, <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-004-0f6c866057.jpg" alt="" />. Any polynomial equation with integer coefficients qualifies. Diophantine equations encompass many familiar problems. For example, <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-005-ce35ad0aa6.jpg" alt="" /> is the Diophantine equation for Pythagorean triples, while <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%B8%80%EF%BC%89%E5%BC%95%E8%AE%BA/fig-006-8b784ffcf4.jpg" alt="" /> is the equation associated with Fermat's Last Theorem. The scope is enormous: the statement is simple, but the problem is intricate and important.

&emsp;&emsp;The crucial point lies in the second half: devise a **procedure** (process) that, in a **finite number of operations**, **determines**...

&emsp;&emsp;Some readers may wonder why Hilbert did not simply ask for an "**algorithm**." In 1900, Hilbert did not yet have a formal notion of an algorithm. He already had some of the idea in mind: the "procedure" should stop after finitely many operations, and those operations should be mechanical. But he did not yet know how to characterize computation and algorithms mathematically. That work belonged to Turing and others, and Turing would not be born for another 12 years.

&emsp;&emsp;Hilbert was inclined to assume that such a procedure existed: he did not ask whether one existed, but asked us to devise it. Only in Turing's era did we learn that not every problem admits an algorithm. Hilbert's Tenth Problem turned out to be one of them: **the algorithm Hilbert requested does not exist**.

&emsp;&emsp;This is why I call the problem only "just barely" within reach. If you have used a computer, written programs, and have a rough idea of how a Turing machine works, then you already stand on the shoulders of giants and can understand ideas Hilbert never had. You are not impossibly far from understanding the solution, though not especially close either, hence "just barely." Once you have solved many problems with programs, you may naturally wonder what a problem that no program can solve looks like. Hilbert's Tenth Problem is one such example.

&emsp;&emsp;That also describes the intended readership: computer-science undergraduates, or anyone with a basic intuitive grasp of algorithms and computation. The first draft was my final project for an undergraduate Theory of Computation course. I have expanded it and tried to lower the barrier to entry. I will avoid skipping crucial steps and go into real depth, while keeping this a popular account rather than a set of lecture notes.

&emsp;&emsp;If you lack some of the prerequisites, you can still read the next installment on the history of Hilbert's Tenth Problem as a story; it is the less technical part of the series. The proof sections that follow assume that you know what a Turing machine is, and preferably what recursive and recursively enumerable sets are. If not, a brief detour through another explainer or textbook should be enough; none of this is difficult with a computing background. If necessary, I may also add an appendix reviewing the essentials for readers whose foundations are less secure, though I suspect few people would read it, so I will probably keep putting it off.

&emsp;&emsp;Before this series, the Chinese-language web had little beyond an article by Lu Changhai that covered the history of Hilbert's Tenth Problem in some detail, without attempting the proof. I am writing partly to organize and record what I have learned, and partly, rather boldly, to fill that gap by telling the history from my perspective and presenting the proof. While writing, I deliberately relied on primary sources rather than repeatedly consulting Lu's article, so as not to become trapped in a single framing. I nevertheless owe that article a debt and include its link below for reference.

# References

&emsp;&emsp;Lu Changhai. "A Survey of Hilbert's Tenth Problem (Part I)."

&emsp;&emsp;https://www.changhai.org/articles/science/mathematics/hilbert10/1.php

