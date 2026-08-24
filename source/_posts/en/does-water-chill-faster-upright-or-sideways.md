---
layout: post
title: Does a Bottle of Water Chill Faster Standing Up or Lying Down?
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
Will a bottle of mineral water chill faster in the refrigerator standing up or lying on its side? Laying it down seems to expose more surface area to the cold air, but does that actually help? Let's find out.
{% endnote %}

> Author: 锅炉-251
Reviewed by: 薛定谔的猫

# Introduction

&emsp;&emsp;Suppose you want to chill a room-temperature bottle of mineral water as quickly as possible. How would you place it in the refrigerator? Many people instinctively say, “Lay it on its side; that puts more of the bottle in contact with the cold air.” Others argue, “Stand it up, because cold air sinks.”

&emsp;&emsp;This ordinary question produces plenty of conflicting answers. An important idea from **heat transfer**, however, can help us sort them out: **natural convection** [1].

<img src="/images/冰箱里的水是竖着放还是横着放冷的快/fig1.jpeg" alt="Figure 1. Which orientation—horizontal or upright—favors natural convection?" title="Figure 1. Which orientation—horizontal or upright—favors natural convection?" />
<center><font size=2px color=grey>Figure 1. Which orientation—horizontal or upright—favors natural convection?</font></center>

# How Does Water Cool in a Refrigerator?

&emsp;&emsp;Once the bottle goes into the refrigerator, heat must make its way from the water to the surrounding air. Like the old joke about putting an elephant in a refrigerator, the process takes roughly three steps:

1. The water inside the bottle transfers heat to the bottle wall;
2. Heat passes from the inner surface of the bottle wall to the outer surface;
3. The bottle wall transfers heat to the cold air in the refrigerator.

&emsp;&emsp;The first step involves a crucial point: **the water does not remain still while it cools; it starts moving on its own**. We often treat water as having constant density, but even a small density change can drive flow in a stationary bottle. Cooling water becomes denser and sinks, while the slightly warmer, less-dense water rises. A circulating flow develops with no pump or fan, driven entirely by the temperature difference. This is **natural convection**. The cooling rate therefore depends not only on the temperature outside the bottle, but also on how effectively the water can circulate inside it.

# Analyzing the Strength of Natural Convection

&emsp;&emsp;Before analyzing the problem, we need a simplified physical model that sets aside effects unrelated to the phenomenon we want to study:

1. The model does not include conductive contact with a cold plate, meaning that the bottle is cooled only by moving air;
2. There is no forced convection in the refrigerator, meaning that no fan or other device drives the air.

&emsp;&emsp;A temperature difference sets the water in motion by changing its density and therefore its buoyancy. Two main effects determine the strength of that natural convection:

- **Buoyancy**
Cold water becomes denser and sinks, while warmer, less-dense water rises. The stronger the buoyancy force, the more vigorous this circulation becomes.

- **Viscous resistance**
Viscosity opposes motion within any fluid. Greater viscous resistance means weaker natural convection.

&emsp;&emsp;The Grashof number (Gr) compares these two effects:

$$Gr = \frac{g\beta\Delta T L^3}{\nu^2}\tag{1}$$

&emsp;&emsp;The equation may look intimidating, but the idea is simple. It compares the buoyancy that makes cool, dense fluid sink and warm, light fluid rise with the viscosity that resists this motion. In short, $Gr \sim \frac{\text{buoyancy driving force}}{\text{viscous resistance}}$$ .

&emsp;&emsp;Each symbol represents a physical quantity:

- $g$ is **gravitational acceleration**. Without gravity, buoyancy-driven convection is weak.
- $\beta$ is the **volumetric thermal expansion coefficient**, a measure of how strongly a fluid's density responds to temperature. A larger $\beta$ means a greater density change.
- $\Delta T$ is the **temperature difference** that drives the buoyancy force.
- $L$ is the **characteristic length**, roughly the distance available for the fluid to establish a circulation.
- $\nu$ is the **kinematic viscosity**, which measures resistance to flow.

&emsp;&emsp;The key relation is:

$$Gr \propto L^3\tag{2}$$

&emsp;&emsp;A larger characteristic length gives buoyancy more room to drive the flow, producing more vigorous convection.

&emsp;&emsp;Knowing what drives the flow is only part of the problem. We also need to know whether that flow can significantly enhance heat transfer. For this, we use the **Rayleigh number** ($Ra$):
$$Ra = Gr \cdot Pr\tag{3}$$

- $Pr$ is the **Prandtl number**, defined as $Pr = \frac{\nu}{\alpha}$.
- $\alpha$ is the **thermal diffusivity**, which measures how readily heat spreads by molecular diffusion.

&emsp;&emsp;The Prandtl, Grashof, and Rayleigh numbers are all **dimensionless**. The Prandtl number compares momentum diffusion with thermal diffusion. A larger value means momentum diffuses more readily relative to heat. Substituting it into the definition above gives:

$$Ra = \frac{g\beta\Delta T L^3}{\nu \alpha}\tag{4}$$

&emsp;&emsp;In physical terms, the Rayleigh number tells us whether temperature-driven buoyancy can overcome the damping effects of viscosity and thermal diffusion so that natural convection can develop.

&emsp;&emsp;When $Ra$ is small, a temperature difference is unlikely to produce large-scale circulation.

&emsp;&emsp;When $Ra$ is large, rising and sinking currents form more readily and transfer heat faster.

&emsp;&emsp;We have now introduced three dimensionless numbers. In broad terms, the Grashof number asks **whether the fluid can get moving**, while the Rayleigh number asks **whether natural convection can develop enough to improve heat transfer**.

# Why Does an Upright Bottle Usually Cool Faster?

&emsp;&emsp;Now set the equations aside and return to the bottle. An ordinary mineral-water bottle is much taller than it is wide.

&emsp;&emsp;When the bottle's long axis lines up with gravity, water can circulate along its full height. Water next to the cold wall cools and sinks, while warmer water in the center rises to replace it, completing the loop.

&emsp;&emsp;The characteristic length for this circulation is therefore close to the bottle height $H$.

&emsp;&emsp;When the bottle lies on its side, temperature still creates density differences, but the vertical distance available for circulation is closer to the diameter $D$ than to the full height. Because $H^3 > D^3$, **both the Grashof and Rayleigh numbers are generally larger for the upright bottle**. Its stronger natural convection mixes the water more thoroughly and carries heat from the center to the cold wall faster. Under this model, then, **the upright bottle cools faster**.

<img src="/images/冰箱里的水是竖着放还是横着放冷的快/fig2.png" alt="Figure 2. Numerical results for natural convection" title="Figure 2. Numerical results for natural convection" />
<center><font size=2px color=grey>Figure 2. Numerical results for natural convection [3]</font></center>

# Conclusion

&emsp;&emsp;Natural convection matters far beyond a bottle of water. **Fanless cooling** in devices such as mobile phones and outdoor base stations relies on the same process. A better understanding of natural-convection cooling can guide electronic design and improve both service life and reliability.

# References

1. Tao Wenquan. *Heat Transfer*, 5th ed. Higher Education Press [M]. 2019, 2019.
2. Bergman T L, Incropera F P. Fundamentals of heat and mass transfer. 7th ed. Hoboken, NJ. 2011. Wiley, 2011.
3. Borah R, Gupta S, Mishra L, et al. Heating of liquid foods in cans: Effects of can geometry, orientation, and food rheology[J]. Journal of Food Process Engineering, 2020, 43(7): e13420.
