---
layout: post
title: "Afternoon Tea: A Glimpse of Erdős's Probabilistic Method"
date: 2026-08-22 19:29:18
lang: en
translation_key: "下午茶时间：Erdős 概率方法的一瞥"
translation_source_sha256: "079196c0db32589751889cd5d849fb2863697633d28793cabcca0b5836dc9898"
permalink: en/2026/08/22/afternoon-tea-a-glimpse-of-erdos-probabilistic-method/
aside: false
comments: false
tags: []
categories: []
cover: '/images/下午茶时间：Erdős 概率方法的一瞥/cover.png'
copyright_author: 'silverxz'
katex: true
---

{% note blue 'fas fa-dice' %}
Must a mathematical proof find its answer step by step? The mathematician Erdős offered a marvelous idea: if we can prove that “a random choice has some chance of success,” then we have proved that a solution must exist. Make some coffee and join us in appreciating these artful proofs.
{% endnote %}

> Author: silverxz
Reviewed by: phy东西

<img src="/images/%E4%B8%8B%E5%8D%88%E8%8C%B6%E6%97%B6%E9%97%B4%EF%BC%9AErd%C5%91s%20%E6%A6%82%E7%8E%87%E6%96%B9%E6%B3%95%E7%9A%84%E4%B8%80%E7%9E%A5/fig-001-0eb3269b6d.jpg" alt="" />
<center><font size=2px color=grey>Paul Erdős</font></center>
<center><font size=2px color=grey>Image source: zbMATH</font></center>

&emsp;&emsp;Paul Erdős is not exactly a household name, but within mathematics, almost everyone knows him. He was a legendary mathematician: prolific, wide-ranging, and responsible for remarkable results in number theory, set theory, analysis, geometry, and many other fields. His standing in combinatorics is especially unassailable.

&emsp;&emsp;There are plenty of stories to tell about Erdős—his unusual way of living and doing mathematics, the many ways in which his brilliance revealed itself, and much more. You can read those stories elsewhere; they are not today's subject. What we will introduce is a fascinating mathematical technique that Erdős championed: the **probabilistic method**.

&emsp;&emsp;You may be wondering: is this some method in probability theory? Why give it such a broad, vague name?

&emsp;&emsp;Do not misunderstand. The probabilistic method is not a method *within* probability theory. Its idea is to take a deterministic problem that has nothing to do with probability, deliberately introduce a constructed probabilistic structure, analyze that structure with tools from probability, derive a probabilistic result, and then use it to obtain the deterministic conclusion we originally wanted. In other words, the probabilistic method “introduces probabilistic structure into a non-probabilistic problem in order to solve it.” Probability is merely the scaffolding, much like an auxiliary line in plane geometry.

&emsp;&emsp;That is precisely what makes the method magical. How can probability be introduced into a problem that has nothing to do with it? Can that really help?

&emsp;&emsp;In this article, we will look at several small, entertaining examples to see how the method works. The probabilistic method of Erdős is usually regarded as a technique in combinatorics, but its applications extend far beyond that field. I have therefore chosen examples from several areas. Each is light enough to serve as dessert and should not be too demanding. The article is long only because it explains the examples in detail; in practice, it should read considerably faster than an ordinary mathematics article of this length.

&emsp;&emsp;It is best if readers know some elementary linear algebra and probability. Beyond that, the stronger your mathematical background, the more “relaxed and leisurely” the experience will be. Ideally, you can make a cup of coffee on one or two quiet afternoons and stroll pleasantly through these examples. May they remind you of the beauty of mathematics.

# Vector Balancing: The Basic Framework of the Probabilistic Method

&emsp;&emsp;We begin with an especially simple example that explains what it means to “introduce probabilistic structure into a non-probabilistic problem.”

> Let there be $n$ vectors $v_1,\dots, v_n \in \mathbb{R}^d$, and let $\Vert v\Vert$ denote the length of vector $v$. Prove that there are signs $\varepsilon_i\in\{-1, 1\}$ such that
>
> $$
> \left\|\sum_{i=1}^n\varepsilon_i v_i\right\|^2\leq\sum_{i=1}^n\|v_i\|^2.
> $$

&emsp;&emsp;The problem asks us to balance the vectors by adjusting the coefficients $\varepsilon_i$, making the resulting vector $\sum_{i=1}^n\varepsilon_i v_i$ as short as possible. After a little thought, the geometric intuition should be clear. Imagine two vectors in $\mathbb{R}^d$. When the angle between them is obtuse, their sum is relatively short; when the angle is acute, their sum is longer. We need only choose the coefficients so that each new vector does not form an acute angle with the sum of the preceding vectors.

&emsp;&emsp;The sign of a dot product determines the angle between two vectors. For clarity, write the dot product of vectors $x,y$ as $\langle x,y\rangle$. Let the sum of the first $k-1$ vectors be

$$
S_{k-1}=\sum_{i=1}^{k-1}\varepsilon_i v_i.
$$

