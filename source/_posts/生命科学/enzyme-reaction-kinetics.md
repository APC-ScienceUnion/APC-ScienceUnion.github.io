---
layout: post
title: 'Enzyme Kinetics: From Rate Laws to Inhibition'
date: '2021-03-09 12:52:58'
lang: en
translation_key: "酶的反应动力学"
translation_source_sha256: "c4df1e77a41e79675f9b2f9ffe52decf3b22ed5f6d4c87550a53a2671df3c3d6"
permalink: en/2021/03/09/enzyme-reaction-kinetics/
cover: '/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/cover-17daa1e0fb.png'
copyright_author: '极地冰川'
aside: true
comments: false
tags: []
categories: []
---
> Author: Polar Glacier

Reviewer: Weiming

&emsp;&emsp;Note: This is a long article, and parts of it may be challenging. Students, interested readers, and people working in related fields will find a thorough treatment of the subject here.

# I. Common Rate Laws in Chemical Kinetics

&emsp;&emsp;Before turning to enzymes, let us review several common types of chemical reaction kinetics.

## 1. First-order reactions

&emsp;&emsp;In a first-order reaction, the rate is directly proportional to the concentration of a reactant.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-003-527da81787.png" />

&emsp;&emsp;The reaction is shown below:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-004-e1fe2af710.png" />

&emsp;&emsp;Its rate equation can therefore be written as:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-005-e04e35d84f.png" />

&emsp;&emsp;From the definition of a first-order reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-006-4abdbc9aa3.png" />

&emsp;&emsp;Therefore:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-007-92238b1ac6.png" />

&emsp;&emsp;Rearranging:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-008-3b5e72d1c6.png" />

&emsp;&emsp;Solving gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-009-5567506feb.png" />

## 2. Second-order reactions

&emsp;&emsp;In a second-order reaction, the rate is proportional to the square of a reactant concentration. A typical form is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-010-43dd5bcc2c.png" />

&emsp;&emsp;For the reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-011-fa97447a12.png" />

&emsp;&emsp;At any point during the reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-012-ae9b4e25d8.png" />

&emsp;&emsp;The rate equation is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-013-1b1663f97a.png" />

&emsp;&emsp;Combining the equations gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-014-79dc730bfc.png" />

&emsp;&emsp;Solving gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-015-90f2c2a13a.png" />

&emsp;&emsp;For the reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-016-8c5fc58b9c.png" />

&emsp;&emsp;There are two cases. If reactants A and B have the same initial concentration, the derivation is essentially the same as above and gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-017-d3f431f0ee.png" />

&emsp;&emsp;If A and B have different initial concentrations:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-018-6768e528db.png" />

&emsp;&emsp;Therefore:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-019-8876c51c79.png" />

&emsp;&emsp;Rate laws for reactions of integer order three or greater can be derived in much the same way as the simple second-order case.

## 3. Zero-order reactions

&emsp;&emsp;A zero-order reaction proceeds at a constant rate independent of reactant concentration. These reactions are uncommon, but some surface reactions are zero order. One example is the decomposition of ammonia on a tungsten or iron catalyst.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-020-a8ba63df90.png" />

&emsp;&emsp;When reactant molecules adsorb to a solid catalyst at a concentration high enough to cover its surface completely, the rate depends on the available surface area rather than the reactant concentration.

&emsp;&emsp;The rate equation can be written as:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-021-9c396032fc.png" />

&emsp;&emsp;With those basic equations reviewed, we can turn to enzyme kinetics.

# II. The Intermediate-Complex Hypothesis and the Michaelis–Menten Equation

&emsp;&emsp;People had long observed that chemical reactions generally speed up as reactant concentrations rise. In 1903, Victor Henri of the Sorbonne in Paris studied the hydrolysis of sucrose by invertase. He held the enzyme concentration constant, varied the sucrose concentration, and observed a rectangular hyperbola, the familiar curve found in secondary-school textbooks:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-022-b2d38d7ce4.png" />

&emsp;&emsp;At very low substrate concentrations, the rate rises sharply in direct proportion to substrate concentration, giving first-order behavior. As the concentration increases, the rate continues to rise but no longer proportionally. Eventually it reaches a plateau and becomes independent of substrate concentration, giving zero-order behavior. At that point, the enzyme is saturated. All enzymes show substrate saturation, although the concentration required varies.

