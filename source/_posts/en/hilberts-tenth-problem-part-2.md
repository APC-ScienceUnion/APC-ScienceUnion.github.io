---
layout: post
title: "A Rigorous Introduction to Hilbert's Tenth Problem (II): A History, Part I"
date: '2025-03-04 18:19:20'
lang: en
translation_key: "Hilbert第十问题的硬科普（二）：一段历史（上）"
translation_source_sha256: "cf81320872337ec9f9090483eb0e5cf07f10863c806916e75d50b58dd1e76294"
permalink: en/2025/03/04/hilberts-tenth-problem-part-2/
aside: true
comments: false
tags: []
categories: []
cover: '/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-001-d4db078819.png'
copyright_author: 'silverxz'
---

> Author: silverxz
Proofreader: Shiguang

&emsp;&emsp;The previous article introduced Hilbert and his 23 problems. The next two articles review the history behind them. This one covers the background needed for the tenth problem: the history of Diophantine equations, algorithms, and computability. The next article turns to the history of the solution to Hilbert's Tenth Problem. Readers already familiar with this material may go directly to that installment.

# Diophantine equations: from Diophantus to Hilbert

&emsp;&emsp;The story has a classic opening:

&emsp;&emsp;Once upon a time—or, more precisely, 1,800 years ago—the ancient Greek mathematician **Diophantus** studied a great many algebraic equations. At the time, these were equations formed from polynomials with rational coefficients. His work covered many subjects, with one recurring question: *Does an equation have an integer solution?*

&emsp;&emsp;For an equation with rational coefficients, we can put the coefficients over a common denominator, multiply both sides, and clear the denominator to obtain an equation with integer coefficients, such as <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-002-99674c89d6.png" alt="" />. This operation does not change the solutions. The problem therefore becomes **the existence of integer solutions to polynomial equations with integer coefficients**. Diophantus was the first to make this a major object of study, so such equations are called **Diophantine equations**.

&emsp;&emsp;A note on terminology: the Chinese original consistently uses the standard Chinese name for “Diophantine equation” rather than mixing English and Chinese. The author also admits to continually mistyping *Diophantine*; a hybrid expression would look as odd as writing “Turing machine” half in each language.

&emsp;&emsp;The author has not investigated why Diophantus studied integer solutions. Perhaps Pythagorean triples inspired him; perhaps he simply found them interesting. He was an early algebraist whom some call the “father of algebra,” and even the plain title of his work, *Arithmetica*, suggests a foundational figure. It brings to mind Euclid's *Elements* and Newton's *Mathematical Principles of Natural Philosophy*, among other straightforward titles. Diophantus may not have needed a special reason to ask whether integer solutions exist; he studied many other subjects as well. Mathematics itself is an art pursued out of interest.

&emsp;&emsp;As mathematics developed, the study of Diophantine equations acquired more varied motivations. Most work, however, concerns a **particular Diophantine equation** or a particular class rather than all such equations. Specific equations usually carry a clearer meaning or greater mathematical beauty.

&emsp;&emsp;Fermat, for example, studied solutions to Diophantine equations of the form <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-003-3073f1e90c.png" alt="" /> and left the famous remark, *“I have discovered a truly marvelous proof, which this margin is too narrow to contain.”* He was unlikely to single out a “strangely shaped” equation such as <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-004-d9cdbb92ef.png" alt="" />. Likewise, the linear Diophantine equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-005-ae5f051956.png" alt="" /> corresponds to greatest common divisors and Bézout's identity in elementary number theory; <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-006-0ad4549e44.png" alt="" /> describes Pythagorean triples; the Pell equation <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-007-081fd70b09.png" alt="" /> corresponds to a hyperbola; and <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-008-f952893b96.png" alt="" /> appears in the classic Ramanujan anecdote about the *taxicab number*... There are far more Diophantine equations than one might imagine, but most mathematicians focus on selected special cases.

&emsp;&emsp;The important word is “**most**.” There are also mathematicians like Hilbert, whose ambitions extended to every Diophantine equation. This brings us to **Hilbert's Tenth Problem**.

&emsp;&emsp;Popular science often favors individual heroism and highlights a striking trait. At this point, many accounts would say: “Hilbert was more ambitious, courageous, and daring than others, and he alone confronted a problem of such scale.” Readers might enjoy that story and feel all the more regret when his hopes later failed.

