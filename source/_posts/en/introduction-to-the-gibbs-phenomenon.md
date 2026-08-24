---
layout: post
title: 'An Introduction to the Gibbs Phenomenon'
date: '2020-05-01 18:30:00'
lang: en
translation_key: "吉布斯现象简介"
translation_source_sha256: "752677e24ec34135fc5e9b2d9f6bd4e5cfe49ce4429a380bbc1d564c1954a031"
permalink: en/2020/05/01/introduction-to-the-gibbs-phenomenon/
cover: /images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/cover-2c936f8dd2.jpg
copyright_author: 'phy东西'
aside: true
comments: false
tags: []
categories: []
---

> Author: phy Dongxi

&emsp;&emsp;First-year students taking Calculus II are probably wrestling with Fourier series by now, and many are no doubt complaining about the complicated integrals. Anyone with plotting software, however, has probably tried using trigonometric functions to approximate a periodic function. Careful observers may have noticed a curious effect: when a periodic function with a discontinuity is expanded as a Fourier series and then reconstructed from finitely many terms, adding more terms moves the peaks of the reconstructed waveform closer to the discontinuity. As the number of terms grows, the overshoot approaches a constant value of about 9% of the total jump. This is the Gibbs phenomenon.

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-004-8e6a8a95b6.jpg" alt="" />

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-002-babc96038a.jpg" alt="" />

&emsp;&emsp;Increasing the order does not reduce the overshoot. It only moves the peak closer to the discontinuity. Here is a somewhat informal derivation:

&emsp;&emsp;For convenience, start with a square wave and let its period grow. In the limit, it becomes a step function whose value is 0 for a negative argument and 1 otherwise. This function is clearly not periodic, or equivalently, its period is infinite. How can a nonperiodic function have a Fourier series? As the period approaches infinity, the spacing between adjacent frequencies, the fundamental frequency 1/T, approaches zero and the spectrum becomes continuous. Following this limit further leads to the definition of the Fourier transform. If a function has a Fourier transform, sampling its frequency domain at intervals of 1/T gives the Fourier series of its periodic extension with period T. Keeping only finitely many terms is then equivalent to applying an ideal low-pass filter: frequency components below the cutoff Wc remain, while all others are set to zero. The derivation in the figure produces the result for the Gibbs phenomenon.

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-003-dba1be6376.png" alt="" />

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-005-7f921e7c6d.png" alt="" />
