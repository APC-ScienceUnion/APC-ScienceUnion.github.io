---
layout: post
title: "Mathematics over Coffee: A Glimpse of Erdős's Probabilistic Method"
date: 2026-08-22 19:29:18
lang: en
translation_key: "下午茶时间：Erdős 概率方法的一瞥"
translation_source_sha256: "079196c0db32589751889cd5d849fb2863697633d28793cabcca0b5836dc9898"
permalink: en/2026/08/22/afternoon-tea-a-glimpse-of-erdos-probabilistic-method/
aside: true
comments: false
tags: []
categories: []
cover: '/images/下午茶时间：Erdős 概率方法的一瞥/cover.png'
copyright_author: 'silverxz'
katex: true
---

{% note blue 'fas fa-dice' %}
Must a mathematical proof reach its answer step by step? The mathematician Erdős offered a wonderfully indirect idea: if we can prove that “a random choice has some chance of success,” then we have proved that a solution exists. Pour yourself a coffee and enjoy these proofs as works of art.
{% endnote %}

> Author: silverxz
Reviewed by: phy东西

<img src="/images/%E4%B8%8B%E5%8D%88%E8%8C%B6%E6%97%B6%E9%97%B4%EF%BC%9AErd%C5%91s%20%E6%A6%82%E7%8E%87%E6%96%B9%E6%B3%95%E7%9A%84%E4%B8%80%E7%9E%A5/fig-001-0eb3269b6d.jpg" alt="" />
<center><font size=2px color=grey>Paul Erdős</font></center>
<center><font size=2px color=grey>Image source: zbMATH</font></center>

&emsp;&emsp;Paul Erdős may not be a household name, but nearly everyone in mathematics knows who he was. A prolific and wide-ranging mathematician, he produced remarkable results in number theory, set theory, analysis, geometry, and many other fields. His place in combinatorics is beyond dispute.

&emsp;&emsp;There is no shortage of stories about Erdős: his unusual way of living and doing mathematics, the many forms his brilliance took, and much more. You can read those stories elsewhere; they are not our subject today. Instead, we will look at a fascinating technique that Erdős helped popularize: the **probabilistic method**.

&emsp;&emsp;You may be wondering whether this is simply a technique from probability theory. Why give it such a broad and vague name?

&emsp;&emsp;Not quite. The probabilistic method is not a method *within* probability theory. The idea is to start with a deterministic problem unrelated to probability, deliberately build a probabilistic structure around it, analyze that structure with probabilistic tools, and then use the resulting probabilistic statement to recover the deterministic conclusion we wanted in the first place. Put another way, the method “introduces probabilistic structure into a non-probabilistic problem in order to solve it.” Probability is only the scaffolding, much like an auxiliary line in plane geometry.

&emsp;&emsp;That is exactly what makes the method so striking. How can probability enter a problem that has nothing to do with it? And can it really help?

&emsp;&emsp;We will work through several short, entertaining examples and watch the method in action. Erdős's probabilistic method is usually associated with combinatorics, but its uses extend far beyond that field, so I have chosen examples from several areas. Each one is light enough to serve as dessert and should not be too taxing. The article is long only because the explanations are detailed; it should go by much faster than a typical mathematics article of the same length.

&emsp;&emsp;Some elementary linear algebra and probability will help. Beyond that, the stronger your mathematical background, the more “relaxed and leisurely” the reading will feel. Ideally, you can make a cup of coffee on one or two quiet afternoons and wander pleasantly through the examples. I hope they remind you how beautiful mathematics can be.

# Vector Balancing: The Basic Framework of the Probabilistic Method

&emsp;&emsp;Let us begin with a particularly simple example of what it means to “introduce probabilistic structure into a non-probabilistic problem.”

> Let there be $n$ vectors $v_1,\dots, v_n \in \mathbb{R}^d$, and let $\Vert v\Vert$ denote the length of vector $v$. Prove that there are signs $\varepsilon_i\in\{-1, 1\}$ such that
>
> $$
> \left\|\sum_{i=1}^n\varepsilon_i v_i\right\|^2\leq\sum_{i=1}^n\|v_i\|^2.
> $$

&emsp;&emsp;The task is to balance the vectors by adjusting the coefficients $\varepsilon_i$, keeping the resulting vector $\sum_{i=1}^n\varepsilon_i v_i$ as short as possible. The geometry becomes clear after a moment's thought. Imagine two vectors in $\mathbb{R}^d$. Their sum is relatively short when the angle between them is obtuse and longer when the angle is acute. We therefore choose the coefficients so that each new vector makes a nonacute angle with the sum of the vectors before it.

&emsp;&emsp;The sign of the dot product tells us about the angle between two vectors. Write the dot product of $x,y$ as $\langle x,y\rangle$, and let the sum of the first $k-1$ vectors be

