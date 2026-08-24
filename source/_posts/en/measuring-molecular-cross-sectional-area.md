---
layout: post
title: 'Can We Measure the Cross-Sectional Area of a Molecule?'
date: '2021-04-24 18:00:00'
lang: en
translation_key: '有能够测量分子横截面积的标尺吗？'
translation_source_sha256: "dba515c81eafebcaa9f6ec179b5fc5c615203f0468f054cfcec370f65b078b03"
permalink: en/2021/04/24/measuring-molecular-cross-sectional-area/
aside: true
comments: false
tags: []
categories: []
cover: '/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-001-dc20ecad3f.jpg'
copyright_author: 'delta'
---

> Author: delta
Reviewed by: Guanfu · Juntian

&emsp;&emsp;**No. End of explainer.**

&emsp;&emsp;But if you learned about Cavendish's torsion-balance experiment in middle school, you probably will not be satisfied with stopping there. Physics has a technique known as two-stage amplification. Could the same idea, or something similar, be used to measure dimensions in the microscopic world?

&emsp;&emsp;It certainly **can**. This article uses accessible language to explain one way of measuring the cross-sectional area of a molecule: the **surface-tension method**.

# What is surface tension?

&emsp;&emsp;Really? Do we have to start this far back?

&emsp;&emsp;You have seen surface tension countless times: raindrops on a window, early-morning dew on leaves, and large soap bubbles in the laundry. You may also have encountered, or may soon encounter, the subject in high-school physics. At the microscopic level, a liquid consists of vast numbers of molecules. They are neither as far apart as gas molecules nor as tightly packed as molecules in a solid, so they can move freely while still attracting one another. If we represent the molecules as circles, the region where a liquid surface meets a gas looks roughly like the diagram below.

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-002-7cf3c0927b.png" alt="" />

<center><font size=2px color=grey>(Hand-drawn due to time constraints)</font></center>

&emsp;&emsp;You may have noticed that the circles representing molecules are more sparsely distributed near the surface. At the gas-liquid interface, thermal motion allows liquid molecules to escape into the air while gas molecules enter the liquid. For equal volumes, however, the liquid contains more molecules, so more molecules leave the liquid than enter it. The surface layer is therefore less densely populated. To maintain a continuous surface at constant volume, the liquid must form that surface with as few molecules as possible. Only a **spherical surface** satisfies this condition; we will skip the proof that a sphere has the smallest surface area for a given volume. In other words, a force among the molecules at the liquid's surface makes the surface spherical when gravity is ignored. The force that maintains this state is called surface tension.

&emsp;&emsp;What produces surface tension? Let us return to Figure 1 and add a few more strokes.

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-003-6891f281f1.png" alt="" />

