---
layout: post
title: "Ask What It Is First: An Introduction to Mathematics and Formal Mathematics"
date: 2026-04-03 12:00:00
lang: en
translation_key: "先问「是什么」：数学与形式化数学浅讲"
translation_source_sha256: "8ef4b95be4e0b4bbedee611607e44e908c1bc19f3c8ce5cd0c81cb00e1c7782e"
permalink: en/2026/04/03/what-is-mathematics-and-formalization/
aside: true
comments: false
tags: []
categories: []
copyright_author: 'silverxz'
katex: true
cover: /images/%E5%85%88%E9%97%AE%E3%80%8C%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%8D%EF%BC%9A%E6%95%B0%E5%AD%A6%E4%B8%8E%E5%BD%A2%E5%BC%8F%E5%8C%96%E6%95%B0%E5%AD%A6%E6%B5%85%E8%AE%B2/cover-cb6a9b3db6.jpg
---

{% note blue 'fas fa-lightbulb' %}
Mathematics has not always been rigorous from the outset. Throughout its history, both Bertrand’s paradox and disputes over infinitesimals have exposed the uncertainty created by vague definitions. In response, mathematics gradually moved toward formal expression.
{% endnote %}

> Author: silverxz
Reviewer: $\Delta\delta Delta$

# Introduction: Ask “What Is It?” First

&emsp;&emsp;Whether we are learning mathematics or solving a mathematical problem, asking “what is it?” first is a natural instinct.

&emsp;&emsp;A high-school student encountering sets for the first time must begin by knowing what a set is, even if the answer is only the informal statement that “a set is a whole formed by putting some objects together.” Only after knowing what it is can the student answer other questions about sets or move on to concepts such as mappings.

&emsp;&emsp;The same is true when learning complex numbers. We first need to know that “a complex number is something of the form $x+iy$, where $x,y$ are real numbers.” Then we ask: what is $i$? What does the plus sign mean here? We continue in this way until the question “what is a complex number?” has been answered clearly enough to let us study such things as the modulus of a complex number. If “what is it?” is left unanswered, students remain lost in a fog and naturally cannot continue.

&emsp;&emsp;But what exactly counts as **“*answering the question ‘what is it?’ clearly*”**? Ordinarily, this may seem like a question that needs no answer. Human beings can think and understand; once we understand something ourselves, surely the question has been answered. And of course we know whether we truly understand it... or do we?

&emsp;&emsp;Unfortunately, not entirely. Concepts such as natural numbers, real numbers, elementary probability, and “randomness” are closely connected to everyday life and feel like matters of common sense. Many people believe that they understand them perfectly, but that confidence can be an illusion. Consider the classic probability paradox proposed by the French mathematician Joseph Bertrand (1822-1900):


> Given a circle of radius $r$, choose a chord of the circle at random. What is the probability that the chord is longer than a side of the equilateral triangle inscribed in the circle, whose side length is $\sqrt 3 r$?


&emsp;&emsp;Two points on a circumference determine a chord. By rotational symmetry, we may first fix one endpoint at any point on the circle, then choose the other endpoint at random, producing a random chord as in Figure 1a. Using the fixed endpoint as a vertex, draw an inscribed equilateral triangle, shown in gray. If the random chord lies inside the angle at that vertex—the red chords in the figure—it is longer than a side of the inscribed triangle. If it lies outside the angle—the blue chords—it is shorter.

&emsp;&emsp;For the chosen chord to be longer than a side of the inscribed equilateral triangle, then, we must choose one of the red chords inside the angle. If the second endpoint is selected uniformly from the circumference, the geometric probability of obtaining a red chord is the proportion of the entire circumference occupied by the arc subtended by the vertex angle, shown in reddish brown: $1/3$. We have omitted the degenerate boundary case in which the same point is selected twice and the chord collapses to a single point on the circumference; this does not affect the probability.

&emsp;&emsp;But this is not the only way to choose a chord at random. For every given chord other than a diameter, there is exactly one radius perpendicular to it, meeting it at one point. Conversely, given a radius and a point on that radius, we can draw through the point a line perpendicular to the radius; its intersections with the circle determine a chord. By rotational symmetry, we may therefore choose any radius, select a point uniformly along it, and construct the perpendicular chord just described, as in Figure 1b. Again, the red chords are longer than the gray side of the inscribed equilateral triangle, while the blue chords are shorter. If the intersection point is chosen uniformly, it is easy to see that the probability of obtaining a longer red chord is $1/2$. Once more, the diameter is a special boundary case, and it is reasonable to ignore its probability.

&emsp;&emsp;There is also a third method, similar to the preceding one. A chord other than a diameter is uniquely determined by its midpoint, so we need only choose a point uniformly from the interior of the circle and treat it as the midpoint, as in Figure 1c. If the midpoint lies inside the smaller red circle—the incircle of the inscribed equilateral triangle—the resulting chord is longer than a side of the triangle; otherwise, it is shorter. What is the probability that the random point falls inside the smaller red circle? By the familiar geometric model of probability, it is the ratio of the smaller circle’s area to that of the entire circle: $1/4$.

