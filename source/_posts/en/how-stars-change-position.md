---
layout: post
title: "The ‘Fixed’ Stars Aren't Fixed: How Their Positions Change"
date: '2022-04-29 00:01:00'
lang: en
translation_key: "恒星不“恒”——简谈恒星的运动和位置变化"
translation_source_sha256: "b0a5cb87f936c9e1fc72d60fced4315079a99d1fe0ff9e79556ff96fbfce0647"
permalink: en/2022/04/29/how-stars-change-position/
aside: true
comments: false
tags: []
categories: []
cover: /images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/cover-bc81ef75d7.png
copyright_author: '丛雨'
---

> Author: 丛雨
Reviewer: 白烟

&emsp;&emsp;With excellent eyesight, you might pick out more than 2,500 stars on a clear, dark night. Across the entire celestial sphere, nearly 6,000 are visible to the naked eye. Ancient observers noticed that, unlike the five planets Mercury, Venus, Mars, Jupiter, and Saturn, most celestial objects seemed to keep the same positions forever. That apparent permanence gave us the Chinese word for star, which literally means “constant star.” We now know that stars only look fixed: they are so distant that their motion across the celestial sphere is hard to detect. This article introduces three ways their positions shift against the celestial background:

- Parallax
- Proper motion
- Aberration of light


# Parallax
&emsp;&emsp;Hold up a finger and look at it first through one eye, then the other. Against the background, your finger plainly jumps from one position to another. That is parallax: the difference in an object's apparent direction when it is observed from two locations. The line between those observing points is the parallax baseline, and the angle between the two sight lines is the parallax angle. Once we know that angle, finding the distance is a straightforward exercise in triangle geometry—hence the name trigonometric parallax.

&emsp;&emsp;As Earth revolves around the Sun, its changing position supplies the two viewpoints needed for stellar parallax. Because the Earth–Sun distance is known, we can use the mean distance of 1 AU as the baseline; the result is called annual parallax. Stars are so far away that the parallax π in Figure 1 is extremely small, so tan π ≈ π. Find a baseline in the plane of Earth's orbit—the ecliptic plane—perpendicular to the direction of the star, and its distance follows: d = a / π. By definition, an object whose annual parallax is 1 arcsecond (″) lies 1 parsec (pc), or approximately 3.262 light-years, away. This convenient definition has made the parsec one of astronomy's standard units of distance: simply take the reciprocal of the annual parallax in arcseconds to get the distance in parsecs. Since parallax shrinks with distance, it works accurately only for relatively nearby targets. Even so, the Gaia telescope, which entered service in 2013, can measure to roughly 10 microarcseconds and detect stellar parallaxes thousands of parsecs away.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-001-67cf54fb9e.png" width=300/>
<center><font size=2px color=grey>Annual stellar parallax</font></center>

&emsp;&emsp;For any given star, the line from the Sun to the star generally meets the ecliptic plane at an angle. In heliocentric ecliptic coordinates, that angle is the star's ecliptic latitude β. As Earth moves around its circular orbit, the sight line from Earth to the star traces an ellipse on the celestial sphere. For a star on the ecliptic, that annual-parallax track collapses into a line; near the north ecliptic pole, it becomes a circle. The semimajor axis of the parallax ellipse equals the annual parallax and corresponds to the parallax baseline. Thanks to symmetry, observations spanning any six months are enough to reconstruct the full ellipse and calculate the star's distance.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-002-909c32cf49.png" width=600/>
<center><font size=2px color=grey>The parallax ellipse of a star in space</font></center>

&emsp;&emsp;Parallax measures more than stars beyond the Solar System; it also works for objects inside it. During a transit of Venus, for example, observers at two places on Earth see Venus at different points on the Sun's disk. From that difference, they can calculate Venus's distance and orbital radius. Even the Sun shows parallax when viewed from different parts of Earth. With Earth's radius as the baseline, solar parallax is approximately 8.8″.

# Proper Motion
&emsp;&emsp;The Sun is one among hundreds of billions in the Milky Way. Suppose a star's velocity relative to the Sun is v. We can resolve it into two perpendicular components: radial velocity v_r and tangential velocity v_t. The tangential component points in the direction we see the star move, while proper motion μ describes the size of that apparent movement, usually in arcseconds per year.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-003-dfc72c8587.png" width=400/>
<center><font size=2px color=grey>A star’s space velocity and proper motion</font></center>

&emsp;&emsp;Once we know a star's proper motion and distance, its tangential velocity is easy to calculate. Add a measurement of radial velocity, and we have its true velocity through space relative to the Sun. Radial velocity comes from the Doppler effect: motion changes the wavelengths emitted by a light source. A receding source shifts toward longer wavelengths—a redshift—while an approaching source shifts toward shorter ones—a blueshift. Comparing lines in a star's spectrum with their rest wavelengths therefore reveals both the magnitude and direction of its radial velocity.

&emsp;&emsp;Barnard's Star has the greatest known proper motion. The red dwarf lies approximately 6 light-years away and crosses the celestial background at 10.3″ per year. Figure 3 shows its changing position between 1985 and 2005.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-004-e153a726ce.gif" width=400/>
<center><font size=2px color=grey>The proper motion of Barnard’s Star</font></center>

# Aberration of Light
&emsp;&emsp;Because light has a finite speed, a moving observer sees it arrive from a different direction than a stationary observer does. This effect is called the aberration of light. Think of walking through rain: although the drops fall straight down, a runner sees them slanting in from the front. Light behaves similarly, except that we must use the Lorentz transformation rather than the classical addition of velocities.

&emsp;&emsp;Earth never stops moving. It rotates, circles the Sun, and travels with the Sun through the Milky Way. Each motion produces aberration when we observe a distant light source. The largest effect in practice is annual aberration from Earth's revolution. In Figure 3, θ is the angle between the direction of motion and the light source. Earth's motion changes the observed angle to φ, making the aberration θ - φ.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-005-965e49dbfb.png" width=400/>
<center><font size=2px color=grey>Direction of motion and the aberration of light</font></center>

&emsp;&emsp;Earth travels around the Sun at approximately 29.8 km / s. When a speed v is far below the speed of light c, the aberration is simply v sin θ / c. With the velocity perpendicular to the incoming light, annual aberration reaches its maximum of 20.5″. Diurnal aberration from Earth's rotation is two orders of magnitude smaller. Aberration from the Solar System's motion around the Milky Way is larger, but its period is so long—200 million years—that we can ignore it over short timescales.

&emsp;&emsp;Like parallax, annual aberration makes a star trace a one-year ellipse as Earth's direction of motion changes. Depending on the star's ecliptic coordinates, that track ranges from a circle to a straight line segment. Its maximum swing of 20.5 arcseconds is far larger than stellar parallax. Parallax, proper motion, and aberration overlap, making a star's path across the celestial sphere look tangled and irregular. Fortunately, their periodic, systematic behavior lets us separate and analyze their effects.
