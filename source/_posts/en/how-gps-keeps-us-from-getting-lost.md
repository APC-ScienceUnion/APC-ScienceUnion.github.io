---
layout: post
title: How Does GPS Keep Us from Getting Lost?
date: 2019-06-19 19:30:00
lang: en
translation_key: "GPS 用什么魔法让路痴不再迷路？"
translation_source_sha256: "0c9a209eef00e03bf4c136a3b0415dad15ac9ab020254a062bdd4da6ffa40ea7"
permalink: en/2019/06/19/how-gps-keeps-us-from-getting-lost/
aside: false
comments: false
tags: []
categories: []
copyright_author: '一毫秒的永恒'
cover: /images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/cover-48a07e6b56.jpg
---

> Author: A Millisecond of Eternity

&emsp;&emsp;Thousands of years ago, our ancestors erected milestones, drew detailed maps, and learned to find their position by observing the night sky so that they would not lose their way. Things are much easier now. A smartphone can meet our everyday navigation needs, and as long as you have a GPS receiver, you can find out where you are almost anywhere that receives a satellite signal. No more worrying about getting lost.

&emsp;&emsp;In the following sections, I will offer a simple introduction to the way GPS positioning works. The Global Positioning System is vast, expensive, and complex, but its fundamental concepts and principles are quite simple and intuitive.

&emsp;&emsp;The Global Positioning System, abbreviated GPS, provides accurate positioning, velocity measurements, and highly precise standard time across most of Earth's surface. In everyday life, “GPS” generally means a GPS receiver. In space, it is a constellation of more than 30 satellites in Earth orbit, at least 24 of which are operational.

&emsp;&emsp;These satellites orbit at an altitude of 20,200 km and circle Earth twice each day. The 24 satellites are distributed across six orbital planes, with four satellites in each. The planes are inclined at 55° to Earth's equatorial plane, and the right ascensions of their ascending nodes differ by 60°. This arrangement ensures that at least four satellites can be observed from any location on Earth at any time.

<img src="/images/GPS 用什么魔法让路痴不再迷路？/640.gif" title="An example of a GPS satellite constellation as Earth rotates. Here, the number of satellites that can be received is calculated at a latitude of 45° north and varies over time. | Credit:Knowpia" />

<center><font size=2px color=grey>An example of a GPS satellite constellation as Earth rotates. Here, the number of satellites that can be received is calculated at a latitude of 45° north and varies over time. | Credit:Knowpia</font></center>

&emsp;&emsp;A GPS receiver uses four or more satellites to calculate its distance from each one and infers its own position from that information. The operation is based on a mathematical principle known as trilateration. Trilateration in three dimensions can be a little difficult, so we will begin with the simpler two-dimensional case.

&emsp;&emsp;Consider an example. Imagine waking one morning in an unfamiliar place and wandering aimlessly through the streets. Fortunately, you have a map of China. You want to ask passersby where you are, but unfortunately they are all only passing through as well. They can tell you only how far the place is from where they began their journeys.

&emsp;&emsp;You ask several people. The first helpful stranger tells you, “This place is 122 kilometers from Ya'an in a straight line.” That is useful. On your map, you can draw a circle centered on Ya'an with a radius of 122 kilometers. You must be somewhere on that circle.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-001-a174b23c09.jpg" title="Figure 1" />

<center><font size=2px color=grey>Figure 1</font></center>

&emsp;&emsp;A second helpful stranger then says, “All I know is that this place is 62 kilometers from my hometown, Deyang.” That is easy to use as well. Draw another circle, this one centered on Deyang with a radius of 62 kilometers. It intersects the first circle at two points, greatly narrowing the possibilities.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-002-5f66cf9dae.jpg" title="Figure 2" />

<center><font size=2px color=grey>Figure 2</font></center>

&emsp;&emsp;Finally, a third helpful stranger seems to tease you with another clue: “I do not know where we are, but I know it is 146 kilometers from Suining.”

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-003-0982b2b9a1.jpg" title="Figure 3" />

<center><font size=2px color=grey>Figure 3</font></center>

&emsp;&emsp;No problem. Use that distance to draw a third circle in the same way, and you have your answer, because this circle passes through one of the first two circles' intersection points. Plotted on a map of China, it looks like this: you are in Chengdu.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-004-7f95741c53.jpg" title="Figure 4" />

<center><font size=2px color=grey>Figure 4</font></center>

&emsp;&emsp;You should now understand two-dimensional trilateration. When WeChat's Shake feature was first launched, some people suggested using this method to determine the area in which someone was active.

&emsp;&emsp;Returning to the subject, the same method works in three-dimensional space, except that instead of two-dimensional “circles,” we work with three-dimensional “spheres.” Fundamentally, three-dimensional trilateration is not very different from its two-dimensional counterpart. Imagine the radii in the preceding example extending in every direction: the set of circles becomes a set of spheres.

&emsp;&emsp;If you know that you are 10,000 kilometers from Satellite A, you could be anywhere on the surface of an enormous imaginary sphere with a radius of 10,000 kilometers. If you also know that you are 15,000 kilometers from Satellite B, you can overlap the first sphere with this larger one. The two spheres intersect in a perfect circle. Knowing the distance to a third satellite gives you a third sphere. The three spheres intersect at two points, one of which coincides with Earth's spherical surface. Unless you are flying through the sky, the point on Earth's surface is your location.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-005-c7fa835000.jpg" title="The common intersection of Earth and the “spheres” measured from three satellites is your position. A fourth satellite calibrates and synchronizes time." />