$$
S_{k-1}=\sum_{i=1}^{k-1}\varepsilon_i v_i.
$$

&emsp;&emsp;Of the two choices $\varepsilon_k=\pm 1$, take the one for which $\varepsilon_k\langle S_{k-1},v_k\rangle\leq 0$. This is the coefficient-adjustment step. Then

$$
\begin{aligned}
\|S_k\|^2 &=\|S_{k-1}\|^2+\|v_k\|^2 +2\varepsilon_k\langle S_{k-1},v_k\rangle\\
&\leq \|S_{k-1}\|^2+\|v_k\|^2.
\end{aligned}
$$

&emsp;&emsp;The original statement now follows by induction.

&emsp;&emsp;But you are probably wondering: where was the probabilistic method? Can a proposition this simple, with such a clear interpretation and such a short proof, really have another proof? Let us find out.

&emsp;&emsp;Treat the $\varepsilon_i$ as <strong>independent uniform random variables</strong> on $\{-1,1\}$. The square of a vector's length is its dot product with itself, so

$$
\mathbb E\left\|\sum_i\varepsilon_i v_i\right\|^2 = \mathbb E\left\langle\sum_i\varepsilon_i v_i, \sum_j\varepsilon_j v_j\right\rangle = \mathbb E \sum_{i,j}\varepsilon_i\varepsilon_j \langle v_i,v_j\rangle = \sum_i\|v_i\|^2.
$$

&emsp;&emsp;The last equality uses the independence of the $\varepsilon_i$. When $i\neq j$, $\mathbb{E} \left[\varepsilon_i\varepsilon_j\right]=0$; when $i=j$, $\mathbb{E}\left[\varepsilon_i\varepsilon_j\right]=\mathbb{E}\left[\varepsilon_i^2\right]= 1$.

&emsp;&emsp;Under a random assignment of the $\varepsilon_i$, the average value of $\left\|\sum_i\varepsilon_i v_i\right\|^2$ is $\sum_i\|v_i\|^2.$ There must therefore be at least one fixed assignment for which $\left\|\sum_i\varepsilon_i v_i\right\|^2$ is no greater than $\sum_i\|v_i\|^2$: not every value can lie above the average. That completes the proof. It does not construct the particular values of the $\varepsilon_i$, but it does prove that the values we need exist.

&emsp;&emsp;The two proofs are almost “equally simple,” yet they proceed in entirely different ways. **The second shows the basic framework of the probabilistic method.** First, randomize the deterministic problem by treating the $\varepsilon_i$ as random variables. Second, analyze the new construction with probabilistic tools. Here we take an expectation and use independence to dispose of every cross term with $i\neq j$ in one stroke. Finally, convert the probabilistic statement back into a deterministic one. An almost trivial observation such as “not every value can exceed the average” guarantees that the desired value exists. That existence statement is completely deterministic and no longer depends on the probabilistic structure used to reach it.

&emsp;&emsp;But... but... who would ever think to solve the problem this way? The question is no longer just “Why does this work?” but “How did anyone come up with it?” Good mathematics teaching should normally do more than present a proof. It should unpack the motivation and technique so students can master the idea and apply it elsewhere. But as the title and introduction suggest, this is coffee-break reading, not a lesson burdened with too many educational duties. I would rather you read it as a mathematical joke book. We will enjoy the examples and their proofs without digging deeply into their motivations, extensions, and so forth.

# Random Translation and Covering with Unit Disks

&emsp;&emsp;Our second example is a problem posed and solved in 2008 by the Japanese “puzzle designer” Naoki Inaba:

> Prove that any given set of 10 points in the plane can be covered by a collection of pairwise disjoint <strong>unit disks</strong>, meaning disks of radius $1$.

&emsp;&emsp;Throughout this section, “disjoint” means that the interiors of the disks do not overlap. The disks may be tangent; tangency does not count as an intersection here.

&emsp;&emsp;At first glance, it is hard to know where to begin. With enough points, one can imagine an arrangement in which, after we place several disks and cover several points, every remaining point sits squarely in a gap between the disks. Covering one of those points would then force a new disk to overlap an existing one. Any proof that places the disks one at a time would have to show that this situation can always be resolved, which is clearly difficult.

&emsp;&emsp;Now let us see what the probabilistic method can do. Suppose we place disks only in a fixed, regular pattern. This limits our choices but makes the arrangement much easier to analyze. The most obvious pattern puts a unit disk at every even lattice point, meaning every point with coordinates $(2a,2b)$ for $a,b\in\mathbb{Z}$. The plane then looks like this:

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/bare_square.png" alt="" />

&emsp;&emsp;This cannot be our final strategy. Used as is, the pattern will never cover the star-shaped gaps between the disks. Instead, translate all the disks together by a random vector $v=(x,y)$: add $x$ to the horizontal coordinate and $y$ to the vertical coordinate of every center. The vector $v$ is random, but all the disks move by the same $v$ rather than independently.

