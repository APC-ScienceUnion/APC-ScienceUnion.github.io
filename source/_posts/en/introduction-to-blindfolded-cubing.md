---
layout: post
title: "An Introduction to Blindfolded Cubing"
date: 2019-09-10 15:00:00
lang: en
translation_key: "魔方盲拧浅谈"
translation_source_sha256: "2e1b8fd5b430b9888c1a0dd02f0095d05c6157628b3705f8b24aa970e880c283"
permalink: en/2019/09/10/introduction-to-blindfolded-cubing/
aside: false
comments: false
tags: []
categories: []
copyright_author: 'phy东西'
cover: /images/%E9%AD%94%E6%96%B9%E7%9B%B2%E6%8B%A7%E6%B5%85%E8%B0%88/cover-b4d3392c74.jpg
---

> Author: phy东西
> Reviewer: 丛雨

&emsp;&emsp;To most people and novice cubers, blindfolded solving looks like an extraordinary feat, and it has long attracted a great deal of attention. I have even been asked, “Hey, can you do that thing where you solve a Rubik’s Cube with your eyes closed?” In reality, blindfolded solving is not as mysterious as it seems. This article explains its basic logic without going too deeply into specific methods. I am not an expert blindfolded solver, so there will inevitably be omissions; I hope readers will bear with me.

&emsp;&emsp;Every algorithm mentioned here can be entered in the Moves field at https://alg.cubing.net/ for a demonstration. When entering them, pay attention to the difference between Chinese and English punctuation. We will begin with two forms of notation: [A:B] and [A,B]. [A:B] means performing operation A, then operation B, and finally the inverse of A; A may also be called the setup. [A,B] is a commutator: perform A and B in order, then perform the inverses of A and B in order. For more on commutators, consult a textbook on group theory.

<img src="/images/%E9%AD%94%E6%96%B9%E7%9B%B2%E6%8B%A7%E6%B5%85%E8%B0%88/cover-b4d3392c74.jpg" />

&emsp;&emsp;Now consider the following algorithm, with white on top and green in front: [M,E]. Readers unfamiliar with these two symbols can enter them on the website above to see the moves. The result is a counterclockwise cycle of the center pieces on the U (up), F (front), and R (right) faces—and, in fact, also the three on the D (down), B (back), and L (left) faces. We therefore call it a “3-cycle.” To understand the process, note that the edge and corner pieces are unchanged, so we only need to discuss the centers. Expanded, [M,E] is M E M'E'. First, M moves the white center to the point where the E and M slices intersect on the F face, which we will call the buffer slot. The white center takes the green center’s place, pushing the green center onto the D face. Second, E' moves the red center into the buffer slot. The red center takes the white center’s original position—meaning the position between the white-green and white-blue edges, rather than the center of the top face. Third, M' pulls the red center onto the U face, while the green center takes the red center’s former position. Finally, E pulls the white center back to the F face and the green center to the R face, completing the counterclockwise cycle of the three centers.

&emsp;&emsp;Next, consider an algorithm that may be more familiar to solvers who use a layer-by-layer method: x R'U R'D2 R U'R'D2 R2 x'. In the notation introduced above, it is [x R2:[R U R',D2]]. The analysis is the same as before, except that the initial x R2 acts as a setup, moving the three corners to be cycled into convenient positions. Once the exchange is complete, the pieces are returned along the same path in reverse. The result is a 3-cycle of the corners on the top layer.

&emsp;&emsp;What do 3-cycles have to do with blindfolded solving? Blindfolded methods work by using precisely these cycles. The corner 3-cycle above, for example, moves only three corners without disturbing any other pieces. During a solve, we first designate one position as the buffer. We use a 3-cycle to move the piece currently in the buffer, denoted a, to its correct position, denoted A. We then move the incorrect piece now at A, denoted b, to its own correct position, B. The piece at B is subsequently moved back into the buffer. We can encode this process using the two positions visited, giving the letter pair AB.

&emsp;&emsp;Here is a slightly more involved example. Capital letters represent positions, and the corresponding lowercase letters represent the pieces that belong in them:

&emsp;&emsp;Suppose the starting sequence is AcBeCbDaEd, with A as the buffer. First perform CB, producing the 3-cycle A-C-B-A. This sends piece c from position A to position C, solving C; sends piece b from C to B, solving B; and cycles piece e from B back to buffer A. Rewriting the sequence gives AeBbCcDaEd. Next perform ED. Following the same process, the sequence becomes AaBbCcDdEe, and the puzzle is completely solved. In essence, blindfolded solving consists of identifying the route, memorizing only the letter pairs CB and DE in order, and then using the corresponding algorithms from memory during the solve.

&emsp;&emsp;This is the basic idea behind blindfolded solving. A full tutorial is still needed to cover its many special cases, including parity, short cycles, and flipped or twisted pieces.

# Further Reading
1. Spoon’s 3×3 blindfolded-solving tutorial: http://bbs.mf8-china.com/forum.php