&emsp;&emsp;Among $\varepsilon_k=\pm 1$, choose a value for which $\varepsilon_k\langle S_{k-1},v_k\rangle\leq 0$; call it $\varepsilon_k$. This is the coefficient-adjustment step. Then

$$
\begin{aligned}
\|S_k\|^2 &=\|S_{k-1}\|^2+\|v_k\|^2 +2\varepsilon_k\langle S_{k-1},v_k\rangle\\
&\leq \|S_{k-1}\|^2+\|v_k\|^2.
\end{aligned}
$$

&emsp;&emsp;Induction now proves the original statement.

&emsp;&emsp;But you are probably wondering something else: where was the probabilistic method? Can a proposition this simple, with such a clear meaning and short proof, really have another proof? Let us see.

&emsp;&emsp;Treat the $\varepsilon_i$ as <strong>independent uniform random variables</strong> over $\{-1,1\}$. The squared length of a vector is its dot product with itself, so

$$
\mathbb E\left\|\sum_i\varepsilon_i v_i\right\|^2 = \mathbb E\left\langle\sum_i\varepsilon_i v_i, \sum_j\varepsilon_j v_j\right\rangle = \mathbb E \sum_{i,j}\varepsilon_i\varepsilon_j \langle v_i,v_j\rangle = \sum_i\|v_i\|^2.
$$

&emsp;&emsp;The last equality follows because the $\varepsilon_i$ are independent. When $i\neq j$, $\mathbb{E} \left[\varepsilon_i\varepsilon_j\right]=0$; when $i=j$, $\mathbb{E}\left[\varepsilon_i\varepsilon_j\right]=\mathbb{E}\left[\varepsilon_i^2\right]= 1$.

&emsp;&emsp;When the $\varepsilon_i$ are assigned at random, the average value of $\left\|\sum_i\varepsilon_i v_i\right\|^2$ is $\sum_i\|v_i\|^2,$ so there must be some fixed assignment for which $\left\|\sum_i\varepsilon_i v_i\right\|^2$ is no greater than $\sum_i\|v_i\|^2$. Not every value can exceed the average. That completes the proof. Although it does not construct the particular values of the $\varepsilon_i$, it proves that the values we need exist.

&emsp;&emsp;The two proofs are almost “equally simple,” yet their methods are entirely different. **The second displays the basic framework of the probabilistic method.** First, randomize the deterministic problem by making the $\varepsilon_i$ random variables. Second, analyze the result with probabilistic tools. Here we take an expectation and use independence to eliminate every cross term with $i\neq j$ quickly and conveniently. Finally, turn the probabilistic result back into a deterministic one. Usually this is done with an almost trivial observation like “not every value can exceed the average,” which guarantees that such a value exists. That existence statement is fully deterministic and no longer depends on the probabilistic structure introduced along the way.

&emsp;&emsp;But… but… who would think of solving a problem this way? The question is not merely “How can this method work?” but “How did anyone think of this?” Good mathematical teaching should ordinarily do more than display a proof. It should analyze the motivation and techniques so that students can master them and apply them more broadly. But as the title and introduction make clear, this is an afternoon-tea essay, not a lesson with heavy educational responsibilities. I would rather you read it as a mathematical joke book. We will simply enjoy the examples and their proofs, without delving into their motivations, extensions, and so on.

# Random Translation and Covering with Unit Disks

&emsp;&emsp;Our second example is a problem posed and solved in 2008 by the Japanese “puzzle creator” Naoki Inaba:

> Prove that any given set of 10 points in the plane can be covered by some collection of pairwise disjoint <strong>unit disks</strong>—disks of radius $1$.

&emsp;&emsp;Throughout this section, “disjoint” means that the interiors of the disks do not intersect. Tangent disks are allowed and are not regarded as intersecting.

&emsp;&emsp;At first sight, the problem is difficult to approach. If there are enough points, one can imagine arranging them so that, after some disks have been placed and some points covered, the remaining points sit precisely in the gaps between the disks. Covering any such point would then require overlapping an existing disk. A proof that places disks one at a time would have to show that this situation can always be handled, which is plainly difficult.

&emsp;&emsp;Let us see what the probabilistic method does. Consider placing disks only in a fixed, regular pattern. This restricts their placement but makes the arrangement easier to analyze. The most obvious pattern is to put a unit disk at every even lattice point—that is, at each point with coordinates $(2a,2b)$, where $a,b\in\mathbb{Z}$. The plane then looks like this:

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/bare_square.png" alt="" />

&emsp;&emsp;This is not our final covering strategy. Applied mechanically, it can never cover the star-shaped gaps between the disks. We therefore translate all the disks together by a random vector $v=(x,y)$: every disk center has its horizontal coordinate increased by $x$ and its vertical coordinate increased by $y$. The vector $v$ is random, but every disk is translated by the same $v$; the disks do not move independently.

