---
layout: post
title: 'From AC to DC: Investigating How Diodes Are Used'
date: '2020-10-20 20:00:00'
lang: en
translation_key: "从交流电转直流电出发调研二极管的使用"
translation_source_sha256: "cbdcf22d323bfbee459e0702919cc015fb53723fc1e808491a8fc64a7205e484"
permalink: en/2020/10/20/from-ac-to-dc-how-diodes-are-used/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/cover-f04adfb5d9.jpg
copyright_author: 'N'
---

> Author: N
Reviewer: Baiyan

&emsp;&emsp;Alternating current and direct current are the two basic ways electricity is used in everyday life. Each has advantages the other cannot replace, so we are often interested in converting AC to DC or DC to AC. My research showed that AC is converted to DC primarily through a rectifier circuit, whose key component is the <strong>diode</strong>. Taking AC-to-DC conversion as its point of departure, this article investigates diodes and their role in rectifier circuits. The aim is to understand the principles of rectification and the connections and differences between ideal circuit models and actual circuit components and modules, while developing a deeper command of circuit theory and the Multisim simulation tool.

# 1. Introduction

&emsp;&emsp;Alternating current and direct current are the two basic forms of electricity used in daily life. Each has its own advantages and is suited to different applications. Most lighting and motive-power systems, for example, use AC, while computers and mobile phones generally use DC. We therefore often need to convert between them according to their respective strengths and weaknesses so that the electricity meets users' requirements.

&emsp;&emsp;This article examines how alternating current is converted into direct current. A rectifier circuit is the key module in this conversion, and its operation depends on the properties of diodes. Multisim simulations also helped clarify the connections and differences among <strong>ideal circuit models</strong>, <strong>actual circuit components</strong>, and <strong>modules</strong>.

&emsp;&emsp;The investigation proceeds as follows: the basic properties of diodes → how a rectifier circuit is assembled to exploit those properties → how rectifier circuits are used in AC-to-DC conversion → a deeper extension into Zener diodes and regulated DC power supplies.

# 2. Basic Properties of Diodes

## A. Basic Construction and I–V Characteristic of a Diode

&emsp;&emsp;A diode is an electronic component made from a semiconductor material such as silicon, selenium, or germanium. It conducts in only one direction: when a forward voltage is applied across its anode and cathode, the diode conducts; when a reverse voltage is applied, it cuts off. <strong>A conducting or nonconducting diode is therefore equivalent to a closed or open switch</strong>.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-004-c68426deb8.jpg" alt="" />

<center><font size=2px color=grey>Diode I–V characteristic</font></center>

## B. Equivalent Circuits for a Diode

&emsp;&emsp;As the figure shows, a diode has a nonlinear I–V characteristic, which makes diode circuits difficult to analyze. To simplify the analysis, a circuit made from linear elements is often used under specified conditions to approximate the diode's behavior and replace it in the circuit. A circuit that simulates a diode's characteristics is called an equivalent circuit, or equivalent model, of the diode. Several equivalent circuits can be constructed from its I–V characteristic.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-002-607c53992a.jpg" alt="" />

<center><font size=2px color=grey>Several equivalent circuits</font></center>

# 3. How a Rectifier Circuit Uses Diode Properties

&emsp;&emsp;To emphasize the main points and simplify the analysis of a rectifier circuit, we generally assume that the load is purely resistive. We also assume that the rectifier diode has the ideal I–V characteristic shown by the solid line in Figure 1.2.4(a) of Section 2, “Basic Properties of Diodes”: its forward voltage drop is zero while it conducts, and its reverse current is zero while it is cut off. To make both simulation and analysis easier, we use a suitable AC source directly as the input when studying the waveform, without first passing it through a transformer.

## A. Alternating Current

&emsp;&emsp;Alternating current, or AC, is a current whose direction changes periodically with time. Its waveform is the sinusoidal curve shown below.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-005-6de006d79f.jpg" alt="" />

<center><font size=2px color=grey>AC waveform</font></center>

## B. Single-Phase Half-Wave Rectifier

&emsp;&emsp;As Section 2 explains, a diode conducts when a forward voltage is applied across its anode and cathode and cuts off when a reverse voltage is applied. If we simply place an ideal diode D1 in series in the simulated circuit, both the voltage and current across the load resistor R1 will pulse in only one direction. This is the simplest rectifier: a single-phase half-wave rectifier.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-006-cf37509168.jpg" alt="" />

<center><font size=2px color=grey>Single-phase half-wave rectifier circuit</font></center>

## C. Single-Phase Bridge Rectifier

&emsp;&emsp;To overcome the drawbacks of a single-phase half-wave rectifier, practical circuits more often use a single-phase full-wave rectifier. The single-phase bridge rectifier is the most common form.

&emsp;&emsp;A single-phase bridge rectifier contains four diodes. It is designed so that the voltage and current through the load retain the same direction throughout the entire cycle of voltage V1. This requires the current to be guided correctly through the load during both the positive and negative half-cycles of V1. A model of the circuit is shown below:

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-008-7368fe7566.jpg" alt="" />

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-009-e50ba88333.jpg" alt="" />

<center><font size=2px color=grey>Single-phase bridge rectifier circuit</font></center>

&emsp;&emsp;Connecting the single-phase bridge rectifier (1G4B42) to the circuit produces the waveform below:

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-012-58d33fd266.jpg" alt="" />

<center><font size=2px color=grey>Waveform after connection to the circuit</font></center>

# 4. Using a Rectifier in an AC-to-DC Circuit

## A. Direct Current

