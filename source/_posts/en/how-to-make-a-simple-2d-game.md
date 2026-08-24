---
layout: post
title: "How to Make a Simple 2D Game"
date: '2021-01-03 18:30:00'
lang: en
translation_key: "如何制造一个简单的2D游戏？"
translation_source_sha256: "a641f35cbe499db59855ba1df2a3e71c698fba0c6be243ffada7b778b885b132"
permalink: en/2021/01/03/how-to-make-a-simple-2d-game/
aside: true
comments: false
tags: []
categories: []
cover: '/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/cover-6f72d73f33.png'
copyright_author: '时光'
---

> Author: Shiguang
Reviewed by: Yuandao

# Preface

&emsp;&emsp;This article records some of my thinking and development work while I was building a simple 2D side-scrolling platformer for an assessment at my university's studio (yes, really). If game development interests you and you would like to become a developer, it may offer some useful pointers. If you already develop games, you are welcome to get in touch and compare notes :D!

# Choosing an engine

&emsp;&emsp;When you decide to make a game, the first consideration is the game engine. In other words: which engine should I use? Two mainstream choices are Unity and Unreal Engine 4 (UE4), each with its own strengths and weaknesses. Unity's 3D rendering, for example, is not as strong as UE4's, but Unity offers many plug-ins that can make development more efficient.

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-002-6b68f472cb.jpg" />

&emsp;&emsp;Because this article concerns a 2D game, I think Unity is the better choice. (The real reason is that my university studio required it for the assessment.) When you hear “Unity,” however, you may think first of a hit electronic track by TheFatRat rather than a game engine. Here are a few games made with Unity to make the name feel less unfamiliar.

&emsp;&emsp;Many excellent 2D games were developed in Unity, including *DEEMO*, *Plague Inc.*, *Hollow Knight*, *Gris*, *Ori and the Will of the Wisps*, and *Lobotomy Corporation*. Unity also suits relatively lightweight 3D games such as *Monument Valley*, *The Room*, *Outer Wilds*, *The Almost Gone*, and *Kerbal Space Program*.

&emsp;&emsp;(Every game just mentioned is great fun XD! Give them a try if any catch your interest.)

&emsp;&emsp;(*Arknights* was also made with Unity! An attempt to recruit another believer.)

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-003-992f028a75.png" />

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-004-7924b340dc.png" />

&emsp;&emsp;Once you have chosen an engine, what comes next? Download Unity from its official website, of course (obviously)! Unity is completely free to download and install. I recommend choosing “Download through Hub” (the green option in Figure 4). Unity Hub makes it easy to manage projects and licenses. If a project refuses to open, an expired license may be the reason; reactivate it manually. The Hub also lets you install several versions of Unity and switch among them. Bear in mind that some features from newer editor versions may not work in older ones.

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-005-eb48f60586.jpg" />

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-006-3d0ca4a7aa.png" />

&emsp;&emsp;After installing Unity, you will need another important program: Visual Studio (VS). VS is where you write the code, since a game's features have to be implemented through scripts. Unity scripts can be written in C# or JS; I recommend C# for reasons explained below. Anyone with some experience in Java can pick up C# fairly quickly because the two languages have similar syntax.

&emsp;&emsp;That completes the engine choice and basic setup. We can move on to development.

# Development process

&emsp;&emsp;A side-scrolling platformer needs two basic elements: a map system and a character-control system. From there, we can ask what else to add. The game might have a story and tense combat; the answer depends on what kind of game you want to make.

&emsp;&emsp;My broad plan was this: after speaking with several NPCs, the protagonist would buy a weapon from a shop and use it to defeat the game's final boss. (You may fairly complain that I have no imagination. What kind of plot is that...?) This plan called for dialogue, shop, item, and combat systems. Once the design established which features we needed, we could start writing code.

&emsp;&emsp;There are many ways to implement a feature, but we should try to choose the best one. Object-oriented programming is therefore important in game development. Items that fit into inventory slots, for example, share methods such as retrieving a name or a description of their use. We can define these common methods in an IItem interface. Use interfaces where practical and choose appropriate design patterns.

&emsp;&emsp;Next, you need an artist's help. If you cannot draw, Unity's Asset Store has many free resources. Still, it pays to stay on good terms with the talented artists around you. (Collapses.)

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-007-26f423df41.png" />

# Technical difficulties

&emsp;&emsp;Technical trouble is normal when writing code; there is a reason people say ten minutes of coding means two hours of debugging. What can you do when a script defeats you and no one is available to ask? Baidu can help, but it carries too many ads, and some methods I tested were poor. When I searched for a character-movement script, several examples had serious problems.

&emsp;&emsp;More importantly, most examples you find while searching online are written in C#. That is why I recommended C# rather than JS as the scripting language above.

&emsp;&emsp;Here is a better website to try, though you can also search Google directly:

- Stack Overflow: https://stackoverflow.com/

&emsp;&emsp;You can also look for answers on YouTube. A few good game-development channels are:

- Brackeys (covers a very wide range of topics)

- Blackthornprod (less material than the channel above, but all of it is practical)

- Code&nbsp;Monkey (plenty of material on C# programming)

&emsp;&emsp;Telegram has a fairly active Unity technical discussion group where you can ask any question. English only. Telegram link: t.me/unityThreeD

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-008-5c411657a1.png" />

&emsp;&emsp;For readers who cannot access sites outside mainland China:

- Bilibili — M_Studio:

- https://space.bilibili.com/370283072?from=search&seid=10106931170352874846

- Siki Academy:

- http://www.sikiedu.com/

- Official Unity Manual:

- https://docs.unity3d.com/cn/2018.4/Manual/index.html

- Official Unity scripting documentation:

- English: https://docs.unity3d.com/ScriptReference/

- Chinese: https://docs.unity3d.com/cn/2018.4/ScriptReference/index.html

- UnityList (many open-source projects):

- https://unitylist.com/

- Official C# documentation:

- https://docs.microsoft.com/zh-cn/dotnet/csharp/programming-guide/

<img src="/images/%E5%A6%82%E4%BD%95%E5%88%B6%E9%80%A0%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%842D%E6%B8%B8%E6%88%8F%EF%BC%9F/fig-009-62fdcab81d.png" />

