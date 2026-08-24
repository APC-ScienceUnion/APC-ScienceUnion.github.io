---
layout: post
title: 'An Introduction to the Poincaré Conjecture (with Notes)'
date: '2020-06-09 18:00:00'
lang: en
translation_key: '浅谈庞加莱猜想（附注释）'
translation_source_sha256: "9191cbb74b59d346cb0a5b223f6e250d77e75bd209b5cad0d93d01b32df0a7ba"
permalink: en/2020/06/09/an-introduction-to-the-poincare-conjecture/
aside: true
comments: false
tags: []
categories: []
cover: '/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/cover-c051d9d87b.png'
copyright_author: 'Delta'
---

> Author: Delta

# Introduction

&emsp;&emsp;In 1904, in a paper titled <em>Fifth Supplement to Analysis Situs</em>, <strong>Henri Poincaré</strong> proposed the following conjecture:

&emsp;&emsp;<strong>If every closed curve in a three-dimensional space can be contracted to a point, then that space must be a three-dimensional ball.</strong>

&emsp;&emsp;What exactly does this statement mean? Is this really the famously difficult Poincaré conjecture? How could a claim that looks "obvious," uses no mathematical notation, and is stated entirely in ordinary language trouble mathematicians for ninety-nine years?

&emsp;&emsp;This article sets out to answer those questions.

# Main text

&emsp;&emsp;The statement itself is not hard to understand. Let us first work in the opposite direction and consider a closed curve inside a three-dimensional ball D3. The following mathematical simulation shows the setup:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-003-17f7a52d4d.png" alt="" />

&emsp;&emsp;The result is:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-004-c01e182434.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-002-c00c4b3352.png" alt="" />

&emsp;&emsp;Now let the curve inside the ball contract freely, as shown below:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-005-a4e57b17ef.png" alt="" />

&emsp;&emsp;It eventually contracts to a single point (1).

&emsp;&emsp;The same is true of any closed curve inside the ball. In D3, every closed curve can be contracted to a point. The Poincaré conjecture reverses this apparently obvious fact: it proposes that the behavior of all such curves determines the nature of the space containing them. You may now be wondering why that space must be a ball. Why could it not have some other shape?

&emsp;&emsp;(Time for discussion.)

&emsp;&emsp;It need not literally be a ball. It could be a cube, a cuboid, or even this (2):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-006-54feb30683.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-007-2bd8d9f937.png" alt="" />

&emsp;&emsp;All right.

&emsp;&emsp;Admittedly, a heart-shaped solid is unlikely, unless the person who designed the space was a cute girl.

&emsp;&emsp;Jokes aside, the shapes above are examples of what mathematicians call manifolds. Informally, a manifold is:

&emsp;&emsp;<strong>a space that locally has the properties of Euclidean space.</strong>

&emsp;&emsp;What is Euclidean space?

&emsp;&emsp;In simple terms, one-dimensional Euclidean space is the (real) (3) number line, two-dimensional Euclidean space is a plane, and three-dimensional Euclidean space is ordinary space as we know it.

&emsp;&emsp;With that in mind, consider a familiar example. We know that Earth is approximately spherical, so its surface is curved. Can we feel that curvature as we go about everyday life?

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-012-efcedf9bc6.png" alt="" />

<center><font size=2px color=grey>The large triangle has curved sides,</font></center>

<center><font size=2px color=grey>but the tiny triangle at lower right looks just like one in a plane.</font></center>

<center><font size=2px color=grey>(Original image from Wikipedia)</font></center>

&emsp;&emsp;Of course not. Locally, a spherical surface is equivalent to a plane. This also helps explain why ancient people could picture Earth as a large disk. Without observing a lunar eclipse, traveling around the world, performing other experiments, or viewing Earth from space, people saw only a small local patch and could not directly determine the planet's overall shape. This is what it means to have Euclidean properties locally. Earth's surface is therefore a two-dimensional manifold because each small region behaves like a plane.

&emsp;&emsp;In more mathematical language, if a space can locally be mapped to n-dimensional Euclidean space in the required way, it is called an n-dimensional manifold. The full definition is shown below:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-008-c880459750.jpg" alt="" />

&emsp;&emsp;(Still want to go deeper? Come to my office after class. Just kidding.)