<figure class="bertrand-figure" style="margin:1.25em auto;max-width:100%;box-sizing:border-box;text-align:center;">
<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:14px 2%;width:100%;box-sizing:border-box;" role="group" aria-label="Three methods of choosing a random chord in Bertrand’s paradox">
<div style="flex:1 1 28%;max-width:32%;min-width:min(100%,200px);margin:0;box-sizing:border-box;text-align:center;">
<img src="/images/%E5%85%88%E9%97%AE%E3%80%8C%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%8D%EF%BC%9A%E6%95%B0%E5%AD%A6%E4%B8%8E%E5%BD%A2%E5%BC%8F%E5%8C%96%E6%95%B0%E5%AD%A6%E6%B5%85%E8%AE%B2/fig-001-2c747ef5c0.jpg" alt="(a) Choosing a random endpoint" style="width:100%;max-width:280px;height:auto;display:block;margin:0 auto;vertical-align:top;" loading="lazy" decoding="async" />
<div style="font-size:0.9em;line-height:1.45;margin-top:0.5em;color:var(--font-color,#3c4858);">(a) Choosing a random endpoint [1]</div>
</div>
<div style="flex:1 1 28%;max-width:32%;min-width:min(100%,200px);margin:0;box-sizing:border-box;text-align:center;">
<img src="/images/%E5%85%88%E9%97%AE%E3%80%8C%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%8D%EF%BC%9A%E6%95%B0%E5%AD%A6%E4%B8%8E%E5%BD%A2%E5%BC%8F%E5%8C%96%E6%95%B0%E5%AD%A6%E6%B5%85%E8%AE%B2/fig-002-22009875c2.jpg" alt="(b) Choosing a random intersection of a radius and chord" style="width:100%;max-width:280px;height:auto;display:block;margin:0 auto;vertical-align:top;" loading="lazy" decoding="async" />
<div style="font-size:0.9em;line-height:1.45;margin-top:0.5em;color:var(--font-color,#3c4858);">(b) Choosing a random intersection of a radius and chord [2]</div>
</div>
<div style="flex:1 1 28%;max-width:32%;min-width:min(100%,200px);margin:0;box-sizing:border-box;text-align:center;">
<img src="/images/%E5%85%88%E9%97%AE%E3%80%8C%E6%98%AF%E4%BB%80%E4%B9%88%E3%80%8D%EF%BC%9A%E6%95%B0%E5%AD%A6%E4%B8%8E%E5%BD%A2%E5%BC%8F%E5%8C%96%E6%95%B0%E5%AD%A6%E6%B5%85%E8%AE%B2/fig-003-a9f8c869a4.jpg" alt="(c) Choosing a random midpoint" style="width:100%;max-width:280px;height:auto;display:block;margin:0 auto;vertical-align:top;" loading="lazy" decoding="async" />
<div style="font-size:0.9em;line-height:1.45;margin-top:0.5em;color:var(--font-color,#3c4858);">(c) Choosing a random midpoint [3]</div>
</div>
</div>
<figcaption style="display:block;font-size:0.95em;line-height:1.5;margin-top:1em;color:var(--blockquote-color,#666);">Figure 1: Three different methods of choosing a random chord</figcaption>
</figure>

&emsp;&emsp;A simple problem about choosing a random chord has produced three different probabilities by three different methods. This is Bertrand’s paradox.

&emsp;&emsp;From a modern perspective, our intuitive idea of “uniform randomness” can be summarized roughly as the ***principle of indifference***: cases of equal standing should be treated equally and assigned equal probabilities. The central challenge posed by Bertrand’s paradox is that none of its three methods violates that principle. No method is obviously nonrandom, yet they give entirely different answers. If the calculations are correct, then something must be wrong with our understanding of randomness. Which method is genuinely random—or, more fundamentally, what is randomness?

&emsp;&emsp;We thus discover that even concepts of common sense that we believe we understand can generate paradoxes and force us to ask again what they really mean. The same pattern has recurred throughout the history of mathematics: the answer to “what is it?” is often not final, but part of a repeated process of answering, encountering a problem, and answering again. The most typical example is calculus, especially the attempts to explain what infinitesimals, limits, and continuity are. The next section briefly introduces that history. Some familiarity with calculus will help, but none is essential for following the historical outline.

# A Brief History of the Infinitesimal

&emsp;&emsp;Classical calculus was founded by Isaac Newton (1643-1727) and Gottfried Leibniz (1646-1716). Leibniz held [4, p.187] that an infinitesimal $\mathrm{d}x$ was smaller than any assignable quantity and was itself inassignable. By “assignable,” he meant, roughly, a real number that could be written down, such as $1, 0.3, \sqrt 2$. The concept of the set of positive real numbers did not yet exist in his time, so this was naturally how he expressed the idea.

&emsp;&emsp;Leibniz’s understanding of infinitesimals was, of course, much deeper and clearer than those few sentences suggest. He also called them “incomparable quantities.” Comparability here means the property defined in Book V, Definition 4 of Euclid’s *Elements*, now known as the **Archimedean axiom**. Incomparable quantities are those that violate this property [4, p.201]. Intuitively, no finite number of repeated additions of the same infinitesimal will ever produce a result greater than any positive number. Leibniz also understood orders of infinitesimals clearly and laid down relatively explicit rules for calculating with and comparing them, including the familiar practice of discarding higher-order infinitesimals [5, p.33].

&emsp;&emsp;Leibniz also had a definite view of their status: infinitesimals were **fictional quantities** (fictions), which did not have to correspond to actually existing quantities but could still assist analysis [5, pp.54-55].

&emsp;&emsp;These ideas broadly constituted Leibniz’s answer to the question of what an infinitesimal was. His understanding of the continuum and continuity was rougher and more intuitive (Remark 1), arising from the simple philosophical conviction that “nature makes no leaps” (*natura non facit saltus* [nature does not make jumps]). A fuller discussion would take us too far afield. In short, this conviction led him to believe that the operations of calculus could legitimately extend results from finite to infinite cases.

&emsp;&emsp;Frankly, Leibniz’s account was adequate for his time. He did not encounter, and could not have encountered, anything like Bertrand’s paradox, so he had no reason to give a more rigorous definition. Soon after Newton and Leibniz died, however, George Berkeley (1685-1743) published *The Analyst* in 1734, attacking the infinitesimals of classical calculus. An infinitesimal appeared in a denominator as a nonzero quantity, yet was discarded at the end as though it were $0$; its status was obscure. It is hard to say how much this criticism motivated later work, but in any event, mathematicians began trying to answer more clearly what an infinitesimal was, hoping for something as lucid and rigorous as the model supplied by Euclidean geometry.

&emsp;&emsp;The line of development that most strongly shaped the theoretical foundations of modern calculus (Remark 2) ran through a succession of French mathematicians from the eighteenth to the early nineteenth century: Jean Le Rond d'Alembert (1717-1783), Joseph Lagrange (1736-1813), Sylvestre Lacroix (1765-1843), Augustin Cauchy (1789-1857), and others. In Cauchy’s 1821 textbook *Cours d'analyse*, an infinitesimal was defined as a “**variable quantity**” (*quantité variable*) whose limit is $0$—an approaching process rather than a fixed number. In practice, however, Cauchy did not draw a sharp distinction between an infinitesimal and its limiting value. His actual position on the status of infinitesimals can fairly be called ambiguous (Remark 3).