&emsp;&emsp;The placement is highly regular and periodic. A horizontal translation by $x$ is therefore no different from a translation by $x+2$, and the same holds vertically. With this in mind, let $v$ be chosen uniformly at random from the $2\times2$ square $\{(x,y):0\leq x,y\leq2\}$.

&emsp;&emsp;Furthermore, positions are relative, so randomly translating every disk is equivalent to translating the points we want to cover in the opposite direction by $v$. A translated point is covered if it falls inside a disk and remains uncovered otherwise. Since $v$ is uniform over a $2\times 2$ square, the translated point is likewise uniform over some $2\times 2$ square. Its probability of being covered is the fraction of that square's area occupied by disks. If the translated point is uniform in one of the squares shown below, the probability that it is covered equals the blue area divided by the total square area $4$.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/square_2.png" alt="" />

&emsp;&emsp;No matter where this $2\times 2$ square lies, however, its total area of intersection with the disks is the same. As noted above, the disk pattern has period $2$ in both horizontal and vertical directions. Imagine sliding the $2\times 2$ square across the plane: any part that leaves on one side enters identically on the other, so the total intersecting area does not change. We need only calculate the neatest case, shown on the left. The total intersecting area is $\pi$, formed by four $1/4$ circles, which is a fraction $\pi /4$ of the square.

&emsp;&emsp;In short, if we translate all the disks together by a random vector $v$, then **any point in the plane has probability $\pi/4$ of being covered by a disk**.

&emsp;&emsp;This fact already lets the probabilistic method prove a weaker result: any given set of $4$ points in the plane can be covered by pairwise disjoint unit disks. Under the random translation above, each point is covered with probability $\pi/4$, so the expected number of covered points is

$$
4\times \frac{\pi}{4} = \pi > 3
$$

&emsp;&emsp;You may wonder why we can multiply $4$ by the probability $\pi/4$ to calculate the expectation. For readers who need it, let us unpack the calculation carefully; those already familiar with the technique may skip ahead. The tool is called an “<strong>indicator random variable</strong>.” Let $I_1$ indicate whether the first point is covered after the random translation: $I_1=1$ if it is covered, and $I_1=0$ otherwise. This random variable indicates whether the first point is covered, hence its name. Similarly, define $I_2,I_3,I_4$ to indicate whether the second, third, and fourth points are covered. The number of points covered after the random translation is the sum of these four variables, itself a new random variable:

$$
X = \sum_{i=1}^4 I_i
$$

&emsp;&emsp;The expected number of covered points is therefore $\mathbb{E}[X]=\mathbb{E}[\sum_{i=1}^4 I_i]$. By linearity of expectation, the sum can be moved outside the expectation:

$$
\mathbb{E}[X] = \sum_{i=1}^4 \mathbb{E}[I_i]
$$

&emsp;&emsp;For $\mathbb{E}[I_i]$, use the definition to calculate $\mathbb{E}[I_i]=1\times\frac{\pi}{4}+0\times\left(1-\frac{\pi}{4}\right)=\frac{\pi}{4}$. Therefore,

$$
\mathbb{E}[X]=4\times \frac{\pi}{4} = \pi.
$$

&emsp;&emsp;That is the calculation in full. The variables $I_i$ are certainly not independent, but linearity of expectation lets us add them when calculating the expectation without requiring independence. We will see this technique again in later examples. In short, the expected number of covered points is $\pi>3$.

&emsp;&emsp;This means there is some translation $v$ that covers more than $3$ points; otherwise, the expectation could be no greater than $3$. The number of covered points is an integer, so “more than $3$ points” means all $4$ points are covered, proving the weaker statement.

&emsp;&emsp;Our original problem concerns not $4$ points but $10$. What now? Notice that the argument uses only the periodicity of the disk arrangement. If we can preserve periodicity while packing the disks more densely, raising the probability $\pi/4$, the probabilistic method will give a stronger result. Consider the denser honeycomb arrangement below. It still has two periodic directions, one horizontal and the other at an angle of $60$ degrees to the horizontal.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/best.png" alt="" />

&emsp;&emsp;The pattern remains periodic, so as we slide the parallelogram, its area of intersection with the disks stays constant. As the figure shows, this area is still the area $\pi$ of one complete circle, since the pieces inside the parallelogram can be reassembled into a circle. The area fraction has changed, however: the parallelogram has area only $2\sqrt3$, giving a fraction of $\frac{\pi}{2\sqrt3}$.

&emsp;&emsp;Again translate all the disks by a random vector $v$, but this time choose $v$ uniformly from the parallelogram shown above. A single point is then covered with probability $\frac{\pi}{2\sqrt3}$, so the expected number of covered points among 10 is

$$
10\times \frac{\pi}{2\sqrt 3} \approx 9.07 > 9
$$

&emsp;&emsp;As before, this means that some translation covers more than $9$ points—in other words, **all $10$ points**—which proves the result.