&emsp;&emsp;The ball, cube, and heart-shaped solid mentioned above are all three-dimensional manifolds. In general topology, they are equivalent as topological spaces. Two notions of equivalence matter here: homotopy equivalence and homeomorphism. To a topologist, a ball, cube, and cuboid are therefore the same in the relevant sense (4). That is why we can say the space need not literally be round while still describing the conjecture with a ball. Topologically, these shapes are equals. (No hierarchy here; every shape gets equal treatment.)

&emsp;&emsp;Before going further, what is topology? The following passage comes from the introduction to Professor You Chengye's <em>Lectures on Elementary Topology</em>:

&emsp;&emsp;"What is topology?" Many beginners ask this question. Topology is a branch of geometry and studies geometric figures. It does not, however, study the ordinary geometric properties with which most people are familiar. It studies a special class of properties known as "<strong>topological properties</strong>." Understanding topology therefore requires us to understand what a topological property is. Although these properties are fundamental and have strong geometric intuition behind them, they are difficult to describe accurately in simple language. Their precise definition is abstract and cannot yet be given here. ... The problems above reveal a special class of geometric properties concerning a figure's overall structure. These are topological properties. They plainly have nothing to do with a figure's size or ordinary shape, or with whether its lines are straight or curved. Ordinary geometric methods cannot handle them, so a new kind of geometry is needed: <strong>topology</strong>. It is sometimes called <strong>rubber-sheet geometry</strong> because the properties it studies remain unchanged under <strong>elastic deformation</strong>.

&emsp;&emsp;Space permits us to discuss only one of the examples in that book, Euler's polyhedron theorem. The other two are the Seven Bridges of Königsberg and the map-coloring problem, also known as the four-color problem (5). Interested readers can look them up.

&emsp;&emsp;Most readers will have encountered Euler's polyhedron theorem while studying solid geometry. It states:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-009-38cbb68dfb.png" alt="" />

&emsp;&emsp;We are interested in properties that survive elastic deformation, so we must move beyond the polyhedron itself. Place a convex polyhedron inside a large ball with the ball's center inside the polyhedron. Project outward from the center: each vertex of the polyhedron becomes a vertex on the sphere, and each edge becomes a curve on the sphere. Together, these vertices and edges form a graph that divides the sphere into f faces and has l edges and v vertices, as shown below:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-011-ec625c6134.png" alt="" />

&emsp;&emsp;This graph satisfies three conditions:

&emsp;&emsp;(1) The endpoints of every edge are two distinct vertices;

&emsp;&emsp;(2) Distinct edges do not intersect at interior points;

&emsp;&emsp;(3) No edge intersects itself. In this form, Euler's theorem can be generalized as follows:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-010-a4ab2a6c04.png" alt="" />

&emsp;&emsp;As the sphere deforms, f, l, and v do not change. The theorem therefore remains true for a deformed sphere such as an ellipsoid, and for any closed, simply connected two-dimensional manifold. Here, "closed" means sealed. The deformation must be continuous, with no gluing or tearing. Under such a deformation, a sphere cannot become a torus (6):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-018-0ba309bc32.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-013-4903c12483.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-015-f327bf4594.png" alt="" />

&emsp;&emsp;To make that change, you would have to tear the sphere and reglue it, or press its poles together, join them, and then tear the surface. The sphere and torus must therefore differ in some topological properties. For example, if a connected graph lies on a torus, the Euler relation above becomes:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-014-a4c44ff498.png" alt="" />

&emsp;&emsp;The value of f - l + v is not the only difference. A torus has a central hole that a sphere lacks. If we draw an arbitrary closed curve in a torus, or doughnut, as we did at the beginning, that curve may not contract to a point (7):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-020-85bdd637ac.png" alt="" />

&emsp;&emsp;In this case, the central hole obstructs the curve as it contracts. The curve tightens around the hole instead of shrinking to a point. The space is multiply connected rather than simply connected in this one-dimensional sense. The number of holes is called the genus, which is another topological property.

&emsp;&emsp;A sphere has genus zero, while a torus has genus one. Surfaces can also have higher genus, for example (8):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-016-70422ffd36.png" alt="" />

&emsp;&emsp;For these surfaces, f - l + v is negative. This number, determined by the surface itself, is called the Euler characteristic.

&emsp;&emsp;Our discussion of topology has repeatedly referred to continuous deformation. This brings us back to the two kinds of equivalence introduced earlier: homotopy and homeomorphism. Neither changes the two properties above. Genus and the Euler characteristic are homotopy invariants, and every homotopy invariant is also a topological, or homeomorphism, invariant.

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-019-f2e6603ead.png" alt="" />

&emsp;&emsp;(Time for discussion.)

