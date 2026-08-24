---
layout: post
title: "Stars Are Not Fixed: How Their Positions Change"
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

&emsp;&emsp;If you have excellent eyesight, you may see more than 2,500 stars on a clear, dark night, while nearly 6,000 stars are visible to the naked eye across the entire celestial sphere. Ancient observers noticed that, unlike the five planets Mercury, Venus, Mars, Jupiter, and Saturn, the relative positions of most celestial objects seemed eternally unchanged. This gave rise to the Chinese term for a star, literally a “constant star.” We now know that stars only appear fixed because their great distances make their motion across the celestial sphere difficult to perceive. This article briefly introduces three ways in which stars move relative to the celestial background:

- Parallax
- Proper motion
- Aberration of light


# Parallax
&emsp;&emsp;Hold one finger upright in front of your eyes and close first one eye, then the other. The finger plainly changes position relative to the objects behind it. This illustrates parallax: a difference in the observed direction of the same object when viewed from different positions. The line joining the two observing points is the parallax baseline, and the angle between the lines from those points to the target is the parallax angle. Once that angle has been measured, calculating the distance is a simple problem in triangle geometry, which is why parallax is also called trigonometric parallax.

&emsp;&emsp;Earth’s continually changing position as it revolves around the Sun creates the conditions needed for stellar parallax. The Earth–Sun distance is known, and stellar parallax measured with the mean Earth–Sun distance of 1 AU as its baseline is called annual parallax. As Figure 1 shows, stars are generally so distant that their parallax π is extremely small, making tan π ≈ π. We need only find, in the plane of Earth’s orbit—the ecliptic plane—a parallax baseline perpendicular to the star’s direction, and its distance follows readily: d = a / π. By definition, an object with an annual parallax of 1 arcsecond (″) lies at a distance of 1 parsec (pc), approximately 3.262 light-years. The practical value of this definition has made the parsec one of astronomy’s most commonly used units of distance. In these units, taking the reciprocal of the annual parallax in arcseconds directly gives the stellar distance in parsecs. Because parallax becomes less conspicuous with distance, accurate parallax measurements are possible only for relatively nearby targets. The Gaia telescope, which entered service in 2013, nevertheless achieves precision on the order of 10 microarcseconds and can measure the parallaxes of stars thousands of parsecs away.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-001-67cf54fb9e.png" width=300/>
<center><font size=2px color=grey>Annual stellar parallax</font></center>

&emsp;&emsp;For an arbitrary star in space, the line joining it to the Sun will in practice make an angle with the ecliptic plane. That angle is its ecliptic latitude β in the heliocentric ecliptic coordinate system. As Earth travels around its circular orbit, the line from Earth to the star traces an ellipse on the celestial sphere. The annual-parallax track of a star on the ecliptic is a line, while that of a star near the north ecliptic pole is a circle. The semimajor axis of this parallax ellipse is the annual parallax and corresponds to the parallax baseline. By symmetry, we need wait no more than any six-month interval to reconstruct the entire ellipse and then use parallax to calculate the star’s distance.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-002-909c32cf49.png" width=600/>
<center><font size=2px color=grey>The parallax ellipse of a star in space</font></center>

&emsp;&emsp;Parallax is useful not only for measuring stars beyond the Solar System, but also for objects within it. During a transit of Venus, for example, observers at two locations on Earth see Venus in different positions against the Sun’s disk. That difference can be used to calculate Venus’s distance and orbital radius. The Sun itself also exhibits parallax when viewed from different parts of Earth; using Earth’s radius as the baseline, solar parallax is approximately 8.8″.

# Proper Motion
&emsp;&emsp;Like the Sun, the Milky Way’s hundreds of billions of stars are in motion. Suppose a star’s velocity relative to the Sun is v. It can be resolved orthogonally into radial velocity v_r and tangential velocity v_t. The tangential component reflects the direction in which we see the star move, while its proper motion μ, usually measured in arcseconds per year, describes the magnitude of that movement.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-003-dfc72c8587.png" width=400/>
<center><font size=2px color=grey>A star’s space velocity and proper motion</font></center>

&emsp;&emsp;Once proper motion and distance are known, the tangential velocity is easy to calculate. If the radial velocity is measured as well, we obtain the star’s true space velocity relative to the Sun. Measuring radial velocity relies on the Doppler effect: motion changes the wavelength of electromagnetic waves emitted by a light source. A receding source shifts to longer wavelengths, a redshift, while an approaching one shifts to shorter wavelengths, a blueshift. Comparing the lines in a star’s spectrum with their wavelengths at rest therefore gives both the magnitude and direction of the radial velocity.

&emsp;&emsp;Barnard’s Star has the greatest known proper motion. This red dwarf, approximately 6 light-years away, moves across the celestial background at 10.3″ per year. Figure 3 shows how its position changed between 1985 and 2005.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-004-e153a726ce.gif" width=400/>
<center><font size=2px color=grey>The proper motion of Barnard’s Star</font></center>

# Aberration of Light
&emsp;&emsp;Light has a finite speed, so an observer in motion sees it arriving from a direction different from the one seen by a stationary observer. This is the aberration of light. A familiar analogy is a person walking through rain. Although the raindrops fall vertically, a runner experiences them as slanting down from ahead. Aberration works similarly, except that the relevant transformation is not the classical addition of velocities but the Lorentz transformation.

&emsp;&emsp;Earth is constantly moving: it rotates, revolves around the Sun, and follows the Sun through the Milky Way. All these motions produce aberration when we observe distant light sources. The largest practical effect is annual aberration caused by Earth’s revolution. As Figure 3 shows, θ is the angle between the direction of motion and the direction of the light source. Earth’s motion changes the observed angle to φ, so the aberration is θ - φ.

<img src="/images/%E6%81%92%E6%98%9F%E4%B8%8D%E2%80%9C%E6%81%92%E2%80%9D%E2%80%94%E2%80%94%E7%AE%80%E8%B0%88%E6%81%92%E6%98%9F%E7%9A%84%E8%BF%90%E5%8A%A8%E5%92%8C%E4%BD%8D%E7%BD%AE%E5%8F%98%E5%8C%96/fig-005-965e49dbfb.png" width=400/>
<center><font size=2px color=grey>Direction of motion and the aberration of light</font></center>

&emsp;&emsp;Earth revolves around the Sun at approximately 29.8 km / s. When a speed v is much smaller than the speed of light c, aberration can be calculated simply as v sin θ / c. When the velocity is perpendicular to the light, annual aberration reaches its maximum of 20.5″. Diurnal aberration caused by Earth’s rotation is two orders of magnitude smaller, while the aberration due to the Solar System’s orbit around the Milky Way, though larger, has such a long period—200 million years—that it can be ignored over short timescales.

&emsp;&emsp;Like parallax, a star’s annual-aberration track is an ellipse with a one-year period, produced by the periodic change in Earth’s direction of motion. For stars at different ecliptic coordinates, the track ranges from a circle to a line segment. The maximum positional swing of 20.5 arcseconds is also far greater than stellar parallax. Parallax, proper motion, and aberration combine to make a star’s path across the celestial sphere look complicated and irregular. Fortunately, their periodic and systematic behavior makes it relatively easy to separate and analyze their effects.
