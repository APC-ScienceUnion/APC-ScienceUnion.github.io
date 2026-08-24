---
layout: post
title: "Unity Development Log 01"
date: '2021-04-24 18:00:00'
lang: en
translation_key: "Unity日志01"
translation_source_sha256: "9c87cbb7ceafa7b980ebdcafc5609c01eb6c543e1a80df4aec3e031e3b2186d3"
permalink: en/2021/04/24/unity-development-log-01/
aside: true
comments: false
tags: []
categories: []
cover: '/images/Unity%E6%97%A5%E5%BF%9701/cover-20bb1b6e09.png'
copyright_author: '深红'
---

> Author: Shenhong

# Preface:

&emsp;&emsp;Hello, everyone—I'm Shenhong. It is a pleasure to meet you. This is the second entry in my personal Unity journal (the first contains some private material, so I will not publish it). It is also the first submission from me and the other members of our current team since we joined the Union. We look forward to getting to know you.

&emsp;&emsp;This series is not a development log. It is my record of learning Unity and of moments that matter during game development. Because it is closer to a diary, I will not go deeply into technical material, nor will entries follow a fixed schedule. I hope to share the joys and frustrations of one person—and a group of people—who chose to develop games because they love playing them. There may also be introductions to the development process. Thank you for reading all that preamble. Let us move on to the main text, and please forgive the rough writing. (P.S. The concepts below are our development team's own jargon, not industry terms.)

&emsp;&emsp;First, let me introduce our team. We have four members: TroyBaN (lead designer and writer), Shiguang (programming and art), RetenQ (programming), and me (programming).

&emsp;&emsp;Why did it take me so long to publish an entry about the 29th? Mostly because I procrastinated. I originally wanted to make it a group effort, but I could not settle on a format and kept putting it off. Before the delay became even more absurd, I decided simply to write it myself.

# Journal Entry:

&emsp;&emsp;This entry tells a story about game design. The process may not have been conventional, but it meant a great deal to me, so I wanted to record the experience and share it.

&emsp;&emsp;March 29, 2021 marked the beginning of West II's fifth-round assessment, which focused on teamwork. TroyBaN and I had collaborated in the previous round on a roguelike card game—my role was programming and his was design. (The legend wrote a 50,000-character design document and spent 5,000 of those characters telling me not to implement saving. Everyone type “real man” in the chat.) That project, however, followed a fixed assignment and reflected an interest we shared, so we reached a conclusion very quickly: what game we wanted to make and how to make it. This assessment was different. Apart from multiplayer collaboration at its core, every technical direction was simply a way to refine the gameplay; there was no prescribed template, so our choice was open. A conflict was inevitable. Everyone wanted to make a game of their own, one they had a genuine hand in creating—not labor on requirements handed down by someone else.

&emsp;&emsp;The previous weekend, after settling on a puzzle game, I wrote an SCP piece (far too informal to publish). Following a brief discussion, I stayed up for a while to finish the plot framework; part of it already existed, so it did not take too long. The next day, we began several hours of online discussion. It appeared that we were defining the framework, but in fact each of us was merely talking about the game we personally wanted to make. No one but TroyBaN realized it. When he later decided that we should start over completely, I was honestly a little disappointed at first.

&emsp;&emsp;To correct this mistaken approach, TroyBaN called an in-person meeting—a historic occasion for the studio, since it was the first time every member had met face to face. The meeting lasted an hour and a half. Speaking as lead designer, TroyBaN analyzed three questions in depth: “What is a puzzle?”, “How do we solve one?”, and “Why do we solve it?” He proposed a complete conceptual framework and encouraged us to brainstorm. Everyone participated enthusiastically and spoke freely. Nearly all the suggestions were highly constructive, and they were adopted. By the end, we had broadly settled the game's three main dimensions—mechanics, story, and form—and answered both what kind of game we would make and how we should make it. The meeting was an enormous success, and I learned a great deal. For the first time, I saw how a designer analyzes a problem and resolves conflict. I also saw how an organizer can help everyone join a discussion without reservation and contribute their own ideas to a game that belongs to the whole team.

# Main Text

## A Brief Account of the Meeting

&emsp;&emsp;(Most of the material comes from TroyBaN's presentation; only the key points are included.)

&emsp;&emsp;First, what is puzzle-solving? At heart, it is “the process of opening a lock with a key,” and that process has three elements: the “lock,” the “key,” and the act of “opening.” In a puzzle game, the lock is the problem the player must solve; the key is the means of solving it; and opening is the method by which the player applies the key to the problem. In Ace Attorney, for example, the lock is the case as a whole, the keys are the testimony and clues the player discovers, and opening is the step-by-step process of exposing the other side's nonsense and reconstructing the truth. Revealing the final truth and winning the argument provide the feedback for opening the lock.

&emsp;&emsp;Once we understood those three elements, we moved to the next question: what kind of puzzle game did we want to design? After a round of brainstorming, we reached a conclusion. We wanted a game with multiple solutions, action-game (ACT) elements, a coherent story, a consistent visual style, and a combination of dynamic and static puzzles. (Consider that a preview.)

&emsp;&emsp;Our first major design question was how to create the keys and locks.

&emsp;&emsp;A puzzle game needs a story—or at least a central thread—even if the game itself contains no text. In a simple game with a clear objective, such as Fireboy and Watergirl, the lock is the problem of reaching the next level.

&emsp;&emsp;This led us to the concepts of the “final lock” and the “prime key.” The final lock is the game's ultimate objective and an essential element of any puzzle game. The prime key guides the player toward discovering the final lock, and its existence also matters in the process of opening that lock. Put simply, it plants foreshadowing. A prime key is not essential to a puzzle game, but it can greatly strengthen the narrative.

&emsp;&emsp;The correspondence between locks and keys was another focal point. As noted above, we wanted multiple solutions. One lock should therefore open with different keys, and the same key might even open different locks through different processes of “opening.” That called for another round of brainstorming.

&emsp;&emsp;Since the game included ACT elements, we decided to be bold. We would design two kinds of locks: “dynamic puzzles” and “static puzzles.” A dynamic puzzle is solved through interaction with the environment; Fireboy and Watergirl offers a useful example. Static puzzles take a more traditional form, as in the Cube Escape series, so I will not elaborate here.

&emsp;&emsp;In an ACT puzzle game, the keys would consist of both information and abilities. Information needs little explanation; abilities might include double-jumping or seeing through objects, though we have not settled on them yet. This design has two benefits. Gaining a new ability lets the player see the protagonist grow, providing positive feedback. It also diversifies the solutions and greatly increases replayability.

&emsp;&emsp;Those were the main ideas behind our game design. The discussion contained plenty of other interesting material, but I have omitted it because it was not central.

# —Afterword—

&emsp;&emsp;Everyone involved is a newcomer: university students who chose game development because they love games. We still have much to learn and will inevitably make mistakes. Whatever happens, we hope for your support and will welcome fair criticism. Above all, thank you for reading this far.

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-002-706836600d.png" />

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-003-99061c6316.png" />

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-004-80e97058d1.png" />

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-005-1ea3f042d8.png" />

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-006-e85e6f4ae7.png" />

<img src="/images/Unity%E6%97%A5%E5%BF%9701/fig-007-45f5da8616.png" />

<center><font size=2px color=grey>(These images show material from our meeting. Thanks to RetenQ for recording it. The content is rather abstract—do not ask what it means, because even we can no longer understand it.)</font></center>
