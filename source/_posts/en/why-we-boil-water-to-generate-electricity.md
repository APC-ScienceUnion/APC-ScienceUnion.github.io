---
layout: post
title: 'Why Do We Still Boil Water to Generate Electricity?'
date: 2026-03-21 22:49:12
lang: en
translation_key: "我们为什么要烧开水发电？"
translation_source_sha256: "7c2e4ad9a12233c00e7f7287a292417f2253bbef519aaacd8afd3c992dc8e322"
permalink: en/2026/03/21/why-we-boil-water-to-generate-electricity/
aside: false
comments: false
tags: []
categories: []
cover: /images/%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%83%A7%E5%BC%80%E6%B0%B4%E5%8F%91%E7%94%B5%EF%BC%9F/cover-930eab0ddc.jpg
copyright_author: '锅炉-251'
katex: true
---

{% note blue 'fas fa-lightbulb' %}
From the age of the steam engine to the nuclear power plant, humanity has spent centuries tinkering with technology and is still boiling water. Photovoltaics, wind turbines, fuel cells, magnetohydrodynamic generators—why have all these seemingly more advanced technologies failed to replace the same kettle we have kept boiling for three hundred years?
{% endnote %}


> Author: 锅炉-251
Reviewer: 赖渊

# Introduction

&emsp;&emsp;A familiar joke says that human development amounts to boiling water and throwing rocks. The first half refers to modern electricity generation, which relies mainly on thermodynamic cycles that use steam as the working fluid. The second says that humans still inflict damage mainly by projecting mass at a target. This article focuses on energy. By examining where energy comes from, how it is used, and the upper limits on efficiency, we will ask why humanity still relies on "boiling water" to produce power and electricity centuries after the First Industrial Revolution.

# How can we generate electricity?

&emsp;&emsp;Let us begin by reviewing the main routes available to us:

1. Heat → work → electricity, or thermodynamic-cycle generation: a system first produces heat, converts that heat into some form of mechanical work, and finally uses the work to generate electricity.
2. Kinetic energy → work → electricity: wind and hydropower are representative systems. Fluid machinery converts the kinetic energy of a fluid into mechanical work and then into electricity.
3. Light → electricity: photovoltaics is the principal example, converting light into electrical energy through the photovoltaic effect.
4. Heat → electricity: nuclear batteries are representative, converting thermal energy directly into electricity through the thermoelectric effect.
5. Chemical energy → electricity: fuel cells and electrochemical batteries are the main examples, converting chemical energy into electricity through redox reactions.
6. Direct use of electrical charge: magnetohydrodynamic generation follows this route, using the Hall effect and the charge carried by a plasma to generate electricity.

# Why choose a thermodynamic cycle?

&emsp;&emsp;Before introducing thermodynamic cycles, let us consider the shortcomings of the other routes.

&emsp;&emsp;Photovoltaic, wind, hydroelectric, and other renewable sources are supplying a growing share of the energy system, but they still cannot replace thermal generation. The output of photovoltaics and wind varies greatly with the weather, including changes in cloud cover and wind speed. These fluctuations place considerable stress on a power grid that depends heavily on stability. A grid with a high penetration of renewables therefore needs supporting energy storage, reserve capacity, expanded transmission, flexible dispatch, and appropriate market mechanisms, making the total system costly. The price of the generating equipment itself is falling rapidly, but marginal system-level costs for integration, peak regulation, and stability control rise quickly. Hydropower obtains the kinetic energy of water from gravitational potential energy, so the construction of hydroelectric facilities is constrained by terrain and cannot be deployed at large scale everywhere. Making photovoltaic, wind, and hydropower the dominant sources therefore requires complex power-system engineering^[1]^.

<img src="/images/%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%83%A7%E5%BC%80%E6%B0%B4%E5%8F%91%E7%94%B5%EF%BC%9F/fig-001-8b2c8690fd.jpg" alt="Figure 1. Using energy storage to absorb fluctuations in renewable generation [1]" title="Figure 1. Using energy storage to absorb fluctuations in renewable generation [1]" />
<center><font size=2px color=grey>Figure 1. Using an energy-storage system to accommodate fluctuations in renewable generation [1]</font></center>

&emsp;&emsp;A radioisotope thermoelectric generator, which converts heat directly into electricity through the thermoelectric effect, produces only about 100 W of electrical power from roughly 2,000 W of thermal power. Its efficiency is only 5 percent, so it is seen mainly in applications such as deep-space probes.