<center><font size=2px color=grey>(Well, well, isn't that a gas molecule? I hardly recognized you.)</font></center>

&emsp;&emsp;Let the arrows represent intermolecular forces. Because the liquid contains far more molecules, their attraction dominates; the comparatively sparse gas molecules contribute little. This imbalance in attraction gives rise to surface tension, though it is not surface tension itself. It tends to draw surface molecules into the liquid, keeping the surface taut. This is only an intuitive model, not a literal account of the phenomenon. The real situation is much more complicated. Surface tension, for example, acts tangent to the liquid surface. How can an imbalance in attraction produce a force in that direction? One rough way to picture it is that the imbalance pulls a surface molecule downward while its neighbors on either side resist letting it leave the surface, as shown below.

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-004-1a8f07d312.png" alt="" />

&emsp;&emsp;The angle θ is extremely small. At the molecular scale, how large could it be? We therefore ignore it. The resulting pull is surface tension, tangent to the liquid surface.

&emsp;&emsp;Everything above assumes a liquid containing only one substance. What happens if we add a solute to it, using water as our example?

## The Night I Lost My Purity

&emsp;&emsp;The water, that is. Adding a solute makes it impure. Nothing scandalous here; the experiment simply happened at night.

&emsp;&emsp;Adding the solute lowers the surface tension of water. According to the **principle of minimum energy**, the system favors the lower surface tension. The solute concentration at the surface will therefore be slightly higher than in the bulk; if the solute raises surface tension, the reverse occurs. This difference between surface and bulk concentrations is called **surface adsorption**. Whenever a phenomenon exists, some supposedly idle scientist (just kidding) will go looking for the rule behind it. Consider **Szyszkowski**: I could not even find biographical information about him on Baidu, yet he derived the following empirical equation from his experimental data:

&emsp;&emsp;σ＝σ₀-σ₀αln（1+c/β）

&emsp;&emsp;Here, σ is the surface tension of the solution, σ₀ is the surface tension of the solvent, α and β are empirical coefficients, and c is the solution concentration.

&emsp;&emsp;Is this empirical equation valid? In 1916, physical chemist **Irving Langmuir** proposed that atoms or molecules at a solid surface possess outward residual valence forces that can capture gas molecules. Because these forces act over a distance comparable to a molecular diameter, the surface can adsorb only a single molecular layer. He accordingly derived the **Langmuir monolayer adsorption isotherm**, whose form at a gas-liquid interface is shown below:

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-005-03d1112ca6.png" alt="" />

&emsp;&emsp;Here, Γ is the amount adsorbed, and Γ∞ is the limiting adsorption, the amount present when adsorbed molecules cover the entire surface. It can be approximated as the amount of solute at saturation. Under this model, the liquid surface likewise supports only a monolayer. If we can determine Γ∞, then the molecular cross-sectional area is <img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-006-1433cbe91b.png" alt="" />, bringing us back to our original question.

&emsp;&emsp;Chemical thermodynamics gives the following result. We will omit the lengthy derivation: the **Gibbs adsorption equation**:

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-007-4541f49051.png" alt="" />

&emsp;&emsp;Substituting the Langmuir equation gives:

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-008-910c794ead.png" alt="" />

&emsp;&emsp;Integration yields:

&emsp;&emsp;σ＝σ₀-RTΓ∞ln（1+kc）

&emsp;&emsp;This has the same form as Szyszkowski's empirical equation. It supports that equation and gives us a route back to our original goal: measuring molecular cross-sectional area. If we measure surface tension and solution concentration, plot the resulting curve, and fit a function to it, we can obtain Γ∞ and then calculate the molecular cross-sectional area.

&emsp;&emsp;Solution concentration can be measured accurately by photometry and several other methods. Surface tension can be determined by forming a small bubble in a capillary and measuring the pressure difference between the inside and outside of the tube, which gives the bubble's excess pressure. At its smallest, the bubble has the same diameter as the capillary. The capillary's internal diameter can first be calibrated from the maximum excess pressure of a liquid with known surface tension. The **Laplace equation** then relates the maximum excess pressure to surface tension; deriving it is not central to this article.

# In practice: determining the cross-sectional area of an n-butanol molecule

&emsp;&emsp;I use n-butanol here simply because that was the substance in my experiment. If you have access to the equipment, you can apply the same principle to measure the molecular cross-sectional area of other substances.

&emsp;&emsp;What follows is data processing rather than popular-science exposition. Read on if you are interested; it also shows that the method is reasonably reliable.

## Code:

```text
data = {{0, 72.75}, {0.022, 65.91}, {0.066, 58.15}, {0.109,52.94}, {0.153, 49.27}, {0.262, 42.94}, {0.372, 38.53}, {0.590, 32.99}, {0.809, 28.86}}
fit = NonlinearModelFit[data, 72.75 - a*Log[1 + b*x], {a, b}, x]
Show[ListPlot[data], Plot[fit[x], {x, 0, 0.9}, PlotStyle -> {Red, Thick},AxesLabel -> {c, \[Sigma]}]]
```

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-009-cfc57cfe66.png" alt="" />

<img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-010-8c55ff41f7.png" alt="" />

&emsp;&emsp;Published values for the cross-sectional area of an n-butanol molecule lie between <img src="/images/%E6%9C%89%E8%83%BD%E5%A4%9F%E6%B5%8B%E9%87%8F%E5%88%86%E5%AD%90%E6%A8%AA%E6%88%AA%E9%9D%A2%E7%A7%AF%E7%9A%84%E6%A0%87%E5%B0%BA%E5%90%97%EF%BC%9F/fig-011-71d8bac963.png" alt="" />, so the error is small.
