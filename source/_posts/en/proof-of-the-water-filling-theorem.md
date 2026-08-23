---
layout: post
title: A Proof of the Water-Filling Theorem
date: '2023-02-20 08:01:50'
lang: en
translation_key: "注水定理的证明"
translation_source_sha256: "41bced41ac6dcfed973de525f6a556f9f835e2023ea9f286bc6778e947587fb0"
permalink: en/2023/02/20/proof-of-the-water-filling-theorem/
aside: false
comments: false
tags: []
categories: []
cover: /images/%E6%B3%A8%E6%B0%B4%E5%AE%9A%E7%90%86%E7%9A%84%E8%AF%81%E6%98%8E/cover-6a7cf8999c.png
copyright_author: 'phy东西'
katex: true
---

> Author: phy-东西  
> Reviewer: 时光

# Problem Statement

&emsp;&emsp;The water-filling theorem solves a fundamental problem in information theory: how to allocate power among AWGN channels so as to maximize total capacity. Suppose there are $K$ parallel AWGN channels with mutually independent noise powers $σ^2_1,σ^2_2,··· ,σ^2_K$. Given a total power constraint $P$, find the allocation that maximizes the combined capacity of the $K$ channels.

&emsp;&emsp;Written as an optimization problem:

$$\begin{aligned}
&\max_{p_1, \dots , p_K}\sum^{K}_{k=1} \log_2 \left(1 + \frac{p_k}{\sigma ^2_k}\right)\\
\mathrm{s.t.}&\sum^K_{k = 1}p_k \le P\\
&p_k \ge 0, \ \ \  k = 1, 2, \dots , K\end{aligned} \tag{1.1}$$

# An Intuitive Proof

&emsp;&emsp;This section gives a derivation that is comparatively easy to understand.

&emsp;&emsp;It may seem sufficient to assign all available power to the best channel—the one with the least noise. But channel capacity is $C_k = \log_2 (1 + p_k / σ^2_k)$, whose rate of increase falls as power rises. This suggests that each new increment of power should go to whichever channel currently offers the greatest increase in capacity.

&emsp;&emsp;Assume an initial allocation $p^{(0)}_1 ,p^{(0)}_2 , \dots ,p^{(0)}_K$ satisfying:

$$\sum^K_{k = 1}p^{(0)}_k < P, \ \ \  p^{(0)}_{k} \ge 0, \ \ \  k = 1, 2, \dots , K$$

&emsp;&emsp;Clearly, $p^{(0)}_1 = p^{(0)}_2 = \dots = p^{(0)}_K = 0$ is a valid initialization. Let a positive quantity $(P - \sum^K_{k=1}p^{(0)}_k) \ge \delta > 0$ represent the next increment of power to allocate. If the amount $\delta$ is assigned to channel $k$, its capacity increases by:

$$\Delta C = \log_2 \left( 1 + \frac{p^{(0)}_k + \delta}{\sigma^2_k}\right) - \log_2 \left(1 + \frac{p^{(0)}_k}{\sigma^2_k}\right) = \log_2 \left(1 + \frac{\delta}{p^{(0)}_k + \sigma^2_k}\right)\tag{2.1}$$

&emsp;&emsp;The power should plainly go to the channel with the smallest $p^{(0)}_k + \sigma^2_k$. If $\delta$ is made arbitrarily small at every step, then once all the power has been allocated, the active channels will share a constant value of $\sigma^2_k +p_k$. The poorer channels, whose noise power $σ^2_k$ exceeds that constant, receive no power. Thus:

$$p_k = \max \{0, p^* - \sigma^2_k\}\tag{2.2}$$

&emsp;&emsp;Here $p^⋆$ is chosen so that $\sum^K_{k = 1}p_k = P$.

&emsp;&emsp;For any allocation in which $p_i + \sigma^2_i > p_j + \sigma^2_j$, set $\delta = \min\{p_i, (p_i + \sigma^2_i - p_j - \sigma^2_j)/2\}$. Starting from $p^{(0)}_i = p_i - \delta, p^{(0)}_j = p_j$, our earlier argument shows that assigning $\delta$ to channel $j$ yields more capacity than assigning it to channel $i$. After reallocation, either $p_i + \sigma^2_i = p_j + \sigma^2_j$ or $p_i = 0$; in the latter case, $\sigma_i^2 \ge p_j + \sigma^2_j$.

