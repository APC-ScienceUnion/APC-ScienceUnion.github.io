---
layout: post
title: Variational Inference and Generative Models
date: '2022-08-13 18:06:01'
lang: en
translation_key: "Variational Inference 与 GAN, NF,VAE"
translation_source_sha256: "3f5cba27a8d62d1b585aa59dbed30da4a983b58ea841eec4216569281ecac68d"
permalink: en/2022/08/13/variational-inference-gan-nf-vae/
aside: true
comments: false
tags: []
categories: []
cover: /images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/cover-a05312cd2a.png
copyright_author: 'Thinker'
katex: true
---

> Author: I Am Zhang Yixian
Author's Zhihu profile: <a href="https://www.zhihu.com/people/yi-xian-zhang-91">Thinker</a>

# Variational Inference

The basic idea is simple: probabilistic models often require us to approximate distributions that are difficult to compute. Inference about any unknown quantity can be viewed as inference about a posterior probability because Bayes' theorem allows us to construct one:
$$p(x) = \sum p(x|z)p(z)$$
For large datasets, Markov chain Monte Carlo methods are too slow, which is where **variational inference** comes in.

Two kinds of variables appear repeatedly: the **observed data, $x$**, and the **latent variable, $z$​**.

The resulting inference problem is to determine the posterior conditional distribution $p(z|x)$​​ for the input data. Using the **ELBO**, we seek a **tractable distribution $q(z)$** that can approximate and stand in for the true **posterior distribution $p(z|x)$​**.

We therefore optimize the KL divergence between them:
$$q^*(z) = argmin_{q(z)∈Q}KL(q(z)||p(z|x))$$
The KL divergence can be rewritten as follows. All expectations below are taken with respect to $q(z)$:
$$KL(q(z)||p(z|x)) =E(\log q(z)) - E(\log p(z|x))\\
=E(\log q(z)) - E(\log p(x,z))
+ \log p(x)$$
This gives us the **evidence lower bound, or ELBO**:
$$ELBO(q) = E(\log p(z,x)) - E(\log q(z))$$
The $q(z)$​ above can, of course, be replaced by $q(z|x)$; the equation then needs only a slight adjustment. ​

Whether we are working with a VAE, GAN, or NF, one inequality is especially important:

- Make $p_\theta(z|x)$ and $q_\phi(z|x)$ as close as possible
  $$D_{KL}(q_\phi(z|x)||p_\theta(z|x))
  = \log(p_\theta(x)) - \sum_zq_{\phi}(z|x)\log(\frac{p_{\theta}(x,z)}{q_{\phi}(z|x)})
  \\=\log(p_\theta(x)) - L(\theta,\phi;x)$$
  The objective is to make $D_{KL}$​ as close to 0 as possible, which in turn makes the two distributions as close as possible. Rearranging gives:
  $$L(\theta,\phi;x) = E_{q_{\phi}(z|x)}[\log(p_{\theta}(x|z))] - D_{KL}(q_{\phi}(z|x)||p_{\theta}(z))$$
  Combining the two equations, we obtain:
  $$\log(p_\theta(x)) - D_{KL}(q_\phi(z|x)||p_\theta(z|x)) = E_{q_{\phi}(z|x)}[\log(p_{\theta}(x|z))] - D_{KL}(q_{\phi}(z|x)||p_{\theta}(z))$$
  Because our objective is to make $D_{KL}(q_\phi(z|x)||p_\theta(z|x))$​ as close to 0 as possible, we obtain the equation from the paper:
  $$\log(p_\theta(x)) ≥ E_{q_{\phi}(z|x)}[\log(p_{\theta}(x|z))] - D_{KL}(q_{\phi}(z|x)||p_{\theta}(z)) = -F (x)$$
  This formula captures the key idea of **variational inference**. Here, $F$ is called the **ELBO** bound.

# VAE (Variational Autoencoder)

A VAE seeks to maximize the $ELBO$​​ derived above. It introduces SGVB and the reparameterization method.

The VAE architecture is shown below:

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-001-c11cf20380.png" style="zoom:50%;" />

Put simply, it takes the real data $x$ as input and uses the generative networks $h,g$ to produce the desired $\mu_x,\sigma_x$:
$$
\mu_x = g(x) \\
\sigma_x = h(x)
$$
It then introduces Gaussian noise $N(0,1)$ and combines these quantities to construct the latent variable $z$​. This is the reparameterization trick, which makes backpropagation possible:
$$
z = \sigma_x \zeta + \mu_x
$$
The decoder maps $z$ to $\hat{x}$:
$$
\hat{x} = f(z)
$$
When training a VAE, we must ensure that $z$ follows a normal distribution. This is a major difference between a VAE and an AE: it gives the latent space a degree of regularity, including continuity and completeness.

