---
layout: post
title: 'Some Simple Thoughts Inspired by a Rolling Spring'
date: '2020-09-26 20:00:00'
lang: en
translation_key: "由滚动的弹簧引发的简单思考"
translation_source_sha256: "c1e0c7ed7cd55ece684c9acd8e284ab6d442429391d000dd09344de1b2ebaf05"
permalink: en/2020/09/26/simple-thoughts-inspired-by-a-rolling-spring/
cover: /images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/cover-98c44c240e.jpg
copyright_author: 'phy东西'
aside: false
comments: false
tags: []
categories: []
---

> Author: phy Dongxi

&emsp;&emsp;(A text-heavy popular-science article—lots of reading ahead)

&emsp;&emsp;Most of us played with springs as children: the springs in retractable pens, for example, or those in a Rubik’s Cube (yes, I somehow bring up the Rubik’s Cube every three sentences). Screw-like springs turn up everywhere:

<img src="/images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/fig-002-32dbb47481.jpg" alt="" />

&emsp;&emsp;When you roll this spring across a tabletop, you seem to see a train of waves traveling from one end to the other. Similarly, when a drill bit or the red, white, and blue pole outside a barbershop rotates, its spiral appears to keep “emerging” from one end and disappearing at the other. It looks like a wave in motion.

&emsp;&emsp;We can calculate this wave’s speed quite easily. Suppose the helix has radius r, rotational frequency f, and pitch h. The “wave” we observe is the helix’s projection onto a plane parallel to its central axis, as shown below:

<img src="/images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/fig-006-f37f8577d8.gif" alt="" />

&emsp;&emsp;During one period, 1/f, the wave “advances” by one pitch h, giving it a speed of hf. A point on the helix, meanwhile, moves in a circle around the central axis at a speed of 2πrf. Comparing the two shows that whenever h>2πr, the wave’s apparent speed can exceed the speed of light even though no point on the helix does.

&emsp;&emsp;Great! The edifice of physics comes crashing down... Or does it?

&emsp;&emsp;No. This wave carries no information. The trajectory of every point is predetermined, rather like the spectators in a stadium wave; the result merely looks like a traveling wave.

&emsp;&emsp;Can we use a more complicated helix instead? Yes, as the next two figures show:

<img src="/images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/fig-008-178b339483.gif" alt="" />

<img src="/images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/fig-003-b01340cb57.gif" alt="" />

&emsp;&emsp;The blue curve is the projection of the red one. Points of equal phase, represented by successive extrema, keep moving to the right; this is the phase velocity. The helix itself, however, merely rotates in place, and the wave’s complex envelope, or the helix’s “outer contour,” does not advance. The speed at which the overall envelope moves can be regarded as the group velocity: the speed shared by the wave as a whole.

&emsp;&emsp;The following figure gives an intuitive picture:

<img src="/images/%E7%94%B1%E6%BB%9A%E5%8A%A8%E7%9A%84%E5%BC%B9%E7%B0%A7%E5%BC%95%E5%8F%91%E7%9A%84%E7%AE%80%E5%8D%95%E6%80%9D%E8%80%83/fig-011-435bc7a54e.gif" alt="" />

&emsp;&emsp;As an example, take two very close angular frequencies, ω1 and ω2, with ω1,ω2≈ω. The two waves satisfy cos(ω1t-k1x)+cos(ω2t-k2x)=2cos(ωt-kx)cos[(ω1-ω2)t/2-(k1-k2)x/2]. The first, high-frequency factor is the carrier moving forward, while the second, very slowly varying factor describes the propagation of the wave’s shape.

&emsp;&emsp;For a detailed derivation, see Section 48 of *The Feynman Lectures on Physics, Vol. I*.

&emsp;&emsp;For a given signal, then, if we regard it as the projection of some helix, can we reconstruct the corresponding “helix”? That is precisely what the Hilbert transform does. It is a somewhat complicated integral transform, and an improper integral at that, so in some cases its value must be taken as a Cauchy principal value. In shorthand, it is the convolution of the original signal with 1/πt.

&emsp;&emsp;The Hilbert transform has even broader applications in communications. Obtaining a signal’s complex envelope allows a bandpass signal and system to be converted into an equivalent baseband signal and system. Because this requires a foundation in Fourier transforms, we will not go into further detail here.

&emsp;&emsp;For detailed applications, see Chapter 2 of *Principles of Communication* by Zhou Jiongpan et al., published by Beijing University of Posts and Telecommunications Press.
