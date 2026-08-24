---
layout: post
title: 'Artificial Intelligence: An Intuitive Introduction'
date: 2019-08-25 09:09:00
lang: en
translation_key: "人工智能(AI) 通俗演义"
translation_source_sha256: "667e36450d57ea00fe4708f9b4468aec110887f5a6f3eed4f2e13772daab6a38"
permalink: en/2019/08/25/artificial-intelligence-an-intuitive-introduction/
aside: true
comments: false
tags: []
categories: []
copyright_author: '面皮(Mepy)'
cover: /images/artificial-intelligence-intuitive-introduction/cover-77aa732b51.jpg
---

> Author: 面皮 (Mepy)  
> Reviewer: 东达

<img src="/images/artificial-intelligence-intuitive-introduction/cover-77aa732b51.jpg" title="Left: people who know nothing about AI think it will take over the world. Right: my AI neural network identifies a cat as a dog." />

<center><font size=2px color=grey>Left: people who know nothing about AI think it will take over the world. Right: my AI neural network identifies a cat as a dog.</font></center>

&emsp;&emsp;Artificial intelligence, or AI, is the effort to imitate aspects of human intelligence by artificial means. Those means are largely mathematical and involve many different formulas. We generally call the resulting methods “algorithms.”

# Imitation

&emsp;&emsp;Before we can imitate human intelligence, we need some idea of how people process a problem. Take the task of recognizing handwritten digits.

&emsp;&emsp;First, the eyes receive an image, such as the two crooked handwritten digits shown on the right. Neurons carry that visual information to the brain's processing centers, and the brain assigns meaning to what it sees.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-001-d592ef6d0a.jpg" />

&emsp;&emsp;In short, a person reads a digit in three stages: input, processing, and output.

&emsp;&emsp;Input and output are straightforward for a computer. Sending a photograph to the machine provides the input. Each pixel in a grayscale image is represented by a number from 0 to 1: 0 means white, 1 means black, and the values in between represent shades of gray. Taken together, those pixel values represent the image. In a color image, each pixel requires three or four numbers, as in the RGBA format. We will leave that topic aside, though interested readers can look it up after finishing the article. The computer's output might be a number or an image displayed on a screen.

&emsp;&emsp;But how can a computer imitate the brain's processing? That is the difficult part of AI.

# A Probability Function

&emsp;&emsp;To keep the example simple, we will reduce the task to deciding whether a handwritten image shows the digit “4.”

<img src="/images/artificial-intelligence-intuitive-introduction/fig-001-d592ef6d0a.jpg" />

&emsp;&emsp;At a glance, we feel sure that the image on the left is a 4 and the image on the right is not. In probabilistic terms, our brain might judge the left image to have a 99% chance of showing a 4 and the right image to have a 100% chance of showing something else.

&emsp;&emsp;The brain has made a probabilistic judgment by estimating how likely the image is to be a 4. As children, we learn to recognize the digit by seeing it many times. Eventually, the brain can decide whether a new image is a 4 and how confident that decision should be. By analogy, we can show a computer many images of 4s and teach it to make a probabilistic judgment of its own.

&emsp;&emsp;Doing that will take a little mathematics, but nothing too intimidating.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-002-482596e6e5.jpg" />
<center><font size=2px color=grey>In this example, the image is identified as the digit 4 with 100% probability.</font></center>

&emsp;&emsp;How should we calculate the probability function P(X)? A computer will not work it out on its own; we have to give it an algorithm. That means designing a mathematical procedure.

&emsp;&emsp;Recall that a grayscale photograph stores one number for each pixel. Start with a single pixel and call its value x. If x > 0.5, the pixel is closer to black; if x < 0.5, it is closer to white. If P(x) estimates the probability that the pixel is black, the simplest formula is P(x) = x. In other words, the computer reads the value directly: above 0.5 means black, while below 0.5 means white. This is the simplest case, with one pixel, one variable, and one dimension.

&emsp;&emsp;A handwritten-digit image 28 pixels long and 28 pixels wide contains 28 × 28 = 784 pixel values.

&emsp;&emsp;Arrange those 784 numbers vertically in a fixed order to form a 784-dimensional vector X. The vector now represents the image, and each number is one of its components. Write the nth component as X[n]. Different images produce different X values, while identical images produce identical ones, so the formula for P(X) must account for all 784 components.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-003-a2937df871.jpg" />

&emsp;&emsp;The equation most familiar to most people is probably a linear equation in one variable. A pair of linear equations is not much harder; we simply solve them together. Functions are likewise introduced in school through linear functions of one variable. Since a linear form tends to make a problem simpler and clearer, we will write P(X) as a linear function of 784 variables.

&emsp;&emsp;At first, that sounds complicated: 784 variables!

&emsp;&emsp;Start with the one-variable function y = w·x + b. Here x is multiplied by a coefficient w, then the constant b is added. The 784-variable version follows the same pattern: multiply each component X[n] of vector X by its own coefficient Wn, then add the constant b.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-004-2a60904c54.jpg" />

&emsp;&emsp;It still looks rather complicated.

&emsp;&emsp;Different X vectors represent different images, and one way they differ is in the order of their components, which records the locations of the dark pixels. The 784 values of W therefore cannot all be identical. If they were, the position of each component in X would not matter, because every component would be multiplied by the same W. So W also needs 784 components. For convenience, arrange them vertically as a 784-dimensional vector W and write the sum of the componentwise products of W and X as a dot product.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-005-6d1641e5ab.jpg" />

&emsp;&emsp;We now have a formula for P(X), but it is not finished yet.

&emsp;&emsp;First, consider this question: will the output of P(X) always lie between 0 and 1?

&emsp;&emsp;A probability must fall in [0,1]; it can be neither negative nor greater than 1. Our 784-variable linear function, however, can wander off to almost any value it pleases. Rename it Z(X), so that Z(X) = W·X + b. We then pass Z(X) through an activation function g(Z), forcing the output into the interval from 0 to 1. Here, g(Z) is the sigmoid function.

<img src="/images/artificial-intelligence-intuitive-introduction/fig-006-fbc64a3d65.jpg" />
<img src="/images/artificial-intelligence-intuitive-introduction/fig-007-cf5411035b.jpg" />

&emsp;&emsp;We now have the probability function P(X): give it an image, and it returns the probability that the image shows a 4.

# The Road Ahead

&emsp;&emsp;Putting research into practice is rarely smooth, and our exploration is far from complete. The road toward artificial intelligence remains difficult.

&emsp;&emsp;Try thinking through these questions:

1. In what ways is the mathematical function P(X) constructed above similar to the human nervous system?
2. In P(X) = W·X + b, X is the input data representing an image, while W and b are constants that must be known in advance. How can we find those constants? Think back to how we learned to recognize the digit 4 as children by seeing many examples.

> Note: The example of deciding whether an image shows “4” is used only to introduce the basic idea behind one class of models in AI and machine learning.

# References
1. https://www.bilibili.com/video/av15532370
2. https://study.163.com/topics/deepLearning/
