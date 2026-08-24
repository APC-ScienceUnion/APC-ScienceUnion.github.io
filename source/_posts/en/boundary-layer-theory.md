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

# The Origin of Boundary-Layer Theory

&emsp;&emsp;The concept of “boundary-layer theory” can be traced back to nineteenth-century fluid mechanics. Theoretical fluid mechanics at the time was derived from the inviscid, incompressible Euler equations. Because it ignored viscosity, theory conflicted markedly with experimental results and struggled to explain such problems as pressure drops in pipes. The **Navier–Stokes equations**, which include friction, had already been proposed, but the mathematics of the period was insufficient to solve them, leaving a vast gulf between theory and reality. **Hydraulics** was ultimately developed from practical experience, using experimental data to avoid theoretical analysis.

&emsp;&emsp;Against this background, Ludwig Prandtl introduced the concept of the **boundary layer** in his paper <b>“On the Motion of Fluids with Very Little Friction”</b>, presented at the Third International Congress of Mathematicians in Heidelberg. In the paper, Prandtl proposed dividing fluid flow around a solid body into two regions:

- A very thin layer at the object's surface, in which viscous forces play an important role
- The main-flow region outside that layer, where friction can be neglected

&emsp;&emsp;The introduction of “boundary-layer” theory greatly simplified the theoretical solution of the momentum equations.

<img src="/images/%E8%BE%B9%E7%95%8C%E5%B1%82%E7%90%86%E8%AE%BA/fig-001-d4aa854951.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>Ludwig Prandtl</font></center>

&emsp;&emsp;Scientists later found experimentally that boundary layers have the following characteristics:

1. The boundary-layer thickness is far smaller than the characteristic length of the object;
2. A large velocity gradient exists within the boundary layer;
3. The boundary-layer thickness increases in the direction of flow;
4. The pressure across each boundary-layer section equals the pressure in the main flow;
5. Viscous and inertial forces within the boundary layer are of the same order of magnitude;
6. Boundary layers can be either laminar or turbulent;

# The Boundary-Layer Equations

&emsp;&emsp;First consider a two-dimensional, steady, incompressible flow. Define the x-axis along the direction of flow and the y-axis perpendicular to the wall.

&emsp;&emsp;We obtain the continuity equation:
$$\frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}$$

&emsp;&emsp;The momentum equation:
$$u \frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} = U\frac{dU}{dx} + \gamma \frac{\partial ^{2}u}{\partial y^{2}}$$

&emsp;&emsp;The boundary conditions:
$$y=0, u=v=0$$
$$y=\infty,u=U(x)$$

&emsp;&emsp;Even after the boundary-layer simplification, the equation still contains nonlinear terms. In 1907, Blasius simplified it to obtain the famous Blasius equation:
$$f^{'''} + \frac{1}{2} ff^{''} = 0$$

&emsp;&emsp;In 1921, von Kármán introduced the boundary-layer momentum integral equation for calculating boundary-layer problems. These methods allow us to solve the boundary-layer equations.

<img src="/images/%E8%BE%B9%E7%95%8C%E5%B1%82%E7%90%86%E8%AE%BA/fig-002-44399be596.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>Boundary layer</font></center>

# Separation and Transition

&emsp;&emsp;“Separation” is the phenomenon in which the **boundary layer detaches from the surface and reverses its flow**. The wall's **viscous force** on the boundary layer and **pressure drag** opposing the direction of flow cause the boundary layer to separate at some point on the object. This creates a recirculation region and substantial energy dissipation. Typical examples include flow around blunt bodies such as cylinders and spheres, and flow inside conical diffusers with large opening angles. If a laminar boundary layer becomes turbulent before reaching the separation point, the intense mixing produced by turbulence shifts the separation point downstream. Although this increases skin-friction drag, it greatly reduces pressure drag and therefore reduces energy loss.

&emsp;&emsp;“Transition” means **a change in the state of flow within the boundary layer**. The flow is **laminar** at low Reynolds numbers and **turbulent** at high Reynolds numbers. When a viscous fluid flows around an object, the flow near the object's leading edge is laminar. As the distance from the leading edge increases, the Reynolds number also rises, and the laminar boundary layer becomes unstable. Disturbances are unavoidable in a fluid. They alter the laminar flow, drive it toward turbulence, and ultimately make it fully turbulent. This change from laminar to turbulent flow is called transition.

