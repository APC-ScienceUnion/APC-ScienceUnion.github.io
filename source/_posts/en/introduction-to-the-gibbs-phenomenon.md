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

&emsp;&emsp;First-year students taking the second semester of calculus are probably wrestling with Fourier series by now, and many will be complaining about the complicated integrals. Anyone with plotting software, however, has probably tried approximating periodic functions with trigonometric functions. Careful observers may have noticed something: when a periodic function with a discontinuity is expanded as a Fourier series and reconstructed from finitely many terms, increasing the number of terms moves the peaks in the reconstructed waveform closer to the discontinuity. For a large number of terms, the overshoot approaches a constant—about 9% of the total jump. This is the Gibbs phenomenon.

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-004-8e6a8a95b6.jpg" alt="" />

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-002-babc96038a.jpg" alt="" />

&emsp;&emsp;Increasing the order does not reduce the overshoot; it only moves its peak closer to the jump. Here is a somewhat informal derivation:

&emsp;&emsp;For convenience, begin with a square wave and keep increasing its period. In the limit it becomes a step function: its value is 0 when the argument is negative and 1 otherwise. Clearly, this function is not periodic; equivalently, its period is infinite. How, then, can a nonperiodic function have a Fourier series? As the period tends to infinity, the spacing between adjacent frequencies, namely the fundamental frequency 1/T, shrinks to zero, so the spectrum becomes continuous. Pursuing this limit further leads to the definition of the Fourier transform. If a function has a Fourier transform, sampling its frequency domain at intervals of 1/T gives the Fourier-series representation of its periodic extension with period T. Retaining only finitely many terms is then equivalent to an ideal low-pass filter: components below the cutoff Wc remain, while all others are set to zero. The derivation in the figure yields the Gibbs-phenomenon result.

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-003-dba1be6376.png" alt="" />

<img src="/images/%E5%90%89%E5%B8%83%E6%96%AF%E7%8E%B0%E8%B1%A1%E7%AE%80%E4%BB%8B/fig-005-7f921e7c6d.png" alt="" />