The VAE objective is:
$$
L(\theta,\phi;x) = ELBO \\=
E_{q_{\phi}(z|x)}[\log(p_{\theta}(x|z))] - D_{KL}(q_{\phi}(z|x)||p_{\theta}(z))
$$
The first term can be understood as the reconstruction loss and the second as the regularization loss.

Applying maximum likelihood to the first term yields:
$$
(f^*,g^*,h^*) = argmax_{(f,g,h)∈F\times G \times H} (E_{z ~ q_x}(-\frac{||x-f(z)||^2}{2c}) - KL(q_x(z)||p(z)))
$$
How do we handle the second term? We can evaluate the integral directly:
$$
 - D_{KL}(q_{\phi}(z|x)||p_{\theta}(z)) = 
 \int q_{\theta}(z)(\log p_{\theta}(z)-\log q_{\theta}(z))dz \\
 = \frac{1}{2}\sum_{j=1}^J (1+\log((\sigma_j)^2)-\mu_j^2-\sigma_j^2)
$$
(We want the distribution of $z$​​ to be as close as possible to $N(0,1)$​; accordingly, the distribution of $z$​​ has a mean of 0 and a variance of 1. For $q_{\phi}(z|x)$, the distribution is $N(\mu,\sigma)$.​)

The second term pushes $q_{\phi}(z|x)$ as close as possible to $N(0,1)$​. The first term is the MSE between the generated $\hat{x}$ and $x$; it is the term that also appears in an AE. The second term acts as a regularizer.

To generate a completely new image, sample $z$ directly and feed it into the decoder network. Its output is the new image.

# GAN (Generative Adversarial Network)

A GAN consists of a generator G and a discriminator D:

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/cover-a05312cd2a.png" style="zoom:50%;" />

A GAN can be understood as using cross-entropy to judge the similarity between distributions:
$$
H(p,q)=-\sum_{i}{p_i \log q_i}
$$
This resembles a binary classification problem. A sample either comes from the real dataset or is produced by drawing random noise and passing it through the generator. The discriminator must then decide whether the sample is real or fake:

The discriminator answers only “right” or “wrong.” It is a binary classification network.

Suppose ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-002-3c2fdd5f0a.svg) is the distribution of real samples. The corresponding ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-003-179a49bad1.svg) is then the distribution of generated samples. ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-004-f19010f0cb.svg) represents the discriminator, so ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-005-e9c9eeb208.svg) represents the probability that it classifies a sample as real, while ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-006-6683672c42.svg) corresponds to the probability that it classifies a sample as fake.

Expressed in terms of cross-entropy, this becomes:

![img](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-007-8dac80dda0.png)

Let the sample produced by the generator be $\hat{x}$~$G(z)$, where $z$ follows the distribution of the noise fed into the generator. $x$​ is a real sample point.

Extending the formulation to the continuous case, we rewrite it as an integral.

The formal procedure is as follows:

We first fix G—that is, choose an arbitrary G—and then solve for $V(G,D)$:
$$
V(G,D) = \int _\infin  p_{data}(x)\log D(x) dx + \int _\infin p_z(z) \log (1-D(g(z))) dz
\\ = \int _\infin (p_{data}(x)\log(D(x)) + p_g(x)log(1-D(x)) )dx
$$
Differentiating the expression inside the integral gives the maximum $V(G,D)$, the point at which $D$ performs best:

At this point,
$$
D^*(x) = \frac{p_{data}(x)}{p_{data}(x)+p_g(x)}
$$
That is,
$$
V(G,D) = E_{x->p_{data}}[ \frac{p_{data}(x)}{p_{data}(x)+p_g(x)}]+E_{x->p_{g}}[ \frac{p_{data}(x)}{p_{data}(x)+p_g(x)}]
$$
We then continue training the generator to minimize $\max_D V(G,D) = V(G,D^*)$​: $C(G) = \min_G V(G,D^*)$.

Thus, when $p_g = p_{data} = 1/2$​—the Nash equilibrium, where the discriminator can no longer tell which is which—we obtain the minimum:
$$
\min_G\max_D V(G,D) = \min_G V(G,D^*) = -\log 4
$$
Substituting the minimum values and rearranging gives:
$$
C(G) = -log(4) + KL(p_{data}||\frac{p_{data}+p_g}{2})+ KL(p_{g}||\frac{p_{data}+p_g}{2}) \\= -log(4)+2JSD(p_{data}||p_g)
$$
When JSD is 0, $p_{data}$​ and $p_g$ are considered equal and can no longer be distinguished. At this point, C* = -log4.​​

