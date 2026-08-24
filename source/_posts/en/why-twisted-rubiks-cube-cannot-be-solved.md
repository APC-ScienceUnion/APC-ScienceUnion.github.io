---
layout: post
title: Why a Rubik's Cube with One Twisted Corner Cannot Be Solved
date: 2019-09-06 09:09:00
lang: en
translation_key: "转角的魔方为何不能复原"
translation_source_sha256: "f96b0af990cda97c568ea4c1d6de3336ff2acb3b7baf15e8bd636ee80fbf0df1"
permalink: en/2019/09/06/why-twisted-rubiks-cube-cannot-be-solved/
aside: true
comments: false
tags: []
categories: []
copyright_author: 'phy东西'
cover: /images/%E8%BD%AC%E8%A7%92%E7%9A%84%E9%AD%94%E6%96%B9%E4%B8%BA%E4%BD%95%E4%B8%8D%E8%83%BD%E5%A4%8D%E5%8E%9F/cover-caaef8600f.jpg
---

> Author: phy东西
> Reviewed by: A Millisecond of Eternity

&emsp;&emsp;When many people first learn to solve a 3×3 Rubik's Cube, they reach the top layer, run into a case they do not know how to handle, and twist a few corner pieces into place. But if we accidentally twist a single corner, the top layer may take on a configuration we have never seen before. This raises a question: why does twisting one corner make the cube impossible to solve?

&emsp;&emsp;To answer it, we first need to define a quantity for the cube: corner orientation.

<img src="/images/%E8%BD%AC%E8%A7%92%E7%9A%84%E9%AD%94%E6%96%B9%E4%B8%BA%E4%BD%95%E4%B8%8D%E8%83%BD%E5%A4%8D%E5%8E%9F/fig-001-7be92fce4c.jpg" title="Diagram of Rubik's Cube orientations. The letters abbreviate face names—for example, U stands for Up, the top face. | Credits: wikiHow" />
<center><font size=2px color=grey>Diagram of Rubik's Cube orientations. The letters abbreviate face names—for example, U stands for Up, the top face. | Credits: wikiHow</font></center>

&emsp;&emsp;Most solvers begin with white on the bottom, and the standard color scheme places yellow opposite white. We therefore adopt the following convention. With the yellow and white centers facing up and down respectively, a corner is correctly oriented if its yellow—or white—sticker faces up—or down—and we assign it the value 0. If a corner must be twisted clockwise to reach the correct orientation, we assign its current state the value 1. Symmetrically, if it must be twisted counterclockwise to reach the correct orientation, we assign it the value -1.

<img src="/images/%E8%BD%AC%E8%A7%92%E7%9A%84%E9%AD%94%E6%96%B9%E4%B8%BA%E4%BD%95%E4%B8%8D%E8%83%BD%E5%A4%8D%E5%8E%9F/cover-caaef8600f.jpg" title="In this image, the upper-front-left corner has value -1, the upper-front-right corner has value 1, and all other corners are correctly oriented and have value 0." />
<center><font size=2px color=grey>In this image, the upper-front-left corner has value -1, the upper-front-right corner has value 1, and all other corners are correctly oriented and have value 0.</font></center>

&emsp;&emsp;Now take a solved 3×3 cube and place yellow on top. Under the convention above, the orientation values of all its corners add up to 0. Turn any face—for example, rotate the face toward us clockwise. The orientation values of the four front corners become 1, -1, 1, and -1 in sequence, while the four rear corners remain at 0. The cube's total orientation value is still 0. Similar reasoning leads to the following conclusion: starting from a solved 3×3 cube, the sum of the corner orientations of any state reached using only face turns is always an integer multiple of 3. Twisting just one corner breaks this invariant: the sum of the corner orientations is no longer a multiple of 3. The cube therefore cannot be restored using face turns.

&emsp;&emsp;A Rubik's Cube holds many more surprises. For example, a cube assembled at random has only a 1/12 chance of being solvable; some positions can be solved using only R and U turns, while others cannot. You can uncover much more by exploring these questions yourself.

