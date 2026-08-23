---
layout: post
title: "Inside the September 27 Android Audio Prank App"
date: 2019-09-28 13:28:00
lang: en
translation_key: "「9.27 音频流氓软件」深度剖析"
translation_source_sha256: "56269cfffc65d33911c7397cdd8c19049953804d67e5d91a8c1fdd996c6f086a"
permalink: en/2019/09/28/september-27-android-prank-app-analysis/
aside: false
comments: false
tags: []
categories: []
copyright_author: '赖渊'
cover: /images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/cover-4b6da1b277.jpg
---

> Author: 赖渊

&emsp;&emsp;An Android app with the package name com.sgzh.dt, called “For the Best One,” recently spread wildly online. Universities across the country were said to have been hit, leaving victims distraught and miserable in what became known as the “September 27 app” incident. Online rumors even claimed that simply installing the app would leave harmful files behind after it was uninstalled, causing endless trouble.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-001-3ce25796e7.jpg" />

&emsp;&emsp;Could it really be that powerful? Did it have privileges even higher than TWRP??

&emsp;&emsp;In a spirit of scientific rigor, I tracked down this so-called “Sounds of Nature” APK to find out exactly what it did.

&emsp;&emsp;To understand how an APK works, we first have to remove its “outer clothing.” Only by examining its code can we make sense of its operating principles.

&emsp;&emsp;Developers of some malicious APKs try to stop others from stripping off this “clothing” by putting “armor” around the package—that is, by hardening or packing it. Removing the clothing from a protected APK is obviously not easy; the armor has to come off first. This process is generally called unpacking. I stripped away the application’s outer layer without difficulty, which made it clear that the APK had not been protected.

&emsp;&emsp;That made things easier. First, I looked at the resources packaged in the APK, such as images, video, and audio.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-002-be463aecec.jpg" />

&emsp;&emsp;High hopes met a meager reality: the APK contained only two images and a few words...

&emsp;&emsp;But in the APK’s /assets/ path, I found an audio file named 0.mp3!

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-003-3d05e38bfb.jpg" />

&emsp;&emsp;At last, something with actual content. Time to hear what was inside!

&emsp;&emsp;...

&emsp;&emsp;...

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/cover-4b6da1b277.jpg" />

&emsp;&emsp;Th-this was the legendary “chicken scream”?! Terrifying. By this point, I knew that the APK was up to no good...

&emsp;&emsp;Next, I examined AndroidManifest.xml, the manifest file required in every Android application project. It declares the software version, package name, component properties, permissions the application needs to access, and other information.

&emsp;&emsp;Let us see which permissions this app requested.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-004-f7596d8eaf.jpg" />

&emsp;&emsp;A search showed that the app obtained two highly sensitive permissions:

- android.permission.INTERNET: Full network access.
- android.permission.WRITE_EXTERNAL_STORAGE: Modify or delete the contents of your USB storage.
- In addition, one unknown permission was repeated an extraordinary number of times: android.permission.UNKNOWN.

&emsp;&emsp;From the permissions known so far, the app could write and read data and showed signs of network activity. With that direction in mind, it was time to inspect the dex file.

&emsp;&emsp;What is classes.dex? The dex format is an executable file format that Android can run directly on the Dalvik virtual machine. Dalvik is a virtual machine designed by Google for the Android platform.

&emsp;&emsp;In other words, when an APK is installed on Android, the system executes the code in its classes.dex file to perform the application’s various operations.

&emsp;&emsp;First things first: did the program try to loosen file read, write, or execute permissions? I looked for any execution of chmod 777.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-005-a0b989292e.jpg" />

&emsp;&emsp;There it was??? Still, it was not a major problem. After reading through the code, I saw no special action following the acquisition of that permission. Claims that problems would remain after uninstalling the app were impossible, and recommendations to reformat the device were even more absurd.

&emsp;&emsp;Further investigation revealed a local Java interface in a WebView (risk level ↑). To explain: Android’s WebView component has a special interface function named addJavascriptInterface, which enables interaction between local Java code and JavaScript. When targetSdkVersion is below 17, an attacker can use functions exposed through addJavascriptInterface to execute arbitrary code remotely.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-006-d444ff5eff.jpg" />

&emsp;&emsp;The next finding was dynamic DEX loading (risk level ↑). The APK used DexClassLoader to load external apk, jar, or dex files. If the source of an external file cannot be controlled, or if the file is tampered with, its safety cannot be guaranteed. Loading a malicious dex file can lead to arbitrary command execution.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-007-7788be195b.jpg" />

&emsp;&emsp;Further investigation found unzip decompression (risk level ↑). As the name suggests, this extracts zip files. The code obtained archived filenames with getName but did not validate them. An attacker could construct a malicious zip whose contents would be extracted into other directories and overwrite the corresponding files, leading to arbitrary code execution.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-008-d83e286477.jpg" />

&emsp;&emsp;I also found weak AES encryption (risk level ↑). The APK used the “AES/ECB/PKCS5padding” mode. ECB divides a file into blocks and applies the same encryption process to each one; once one is decrypted, the same decryption key can be used for the other encrypted blocks. By now I had dissected most of the APK’s classes.dex. These were roughly all of the risks, though whether the relevant code was ever called was another question.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-009-fbc2d2b518.jpg" />

&emsp;&emsp;As for the audio playback and rapid screenshots, I used unluac_2015_06_13.jar in Termux to decompile main.lua. The resulting code played 0.mp3 on a loop, turned the media volume up to maximum, and intercepted the Back button.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-010-9517b7e2dd.jpg" />

&emsp;&emsp;I reviewed the rapid-screenshot behavior but found no external connection endpoint. Uploading the screenshots seemed pointless. The online explanation that the behavior occupied the volume and power buttons, preventing users from lowering the volume or turning off the screen, sounded somewhat more plausible.

&emsp;&emsp;Still committed to finding the truth, and wanting to establish whether the APK generated any network traffic, I took the risk of installing it and opening it while capturing packets.

<img src="/images/%E3%80%8C9.27%20%E9%9F%B3%E9%A2%91%E6%B5%81%E6%B0%93%E8%BD%AF%E4%BB%B6%E3%80%8D%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/fig-011-36bd7b11b5.jpg" />

&emsp;&emsp;The result: the app produced no network activity at all, and no ROOT authorization prompt appeared. In testing, I found that pressing the Recent Apps button brought up the task switcher immediately. Closing the app in the background made it shut up!

&emsp;&emsp;In summary, the software did present some security risk, though probably a very small one, and was most likely intended as a prank. Most importantly...

&emsp;&emsp;...

&emsp;&emsp;...

&emsp;&emsp;...

&emsp;&emsp;Stop playing with your phone in class!!!!!
