---
layout: post
title: Heat and Electricity (1) — How Can a Temperature Difference Generate Power?
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
Can electricity be generated without “boiling water,” using nothing more than a temperature difference? Why should that difference make electric charges move? And how can such a seemingly weak effect power a spacecraft in deep space? This article introduces the Seebeck effect and explains how “heat” can become electricity.
{% endnote %}

> Author: ST  
> Reviewer: 时光

&emsp;&emsp;When people talk about generating electricity, many describe it as “boiling water”: heat the water, let the steam turn a turbine, and convert mechanical energy into electrical energy. The most obvious example is **fossil-fuel power generation**, where coal, natural gas, oil, or another fuel is burned to heat water. **Nuclear, geothermal, biomass,** and even **waste-to-energy** plants often use the same basic route. Other technologies—**wind turbines, photovoltaic cells, hydropower,** and **fuel cells**—do not rely on this kind of “boiling water.”

&emsp;&emsp;Our subject today is different: how **heat** itself can generate electricity. You may object that boiling water also produces a great deal of heat. It does, but “heat” here means a **thermal gradient**, or more simply, a **temperature difference**. Put a metal chopstick in boiling water: the immersed end is clearly hotter than the end in your hand. **The temperature difference between those two regions can be understood as a temperature gradient, also called a thermal gradient.**

&emsp;&emsp;What does that have to do with electricity? Electricity cannot appear from nowhere. “Boiling-water” generation, for example, relies on **Faraday's law of electromagnetic induction**: a coil and a magnetic field move relative to one another. Under Faraday's law, **a changing magnetic flux produces an induced electromotive force**. The changing field acts like an invisible hand that pushes charges through a wire, converting mechanical motion into electrical energy. In a photovoltaic cell, illumination separates positive and negative charges inside the material and creates a voltage across its terminals. In a fuel cell, a chemical reaction between a fuel and an oxidant directs the transfer of electrons and thereby produces a voltage.

&emsp;&emsp;Every method of power generation ultimately requires the directed movement of **charge carriers**—small particles that can move through a material and carry electric charge. In common metals and semiconductors, those carriers are usually **electrons**. In plain terms, generating electricity means getting charge carriers to move together in an orderly direction.

&emsp;&emsp;What happens to the carriers in a material with a thermal gradient? Even without any external disturbance, they are not at rest. They undergo **continuous random motion**. Across the material as a whole, however, the carriers are distributed uniformly and roughly equal numbers move in every direction, so there is no current. If one end of the material is hotter, the carriers there have more energy and move more vigorously. That breaks the balance: they diffuse toward the colder end and accumulate there. Because the carriers themselves are charged, the hot and cold ends develop an unequal distribution of charge, which appears as a **voltage**. The accumulation cannot continue forever. As more carriers arrive, the cold end increasingly repels them. Eventually, that tendency balances diffusion and produces a stable **thermoelectric voltage**. This is one kind of **thermoelectric effect**.

&emsp;&emsp;Now that we understand the most basic mechanism, does it have any practical use? It does. In the 1820s, the German physicist Thomas Johann Seebeck discovered that if two different metals formed a closed circuit and the two junctions were held at different temperatures, a nearby compass needle moved. Seebeck did not realize at the time that a current was flowing, but we now know that the thermal gradient produced an electromotive force. This phenomenon is called the **Seebeck effect**. For power generation, naturally, a larger voltage is desirable, and the effect depends on the magnitude of the thermal gradient. How can we measure it?

&emsp;&emsp;To express a material's **thermoelectric capability**—specifically its Seebeck effect—we define the **Seebeck coefficient S** as $S=-\frac{\Delta V}{\Delta T}$. Its meaning is straightforward: **how much voltage the material produces for each degree of temperature difference between its hot and cold ends**. With two materials, the measured voltage is approximately related to the difference between their Seebeck coefficients: $V \propto (S_A-S_B)\Delta T$.

<img src="/images/热与电的相互转化（1）——温差是怎么发电的呢？/fig1.png" alt="Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect." title="Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect." />
<center><font size=2px color=grey>Figure 1[3]. A: an electric potential difference can produce a thermal gradient—the inverse of the Seebeck effect, known as the Peltier effect. B: diagram of the Seebeck effect. C: a power-generation module based on the Seebeck effect.</font></center>

&emsp;&emsp;The most obvious application of the Seebeck effect is **power generation**. Connect many thermoelectric units in series, and they form a **thermoelectric generator**. As long as one side remains hot and the other cold, the device can continuously produce electrical power.

&emsp;&emsp;Unlike conventional generators, a thermoelectric generator needs no turbine, rotating shaft, or complex mechanical motion. It is quiet, stable, and durable. Its disadvantages are equally clear: thermoelectric conversion **is usually inefficient**, often around **5%**, and the device must maintain a stable temperature difference. Thermoelectric generators are therefore best suited at present to recovering heat that would otherwise be wasted, such as heat from engine exhaust, boiler walls, or electronic equipment.

&emsp;&emsp;For deep-space probes far from the Sun, thermoelectric generation is an important and dependable energy source. Spacecraft such as Voyager, New Horizons, and some Mars rovers carry **radioisotope thermoelectric generators**. Heat released continuously by radioactive decay establishes a temperature difference across the device, and thermoelectric materials convert part of that thermal energy into electricity. Such generators can operate for many years in harsh environments.

&emsp;&emsp;The Seebeck effect can also be used as a **thermometer**, in the form of **thermocouple thermometry**. A thermocouple usually consists of two different metals. If its two junctions are at different temperatures, it produces a tiny voltage that a precise instrument can measure; the temperature can then be calculated from that voltage. In a common **type K thermocouple**, for example, a temperature change of 1 K changes the voltage by roughly 4.1*10-6 V. That sounds small, but it is readily detectable. Thermocouples are also simple, heat-resistant, and fast to respond, so they are widely used to measure temperature in industrial furnaces, engines, boilers, chemical equipment, and laboratories.

&emsp;&emsp;The Seebeck effect has far more applications than one might expect. Observant readers may have noticed a feature of the thermoelectric effect described here: **the voltage is parallel to the thermal gradient**. Can a voltage also appear in another direction? Yes. Next time, we will see how a thermal gradient can produce a voltage perpendicular to itself.

# References

[1] Seebeck T J. Magnetische Polarisation der Metalle und Erze durch Temperatur-Differenz[J]. Abhandlungen der Königlichen Akademie der Wissenschaften zu Berlin, 1822-1823: 265-373.
[2] Goldsmid H J. Introduction to Thermoelectricity[M]. Berlin, Heidelberg: Springer, 2010.
[3] Bell L E. Cooling, heating, generating power, and recovering waste heat with thermoelectric systems[J]. Science, 2008, 321(5895): 1457-1461.
[4] Snyder G J, Toberer E S. Complex thermoelectric materials[J]. Nature Materials, 2008, 7(2): 105-114.
[5] NASA Radioisotope Power Systems Program. Radioisotope Power Systems[EB/OL]. https://rps.nasa.gov/.
[6] Mizuguchi M, Nakatsuji S. Energy-harvesting materials based on the anomalous Nernst effect[J]. Science and Technology of Advanced Materials, 2019, 20(1): 262-275.
