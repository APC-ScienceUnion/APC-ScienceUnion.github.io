---
layout: post
title: 'Alliance Popular Science: Audio Compression'
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

&emsp;&emsp;Before we begin, consider a question: why compress a file? Unsure, you set the question aside and decide to download something. After opening NetEase Cloud Music, you find several songs you like in the daily recommendations and immediately try to save them. The download menu offers lossless, high, and standard quality. Wanting the best for your ears, you choose lossless, only to be asked to buy a membership. Frustrated, you... choose high quality instead.

&emsp;&emsp;Thinking back to the original question, you wonder whether the high-quality version is simply a compressed form of the lossless one, since its file is smaller. It is. Although the high-quality version does not sound quite as good as the lossless version, it takes up less disk space and is easier to transmit. Compression is therefore important for audio. Of course, it can also persuade people to pay for a membership...

&emsp;&emsp;That is enough of the digression. Let us look at the basic approaches to audio compression, starting with the formula for file size:

&emsp;&emsp;File&nbsp;size&nbsp;=&nbsp;duration&nbsp;*&nbsp;sampling&nbsp;rate&nbsp;*&nbsp;bit&nbsp;depth&nbsp;*&nbsp;number&nbsp;of&nbsp;channels

&emsp;&emsp;Because the duration of an audio recording cannot be changed, we have three options: lower the sampling rate, reduce the bit depth, or use fewer channels.

&emsp;&emsp;First, consider the sampling rate. A higher sampling rate generally produces better audio quality. Common sampling rates are shown below:

<img src="/images/%E3%80%90%E8%81%94%E7%9B%9F%E7%A7%91%E6%99%AE%E3%80%91%E9%9F%B3%E9%A2%91%E4%B8%AD%E7%9A%84%E5%8E%8B%E7%BC%A9/fig-002-4e9be9c3f5.jpg" />

&emsp;&emsp;The lowest rate shown is 11,025 Hz, used for speech and amplitude-modulation (AM) radio. Frequency-modulation (FM) radio uses twice the sampling rate of AM radio. This is one reason car listeners generally choose an FM station rather than an AM station: FM offers better sound quality. If you are curious, compare the two the next time you are in a car.

&emsp;&emsp;Another way to compress audio is to reduce its bit depth. Common bit depths are 8 and 16 bits. Converting a 16-bit audio file of about 10 MB to 8 bits can reduce its size by roughly 5 MB. Ordinary speech, which does not demand high fidelity, generally uses a bit depth of 8 bits. Music that requires better sound quality usually uses 16 bits; few people want to listen to a song buried in noise.

<img src="/images/%E3%80%90%E8%81%94%E7%9B%9F%E7%A7%91%E6%99%AE%E3%80%91%E9%9F%B3%E9%A2%91%E4%B8%AD%E7%9A%84%E5%8E%8B%E7%BC%A9/fig-003-0cf758ba09.jpg" />

&emsp;&emsp;What does the number of channels mean? Stereophonic audio is a method of sound reproduction that generally uses at least two audio channels. The listener perceives sound coming from two directions, giving it spatial depth and making it closer to natural sound. Removing one channel from a two-channel stereo recording halves the file size. This also degrades the sound, so the technique is suitable only for brief sound effects or speech, not for music.

&emsp;&emsp;Audio files are also poorly suited to lossless compression because consecutive audio samples rarely have identical values. Lossy formats such as MP3 are more common. MP3 provides a good compression ratio while preserving acceptable audio quality.