&emsp;&emsp;Because the arrangement is regular and periodic, a horizontal translation by $x$ is no different from one by $x+2$, and the same is true vertically. We can therefore choose $v$ uniformly at random from the $2\times2$ square $\{(x,y):0\leq x,y\leq2\}$.

&emsp;&emsp;Positions are relative, so randomly translating every disk is equivalent to translating the points we want to cover by $-v$. A point is covered if its translated position falls inside a disk and uncovered otherwise. Because $v$ is uniform on a $2\times 2$ square, the translated point is also uniform on some $2\times 2$ square. Its probability of being covered is the fraction of that square occupied by disks. For either square shown below, this probability is the blue area divided by the square's total area, $4$.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/square_2.png" alt="" />

&emsp;&emsp;No matter where the $2\times 2$ square lies, its total area of intersection with the disks is the same. The disk pattern, as noted above, has period $2$ in both directions. Imagine sliding the square across the plane: whatever leaves through one side reenters in identical form through the other, so the total intersecting area cannot change. We need only calculate the tidiest case, shown on the left. Four quarter-circles give a total area of $\pi$, or a fraction $\pi /4$ of the square.

&emsp;&emsp;In short, when we translate all the disks together by a random vector $v$, **every point in the plane has probability $\pi/4$ of being covered by a disk**.

&emsp;&emsp;This observation already lets us prove a weaker result by the probabilistic method: any given set of $4$ points in the plane can be covered by pairwise disjoint unit disks. Under the random translation above, each point is covered with probability $\pi/4$, so the expected number of covered points is

$$
4\times \frac{\pi}{4} = \pi > 3
$$

&emsp;&emsp;You may wonder why multiplying $4$ by the probability $\pi/4$ gives the expectation. Let us unpack the calculation for anyone who needs it; readers already familiar with the technique can skip ahead. The tool is an “<strong>indicator random variable</strong>.” Let $I_1$ record whether the first point is covered after the random translation: $I_1=1$ if it is covered and $I_1=0$ otherwise. The variable indicates whether the event occurred, hence the name. Define $I_2,I_3,I_4$ in the same way for the other three points. The total number of covered points is the sum of these four variables and is itself a random variable:

$$
X = \sum_{i=1}^4 I_i
$$

&emsp;&emsp;The expected number of covered points is therefore $\mathbb{E}[X]=\mathbb{E}[\sum_{i=1}^4 I_i]$. By linearity of expectation, we can move the sum outside:

$$
\mathbb{E}[X] = \sum_{i=1}^4 \mathbb{E}[I_i]
$$

&emsp;&emsp;From the definition, $\mathbb{E}[I_i]=1\times\frac{\pi}{4}+0\times\left(1-\frac{\pi}{4}\right)=\frac{\pi}{4}$. Therefore,

$$
\mathbb{E}[X]=4\times \frac{\pi}{4} = \pi.
$$

&emsp;&emsp;That is the full calculation. The variables $I_i$ are certainly not independent, but linearity of expectation lets us add their expectations without requiring independence. We will use the same technique again later. For now, the expected number of covered points is $\pi>3$.

&emsp;&emsp;Some translation $v$ must therefore cover more than $3$ points; otherwise, the expectation could not exceed $3$. Because the number of covered points is an integer, “more than $3$” means all $4$ points. This proves the weaker statement.

&emsp;&emsp;The original problem, of course, asks about $10$ points rather than $4$. What can we do? Notice that the argument uses only the periodicity of the disk arrangement. If we keep that periodicity while packing the disks more densely, thereby increasing the probability $\pi/4$, the same method will give a stronger result. Consider the denser honeycomb pattern below. It remains periodic in two directions, one horizontal and the other at an angle of $60$ degrees to the horizontal.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/best.png" alt="" />

&emsp;&emsp;The pattern is still periodic, so the parallelogram's area of intersection with the disks remains constant as we slide it. As the figure shows, that area is again $\pi$, the area of one complete circle, because the pieces inside the parallelogram can be reassembled into a circle. The proportion has changed, however: the parallelogram has area only $2\sqrt3$, so the disks occupy a fraction $\frac{\pi}{2\sqrt3}$.

&emsp;&emsp;Once again, translate all the disks by a random vector $v$, now chosen uniformly from the parallelogram shown above. A single point is covered with probability $\frac{\pi}{2\sqrt3}$, so among 10 points the expected number covered is

$$
10\times \frac{\pi}{2\sqrt 3} \approx 9.07 > 9
$$

&emsp;&emsp;As before, some translation must cover more than $9$ points, which means **all $10$ points**. The result follows.

