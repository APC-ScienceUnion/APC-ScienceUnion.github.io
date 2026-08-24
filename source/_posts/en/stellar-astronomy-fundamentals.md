---
layout: post
title: An Overview of Stars — Fundamentals of Stellar Astronomy
date: '2023-01-31 00:01:00'
lang: en
translation_key: "恒星综述——恒星研究基础"
translation_source_sha256: "a81bf17688200b85825e2d78283d0625531a12ac6c5f4b4a27eab00efa810416"
permalink: en/2023/01/31/stellar-astronomy-fundamentals/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/cover-a485d0932b.png
copyright_author: '栗小白'
---

> Author: 栗小白 (SDU)  
> Reviewer: 时光

# Preface

&emsp;&emsp;Because this is “popular science,” we will not venture into unfathomable black holes, quantum mechanics, or M-theory—though next time I make no promises. Nor will I frighten anyone with indecipherable mathematical symbols or terminology. You can trust me on that, because my own mathematics is not very good. There are not even any formulas, mainly because they are too difficult to print. This article introduces only the most, most, most, most fundamental concepts about stars and the study of them, leaving many other aspects aside. Let us begin.

# Part 1: Luminosity and Apparent Brightness

&emsp;&emsp;As their names suggest, **luminosity** and **apparent brightness** both describe how bright a star is. They are related, but they are not the same quantity.

- Differences
  - **Luminosity** is an <font color="red">**intrinsic**</font> property of a star and does not depend on the observer's position or velocity. It is also called absolute brightness.
  - **Apparent brightness** measures the <font color="red">**energy flux**</font> received from a star at Earth: the amount of energy arriving per unit area per unit time.

- Relationship
Even your toes could guess that apparent brightness must depend on **how bright the star really is**—its luminosity—and on its **distance** from us. What is the relationship with distance? Another **inverse-square law**. The diagram below makes it easy to understand.

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-001-0f96c26ac7.png" width="500" alt="image.png" title="image.png" />
<center><font size=2px color=grey>How apparent brightness varies with distance</font></center>

&emsp;&emsp;A star's apparent brightness is therefore proportional to its luminosity and inversely proportional to the square of its distance.

&emsp;&emsp;Astronomy enthusiasts have probably used planetarium software to explore the night sky and have at least a rough idea of what stellar magnitudes mean. Still, no popular science article on the subject would be complete without a formal introduction to **apparent magnitude**.

&emsp;&emsp;Like the rest of us, astronomers usually express apparent brightness on the apparent-magnitude scale rather than in the SI unit W/m². The concept goes back to the second century BCE and the astronomer Hipparchus. He originally divided stars into six magnitudes—1, 2, 3, 4, 5, and 6. With the development of science and technology, the modern scale has expanded far beyond those six classes. An apparent magnitude can be fractional, greater than 6, or even negative. The basic rule remains unchanged: the smaller the number, the greater the apparent brightness.

&emsp;&emsp;Imagine a star that is intrinsically very bright but extremely far from Earth. Its apparent magnitude may make it look fainter than a dim star nearby. Is there a way to compare the stars' own luminosities objectively? There is: **absolute magnitude**. This is the apparent magnitude an object would have if placed at a specified distance of 10 parsecs. By using absolute magnitude, we can compare luminosities without distance affecting the result.

# Part 2: Stellar Temperature

&emsp;&emsp;A star chart shows stars in different colors, and those colors tell us their temperatures.

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-002-ff7f28f488.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>The colors and temperatures of different stars</font></center>

&emsp;&emsp;Before studying astronomy, many people—including me—assume that red stars are hot and blue stars are cool. Perhaps that is still your assumption as you read this. Color psychology makes red feel warm, like flame, while blue feels cold, like an ice cave. Those impressions usually agree with everyday experience, so why do stars seem to violate common sense? The answer lies in the relationship between color and the blackbody curve. No more talk—bring on the diagram.

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-003-9e2a26e6b6.png" width="500" alt="image.png" title="image.png" />
<center><font size=2px color=grey>Blackbody curves</font></center>

&emsp;&emsp;If any science student claims never to have seen this graph, I am prepared to argue: it is the blackbody-curve diagram from elective physics. Its conclusion is simple: **the hotter a blackbody, the shorter the wavelength—and the higher the frequency—at which its radiation peaks**. Red light has a longer wavelength and therefore corresponds to a lower temperature. Blue-violet light has a shorter wavelength and corresponds to a higher one. Astronomers use this principle to measure stellar temperatures. The procedure is as follows:
> Because the basic shape of a blackbody curve is well understood, astronomers can estimate a star's temperature from observations at only two wavelengths. Telescope filters block light outside selected wavelength ranges. By measuring the radiation received through filters of different colors—that is, at particular wavelengths—they can fit a blackbody curve and obtain a temperature. This technique is called photometry.

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-004-3d9bb38c95.png" alt="image.png" width="500" title="image.png" />

# Part 3: Stellar Spectra

&emsp;&emsp;When I hear “spectrum,” I first think of the high-school chemistry unit on using spectral analysis to identify elements. Spectra are indeed an important way to reveal a star's chemical composition. In more formal terms, spectroscopy is an observational method that combines telescopes with theory. It reflects the internal activity of atoms and allows the properties of matter to be inferred from the radiation it emits and absorbs.