&emsp;&emsp;From these results, Henri proposed that an enzyme and its substrate combine to form an unstable intermediate on the way to product. The intermediate forms readily, then breaks down to release the product and regenerate the enzyme. This became known as the intermediate-complex hypothesis. Henri also proposed a preliminary equation for the invertase reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-023-66c9bf0e93.png" />

&emsp;&emsp;Here *K, Φ, m,* and *n* are constants, *v* is the reaction rate, [S] is the substrate concentration, and [P] is the product concentration.

&emsp;&emsp;In modern terms, this equation describes a substrate-inhibited enzyme reaction.

&emsp;&emsp;In 1913, L. Michaelis and M. Menten revisited Henri’s results. Building on the intermediate-complex hypothesis, they treated the first step as a rapid equilibrium, derived a new mathematical expression, and published their work in *Biochemische Zeitschrift* (the *Journal of Biochemistry*, a predecessor of the *FEBS&nbsp;Journal*).

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-024-2e8407cdc3.png" />

&emsp;&emsp;Their rapid-equilibrium model for a single-substrate reaction can be written as:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-025-82e9e37e52.png" />

&emsp;&emsp;Here E denotes free enzyme, S the substrate, ES the unstable enzyme–substrate complex, and P the product.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-026-e35752ee65.png" />

<center><font size=2px color=grey>Michaelis (left) and Menten (right)</font></center>

&emsp;&emsp;From this model, they obtained the rate law for an irreversible, single-substrate enzyme reaction: the **Michaelis–Menten equation**.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-027-f6f1d414e6.png" />

&emsp;&emsp;Here *V<sub>0</sub>* is the initial rate, *V<sub>max</sub>* the maximum rate, [S] the substrate concentration, and K<sub>s</sub> the dissociation constant, equal to *K<sub>2</sub>/K<sub>1</sub>*.

&emsp;&emsp;**The derivation of the Michaelis–Menten equation rests on three assumptions:**

- (1) At the start of the reaction, so little product has formed that the reverse reaction can be ignored.

- (2) Substrate is present at a much higher concentration than free enzyme, so its concentration remains approximately constant during the reaction.

- (3) The second step is rate-limiting, with *K<sub>2&nbsp;</sub>≫&nbsp;K<sub>3</sub>*, so conversion of ES to P is too slow to disrupt the equilibrium between E and ES.

&emsp;&emsp;The derivation proceeds as follows:

&emsp;&emsp;Assume that E + S → ES reaches equilibrium rapidly and that the second step is much slower. The second step then determines the overall rate:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-028-49a0444c03.png" />

&emsp;&emsp;Because [ES] is low, transient, and difficult to measure directly, we express it in terms of quantities that are easier to determine. For dissociation of ES into E and S during the rapid first-step equilibrium, the rate constant is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-029-c056062fd1.png" />

&emsp;&emsp;Thus:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-030-4c12d6efc2.png" />

&emsp;&emsp;Because the total enzyme concentration remains constant, the enzyme mass balance is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-031-2b93ddc37b.png" />

&emsp;&emsp;Therefore:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-032-00edc1c185.png" />

&emsp;&emsp;Substitute the preceding expression into

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-033-647ed76e4e.png" />

&emsp;&emsp;to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-034-60386f4754.png" />

&emsp;&emsp;Rearranging gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-035-2217e36f73.png" />

&emsp;&emsp;Substitute

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-036-a6ce88b472.png" />

&emsp;&emsp;into the preceding equation to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-037-778e6011fa.png" />

&emsp;&emsp;The maximum rate is reached when every enzyme molecule is bound to substrate. Therefore:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-038-ca461af7a5.png" />

&emsp;&emsp;Substitution gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-039-666b4537d5.png" />

&emsp;&emsp;Although this model marked a major advance in enzyme kinetics, its assumptions do not apply universally. There is no reason to expect K<sub>2</sub>&nbsp;≫&nbsp;K<sub>3</sub> in every enzyme-catalyzed reaction, and the model does not allow the second step to be reversible. In 1925, G. E. Briggs and J. B. S. Haldane revised the Michaelis–Menten model and introduced the steady-state treatment.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-040-63afd5375e.png" />

&emsp;&emsp;**The Briggs–Haldane steady-state treatment makes the following assumptions:**

- (1) At the beginning of the reaction, product concentration is extremely low. The reverse reaction from E + P to ES is therefore negligible and can be ignored.

- (2) Initially, substrate concentration is much greater than enzyme concentration and can be treated as constant over the early part of the reaction.