&emsp;&emsp;Mathematicians in the German-speaking world then took over, from the Bohemian Bernard Bolzano (1781-1848) to the Germans Karl Weierstrass (1815-1897), Richard Dedekind (1831-1916), and Georg Cantor (1845-1918). Weierstrass is now generally credited with laying the foundations of modern standard analysis. He explicitly formulated $\varepsilon-\delta$ definitions of limits and continuity, on which infinitesimals were also based; the resulting account was essentially the one taught today. With Dedekind’s and Cantor’s subsequent development of set theory and the theory of real numbers, the two-hundred-year effort to explain what infinitesimals are finally produced an answer that most people found broadly satisfactory.

# Formal Mathematics

&emsp;&emsp;Mathematicians took two hundred years and many rounds of revision to answer the question “what is an infinitesimal?” clearly. If every concept demanded two centuries of trouble, mathematics would be in a difficult position. Could there be a solution that answered such questions correctly once and for all? Could there be a standard for deciding whether an answer was good enough?

&emsp;&emsp;Mathematicians in the late nineteenth and early twentieth centuries tried to find one. Gottlob Frege (1848-1925), Giuseppe Peano (1858-1932), and others laid the foundations of mathematical logic. Many symbols used today—including membership in a set, $\in$; intersection and union, $\cap$ and $\cup$; and the existential quantifier, $\exists$—come from Peano [6]. Frege devised his own notation too, but it was rather peculiar and did not survive.

&emsp;&emsp;Logical symbols let us express mathematics more concisely and precisely. Compare a Weierstrass-style definition of continuity (Remark 4): a function $f$ is continuous at a point $x$ if and only if the following proposition holds:


> It is possible to determine a $\delta$ different from $0$, arbitrarily small but finite, such that $|f(x+h)-f(x)| < \varepsilon$ holds for every $h$ satisfying $|h| <\delta$, where $\varepsilon$ denotes an arbitrarily small given quantity.


&emsp;&emsp;Today, this proposition has been rewritten as the following expression in logical symbols:


> $$
> \forall \varepsilon > 0\ \exists \delta > 0\ \forall h \in \mathbb{R} \ \big( |h| < \delta \to |f(x+h) - f(x)| < \varepsilon\big).
> $$


&emsp;&emsp;Because some readers may not be entirely familiar with these symbols, let us explain what they mean in this proposition and give a few simple examples.

&emsp;&emsp;$\forall$ means “for every.” Thus $\forall x\ (P(x))$ says that every $x$ has property $P$. A simple example is $\forall n\in \mathbb{N}\ (n^2 \geq n)$: for every natural number $n$, the inequality $n^2 \geq n$ holds. This is plainly a true proposition.

&emsp;&emsp;$\exists$ means “there exists.” Analogously, $\exists x\ (P(x))$ says that there is an $x$ with property $P$. Thus $\exists n\in \mathbb{N}\ (n^2 < n)$ says that there is a natural number $n$ for which $n^2 < n$. This is plainly false, and it is the negation of $\forall n\in \mathbb{N}\ (n^2 \geq n)$.

&emsp;&emsp;$\to$ means “material implication.” More precisely, $P\to Q$ means that if $P$ holds, then $Q$ holds. The statement $\forall x \in \mathbb{R}\ (x^2=1\to x=1)$ is false, because setting $x$ to $-1$ makes it fail. By contrast, $\forall x \in \mathbb{R}\ (x=1 \to x^2=1)$ is clearly true.

&emsp;&emsp;We will not explain the other symbols, such as addition and subtraction, comparisons, and absolute values. We can now return to the string of logical notation that defines continuity and see what it says. In words: for every number $\varepsilon$ greater than $0$, there exists a number $\delta$ greater than $0$ such that, for every real number $h$, whenever $|h| < \delta$, we have $|f(x+h)-f(x)| < \varepsilon$.

&emsp;&emsp;Compare this with the earlier Weierstrass-style definition of continuity. Do they look the same to you?

&emsp;&emsp;They certainly ***intend*** to say the same thing. Yet the Weierstrass-style definition is conspicuously vague and readily creates ambiguity. Is $\delta$ determined first and $\varepsilon$ supplied afterward, or is $\varepsilon$ supplied first and $\delta$ then determined? It ***intends*** the latter, but places $\varepsilon$ last in the sentence, forcing readers to interpret the wording with care. The formulation in logical notation has no such problem. $\exists \delta > 0$ lies within the scope of the preceding $\forall \varepsilon > 0$, so there is only one possible reading: first choose $\varepsilon$, then determine $\delta$.

&emsp;&emsp;This is an important advantage of logical notation. It can avoid the latent vagueness or ambiguity of natural languages—the Chinese, English, and other languages people speak—or, put differently, force us to clarify each ambiguity. Although we do not normally write proofs entirely in logical symbols, understanding those symbols also helps reduce ambiguity in our use of natural language, because we consciously or unconsciously “check” whether a statement could be translated into a purely logical language.

&emsp;&emsp;Consider another classic example of ambiguity in natural language, due to the important logician and mathematician Bertrand Russell (1872-1970). Take the proposition [7], “the present King of France is not bald.” If there were a King of France, the matter would be straightforward. The problem is that in 1905 the French Third Republic was a republic rather than a monarchy, and its head of state was an elected president, not a king. In other words, “the present King of France” did not exist.

&emsp;&emsp;The truth or falsity of this natural-language proposition can therefore provoke disagreement. One person may say that it describes the king, and because no king exists, the proposition is false. Another may ask whether one can say that a nonexistent king really is bald; if not, then “is not bald” must be true (Remark 5). A third may say that if the king does not exist, the proposition is meaningless and cannot be called either true or false.

&emsp;&emsp;Writing it as a logical formula (Remark 6) makes matters much clearer, because doing so forces us to resolve the ambiguity. Let $K(x)$ mean “$x$ is the present King of France,” and let $B(x)$ mean “$x$ is bald.” Suppose we translate the proposition as

