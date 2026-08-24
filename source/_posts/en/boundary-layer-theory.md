---
layout: post
title: Boundary-Layer Theory
date: '2023-02-12 14:02:06'
lang: en
translation_key: "边界层理论"
translation_source_sha256: "ce74655c9176033c7ab022c484975ddad9326edd512acf199b20fefbcc83939a"
permalink: en/2023/02/12/boundary-layer-theory/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E8%BE%B9%E7%95%8C%E5%B1%82%E7%90%86%E8%AE%BA/cover-115f0cf009.png
copyright_author: '锅炉-251'
katex: true
---

> Author: Boiler-251
Reviewed by: Shiguang

# Origins of boundary-layer theory

&emsp;&emsp;Boundary-layer theory grew out of a problem in nineteenth-century fluid mechanics. The theory of the period was based on the Euler equations for an inviscid, incompressible fluid. Because those equations neglect viscosity, their predictions often disagreed with experiments and could not readily explain phenomena such as pressure drops in pipes. The **Navier–Stokes equations**, which account for friction, had already been proposed, but contemporary mathematicians could not solve them in the cases that mattered. Theory therefore remained far removed from practice. Engineers instead developed **hydraulics** empirically, relying on experimental data rather than theoretical analysis.

&emsp;&emsp;Ludwig Prandtl resolved this difficulty by introducing the **boundary layer** in <b>“On the Motion of Fluids with Very Little Friction,”</b> a paper he presented at the Third International Congress of Mathematicians in Heidelberg. Prandtl divided the flow around a solid body into two regions:

- A very thin layer next to the object's surface, where viscous forces are important
- The outer, main-flow region, where friction can be neglected

&emsp;&emsp;This division greatly simplified the momentum equations and made them much easier to solve theoretically.

<img src="/images/%E8%BE%B9%E7%95%8C%E5%B1%82%E7%90%86%E8%AE%BA/fig-001-d4aa854951.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>Ludwig Prandtl</font></center>

&emsp;&emsp;Later experiments established several characteristic features of boundary layers:

1. A boundary layer is much thinner than the characteristic length of the object.
2. The velocity gradient within the boundary layer is large.
3. The boundary layer becomes thicker in the direction of flow.
4. The pressure across a boundary-layer section is equal to the pressure in the main flow.
5. Viscous and inertial forces within the boundary layer are of the same order of magnitude.
6. A boundary layer may be laminar or turbulent.

# Boundary-layer equations

&emsp;&emsp;Consider a two-dimensional, steady, incompressible flow. Let the x-axis point in the direction of flow and the y-axis point perpendicular to the wall.

&emsp;&emsp;The continuity equation is:
$$\frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}$$

&emsp;&emsp;The momentum equation is:
$$u \frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} = U\frac{dU}{dx} + \gamma \frac{\partial ^{2}u}{\partial y^{2}}$$

&emsp;&emsp;The boundary conditions are:
$$y=0, u=v=0$$
$$y=\infty,u=U(x)$$

&emsp;&emsp;Even after applying the boundary-layer approximation, the equation still contains nonlinear terms. In 1907, Blasius reduced it to the equation that now bears his name:
$$f^{'''} + \frac{1}{2} ff^{''} = 0$$

&emsp;&emsp;In 1921, von Kármán introduced the boundary-layer momentum integral equation as another way to calculate boundary-layer flows. Together, these methods make the boundary-layer equations tractable.

<img src="/images/%E8%BE%B9%E7%95%8C%E5%B1%82%E7%90%86%E8%AE%BA/fig-002-44399be596.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>Boundary layer</font></center>

# Separation and transition

&emsp;&emsp;“Separation” occurs when the **boundary layer detaches from the surface and the flow reverses**. The wall's **viscous force** on the boundary layer, together with **pressure drag** opposing the flow, causes separation at some point on the object. A recirculation region forms, dissipating a substantial amount of energy. Typical examples include flow past blunt bodies such as cylinders and spheres, and flow through conical diffusers with large opening angles. If a laminar boundary layer becomes turbulent before it reaches the separation point, strong turbulent mixing moves that point downstream. The resulting increase in skin-friction drag is outweighed by a large reduction in pressure drag, so the overall energy loss falls.

&emsp;&emsp;“Transition” is **a change in the flow state within the boundary layer**. At low Reynolds numbers the flow is **laminar**; at high Reynolds numbers it is **turbulent**. When a viscous fluid flows around an object, the boundary layer near the leading edge is laminar. Farther downstream, the Reynolds number rises and the laminar boundary layer becomes unstable. Small disturbances are unavoidable in a real fluid. They grow, disrupt the laminar flow, and eventually produce fully developed turbulence. This change from laminar to turbulent flow is called transition.
