---
layout: post
title: 'The Poincaré Conjecture: An Introduction with Notes'
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

&emsp;&emsp;In 1904, <strong>Henri Poincaré</strong> proposed the following conjecture in a paper titled <em>Fifth Supplement to Analysis Situs</em>:

&emsp;&emsp;<strong>If every closed curve in a three-dimensional space can be contracted to a point, then that space must be a three-dimensional ball.</strong>

&emsp;&emsp;What exactly does this statement mean? Is this really the famously difficult Poincaré conjecture? How could an apparently "obvious" claim, written entirely in ordinary language without a single mathematical symbol, trouble generations of mathematicians for ninety-nine years?

&emsp;&emsp;Those are the questions this article will try to answer.

# The Main Idea

&emsp;&emsp;The statement itself is not hard to understand. Let us begin with the reverse direction by considering a closed curve inside a three-dimensional ball D3. The following computer simulation shows the setup:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-003-17f7a52d4d.png" alt="" />

&emsp;&emsp;Here is the result:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-004-c01e182434.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-002-c00c4b3352.png" alt="" />

&emsp;&emsp;Now allow the curve inside the ball to contract freely:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-005-a4e57b17ef.png" alt="" />

&emsp;&emsp;It eventually shrinks to a single point (1).

&emsp;&emsp;The same is true of every closed curve inside the ball: in D3, any closed curve can be contracted to a point. The Poincaré conjecture reverses this seemingly obvious fact. It proposes that the behavior of all such curves can reveal the nature of the space that contains them. But why must that space be a ball? Why could it not have some other shape?

&emsp;&emsp;(Discussion time.)

&emsp;&emsp;It does not literally have to be a ball. It could be a cube, a rectangular box, or even this (2):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-006-54feb30683.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-007-2bd8d9f937.png" alt="" />

&emsp;&emsp;All right, then.

&emsp;&emsp;Admittedly, a heart-shaped solid seems unlikely, unless whoever designed the space was a cute girl.

&emsp;&emsp;Joking aside, the shapes above are examples of what mathematicians call manifolds. Informally, a manifold is:

&emsp;&emsp;<strong>a space that locally has the properties of Euclidean space.</strong>

&emsp;&emsp;And what is Euclidean space?

&emsp;&emsp;Put simply, one-dimensional Euclidean space is the (real) (3) number line, two-dimensional Euclidean space is the plane, and three-dimensional Euclidean space is the ordinary space of daily life.

&emsp;&emsp;With that in mind, consider a familiar example. We know that Earth is approximately spherical and therefore has a curved surface. Can we feel that curvature in everyday life?

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-012-efcedf9bc6.png" alt="" />

<center><font size=2px color=grey>The large triangle has curved sides,</font></center>

<center><font size=2px color=grey>but the tiny triangle at lower right looks just like a triangle in the plane.</font></center>

<center><font size=2px color=grey>(Original image from Wikipedia)</font></center>

&emsp;&emsp;Of course not. Locally, a spherical surface is equivalent to a plane. This helps explain why ancient people pictured Earth as a large disk. Without observing a lunar eclipse, traveling around the world, conducting other experiments, or seeing Earth from space, people could observe only a small local patch and could not directly determine the planet's overall shape. That is what it means to have Euclidean properties locally. Earth's surface is a two-dimensional manifold because every small region behaves like a plane.

&emsp;&emsp;More mathematically, a space is called an n-dimensional manifold if each local region can be mapped to n-dimensional Euclidean space in the required way. Here is the full definition:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-008-c880459750.jpg" alt="" />

&emsp;&emsp;(Still want to go deeper? Come by my office after class. Just kidding.)

&emsp;&emsp;The ball, cube, and heart-shaped solid above are all three-dimensional manifolds. In general topology, they are equivalent as topological spaces. Two notions of equivalence matter here: homotopy equivalence and homeomorphism. In the relevant sense, then, a ball, cube, and rectangular box all look the same to a topologist (4). That is why the space need not literally be round even though we describe the conjecture using a ball. Topologically, these shapes are equals. (No oppression here; every shape gets equal treatment.)

&emsp;&emsp;Before we go any further, what is topology? The following passage comes from the introduction to Professor You Chengye's <em>Lectures on Elementary Topology</em>:

&emsp;&emsp;"What is topology?" Many beginners ask this question. Topology is a branch of geometry and studies geometric figures. It does not, however, study the ordinary geometric properties with which most people are familiar. It studies a special class of properties known as "<strong>topological properties</strong>." Understanding topology therefore requires us to understand what a topological property is. Although these properties are fundamental and have strong geometric intuition behind them, they are difficult to describe accurately in simple language. Their precise definition is abstract and cannot yet be given here. ... The problems above reveal a special class of geometric properties concerning a figure's overall structure. These are topological properties. They plainly have nothing to do with a figure's size or ordinary shape, or with whether its lines are straight or curved. Ordinary geometric methods cannot handle them, so a new kind of geometry is needed: <strong>topology</strong>. It is sometimes called <strong>rubber-sheet geometry</strong> because the properties it studies remain unchanged under <strong>elastic deformation</strong>.

&emsp;&emsp;Space allows us to discuss only one of the book's examples in detail: Euler's polyhedron theorem. The other two are the Seven Bridges of Königsberg and the map-coloring problem, better known as the four-color problem (5). Interested readers can look them up.

&emsp;&emsp;Most readers will have encountered Euler's polyhedron theorem in solid geometry. It states:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-009-38cbb68dfb.png" alt="" />

&emsp;&emsp;We are interested in properties that survive elastic deformation, so we must look beyond the polyhedron itself. Place a convex polyhedron inside a large ball, with the ball's center inside the polyhedron. Now project outward from that center: each vertex of the polyhedron becomes a vertex on the sphere, and each edge becomes a curve on its surface. Together, the vertices and edges form a graph that divides the sphere into f faces, with l edges and v vertices, as shown below:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-011-ec625c6134.png" alt="" />

&emsp;&emsp;The graph satisfies three conditions:

&emsp;&emsp;(1) Every edge has two distinct vertices as its endpoints;

&emsp;&emsp;(2) Distinct edges do not meet at interior points;

&emsp;&emsp;(3) No edge intersects itself. In this setting, Euler's theorem can be generalized as follows:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-010-a4ab2a6c04.png" alt="" />

&emsp;&emsp;When the sphere deforms, f, l, and v remain unchanged. The theorem therefore still holds for a deformed sphere such as an ellipsoid, and for any closed, simply connected two-dimensional manifold. Here, "closed" means sealed. The deformation must be continuous, with no gluing or tearing. A sphere cannot become a torus under such a deformation (6):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-018-0ba309bc32.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-013-4903c12483.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-015-f327bf4594.png" alt="" />

&emsp;&emsp;To make that change, you would have to tear the sphere and glue it back together differently, or press its poles together, join them, and then tear the surface. A sphere and a torus must therefore differ in some topological properties. For example, if a connected graph lies on a torus, the Euler relation above becomes:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-014-a4c44ff498.png" alt="" />

&emsp;&emsp;The value of f - l + v is not the only difference. A torus has a central hole that a sphere lacks. If we draw an arbitrary closed curve on a torus, our mathematical doughnut, as we did at the beginning, the curve may not contract to a point (7):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-020-85bdd637ac.png" alt="" />

&emsp;&emsp;Here the central hole obstructs the curve as it contracts. The curve tightens around the hole instead of shrinking to a point. In this one-dimensional sense, the space is multiply connected rather than simply connected. The number of holes is called the genus, another topological property.

&emsp;&emsp;A sphere has genus zero, while a torus has genus one. A surface can also have a higher genus, as in this example (8):

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-016-70422ffd36.png" alt="" />

&emsp;&emsp;For these surfaces, f - l + v is negative. This number, which is determined by the surface itself, is called the Euler characteristic.

&emsp;&emsp;Our discussion of topology has repeatedly returned to continuous deformation. This brings us back to the two kinds of equivalence introduced earlier: homotopy and homeomorphism. Neither changes the two properties above. Genus and the Euler characteristic are homotopy invariants, and every homotopy invariant is also a topological, or homeomorphism, invariant.

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-019-f2e6603ead.png" alt="" />

&emsp;&emsp;(Discussion time.)

<center>China-Japan relations are homotopic but not homeomorphic; China-US relations are neither.</center>

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-017-23d9b29611.png" alt="" />

&emsp;&emsp;With these ideas in place, let us return to Poincaré's original conjecture:

&emsp;&emsp;<strong>If every closed curve in a three-dimensional space can be contracted to a point, then that space must be a three-dimensional ball.</strong>