&emsp;&emsp;Among technologies that use chemical energy, primary batteries are too expensive and short-lived to generate electricity for a modern power system, while secondary batteries are used mainly for storage rather than generation. Fuel cells are therefore the main chemical-energy technology on the generating side. A fuel cell converts chemical energy directly into electricity through redox reactions at its electrodes. In theory, it can bypass the efficiency limit of the Carnot cycle and has major advantages in distributed energy systems. Several problems nevertheless restrict its use:

&emsp;&emsp;At the stack level, costly precious-metal catalysts, sensitivity to impurities in the fuel, and poor durability limit the expansion of fuel-cell power generation.

&emsp;&emsp;First, consider the precious-metal catalyst. A hydrogen fuel cell operates through the familiar reaction of hydrogen and oxygen to form water:

$$H_2 + O_2 \xrightarrow{\text{catalyst}} H_{2}O$$

&emsp;&emsp;The oxidation and reduction half-reactions take place separately at the anode and cathode. To maintain an adequate reaction rate, the electrodes generally use platinum-group-metal catalysts, keeping their price high.

&emsp;&emsp;As for the fuel, most hydrogen today is blue hydrogen obtained from reformate produced while processing petroleum gas. Hydrogen that has not been thoroughly purified often contains carbon monoxide. Carbon monoxide occupies catalytic sites in a fuel cell and substantially reduces its performance. In engineering practice, solving the problem requires either higher-purity hydrogen or additional purification and control equipment in the system. Both keep fuel and supply-chain costs high.

&emsp;&emsp;In large fuel-cell systems, chemical and mechanical aging of the membrane, degradation of catalysts and supports, and the heat-release load of the cells create barriers to high power and long-term stable operation. Commercial fuel-cell operation is consequently rare in power stations whose output is routinely measured in megawatts^[2]^.

<img src="/images/%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%83%A7%E5%BC%80%E6%B0%B4%E5%8F%91%E7%94%B5%EF%BC%9F/fig-002-1cc3405896.jpg" alt="Figure 2. How a fuel cell works [2]" title="Figure 2. How a fuel cell works [2]" />
<center><font size=2px color=grey>Figure 2. Operating principle of a fuel cell [2]</font></center>

&emsp;&emsp;Magnetohydrodynamic generation has long been regarded as a possible route for commercial electricity production after nuclear fusion. It treats a high-temperature conductive fluid, either a plasma or a liquid metal, as a moving conductor. Flowing through a strong magnetic field, the fluid directly produces an induced electromotive force and an electric current. This apparently simple principle reveals four difficult thresholds. First, where does the high-temperature heat source come from? Combustion products and gases have very low electrical conductivity at ordinary temperatures. They must be ionized at extremely high temperatures, often with an alkali-metal seed added to improve conductivity. That immediately creates the second problem: structural stability. To raise the fluid's conductivity, the hot side must push the working fluid into a temperature range close to material limits. Every component is forced into an environment of high temperature, severe corrosion, and high heat flux. Adding alkali metals makes the fluid still more corrosive, creating a major challenge for stable operation. The third challenge is the principal requirement for generation: the magnetic field. Producing an induced electromotive force requires a strong field between the electrode plates. Maintaining that field either consumes a great deal of electricity or requires superconducting materials. Finally, pollution in the exhaust and recovery of the conductive seed affect both the environmental performance and operating cost. A system that looks concise and efficient needs extensive auxiliary equipment to remain in operation. Its overall maturity is still far short of commercial requirements, and its life-cycle cost cannot compete with a thermodynamic-cycle power station. Further progress depends on improved materials^[3]^.

<img src="/images/%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%83%A7%E5%BC%80%E6%B0%B4%E5%8F%91%E7%94%B5%EF%BC%9F/fig-003-3cc0b06be6.jpg" alt="Figure 3. Schematic of a liquid-metal magnetohydrodynamic power-generation system [4]" title="Figure 3. Schematic of a liquid-metal magnetohydrodynamic power-generation system [4]" />
<center><font size=2px color=grey>Figure 3. Schematic of a liquid-metal magnetohydrodynamic generation system [4]</font></center>

&emsp;&emsp;We can now return to thermodynamic cycles and ask why "boiling water" has remained useful through three hundred years of development. The answer requires the perspective of the power system: what kind of electricity does a grid actually need?

&emsp;&emsp;A thermodynamic cycle is an energy-conversion interface that can accommodate almost every primary energy source. A large share of the primary energy that humans can obtain readily, supply steadily, and use at scale first appears as heat. Fossil fuels release heat when burned; a nuclear-fission core releases heat; concentrated solar energy and geothermal energy are themselves heat. Thermodynamic cycles therefore provide a natural, general-purpose interface connecting these sources to the grid.

