---
layout: post
title: How Flip-Flops Work and What They Do
date: '2022-12-19 19:45:00'
lang: en
translation_key: "触发器的原理和应用"
translation_source_sha256: "0b45e6229e444467d72af6663ede6da3af860841092da95bea5c45f4321b3768"
permalink: en/2022/12/19/how-flip-flops-work-and-what-they-do/
aside: false
comments: false
tags: []
categories: []
cover: /images/%E8%A7%A6%E5%8F%91%E5%99%A8%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%BA%94%E7%94%A8/cover-2a8b038daa.png
copyright_author: '浮槎'
---

# How Flip-Flops Work and What They Do
> Author: 浮槎
Reviewed by: 时光

&emsp;&emsp;Any discussion of how computers work must include one kind of electronic device: the flip-flop. A flip-flop consists mainly of two vacuum tubes, with current flowing through one of them at a time. It has four terminals: two receive external pulses, while the other two supply response pulses. The instant an external pulse arrives, the flip-flop “flips.” The tube that was conducting switches off, and the current moves to the other tube. When one tube switches off and the other begins conducting, the flip-flop produces a response pulse.

&emsp;&emsp;Now suppose we feed a continuous series of pulses into a flip-flop and define its state by the condition of one of the two tubes in Figure 1—the tube on the right. When the right-hand tube is off, we call the flip-flop's state “0”; when it conducts, we call the state “1.”

&emsp;&emsp;If the initial state is “0,” meaning that the right-hand tube is off as shown in Figure 1, the first input pulse turns that tube on and flips the device into state “1.” No response pulse is produced at this point because the left-hand tube has not begun conducting. When the second pulse arrives, the left-hand tube conducts, the right-hand tube switches off, and the flip-flop returns to state “0,” producing a response pulse.

&emsp;&emsp;We can see that after two input pulses, the flip-flop has returned to its initial state. A third pulse changes it to state “1,” and a fourth changes it back to state “0,” and so on. In other words, the flip-flop cycles through its states with a period of two pulses.

<img src="/images/%E8%A7%A6%E5%8F%91%E5%99%A8%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%BA%94%E7%94%A8/fig-001-8edc0f4c36.png" width=550/>
<center><font size=2px color=grey>Figure 1</font></center>

&emsp;&emsp;What happens if several flip-flops are connected together? Consider three devices—Flip-Flops 1, 2, and 3—linked as shown in Figure 2. An input pulse is sent to Flip-Flop 1. Its response pulse then becomes the input to Flip-Flop 2, whose response pulse in turn becomes the input to Flip-Flop 3. Finally, Flip-Flop 3 produces a response pulse. 

<img src="/images/%E8%A7%A6%E5%8F%91%E5%99%A8%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%BA%94%E7%94%A8/fig-002-1f2035af15.png" width=550/>
<center><font size=2px color=grey>Figure 2</font></center>

&emsp;&emsp;Suppose five flip-flops are connected in this way and all begin in state “0.” We can write the state of the group as “00000.” After the first pulse is fed into the rightmost flip-flop, that device changes to state “1.” Because it produces no response pulse, the four devices to its left remain in state “0,” giving the combined state “00001.” On the second input pulse, the rightmost flip-flop returns to state “0” and sends a response pulse to its neighbor. That neighboring flip-flop changes to state “1,” while all the others, having received no response pulse, remain in state “0.” The combined state is now “00010.” When the third pulse arrives, the rightmost flip-flop changes back to state “1” without producing a response pulse; the other states remain unchanged, yielding “00011.” Continuing the cycle produces the following data:

```
State after pulse 1: 00001
State after pulse 2: 00010
State after pulse 3: 00011
State after pulse 4: 00100
State after pulse 5: 00101
State after pulse 6: 00110
...
```

&emsp;&emsp;If we interpret these states as binary numbers and convert them to decimal, we obtain 1, 2, 3, 4, 5, 6, and so on. Connected flip-flops can therefore “count” external pulse signals—and they do so in a distinctive way.

&emsp;&emsp;Binary represents every number using “0” and “1.” Unlike decimal notation, each place in a binary number is worth 2 times the place to its right, rather than 10 times as much. To convert a binary number to decimal, multiply each digit by 2 to the power n, where n denotes its place, and add the results. For example, converting the binary number “10011” gives 1 × 2^0 + 1 × 2^1 + 0 × 2^2 + 0 × 2^3 + 1 × 2^4 = 19.

&emsp;&emsp;Each flip of the device—that is, each input pulse—takes only a few hundred-millionths of a second. Modern counting flip-flops can “count” more than ten million pulses in one second, whereas the human eye needs about 0.1 seconds to distinguish a changing signal. Compared with a person, the device is nearly one million times faster.

&emsp;&emsp;Next, let us see how flip-flops can perform addition. Connect three rows of flip-flops as shown in Figure 3. The first row represents the augend, the second the addend, and the third their sum. Whenever a flip-flop in either of the upper rows is in state “1,” it sends a pulse to the corresponding device in the third row.

<img src="/images/%E8%A7%A6%E5%8F%91%E5%99%A8%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%BA%94%E7%94%A8/fig-003-4f029d849e.png" width=550/>
<center><font size=2px color=grey>Figure 3</font></center>

&emsp;&emsp;In Figure 3, the first two rows store the binary numbers 101 and 111. The first flip-flop in the third row receives one pulse from each of the first devices in the two upper rows, for a total of two. As explained above, it remains in state “0” and sends one response pulse to the second flip-flop in the third row. In addition to this response pulse, the second flip-flop receives a pulse from the second device in the second row. It therefore receives two pulses in all, remains in state “0,” and sends a response pulse to the third device in its row. Besides that response pulse, the third flip-flop receives one pulse from each of the first and second rows, for a total of three. It ends in state “1” and also produces a response pulse. The fourth flip-flop in the third row receives only that one response pulse and therefore enters state “1.” This is binary addition; written vertically, the calculation is the one shown in Figure 4:

<img src="/images/%E8%A7%A6%E5%8F%91%E5%99%A8%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%BA%94%E7%94%A8/fig-004-8ef8a3695e.png" width=300/>
<center><font size=2px color=grey>Figure 4</font></center>

&emsp;&emsp;Converting the binary values in Figure 4 to decimal gives 5 + 7 = 12. The response pulses from the third row serve as the carries in column addition. With 20 or more flip-flops in each row, the circuit can add numbers in the millions or even tens of millions. A modified version of the same design can perform not only addition and subtraction, but multiplication and division as well.

> Reference: *Recreational Algebra*