&emsp;&emsp;We now know that "ball" means any space homeomorphic to a ball. Is the statement correct? We may not be able to imagine a counterexample, but that is not a proof. In fact, this version is wrong because it fails to account for the boundary of a manifold.

&emsp;&emsp;So what is the boundary of a manifold?

&emsp;&emsp;Start with the familiar open and closed intervals. An open interval is a one-dimensional manifold without boundary, while a closed interval is a one-dimensional manifold with boundary. In school, we distinguish the two by asking whether the endpoints are included. Those endpoints form the boundary of the one-dimensional manifold. Move up one dimension, and a two-dimensional manifold has a boundary when it includes a boundary curve.

&emsp;&emsp;In the figure below, the dashed line means that the circumference is excluded:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-022-37b659ad69.png" alt="" />

&emsp;&emsp;The first manifold has no boundary, while the second does.

&emsp;&emsp;One point needs clarification. Unlike intervals, manifolds are not called open or closed according to whether they have a boundary. Both open and closed manifolds are boundaryless; the distinction has to do with compactness, which we will not discuss here.

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-024-77f7f5ee2e.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-023-e4f2701949.png" alt="" />

&emsp;&emsp;A three-dimensional manifold without boundary plainly cannot be identified with a three-dimensional ball, whose boundary is a sphere. That is why the original statement is wrong. Poincaré noticed the flaw in 1905 and revised the conjecture:

&emsp;&emsp;<strong>Every closed three-dimensional manifold homotopy equivalent to the 3-sphere is homeomorphic to the 3-sphere.</strong>

&emsp;&emsp;Equivalently:

&emsp;&emsp;<strong>Every closed, simply connected three-dimensional manifold is homeomorphic to the 3-sphere.</strong>

<center><strong>This is the Poincaré conjecture in its proper form.</strong></center>

&emsp;&emsp;The boundary of a two-dimensional ball, or disk, is a one-dimensional sphere, or circle. In the same way, the 3-sphere belongs naturally to four-dimensional space: it is the boundary of a four-dimensional ball, a membrane with no thickness in the fourth dimension. We cannot directly picture what this 3-sphere, or hypersphere, looks like.

&emsp;&emsp;We can still use the ordinary sphere as an analogy for some properties of the 3-sphere. Consider the Riemann sphere, introduced by Riemann in complex analysis to describe the extended complex plane by stereographic projection. In real space, project the sphere from its top pole P onto a plane:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-031-c6555b6101.png" alt="" />

&emsp;&emsp;This maps every point on the sphere except P to an unbounded, genus-zero plane. The map is bijective and continuous, and its inverse is continuous too. Riemann then treats every direction toward infinity in the plane as meeting at a single point, the point at infinity, corresponding to P on the sphere. In this setting, division by zero is assigned the value:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-021-4e2d12c3b8.png" alt="" />

&emsp;&emsp;The equation is valid in no other sense.

&emsp;&emsp;In other words:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-025-885921e1db.png" alt="" />

&emsp;&emsp;A similar projection can be made for the 3-sphere. We can describe it as three-dimensional space without holes, meaning a simply connected three-dimensional manifold, together with a single point at infinity. We know that the map from the 3-sphere to three-dimensional space is bijective and continuous, but we do not yet know whether its inverse must also be continuous. In other words, we know that the 3-sphere can be described as a simply connected three-dimensional space. The unanswered question is whether every simply connected three-dimensional space can be continuously deformed into the 3-sphere.

&emsp;&emsp;Poincaré conjectured that the answer was yes.

# Epilogue

&emsp;&emsp;Let us finish with a brief history of attempts to prove the conjecture.

&emsp;&emsp;Many early researchers, including J. H. C. Whitehead and Haken, produced flawed proofs, though their work helped lay the foundation for later advances in topology. One mathematician deserves special mention: Christos Dimitriou Papakyriakopoulos (Χρήστος Δημητρίου Παπακυριακόπουλος), known as Papa. He devoted his life to the Poincaré conjecture and even gave up a professorship to pursue it. Near the end of his life, terminally ill with stomach cancer, he handed a manuscript of his proof to a friend. The friend found an error after reading only a few pages but chose not to tell him, allowing Papa to die believing the proof was complete. From the outside, his life may look tragic. Perhaps it did not seem so to him: he had spent it on work he loved.

