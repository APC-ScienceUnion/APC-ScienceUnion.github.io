---
layout: post
title: "An Introduction to Blindfolded Cubing"
date: 2019-09-10 15:00:00
lang: en
translation_key: "魔方盲拧浅谈"
translation_source_sha256: "2e1b8fd5b430b9888c1a0dd02f0095d05c6157628b3705f8b24aa970e880c283"
permalink: en/2019/09/10/introduction-to-blindfolded-cubing/
aside: true
comments: false
tags: []
categories: []
copyright_author: 'phy东西'
cover: /images/%E9%AD%94%E6%96%B9%E7%9B%B2%E6%8B%A7%E6%B5%85%E8%B0%88/cover-b4d3392c74.jpg
---

> Author: phy东西
> Reviewer: 丛雨

&emsp;&emsp;To most noncubers and beginners, solving a cube blindfolded looks like an extraordinary feat, so it has always attracted plenty of attention. I have even been asked, “Hey, can you do that thing where you solve a Rubik's Cube with your eyes closed?” Blindfolded solving is not as mysterious as it seems, however. This article explains the basic idea without going too deeply into any particular method. I am not an expert blindfolded solver, so I will inevitably leave some things out; I hope readers will bear with me.

&emsp;&emsp;Every algorithm in this article can be entered in the Moves field at https://alg.cubing.net/ for a demonstration. Be sure to distinguish Chinese punctuation from English punctuation when typing. We will begin with two pieces of notation: [A:B] and [A,B]. [A:B] means performing A, then B, and finally the inverse of A; A is also called the setup. [A,B] is a commutator: perform A and B in order, followed by their inverses in the same order. For a fuller treatment of commutators, see a group theory textbook.

<img src="/images/%E9%AD%94%E6%96%B9%E7%9B%B2%E6%8B%A7%E6%B5%85%E8%B0%88/cover-b4d3392c74.jpg" />

&emsp;&emsp;Now consider the following algorithm, with white on top and green in front: [M,E]. If the notation is unfamiliar, enter it on the website above to watch the moves. The algorithm cycles the center pieces on the U (up), F (front), and R (right) faces counterclockwise; it also cycles the centers on D (down), B (back), and L (left). We therefore call it a “3-cycle.” Because the edges and corners remain unchanged, we need to follow only the centers. Expanded, [M,E] is M E M'E'. First, M moves the white center to the point where the E and M slices intersect on the F face, which we will call the buffer slot. The white center replaces the green center and pushes it onto the D face. Next, E' moves the red center into the buffer slot. The red center takes the white center's original position, meaning the position between the white-green and white-blue edges rather than the center of the top face. Then M' pulls the red center onto the U face while the green center takes the red center's former position. Finally, E pulls the white center back to the F face and the green center to the R face, completing the counterclockwise cycle.

&emsp;&emsp;Next, consider an algorithm that may be more familiar to solvers who use a layer-by-layer method: x R'U R'D2 R U'R'D2 R2 x'. In the notation introduced above, it is [x R2:[R U R',D2]]. The reasoning is the same, except that the initial x R2 is a setup that moves the three target corners into convenient positions. After the exchange, the pieces return along the same path in reverse. The result is a 3-cycle of the top-layer corners.

&emsp;&emsp;What do 3-cycles have to do with blindfolded solving? They are the mechanism that makes it work. The corner 3-cycle above, for example, moves only three corners without disturbing any other pieces. During a solve, we first designate one position as the buffer. A 3-cycle moves the piece currently in the buffer, denoted a, to its correct position, A. It then moves the incorrect piece at A, denoted b, to its correct position, B. The piece at B cycles back into the buffer. We encode the operation by the two positions visited, producing the letter pair AB.

&emsp;&emsp;Here is a slightly more involved example. Capital letters represent positions, while the corresponding lowercase letters represent the pieces that belong there:

&emsp;&emsp;Suppose the starting sequence is AcBeCbDaEd, with A as the buffer. First perform CB, producing the 3-cycle A-C-B-A. Piece c moves from A to its correct position at C; piece b moves from C to its correct position at B; and piece e cycles from B back to buffer A. The sequence can now be written as AeBbCcDaEd. Next perform ED. By the same process, the sequence becomes AaBbCcDdEe and the cube is fully solved. In essence, blindfolded solving means tracing this route, memorizing only the letter pairs CB and DE in order, and then recalling the corresponding algorithms during the solve.

&emsp;&emsp;That is the basic idea behind blindfolded solving. Its many special cases, including parity, short cycles, and flipped or twisted pieces, require a full tutorial of their own.

# Further Reading
1. Spoon's 3×3 blindfolded-solving tutorial: http://bbs.mf8-china.com/forum.php
