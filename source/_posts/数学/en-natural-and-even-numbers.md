---
layout: post
title: Are there as many even numbers as natural numbers?
date: 2026-09-08 00:00:00
lang: en
translation_key: 自然数和偶数一样多吗？
translation_source_sha256: "0fae0a462ce36c1b262b74c1ab2479240052cc319900c90de18219b28c84583b"
permalink: en/2026/09/08/natural-and-even-numbers/
aside: true
comments: false
tags: []
categories: []
copyright_author: 'silverxz'
katex: true
---

{% note blue 'fas fa-infinity' %}
Even numbers are only part of the natural numbers, so why does mathematics tell us there are just as many of them?
Behind this seemingly counterintuitive conclusion lies an often overlooked question: how should we compare the “sizes” of two infinite sets? From Galileo’s paradox to Cantor’s principle, this article takes you into a philosophical debate about infinity.
{% endnote %}

> Author: silverxz

&emsp;&emsp;How should we compare the sizes of infinite sets? For example, are there more natural numbers or more even numbers?

&emsp;&emsp;You may already have encountered the “conclusion” in many popular accounts: there are as many natural numbers as even numbers. The proof goes like this: consider the map $n\mapsto 2n$ from the natural numbers to the even numbers. It establishes a one-to-one correspondence between all natural numbers and all even numbers: every natural number corresponds to an even number, and every even number is matched by exactly one natural number.

<img src="/images/自然数和偶数一样多吗？/bijection-even.png" alt="" style="width: 150px; max-width: 100%;" />

&emsp;&emsp;To avoid readers mistaking the Chinese characters for “one-to-one” for a dash, we will use its synonym, “bijection,” from now on. If that word feels unfamiliar, you can mentally translate it back to one-to-one correspondence. We have just defined a bijection from the natural numbers to the even numbers. The proof says that because this bijection exists, there are as many natural numbers as even numbers.

&emsp;&emsp;Similarly, one can conclude that there are just as many natural numbers, even numbers, odd numbers, integers, primes… all of them. Today this claim appears increasingly often in public discussions, almost as common knowledge. For example, the game Honkai: Star Rail includes a question asking whether there are more natural numbers or more primes, and its official answer is that there are equally many<a href="#reference-1">[1]</a>.

&emsp;&emsp;But is that really so?

&emsp;&emsp;Looking back over the proof, its argument runs as follows:

1. There is a bijection between the natural numbers and the even numbers;
2. If there is a bijection between two sets, they contain equally many elements;
3. Therefore, there are as many natural numbers as even numbers.

&emsp;&emsp;The first claim is a mathematical fact we have proved. There is no problem there. The question lies in the second claim: why should the existence of a bijection mean that the two sets contain equally many elements?

&emsp;&emsp;No mathematical theorem can answer that question, because what it actually asks is this: for infinite sets, how do you <em>define</em> “having equally many elements”? Which definition captures your idea of “equally many”? And what is that idea, exactly? This is already a question in the philosophy of mathematics, which is what we will discuss today. To do so, let us look together at an “old” example.

---

&emsp;&emsp;Much of the development of the theory of infinite sets is commonly credited to the nineteenth-century mathematician Georg Cantor (1845-1918). But similar questions had been considered much earlier. One of the best-known examples was proposed by Galileo Galilei (1564-1642) and is now called Galileo’s paradox. He considered natural numbers and square numbers, rather than natural numbers and even numbers<a href="#reference-2">[2, pp. 27-29]</a>.

&emsp;&emsp;Let $\mathbb{N}=\{0, 1, 2, 3, \dots\}$ be the set of natural numbers, and let $S = \{0, 1, 4, 9, \dots\} = \{n^2: n\in \mathbb{N}\}$ be the set of square numbers. We can observe three properties:

1. There is a bijection between $\mathbb{N}$ and $S$;
2. $S$ is part of $\mathbb{N}$;
3. $S$ becomes increasingly “sparse” in $\mathbb{N}$.