&emsp;&emsp;The new arrangement proves the claim for $10$ points. Could an even denser one prove a stronger result? No: the honeycomb pattern already achieves the greatest possible density for a packing of disjoint unit disks in the plane. No denser arrangement exists; this is **Thue's theorem**.

&emsp;&emsp;A stronger result is still possible. Greg Aloupis and his coauthors proved that the statement remains true for $12$ points, but their result cannot be obtained simply by changing the arrangement and repeating the argument above.

&emsp;&emsp;The exact number of points needed to guarantee that some set cannot be covered remains unknown. A counterexample with $50$ points is known, but the territory between $12$ and $50$ is still waiting to be explored.

# Random Selection and Independent Sets in Graphs

&emsp;&emsp;Our third example comes from <strong>graph theory</strong>, and only the basics are needed. A <strong>graph</strong> consists of <strong>vertices</strong> and the <strong>edges</strong> that join them. Denote the vertex set by $V$, the edge set by $E$, and the graph by $G=(V,E)$.

&emsp;&emsp;A set of vertices $S\subset V$ is called an <strong><em>independent set</em></strong> if no two vertices in $S$ are joined by an edge. Its size is $|S|$.

&emsp;&emsp;The figure below gives an example. The points are vertices and the lines between them are edges. The gray vertices form an independent set, though certainly not the only one.

<img src="/images/下午茶时间：Erdős 概率方法的一瞥/graph-independent-set.png" alt="" />

<center><font size=2px color=grey>Dots represent vertices, and line segments joining them represent edges. The gray vertices form the independent set <em>S</em>.</font></center>

&emsp;&emsp;Finding a graph's maximum independent set is a classic problem in graph theory. Let $n=|V|,m=|E|$. Can we give a lower bound for the maximum independent-set size $\alpha(G)$ in terms of $n,m$? In other words, if a graph has $n$ vertices and $m$ edges, how large must its maximum independent set be?

&emsp;&emsp;This looks much harder than the preceding problem. A graph may have any structure, and the “worst” structures get in the way of a lower-bound estimate. But what do those worst cases look like? Following that question seems likely to plunge us into the depths of graph theory. Let us take a different route and see how neatly the probabilistic method produces an estimate.

&emsp;&emsp;Include each vertex in a set $S$, independently, with probability $p$. Let $X=|S|$ be the number of selected vertices, and let $Y$ be the number of edges between them. Both $X$ and $Y$ are random variables.

&emsp;&emsp;When $Y=0$, $S$ is independent; otherwise, it is not. We need an independent set before the probabilistic argument can tell us that “an independent set of size $\dots$ exists.” So what now? We use the **alteration method**, also described here as the “<strong>deletion-and-modification method</strong>”: if a random construction does not directly produce the object we want, alter it until it does. If $S$ is not independent, simply make it independent.

&emsp;&emsp;For each of the $Y$ edges inside $S$, choose one endpoint. Delete the chosen vertices from $S$ and call the result $S'$. Because the same vertex may be chosen more than once, we delete at most $Y$ vertices. The set $S'$ must be independent, and its size is at least $X-Y$. If $X<Y$, nothing goes wrong; this remains a valid, though trivial, lower bound.

&emsp;&emsp;As before, take an expectation and calculate $\mathbb{E}[X-Y]$. We immediately have $\mathbb{E}[X]=pn$, but what about $\mathbb{E}[Y]$? Use the indicator-variable technique from the previous example. Define $I_e$ to equal $1$ when edge $e$ is selected and $0$ otherwise. Linearity of expectation then gives

$$
\mathbb{E}[Y] = \sum_{e\in E} \mathbb{E}[I_e]
$$

&emsp;&emsp;The value $\mathbb{E}[I_e]$ is simply the probability that edge $e$ is selected. This happens exactly when both of its endpoints are selected. Because the vertices are chosen independently, the probability is $p^2$. Thus $\mathbb{E}[I_e]=p^2$ and $\mathbb{E}[Y]=p^2m$, so

$$\mathbb E[X-Y]=pn-p^2m.$$

&emsp;&emsp;This proves that **there is an independent set of size at least $pn-p^2 m$**; in other words, $\alpha(G)\ge pn-p^2m$. We are free to choose $p$, so we can take the best value for the given $n,m$. When $m > 0$, the expression is a quadratic function of $p$ whose maximum occurs at $p=\frac{n}{2m}$. Accounting for the probabilistic constraint $p\in [0, 1]$ and the boundary case $m=0$ gives the piecewise result

$$
\alpha(G)\ge\begin{cases}
n-m, & m\le \dfrac n2,\\[6pt]
\dfrac{n^2}{4m}, & m\ge \dfrac n2.
\end{cases}
$$

&emsp;&emsp;That was not too complicated, was it? But is the bound any good?