<center>China-Japan relations are homotopic but not homeomorphic; China-US relations are neither.</center>

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-017-23d9b29611.png" alt="" />

&emsp;&emsp;With these ideas in place, let us return to Poincaré's original conjecture:

&emsp;&emsp;<strong>If every closed curve in a three-dimensional space can be contracted to a point, then that space must be a three-dimensional ball.</strong>

&emsp;&emsp;We now know that "ball" means any space homeomorphic to a ball. Is the statement correct? We may struggle to imagine a counterexample, but that is not a proof. In fact, this version is wrong because it ignores the boundary of a manifold.

&emsp;&emsp;What is the boundary of a manifold?

&emsp;&emsp;Start with the familiar open and closed intervals. An open interval is a one-dimensional manifold without boundary, while a closed interval is a one-dimensional manifold with boundary. At school, we distinguish them by asking whether the endpoints are included. Those endpoints form the boundary of the one-dimensional manifold. Moving up one dimension, a two-dimensional manifold has a boundary when it includes a boundary curve.

&emsp;&emsp;In the figure, a dashed line means that the circumference is excluded:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-022-37b659ad69.png" alt="" />

&emsp;&emsp;The first manifold has no boundary; the second does.

&emsp;&emsp;One clarification is needed. We cannot call manifolds open or closed according to whether they have a boundary, as we do with intervals. Both open and closed manifolds are boundaryless; the distinction concerns compactness, which we will not discuss here.

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-024-77f7f5ee2e.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-023-e4f2701949.png" alt="" />

&emsp;&emsp;A boundaryless three-dimensional manifold plainly cannot be identified with a three-dimensional ball, whose boundary is a sphere. This is why the original statement is wrong. Poincaré noticed the flaw in 1905 and revised it:

&emsp;&emsp;<strong>Every closed three-dimensional manifold homotopy equivalent to the 3-sphere is homeomorphic to the 3-sphere.</strong>

&emsp;&emsp;Equivalently:

&emsp;&emsp;<strong>Every closed, simply connected three-dimensional manifold is homeomorphic to the 3-sphere.</strong>

<center><strong>This is the Poincaré conjecture in its proper form.</strong></center>

&emsp;&emsp;The boundary of a two-dimensional ball, or disk, is a one-dimensional sphere, or circle. Similarly, the 3-sphere belongs naturally to four-dimensional space: it is the boundary of a four-dimensional ball, a membrane with no thickness in the fourth dimension. We cannot directly visualize what this 3-sphere, or hypersphere, looks like.

&emsp;&emsp;We can nevertheless use analogy with the ordinary sphere to understand some properties of the 3-sphere. Consider the Riemann sphere, introduced by Riemann in complex analysis to describe the extended complex plane through stereographic projection. In real space, project the sphere from its top pole P onto a plane:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-031-c6555b6101.png" alt="" />

&emsp;&emsp;This maps every point on the sphere except P to an unbounded, genus-zero plane. The map is bijective and continuous, and its inverse is continuous as well. Riemann then treats all directions toward infinity in the plane as meeting at a single point, the point at infinity, which corresponds to P on the sphere. In this setting, division by zero is assigned the value:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-021-4e2d12c3b8.png" alt="" />

&emsp;&emsp;The equation is not valid in any other sense.

&emsp;&emsp;In other words:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-025-885921e1db.png" alt="" />

&emsp;&emsp;A similar projection can be made for the 3-sphere. It can be described as three-dimensional space without holes, that is, a simply connected three-dimensional manifold, together with one point at infinity. We know that the map from the 3-sphere to three-dimensional space is bijective and continuous, but we do not yet know whether its inverse must be continuous. We know that the 3-sphere can be described as a simply connected three-dimensional space; the unanswered question is whether every simply connected three-dimensional space can be continuously deformed into the 3-sphere.

&emsp;&emsp;Poincaré conjectured that it can.

# Epilogue

&emsp;&emsp;We will finish with a brief history of attempts to prove the conjecture.

&emsp;&emsp;Many early researchers, including J. H. C. Whitehead and Haken, produced proofs that contained flaws, though their work helped lay foundations for later developments in topology. One mathematician deserves special mention: Christos Dimitriou Papakyriakopoulos (Χρήστος Δημητρίου Παπακυριακόπουλος), known as Papa. He devoted his life to the Poincaré conjecture and even gave up a professorship for it. Near the end of his life, while terminally ill with stomach cancer, he gave a manuscript of his proof to a friend. The friend found an error after reading only a few pages but chose not to tell him, so that Papa could die believing the proof complete. His life may look tragic from the outside, yet perhaps not to him: he had spent it on the work he loved.