&emsp;&emsp;The facts are more complicated. Hilbert could formulate his 23 problems, including the tenth, because he was a first-rate mathematician with broad vision and considerable ambition. Historical circumstances mattered too. The axiomatization of mathematics and debate over metamathematics and the philosophy of mathematics were about to reach an unprecedented intensity. If readers are interested in this history, I may write a separate appendix someday. (Another hole dug.jpg.)

# Algorithms: from Euclid to Hilbert

&emsp;&emsp;We have already quoted Hilbert's formulation of his tenth problem:

> Given a Diophantine equation with any number of unknowns, devise a procedure that determines in finitely many operations whether the equation has an integer solution.

&emsp;&emsp;Today, we can state it more concisely:

> Design an algorithm that determines whether any given Diophantine equation has an integer solution.

&emsp;&emsp;After our brief history of Diophantine equations, the key question is now: what is an <strong>“algorithm”</strong>? Hilbert described it roughly as a “procedure” that terminates after finitely many “operations.”

&emsp;&emsp;This intuitive idea is ancient. In mathematics, we often find that a class of problems has a fixed method of solution. By following that method “mechanically,” we can solve every problem in the class. A familiar example is the quadratic formula: to solve a quadratic equation, one need only calculate

<img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-009-dea34e8232.png" alt="" />

&emsp;&emsp;This is a thoroughly mechanical method. In more detail, one might say: first, **move terms from one side to the other**; second, **combine like terms** and identify **a, b, and c**; third, calculate **2a**; fourth, calculate... By following these steps mechanically, one can solve every quadratic equation in the world.

&emsp;&emsp;Another ancient example dates to Euclid: the method for calculating the greatest common divisor of two numbers. This useful algorithm remains in use today and is generally called the Euclidean algorithm. It appears in Euclid's *Elements* and in *The Nine Chapters on the Mathematical Art*. The method mechanically calculates a greatest common divisor by repeatedly applying arithmetic operations according to fixed rules and stopping when specified conditions are met.

&emsp;&emsp;Our word *algorithm* comes from the name of the ninth-century mathematician al-Khwarizmi, who produced a series of results on solving systems of algebraic equations. His methods clearly embody a “mechanical”—or procedural and systematic, if you prefer—approach by setting out rules one step at a time. This is roughly the most elementary conception of an algorithm.

&emsp;&emsp;At the time, however, there were no actual “machines” capable of executing algorithms. People had little reason to formulate the concept explicitly, much less study it. The physical world imposed its limits.

&emsp;&emsp;That began to change in the seventeenth century, when Leibniz and Pascal each invented a mechanical calculator. Leibniz was also the first to study binary numbers in depth, and the *I Ching* influenced him. (I used to think that claim was tabloid nonsense, but apparently it is true.) Mechanical computation seemed close to reality. Leibniz then had a bold idea: **Could we build a machine, give it a mathematical proposition, and have it tell us whether the proposition is true or false?**

&emsp;&emsp;This was a leap too far: Leibniz wanted an algorithm that could solve every mathematical problem. Besides “what is an algorithm?”, there was a more immediate question: how could a mathematical proposition be expressed in a form a machine could understand? The technology of the time again set a limit. A machine that adds and subtracts was far removed from one that processes propositions. More importantly, formal logic and formal deduction did not yet exist. Leibniz knew that ordinary-language mathematical propositions had to be converted into a more precise, formal form, but he could not do it.

&emsp;&emsp;At the end of the nineteenth century, Frege and Russell developed mathematical logic and supplied the tools Leibniz had lacked. Those tools were created to state the logicism of Frege, Russell, and others, but mathematics itself absorbed them, and they also prepared the ground for Hilbert's formalism.

&emsp;&emsp;We will skip most of the philosophy of mathematics. Interested readers may consult the appendix, if I ever write it. Hilbert's formalism led him to consider much larger questions. Between 1920 and 1930, his aims were no longer confined to “small” matters such as Diophantine equations; they grew into the **Hilbert program**, summarized in the following four points. (We omit one point concerning finitism.)

1. <strong>Formalization:</strong> every mathematical proposition should be expressible in a precise formal language.

2. <strong>Completeness:</strong> prove that “every true proposition has a formal proof.”

3. <strong>Consistency:</strong> prove that “formalized mathematics contains no contradictions.”

4. <strong>Decidability:</strong> find an algorithm that determines the truth or falsity of any mathematical proposition.

&emsp;&emsp;The aims of the Hilbert program form a coherent whole. Its demand for decidability revives Leibniz's old vision and is now called the **Entscheidungsproblem**. That long German word means the **decision problem**.