&emsp;&emsp;This new arrangement proved the claim for $10$ points. Could an even denser arrangement prove a stronger result? No. The honeycomb pattern already has the maximum possible density for a packing of disjoint unit disks in the plane. No denser arrangement exists; this is **Thue's theorem**.

&emsp;&emsp;A stronger result can nevertheless be proved. Greg Aloupis and his coauthors showed that the statement remains true for $12$ points. Their result cannot be obtained simply by changing the arrangement and copying the argument above.

&emsp;&emsp;As for how many points are needed before a set is guaranteed to be impossible to cover, the exact answer remains unknown. A counterexample with $50$ points is known, but the world between $12$ and $50$ awaits exploration.

# Random Selection and Independent Sets in Graphs

&emsp;&emsp;Our third example comes from <strong>graph theory</strong>. Readers need only know the basic concepts. A <strong>graph</strong> is an object made up of <strong>vertices</strong> and <strong>edges</strong> between them. Let the set of vertices be $V$, the set of edges be $E$, and write the graph as $G=(V,E)$.

&emsp;&emsp;For a set of vertices $S\subset V,$ if no two vertices in $S$ are joined by an edge, then $S$ is called an <strong><em>independent set</em></strong>, of size $|S|$.

&emsp;&emsp;The figure below shows an example. A graph consists of points and the edges joining them, as shown. The gray vertices form an independent set, though of course not the only one.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/graph-independent-set.png" alt="" />

<center><font size=2px color=grey>Dots represent vertices, and line segments joining them represent edges. The gray vertices form the independent set <em>S</em>.</font></center>

&emsp;&emsp;Finding a graph's maximum independent set is a classic problem in graph theory. Let $n=|V|,m=|E|$. Can we lower-bound the maximum independent-set size $\alpha(G)$ in terms of $n,m$? In other words, in a graph with $n$ vertices and $m$ edges, how large must its maximum independent set $\alpha(G)$ be?

&emsp;&emsp;This looks much harder than the preceding problem. A graph can have any structure, and the “worst” structures obstruct a lower-bound estimate. But what do those worst structures look like? Following that line of thought seems likely to plunge us into the depths of graph theory. Let us change direction and see how elegantly the probabilistic method produces an estimate.

&emsp;&emsp;Independently include each vertex with probability $p$ in a set $S$. Let $X=|S|$ be the number of selected vertices, and let $Y$ be the number of edges between those selected vertices. Both $X,Y$ are random variables.

&emsp;&emsp;When $Y=0$, $S$ is an independent set; otherwise, it is not. We naturally want an independent set so that the later probabilistic argument can tell us that “an independent set of size $\dots$ exists.” What should we do? The technique here is called the **alteration method**, or the “<strong>deletion-and-modification method</strong>”: when the probabilistic structure does not directly produce the object we want, alter it until it does. If $S$ is not independent, simply turn it into an independent set.

&emsp;&emsp;Inside $S$, for each of the $Y$ edges, choose either endpoint. Delete the at most $Y$ selected vertices from $S$—there may be duplicates—and call the resulting set $S'$. It must be independent. We have therefore obtained an independent set of size at least $X-Y$. There is no problem if $X<Y$; the statement remains a valid, if trivial, lower bound.

&emsp;&emsp;As before, take the expectation and calculate $\mathbb{E}[X-Y]$. We immediately have $\mathbb{E}[X]=pn$, but how do we find $\mathbb{E}[Y]$? Use the indicator-variable technique from the previous example. Define a random variable $I_e$ that, when edge $e$ is selected, equals $1$, and otherwise equals $0$. Linearity of expectation then gives

$$
\mathbb{E}[Y] = \sum_{e\in E} \mathbb{E}[I_e]
$$

&emsp;&emsp;The value $\mathbb{E}[I_e]$ is simply the probability that edge $e$ is selected. An edge $e$ is selected exactly when both its endpoints are selected. The vertices are chosen independently, so this probability is $p^2$. Thus $\mathbb{E}[I_e]=p^2$, which gives $\mathbb{E}[Y]=p^2m$, and substitution yields

$$\mathbb E[X-Y]=pn-p^2m.$$

&emsp;&emsp;This proves that **there is an independent set of size at least $pn-p^2 m$**; that is, $\alpha(G)\ge pn-p^2m$. We choose $p$ ourselves and, in terms of $n,m$, can select the best $p$. When $m > 0$, regard the expression as a quadratic function of $p$, whose maximum occurs at $p=\frac{n}{2m}$. Taking into account the probabilistic constraint $p\in [0, 1]$ and the boundary case $m=0$, we obtain the piecewise result

$$
\alpha(G)\ge\begin{cases}
n-m, & m\le \dfrac n2,\\[6pt]
\dfrac{n^2}{4m}, & m\ge \dfrac n2.
\end{cases}
$$

&emsp;&emsp;Not too complicated, was it? But is this bound good enough?

