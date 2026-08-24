---
layout: post
title: 'APC Science Union Explainer: Audio Compression'
date: '2020-11-04 12:00:00'
lang: en
translation_key: "【联盟科普】音频中的压缩"
translation_source_sha256: "9ee33667a1bd4161425631cb1b152a2db582d4d45915207bd2bc7afb4f2dad4c"
permalink: en/2020/11/04/audio-compression/
cover: '/images/%E3%80%90%E8%81%94%E7%9B%9F%E7%A7%91%E6%99%AE%E3%80%91%E9%9F%B3%E9%A2%91%E4%B8%AD%E7%9A%84%E5%8E%8B%E7%BC%A9/cover-ec1b56f9e6.jpg'
copyright_author: '时光'
aside: true
comments: false
tags: []
categories: []
---

> Author: Shiguang

Reviewer: Baiyan

&emsp;&emsp;Before we begin, here is a question: why compress a file? Unsure of the answer, you put the question aside and decide to download something. You open NetEase Cloud Music, find several songs you love in the daily recommendations, and excitedly decide to claim them for your own. The download menu offers lossless, high, and standard quality. Naturally, you want to treat your ears well, so you choose lossless, only for the app to ask you to buy a membership. Outraged, you... choose high quality instead.

&emsp;&emsp;Now the original question comes back to you. Is the high-quality version simply a compressed form of the lossless one? After all, its file is smaller. The answer is yes. It may not sound quite as nice as the lossless version, but it takes up less disk space and is easier to transmit. Compression is therefore important for audio. Of course, it can also tempt people into paying for a membership...

&emsp;&emsp;But enough of that digression. Let us look at the basic approaches to audio compression, beginning with the formula for file size:

&emsp;&emsp;File&nbsp;size&nbsp;=&nbsp;duration&nbsp;*&nbsp;sampling&nbsp;rate&nbsp;*&nbsp;bit&nbsp;depth&nbsp;*&nbsp;number&nbsp;of&nbsp;channels

&emsp;&emsp;Because we cannot change the duration of an audio recording, we have three options: lower the sampling rate, reduce the bit depth, or use fewer channels.

&emsp;&emsp;First, consider the sampling rate. In general, a higher sampling rate produces better audio quality. Some common rates are shown below:

<img src="/images/%E3%80%90%E8%81%94%E7%9B%9F%E7%A7%91%E6%99%AE%E3%80%91%E9%9F%B3%E9%A2%91%E4%B8%AD%E7%9A%84%E5%8E%8B%E7%BC%A9/fig-002-4e9be9c3f5.jpg" />

&emsp;&emsp;The lowest rate shown is 11,025 Hz, used for speech and amplitude-modulation (AM) radio. Frequency-modulation (FM) radio uses twice the sampling rate of AM. That is one reason drivers generally tune to an FM station rather than an AM one: FM sounds better. If you are curious, compare the two the next time you are in a car.

&emsp;&emsp;Another way to compress audio is to reduce its bit depth. Common bit depths are 8 and 16 bits. Converting an approximately 10 MB file from 16-bit to 8-bit audio can cut its size by roughly 5 MB. Ordinary speech, which does not demand high fidelity, generally uses 8 bits. Music, where sound quality matters more, usually uses 16 bits; nobody wants to hear a song buried in noise.

<img src="/images/%E3%80%90%E8%81%94%E7%9B%9F%E7%A7%91%E6%99%AE%E3%80%91%E9%9F%B3%E9%A2%91%E4%B8%AD%E7%9A%84%E5%8E%8B%E7%BC%A9/fig-003-0cf758ba09.jpg" />

&emsp;&emsp;What does the number of channels mean? Stereophonic audio is a method of sound reproduction that generally uses at least two channels. The listener hears sound coming from two directions, creating a sense of space and making the recording feel more natural. Remove one channel from a two-channel stereo recording, and the file size is cut in half. The sound also suffers, so this technique is suitable only for short sound effects or speech, not music.

&emsp;&emsp;Audio files are also a poor fit for lossless compression because consecutive samples rarely have the same value. Lossy formats such as MP3 are more common. MP3 offers a good compression ratio while keeping the sound quality acceptable.