$$
\neg \exists x\bigl(K(x) \land \forall y(K(y)\rightarrow y=x) \land B(x)\bigr)
$$

&emsp;&emsp;This says—where $\land$ means “and” and $\neg$ negates what follows—that there does not exist an $x$ satisfying all of these conditions: $x$ is the present King of France; if $y$ is also the present King of France, then $y=x$, ensuring that there is at most one present king; and $x$ is bald. No such $x$ does exist, so this logical formula is true.

&emsp;&emsp;But suppose we choose a different translation:

$$
\exists x\bigl(K(x) \land \forall y(K(y)\rightarrow y=x) \land \neg B(x)\bigr)
$$

&emsp;&emsp;This says that there exists an $x$ satisfying the following conditions: $x$ is the present King of France; if $y$ is also the present King of France, then $y=x$; and $x$ is not bald. On this translation, because there is no present King of France, no such $x$ exists, and the logical formula is false.

&emsp;&emsp;The two translations have apparently produced logical formulas with different truth values. Does that not make matters even more confusing? No: the problem lies not with logical formulas, but with the ambiguity already present in the natural-language proposition. Logical notation requires us to say precisely where the negation $\neg$ belongs: inside or outside; does $x$ ***not*** have the property of being bald, or does $x$ ***not exist***? Once this is made explicit, the truth value is evident (Remark 7).

&emsp;&emsp;In short, clarifying a natural-language statement by translating it into a logical formula has real value. Mathematics education and research today do not ordinarily strip away every trace of natural language and leave an impenetrable book of symbols. When a dispute or ambiguity arises, however, we can—and should make sure that we can—write the statement as a definite logical formula and thereby clarify it.

&emsp;&emsp;So far, however, we have used logical symbols only to translate and clarify natural language. They merely help us express more clearly what we already meant. We are still thinking in natural language and in terms of situations in the real world, such as whether a king actually exists. That is already useful, but some mathematicians considered something more radical and ambitious: could we set aside the real-world semantics of logical formulas and treat them as pure symbols on which logical deductions are performed?

&emsp;&emsp;This may be difficult to grasp in the abstract, so consider the classic syllogism:


> Major premise: All people are mortal;
>
> Minor premise: All Greeks are people;
>
> Conclusion: All Greeks are mortal.


&emsp;&emsp;The argument can be abstracted completely:


> Major premise: Every $x$ with property $M$ has property $P$;
>
> Minor premise: Every $x$ with property $S$ has property $M$;
>
> Conclusion: Every $x$ with property $S$ has property $P$.


&emsp;&emsp;Using predicates with corresponding names—let $M(x)$ mean that $x$ has property $M$, and similarly for $P(x)$ and $S(x)$—the syllogism becomes the logical formula

$$
\big(\left(\forall x (M(x)\to P(x))\right) \land \left(\forall x (S(x)\to M(x))\right)\big) \to \forall x (S(x)\to P(x))
$$

&emsp;&emsp;If this expression remains difficult to read, that is all right. The essential point is that a syllogism is a general, reusable pattern of reasoning. It does not depend on what the particular properties $M,P,S$ happen to be, so we can discard their semantics and carry out a purely symbolic derivation. The mathematicians in question wanted to generalize this idea much further.

&emsp;&emsp;The most representative figure in this project was undoubtedly David Hilbert (1862-1943), one of the most influential mathematicians of his era. His dates show that he was roughly a contemporary of Peano and Russell. His timing was fortunate: mathematical logic had just developed far enough to give him the tools for constructing the “formal systems” he envisioned (Remark 8).

&emsp;&emsp;A formal system (Remark 9) specifies an alphabet of symbols, such as $p, q, \dots$ for propositional variables and $\to, \land, \lor, \dots$ for logical operations. Everything that can be discussed within the system is merely an arrangement of symbols from that alphabet formed according to certain rules, such as $p\to q$. Definitions can be made only according to those rules; these are ***formal definitions***. Every permitted mode of inference is likewise just a system-specified way of manipulating symbols, rather like the syllogism above. You ***may begin only*** from certain ***axioms*** that the formal system has declared true in advance, and you ***may use only*** its specified rules of inference, step by step, to prove other conclusions. This is a ***formal proof***. Mathematics described and developed in this way is called ***formal mathematics***.

&emsp;&emsp;This means that within a formal system, you cannot define something in descriptive natural language. You cannot say that “continuity means being able to draw something in one stroke without lifting the pen.” Nor can you reason from physical meaning or real-world experience. You cannot imitate Galileo and measure the area under a cycloid by weighing it, or guess an answer with a protractor, because none of these actions belongs to the system’s permitted rules of inference. In exchange for these restrictions, every formal definition you give is clear: it requires no further supplement and leaves no room for one. The same holds for a formal proof, whose use of the inference rules at every step can be checked mechanically.

&emsp;&emsp;Someone may still ask, “Why define it this way?” or “Why define continuity in this way rather than another?” Those are questions you must continue to clarify. But whatever formal definition you choose, the definition itself is already clear. This is very different from the earlier situation. We repeatedly had to ask “what is it?” because our natural-language definitions often failed to say clearly what something was, as we saw in Bertrand’s paradox and the history of infinitesimals. In a formal system, once a concept is clear, “what is it?” no longer needs to be asked; we need ask only, “Why this one?”

&emsp;&emsp;A strict proof within a formal system of “if $p\to q$ and $q\to r$, then $p\to r$” might look like the following. The right-hand column contains comments. We omit explicit definitions of the rules, but readers should be able to see that they are natural. Do not worry if the proof is difficult to follow in full; simply take in what it looks like:

$$
\begin{array}{rll}
(0) & ((p \rightarrow q) \land (q \rightarrow r)) \to (p \rightarrow r)
    & \text{Goal to be proved} \\[6pt]
(1) & (p \rightarrow q) \land (q \rightarrow r)
    & \text{Introduce Assumption 1} \\[6pt]
(2) & p \rightarrow q
    & \text{From (1), take the left component by conjunction elimination} \\[6pt]