&emsp;&emsp;The probabilistic method often produces magical results, but there is no reason to expect it to be a universal cure that always gives a good answer. The quality of a result naturally depends on both the nature of the problem and how the method is used. The estimate above is not bad, but it is not especially good either. The approach is still too crude.

&emsp;&emsp;Consider a different probabilistic construction: order all the vertices at random. For each vertex $v\in V$, if $v$ appears before all its neighbors in the ordering, add $v$ to the set $S$. This construction is simple and elegant. The resulting $S$ is already independent because, of the two endpoints of any edge, only the earlier one can possibly be selected into $S$. This ensures that no two vertices in $S$ are joined by an edge.

&emsp;&emsp;As before, for each vertex $v\in V$, define an indicator random variable $I_v$ for whether it is included in $S$. Then $\mathbb{E}|S|=\sum_{v\in V}\mathbb{E} [I_v]$. Whether a point is included in $S$ depends on its neighbors. Let $d(v)$ be the number of vertices adjacent to point $v$. Every one of $v$ and these $d(v)$ points is equally likely to come first, so $v$ is selected—exactly when $v$ is first among these $d(v)+1$ vertices—with probability $1/(1+d(v))$. Therefore,

$$
\mathbb{E}|S|= \sum_{v\in V}\frac1{1+d(v)}.
$$

&emsp;&emsp;Since the expectation equals this quantity, some independent set has size at least this large. Hence,

$$
\alpha(G)\ge \sum_{v\in V}\frac1{1+d(v)}.
$$

&emsp;&emsp;This result is never weaker than the previous one and is much stronger in many cases. Proving that fact requires only a case analysis and the **Cauchy–Schwarz inequality**. This article does not assume that readers know the inequality, however, and the proof would take us away from our main subject, so we will omit it. We have obtained a new and better result, one important enough to have a name: the **Caro–Wei bound** on the maximum independent-set size.

&emsp;&emsp;We will not analyze it in depth. Readers interested in graph theory, or already familiar with it, can investigate the deeper reason why the two methods differ. Try to find the situations in which the first estimate loses sharpness and how the second method avoids those losses. Here, it is enough to see this: using “the probabilistic method” may give you a result, but it does not automatically give you a sufficiently good result. The better your probabilistic structure fits the problem, the better the result you obtain.

# Random Sampling and the Approximate Carathéodory Theorem

&emsp;&emsp;There are many more examples from graph theory, including Ramsey numbers—the example mentioned most often—and other graph-coloring problems. Such examples are frequently less concise, so we will stop with the one above and visit other fields.

&emsp;&emsp;The next example comes from Roman Vershynin's textbook *High-Dimensional Probability*.

&emsp;&emsp;First, readers need the concepts of a **convex combination** and a **convex hull**. A convex combination of $m$ points $z_1,\dots,z_m\in\mathbb{R}^n$ is a linear combination with nonnegative coefficients whose sum is $1$. That is, if $\lambda_i\geq0$ and $\sum_{i=1}^m\lambda_i=1$, then $z=\sum_{i=1}^m\lambda_i z_i$ is called a convex combination of the $z_i$. If this is unfamiliar, imagine the plane $\mathbb{R}^2$: the convex combinations of two points are precisely the points on the line segment joining them.

&emsp;&emsp;More generally, for a set $T\subset \mathbb{R}^n$, its convex hull $\operatorname{conv}(T)$ is the set of all convex combinations of any finite number of elements of $T$.

&emsp;&emsp;In fact, “any finite number” can be replaced by “at most $n+1$,” because of the classical **Carathéodory theorem**.

> (Carathéodory theorem). Let $T \subset \mathbb{R}^n$. Every point $x\in \operatorname{conv}(T)$ in its convex hull can be expressed as a convex combination of points in $T$, using at most $n+1$ of them.

&emsp;&emsp;The proof is not difficult, but it is not much fun. We will not prove it or use it below; interested readers can look it up. We mention it because we want to consider an extension. If we have to use fewer points in the convex combination, we may not reach every point in the convex hull. How well, then, can we approximate such points? Another theorem gives the answer.

> (<strong>Approximate Carathéodory theorem</strong>). Let $T\subset\mathbb{R}^n$, with the distance between every pair of its points at most $1$. For every point $x\in\operatorname{conv}(T)$ in the convex hull and every positive integer $k$, there are points $x_1,\dots,x_k\in T$, with repetition allowed, such that
>
> $$
> \left\Vert x-\frac 1 k \sum_{j=1}^k x_j\right\Vert \leq \frac {1}{\sqrt k}
> $$

&emsp;&emsp;In other words, we can always find, in $T$, $k$ points whose average approximates $x$, and the approximation is not bad: **the error in Euclidean distance is only $1/\sqrt k$**. The strength of this result is surprising. We impose no control on the shape of $T$, which may be very strange, yet obtain a stable rate of approximation independent of $n$, using only an average—the most special kind of convex combination. Let us see how it is proved.