&emsp;&emsp;Thermal generating units can also meet the grid's operational requirements more readily. Large thermal units generally connect through synchronous generators, which help the system regulate frequency. We will leave a marker here for a future discussion of how a power system operates with alternating current.

&emsp;&emsp;Scaling the total power of a thermodynamic cycle is straightforward. Higher temperatures, greater flow rates, different working fluids, and other adjustments allow a system to meet different requirements.

<img src="/images/%E6%88%91%E4%BB%AC%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E7%83%A7%E5%BC%80%E6%B0%B4%E5%8F%91%E7%94%B5%EF%BC%9F/fig-004-23fec64fe6.jpg" alt="Figure 4. Rankine-cycle flow diagram [5]" title="Figure 4. Rankine-cycle flow diagram [5]" />
<center><font size=2px color=grey>Figure 4. Flow diagram of a Rankine cycle [5]</font></center>

# After a century of thermodynamic cycles, what remains to be done?

&emsp;&emsp;To answer this question, we must return to the equation that governs a thermodynamic-cycle system and examine how closely we can approach the limits of physics and engineering. The upper efficiency limit of any thermodynamic cycle is determined by the temperature difference between the two reservoirs of the corresponding Carnot cycle:

$$\eta = \frac{T_{H} - T_{C}}{T_{H}}$$

&emsp;&emsp;Suppose a power plant obtains a 900 K heat source from combustion and transfers that heat to boiler water. Its cold reservoir releases heat into an environment at 293 K, or 20°C. The second law of thermodynamics limits the plant's maximum efficiency to 67.4 percent. Irreversible losses throughout generation reduce the actual efficiency further. The first central problem in modern research on thermodynamic cycles is therefore **how to design processes and optimize components to raise efficiency further**.

&emsp;&emsp;After a power plant generates electricity, it discharges the exhaust gas from combustion. The boiler water has not absorbed all the exhaust's heat, so the gas remains at a high temperature of 400 K. The plant supplies electricity to a neighboring steelworks, which in turn discharges slag at 600 K after making iron and steel. Releasing all this residual heat directly into the environment seems wasteful. This leads to the second central problem: **how to design combined cycles that use otherwise discarded residual heat and improve overall energy efficiency**. The carbon-dioxide power generation that recently became a trending topic does exactly this, using supercritical carbon dioxide as the working fluid to absorb waste heat from a steel plant and generate additional electricity.

&emsp;&emsp;The third central problem is **building small, specialized, and customized generating equipment**. Geothermal resources, for example, have relatively low temperatures, so an Organic Rankine Cycle can absorb their heat. A nuclear power plant may use supercritical water as the working fluid for heat released by fission. A more unusual example uses the substantial heat emitted as a data center processes information to build a district waste-heat recovery system. Combined heat and power, combined cooling, heating, and power, and heat recovery from cracking processes are also mainstream designs for producing the different forms of energy people need^[6]^.

# Summary

&emsp;&emsp;In summary, generating electricity by "boiling water" cannot yet be replaced because:

1. It provides an exceptionally adaptable way to convert a wide range of primary energy sources;
2. Thermodynamic-cycle generation helps maintain stable grid operation;
3. It can deliver high power at large scale, meeting the needs of modern industrial development.

&emsp;&emsp;Even after a century of development, thermodynamic cycles retain strong prospects under the demands of a new era.

# References

[1]	Liu T, Wu S, Zhong L, et al. Parametric assessment and multi-objective optimization of an ejector-enhanced compressed air energy storage system based on conventional and advanced exergy[J]. Journal of Renewable and Sustainable Energy, 2024, 16(5): 054101.
[2]	姚晓多, 许强辉, 张文强. Review of digital-twin systems for fuel cells[J]. Journal of Chemical Industry and Engineering: 1-18.
[3]	Bowen M S, Kwong K S, Hsieh P, et al. High temperature corrosion stability of ceramic materials for magnetohydrodynamic generators[J]. Materials Performance and Characterization, 2022, 11(2): 127-138.
[4]	田茹梦, 孙轩懿, 梁红雯, 等. Advances in liquid-metal magnetohydrodynamic power generation[Z]//Energy and Energy Conservation. 2020: 68-71+138.
[5]	谷志卿, 宋海琛, 尹金城, 等. Progress in the application of Organic Rankine Cycles to low-temperature waste-heat generation[J]. Sintering and Pelletizing, 2025, 50(04): 32-39+72.
[6]	Zhou N, Price L, Yande D, et al. A roadmap for China to peak carbon dioxide emissions and achieve a 20% share of non-fossil fuels in primary energy by 2030[J]. Applied Energy, 2019, 239: 793-819.