&emsp;&emsp;The direct current obtained above is called <strong>pulsating direct current</strong>. Its magnitude changes over time, but its direction remains constant. It differs from the <strong>constant direct current</strong> studied in high school, whose magnitude and direction do not change, as in constant-voltage and constant-current sources. In practical applications, however, DC often exists in pulsating form. The terminal voltage of a common dry cell, for example, gradually decreases during use, while its direction remains unchanged.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-007-4ae497c94f.jpg" alt="" />

## B. Rectification + Filtering + Voltage Regulation

&emsp;&emsp;Although the output voltage of a rectifier has only one direction, it contains a large AC component and cannot meet the needs of most electronic circuits and devices. A filter circuit is therefore usually added after rectification to turn the pulsating DC voltage into a smooth DC voltage.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-010-07590a0322.jpg" alt="" />

&emsp;&emsp;A rectifier and filter can convert a sinusoidal AC voltage into a relatively smooth DC voltage, but two problems remain. First, the mean output voltage depends on the RMS input voltage, so fluctuations in the input cause corresponding fluctuations in the mean output. Second, because the rectifier and filter circuit has internal resistance, a change in the load changes the voltage across that resistance, causing the mean output voltage to change in the opposite direction. Voltage-regulation measures are necessary to obtain a stable DC voltage.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-011-e01618adf9.jpg" alt="" />

&emsp;&emsp;After connecting a Zener diode (1N4884) in parallel, we complete a rectifier + filter + regulator circuit and successfully obtain the desired smooth, stable DC from AC.

# 5. Further Exploration: Zener Diodes and Regulated DC Power Supplies

## A. Zener Diodes

&emsp;&emsp;A Zener diode is a silicon junction diode. During reverse breakdown, its terminal voltage remains almost unchanged over a specified current range (or, equivalently, a specified power-dissipation range), giving it voltage-regulating properties. It is therefore widely used in regulated power supplies and clipping circuits.

## B. Regulated DC Power Supplies

&emsp;&emsp;A DC power supply takes the 220 V grid voltage, or mains voltage, as its input. The required DC voltage generally differs substantially from the RMS grid voltage, so a <strong>power transformer</strong> must first step the voltage down before the AC is processed. The required downstream circuit determines the RMS voltage on the transformer's secondary. Some circuits now omit the transformer and use other methods to step voltage up or down.

&emsp;&emsp;The rectifier converts the AC voltage on the transformer's secondary into DC: it <strong>converts a sinusoidal voltage into a pulsating voltage with only one direction.</strong> The output waveforms of the half-wave and full-wave rectifiers are shown below:

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-013-ad680e616e.jpg" alt="" />

&emsp;&emsp;Both waveforms clearly contain large AC components that interfere with normal operation of the load circuit. An AC component may, for example, enter the input signal and be amplified by an amplifier, until the power-supply AC component mixed into the amplifier's output exceeds the useful signal. The rectified voltage therefore cannot be used directly to power an electronic circuit. Note that the waveforms drawn at the output of the rectifier are those measured before a filter is connected; the waveform changes once the filter is added.

&emsp;&emsp;To reduce voltage ripple, a low-pass filter must smooth the output voltage. Ideally, it would remove the entire AC component and leave only a DC voltage at the filter's output. Because a filter is a passive circuit, however, connecting a load inevitably affects its performance. For electronic circuits that do not demand high stability, the rectified and filtered DC voltage can serve as the power supply.

&emsp;&emsp;After <strong>rectification and filtering</strong>, an AC voltage becomes a DC voltage with a relatively small AC component. Its mean value nevertheless changes when the grid voltage fluctuates or the load changes. The regulator keeps the DC output largely unaffected by changes in grid voltage and load resistance, providing adequate stability. This is the basic principle of a regulated DC power supply.

<img src="/images/%E4%BB%8E%E4%BA%A4%E6%B5%81%E7%94%B5%E8%BD%AC%E7%9B%B4%E6%B5%81%E7%94%B5%E5%87%BA%E5%8F%91%E8%B0%83%E7%A0%94%E4%BA%8C%E6%9E%81%E7%AE%A1%E7%9A%84%E4%BD%BF%E7%94%A8/fig-014-7e61445cf2.jpg" alt="" />

<center><font size=2px color=grey>Block diagram of a regulated DC power supply</font></center>

&emsp;&emsp;The block diagram above clearly shows the principle discussed earlier: a rectifier + filter + regulator circuit. Its central component is the diode. The principal difference in everyday use is that mains electricity is supplied at 220 V and must first be stepped down.

# 6. Conclusion

&emsp;&emsp;At the heart of a complex regulated DC power supply lies a tiny diode. The electronic products and household appliances around us may be large and functionally complex, but their capabilities are built from one seemingly insignificant electronic component after another. Small components can serve remarkable purposes. The process of assembling them into a large circuit and then a working electronic product resembles the birth of a country. Each circuit might be regarded as an independent kingdom, with every component one of its citizens. To use these components correctly and ingeniously, we must understand each one in depth, from how it is made to the characteristics that govern its behavior. Careful consideration and planning are what bring a circuit to life.

&emsp;&emsp;This, I think, is precisely why we study courses such as <strong>Circuit Theory, Semiconductor Physics, and Physics of Semiconductor Devices</strong>. Starting from first principles lets us develop an intuitive understanding of components, so that building the circuits we want becomes natural and effective.

# References

&emsp;&emsp;[1] Yuan Chen. “Principles of Conversion Between Alternating and Direct Current” [J]. Electronics World, 2018, (19), 21–23.<br>[2] Tong Shibai and Hua Chengying, eds. Fundamentals of Analog Electronics, 5th ed. [M]. Beijing: Higher Education Press, 2015.<br>[3] Gao Jixiang, ed. Analog Electronic Circuits and Power-Supply Design [M]. Beijing: Publishing House of Electronics Industry, 2019.