&emsp;&emsp;Choose any point of $T$ as the new origin. Then $T$ lies inside the unit ball centered at the origin with radius $1$, and every element has norm at most $1$.

&emsp;&emsp;For $x\in \operatorname{conv}(T)$, suppose it can be written as a convex combination of $m$ elements $x_1, \dots, x_m\in T$, with coefficients $\lambda_i$. We will use, from these $m$ elements, $k$ to approximate $x$, but we will choose them randomly rather than deterministically. Let $k$ independent, identically distributed random variables $Z_j(j=1,\dots,k)$ each take, with probability $\lambda_i$, the value $x_i$. By definition,

$$
\mathbb{E}[Z_j] = \sum_{i=1}^m \lambda_i x_i = x
$$

&emsp;&emsp;We therefore use $\frac 1 k \sum_{j=1}^k Z_j$ to approximate $x$, in the spirit of the law of large numbers. Next, calculate the approximation error that we want to control—or rather, its square, which is easier to work with:

$$
\mathbb{E} \left\Vert x-\frac 1 k \sum_{j=1}^k Z_j\right\Vert^2 = \frac 1 {k^2} \mathbb{E} \left\Vert \sum_{j=1}^k (Z_j-x)\right\Vert^2 = \frac 1 {k^2} \sum_{j=1}^k \mathbb{E} \left\Vert  Z_j-x\right\Vert^2
$$

&emsp;&emsp;The second equality simply expands the square. Since the $Z_j-x$ are independent and have expectation $0$, the expected cross terms vanish, just as they did in our first example. The problem is now to calculate $\mathbb{E}\left\Vert Z_j-x\right\Vert^2$. The value of the subscript $j$ does not matter because all the $Z_j$ have the same distribution, so the expression has the same value for every $j$. A simple estimate gives the upper bound:

$$
\mathbb{E} \left\Vert  Z_j-x\right\Vert_2^2 = \mathbb{E}\Vert Z_j\Vert^2 - \Vert \mathbb{E} Z_j\Vert^2\leq 1-\Vert x\Vert^2 \leq 1
$$

&emsp;&emsp;This follows from the fact, noted above, that every element has norm at most $1$. We obtain

$$
\mathbb{E} \left\Vert x-\frac 1 k \sum_{j=1}^k Z_j\right\Vert^2 \leq \frac 1 k
$$

&emsp;&emsp;Therefore, the variables $Z_j$ have some realization $z_j\in T$ that satisfies

$$
\left\Vert x-\frac 1 k \sum_{j=1}^k z_j\right\Vert^2 \leq \frac 1 k
$$

&emsp;&emsp;Taking square roots gives the desired result.

&emsp;&emsp;This proof is also a classic. The method is known as **Maurey's empirical method**, though in spirit I see no essential difference between it and Erdős's probabilistic method.

# Random Matrices and Linear Codes

&emsp;&emsp;Our final example comes from coding theory. It will be a little long, not because it is difficult, but because we first need to introduce several basic definitions.

&emsp;&emsp;A set of binary strings of length $n$, denoted by $C\subset \{0, 1\}^n$, is called a length-$n$ <strong><em>binary code</em></strong>, and its elements are called <strong><em>codewords</em></strong>.

&emsp;&emsp;The number of positions in which two $n$-bit binary strings differ is their <strong><em>Hamming distance</em></strong>, denoted by $d_H$. For example, $x=(0,0,1,1,0)$ and $y=(1,0,1,1,1)$ have Hamming distance $d_H(x,y)=2$ because only their first and last bits differ.

&emsp;&emsp;Define, for a binary code $C$, its minimum Hamming distance $d(C)$ as the smallest Hamming distance between any two of its codewords:

$$
d(C)=\min_{\substack{x,y\in C\\x\neq y}}d_H(x,y).
$$

&emsp;&emsp;Below, we call $d(C)$ simply the Hamming distance of $C$, omitting the word “minimum.”

&emsp;&emsp;A greater Hamming distance means that codewords differ more, which makes it easier to correct transmission errors in communication.

&emsp;&emsp;For fixed $n$, however, as a code $C$ grows in size $|C|$, the Hamming distance $d(C)$ that it can achieve generally decreases. A larger code makes it harder for the codewords to differ substantially; they become “crowded together.” In the most extreme case, if $C=\{0,1\}^n$ contains every binary string, then its Hamming distance is $1$.

&emsp;&emsp;While guaranteeing some Hamming distance $d$, we want a binary code $C$ as large as possible. A larger code means a higher code rate and less redundancy. The question is:

> Given a codeword length $n$ and a desired distance $1\leq d\leq n$, if a binary code $C$ must satisfy $d(C)\geq d$, how large can we guarantee $|C|$ to be?