&emsp;&emsp;The first property works just like the bijection from natural numbers to even numbers above: the function $n\mapsto n^2$ gives a bijection from the natural numbers $\mathbb{N}$ to the square numbers $S$.

<img src="/images/自然数和偶数一样多吗？/bijection-square.png" alt="" style="width: 150px; max-width: 100%;" />

&emsp;&emsp;The second property is also obvious: $S$ is certainly part of $\mathbb{N}$. More precisely, $S$ is a proper part of $\mathbb{N}$, meaning that there are natural numbers that are not squares—which is, of course, true.

&emsp;&emsp;The third property is a deeper observation building on the second. Leaving $0$ aside, the first $100$ numbers contain $10$ squares, a proportion of $1/10$. But the first $10000$ numbers contain $100$ squares, so the proportion is only $1/100$.

&emsp;&emsp;In general, how many squares are there among the first $n$ numbers? There are $\lfloor \sqrt n\rfloor$. This notation means discarding the fractional part of $\sqrt n$, or rounding down. In other words, the “density” of squares among the first $n$ numbers is $\frac{\lfloor \sqrt n\rfloor}{n} \leq \frac{1}{\lfloor \sqrt n\rfloor}$. As $n$ increases, this density tends to $0$. That is why we say the squares become increasingly sparse among the natural numbers.

&emsp;&emsp;Given these observations, which do you think there are more of: natural numbers or square numbers?

&emsp;&emsp;One answer holds that there are equally many. The reasoning is that two finite sets contain equally many elements if and only if there is a bijection between them. If we want infinite sets to retain this property, property 1 above leads us to answer “equally many,” even when one set contains the other.

&emsp;&emsp;Defining “equally many” in this way is known as Cantor’s principle. As the name suggests, Cantor was a prominent supporter of this answer<a href="#reference-3">[3, pp. 883-884, 922]</a>.

&emsp;&emsp;The opposing answer holds that there are more natural numbers than square numbers. Its usual justification is that, for finite sets, a part is always smaller than the whole. If we want infinite sets to retain this property, property 2 requires there to be fewer squares than natural numbers. Property 3 reinforces that intuition: squares become increasingly sparse, so intuitively there seem to be far fewer of them than natural numbers.

&emsp;&emsp;Defining “equally many” along these lines is known as the part-whole principle. One prominent supporter of this answer was Bernard Bolzano (1781-1848)<a href="#reference-3">[3, pp. 266-268]</a>. His name may be unfamiliar to readers. Many of his results and ideas in analysis, infinity, logic, and philosophy—especially the philosophy of mathematics—were ahead of, sometimes far ahead of, their time. Unfortunately, for various reasons they were neither widely disseminated nor given due attention. Often a century or more passed before people recognized that “Bolzano had already done similar work.” As a result, he never gained the influence and reputation in the history of mathematics that he deserved.

&emsp;&emsp;These are two opposing answers. Must we choose between them? No: there is a third answer, which is to refuse the choice. Both properties underlying the answers above are natural for finite sets, but infinite sets cannot retain both, so one must be discarded. Yet, as the saying goes, I want both fish and bear’s paw, but cannot have both… Why must I choose one, rather than declare that the multiple-choice question itself is flawed? That was Galileo’s answer. He said that we can conclude only that “they are both infinite in number”: there are infinitely many squares and infinitely many natural numbers, and neither is less numerous than the other. Properties such as “equal,” “greater,” and “less” apply only to finite quantities, not to infinite quantities.

&emsp;&emsp;Galileo himself gave this example, so he was fully aware both that a bijection exists between these sets and that one contains the other. He understood these mathematical facts perfectly well. Yet he <em>refused</em> to use them to judge the relative sizes of infinite sets. He held that we cannot speak of which infinite set has more elements.

---

&emsp;&emsp;We now have three different answers. Which is correct?

&emsp;&emsp;There is no absolutely correct answer. They are different positions in the philosophy of mathematics, each with its own reasons. More crucially, let me stress again: whichever answer you choose, all three properties mentioned above still hold. The mathematical facts have not changed, so these answers cannot be judged mathematically wrong on that basis.