(3) & q \rightarrow r
    & \text{From (1), take the right component by conjunction elimination} \\[6pt]
(4) & p
    & \text{Introduce Assumption 2} \\[6pt]
(5) & q
    & \text{Derived from (2) and (4) by modus ponens} \\[6pt]
(6) & r
    & \text{Derived from (3) and (5) by modus ponens} \\[6pt]
(7) & p \rightarrow r
    & \text{Discharge Assumption 2 and introduce the implication} \\[6pt]
(8) & ((p \rightarrow q) \land (q \rightarrow r)) \rightarrow (p \rightarrow r)
    & \text{Discharge Assumption 1 and introduce the implication, obtaining the goal} \\[6pt]
(9) & \Box
    & \text{End of proof}
\end{array}
$$

&emsp;&emsp;A new era began. Some people take this as a dividing line and call the mathematics after this period (1890-1930) modern mathematics.

&emsp;&emsp;Mathematical work today is strongly shaped by formal systems. This does not mean that everyone must write fully formal proofs. The influence is instead a gradually absorbed commitment to formalization. Most definitions are expected to be precise enough for people to ***believe*** that they could be formalized; proofs, in principle, should likewise be detailed enough for people to ***believe*** that they could be translated into a step-by-step derivation in a formal system. Otherwise, a definition or proof may be doubted or rejected.

&emsp;&emsp;Why is it usually enough to make people ***believe*** that a proof can be formalized rather than requiring complete formalization? One reason is that formal proofs are extraordinarily complicated and tedious. The proposition above would ordinarily be used without proof, yet its formal proof takes $9$ lines. One can imagine how long and elaborate the formal versions of other proofs become. A second, more important reason is that purely formal presentation does not match the way human beings think and cannot convey the mathematical intuition behind a result. Even when people intend to write a fully formal proof, they usually begin by writing or conceiving an informal proof in a mixture of natural and formal language, then translate it into a formal language step by step. Understanding what a fully formal proof is actually doing is harder still, making such proofs difficult to use directly in mathematical education or communication.

&emsp;&emsp;But if definitions and proofs still mix in natural language, is this not the same as before? No. The key is that the place of natural language in modern mathematics has quietly changed. In early mathematics, natural language served directly as the argument itself and was therefore more likely to rely on visual intuition, physical or geometric meaning, and the context of the problem, as well as to contain unstated leaps. In modern mathematics, natural language acts more like a compressed representation of reasoning in a formal system. It is accepted only when people believe that it could be translated into a fully formal statement.

&emsp;&emsp;People educated in this environment naturally receive the corresponding training, another part of formal mathematics’ influence. The examples of limits and continuity above may be among the first sufficiently formal examples encountered by mathematics students today. They meet such ideas repeatedly throughout their education and become accustomed to formal ways of thinking. This makes them better able to judge whether something “can be formalized” and makes their ***belief*** more reliable. An obvious question remains: people make mistakes, so can relying on ***belief*** alone not lead to errors? It can indeed. We will return to that shortly.

# Mathematics and Formal Mathematics: Misconceptions and Clarifications

&emsp;&emsp;The preceding account is broadly complete, and popular introductions to formal mathematics often stop here. But stopping here can easily leave readers with misunderstandings.

&emsp;&emsp;It may seem that mathematicians have solved the problem perfectly: answering “what is it?” within a formal system is enough, once and for all. Is that right? It is difficult to answer simply yes or no; the issue is subtle.

&emsp;&emsp;Our claims above repeatedly included a condition: “within a formal system.” ***Within a formal system***, every definition is clear. ***Within a formal system***, proofs are never vague or ambiguous, and their correctness can always be checked mechanically. The definitions and rules of inference inside the system are just symbols and need no natural language at all. But what about the definition of the formal system itself?

&emsp;&emsp;We have not given a formal definition of a formal system, but it is reasonable to expect that such a definition cannot dispense with natural language altogether. Borrowing the literal wording of Wittgenstein’s “the limits of language mean the limits of my world,” we must use something to define it. Without natural language, we have no tools with which to “discuss” or “define” anything.

&emsp;&emsp;Of course, one can use a formal system to define a formal system, and this is in fact done. But that merely pushes the problem up one level rather than solving it. How was the other formal system used in the definition itself defined? At the end of the regress, we must still use some natural language and naive mathematics. When we say “$1$ symbol,” for example, we have already used natural language as well as the naive mathematical concept of the natural number $1$.

&emsp;&emsp;Hilbert and his contemporaries were, of course, fully aware of this. Hilbert believed that formal systems could be discussed and characterized using very simple “finitary arithmetical reasoning.” The larger picture is therefore as follows:

&emsp;&emsp;We need only a tiny fragment of mathematics on which to build formal systems and develop formal mathematics. A typical candidate is primitive recursive arithmetic (Remark 10), which contains only the most elementary operations on natural numbers and a very basic form of induction. This fragment is genuinely small, but however small it may be, something of the kind is needed to construct everything else. We can therefore clarify several common misconceptions:


> [Misconception 1]. Mathematics has now been completely formalized, and formal mathematics is all of mathematics.


&emsp;&emsp;This misunderstanding is common among people who have just encountered mathematical logic and set theory. The preceding analysis shows why it is false. In every mathematical practice we have seen so far, formal mathematics itself still requires some naive mathematics lying outside it. In other words, formal mathematics has not yet covered the whole of mathematical practice and has shown no sign that it can become completely independent of the metamathematical level. The informal metamathematics it needs is simply so small, elementary, and inconspicuous to most people that it provides excellent insulation. Once one grants that a formal system exists, one really can work entirely within it without touching anything outside it, creating the illusion that formal mathematics is all of mathematics.


> [Misconception 2]. Mathematics is a meaningless, mechanical game of symbolic derivation.


&emsp;&emsp;This misconception often follows from the first. Some people identify mathematics with formal mathematics, then regard formal mathematics as a purely symbolic derivation that can proceed without semantics, arriving at the simple philosophical view that mathematics is meaningless symbol manipulation. Once the first identification has been rejected, this conclusion is also undermined. Even if formal mathematics is viewed as meaningless symbolic derivation, there remains the informal mathematics used to construct it. Whatever one believes that part of mathematics to be, it is at least not a game of symbolic derivation. Unless one finds a genuinely formal method that dispenses with informal mathematics, the stronger claim remains too extreme to defend.