# A Rigorous Proof
&emsp;&emsp;Rewrite $(1.1)$ as:

$$\begin{aligned}&\min_{p_1, \dots, p_K} - \sum^K_{k = 1}\ln\left( 1 + \frac{p_k}{\sigma^2_k}\right)\\
\mathrm{s.t.}&\sum^K_{k = 1}p_k - P \le 0\\
&-p_k \le 0, \ \ \  k = 1, 2, \dots, K
\end{aligned}\tag{3.1}$$

&emsp;&emsp;$−\ln(·)$ is convex, so the objective function is convex. It is likewise straightforward to show that the feasible region $(p_1, p_2, \dots, p_K)\in \mathcal{P}$ is convex. The problem is therefore a convex optimization problem, with Lagrangian:

$$ \begin{aligned}
&\mathcal{L}(p_1, p_2, \dots, p_K; \lambda_0, \lambda_1, \dots, \lambda_K) \\ 
&= -\sum^K_{k = 1} \ln \left(1 + \frac{p_k}{\sigma^2_k}\right) + \lambda_0 \left( \sum^K_{k = 1} p_k - P \right) - \sum^K_{k = 1}\lambda_k p_k
\end{aligned} \tag{3.2}$$

&emsp;&emsp;Its KKT conditions are:

$$\frac{\partial \mathcal{L}}{\partial p_k} = - \frac{1}{\sigma^2_k + p_k} + \lambda_0 - \lambda_k = 0, \ \ \ k = 1, 2, \dots, K \tag{3.3a}$$
$$\lambda_k \ge 0, \ \ \ k = 0, 1, 2, \dots, K\tag{3.3b}$$
$$\sum^K_{k = 1}p_k \le P\tag{3.3c}$$
$$\lambda_0 \left( \sum^K_{k = 1}p_k - P\right) = 0\tag{3.3d}$$
$$p_k \ge 0, \ \ \ k = 1, 2, \dots, K\tag{3.3e}$$
$$\lambda_k p_k = 0, \ \ \ k = 1, 2, \dots, K\tag{3.3f}$$

&emsp;&emsp;Equation $(3.3\mathrm{a})$ can be rewritten as:

$$\begin{aligned}\lambda_k = \lambda_0 - \frac{1}{\sigma^2_k + p_k} \\
p_k = \frac{1}{\lambda_0 - \lambda_k} - \sigma^2_k \end{aligned}\tag{3.4}
$$

&emsp;&emsp;If $\sum^K_{k=1} p_k < P$, then $\lambda_0 = 0, \lambda_k = -1/(\sigma^2_k + p_k)<0$, contradicting $(3.3\mathrm{b})$. Therefore $\sum^K_{k = 1} p_k = P$. Because each $p_k$ is nonnegative, they cannot all be zero.

&emsp;&emsp;Without loss of generality, suppose $\sigma^2_1 \le \sigma^2_2 \le \dots \le \sigma^2_K$. Because the $p_k$ cannot all vanish, at least one $p_k$ is positive, and its corresponding $λ_k$ is zero. For channels with $p_k > 0, λ_k = 0$:

$$p_k = \frac{1}{\lambda_0 - \lambda_k} - \sigma^2_k = \frac{1}{\lambda_0} - \sigma^2_k \tag{3.5}$$

&emsp;&emsp;If $λ_k > 0$, then $p_k = 0$, and:

$$\lambda_k = \lambda_0 - \frac{1}{\sigma^2_k + p_k} = \lambda_0 - \frac{1}{\sigma^2_k} \tag{3.6}$$

&emsp;&emsp;Because $σ^2_k$ increases monotonically:

$$\lambda_K \ge \lambda_{K-1} \ge \dots \ge \lambda_k > 0, \ \ \ p_K = p_{K-1} = \dots = p_k = 0 \tag{3.7}$$

