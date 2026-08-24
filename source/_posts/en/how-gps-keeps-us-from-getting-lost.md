---
layout: post
title: How Does GPS Keep Us from Getting Lost?
date: 2019-06-19 19:30:00
lang: en
translation_key: "GPS 用什么魔法让路痴不再迷路？"
translation_source_sha256: "0c9a209eef00e03bf4c136a3b0415dad15ac9ab020254a062bdd4da6ffa40ea7"
permalink: en/2019/06/19/how-gps-keeps-us-from-getting-lost/
aside: true
comments: false
tags: []
categories: []
copyright_author: '一毫秒的永恒'
cover: /images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/cover-48a07e6b56.jpg
---

> Author: A Millisecond of Eternity

&emsp;&emsp;Thousands of years ago, our ancestors set up milestones, drew detailed maps, and learned to navigate by the night sky. Things are much easier now. A smartphone handles most everyday navigation, and with a GPS receiver, you can locate yourself almost anywhere satellite signals reach. Getting lost is no longer much of a worry.

&emsp;&emsp;What follows is a brief introduction to GPS positioning. The Global Positioning System is enormous, expensive, and complex, but the basic ideas behind it are surprisingly simple and intuitive.

&emsp;&emsp;The Global Positioning System, or GPS, provides accurate positions, velocity measurements, and highly precise standard time across most of Earth's surface. In everyday conversation, “GPS” usually means the receiver in your device. In space, however, the system is a constellation of more than 30 Earth-orbiting satellites, at least 24 of them operational.

&emsp;&emsp;The satellites orbit at an altitude of 20,200 km and circle Earth twice a day. The 24 working satellites are spread among six orbital planes, four to a plane. Each plane is inclined 55° to Earth's equatorial plane, and the right ascensions of the ascending nodes differ by 60°. This layout ensures that at least four satellites are visible from any point on Earth at any time.

<img src="/images/GPS 用什么魔法让路痴不再迷路？/640.gif" title="An example of a GPS satellite constellation as Earth rotates. Here, the number of satellites that can be received is calculated at a latitude of 45° north and varies over time. | Credit:Knowpia" />

<center><font size=2px color=grey>An example of a GPS satellite constellation as Earth rotates. Here, the number of satellites that can be received is calculated at a latitude of 45° north and varies over time. | Credit:Knowpia</font></center>

&emsp;&emsp;A GPS receiver uses four or more satellites, calculates its distance from each, and works out its own position from those distances. The mathematics is called trilateration. Three-dimensional trilateration can be tricky, so let us start with the simpler two-dimensional version.

&emsp;&emsp;Imagine waking up one morning in a place you do not recognize and wandering aimlessly through the streets. Luckily, you have a map of China. You ask several passersby where you are, but they happen to be visitors too. All they can tell you is how far they have traveled from where they started.

&emsp;&emsp;The first helpful stranger says, “We're 122 kilometers from Ya'an as the crow flies.” That gives you something to work with: draw a circle on the map centered on Ya'an, with a radius of 122 kilometers. You must be somewhere along that circle.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-001-a174b23c09.jpg" title="Figure 1" />

<center><font size=2px color=grey>Figure 1</font></center>

&emsp;&emsp;A second helpful stranger says, “All I know is that we're 62 kilometers from my hometown, Deyang.” Easy enough: draw another circle, centered on Deyang with a radius of 62 kilometers. It crosses the first circle at two points, narrowing the possibilities considerably.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-002-5f66cf9dae.jpg" title="Figure 2" />

<center><font size=2px color=grey>Figure 2</font></center>

&emsp;&emsp;A third helpful stranger offers one last, teasing clue: “I don't know where we are either, but I do know we're 146 kilometers from Suining.”

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-003-0982b2b9a1.jpg" title="Figure 3" />

<center><font size=2px color=grey>Figure 3</font></center>

&emsp;&emsp;No problem. Draw a third circle from that distance, and you have your answer: it passes through one of the two earlier intersection points. Put the result on the map of China, and there you are—in Chengdu.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-004-7f95741c53.jpg" title="Figure 4" />

<center><font size=2px color=grey>Figure 4</font></center>

&emsp;&emsp;That is two-dimensional trilateration. When WeChat first launched its Shake feature, some people proposed using the same method to determine a person's general activity area.

&emsp;&emsp;Back to GPS. The same method works in three dimensions, except that our two-dimensional “circles” become three-dimensional “spheres.” The underlying idea hardly changes. Imagine each radius in the example extending in every direction, turning each circle into a sphere.

&emsp;&emsp;If you know you are 10,000 kilometers from Satellite A, you could be anywhere on an enormous imaginary sphere with a radius of 10,000 kilometers. Learn that you are also 15,000 kilometers from Satellite B, and you can overlap the first sphere with a larger one. The two intersect in a perfect circle. Your distance from a third satellite adds a third sphere. All three spheres meet at two points, one of them on Earth's surface. Unless you happen to be flying, that surface point is where you are.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-005-c7fa835000.jpg" title="The common intersection of Earth and the “spheres” measured from three satellites is your position. A fourth satellite calibrates and synchronizes time." />

<center><font size=2px color=grey>The common intersection of Earth and the “spheres” measured from three satellites is your position. A fourth satellite calibrates and synchronizes time.</font></center>

