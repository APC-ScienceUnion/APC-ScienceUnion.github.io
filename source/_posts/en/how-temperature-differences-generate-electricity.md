---
layout: post
title: 'Heat and Electricity, Part 1: How Does a Temperature Difference Generate Electricity?'
date: 2026-07-12 01:00:00
lang: en
translation_key: "热与电的相互转化（1）——温差是怎么发电的呢？"
translation_source_sha256: "a01aa562dfa0c1cb47e9bed7c0d9dbc05359e304eda377b38fbcbdaa6b30f8f9"
permalink: en/2026/07/12/how-temperature-differences-generate-electricity/
aside: true
comments: false
tags: []
categories: []
cover: /images/热与电的相互转化（1）——温差是怎么发电的呢？/cover.png
copyright_author: 'ST'
katex: true
---

{% note blue 'fas fa-bolt' %}
Can we generate electricity without “boiling water,” using only a temperature difference? Why would a temperature difference set electric charges in motion? And how can such a seemingly weak effect power deep-space probes? Meet the Seebeck effect: one way that “heat” becomes electricity.
{% endnote %}

> Author: ST  
> Reviewer: 时光

&emsp;&emsp;People often reduce power generation to “boiling water”: heat water, use the steam to turn a turbine, and convert that mechanical energy into electricity. The clearest example is **fossil-fuel power generation**, which burns coal, natural gas, oil, or another fuel to heat the water. **Nuclear, geothermal, biomass,** and even **waste-to-energy** plants often follow the same basic route. **Wind turbines, photovoltaic cells, hydropower,** and **fuel cells**, by contrast, do not “boil water” at all.

&emsp;&emsp;Our subject is how **heat** itself can generate electricity. “Doesn't boiling water already involve plenty of heat?” you might ask. Yes—but here, “heat” means a **thermal gradient**, or, in everyday language, a **temperature difference**. Dip one end of a metal chopstick into boiling water. The submerged end is plainly hotter than the end in your hand. **That difference between two regions is a temperature gradient, also called a thermal gradient.**

&emsp;&emsp;What does any of this have to do with electricity? Electricity does not appear from nowhere. A “boiling-water” plant, for example, relies on **Faraday's law of electromagnetic induction**: a coil moves relative to a magnetic field. Faraday's law tells us that **a changing magnetic flux produces an induced electromotive force**. Like an invisible hand, the changing field pushes charges through a wire and turns mechanical motion into electrical energy. Light separates positive and negative charges inside a photovoltaic cell, creating a voltage across its terminals. In a fuel cell, a chemical reaction between fuel and oxidant drives electrons in one direction and produces a voltage.

&emsp;&emsp;Whatever the method, power generation depends on the directed motion of **charge carriers**—tiny particles that move through a material while carrying electric charge. In ordinary metals and semiconductors, those carriers are usually **electrons**. Put simply, generating electricity means persuading charge carriers to move together in the same direction.

&emsp;&emsp;So what happens to charge carriers in a thermal gradient? Even without outside interference, they are never still; they remain in **continuous random motion**. Across an entire material, however, they are distributed evenly, with roughly equal numbers moving in every direction, so no current flows. Make one end hotter, and the carriers there gain energy and move more vigorously. The balance breaks: carriers diffuse toward the cold end and build up there. Since the carriers hold charge, the two ends develop an unequal charge distribution—a **voltage**. That buildup cannot continue indefinitely. As more carriers arrive, the cold end increasingly repels newcomers. Eventually repulsion balances diffusion, leaving a stable **thermoelectric voltage**. This is one form of the **thermoelectric effect**.

&emsp;&emsp;Does this basic mechanism have a practical use? Absolutely. In the 1820s, German physicist Thomas Johann Seebeck found that a nearby compass needle moved when two different metals formed a closed circuit whose two junctions were held at different temperatures. Seebeck did not realize that current was flowing, but we now know that the thermal gradient produced an electromotive force. We call this phenomenon the **Seebeck effect**. For power generation, we naturally want as much voltage as possible, and that voltage depends on the size of the thermal gradient. How do we measure the relationship?

&emsp;&emsp;To describe a material's **thermoelectric capability**—specifically, its Seebeck effect—we define the **Seebeck coefficient S** as $S=-\frac{\Delta V}{\Delta T}$. In plain terms, it tells us **how much voltage the material produces for each degree of temperature difference between its hot and cold ends**. For two materials, the measured voltage depends approximately on the difference between their Seebeck coefficients: $V \propto (S_A-S_B)\Delta T$.

<img src="/images/热与电的相互转化（1）——温差是怎么发电的呢？/fig1.png" alt="Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect." title="Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect." />
<center><font size=2px color=grey>Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect.</font></center>

&emsp;&emsp;The most obvious use of the Seebeck effect is **power generation**. Connect many thermoelectric units in series, and together they form a **thermoelectric generator**. Keep one side hot and the other cold, and the device continues producing electricity.

&emsp;&emsp;Unlike a conventional generator, a thermoelectric generator needs no turbine, rotating shaft, or complicated mechanical motion. It runs quietly and is stable and durable. The drawbacks are just as clear: thermoelectric conversion **is usually inefficient**, often around **5%**, and it requires a steady temperature difference. For now, these generators are best suited to recovering heat that would otherwise go to waste—from engine exhaust, boiler walls, or electronic equipment, for example.

&emsp;&emsp;For deep-space probes far from the Sun, thermoelectric generation provides an important, dependable source of energy. Voyager, New Horizons, and some Mars rovers carry **radioisotope thermoelectric generators**. Radioactive decay releases a steady supply of heat, creating a temperature difference across the device; thermoelectric materials then convert some of that heat into electricity. These generators can keep working for many years in harsh environments.

&emsp;&emsp;The Seebeck effect can also serve as a **thermometer** through **thermocouple thermometry**. A thermocouple usually joins two different metals. Hold its two junctions at different temperatures, and it produces a tiny voltage that a precise instrument can measure; that voltage, in turn, reveals the temperature. In a common **type K thermocouple**, for example, a change of 1 K changes the voltage by roughly 4.1*10-6 V. The number sounds tiny, but instruments can readily detect it. Thermocouples are also simple, heat-resistant, and quick to respond, so they are widely used in industrial furnaces, engines, boilers, chemical equipment, and laboratories.

&emsp;&emsp;The Seebeck effect has more uses than you might expect. Sharp-eyed readers may have noticed one feature of the thermoelectric effect discussed here: **the voltage is parallel to the thermal gradient**. Could a voltage appear in some other direction? Yes. Next time, we will see how a thermal gradient can produce a voltage perpendicular to itself.

# References

[1] Seebeck T J. Magnetische Polarisation der Metalle und Erze durch Temperatur-Differenz[J]. Abhandlungen der Königlichen Akademie der Wissenschaften zu Berlin, 1822-1823: 265-373.
[2] Goldsmid H J. Introduction to Thermoelectricity[M]. Berlin, Heidelberg: Springer, 2010.
[3] Bell L E. Cooling, heating, generating power, and recovering waste heat with thermoelectric systems[J]. Science, 2008, 321(5895): 1457-1461.
[4] Snyder G J, Toberer E S. Complex thermoelectric materials[J]. Nature Materials, 2008, 7(2): 105-114.
[5] NASA Radioisotope Power Systems Program. Radioisotope Power Systems[EB/OL]. https://rps.nasa.gov/.
[6] Mizuguchi M, Nakatsuji S. Energy-harvesting materials based on the anomalous Nernst effect[J]. Science and Technology of Advanced Materials, 2019, 20(1): 262-275.