&emsp;&emsp;This is precisely the result described above. For good channels ($λ_k = 0$), the allocated powers $p_k$ satisfy $p_k +σ^2_k = 1/\lambda_0$, a constant. Poor channels receive no power ($\lambda_k > 0$; note that $(3.7)$ shows that if a channel with noise power $\sigma_k$ is poor, then every channel with still greater noise power is poor as well). Allocation continues in this fashion until all power has been assigned. The quantity $1 / \lambda_0$ is the $p^⋆$ used above.

# Water-Filling for Continuous Parallel Channels
&emsp;&emsp;For colored noise $σ^2 (f)$ in a transform domain such as the frequency domain, the water-filling problem can be written:

$$\begin{aligned} 
&\min_{p(f)} - \int^{f_h}_{f_l}\log_2 \left( 1 + \frac{p(f)}{\sigma^2 (f)}\right) \mathrm{d}f\\ 
\mathrm{s.t.}&\int^{f_h}_{f_l}p(f)\mathrm{d}f\le P\\ 
&p(f)\ge 0, \ \ \ f_l \le f \le f_h \end{aligned}\tag{4.1}
$$

&emsp;&emsp;Construct the Lagrangian functional:

$$\begin{aligned}&\mathcal{L}[p(f),\lambda_0 ,\lambda_1 (f)] \\
 = &-\int^{f_h}_{f_l} \ln \left( 1 + \frac{p(f)}{\sigma^2 (f)}\right) \mathrm{d}f + \lambda_0 \left( \int^{f_h}_{f_l} p(f)\mathrm{d}f\right) - \lambda_1 (f)p(f) \end{aligned}\tag{4.2}$$

&emsp;&emsp;Its KKT conditions are:

$$\delta \mathcal{L} = \int^{f_h}_{f_l}\left(\lambda_0 - \frac{1}{\sigma^2 (f) + p(f)}\right) \delta p(f)\mathrm{d}f - \lambda_1 (f)\delta p(f) = 0, \ \ \ \forall \delta p(f) \tag{4.3a}$$
$$\int^{f_h}_{f_l} p(f)\mathrm{d}f \le P \tag{4.3b}$$
$$\lambda_0 \ge 0,\lambda_1 (f)\ge 0, \ \ \ f_l\le f \le f_h \tag{4.3c}$$
$$\lambda_0 \left(\int^{f_h}_{f_l} p(f) \mathrm{d}f-P\right) = 0 \tag{4.3d}$$
$$p(f)\ge 0, \ \ \ f_l\le f \le f_h \tag{4.3e}$$
$$\lambda_1 (f)p(f) = 0, \ \ \ f_l\le f \le f_h \tag{4.3f}$$

&emsp;&emsp;Here $\delta p(f)$ is the variation of $p(f)$.

&emsp;&emsp;When $\lambda_1 (f) > 0$—analogous to a “poor channel” above—$p(f) ≡ 0$, and hence $\delta p(f) = 0$. Conversely, when $p(f) > 0$, $\lambda_1 (f) ≡ 0$, analogous to a “good channel,” and $p(f) = \frac{1}{\lambda} − σ^2 (f)$. Therefore:

$$p(f) = \max \{0,p^* - \sigma^2 (f)\}\tag{4.4}$$

&emsp;&emsp;where $p^⋆$ satisfies:

$$\int^{f_h}_{f_l} p(f)\mathrm{d}f = P\tag{4.5}$$

&emsp;&emsp;Why is this called “water-filling”? Imagine $σ^2 (f)$ as the bottom of a bowl and the power as water poured into it. Wherever power is assigned, the combined noise and signal power reaches the same flat “water level.” Noise that rises above the waterline marks a channel too poor to receive any power.
 
<img src="/images/%E6%B3%A8%E6%B0%B4%E5%AE%9A%E7%90%86%E7%9A%84%E8%AF%81%E6%98%8E/cover-6a7cf8999c.png" alt="Illustration of water-filling" title="Illustration of water-filling" />