&emsp;&emsp;Next, we will briefly look at some reasons for supporting or rejecting these positions, so that you can decide which you find more persuasive. Given the available space, the intended readers’ background, and my own limitations, I can introduce only the simplest, most basic views here—nowhere near all of them.

&emsp;&emsp;Let us start with Cantor’s principle. One argument for it appeals to a simple aesthetic intuition: the “number” of elements in a set should be an invariant independent of their arrangement. A bijection can itself be understood as a kind of “reordering,” so it seems reasonable to say that two sets connected by a bijection have the same “number” of elements. In mathematics, this invariant is called a set’s cardinality. Two sets with a bijection between them have the same cardinality.

&emsp;&emsp;Correspondingly, this view would reject the claim that “there are twice as many natural numbers as even numbers.” Simply rearrange the natural numbers as $0, 1, 3, 2, 5, 7, 4, 9, 11, \dots$, enumerating them in the pattern even-odd-odd, and it will appear that there are three times as many natural numbers as even numbers. The numerical relationship would then change with the arrangement, which is why this view rejects it.

&emsp;&emsp;Furthermore, the theory developed from Cantor’s principle is magnificent and strange. Explaining it directly lies beyond the scope of this article; forgive my inability to convey its beauty in words. We cannot say for certain whether such aesthetic considerations shaped Cantor’s position. But Cantor himself was undoubtedly very pleased with the theory—or at least his vision of it—and admired its beauty<a href="#reference-4">[4, p. 67]</a>. It is no wonder that he considered it the unique and necessary extension of finite number<a href="#reference-3">[3, p. 922]</a>.

&emsp;&emsp;Today, practical factors may also support Cantor’s principle. Much of modern mathematics rests on set theories such as ZFC and NBG, which trace their origins to Cantor’s work. Mathematicians can certainly use them as tools without adopting Cantor’s philosophical position. Still, their widespread use may subtly shape people’s intuitive views. Those who have not yet thought about these questions, in particular, may acquire a default Cantorian outlook simply because these are the tools they encounter first. This paragraph, however, is my subjective speculation, not the result of a statistical survey.

&emsp;&emsp;Now consider the part-whole principle. The reason for supporting it can be as simple as “I just think there are fewer even numbers than natural numbers. So what?” That is perfectly acceptable; the intuition is entirely legitimate. And to be clear once again, it does not prevent you from using the same mathematical tools or discussing the same mathematics as someone who supports Cantor’s principle. You can uphold the part-whole principle while still using cardinality as developed from bijections. You simply do not regard cardinality as an extension of the concept of number.

&emsp;&emsp;Moreover, ideas compatible with the part-whole principle can also yield important mathematical tools. From the perspective of bijections, the even numbers, squares, and primes all admit bijections with the natural numbers. Yet among the first $n$ natural numbers there are roughly $n/2$ even numbers, $\sqrt n$ squares, and $\frac{n}{\log n}$ primes. Their behavior is radically different, and “a bijection exists” does nothing to help investigate these properties.

&emsp;&emsp;Going further, the part-whole principle can give rise to a fairly substantial theory: numerosity. The term does not even have an established Chinese translation, which shows how little known the theory is. Nevertheless, it provides a fairly strong defense of the part-whole principle, showing that it can develop into a relatively complete position. Accepting and upholding the principle does not require understanding numerosity first, however. It is better to put it the other way around: numerosity could develop precisely because there were reasons to accept and uphold the principle.

&emsp;&emsp;Finally, let us return to Galileo’s position. There is not much more to say, since we have already covered its essentials: faced with a dilemma, Galileo rejected the question itself. Some readers may feel that this dodges the issue or fudges the answer, but it does not. “The sizes cannot be compared” is a much stronger claim than “I do not know.” Galileo maintained the former. His refusal was direct, not evasive.

