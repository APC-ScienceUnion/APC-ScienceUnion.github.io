---
layout: post
title: "Is Pi Always 3.14...?"
date: '2023-04-24 08:38:50'
lang: en
translation_key: "圆周率一定是3.14...吗？"
translation_source_sha256: "23d6043d9ab9c8448c9764df67cf1eca633bd8c7932e4ae7fc3748a11e2302fc"
permalink: en/2023/04/24/is-pi-always-3-14/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/cover-20dc03ac97.jpg
copyright_author: 'Delta'
katex: true
---

> Author: $\Delta\delta Delta$
Reviewer: 白烟

&emsp;&emsp;Years ago, a science-fiction story titled “Pythagoras: 2.013” became an online sensation, and people still remember it today. A passage at the end invites the imagination to wander:

> “Do not judge their intelligence from our point of view. Perhaps our own civilization also exists within some larger region of distorted spacetime. Don’t you find the value of pi, *3.1416*, an exceedingly strange number too?”

&emsp;&emsp;The story does, in fact, contain many flaws, but that does not diminish its literary value. It genuinely inspired many people to study science and mathematics. Even today, it gives us a useful starting point for a brief popular account of the value of pi.

&emsp;&emsp;Returning to that evocative line, **is pi, $\pi = 3.1415926 \dots$, really so strange? Does it truly have that value because spacetime is distorted**?

&emsp;&emsp;The answer to both questions is <font color=red>**no**</font>. An irrational number should not be condemned on aesthetic grounds simply because it follows no discernible pattern. That would be terribly unfair. Can anyone reduce any work of art to a single pattern? <font color=grey>**(Voice offstage: AI ART!!! Machines can draw only because we found the “pattern” behind art, right?)**</font> But the parameters that define those AIs do not follow a pattern either, do they? It is the year 3202—surely everyone knows by now that neural-network algorithms are black boxes?

&emsp;&emsp;The second question is even more far-fetched. As everyone knows, our familiar $3.14\dots$ is calculated from a circle on a plane. What is this plane? It is the mathematical two-dimensional Euclidean space. To define it, we need only take pairs of numbers from the set of real numbers and supply a formula for calculating the “distance” between the pairs $(x, y)$. Spacetime may twist and turn as wildly as it likes, but that changes only a physical “plane.” A tabletop that looks flat in everyday life, for example, is actually curved; spacetime curvature merely makes it appear flat, and so forth. A mathematical plane, however, is defined. Nothing in reality can, or ever could, alter a mathematical concept.

&emsp;&emsp;As the saying goes, the person who tied the bell must untie it. If we really want to change pi, we can do so only by changing the mathematical definition. We will still conduct the following discussion on circles in the real plane: a point is specified by exactly two numbers, both drawn from the real numbers. What, then, remains open to change?

&emsp;&emsp;Exactly: we still have to provide the formula for calculating “distance.” In the second year of graduate school, we encountered the famous **distance formula between two points $(x_1, y_1), (x_2, y_2)$**:

$$d_2 = ((x_1 - x_2)^2 + (y_1 - y_2)^2 )^{\frac{1}{2}}.$$

&emsp;&emsp;Meanwhile, back in first grade, our teachers had already introduced the **Manhattan distance** so often used in computing: add the vertical difference between the points to their east–west difference. In symbols, it looks like this:

$$d_1 = |x_1 - x_2| + |y_1 - y_2|.$$

&emsp;&emsp;Fresh from hearing that a lack of regularity should not be held against something aesthetically, you remain unconvinced and immediately begin searching for an elegant pattern. Brimming with confidence, you propose the following distance formula for $p$:

$$d_p = (|x_1 - x_2|^p + |y_1 - y_2|^p )^{\frac{1}{p}}.$$

&emsp;&emsp;Faced with a reckless conclusion reached by a mixture of guessing and bluffing, I can only say...:

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-001-8bef380973.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;That is right: this was the lesson you slept through in your final year of kindergarten. A function (or functional) that calculates distance in this way is called a “$p$-norm.”

&emsp;&emsp;Your next question is: how can this distance formula change pi? Friends, let us look at the circle in the distance.

&emsp;&emsp;Once the distance formula changes, the first thing to change is the shape of the so-called “circle.” Let us put its center at the origin and take its radius to be $1$. The equation constraining the circle is then:

$$C_p : (|x|^p + |y|^p )^{\frac{1}{p}} = 1.$$

