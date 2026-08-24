---
layout: post
title: "Does Pi Always Equal 3.14…?"
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

&emsp;&emsp;Years ago, a science fiction story titled “Pythagoras: 2.013” took the internet by storm, and people still remember it today. One passage near the end invites the reader to speculate:

> “Do not judge their intelligence from our point of view. Perhaps our own civilization, too, exists within some larger region of distorted spacetime. Don’t you find the value of pi, *3.1416*, an exceedingly strange number?”

&emsp;&emsp;The story has plenty of flaws, but they do not diminish its literary value. It genuinely inspired many people to study science and mathematics. Even today, it offers a useful starting point for a short exploration of the value of pi.

&emsp;&emsp;So let us return to that evocative line: **is pi, $\pi = 3.1415926 \dots$, really such a strange number? Does it have that value because spacetime is distorted**?

&emsp;&emsp;The answer to both questions is <font color=red>**no**</font>. We should not fault an irrational number on aesthetic grounds merely because we cannot find a pattern in it. That would hardly be fair. Can anyone reduce every work of art to a single pattern? <font color=grey>**(Voice offstage: AI ART!!! Machines can draw only because we found the “pattern” behind art, right?)**</font> But the parameters that define those AIs do not follow a pattern either, do they? It is 3202; surely everyone knows by now that neural-network algorithms are black boxes?

&emsp;&emsp;The second question is even more far-fetched. Our familiar $3.14\dots$ comes from a circle in a plane. What kind of plane? The mathematical two-dimensional Euclidean plane. To define it, we need only form ordered pairs $(x, y)$ of real numbers and specify a formula for the “distance” between them. Spacetime can twist however it likes; that affects only a physical “plane.” A tabletop that looks flat in everyday life, for instance, is actually curved, with spacetime curvature making it appear flat, and so on. A mathematical plane, however, is defined abstractly. Nothing in physical reality can alter a mathematical concept.

&emsp;&emsp;As the saying goes, the person who tied the bell must untie it. If we truly want to change pi, we have to change a mathematical definition. We will keep the rest of the discussion in the real plane: each point is specified by exactly two real numbers. So what can we still change?

&emsp;&emsp;Exactly: we still have to specify how to calculate “distance.” In the second year of graduate school, we encountered the famous **distance formula for two points $(x_1, y_1), (x_2, y_2)$**:

$$d_2 = ((x_1 - x_2)^2 + (y_1 - y_2)^2 )^{\frac{1}{2}}.$$

&emsp;&emsp;Meanwhile, our teachers had already introduced the **Manhattan distance**, widely used in computing, back in first grade: add the vertical difference between the points to their horizontal difference. In symbols:

$$d_1 = |x_1 - x_2| + |y_1 - y_2|.$$

&emsp;&emsp;Still unconvinced by the claim that irregularity is no aesthetic failing, you immediately go looking for an elegant pattern. Brimming with confidence, you propose the following distance formula in terms of $p$:

$$d_p = (|x_1 - x_2|^p + |y_1 - y_2|^p )^{\frac{1}{p}}.$$

&emsp;&emsp;Faced with a reckless conclusion built from equal parts guesswork and bravado, I can only say...:

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-001-8bef380973.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;That's right: this was the lesson you slept through in your final year of kindergarten. A function (or functional) that measures distance this way is called a “$p$-norm.”

&emsp;&emsp;Your next question is obvious: how can this distance formula change pi? Friends, let us turn our attention to that circle in the distance.

&emsp;&emsp;Once we change the distance formula, the first thing to change is the shape of the so-called “circle.” Put its center at the origin and let its radius be $1$. Its equation is then:

$$C_p : (|x|^p + |y|^p )^{\frac{1}{p}} = 1.$$

&emsp;&emsp;What shape does the “circle” take under the familiar Manhattan distance?

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-002-d09a167b7c.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;It becomes a square rotated by $45\degree$! Under this definition of distance, its circumference is $C_1 = a \times (1 + 1) = 8$, so pi is $\pi _1 = \frac{C_1}{2} = 4$! Not only is it different from the usual $3.14\dots$; it is no longer irrational at all. It has become an integer. We have now answered the question in the title: pi does not always equal $3.14\dots$.