&emsp;&emsp;William Thurston (10) made the central contribution in the next period. His geometrization conjecture proposed that every three-dimensional manifold could be built from eight basic geometries, with the Poincaré conjecture following as a consequence. A conjecture cannot rigorously prove another conjecture, of course. Thurston eventually stopped pursuing a complete proof for a reason reminiscent of Hilbert's (11): "If I prove it, young people will have nothing left to strive for."

&emsp;&emsp;Less than three years after the Clay Mathematics Institute named the Poincaré conjecture a Millennium Prize Problem, Grigori Perelman completed a proof of Thurston's geometrization conjecture. He posted the first paper on arXiv.org on November 12, 2002, followed by two more over the next six months. Together, the three papers outlined proofs of the Poincaré conjecture and the more general geometrization conjecture, completing the program proposed by Richard Hamilton.

&emsp;&emsp;That nearly completes our introduction, but one question remains. Why did an apparently "obvious" conjecture, stated entirely in ordinary language without mathematical notation, resist proof for ninety-nine years?

&emsp;&emsp;Without advanced mathematics, the source of that difficulty is hard to convey. Another question offers a useful comparison: how would you prove that a closed curve divides the plane into two regions?

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-026-33cbda81f4.png" alt="" />

&emsp;&emsp;The statement looks even more obvious than the Poincaré conjecture, yet its proof is difficult and can be developed using the fundamental group. This is the Jordan curve theorem, whose first correct proof did not appear until 1905. In ordinary language, the theorem seems self-evident. In mathematical language, it reads:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-027-a88e850092.png" alt="" />

&emsp;&emsp;It no longer looks quite so obvious. The same lesson applies to the Poincaré conjecture: a truth that seems evident on the surface is not necessarily easy to understand. That is as true in life as it is in mathematics.

<center><strong>(End)</strong></center>

# Notes

&emsp;&emsp;(1) The computer algebra system used here is Mathematica. The contraction can be displayed as a GIF, but my computer failed while processing the following code. Readers with more capable hardware are welcome to try it:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-028-02cea2560a.png" alt="" />

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-030-8f8f6bac96.png" alt="" />

&emsp;&emsp;(2) This showy three-dimensional solid was generated as follows:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-029-f3bab6c228.png" alt="" />

&emsp;&emsp;(3) Unless otherwise stated, all discussion in this article takes place in real space.

&emsp;&emsp;(4) There are differences, although most topologists before 1935 did not think of them in these terms. Differential topology began to emerge after Hassler Whitney gave a rigorous account of differentiable manifolds. Topologists then moved beyond homeomorphism to consider diffeomorphism, replacing mere continuity with smoothness. A sphere's surface is smooth everywhere, whereas a cube has eight nonsmooth singular points. The two solids are homeomorphic but not diffeomorphic. Unless otherwise stated, this article does not consider differentiable structure.

&emsp;&emsp;(5) The proof of the four-color theorem has an indirect connection to the Poincaré conjecture. While working on the Poincaré conjecture, Wolfgang Haken discovered a fatal error in his argument. The setback reportedly led to compulsive overeating, jokingly called "Poincaré conjecture syndrome." He recovered after turning to the four-color problem and eventually produced a computer-assisted proof of the four-color theorem, although not everyone found that style of proof satisfying.

&emsp;&emsp;(6) Code for plotting the torus:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-032-8de2f68555.png" alt="" />

&emsp;&emsp;(7) Here it is:

<img src="/images/%E6%B5%85%E8%B0%88%E5%BA%9E%E5%8A%A0%E8%8E%B1%E7%8C%9C%E6%83%B3%EF%BC%88%E9%99%84%E6%B3%A8%E9%87%8A%EF%BC%89/fig-035-3b7fb297a3.png" alt="" />

&emsp;&emsp;(8) The image comes from Baidu Baike's article on genus.

&emsp;&emsp;(9) I = [0,1].

&emsp;&emsp;(10) Stephen Smale also made an important contribution, though he did not prove the ordinary three-dimensional conjecture discussed above. Instead, he proved the simpler higher-dimensional version:

&emsp;&emsp;Every closed n-dimensional manifold homotopy equivalent to the n-sphere is homeomorphic to the n-sphere, for n ≥ 5.

&emsp;&emsp;Why is the higher-dimensional conjecture simpler? The answer involves knot theory. In higher dimensions, a closed curve does not become knotted while contracting; in three dimensions, it can.

&emsp;&emsp;(11) Hilbert reportedly declined to work on Fermat's Last Theorem with the remark, "It is a goose that lays golden eggs. Why should I kill it?"
