---
layout: post
title: "Building a Merge Watermelon Game in Unity"
date: '2021-01-31 11:30:00'
lang: en
translation_key: "用Unity简单实现合成大西瓜"
translation_source_sha256: "df3d5985468c60f7fbba7fb3acf99a19162078e0e56f4c4c02b3ea4f43b0966e"
permalink: en/2021/01/31/build-a-merge-watermelon-game-in-unity/
aside: true
comments: false
tags: []
categories: []
cover: '/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/cover-06c6bb724b.png'
copyright_author: '时光（逸仙工作室）'
---

> Author: Shiguang (Yixian Studio)

Reviewed by: Baiyan

&emsp;&emsp;A game called *Merge Watermelon* recently swept through Qzone. After getting hooked, players jokingly began calling themselves “watermelon people.” Memes, parody images, and Watermelon bots soon followed, along with spin-offs such as *Liver-Saving Merge Watermelon*, *Merge Tiny Grapes*, and *Merge a Great Nation*...... This article looks at how to build a *Merge Watermelon* game in Unity.

# Step 1: Gathering assets

&emsp;&emsp;The assets, or textures, determine what the fruit looks like. Replace them with other elements—say, breasts (ahem), Polandballs, or something similar—and you can make parody versions such as *Merge a Great Nation*.

&emsp;&emsp;To keep things simple (actually, because I cannot draw), I drew a few balls to represent the fruit:

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-002-7887747208.png" />

&emsp;&emsp;From left to right, they represent a grape, a little cutie, an orange, a lemon, a kiwifruit, a tomato, half a watermelon, and a whole watermelon. The rule is that two fruits of the same level merge into a fruit one level higher. You win once you create the watermelon.

&emsp;&emsp;I left out intermediate fruits such as coconuts and potatoes from the merge chain. The principle is the same, so there was no need to draw them~~ (All right, I was simply being lazy.~~)

# Step 2: UI

&emsp;&emsp;I designed a simple UI:

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-003-5a3067160b.png" />

&emsp;&emsp;The UI has three main parts. The first is the white image at the top, which displays the fruit that will appear next. The second is the score in the upper-left corner, which tracks the points earned by merging fruit. The third consists of the left, right, and bottom boundaries. Each has a collider to keep fruit from falling out of the screen.

&emsp;&emsp;With these two parts ready, we can start planning the program.

# Step 3: Programming and implementation

&emsp;&emsp;The basic idea is to give every fruit a 2D rigidbody and a 2D circle collider, then instantiate the corresponding “next fruit” at the x-coordinate where the mouse is clicked. When two fruits collide, they are destroyed, a higher-level fruit is created, and the score increases.

&emsp;&emsp;First, we need to instantiate the next fruit at the mouse pointer's x-coordinate. Because fruit objects will be destroyed, we cannot instantiate the original object directly; otherwise, once that source object is destroyed, we can no longer create new instances from it. The solution is to make a copy of the source object and perform all instantiation and destruction on those copies.

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-004-2e925de4a0.png" />

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-005-e334ac6ad6.png" />

&emsp;&emsp;As the two images show, the objects marked with the `public` access modifier are the original fruit objects, while the implicitly declared objects below them are the corresponding copies. After a mouse click, the program uses the random number it has generated to select a fruit and instantiates it at the mouse pointer's world-space x-coordinate. Here, `5.0f` is a fixed y-coordinate, which makes the fruit fall from the top of the screen.

&emsp;&emsp;Next, we make two identical colliding fruits disappear, “merge” them into the next fruit, and award points. Here is the grape as an example:

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-006-d6d2351024.png" />

&emsp;&emsp;Four things happen here: the collision Boolean is set to `true`, 10 points are added to the score, the collision position is recorded, and the two colliding objects are destroyed.

&emsp;&emsp;You may notice that I do not create the next-level object inside the collision event. Both colliding fruits have colliders, so this method is actually called twice, once by each fruit. If we instantiated the next-level fruit directly inside this method, we would get two fruits pressed together. They would merge immediately and rush straight to the end of the chain: the watermelon.

&emsp;&emsp;Instead, I use a Boolean flag. Another class checks it in `LateUpdate` and instantiates the next-level fruit there, which prevents two copies from being created:

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-007-3793bfeb2c.png" />

&emsp;&emsp;The last step is to generate the random “next fruit.” This is straightforward: use a random number to choose one.

<img src="/images/%E7%94%A8Unity%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0%E5%90%88%E6%88%90%E5%A4%A7%E8%A5%BF%E7%93%9C/fig-008-5b514b839a.png" />

# Conclu&nbsp; sion

&emsp;&emsp;Those are the basic ideas. This roughly 200-line remake of *Merge Watermelon* can already reproduce most of the original game's features. It still lacks a loss condition (which could be implemented with a trigger plus timing in `FixedUpdate` (~~I was too lazy; besides, I never lose anyway~~)) and some “exciting” sound effects (heavy sarcasm), and it still does not feel quite as good as the original~