- (3) Within a few milliseconds, [ES] reaches an approximately constant level. Although the concentrations of S and P continue to change, the formation rate *v<sub>f</sub>*<sub>&nbsp;</sub> and breakdown rate *v<sub>d</sub>*<sub>&nbsp;</sub> of ES remain nearly equal for a time, so its net rate of formation is approximately zero.

&emsp;&emsp;**The mathematical derivation is as follows:**

&emsp;&emsp;The formation rate *v<sub>f</sub>* of the enzyme–substrate complex ES is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-041-3a5bc7c92c.png" />

&emsp;&emsp;The breakdown rate *v<sub>d</sub>* of ES is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-042-9e261eef28.png" />

&emsp;&emsp;At steady state, [ES] remains constant and *v<sub>f</sub> =&nbsp;v<sub>d</sub>*:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-043-b74cfd3664.png" />

&emsp;&emsp;From the enzyme mass balance

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-044-6ff0ea4ece.png" />

&emsp;&emsp;we obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-045-8a8a2be3f9.png" />

&emsp;&emsp;Substitution gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-046-2aa521fc09.png" />

&emsp;&emsp;Rearranging gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-047-b61a2257d4.png" />

&emsp;&emsp;Let:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-048-efd0720026.png" />

&emsp;&emsp;Then:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-049-edbe43882e.png" />

&emsp;&emsp;Solving for [ES] gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-050-8a27764721.png" />

&emsp;&emsp;Substitute this into

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-051-59a17c698c.png" />

&emsp;&emsp;to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-052-5ba5d2e3a4.png" />

&emsp;&emsp;The steady-state and rapid-equilibrium models lead to equations of the same form, but the steady-state treatment is more general. Both are known as the Michaelis–Menten equation, and *K<sub>m</sub>* is called the Michaelis constant.

&emsp;&emsp;Now let us return to Henri’s graph.

&emsp;&emsp;A simple calculation shows that:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-053-9253f94f38.png" />

&emsp;&emsp;The rate is proportional to the first power of substrate concentration, so the reaction is first order.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-054-49ee6cc1f8.png" />

&emsp;&emsp;The rate is constant, so the reaction is zero order.

&emsp;&emsp;When substrate concentration lies between 0.01*K<sub>m</sub>* and 100*K<sub>m</sub>*, the rate follows the full Michaelis–Menten equation and the reaction is of mixed order.

&emsp;&emsp;This agrees with the experimental results.

&emsp;&emsp;When [S] = *K<sub>m</sub>*,

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-055-6da1d97974.png" />

&emsp;&emsp;the Michaelis constant is the substrate concentration at which the reaction proceeds at half its maximum rate.

# III. The Michaelis Constant

&emsp;&emsp;The Michaelis constant has several other useful interpretations:

- (1) It is an important quantity in enzymology. From the derivation of *K<sub>m</sub>*:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-056-de553e3da4.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-057-c9b334590e.png" />

&emsp;&emsp;Every term in this expression is constant for a given enzyme under a specified set of conditions. The resulting *K<sub>m</sub>* is therefore characteristic of the enzyme–substrate pair under those conditions. It depends on the enzyme and the identity of the substrate, but not on enzyme concentration.

- (2) An enzyme with broad substrate specificity has a different *K<sub>m</sub>* for each substrate. The substrate with the smallest value is the enzyme’s preferred substrate. For chymotrypsin, for example, that substrate is benzoyltyrosinamide.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-058-2bf581b321.png" />

&emsp;&emsp;Why? *K<sub>m</sub>* is the substrate concentration that produces half the maximum rate. A smaller *K<sub>m</sub>* means that less substrate is needed to approach saturation and that the rate responds more strongly to a unit change in substrate concentration; in other words, *v&nbsp;* is more sensitive to *Δs*.

&emsp;&emsp;Comparing the two derivations reveals another useful relationship.

&emsp;&emsp;Consider the reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-059-2611e06174.png" />

&emsp;&emsp;In the rapid-equilibrium model, the equilibrium constant *K<sub>s</sub>* is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-060-65596276ed.png" />

&emsp;&emsp;In the steady-state model, the Michaelis constant *K<sub>m</sub>* is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-061-487c4275eb.png" />

&emsp;&emsp;Comparing the two expressions:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-062-58b257af70.png" />

&emsp;&emsp;When *k<sub>1</sub>*&nbsp;≫*&nbsp;k<sub>2</sub>*, so that ES → P + E is an extremely slow step in the overall reaction:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-063-368a84d600.png" />