&emsp;&emsp;If we step back slightly from this misconception, however, we can see another benefit of formal systems—perhaps also a drawback. They insulate much of mathematical practice from questions in the philosophy of mathematics. A proof in a formal system can indeed be viewed as the manipulation of symbols. Its correctness can be checked mechanically and does not depend on what those symbols mean. What meanings they have, or whether they correspond to objects in reality or in our minds—whether the $\mathbb{N}$ we write really corresponds to the set of natural numbers we conceive—are separate philosophical questions. Mathematicians can usually work inside a formal system without considering them, which provides a clean layer of separation. At the same time, that separation has left many students and practitioners of mathematics with less and less knowledge of mathematical philosophy.

&emsp;&emsp;Returning to the question: if mathematics is not a game of symbolic derivation, then what is it, and what role does formal mathematics play? These are profoundly complicated questions in the philosophy of mathematics, and neither our expertise nor the available space permits a full discussion. We can nevertheless offer a few simple observations.


> [Observation from practice]. Mathematical activity and practice existed before formal mathematics and had already developed relatively stable domains of objects, including the natural numbers, the real line, and Euclidean space. In many twentieth-century projects in formal mathematics, mathematicians attempted to use a formal system to characterize a structure that already existed in mathematical practice.
> &emsp;&emsp;In reality, the overwhelming majority of mathematicians do not carry out entirely mechanical, purely symbolic derivations inside a formal system. They continue to think informally, drawing on intuitions developed through mathematical practice, pictures and diagrams, and even the physical and real-world meaning inherent in some problems. They then organize their proofs using a mixture of natural language, images, and symbols.
> &emsp;&emsp;In modern mathematical practice, a trustworthy proof normally must be formalizable in principle, even though mathematicians seldom provide a genuinely formal proof and instead stop once they have persuaded others that “this can be rigorously formalized.”


&emsp;&emsp;We will not pursue the philosophy of mathematics much further here. At a minimum, these observations from practice show that informal mathematical practice generally comes first for mathematicians, while a specific formal system resembles a layer added afterward as a tool for characterization and verification. Yet because formal proof has become the standard to which proofs should aspire, many mathematicians in fact hold a mixture of philosophical positions without being entirely aware of it. Consider this passage from Peter Smith (Remark 11):


> Imre rapidly sketched several philosophical positions on mathematics, which he called platonism and formalism. His claim was that mathematicians tend to be platonists in their assumptions about “what they are really doing”: they assume that they are exploring a determinate abstract mathematical universe in which objectively existing truths await discovery. But when they write proofs for public consumption, they turn into formalists.
> &emsp;&emsp;...
> &emsp;&emsp;...Imre portrayed formalism as a view about the nature of mathematics that says, roughly, “Mathematics consists entirely in manipulating meaningless symbols. It is a game: given certain rules, see which strings of symbols you can ‘derive’ from certain other strings.” The first point to emphasize is that, at least among genuinely serious participants in the history of the philosophy of mathematics, this is something of a “straw-man” position. The great Hilbert, for example, is usually regarded as the archetypal formalist, but his position was far more subtle and complex. Still, I have indeed heard other mathematicians describe mathematics in the naive terms that “it is all just symbol manipulation.” My point is that it is a mistake to conflate any version of formalism—whether Imre’s naive version or a more sophisticated one—with the project of advancing formalization.


&emsp;&emsp;The straw-man position criticized by Peter Smith is precisely one of the misconceptions discussed above, and he puts the criticism more forcefully. Since mathematicians’ own philosophical positions are often unclear, we will not venture further into that difficult territory. Whatever philosophy we adopt, and however deeply we reflect on mathematical philosophy, the practical roles of informal and formal mathematics cannot be ignored. Mathematicians think informally and use formal methods, together with a belief in formalizability, as a reliable check.

&emsp;&emsp;Human beings always make mistakes. The work of 2002 Fields Medalist Vladimir Voevodsky (1966-2017) lay in an exceptionally deep and difficult field. An error in a paper he published in 1989 was not discovered until 1998, and he did not establish conclusively that it was an error until 2013 [8]. Similar problems occurred more than once in his field and caused him great concern. He eventually changed direction and began working on computer-assisted verification of formal proofs (Remark 12).

&emsp;&emsp;Yes, computers can help write and verify formal proofs. Their invention and development have alleviated, to some extent, the extreme difficulty of producing and checking such proofs by hand. At the time this text was written, mathlib, the large general-purpose mathematics library maintained by the community around Lean—an open-source interactive theorem prover—had formalized 125901 definitions and 262213 theorems, with direct contributions from more than seven hundred people [9]. Many major results, including the four-color theorem [10], have now been rewritten as formal proofs and verified by computer. This remains an enormous undertaking and often takes years. But as libraries improve and deep learning has developed in recent years, translating human proofs into machine-checkable formal proofs has become easier. Informal and formal mathematics are, of course, advancing together. Perhaps proof assistants will one day become capable enough to translate most of the natural-language proofs we write into formal proofs automatically and verify them.

&emsp;&emsp;This article is already long, yet it has barely touched the surface. We have not explained how Bertrand’s paradox is actually resolved, provided a more complete history of calculus, supplied basic definitions and examples relating to formal systems, or adequately discussed the philosophy of mathematics. Each point deserves a treatment of its own and would lead into an entire course—or is itself the subject of one or more courses. Readers who have not yet begun even elementary analysis need not be anxious; simply continue learning one step at a time. If this article lets such readers glimpse a beacon of formalization in the distance and keeps them from becoming too lost before they reach it; if it helps them approach concepts defined in abstract language without irritation and understand why formalization is necessary; or if, in the pursuit of extreme formal mathematics, it reminds them that formalization is not all of mathematics—then it has done enough.

# Remarks