&emsp;&emsp;If all four aims could be achieved, we could build a machine, formalize any mathematical proposition, and feed it in. Every mathematician could change careers and work on mass-producing the machine. But no such machine exists. Apart from formalization, the Hilbert program failed across the board.

&emsp;&emsp;Gödel dealt with completeness and consistency; we will leave them aside and focus on decidability. Few people may have cared when Leibniz first proposed the idea. By the time Hilbert revived it, the field was nearly ready. Mathematicians could finally begin to answer two questions: what is an <strong>“algorithm”</strong>, and what is <strong>“computation”</strong>?

# Computability: Gödel, Church, and Turing

&emsp;&emsp;An algorithm starts with given quantities, performs operations step by step, and eventually produces a result. Those operations must be executable by a human or a machine. We can abstract such a process as a function of the form <img src="/images/Hilbert%E7%AC%AC%E5%8D%81%E9%97%AE%E9%A2%98%E7%9A%84%E7%A1%AC%E7%A7%91%E6%99%AE%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E4%B8%80%E6%AE%B5%E5%8E%86%E5%8F%B2%EF%BC%88%E4%B8%8A%EF%BC%89/fig-010-50eff20f85.png" alt="" />. Which functions f are “computable,” in the sense that a given input can actually be used to calculate an output?

&emsp;&emsp;Gödel was again the first to make progress. Two years after “killing” completeness and consistency, he published a paper introducing the notion of **general recursive functions**. This is a difficult, abstract concept, quite different from the recursive functions used in programming. Gödel conjectured that “finite computational procedures” were equivalent to “recursive procedures,” but he did not fully trust that his general recursive functions encompassed every possible recursion. In other words, he doubted that they completely characterized the concept of a computable function.

&emsp;&emsp;Church followed with the <strong>lambda calculus</strong> and proved two things. First, the lambda calculus and Gödel's general recursive functions were essentially equivalent. Second, if those two formalisms really did characterize computability, then Hilbert's demand for decidability could not be met.

&emsp;&emsp;The question, then, was: **Did these two concepts really capture computability?** This is a philosophical and necessarily subjective issue. We are trying to define computation itself, so whether a proposed definition agrees with our intuitive idea of computation cannot be proved.

&emsp;&emsp;Church answered yes. He held that every computational process a human could perform could be carried out in the lambda calculus. This view is called **Church's thesis**. (In Chinese, *thesis* is conventionally rendered with a word that can also mean “topic”; here it means a claim or hypothesis.) Gödel disagreed and remained skeptical, believing that more evidence was needed.

&emsp;&emsp;Turing settled the matter. At roughly the same time, he published his most important paper, ***On Computable Numbers***, and proposed his own characterization of computation: the **Turing machine**. Crucially, the construction begins entirely from a human point of view. It abstracts a person's scratch paper as a one-dimensional tape and a person's attention and actions as the machine's internal states. The reasoning appears in Section 9 of the paper, which Soare recommends to every student of computability theory.

&emsp;&emsp;The Turing machine immediately convinced Gödel, who regarded it as a fitting characterization of computation. It was subsequently proved equivalent to both general recursive functions and the lambda calculus. A consensus emerged: a function is computable if it can be described by any of these equivalent models—Turing machines, the lambda calculus, general recursive functions, and so on—and this agrees with our intuitive understanding of computation. The position later became known as the **Church–Turing thesis**. Under it, Hilbert's demand for decidability fails completely: no universal machine can tell us whether every proposition is true or false.

&emsp;&emsp;The “weaker” Hilbert's Tenth Problem, however, remained open. We could not solve every mathematical problem at once, but perhaps an algorithm—in this context, a computable function or Turing machine—could still settle every Diophantine equation. All the concepts in the problem were now clear, and work toward a solution could finally begin. The next section will show how that solution emerged step by step.

&emsp;&emsp;Author's note: Kleene and others also contributed to the work described above. Only Gödel, Church, and Turing are named here to keep the narrative manageable.

# References

&emsp;&emsp;https://en.wikipedia.org/wiki/Diophantine_equation

&emsp;&emsp;https://mathoverflow.net/questions/42406/why-certain-diophantine-equations-are-interesting-and-others-are-not

&emsp;&emsp;Why Gödel Didn't Have Church's Thesis, Martin Davis

&emsp;&emsp;On Computable Numbers, With An Application To The Entscheidungsproblem, Alan Turing

&emsp;&emsp;Turing Computability Theory and Applications, Robert I. Soare