&emsp;&emsp;An exact answer is not easy. We seek only a reasonably good lower bound: “a $C$ at least this large can always be found.” We do not yet need the probabilistic method; first, consider an elegant volume argument.

&emsp;&emsp;Start with an empty set and repeatedly add codewords. Every new codeword must differ from all existing codewords in at least $d$ positions—that is, have Hamming distance at least $d$ from each of them. Continue until no further codeword can be added, producing a binary code $C$.

&emsp;&emsp;At that point, every binary string $y$ not added to the code differs from some codeword $x\in C$ in at most $d-1$ positions; in other words, $d_H(x, y)\leq d-1$. If it differed from every codeword in at least $d$ positions, it could still be added to $C$, contradicting the fact that no more codewords can be added.

&emsp;&emsp;Let the set of all strings whose Hamming distance from $x$ is at most $d-1$ be $B(x, d-1)\subset \{0, 1\}^n$. The preceding paragraph says that every $y\in \{0, 1\}^n$ belongs to some $B(x, d-1)$ with $x\in C$. Equivalently, all the sets $B(x, d-1)$ cover $\{0, 1\}^n$:

$$
\bigcup_{x\in C} B(x, d-1) = \{0, 1\}^n
$$

&emsp;&emsp;The size of $B(x,d-1)$ is independent of $x$; denote it by $V_n(d-1)$. The set on the left has at most $|C|\cdot V_n(d-1)$ elements, so the covering above requires

$$
|C|\cdot V_n(d-1) \geq 2^n
$$

&emsp;&emsp;The code $C$ constructed this way therefore satisfies

$$
|C| \geq \frac{2^n}{V_n(d-1)}
$$

&emsp;&emsp;We have obtained a concise lower bound for the question above: **the largest $C$ has size at least $\frac{2^n}{V_n(d-1)}$**. The set $B(x,d-1)$ is a “ball” centered at $x$ with radius $d-1$ in Hamming distance. We have just calculated how much volume is needed, at minimum, for a collection of balls to fill the entire space. This classical method is therefore called a “<strong>volume argument</strong>,” and similar arguments are widely used in other problems.

&emsp;&emsp;The volume $V_n(d-1)$ can, of course, be calculated. Consider the size of $B(0, d-1)$: its members are the binary strings containing at most $d-1$ symbols $1$, so the answer is the sum of binomial coefficients $\sum_{j=0}^{d-1}\binom n j$. You may substitute it into the expression above if you wish. In communications, an entropy inequality is often used to estimate the resulting expression further. We do not need that here, so we will leave it in this form.

&emsp;&emsp;Now, at last, the probabilistic part of this example begins. We want our binary code not only to be as large as possible and have as great a Hamming distance as possible, but also to possess a particular structure: all its codewords should be generated by a single matrix. Such a code is called a <strong><em>linear code</em></strong>. Let us define it.

&emsp;&emsp;From this point on, regard $0,1$ not only as symbols but as numbers that can be added and subtracted, with addition performed modulo $2$:

$$
1+1 = 0
$$

&emsp;&emsp;Take a $k\times n$ binary matrix $G$. It encodes a length-$k$ binary string $u\in\{0,1\}^k$ as $uG\in\{0,1\}^n$. All calculations in the matrix multiplication are also performed modulo $2$, so the result remains a binary string, of length $n$.

&emsp;&emsp;The set of all encoded results,
$$
C=\{uG: u\in \{0, 1\}^k\}\subset \{0, 1\}^n
$$
is called a *linear code*.

&emsp;&emsp;A linear code has additional algebraic structure absent from a general binary code and can be encoded by a matrix multiplication. It is a fundamental object in coding and communications. We therefore want to add linearity to our earlier question:

> Given a codeword length $n$ and a desired distance $1\leq d\leq n$, if a linear code $C$ must satisfy $d(C)\geq d$, how large can we guarantee $|C|$ to be? Give a lower bound.

&emsp;&emsp;The previous volume argument no longer works easily because it offers no simple way to guarantee that the constructed $C$ is a linear code. It is not impossible, but it is difficult—or at least too difficult for light, pleasant reading here. We will therefore bring in the probabilistic method. First, however, we need a property of linear codes that simplifies the calculation of Hamming distance.

&emsp;&emsp;Notice first that, with arithmetic modulo $2$, the Hamming distance between $x,y$ is exactly, in $x+y$, the number of $1$s. Computer-science students will recognize this addition as the XOR of binary strings: equal bits give $0$, different bits give $1$, so the number of $1$s is precisely the number of differing positions, hence the Hamming distance. Give “the number, in a binary string $z$, of $1$s” a new name: the **Hamming weight** of $z$, denoted by $w_H(z)$.

&emsp;&emsp;Because a linear code is generated by multiplication with the matrix $G$, the sum of two codewords $uG,vG$ is $uG+vG=(u+v)G$, which is again a codeword. We can therefore rewrite the definition of the Hamming distance of $C$ as

