---
layout: post
title: Does Water Chill Faster Upright or on Its Side in the Refrigerator?
date: 2026-05-17 14:32:00
lang: en
translation_key: "冰箱里的水是竖着放还是横着放冷的快"
translation_source_sha256: "617ca8c1054e83c2759789d0bfb78b771b86c60ed734dd1e43416b93a2c9d21e"
permalink: en/2026/05/17/does-water-chill-faster-upright-or-sideways/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E5%86%B0%E7%AE%B1%E9%87%8C%E7%9A%84%E6%B0%B4%E6%98%AF%E7%AB%96%E7%9D%80%E6%94%BE%E8%BF%98%E6%98%AF%E6%A8%AA%E7%9D%80%E6%94%BE%E5%86%B7%E7%9A%84%E5%BF%AB/cover-9dcec1a0d0.jpg
copyright_author: '锅炉-251'
katex: true
---

{% note blue 'fas fa-snowflake' %}
When you put a bottle of mineral water in the refrigerator, will it chill faster lying down or standing upright? A horizontal bottle seems to expose more surface area to the cold air, but does that really make it cool more quickly? Read on to find out.
{% endnote %}

> Author: 锅炉-251
Reviewed by: 薛定谔的猫

# Introduction

&emsp;&emsp;Suppose you put a room-temperature bottle of mineral water in the refrigerator and want it to cool as quickly as possible. How would you position it? Many people might answer intuitively, “Lay it on its side—it seems to expose more area to the cold air.” Others might argue, “Standing it upright is better because cold air moves downward.”

&emsp;&emsp;This simple question from everyday life attracts conflicting answers, but it can be explained through an important concept in **heat transfer**: **natural convection** [1].

<img src="/images/冰箱里的水是竖着放还是横着放冷的快/fig1.jpeg" alt="Figure 1. Which orientation—horizontal or upright—favors natural convection?" title="Figure 1. Which orientation—horizontal or upright—favors natural convection?" />
<center><font size=2px color=grey>Figure 1. Which orientation—horizontal or upright—favors natural convection?</font></center>

# How Does Water Cool in a Refrigerator?

&emsp;&emsp;After a bottle of water goes into the refrigerator, heat must “escape” from the water into the refrigerator's air. Like putting an elephant into a refrigerator, the process takes roughly three steps:

1. The water inside the bottle transfers heat to the bottle wall;
2. Heat passes from the inner surface of the bottle wall to the outer surface;
3. The bottle wall transfers heat to the cold air in the refrigerator.

&emsp;&emsp;The first of these steps involves a phenomenon that cannot be ignored: **the water inside the bottle does not simply sit still as it cools; it begins to move on its own**. In everyday calculations, we may treat water as a fluid of constant density. Inside a stationary bottle, however, even small density changes can create a driving force. As water cools, its density increases and it sinks. Water that has not yet cooled remains slightly warmer and less dense, so it rises. The bottle thus develops a flow driven entirely by the temperature difference, with no pump or fan. This is **natural convection**. How fast the water cools therefore depends not only on how cold the bottle's surroundings are, but also on whether the water inside can establish an effective circulation.

# Analyzing the Strength of Natural Convection

&emsp;&emsp;Before beginning the analysis, we will simplify the physical model, setting aside phenomena that do not matter to the issue at hand so that we can focus on the one we want to study:

1. The model does not include conductive contact with a cold plate, meaning that the bottle is cooled only by moving air;
2. There is no forced convection in the refrigerator, meaning that no fan or other device drives the air.

&emsp;&emsp;Now let us consider the factors that affect natural convection. A temperature difference produces circulation in the water because it changes the density—or, equivalently, the buoyancy. The two main factors governing natural convection are:

- **Buoyancy**
Cold water grows denser and sinks, while warmer, less-dense water rises, driving a vertical circulation. The greater the buoyancy force, the more pronounced the circulation within the water.

- **Viscous resistance**
Every flow is opposed by viscosity within the fluid. The stronger this resistance, the weaker the natural convection.

&emsp;&emsp;To determine which of these two effects dominates natural convection, we introduce the Grashof number (Gr):

$$Gr = \frac{g\beta\Delta T L^3}{\nu^2}\tag{1}$$

&emsp;&emsp;The expression may look intimidating at first, but its physical meaning is straightforward. It essentially compares two effects: buoyancy, which makes cooler, heavier fluid sink and warmer, lighter fluid rise; and viscous resistance, through which the fluid opposes its own motion. In simple terms, $Gr \sim \frac{\text{buoyancy driving force}}{\text{viscous resistance}}$$ .