&emsp;&emsp;Next, we would like to know the value of pi under other norms. The Manhattan distance above corresponds to $p = 1$, but can $p$ be less than $1$? Before answering, recall a bit of geometry we abandoned years ago: the sum of two sides of a triangle is greater than the third side. Those side lengths are measured with the $p = 2$ norm, but the familiar rule remains true whenever $p > 1$. At $p = 1$, the sum of two sides equals the third, and in the spirit of “close enough,” we will still let the $1$-norm join the party. But $p\in (0,1)$ goes a little too far: the sum of two sides would be shorter than the third. Are you telling me that walking straight to my destination is less convenient than taking a long detour? A proper norm therefore requires $p ≥ 1$; that is, it must satisfy the triangle inequality $f(x + y) ≥ f(x) + f(y)$.

&emsp;&emsp;Smaller is no good; apparently everyone prefers bigger. What happens as $p$ grows without bound and approaches positive infinity? Let $d = \max \{|x_1 − x_2|,|y_1 - y_2| \}$ and recall the theory of limits we learned in language arts. Clearly,

$$d = (d^P)^{\frac{1}{p}} < (|x_1 - x_2|^p + |y_1 - y_2|^p)^{\frac{1}{p}} < (2d^p)^{\frac{1}{p}} = 2^{\frac{1}{p}}d,$$

&emsp;&emsp;and because

$$\lim_{p \to \infty} 2^{\frac{1}{p}}d = d,$$

&emsp;&emsp;the squeeze theorem gives

$$\begin{aligned}
\lim_{p \to \infty} d_p & = \lim_{p \to \infty}(|x_1 - x_2|^p + |y_1 - y_2|^p)^{\frac{1}{p}}\\
& = \max{\{ |x_1 - x_2|, |y_1 - y_2|\}}.\end{aligned}$$

&emsp;&emsp;In other words, the distance under the $\infty$-norm is whichever is greater, the vertical difference or the horizontal difference. We take the larger of $|x1 − x2|, |y1 − y2|$ as the distance. The circle therefore has the equation

$$C_p : \max \{|x|,|y|\} = 1.$$

&emsp;&emsp;This equation gives us the following shape.

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-003-c0f70325bf.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;Under the $\infty$-norm, this “square circle” <font color=grey>**(Voice offstage: What kind of name is that?)**</font> has side length $2$. Therefore,
its circumference is $C_{\infty} = 8$, and pi is $\pi_{\infty} = \frac{C_{\infty}}{2} = 4$.

&emsp;&emsp;Wait! Did you just say <font color=red>**4**</font>?! Pi is $4$ under both the $1$-norm and the $\infty$-norm, but in familiar Euclidean space, the $2$-norm case, pi is $3.14\dots < 4$. As $p$ varies in the $p$-norm, pi becomes a function of $p$, namely $\pi (p)$. To avoid confusing it with the prime-counting function $\pi (n)$ that Gauss is studying next door, let us write it as $\pi_p$. Still devoted to elegance, you guess that $\pi_p$ must be continuous: it decreases monotonically from $p = 1, \pi_p = 4$, passes through $p = 2, \pi_p = 3.14\dots$, reaches a local minimum that is also its global minimum, then increases monotonically toward $4$ at infinity.

&emsp;&emsp;I have to admit that Li Yunlong was right: you guessed correctly again. Better yet, the minimum occurs exactly at $p = 2$, where pi has its familiar value, $3.1415926\dots$. What follows is fairly simple, just the same tired material someone repeated beside your crib before you were born. Anyone who is not interested may skip ahead. With a few mathematical tricks, we can calculate the infinitesimal distance between two infinitely close points on $C_p$:

$$\mathrm{d}s = (|\mathrm{d}x|^p + |\mathrm{d}y|^p)^{\frac{1}{p}},$$

&emsp;&emsp;so pi is

$$\pi_p = \frac{1}{2}\int\limits_{C_p}(|\mathrm{d}x|^p + |\mathrm{d}y|^p)^{\frac{1}{p}} = \frac{1}{2}\int\limits_{C_p}\left(1 + \vert \frac{\mathrm{d}y}{\mathrm{d}x}\vert ^p\right)^{\frac{1}{p}}|\mathrm{d}x|.\tag{original expression}$$

&emsp;&emsp;Take the $\frac{1}{8}$ arc in the first quadrant between the $y$-axis and the line $y = x$. On this arc, $x ≥ 0, y ≥ 0$, and $(x^p + y^p)^{\frac{1}{p}} = 1$, or equivalently $x^p + y^p = 1$. Therefore,