&emsp;&emsp;Under the more familiar Manhattan distance, what shape does the “circle” become?

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-002-d09a167b7c.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;It becomes a square rotated by $45\degree$! Under this definition of distance, its circumference is $C_1 = a \times (1 + 1) = 8$, so if we write pi as $\pi _1 = \frac{C_1}{2} = 4$! It is not only different from the original $3.14\dots$; it is not even irrational anymore, having transformed into an integer. We have now successfully answered the question in the title: pi is not necessarily $3.14\dots$.

&emsp;&emsp;We would now like to know the value of pi under other norms. The Manhattan distance above is the case $p = 1$, but can $p$ be smaller than $1$? Before discussing that, we need to recall a piece of geometry we abandoned years ago: the sum of two sides of a triangle is greater than the third. The side lengths here are calculated under the norm with $p = 2$, but this familiar geometric fact remains true whenever $p > 1$. When $p = 1$, the sum of two sides equals the third. In a spirit of “close enough,” we will let the $1$-norm join the party. But is $p\in (0,1)$ not going a little too far? The sum of two sides would be shorter than the third. Are you telling me that walking straight to my destination is less convenient than taking a detour all the way around? For a proper norm, we therefore require $p ≥ 1$; that is, the norm must satisfy the triangle inequality $f(x + y) ≥ f(x) + f(y)$.

&emsp;&emsp;Smaller is no good; apparently everyone likes bigger. What happens if $p$ grows without bound and approaches positive infinity? Let $d = \max \{|x_1 − x_2|,|y_1 - y_2| \}$ and recall the theory of limits we learned in language class. Plainly,

$$d = (d^P)^{\frac{1}{p}} < (|x_1 - x_2|^p + |y_1 - y_2|^p)^{\frac{1}{p}} < (2d^p)^{\frac{1}{p}} = 2^{\frac{1}{p}}d,$$

&emsp;&emsp;and because

$$\lim_{p \to \infty} 2^{\frac{1}{p}}d = d,$$

&emsp;&emsp;the squeeze theorem gives

$$\begin{aligned}
\lim_{p \to \infty} d_p & = \lim_{p \to \infty}(|x_1 - x_2|^p + |y_1 - y_2|^p)^{\frac{1}{p}}\\
& = \max{\{ |x_1 - x_2|, |y_1 - y_2|\}}.\end{aligned}$$

&emsp;&emsp;In other words, distance under the $\infty$-norm is the greater of the vertical and horizontal differences: take the larger of $|x1 − x2|, |y1 − y2|$ as the distance. The equation of the circle is therefore

$$C_p : \max \{|x|,|y|\} = 1.$$

&emsp;&emsp;The equation produces the following figure.

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-003-c0f70325bf.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;Under the $\infty$-norm, this “square circle” <font color=grey>**(Voice offstage: What kind of name is that?)**</font> has side length $2$. Thus
its circumference is $C_{\infty} = 8$, and pi is $\pi_{\infty} = \frac{C_{\infty}}{2} = 4$.

&emsp;&emsp;Wait! Did you just say <font color=red>**4**</font>?! Notice that pi is $4$ under both the $1$-norm and the $\infty$-norm, whereas in familiar Euclidean space—the case of the $2$-norm—pi is $3.14\dots < 4$. As $p$ varies in the $p$-norm, pi forms a function of $p$, namely $\pi (p)$. To avoid confusing it with the prime-counting function $\pi (n)$ that Gauss was studying next door, let us write it as $\pi_p$. Still committed to aesthetics, you believe that $\pi_p$ must be continuous: it decreases monotonically from $p = 1, \pi_p = 4$, passes through $p = 2, \pi_p = 3.14\dots$, reaches a local minimum—which is also its global minimum—and then increases monotonically, approaching $4$ at infinity.

&emsp;&emsp;I have to admit that Li Yunlong was right: you guessed correctly again. What is more, the minimum you described occurs exactly at $p = 2$, where it takes the familiar value $3.1415926\dots$. The remainder is fairly simple, just the same tired material repeated beside your crib before you were born. Anyone not interested may skip ahead. With a few mathematical tricks, we can readily calculate the infinitesimal distance between two infinitely close points on the circumference $C_p$:

$$\mathrm{d}s = (|\mathrm{d}x|^p + |\mathrm{d}y|^p)^{\frac{1}{p}},$$

&emsp;&emsp;so pi is

$$\pi_p = \frac{1}{2}\int\limits_{C_p}(|\mathrm{d}x|^p + |\mathrm{d}y|^p)^{\frac{1}{p}} = \frac{1}{2}\int\limits_{C_p}\left(1 + \vert \frac{\mathrm{d}y}{\mathrm{d}x}\vert ^p\right)^{\frac{1}{p}}|\mathrm{d}x|.\tag{original expression}$$