&emsp;&emsp;The probabilistic method often produces startling results, but it is no universal cure, and it does not automatically give a good answer. The quality of the result depends on the problem itself and on how the method is used. Our estimate is not bad, but it is not especially good either. The construction is still too crude.

&emsp;&emsp;Try a different random construction. Order all the vertices at random, and add a vertex $v\in V$ to $S$ if it appears before all its neighbors. The rule is simple and elegant, and the resulting $S$ is already independent. Of the two endpoints of any edge, only the earlier one can possibly enter $S$, so no two vertices in $S$ are joined by an edge.

&emsp;&emsp;As before, define an indicator random variable $I_v$ for each vertex $v\in V$, recording whether it enters $S$. Then $\mathbb{E}|S|=\sum_{v\in V}\mathbb{E} [I_v]$. A vertex's inclusion depends on its neighbors. Let $d(v)$ be the number of vertices adjacent to $v$. The vertex $v$ and its $d(v)$ neighbors are all equally likely to appear first, so $v$ is selected precisely when it comes first among these $d(v)+1$ vertices, an event with probability $1/(1+d(v))$. Therefore,

$$
\mathbb{E}|S|= \sum_{v\in V}\frac1{1+d(v)}.
$$

&emsp;&emsp;Because the expectation equals this quantity, at least one independent set must be this large. Hence,

$$
\alpha(G)\ge \sum_{v\in V}\frac1{1+d(v)}.
$$

&emsp;&emsp;This result is never weaker than the previous one and is much stronger in many cases. The proof needs only a case analysis and the **Cauchy–Schwarz inequality**. We have not assumed that readers know the inequality, however, and the proof would take us away from our subject, so we will omit it. The new and better result is important enough to have a name: the **Caro–Wei bound** on the size of a maximum independent set.

&emsp;&emsp;We will not analyze the bound in depth. Readers who know or enjoy graph theory can look for the deeper reason the two methods differ: identify the cases in which the first estimate loses sharpness, then see how the second construction avoids those losses. Our point here is simpler. “The probabilistic method” may give you a result, but it does not guarantee a good one. The better the probabilistic structure fits the problem, the better the result is likely to be.

# Random Sampling and the Approximate Carathéodory Theorem

&emsp;&emsp;Graph theory offers many more examples, including Ramsey numbers, probably the one mentioned most often, and other problems in graph coloring. Those examples tend to be less concise, so we will leave graph theory after this one and visit some other fields.

&emsp;&emsp;Our next example comes from Roman Vershynin's textbook *High-Dimensional Probability*.

&emsp;&emsp;We first need the ideas of a **convex combination** and a **convex hull**. A convex combination of $m$ points $z_1,\dots,z_m\in\mathbb{R}^n$ is a linear combination with nonnegative coefficients that sum to $1$. Thus, if $\lambda_i\geq0$ and $\sum_{i=1}^m\lambda_i=1$, then $z=\sum_{i=1}^m\lambda_i z_i$ is a convex combination of the $z_i$. If the definition is unfamiliar, picture the plane $\mathbb{R}^2$: the convex combinations of two points are exactly the points on the line segment between them.

&emsp;&emsp;More generally, the convex hull $\operatorname{conv}(T)$ of a set $T\subset \mathbb{R}^n$ consists of every convex combination of finitely many elements of $T$.

&emsp;&emsp;In fact, the classical **Carathéodory theorem** lets us replace “finitely many” with “at most $n+1$.”

> (Carathéodory theorem). Let $T \subset \mathbb{R}^n$. Every point $x\in \operatorname{conv}(T)$ can be expressed as a convex combination of at most $n+1$ points in $T$.

&emsp;&emsp;The proof is not difficult, but it is not much fun either. We will neither prove nor use it here; interested readers can look it up. I mention it because of a natural extension. If we must use fewer points in the convex combination, we may no longer be able to reach every point in the convex hull. How closely can we approximate them instead? Another theorem answers that question.

> (<strong>Approximate Carathéodory theorem</strong>). Let $T\subset\mathbb{R}^n$, and suppose every pair of points in $T$ is at distance at most $1$. For every $x\in\operatorname{conv}(T)$ and every positive integer $k$, there are points $x_1,\dots,x_k\in T$, with repetition allowed, such that
>
> $$
> \left\Vert x-\frac 1 k \sum_{j=1}^k x_j\right\Vert \leq \frac {1}{\sqrt k}
> $$

&emsp;&emsp;In other words, we can always find $k$ points in $T$ whose average approximates $x$, and the approximation is quite good: **the error in Euclidean distance is only $1/\sqrt k$**. The result is surprisingly strong. We place no restrictions on the shape of $T$, which may be very strange, yet obtain a stable rate of approximation independent of $n$. Better still, we use only an average, the most special kind of convex combination. Let us see the proof.