<center><font size=2px color=grey>The common intersection of Earth and the “spheres” measured from three satellites is your position. A fourth satellite calibrates and synchronizes time.</font></center>

&emsp;&emsp;To improve accuracy and provide precise altitude information, however, a receiver normally uses signals from at least four satellites, and often more. Why? The fourth satellite calibrates timing error, while additional satellites provide more information and greatly improve positioning accuracy. To determine your location, a GPS receiver must know two things:

1. The positions of at least four satellites
2. The distances between you and those satellites

&emsp;&emsp;A GPS receiver can calculate both by analyzing the navigation message and timing information broadcast by the satellites. The basic principle is that radio signals travel through a vacuum at the speed of light, so the time a signal takes to travel from a satellite to a receiver can be used to calculate the distance between them. The actual process is fairly complex, but a simple example helps. Suppose a satellite transmits a pseudorandom code at 8:00 a.m. A time difference exists when the satellite signal reaches the GPS receiver. Multiplying that difference by the speed of light gives the distance the signal has traveled. If the signal travels in a straight line, this is ideally the distance between the receiver and the satellite.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-006-b0bf304b8a.jpg" title="In the diagram, (xi,yi,zi) represents the spatial coordinates of satellite i at time t, and Vti represents the clock offset between the satellite and receiver. The four equations above can be solved for the coordinates x, y, and z of the point being measured and for the receiver clock offset Vto." />

<center><font size=2px color=grey>In the diagram, (xi,yi,zi) represents the spatial coordinates of satellite i at time t, and Vti represents the clock offset between the satellite and receiver. The four equations above can be solved for the coordinates x, y, and z of the point being measured and for the receiver clock offset Vto.</font></center>

&emsp;&emsp;For this measurement to work, both receiver and satellite need clocks synchronized to the nanosecond. Building a satellite-positioning system that relied only on synchronized clocks would require atomic clocks not just aboard every satellite but also in every receiver. Atomic clocks are expensive and beyond the means of ordinary consumers.

&emsp;&emsp;A more efficient and economical solution is therefore to place atomic clocks aboard the satellites and use an ordinary quartz clock in the receiver. As long as it receives signals from at least four satellites simultaneously, the receiver can calculate its own clock error while determining its position—four unknowns and four equations make the system solvable—and continually correct it. A GPS receiver can consequently achieve high-precision positioning without an atomic clock. In a sense, the user gets to use the satellites' atomic clocks “for free.”

&emsp;&emsp;Reality is much more complicated, of course, and brings unavoidable problems. These include atmospheric delay as the satellite signal passes through Earth's atmosphere; multipath effects as electromagnetic waves reflect several times from nearby objects such as tall buildings; satellite ephemeris errors; clock errors in the satellites and receiver; and relativistic effects. Because of these errors, traditional single-point positioning is generally accurate to only a few meters or, in some cases, more than ten meters. To achieve greater positioning accuracy, we usually use differential GPS.

&emsp;&emsp;Differential GPS (DGPS) places a GPS monitoring receiver at a known point whose position has been measured precisely. This receiver serves as a base station and makes GPS observations at the same time as the user. Its single-point positioning result is compared with the base-station coordinates to calculate real-time differential corrections. The corrections are sent by broadcast or data link to nearby GPS users, whose GPS position solutions are adjusted to improve local positioning accuracy.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-007-25f9723f9d.jpg" title="Differential positioning, also known as relative positioning, improves accuracy by adding a reference GPS receiver. | Credit:Knowpia" />
<center><font size=2px color=grey>Differential positioning, also known as relative positioning, improves accuracy by adding a reference GPS receiver. | Credit:Knowpia</font></center>

&emsp;&emsp;Pseudorange differential is the most widely used form of DGPS. A pseudorange is the measured range obtained in actual GPS measurements. Atmospheric refraction and other influences affect the signal as it propagates, so the measured distance does not equal the true distance from the satellite to the ground receiver. It is therefore called a pseudorange, and a GPS receiver's observation is called a pseudorange measurement. This differential technique can provide meter-level positioning accuracy. Carrier-phase differential positioning, also known as real-time kinematic or RTK positioning, is still more accurate and can achieve centimeter-level precision. It is used extensively in dynamic applications that require highly accurate positions.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-008-fb6d9ab6cf.jpg" title="Diagram of carrier-phase differential positioning. This technique can achieve centimeter-level positioning accuracy in the field in real time, providing the observation point's three-dimensional coordinates with centimeter-level precision." />
<center><font size=2px color=grey>Diagram of carrier-phase differential positioning. This technique can achieve centimeter-level positioning accuracy in the field in real time, providing the observation point's three-dimensional coordinates with centimeter-level precision.</font></center>

&emsp;&emsp;GPS has long been woven into ordinary life. It remains one of the world's most important satellite-navigation systems. Modern devices generally use several global navigation satellite systems at once, including Russia's GLONASS, the European Union's Galileo, and China's BeiDou Navigation Satellite System. As GPS applications mature and high technology advances rapidly, vehicle navigation, positioning on phones and watches, autonomous driving, and many other technologies depend increasingly on GPS. Like mobile phones and the internet, GPS has changed our lives so profoundly that people can no longer do without it.

# References
1. https://en.wikipedia.org/wiki/Global_Positioning_System
2. https://en.wikipedia.org/wiki/Differential_GPS
3. https://www.knowpia.cn/pages/GPS
4. https://www.knowpia.cn/pages/DGPS
5. https://www.gps.gov