$$\begin{aligned}
\mathrm{d}(x^p + y^p) & = px^{p-1}\mathrm{d}x + py^{p-1}\mathrm{d}y\\
& = px^{p-1}\mathrm{d}x + p(1 - x^p)^{\frac{p-1}{p}}\mathrm{d}y = 0.\end{aligned}$$

&emsp;&emsp;A quick rearrangement gives

$$\frac{\mathrm{d}y}{\mathrm{d}x} = -\frac{x^{p-1}}{(1-x^p)^{\frac{p-1}{p}}} = -(x^{-p} - 1)^{\frac{1}{p} - 1}$$

&emsp;&emsp;Set $y = (1 − x^p)^{\frac{1}{p}} = x$. Then $x = 2^{-\frac{1}{p}}$, the upper limit of integration.

&emsp;&emsp;After substitution, the original expression $=$

$$4\int_{0}^{2^{-\frac{1}{p}}}\left(1 + |x^{-p} - 1|^{1-p}\right)^{\frac{1}{p}}\mathrm{d}x.$$

&emsp;&emsp;When $p = 1$, the integral is plainly $\pi_1 = 4\int_0^{\frac{1}{2}}(1 + 1)\mathrm{d}x = 4$.

&emsp;&emsp;When $p = 2$, a simple rearrangement turns the integrand into the familiar derivative of an inverse trigonometric function: $\pi_2 = 4\int_0^{\frac{\sqrt{2}}{2}}\frac{1}{\sqrt{1-x^2}}\mathrm{d}x = 4\arcsin x|_0^{\frac{\sqrt{2}}{2}} = \pi$.

&emsp;&emsp;As $p \to \infty$, the upper limit approaches $1$, while $x \in [0,1] \Rightarrow \left(\frac{1}{|x^{-p} - 1|}\right)^{p-1} \rightarrow 0$. The integrand therefore approaches $1$, and $π_{\infty} = 4$. Now consider why we did not use the $\frac{1}{4}$ arc in the first quadrant from the outset.

> **Hint: How should the integral over $(1-\Delta x, 1]$ be handled?**

&emsp;&emsp;All right, all right. Those who skipped the preceding section can rejoin us here. After that quick and painless calculation, we have an expression for $\pi_p$ as a function of $p$, and we have verified pi under the $p$-norm for $p = 1, 2, \infty$. Now we want to plot $\pi_p$. Other values of $p$ are difficult to calculate by hand, so it is time to bring out the heavy artillery: numerical integration. Software gives us approximations from which we can draw the graph below.

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-004-fb78bfc28c.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;This graph comes from a paper by **Joseph B. Keller** and **Ravi Vakil** on calculating pi under the $p$-norm. Why didn't I draw it myself? You would have to ask Mathematica. During the integration above, mma ran for more than half an hour and returned this:

<img src="/images/%E5%9C%86%E5%91%A8%E7%8E%87%E4%B8%80%E5%AE%9A%E6%98%AF3.14...%E5%90%97%EF%BC%9F/fig-005-46dd6015bf.jpg" alt="image.png" title="image.png" />

&emsp;&emsp;Me: ?

&emsp;&emsp;Better to borrow their result.

&emsp;&emsp;The graph shows that $\pi_p$ is continuous. It decreases from $(1, 4)$ to its minimum at $p = 2$, then rises steadily toward $4$, confirming our earlier guess. Moreover, for every $p \in [1, 2]$, there is a $q \in [2, +\infty)$ such that $\pi_p = \pi_q$. In fact, whenever $\frac{1}{p} + \frac{1}{q} = 1$, we have $\pi_p = \pi_q$. Why? I have discovered a truly marvelous proof, but we are nearing the end and this margin is too narrow to contain it. I shall put it in reference [1] instead.

&emsp;&emsp;In this excursion, we have not only found a way to change pi but also plotted how its value changes. Now that the pieces are falling into place, don't stories that treat mathematical definitions as gimmicks and change them at random start to look a little naive?

> **References**
[1] Joseph B. Keller and Ravi Vakil, πp, the value of π in ‘p.
[2] C. L. Adler and J. Tanton, π is the minimum value of Pi, College Math. J. 31 (2000)102–106
