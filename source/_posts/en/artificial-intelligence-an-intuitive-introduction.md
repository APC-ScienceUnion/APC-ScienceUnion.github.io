---
layout: post
title: Artificial Intelligence — An Intuitive Introduction
date: 2019-08-25 09:09:00
lang: en
translation_key: "人工智能(AI) 通俗演义"
translation_source_sha256: "b07ed0a91ea90f2ffb60d15f5a47b15bd4c92907a3a1336eedd0b92d9c120951"
permalink: en/2019/08/25/artificial-intelligence-an-intuitive-introduction/
aside: false
comments: false
tags: []
categories: []
copyright_author: '面皮(Mepy)'
cover: /images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/cover-77aa732b51.jpg
---

> Author: 面皮 (Mepy)  
> Reviewer: 东达

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/cover-77aa732b51.jpg" title="Left: people who know nothing about AI think it will take over the world. Right: my AI neural network identifies a cat as a dog." />

<center><font size=2px color=grey>Left: people who know nothing about AI think it will take over the world. Right: my AI neural network identifies a cat as a dog.</font></center>

&emsp;&emsp;Artificial intelligence, or AI, is the attempt to reproduce aspects of human intelligence by artificial means. Those means are mainly mathematical and involve many different formulas. We generally call these methods “algorithms.”

# Imitation

&emsp;&emsp;Before we can imitate human intelligence, we need to understand how human intelligence processes a problem. Consider the task of recognizing handwritten digits.

&emsp;&emsp;First, a person receives an image through the eyes—the two crooked handwritten digits shown on the right, for example. Neurons then carry that visual information to the brain's processing centers. Finally, the brain assigns meaning to the image.

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-001-d592ef6d0a.jpg" />

&emsp;&emsp;In short, a human reads a digit in three stages: input, processing, and output.

&emsp;&emsp;Input and output are both straightforward for a computer. Sending a photograph to the machine is input. Each pixel in a grayscale image is represented by a number from 0 to 1, where 0 means white, 1 means black, and values in between represent different shades of gray. A large collection of these pixel values represents an image. In a color image, each pixel requires three or four numbers, as in the RGBA format. We will leave that subject aside, though interested readers can look it up after finishing this article. A computer's output can be a number or an image displayed on a screen.

&emsp;&emsp;How, then, can a computer imitate the brain's processing? That is the difficult part of AI.

# A Probability Function

&emsp;&emsp;To make the example easier, we will reduce the task to deciding whether a handwritten image shows the digit “4.”

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-001-d592ef6d0a.jpg" />

&emsp;&emsp;At a glance, we feel certain that the image on the left is a 4 and the image on the right is not. Put in terms of probability, our brain might judge the left image to be 99% likely to show a 4 and the right image to be 100% certain not to show one.

&emsp;&emsp;The brain has made a probabilistic judgment: it has estimated how likely the image is to be a 4. As children, we learn to recognize the digit by seeing many examples. Eventually, the brain can decide whether a new image is a 4 and, if so, how confident that judgment should be. By analogy, we can show a computer many images of 4s and teach it to make a probability judgment of its own.

&emsp;&emsp;We will need a little mathematics to do that, but nothing too intimidating.

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-002-482596e6e5.jpg" />
<center><font size=2px color=grey>In this example, the image is identified as the digit 4 with 100% probability.</font></center>

&emsp;&emsp;How should the probability function P(X) be calculated? A computer will not work it out by itself; it needs an algorithm. We therefore have to design a mathematical method.

&emsp;&emsp;Recall that a grayscale photograph stores one number for each pixel. Let us begin with a single pixel and call its value x. If x > 0.5, the pixel is closer to black; if x < 0.5, it is closer to white. If a probability function P(x) is meant to estimate how likely the pixel is to be black, the simplest formula is P(x) = x. In other words, the computer reads the value directly: above 0.5 means black, and below 0.5 means white. This is the simplest case, involving one pixel, one variable, and one dimension.

&emsp;&emsp;A handwritten-digit image that is 28 pixels long and 28 pixels wide contains 28 × 28 = 784 pixel values.

&emsp;&emsp;Write those 784 numbers vertically in a fixed order to form a 784-dimensional vector X. X now represents the image, and each number is one component of the vector. We write the nth component as X[n]. Different images produce different X values, while identical images produce identical X values, so all 784 components must appear in the formula related to P(X).

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-003-a2937df871.jpg" />

&emsp;&emsp;The equation most familiar to most people is probably a linear equation in one variable. A pair of linear equations is not much harder: solve them simultaneously. In school, functions are likewise introduced through linear functions of one variable. Linear form seems to make a problem simpler and clearer, so we will write P(X) as a linear function of 784 variables.

&emsp;&emsp;That sounds complicated at first—784 variables!

&emsp;&emsp;Start with the one-variable function y = w·x + b. Here x is multiplied by a coefficient w before the constant b is added. The 784-variable version follows the same pattern. Each component X[n] of the vector X is multiplied by its own coefficient Wn, and the constant b is added at the end.

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-004-2a60904c54.jpg" />

&emsp;&emsp;It still looks fairly complicated.

&emsp;&emsp;Different X vectors represent different images, and their differences include the order of their components—the locations of the dark pixels in the photograph. The 784 values of W therefore cannot all be the same. If they were, the position of each component of X would not matter, because every component would be multiplied by the same W and produce the same probability. W must therefore also have 784 components. For convenience, we write them vertically as a 784-dimensional vector W and express the multiplication of each W component by the corresponding X component as a dot product.

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-005-6d1641e5ab.jpg" />

&emsp;&emsp;We now have a formula for P(X), but it is not yet complete.

&emsp;&emsp;Think about this first: must the output of P(X) always lie between 0 and 1?

&emsp;&emsp;A probability must be a number in [0,1]. It can be neither negative nor greater than 1. Our linear function of 784 variables, however, can return essentially any value. Let us rename it Z(X), so Z(X) = W·X + b. We then wrap Z(X) in an activation function g(Z), which forces its output into the interval from 0 to 1. The function used here is the sigmoid function.

<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-006-fbc64a3d65.jpg" />
<img src="/images/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%28AI%29%20%E9%80%9A%E4%BF%97%E6%BC%94%E4%B9%89/fig-007-cf5411035b.jpg" />

&emsp;&emsp;This gives us the probability function P(X): feed it an image, and it returns the probability that the image shows a 4.

# The Road Ahead

&emsp;&emsp;Putting research into practice is never effortless, and our exploration remains far from complete. The road toward artificial intelligence is still a difficult one.

&emsp;&emsp;Consider these questions:

1. In what ways is the mathematical function P(X) constructed above similar to a human nervous system?
2. In P(X) = W·X + b, X is the input data representing an image, while W and b are constants that must be known in advance. How can those constants be found? Think back to how we learned the digit 4 as children by seeing many examples.

> Note: The example of recognizing whether an image shows “4” is used only to introduce the basic idea behind one class of models in AI and machine learning.

# References
1. https://www.bilibili.com/video/av15532370
2. https://study.163.com/topics/deepLearning/