$$
d(C)=\min_{z\in C\setminus \{0\}} w_H(z)
$$

&emsp;&emsp;This is because the Hamming distance between distinct $uG,vG\in C$ is the Hamming weight of $z=(u+v)G\neq 0$, namely $w_H(z)$. Conversely, for any $z\in C\setminus\{0\}$, its Hamming weight is the Hamming distance between $z$ itself and $0\in C$, namely $d_H(z, 0)$. Thus, the two definitions are equivalent. To make the Hamming distance at least $d$, we need only require every nonzero codeword to have Hamming weight at least $d$.

&emsp;&emsp;With this important property in hand, we can introduce the probabilistic method.

&emsp;&emsp;Choose the matrix $G$ at random, making each entry an independent uniform random bit. For any fixed nonzero $u\in\{0,1\}^k$, the product $uG$ is a uniformly random binary string of length $n$, with independent uniform bits. Indeed, every bit of $uG$ is equally likely to be $0$ or $1$, and different bits depend on different columns of $G$, making them independent.

&emsp;&emsp;What is the probability of the bad event that “a random binary string has Hamming weight less than $d$”—that it contains fewer than $d$ symbols $1$? As before, it is the appropriate sum of binomial coefficients divided by the total number of strings:

$$
\Pr ( w_H(uG) < d ) = \frac{1}{2^n} \sum_{j=0}^{d-1}\binom n j
$$

&emsp;&emsp;For simplicity, continue to denote the numerator by $V_n(d-1)$, though we will not use its geometric meaning as the “volume of a ball” here.

&emsp;&emsp;For all $2^k-1$ nonzero input strings, the probability that at least one encoded codeword has Hamming weight less than $d$ can be estimated by

$$
\Pr\left( \bigcup_{u\neq 0} \{w_H(uG)< d\} \right) \leq \sum_{u\neq 0} \Pr \left( w_H(uG) < d \right) = (2^k-1) 2^{-n} V_n(d-1)
$$

&emsp;&emsp;The first inequality is the probabilistic **union bound**, $P(A\cup B)\leq P(A)+P(B)$.

&emsp;&emsp;We know that, as long as this probability is less than $1$, the “bad event is not inevitable.” Hence, there is a fixed $G$ for which every nonzero input string $u\in\{0,1\}^k$ satisfies

$$w_H(uG)\ge d.$$

&emsp;&emsp;To make this probability less than $1$, it is enough for the following condition to hold:

$$
2^k \leq \frac{2^n}{V_n(d-1)}.
$$

&emsp;&emsp;In other words, whenever $k$ and $n$ satisfy this inequality, **there is a $k\times n$ matrix $G$ that gives a linear code with Hamming distance at least $d$; call that code $C$**.

&emsp;&emsp;What is the size of this linear code $C$, denoted by $|C|$? It is $2^k$, because distinct input strings $u, v\in \{0, 1\}^k$ must be mapped by $G$ to distinct results $uG\neq vG$. If $uG=vG$, then modulo-$2$ addition gives $(u+v)G=uG+vG=0$, so $w_H((u+v)G)=0$. But $u+v\neq 0$ is nonzero, contradicting $d(C)=0 < d$. Thus $uG\neq vG$. There are $2^k$ input strings; multiplying them by $G$ produces $2^k$ distinct results, so $|C|=2^k$.

&emsp;&emsp;We have strengthened the requirement to linear codes yet obtained almost the same result as the volume argument, apart from possible rounding and constant differences because a linear code's size must be a power of $2$. This is highly satisfying: we strengthened the conditions at almost no additional cost.

&emsp;&emsp;You may suspect that this nearly cost-free strengthening is possible only because both bounds are so loose. The answer is that we do not know. The result can be improved, but humanity still does not know how good the optimal general binary and linear codes can be, so we do not know whether the same nearly lossless strengthening is possible for optimal codes. The lower bound established here is nevertheless a classic, important benchmark in coding theory, usually included under the **Gilbert–Varshamov bound**.

# Conclusion

&emsp;&emsp;We have presented five examples, and the article is already long enough, so let us stop here. Looking back, these examples span different fields but share a common feature: each allows some room for error, whether in an estimate or an inequality. Exploiting that room within a deterministic proof is not easy. The probabilistic proofs above use it with precision, without wading deeply into complicated structures. They skim lightly across the obstacles and arrive at the result. These are proofs as art.

&emsp;&emsp;Beyond the art, there is technique. Frankly, it may be difficult to extract reusable proof techniques from these few arguments. We see finished, ingenious proofs but not how anyone first thought of them. Some may indeed be products of repeated refinement in modern teaching and were never easy to discover. That is all right. After seeing enough of them, perhaps one day we will find a use for them ourselves. There is no need to study mathematics too instrumentally. May each of us continue to feel its beauty. Let us end with this line:

> If one did nothing seemingly useless, how could one spend this finite life? —[Qing] Xiang Hongzuo