&emsp;&emsp;This section supplies patches added for rigor, along with extensions that are more complex, detailed, or difficult than the main text. It may be skipped.

- Remark 1. Leibniz did in fact describe something close in meaning to the modern $\varepsilon-\delta$ language [11, p.291]. The resemblance in form and properties does not mean that Leibniz regarded it as the definition or essential meaning of continuity. It is better understood as one of the properties he derived from his conception of continuity.

- Remark 2. History is exceedingly complex and does not advance in a straight line. Space permits the article to describe only one line of development in linear fashion; many other mathematicians also contributed. Even within this one line, the author has selected only a representative figure from each generation and summarized the whole, which is far from a complete account. Nor did every mathematician focus on this kind of work. The great contemporary mathematician Leonhard Euler (1707-1783), for example, expressed a commitment to rigor but in practice continued to use infinitesimals sometimes as quantities equal to zero and sometimes as quantities not equal to zero [12]. This did not prevent Euler from advancing analysis and mathematics as a whole to an extraordinary degree.

- Remark 3. Cauchy’s actual position on the ontology of infinitesimals was highly ambiguous. Twentieth-century historians such as Grabiner regarded Cauchy as a precursor of $\varepsilon-\delta$ language who supplied an early version of the definitions in modern standard analysis. This has also become the dominant historical narrative in today’s textbooks. Twenty-first-century historians such as Katz have challenged this Whiggish reading [13, pp. 15-17]. The issue remains contested, with no settled conclusion.

- Remark 4. The definition of continuity quoted here comes from Kronecker’s lectures, as edited by Eugen Netto [14, p. 12]. Because Kronecker worked closely with Weierstrass and the form of the statement did originate with Weierstrass, the main text calls it, in general terms, a “Weierstrass-***style*** formulation.” To keep readers from having to track differences in the letters used, the main text changes the letters slightly and makes a simple equivalent transformation. The meaning is unchanged.
&emsp;&emsp;The definition of continuity in the main text also quietly omits the function’s domain $\mathbb{R}$. That is because this article does not intend to take on such difficult questions as “what are the real numbers?” and “how exactly is $\mathbb{R}$ defined?”

- Remark 5. The argument in question actually uses the law of excluded middle: either a proposition or its negation must be true, or formally, $P\lor \neg P$ is always true. The example in the main text is itself a simple challenge to excluded middle. Because the present King of France does not exist, “the present King of France is bald” and “the present King of France is not bald” might both be read as false, violating excluded middle. Russell, who supported the law, translated the proposition into clearer logical notation and thereby restored its validity.
&emsp;&emsp;Readers may think that excluded middle always holds unconditionally, and mainstream mathematics today does indeed continue to assume this. In part, that is because the law is so useful. As Hilbert said [15], “Taking the principle of excluded middle from the mathematician would be the same, say, as proscribing the telescope to the astronomer or to the boxer the use of his fists.” Some people, however—usually intuitionists in the philosophy of mathematics—believe that excluded middle should not hold without qualification. L. E. J. Brouwer (1881-1966), the founder of intuitionism, took this view, and intuitionistic mathematics developed from it. A deeper discussion lies far beyond the scope of this article.

- Remark 6. For convenience, the notation used here is modern rather than Russell’s own. Russell did not, in fact, express the proposition entirely in logical symbols at the time, but his formulation was logical in structure.

- Remark 7. Some readers may translate the proposition in the main text differently: if $x$ is the unique present King of France, then $x$ is not bald, that is,
$$
\forall x\bigl( (K(x)\land \forall y(K(y)\to y=x))\rightarrow \neg B(x)\bigr)
$$
- By the principle of vacuous truth—“an implication with a false antecedent is true”—this is true, because there is no present King of France and $K(x)$ is always false. This is indeed another possible translation and is essentially equivalent to the first translation in the main text. To verify the equivalence, simply move the negation in $\neg \exists$ inward in the first formula, then use the fact that $P\land \neg Q$ and $P\to Q$ are negations of one another.

- Remark 8. If one person had to be chosen to represent the birth and development of formal systems, it would of course be Hilbert, as in the main text. Mathematical developments, however, also arise from their times. The modern concept of a formal system was not proposed in finished form by a single person. It acquired an increasingly explicit definition through the work of the early Frege and Peano, then Hilbert and the Hilbert school—a loose term used here for mathematicians working with Hilbert on related problems in Göttingen from 1910 to 1930—and later Kurt Gödel (1906-1978) and Alan Turing (1912-1954). Looking back in 1963, Gödel wrote [16, p.7], “due to A. M. Turing’s work, a precise and unquestionably adequate definition of the general concept of formal system can now be given.”

- Remark 9. Regrettably, after consideration, I decided neither to give a formal definition of a formal system nor to present a concrete example, because doing so would make the article too difficult. For readers who have not yet studied mathematics at the level of classical calculus, I also do not believe that plunging into formal systems too early is beneficial. Their experience with $\varepsilon-\delta$ arguments can gradually teach them what formalization is.
&emsp;&emsp;It is also worth noting that “formal system” is now a very broad and often abused term. A rigorous treatment would need to separate and explain formal languages, syntax and semantics, structures and models, theories, proof systems, and other concepts, as well as the distinction between “true” and “provable.” All of this lies far beyond the article’s scope. The main text therefore ignores those matters, does not discuss models or truth values, and remains at the level of syntax and proof. It deliberately uses “formal system” as a broad container for all of them, solely to convey the intuition and overall direction.
&emsp;&emsp;Many readers may also have heard of some of Gödel’s results, including his completeness and incompleteness theorems. In principle, discussing formal mathematics without touching Gödel’s work is regrettable and perhaps incomplete. But before the distinction between “true” and “provable” has even been clarified, a real understanding of Gödel’s results is nearly impossible. We will say only this: Gödel’s results show that Hilbert’s vision cannot be realized in its most optimistic form. This “setback” does not affect the account in the main text. Indeed, Gödel’s results themselves can be regarded as part of the immense achievement made possible by formal mathematics.