&emsp;&emsp;For greater accuracy and a precise altitude, however, a receiver normally uses at least four satellites, often more. Why? The fourth satellite corrects timing error, and every additional satellite supplies more information to improve the position. A GPS receiver therefore needs two things:

1. The positions of at least four satellites
2. The distances between you and those satellites

&emsp;&emsp;The receiver derives both from the navigation messages and timing data broadcast by the satellites. Radio signals travel through a vacuum at the speed of light, so the time a signal takes to reach the receiver reveals the distance it traveled. The real calculation is fairly involved, but consider a simple example. A satellite transmits a pseudorandom code at 8:00 a.m. By the time that code reaches the GPS receiver, the two clocks show a difference. Multiply that time difference by the speed of light, and you get the signal's travel distance—ideally, if it followed a straight path, the distance from satellite to receiver.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-006-b0bf304b8a.jpg" title="In the diagram, (xi,yi,zi) represents the spatial coordinates of satellite i at time t, and Vti represents the clock offset between the satellite and receiver. The four equations above can be solved for the coordinates x, y, and z of the point being measured and for the receiver clock offset Vto." />

<center><font size=2px color=grey>In the diagram, (xi,yi,zi) represents the spatial coordinates of satellite i at time t, and Vti represents the clock offset between the satellite and receiver. The four equations above can be solved for the coordinates x, y, and z of the point being measured and for the receiver clock offset Vto.</font></center>

&emsp;&emsp;This measurement requires the satellite and receiver clocks to stay synchronized to the nanosecond. If synchronization alone solved the problem, every satellite and every receiver would need an atomic clock. Atomic clocks are expensive; ordinary consumers could hardly be expected to buy one.

&emsp;&emsp;The practical, economical solution is to put atomic clocks on the satellites and an ordinary quartz clock in the receiver. With signals from at least four satellites at once, the receiver can solve for its clock error along with its position—four unknowns and four equations—and keep correcting that error. GPS can thus provide high-precision positioning without an atomic clock in your pocket. In a sense, you get to use the satellites' atomic clocks “for free.”

&emsp;&emsp;Reality, of course, is much messier. Signals are delayed as they pass through Earth's atmosphere. Reflections from nearby objects such as tall buildings create multipath effects. Satellite ephemeris errors, satellite and receiver clock errors, and relativistic effects add further uncertainty. Together, these problems usually limit conventional single-point positioning to an accuracy of a few meters to more than ten meters. For better results, we turn to differential GPS.

&emsp;&emsp;Differential GPS (DGPS) places a monitoring receiver at a precisely surveyed point. Acting as a base station, it makes GPS observations at the same time as the user. Comparing its single-point result with its known coordinates yields real-time differential corrections. The base station sends those corrections by broadcast or data link to nearby users, who apply them to their GPS solutions and improve local accuracy.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-007-25f9723f9d.jpg" title="Differential positioning, also known as relative positioning, improves accuracy by adding a reference GPS receiver. | Credit:Knowpia" />
<center><font size=2px color=grey>Differential positioning, also known as relative positioning, improves accuracy by adding a reference GPS receiver. | Credit:Knowpia</font></center>

&emsp;&emsp;The most widely used form of DGPS is pseudorange differential positioning. A pseudorange is the distance obtained from a real GPS measurement. Atmospheric refraction and other effects alter the signal in transit, so that measured value is not the true distance from satellite to ground receiver—hence “pseudorange,” and “pseudorange measurement” for the receiver's observation. This technique can deliver meter-level accuracy. Carrier-phase differential positioning, also called real-time kinematic or RTK positioning, goes further and can reach centimeter-level precision. It is widely used in moving applications that demand highly accurate positions.

<img src="/images/GPS%20%E7%94%A8%E4%BB%80%E4%B9%88%E9%AD%94%E6%B3%95%E8%AE%A9%E8%B7%AF%E7%97%B4%E4%B8%8D%E5%86%8D%E8%BF%B7%E8%B7%AF%EF%BC%9F/fig-008-fb6d9ab6cf.jpg" title="Diagram of carrier-phase differential positioning. This technique can achieve centimeter-level positioning accuracy in the field in real time, providing the observation point's three-dimensional coordinates with centimeter-level precision." />
<center><font size=2px color=grey>Diagram of carrier-phase differential positioning. This technique can achieve centimeter-level positioning accuracy in the field in real time, providing the observation point's three-dimensional coordinates with centimeter-level precision.</font></center>

&emsp;&emsp;GPS is now woven into daily life and remains one of the world's most important satellite-navigation systems. Modern devices usually listen to several global navigation satellite systems at once, including Russia's GLONASS, the European Union's Galileo, and China's BeiDou Navigation Satellite System. As these systems and their applications mature, vehicle navigation, positioning on phones and watches, autonomous driving, and many other technologies rely on them more and more. Like mobile phones and the internet, GPS has changed life so thoroughly that it is hard to imagine going without it.

# References
1. https://en.wikipedia.org/wiki/Global_Positioning_System
2. https://en.wikipedia.org/wiki/Differential_GPS
3. https://www.knowpia.cn/pages/GPS
4. https://www.knowpia.cn/pages/DGPS
5. https://www.gps.gov