&emsp;&emsp;Take the $\frac{1}{8}$ arc in the first quadrant between the $y$-axis and the line $y = x$. Here $x ≥ 0, y ≥ 0$, and the equation $(x^p + y^p)^{\frac{1}{p}} = 1$, or equivalently $x^p + y^p = 1$, holds. Therefore,

$$\begin{aligned}
\mathrm{d}(x^p + y^p) & = px^{p-1}\mathrm{d}x + py^{p-1}\mathrm{d}y\\
& = px^{p-1}\mathrm{d}x + p(1 - x^p)^{\frac{p-1}{p}}\mathrm{d}y = 0.\end{aligned}$$

&emsp;&emsp;Rearranging at a glance gives

$$\frac{\mathrm{d}y}{\mathrm{d}x} = -\frac{x^{p-1}}{(1-x^p)^{\frac{p-1}{p}}} = -(x^{-p} - 1)^{\frac{1}{p} - 1}$$

&emsp;&emsp;Set $y = (1 − x^p)^{\frac{1}{p}} = x$. Then $x = 2^{-\frac{1}{p}}$, which is the upper limit of integration.

&emsp;&emsp;After substitution, the original expression $=$

$$4\int_{0}^{2^{-\frac{1}{p}}}\left(1 + |x^{-p} - 1|^{1-p}\right)^{\frac{1}{p}}\mathrm{d}x.$$

&emsp;&emsp;When $p = 1$, the integral is plainly $\pi_1 = 4\int_0^{\frac{1}{2}}(1 + 1)\mathrm{d}x = 4$.

&emsp;&emsp;When $p = 2$, a simple rearrangement turns the integrand into the familiar derivative of an inverse trigonometric function: $\pi_2 = 4\int_0^{\frac{\sqrt{2}}{2}}\frac{1}{\sqrt{1-x^2}}\mathrm{d}x = 4\arcsin x|_0^{\frac{\sqrt{2}}{2}} = \pi$.

&emsp;&emsp;As $p \to \infty$, the upper limit approaches $1$, while $x \in [0,1] \Rightarrow \left(\frac{1}{|x^{-p} - 1|}\right)^{p-1} \rightarrow 0$. The integrand therefore approaches $1$, and $π_{\infty} = 4$. In this case, consider why we did not originally use the $\frac{1}{4}$ arc in the first quadrant for the calculation.

> **Hint: How should the integral over $(1-\Delta x, 1]$ be handled?**

&emsp;&emsp;All right, all right—those who skipped the preceding section can rejoin us here. Through a light and cheerful calculation, we have obtained an expression for $\pi_p$ as a function of $p$ and verified the values of pi under the $p$-norm at $p = 1, 2, \infty$. We now want to use that expression to plot $\pi_p$. Other values of $p$ are not easy to calculate by hand, so we must bring out the heavy artillery of numerical integration and use software to approximate them, producing the graph below.

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-004-fb78bfc28c.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;This graph comes from a paper by **Joseph B. Keller** and **Ravi Vakil** on calculating pi under the $p$-norm. Why did I not draw it myself? You would have to ask the wondrous Mathematica. During the earlier integration, mma ran for more than half an hour and gave me the following result.

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-005-46dd6015bf.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;Me: ?

&emsp;&emsp;Better to borrow the result directly.

&emsp;&emsp;The graph shows that $\pi_p$ is a continuous function that begins at $(1, 4)$ and decreases, reaches its minimum at $p = 2$, and then rises steadily toward $4$. This confirms our earlier guess. Moreover, for every $p \in [1, 2]$, there is a $q \in [2, +\infty)$ such that $\pi_p = \pi_q$. In fact, whenever $\frac{1}{p} + \frac{1}{q} = 1$, we have $\pi_p = \pi_q$. As for why, I have discovered a truly marvelous proof, but we are nearing the end and this margin is too narrow to contain it. I shall put it in reference [1] instead.

&emsp;&emsp;In this popular-science excursion, we have not only found a way to change pi but also plotted how its value changes. Now that everything is gradually falling into place, when you look back at stories that use mathematical definitions as a gimmick and alter them at random, do they not seem sometimes naive?

> **References**
[1] Joseph B. Keller and Ravi Vakil, πp, the value of π in ‘p.
[2] C. L. Adler and J. Tanton, π is the minimum value of Pi, College Math. J. 31 (2000)102–106