# NF (Normalizing Flow)

A normalizing flow is another kind of generative network. It is based on the change-of-variables theorem.

Suppose the generative network is still G, $z$ is a standard normal distribution—the latent variable—and x is the real data.
$$
Z->Generator...->x
$$
We want the distribution of the generated x to be as close as possible to the original distribution of x.

Suppose $\{x^1,x^2,...,x^m\}$ is a sample drawn from $p_{data}(x)$​.

We want $p_G(x)$ and $p_{data}(x)$ to be as close as possible, which gives us the objective:
$$
G^* =argmax_G \sum_{i=1}^m \log P_G	(x^i) 
\\≈ argmin_G KL (p_{data}(x)||p_G(x))
$$
Several mathematical facts matter here; among them, the **volume after a linear transformation** equals the **determinant of the transformation matrix**.

![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-008-df2423aa51.svg)

In other words, the determinant can be viewed as the **local linear rate of volume change** under the transformation ![[Formula]](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-009-910c778dd4.svg).

**The input and output sizes of an NF must be the same.** This sets it apart from the other two, which can accept arbitrary inputs.

Now suppose it consists of a series of flow networks.

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-010-3f07e23844.png" style="zoom:50%;" />

We modify the original network accordingly:
$$
\log p_K (x^i) = \log \pi(z^i) +\sum_{h=1}^K \log|det(J_{G_K^{-1}})|
$$
We seek to maximize the left-hand side—in other words, to maximize the log likelihood.

To calculate it, we can reverse the process and feed x through the $G^{-1}$​ network to generate z.

Because the expression above is too computationally expensive, we use the following techniques:

**1. Coupling Layer**: used in NICE and Real NVP

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-011-6b46afc9f2.png" style="zoom:40%;" />

The layer maps the first **1:d** dimensions directly from z to x. For the remaining **d+1:D** dimensions, the earlier data pass through the F and H networks to obtain $\beta_{d+1:D}$ and $\gamma_{d+1:D}$, followed by a linear combination:
$$
x_{d+1:D} = \beta_{d+1:D} \times z_{d+1:D}  + \gamma_{d+1:D}
$$
After the coupling layer, the Jacobian is triangular:

​											`<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-012-b6ee1f3571.png" style="zoom:50%;" />

The upper portion is copied directly, so it is 1:1, while the entries along the lower-right diagonal (D>i>d+1) are the $\beta_i$ values.

The determinant of the Jacobian can therefore be written as:
$$
det(J_G) = 1\times 1 \times ...\times 1\times \beta_{d+1}\times ...\times \beta_{D}
$$
But if every network were processed this way, would the first d terms not remain unchanged?

The terms must therefore be processed in an interleaved manner. Each network randomly selects d terms, and the size of d must vary as well. Only then will stacking the networks have an effect.

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-013-7ceeea5a3b.png" style="zoom:50%;" />



2. **1x1 Convolution**

In addition to coupling layers, we can use a 1x1 convolution. Proposed in GLOW, it works especially well.

Suppose we are processing an image with three channels: R, G, and B. The 1x1 convolution uses a 3x3 matrix $W$:

![](/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-014-9feae554c5.png)

The size remains unchanged after the 1x1 convolution, and this $W$ matrix is in fact $det(J_G)$:
$$
x = f(z) =W\times z 
$$

$$
\begin{equation}       % begin mathematical environment
J_f = \left(                 % left parenthesis
  \begin{array}{ccc}   % the matrix has three centered columns
    w_{11} & w_{12} & w_{13}\\  % first-row elements
    w_{21} & w_{22} & w_{23}\\  % second-row elements
    w_{31} & w_{32} & w_{33}\\
  \end{array}
\right)    = W              % right parenthesis
\end{equation}
$$

As long as W is easy to solve, the result is easy to calculate:

<img src="/images/Variational%20Inference%20%E4%B8%8E%20GAN%2C%20NF%2CVAE/fig-015-d0b9e0319d.png" style="zoom:50%;" />

The result is therefore the product of the W matrices along the diagonal:
$$
(det(W))^{d\times d}
$$
Substituting this into the formula gives:
$$
\log p_K (x^i) = \log \pi(z^i) +\sum_{h=1}^K \log|(det(W))^{d\times d}|
$$
This turns a complex computation into a simpler one.




----
> References:
[1] Hung-yi Lee, Machine Learning
[2] Su Jianlin