&emsp;&emsp;For people studying mathematics who are less interested in these philosophical questions, however, a weaker, noncommittal position can also be a good choice. You can perfectly well say: “I do not know whether cardinality truly extends the idea of numerical relationships, or whether the part-whole principle is worth defending, and I do not care. I can still use the mathematical tools. When I need bijections and cardinalities, I use them; when I need densities, explicit counts, measures, and so on, I use those just as freely.” This is indeed a way of avoiding the question, but it is also unlikely to cause any harm to your mathematical studies.

---

&emsp;&emsp;Let us briefly recap. I hope the discussion has not left you confused.

&emsp;&emsp;Are there as many even numbers as natural numbers?

&emsp;&emsp;You can answer: yes, because there is a bijection between them

<p style="text-align: right;">—even though the even numbers are only part of the natural numbers.</p>

&emsp;&emsp;You can answer: there are fewer even numbers, because they are only part of the natural numbers

<p style="text-align: right;">—even though there is a bijection between them.</p>

&emsp;&emsp;Or you can answer as Galileo did: I do not think their numbers of elements can be compared.

&emsp;&emsp;You can also calmly say, “I do not know.” There is nothing shameful about that; it may even be the answer you reach after deep reflection.

&emsp;&emsp;The point of this article is precisely that “whether a bijection exists between two sets” and “whether two sets contain equally many elements” are different questions. The former is mathematical; the latter belongs to the philosophy of mathematics. In practice, some mathematicians do conflate the two. That may reflect their philosophical position, or it may simply be casual language they have not thought through. When they talk about the size of an infinite set, you should suspect that they almost certainly mean its cardinality. But that does not mean the two are really the same thing.

&emsp;&emsp;This confusion can be particularly troubling for beginners. On the one hand, the part-whole principle is an intuition they have long held. On the other, teachers often tell them, without explanation, that “a bijection means equally many,” leaving two contradictory ideas to collide in their minds. That is not good.

&emsp;&emsp;Other beginners are taught the dictum “a bijection means equally many” and memorize it as truth without thinking about it. Sometimes they show off this “knowledge,” even mocking people who do not yet know it. I have seen this happen. It is not entirely the fault of those beginners, who are often children; the greater failure lies with their educators.

&emsp;&emsp;I hope readers come away with a clearer understanding of this question, and with greater humility and tolerance, so that people who feel there are fewer even numbers than natural numbers will no longer be marked wrong—even though a bijection exists and the two sets have the same cardinality.

# References

<span id="reference-1">[1]</span> At the Gates of Science, Part One. Honkai: Star Rail WIKI_BWIKI_Bilibili. July 22, 2026. URL: <a href="https://wiki.biligame.com/sr/%E5%9C%A8%E7%A7%91%E5%AD%A6%E7%9A%84%E5%A4%A7%E9%97%A8%E5%89%8D%E2%80%A2%E5%85%B6%E4%B8%80">https://wiki.biligame.com/sr/%E5%9C%A8%E7%A7%91%E5%AD%A6%E7%9A%84%E5%A4%A7%E9%97%A8%E5%89%8D%E2%80%A2%E5%85%B6%E4%B8%80</a> (visited on 09/07/2026).

<span id="reference-2">[2]</span> Alessandro De Angelis. <em>Galileo Galilei’s “Two New Sciences”: For Modern Readers.</em> History of Physics. Cham: Springer International Publishing, 2021. ISBN: 978‑3‑030‑71951‑7 978‑3‑030‑71952‑4. DOI: 10.1007/978-3-030-71952-4. URL: <a href="https://link.springer.com/10.1007/978-3-030-71952-4">https://link.springer.com/10.1007/978-3-030-71952-4</a> (visited on 09/07/2026).

<span id="reference-3">[3]</span> William Bragg Ewald, ed. <em>From Kant to Hilbert: A Source Book in the Foundations of Mathematics.</em> 2 vols. Oxford: Clarendon Press, 1999. 1340 pp.

<span id="reference-4">[4]</span> Michael Hallett. <em>Cantorian Set Theory and Limitation of Size.</em> Reprint. Oxford Logic Guides 10. Oxford: Clarendon Pr, 1988. 343 pp. ISBN: 978‑0‑19‑853179‑1 978‑0‑19‑853283‑5.