&emsp;&emsp;Thus, **the rapid-equilibrium model is a special case of the steady-state model**. When&nbsp;ES → P + E&nbsp;is extremely slow and *k<sub>2</sub>*/*k<sub>1</sub>* is very small, the steady-state result approaches the rapid-equilibrium result. Another way to express the relationship is: **steady state = rapid equilibrium + slow equilibrium.**

# IV. Linearizing the Michaelis–Menten Equation

&emsp;&emsp;The Michaelis–Menten equation is the classic biochemical relationship between the initial substrate concentration and the rate of an enzyme-catalyzed reaction. Fitting its hyperbolic curve can introduce substantial error, so the equation is often rearranged into a linear form. Common methods include the **Lineweaver–Burk double-reciprocal plot, Eadie–Hofstee plot, Hanes–Woolf plot, and Eisenthal plot**. Of these, the Lineweaver–Burk plot is the most widely used.

&emsp;&emsp;Hans Lineweaver and Dean Burk proposed the double-reciprocal plot in 1934. It is obtained by taking the reciprocal of both sides of the Michaelis–Menten equation and rearranging:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-064-7ff185b24c.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-065-d5c9bd3c31.png" />

&emsp;&emsp;The plot provides direct estimates of the two key Michaelis–Menten parameters and can also be used for inhibited reactions. Its weakness is the uneven distribution of data: points cluster in the lower-left portion of the line, while reciprocation greatly magnifies errors at low substrate concentrations. Those points may lie far from the fitted line and reduce the accuracy of both parameter estimates. Eadie–Hofstee and Hanes–Woolf plots can mitigate the large errors of the Lineweaver–Burk method at very low or very high substrate concentrations.

# V. The Michaelis–Menten Equation under Reversible Inhibition

&emsp;&emsp;An inhibitor reduces or abolishes enzyme activity by acting on an essential functional group without denaturing the protein. The result may resemble denaturation, but the mechanisms are fundamentally different. Denaturation disrupts the interactions that maintain an enzyme’s conformation, including hydrogen bonds, hydrophobic interactions, van der Waals forces, and sometimes disulfide bonds. The enzyme then loses its three-dimensional structure and biological activity. Inhibition instead targets particular reactive groups. Diisopropyl fluorophosphate, for example, forms a phosphate ester bond with an active-site hydroxyl group in proteases and esterases, blocking normal catalysis. Organomercury compounds and halogenated alkylating agents can similarly react with sulfhydryl groups.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-066-4f251b0b74.png" />

&emsp;&emsp;The enzyme’s overall conformation remains intact during inhibition; only particular functional groups are modified, reducing its activity.

&emsp;&emsp;Inhibition can be irreversible or reversible, depending on how tightly the inhibitor binds to the enzyme. Reversible inhibition is further divided into **competitive**, **noncompetitive**, and **uncompetitive inhibition**.

## (1) Competitive inhibition

&emsp;&emsp;As the name suggests, a competitive inhibitor competes with the substrate for the enzyme’s active site. It binds reversibly to free enzyme to form an enzyme–inhibitor complex. By occupying the active site, it prevents substrate binding and lowers the reaction rate.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-067-06e65217b4.png" />

&emsp;&emsp;Competitive inhibitors often resemble the substrate. Malonate, for example, competes with succinate for the active site of succinate dehydrogenase. The enzyme may mistake the inhibitor for its substrate, or steric hindrance may block normal substrate binding. Once bound to the inhibitor, the enzyme can neither accept the correct substrate nor catalyze the reaction. In effect, less enzyme remains available, so the observed activity falls.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-068-1d25c9c8b2.png" />

&emsp;&emsp;Succinic acid, also known as butanedioic acid or ethane-1,2-dicarboxylic acid, has the molecular formula C<sub>4</sub>H<sub>6</sub>O<sub>4</sub>. Succinate dehydrogenase converts it to fumaric acid.

&emsp;&emsp;Competitive inhibition can be treated as two simultaneous reactions involving enzyme E:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-069-6e561825f3.png" />

&emsp;&emsp;The reactions proceed in parallel. Increasing the concentration of substrate S shifts the equilibrium of

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-070-dd7b996b24.png" />

&emsp;&emsp;to the right, while the reaction

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-071-2043dbc7c8.png" />

&emsp;&emsp;is suppressed. A high enough [S] can therefore overcome the effect of inhibitor I.

&emsp;&emsp;The rate equation is derived as follows:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-072-a2a630c094.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-073-766c7ab20c.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-074-c3e6181721.png" />

&emsp;&emsp;Substitute

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-075-f74019dde3.png" />

&emsp;&emsp;into the expression for&nbsp;*K<sub>i&nbsp;</sub>* to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-076-6d409b7755.png" />

&emsp;&emsp;From the Michaelis hypothesis:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-077-9eabfcb242.png" />

&emsp;&emsp;Substitute into the enzyme-conservation equation

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-078-980a473e93.png" />

&emsp;&emsp;to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-079-446d0e704d.png" />

&emsp;&emsp;Substitute into

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-080-1be737436e.png" />

&emsp;&emsp;to obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-081-f9aa3f622d.png" />

&emsp;&emsp;Rearranging gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-082-9541a056cc.png" />

&emsp;&emsp;The equations show that competitive inhibition increases with inhibitor concentration [I] and decreases with substrate concentration [S]. At fixed [I] and [S], inhibition is stronger when *K<sub>i</sub>* is smaller and *K<sub>m</sub>* is larger.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-083-41d1410419.png" />

&emsp;&emsp;The Lineweaver–Burk plot shows the defining kinetic pattern of competitive inhibition: the maximum rate *v<sub>max</sub>* remains unchanged, while the apparent Michaelis constant *K<sub>m</sub>* increases.

## (2) Noncompetitive inhibition

&emsp;&emsp;A noncompetitive inhibitor binds outside the active site and changes the enzyme’s conformation so that it can no longer catalyze product formation. It can bind either free enzyme or the enzyme–substrate complex, forming a ternary EIS complex. The inhibitor does not prevent substrate binding, but it keeps the enzyme–substrate complex from proceeding to product. Some heavy-metal ions, including *Cu<sup>2+</sup>*, *Pb<sup>2+</sup>*, and *Hg<sup>2+</sup>*, act in this way.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-084-9fc2b5b3c3.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-085-9e6dd93f15.png" />

&emsp;&emsp;From

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-086-736118a872.png" />

&emsp;&emsp;we obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-087-440a61d519.png" />

&emsp;&emsp;Similarly, from

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-088-4a0812afed.png" />

&emsp;&emsp;we obtain:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-089-926437e723.png" />

&emsp;&emsp;From

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-090-01217106eb.png" />

&emsp;&emsp;solving gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-091-3279d3bf0e.png" />

&emsp;&emsp;Substitute the preceding results into:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-092-4e647a6893.png" />

&emsp;&emsp;Rearranging gives:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-093-a48c4e1076.png" />

&emsp;&emsp;The double-reciprocal equation is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-094-f7de75965f.png" />

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-095-6caf4376f7.png" />

&emsp;&emsp;The Michaelis–Menten equation for noncompetitive inhibition shows that the degree of inhibition depends only on inhibitor concentration [I] and *K<sub>i</sub>*, not on substrate concentration [S] or the substrate’s Michaelis constant *K<sub>m</sub>*. The graph shows that *K<sub>m</sub>* remains unchanged.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-096-e36cd29ca4.png" />

## (3) Uncompetitive inhibition

&emsp;&emsp;Unlike a competitive inhibitor, an uncompetitive inhibitor binds only to the enzyme–substrate complex. The resulting ternary complex cannot release product, so both the effective enzyme concentration and the observed activity fall. This mechanism is common in multisubstrate reactions.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-097-ffd9c8d9a7.png" />

&emsp;&emsp;The rate equation is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-098-cebc05b6af.png" />

&emsp;&emsp;The double-reciprocal equation is:

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-099-19aedd85d6.png" />

&emsp;&emsp;The derivation follows the same general steps as the competitive case and is omitted here.

<img src="/images/%E9%85%B6%E7%9A%84%E5%8F%8D%E5%BA%94%E5%8A%A8%E5%8A%9B%E5%AD%A6/fig-100-12b50af2ad.png" />

&emsp;&emsp;Uncompetitive inhibition decreases *v<sub>max</sub>* and *K<sub>m</sub>* in the same proportion, producing a family of parallel lines. Its strength depends on *K<sub>i</sub>*, *K<sub>m</sub>*, [S], and [I], and is directly proportional to both [S] and [I]. At fixed [I] and [S], inhibition becomes weaker as either *K<sub>i</sub>* or *K<sub>m</sub>* increases.

&emsp;&emsp;P.S. Reposting or excerpting this article without the author’s permission is prohibited.