&emsp;&emsp;The symbols in the formula have the following physical meanings:

- $g$ is **gravity**. Without gravity as a driving force, buoyant convection is weak.
- $\beta$ is the **volumetric thermal expansion coefficient**, which indicates how sensitive a fluid is to temperature changes. A larger $\beta$ means that temperature has a more pronounced effect on density.
- $\Delta T$ is the **temperature difference**, which determines how strongly temperature drives buoyancy.
- $L$ is the **characteristic length**, which can be understood as the amount of space available for the fluid to establish a circulation.
- $\nu$ is the **kinematic viscosity**, a measure of the resistance to flow.

&emsp;&emsp;The most important point is that:

$$Gr \propto L^3\tag{2}$$

&emsp;&emsp;The larger the available space, the stronger the buoyant driving effect and the more active the convection.

&emsp;&emsp;Having considered what controls natural convection, we must next ask whether that convection can affect heat transfer effectively. For this purpose, we define the **Rayleigh number** ($Ra$):
$$Ra = Gr \cdot Pr\tag{3}$$

- $Pr$ is the **Prandtl number**, calculated as $Pr = \frac{\nu}{\alpha}$.
- $\alpha$ is the **thermal diffusivity**, which describes the ability of heat to spread through molecular diffusion.

&emsp;&emsp;Like the Rayleigh and Grashof numbers, the Prandtl number is **dimensionless**. It compares the diffusion of fluid motion—or momentum—with the diffusion of heat. The larger the Prandtl number, the more significant momentum diffusion is relative to thermal diffusion. Once the Prandtl number has been defined, the Rayleigh number can be written as:

$$Ra = \frac{g\beta\Delta T L^3}{\nu \alpha}\tag{4}$$

&emsp;&emsp;Physically, the Rayleigh number tells us whether buoyancy produced by a temperature difference can overcome viscous and thermal diffusion, allowing natural convection to become fully established.

&emsp;&emsp;If $Ra$ is small, even a temperature difference within the fluid will not readily produce large-scale circulation.

&emsp;&emsp;If $Ra$ is large, rising and sinking flows form more easily within the fluid, increasing the rate of heat transfer.

&emsp;&emsp;To summarize this section, we constructed three dimensionless groups. The Grashof number asks **whether the fluid can begin to flow**, while the Rayleigh number asks **whether that natural convection can develop effectively and enhance heat transfer**.

# Why Does an Upright Bottle Usually Cool Faster?

&emsp;&emsp;Let us set the equations aside and return to the original question. An ordinary mineral-water bottle is usually much taller than it is wide.

&emsp;&emsp;When the bottle's long axis is aligned with gravity, the water can move more readily along its height and form a circulation. Water beside the cold wall cools first and sinks, while warmer water in the middle rises to replace it, creating a complete convection loop.

&emsp;&emsp;In this orientation, the characteristic length involved in natural convection is closer to the bottle height $H$.

&emsp;&emsp;When the bottle lies on its side, temperature still produces density differences, but the vertical distance available for circulation is no longer the full bottle height; it is closer to the bottle diameter $D$. From the Rayleigh number, $H^3 > D^3$. In other words, **the Grashof and Rayleigh numbers are generally larger when the bottle stands upright**. Natural convection inside the bottle is therefore **stronger**, mixing the water more thoroughly and carrying heat from its center to the cold wall more quickly. The result is that **an upright bottle cools faster**.

<img src="/images/冰箱里的水是竖着放还是横着放冷的快/fig2.png" alt="Figure 2. Numerical results for natural convection" title="Figure 2. Numerical results for natural convection" />
<center><font size=2px color=grey>Figure 2. Numerical results for natural convection [3]</font></center>

# Conclusion

&emsp;&emsp;Natural convection appears in many settings besides a bottle of water in a refrigerator. It is, for example, the basis of **fanless cooling** in products such as mobile phones and outdoor base stations. Studying heat dissipation through natural convection can help us improve the design of electronic products, extending their service life and increasing their reliability.

# References

1. Tao Wenquan. *Heat Transfer*, 5th ed. Higher Education Press [M]. 2019, 2019.
2. Bergman T L, Incropera F P. Fundamentals of heat and mass transfer. 7th ed. Hoboken, NJ. 2011. Wiley, 2011.
3. Borah R, Gupta S, Mishra L, et al. Heating of liquid foods in cans: Effects of can geometry, orientation, and food rheology[J]. Journal of Food Process Engineering, 2020, 43(7): e13420.