&emsp;&emsp;Choose any point in $T$ as the new origin. The entire set $T$ then lies inside the unit ball centered at that origin, so every element has norm at most $1$.

&emsp;&emsp;Take $x\in \operatorname{conv}(T)$ and suppose it is a convex combination of $m$ elements $x_1, \dots, x_m\in T$, with coefficients $\lambda_i$. We will approximate $x$ using $k$ of these $m$ elements, chosen randomly rather than deterministically. Let $Z_j$ for $j=1,\dots,k$ be independent, identically distributed random variables, each taking the value $x_i$ with probability $\lambda_i$. By definition,

$$
\mathbb{E}[Z_j] = \sum_{i=1}^m \lambda_i x_i = x
$$

&emsp;&emsp;In the spirit of the law of large numbers, we use $\frac 1 k \sum_{j=1}^k Z_j$ to approximate $x$. We next calculate the approximation error we want to control, or rather its square, which is easier to handle:

$$
\mathbb{E} \left\Vert x-\frac 1 k \sum_{j=1}^k Z_j\right\Vert^2 = \frac 1 {k^2} \mathbb{E} \left\Vert \sum_{j=1}^k (Z_j-x)\right\Vert^2 = \frac 1 {k^2} \sum_{j=1}^k \mathbb{E} \left\Vert  Z_j-x\right\Vert^2
$$

&emsp;&emsp;The second equality comes from expanding the square. The variables $Z_j-x$ are independent and have expectation $0$, so the expected cross terms vanish, just as they did in our first example. It remains to calculate $\mathbb{E}\left\Vert Z_j-x\right\Vert^2$. The index $j$ does not matter because all the $Z_j$ have the same distribution. A simple estimate gives the upper bound:

$$
\mathbb{E} \left\Vert  Z_j-x\right\Vert_2^2 = \mathbb{E}\Vert Z_j\Vert^2 - \Vert \mathbb{E} Z_j\Vert^2\leq 1-\Vert x\Vert^2 \leq 1
$$

&emsp;&emsp;Here we have used the fact that every element has norm at most $1$. It follows that

$$
\mathbb{E} \left\Vert x-\frac 1 k \sum_{j=1}^k Z_j\right\Vert^2 \leq \frac 1 k
$$

&emsp;&emsp;There must therefore be some realization $z_j\in T$ of the variables $Z_j$ for which

$$
\left\Vert x-\frac 1 k \sum_{j=1}^k z_j\right\Vert^2 \leq \frac 1 k
$$

&emsp;&emsp;Taking square roots gives exactly the desired result.

&emsp;&emsp;This, too, is a classic proof. The technique is known as **Maurey's empirical method**, though in spirit I see no essential difference between it and Erdős's probabilistic method.

# Random Matrices and Linear Codes

&emsp;&emsp;Our final example comes from coding theory. It runs a little long, not because it is difficult, but because we first need several basic definitions.

&emsp;&emsp;A set $C\subset \{0, 1\}^n$ of length-$n$ binary strings is called a length-$n$ <strong><em>binary code</em></strong>. Its elements are called <strong><em>codewords</em></strong>.

&emsp;&emsp;The <strong><em>Hamming distance</em></strong> between two $n$-bit binary strings is the number of positions in which they differ; denote it by $d_H$. For example, $x=(0,0,1,1,0)$ and $y=(1,0,1,1,1)$ have Hamming distance $d_H(x,y)=2$ because only the first and last bits differ.

&emsp;&emsp;For a binary code $C$, define its minimum Hamming distance $d(C)$ to be the smallest Hamming distance between any two distinct codewords:

$$
d(C)=\min_{\substack{x,y\in C\\x\neq y}}d_H(x,y).
$$

&emsp;&emsp;From now on, we will call $d(C)$ simply the Hamming distance of $C$ and omit the word “minimum.”

&emsp;&emsp;A larger Hamming distance means greater separation between codewords, which makes transmission errors easier to correct.

&emsp;&emsp;For fixed $n$, however, the achievable Hamming distance $d(C)$ generally decreases as the code's size $|C|$ grows. In a larger code, it is harder to keep the codewords far apart; they become “crowded together.” At the extreme, if $C=\{0,1\}^n$ contains every binary string, its Hamming distance is $1$.

&emsp;&emsp;We want a binary code $C$ to be as large as possible while maintaining a given Hamming distance $d$. A larger code means a higher code rate and less redundancy. The question is:

> Given a codeword length $n$ and a desired distance $1\leq d\leq n$, if a binary code $C$ must satisfy $d(C)\geq d$, what lower bound can we guarantee for $|C|$?

&emsp;&emsp;The exact answer is not easy to find. We seek only a reasonably good lower bound, a statement that “a $C$ at least this large can always be found.” We do not need the probabilistic method yet. First, consider an elegant volume argument.