&emsp;&emsp;Before discussing stellar spectral lines in detail, let us set out the three rules governing spectroscopy: **Kirchhoff's laws**.
- First, a luminous solid or liquid, or a sufficiently dense gas, emits light at every wavelength and therefore produces a continuous spectrum.
- Second, a hot, low-density gas produces a spectrum composed of bright emission lines characteristic of its chemical composition.
- Third, a cool, thin gas absorbs particular wavelengths from a continuous spectrum, leaving dark absorption lines superimposed on it. These lines are likewise characteristic of the intervening gas and occur at exactly the same wavelengths as the emission lines produced when that gas is hot.

&emsp;&emsp;With that foundation, we can turn to the main applications of spectral-line analysis.

## A Spectroscopic Thermometer
&emsp;&emsp;Deep inside a hot star, atoms are completely ionized. Electrons move freely through the gas without being bound to nuclei, so the radiation spectrum is continuous. Near the comparatively cool surface, however, some atoms retain some or even most of their orbital electrons. As noted above, astronomers can determine a star's chemical composition by matching the lines they observe against laboratory spectra of known atoms, ions, and molecules. A line's strength—its brightness in emission or darkness in absorption—depends on the number of atoms producing it. The more atoms that emit or absorb photons at the relevant frequency, the stronger the line. But strength also depends critically on the temperature of the gas containing those atoms, because **temperature determines how many electrons occupy the appropriate orbitals at any moment and undergo a particular transition**. At low temperatures, populations tend to build only in low-energy states, and transitions into or out of those states dominate the spectrum. At higher temperatures, more atoms are excited and some may be ionized, fundamentally changing which transitions can occur and therefore which spectrum we see.

&emsp;&emsp;Spectroscopists have derived mathematical formulas connecting the number of photons emitted or absorbed with the relevant atomic energy levels and the temperature of the gas. Once an object's spectrum has been measured, astronomers compare the observed line strengths with the formulas' predictions. In this way, they can extract both the composition and temperature of the gas that produced the lines.

## Measuring Radial Velocity
&emsp;&emsp;The spectra of many atoms, ions, and molecules have been established in the laboratory. Familiar patterns of lines often appear in an astronomical spectrum, but the lines may be **shifted** from their usual positions. In other words, a set may clearly belong to a particular element while every measured line has moved by the same proportion relative to the laboratory data. This is called a **blueshift** or **redshift**. The shifts are produced by the **Doppler effect**, allowing astronomers to measure how quickly a source is moving along the observer's line of sight—its radial velocity.

## Spectral Classes
&emsp;&emsp;From hottest to coolest, the stellar spectral classes are O, B, A, F, G, K, and M. A widely used mnemonic in astronomy is “Oh, Be A Fine Girl/Guy, Kiss Me.”

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-005-1dec34b542.png" alt="image.png" title="image.png" />

# Part 4: The Hertzsprung–Russell Diagram

&emsp;&emsp;The Hertzsprung–Russell diagram, abbreviated H–R diagram or HRD, is a scatter plot of stellar **absolute magnitude** or luminosity against **spectral type** or effective temperature. Put simply, it places each star on a graph according to measurable temperature—or color—and luminosity, independent of the star's location, as shown below. The related color–magnitude diagram (CMD) plots **apparent magnitude** against **color** and is usually used for a star cluster whose members all lie at roughly the same distance.

<img src="/images/%E6%81%92%E6%98%9F%E7%BB%BC%E8%BF%B0%E2%80%94%E2%80%94%E6%81%92%E6%98%9F%E7%A0%94%E7%A9%B6%E5%9F%BA%E7%A1%80/fig-006-156f27e3e1.png" alt="image.png" title="image.png" />
<center><font size=2px color=grey>The Hertzsprung–Russell diagram</font></center>

&emsp;&emsp;The horizontal axis gives surface temperature, which increases from right to left along the spectral sequence. The vertical axis gives absolute magnitude.

&emsp;&emsp;The H–R diagram also displays stellar evolution. About 90% of stars lie in a band running from the upper left to the lower right. This is the **main sequence**, and stars within it are **main-sequence stars**. Moving from top to bottom along the sequence reveals a clear trend:
- Stars at the upper left are large, hot, and luminous. They are called blue giants.
- Stars at the lower right are small, cool, and faint. They are called red dwarfs.

&emsp;&emsp;Red dwarfs may be small and cool, but they are known as the universe's champions of longevity. Where is our Sun? It lies around the middle of the main sequence and is called a yellow dwarf.

&emsp;&emsp;The molecular clouds from which stars form occupy the far-right region of the diagram. As a cloud begins to contract and heat up, it slowly moves toward the main sequence. Near the end of its life, a star leaves the sequence and moves toward the upper right, the region of red giants and red supergiants: stars with cool surfaces but high luminosities. A star that passes through the red-giant stage without exploding as a supernova crosses the main sequence toward the lower left. This hot but faint region contains the white dwarfs. As a white dwarf loses energy, it gradually fades into a black dwarf.

---

# **Afterword**
&emsp;&emsp;The H–R diagram contains an enormous amount of information about stars, and I happen to find it especially interesting—there is my personal bias. I will end with several terms related to it for interested readers to look up: dwarf star, white dwarf, red dwarf, yellow dwarf, red giant, blue giant, and Wolf–Rayet star, a special kind of blue giant.
&emsp;&emsp;This was my first attempt at popular science writing, and I feel I learned quite a lot. Somehow it is already four in the morning. It looks as though I will be getting up at noon again.
&emsp;&emsp;Written before dawn on the fifth day of the first lunar month in the year Gui-Mao.

> References and image sources: Today Astronomy and Baidu Baike