&emsp;&emsp;William Thurston (10) made the central contribution in the next period. His geometrization conjecture proposed that every three-dimensional manifold could be built from eight basic geometries, and the Poincaré conjecture followed from it. A conjecture cannot rigorously prove another conjecture, of course. Thurston eventually stopped pursuing a complete proof for a reason reminiscent of Hilbert's (11): "If I prove it, young people will have nothing left to strive for."

&emsp;&emsp;Less than three years after the Clay Mathematics Institute named the Poincaré conjecture a Millennium Prize Problem, Grigori Perelman completed a proof of Thurston's geometrization conjecture. On November 12, 2002, he posted the first paper on arXiv.org, followed by two more over the next six months. Together, the three papers outlined proofs of the Poincaré conjecture and the more general geometrization conjecture, completing the program proposed by Richard Hamilton.

&emsp;&emsp;That brings our introduction nearly to an end, but one question remains. Why did a conjecture that looks "obvious," contains no mathematical notation, and can be stated entirely in ordinary language resist proof for ninety-nine years?

&emsp;&emsp;The source of that difficulty is hard to convey without advanced mathematics. Another question offers a useful comparison: how would you prove that a closed curve divides the plane into two regions?

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-026-33cbda81f4.png" alt="" />

&emsp;&emsp;That statement looks even more obvious than the Poincaré conjecture, yet its proof is difficult and can be developed using the fundamental group. It is called the Jordan curve theorem, and the first correct proof did not appear until 1905. In ordinary language the theorem seems self-evident, but in mathematical language it reads:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-027-a88e850092.png" alt="" />

&emsp;&emsp;It no longer looks so obvious. The same lesson applies to the Poincaré conjecture. A truth that looks evident on the surface is not necessarily easy to understand. That holds in life as well as in mathematics.

<center><strong>(End)</strong></center>

# Notes

&emsp;&emsp;(1) The computer algebra system used here is Mathematica. The contraction can be shown as a GIF, but my computer failed while processing the following code. Readers with more capable hardware are welcome to try it:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-028-02cea2560a.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-030-8f8f6bac96.png" alt="" />

&emsp;&emsp;(2) This flamboyant three-dimensional solid was generated as follows:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-029-f3bab6c228.png" alt="" />

&emsp;&emsp;(3) Unless otherwise stated, this article works entirely in real space.

&emsp;&emsp;(4) There are differences, though most topologists before 1935 did not frame them this way. Differential topology began to emerge after Hassler Whitney gave a rigorous account of differentiable manifolds. Topologists then moved beyond homeomorphism to consider diffeomorphism, replacing mere continuity with smoothness. A sphere's surface is smooth everywhere, whereas a cube has eight nonsmooth singular points. The two solids are homeomorphic but not diffeomorphic. Unless otherwise stated, this article does not consider differentiable structure.

&emsp;&emsp;(5) The proof of the four-color theorem has an indirect connection to the Poincaré conjecture. Wolfgang Haken discovered a fatal error while working on the Poincaré conjecture. The setback reportedly led to compulsive overeating, jokingly called "Poincaré conjecture syndrome." After turning to the four-color problem, he recovered and eventually produced a computer-assisted proof of the four-color theorem, though not everyone found that style of proof satisfying.

&emsp;&emsp;(6) Code for plotting a torus:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-032-8de2f68555.png" alt="" />

&emsp;&emsp;(7) As follows:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-035-3b7fb297a3.png" alt="" />

&emsp;&emsp;(8) The image comes from Baidu Baike's entry on genus.

&emsp;&emsp;(9) I = [0,1].

&emsp;&emsp;(10) Stephen Smale also made an important contribution, though he did not prove the ordinary three-dimensional conjecture discussed above. He proved the simpler higher-dimensional version:

&emsp;&emsp;Every closed n-dimensional manifold homotopy equivalent to the n-sphere is homeomorphic to the n-sphere, for n ≥ 5.

&emsp;&emsp;Why is the higher-dimensional conjecture simpler? The answer involves knot theory. In higher dimensions, a closed curve does not become knotted as it contracts; in three dimensions, it can.

&emsp;&emsp;(11) Hilbert reportedly declined to work on Fermat's Last Theorem with the remark, "It is a goose that lays golden eggs. Why should I kill it?"