&emsp;&emsp;Start with an empty set and add codewords one by one. Each new codeword must differ from every existing codeword in at least $d$ positions, meaning it must be at Hamming distance at least $d$ from each one. Continue until no more codewords can be added. The result is a binary code $C$.

&emsp;&emsp;At that point, every binary string $y$ outside the code must differ from some codeword $x\in C$ in at most $d-1$ positions; that is, $d_H(x, y)\leq d-1$. If $y$ differed from every codeword in at least $d$ positions, we could still add it to $C$, contradicting the fact that the construction had stopped.

&emsp;&emsp;Let $B(x, d-1)\subset \{0, 1\}^n$ be the set of all strings at Hamming distance at most $d-1$ from $x$. The preceding paragraph says that every $y\in \{0, 1\}^n$ belongs to some $B(x, d-1)$ with $x\in C$. Equivalently, the sets $B(x, d-1)$ cover all of $\{0, 1\}^n$:

$$
\bigcup_{x\in C} B(x, d-1) = \{0, 1\}^n
$$

&emsp;&emsp;The size of $B(x,d-1)$ does not depend on $x$; denote it by $V_n(d-1)$. The union on the left has at most $|C|\cdot V_n(d-1)$ elements, so the covering requires

$$
|C|\cdot V_n(d-1) \geq 2^n
$$

&emsp;&emsp;The code $C$ produced by this construction therefore satisfies

$$
|C| \geq \frac{2^n}{V_n(d-1)}
$$

&emsp;&emsp;This gives a concise lower bound for our question: **the largest $C$ has size at least $\frac{2^n}{V_n(d-1)}$**. In the Hamming metric, $B(x,d-1)$ is a “ball” centered at $x$ with radius $d-1$. We have just calculated the minimum total volume needed for a collection of such balls to fill the entire space. This classical method is therefore called a “<strong>volume argument</strong>,” and similar arguments appear in many other problems.

&emsp;&emsp;We can, of course, calculate the volume $V_n(d-1)$. The members of $B(0, d-1)$ are the binary strings containing at most $d-1$ ones, so its size is the sum of binomial coefficients $\sum_{j=0}^{d-1}\binom n j$. You can substitute this into the expression above if you wish. In communications, an entropy inequality is often used to estimate the result further. We do not need that step here, so we will leave the bound in its present form.

&emsp;&emsp;Now, at last, we reach the probabilistic part of the example. We want our binary code not only to be as large as possible and have as great a Hamming distance as possible, but also to have a particular structure: every codeword should be generated by a single matrix. Such a code is called a <strong><em>linear code</em></strong>. Here is the definition.

&emsp;&emsp;From this point on, treat $0,1$ not just as symbols but as numbers that can be added and subtracted, with arithmetic performed modulo $2$:

$$
1+1 = 0
$$

&emsp;&emsp;Take a $k\times n$ binary matrix $G$. It encodes a length-$k$ binary string $u\in\{0,1\}^k$ as $uG\in\{0,1\}^n$. Every operation in the matrix multiplication is performed modulo $2$, so the result is still a binary string, now of length $n$.

&emsp;&emsp;The set of all possible encoded results,
$$
C=\{uG: u\in \{0, 1\}^k\}\subset \{0, 1\}^n
$$
is a *linear code*.

&emsp;&emsp;A linear code has algebraic structure that a general binary code lacks, and encoding reduces to a matrix multiplication. Linear codes are fundamental objects in coding theory and communications, so let us add linearity to our earlier question:

> Given a codeword length $n$ and a desired distance $1\leq d\leq n$, if a linear code $C$ must satisfy $d(C)\geq d$, what lower bound can we guarantee for $|C|$?

&emsp;&emsp;The previous volume argument no longer works easily because it gives us no simple way to guarantee that the resulting $C$ is linear. A volume proof is not impossible, but it is difficult, or at least too difficult for light reading here. So we will bring in the probabilistic method. First, however, we need a property of linear codes that simplifies the Hamming-distance calculation.

&emsp;&emsp;Under arithmetic modulo $2$, the Hamming distance between $x,y$ is exactly the number of ones in $x+y$. Computer-science students will recognize this addition as bitwise XOR: equal bits produce $0$ and different bits produce $1$, so the number of ones is precisely the number of positions where the strings differ. We give “the number of ones in a binary string $z$” a name: the **Hamming weight** of $z$, denoted by $w_H(z)$.

&emsp;&emsp;Because matrix $G$ generates a linear code, the sum of two codewords $uG,vG$ is $uG+vG=(u+v)G$, which is itself a codeword. We can therefore rewrite the Hamming distance of $C$ as

$$
d(C)=\min_{z\in C\setminus \{0\}} w_H(z)
$$