- Remark 10. Technically, primitive recursive arithmetic (PRA) can encode and study other formal systems. This is the practical meaning of “using a formal system to define a formal system” in the main text. Within PRA, one can therefore formally encode and discuss stronger and more familiar systems used in practice, such as ZFC. Tait and others regard this approach as a precise restatement of Hilbert’s finitism [17, p.5]. Zach and others, however, argue that some proofs used by the Hilbert school actually went beyond PRA, so the two cannot simply be identified [18]. This is a historical issue and does not affect PRA’s mathematical status.
&emsp;&emsp;Notice that we consistently say “Hilbert’s finitism.” Several different claims, even claims at different levels, can be called finitism, so an additional qualifier is needed to prevent confusion.

- Remark 11. For the relevant discussion, see [19]. Readers interested in the philosophy of mathematics are encouraged to continue there; it expands on our elementary discussion and covers much else besides.
&emsp;&emsp;For a recommended Chinese translation, see https://zhuanlan.zhihu.com/p/683120242

- Remark 12. Readers who would like a simple introduction to computer-assisted formal proof can learn by playing a game released by the Lean community:
&emsp;&emsp;https://adam.math.hhu.de/#/g/leanprover-community/nng4

# References

[1] File:Bertrand1‑figure.Svg ‑ Wikipedia. URL: https://commons.wikimedia.org/wiki/File:Bertrand1-figure.svg (visited on 02/03/2026).
[2] File:Bertrand2‑figure.Svg ‑ Wikipedia. URL: https://commons.wikimedia.org/wiki/File:Bertrand2-figure.svg (visited on 02/03/2026).
[3] File:Bertrand3‑figure.Svg ‑ Wikipedia. URL: https://commons.wikimedia.org/wiki/File:Bertrand3-figure.svg (visited on 02/03/2026).
[4] J. Bair et al. “Leibniz’s Well‑Founded Fictions and Their Interpetations”. In:Matematychni Studii 49.2 (June 30, 2018), pp. 186–224. ISSN: 1027‑4634. DOI:10.15330/ms.49.2.186-224. URL: http://matstud.org.ua/texts/2018/49_2/186-224.pdf (visited on 02/03/2026).
[5] H. J. M. Bos. “Differentials, Higher‑Order Differentials and the Derivative inthe Leibnizian Calculus”. In: Archive for History of Exact Sciences 14.1 (1974),pp. 1–90. ISSN: 0003‑9519, 1432‑0657. DOI: 10.1007/BF00327456. URL: http://link.springer.com/10.1007/BF00327456 (visited on 02/03/2026).
[6] Earliest Uses of Symbols of Set Theory and Logic. Maths History. URL: https://mathshistory.st- andrews.ac.uk/Miller/mathsym/set/ (visited on 02/04/2026).
[7] Bertrand Russell. “On Denoting”. In: Mind 14.56 (1905), pp. 479–493. JSTOR: 2248381. URL: https://www.jstor.org/stable/2248381 (visited on 02/04/2026).
[8] Vladimir Voevodsky. “The Origins and Motivations of Univalent Founda‑tions”. In: The Institute Letter (2014), pp. 8–9.
[9] Mathlib Statistics. URL: https://leanprover-community.github.io/mathlib_stats.html (visited on 03/06/2026).
[10] Georges Gonthier. “Formal Proof–the Four‑Color Theorem”. In: Notices of the AMS 55.11 (2008), pp. 1382–1393. URL: https://www.ams.org/notices/200811/tx081101382p.pdf?referer=www.clickfind.com.au (visited on 02/05/2026).
[11] Hardy Grant. “Leibniz and the Spell of the Continuous”. In: The College Mathematics Journal 25.4 (Sept. 1994), pp. 291–294. ISSN: 0746‑8342, 1931‑1346. DOI: 10.1080/07468342.1994.11973624. URL: https://www.tandfonline.com/doi/full/10.1080/07468342.1994.11973624 (visited on 02/03/2026).
[12] Giovanni Ferraro. “Euler, Infinitesimals and Limits”. In: (Jan. 3, 2012).
[13] Piotr Blaszczyk, Mikhail G. Katz, and David Sherry. “Ten Misconceptions from the History of Analysis and Their Debunking”. In: Foundations of Science 18.1 (Mar. 2013), pp. 43–74. ISSN: 1233‑1821, 1572‑8471. DOI: 10.1007/s10699-012-9285-8. arXiv: 1202.4153 [math]. URL: http://arxiv.org/abs/1202.4153 (visited on 02/04/2026).
[14] Eugen Netto. Vorlesungen über die Theorie der Einfachen und der Vielfachen Integrale. B. G. Teubner, 1894. URL: http://archive.org/details/rcin.org.pl.WA35_13014_4769__Vorlesungen_78413 (visited on 03/05/2026).
[15] Foundations of Mathematics By David Hilbert (1927). URL: https://www.marxists.org/reference/subject/philosophy/works/ge/hilbert.htm (visited on 02/05/2026).
[16] Jean‑Yves Beziau. “What Is‘Formal Logic’”. In: Proceedings of the XXII World Congress of Philosophy. Vol. 13. Korean Philosophical Association Seoul, 2008, pp. 9–22. URL: https://www.academia.edu/download/52271386/form-bonn.pdf (visited on 02/05/2026).
[17] Stephen G. Simpson. “Partial Realizations of Hilbert’s Program”. In: The Journal of Symbolic Logic 53.2 (1988), pp. 349–363. URL: https://www.cambridge.org/core/journals/journal-of-symbolic-logic/article/partialrealizations-of-hilberts-program/66FDE948158C90D3818B011A45D466E5 (visited on 02/05/2026).
[18] Richard Zach. “The Practice of Finitism: Epsilon Calculus and Consistency Proofs in Hilbert’s Program”. In: Synthese 137.1 (Nov. 1, 2003), pp. 211–259. ISSN: 1573‑0964. DOI: 10.1023/A:1026247421383. URL: https://doi.org/10.1023/A:1026247421383 (visited on 03/06/2026).
[19] Peter Smith. Does Mathematics Need a Philosophy? Logic Matters. Feb. 15, 2023. URL: https://www.logicmatters.net/2023/02/15/does-mathematics-need-a-philosophy/ (visited on 02/05/2026).