&emsp;&emsp;Indeed, the Hamming distance between distinct $uG,vG\in C$ is the Hamming weight $w_H(z)$ of $z=(u+v)G\neq 0$. Conversely, for any $z\in C\setminus\{0\}$, its Hamming weight is the Hamming distance $d_H(z, 0)$ between $z$ and $0\in C$. The two definitions are therefore equivalent. To make the Hamming distance at least $d$, we need only ensure that every nonzero codeword has Hamming weight at least $d$.

&emsp;&emsp;With this important property in hand, we can finally use the probabilistic method.

&emsp;&emsp;Choose $G$ at random, with every entry an independent uniform random bit. For any fixed nonzero $u\in\{0,1\}^k$, the product $uG$ is a uniformly random binary string of length $n$ whose bits are independent and uniform. Every bit of $uG$ is equally likely to be $0$ or $1$, and different bits depend on different columns of $G$, so they are independent.

&emsp;&emsp;What is the probability of the bad event that “a random binary string has Hamming weight less than $d$,” meaning that it contains fewer than $d$ ones? As before, it is the appropriate sum of binomial coefficients divided by the total number of strings:

$$
\Pr ( w_H(uG) < d ) = \frac{1}{2^n} \sum_{j=0}^{d-1}\binom n j
$$

&emsp;&emsp;For convenience, continue to call the numerator $V_n(d-1)$, although we will not use its geometric interpretation as the “volume of a ball” here.

&emsp;&emsp;Across all $2^k-1$ nonzero input strings, we can estimate the probability that at least one encoded codeword has Hamming weight less than $d$ by

$$
\Pr\left( \bigcup_{u\neq 0} \{w_H(uG)< d\} \right) \leq \sum_{u\neq 0} \Pr \left( w_H(uG) < d \right) = (2^k-1) 2^{-n} V_n(d-1)
$$

&emsp;&emsp;The first inequality is the **union bound** from probability, $P(A\cup B)\leq P(A)+P(B)$.

&emsp;&emsp;As long as this probability is less than $1$, the “bad event is not inevitable.” There must then be a fixed $G$ for which every nonzero input string $u\in\{0,1\}^k$ satisfies

$$w_H(uG)\ge d.$$

&emsp;&emsp;The following condition is sufficient to make the probability less than $1$:

$$
2^k \leq \frac{2^n}{V_n(d-1)}.
$$

&emsp;&emsp;In other words, whenever $k$ and $n$ satisfy this inequality, **there is a $k\times n$ matrix $G$ that produces a linear code with Hamming distance at least $d$; call that code $C$**.

&emsp;&emsp;How large is this linear code $C$? Its size $|C|$ is $2^k$, because $G$ must map distinct input strings $u, v\in \{0, 1\}^k$ to distinct results $uG\neq vG$. If $uG=vG$, then addition modulo $2$ would give $(u+v)G=uG+vG=0$, and hence $w_H((u+v)G)=0$. But $u+v\neq 0$, contradicting the requirement that every nonzero input produce a codeword of Hamming weight at least $d$. Thus $uG\neq vG$. There are $2^k$ input strings, and multiplying them by $G$ produces $2^k$ distinct results, so $|C|=2^k$.

&emsp;&emsp;Even after strengthening the requirement from general binary codes to linear codes, we have obtained almost the same result as the volume argument. The only possible differences come from rounding and constants, because a linear code's size must be a power of $2$. This is deeply satisfying: we strengthened the conditions at almost no extra cost.

&emsp;&emsp;You may suspect that this nearly cost-free strengthening is possible only because both bounds are loose. The answer is that we do not know. The result can be improved, but we still do not know how good optimal general binary codes and optimal linear codes can be. Nor do we know whether the same nearly lossless strengthening is possible for optimal codes. Even so, the lower bound proved here is a classic and important benchmark in coding theory, usually grouped under the **Gilbert–Varshamov bound**.

# Conclusion

&emsp;&emsp;Five examples are enough for an article already this long, so let us stop here. Although they come from different fields, the examples share one feature: each leaves some margin for error, whether in an estimate or an inequality. That margin is difficult to exploit in a deterministic proof. The probabilistic proofs above use it precisely without wading deep into complicated structures. They touch the obstacles lightly, clear them, and reach the result. These are proofs as art.

&emsp;&emsp;Beyond the art, there is technique. To be honest, extracting reusable proof techniques from these few arguments may be difficult. We see ingenious proofs in their finished form, not the process by which anyone first discovered them. Some may be products of repeated refinement in modern teaching and may never have been easy to find. That is all right. If we see enough of them, perhaps one day we will find a use for them ourselves. Mathematics need not be studied too instrumentally. May each of us continue to feel its beauty. Let us end with this line:

> Without doing a few seemingly useless things, how could one pass this finite life? —[Qing] Xiang Hongzuo
