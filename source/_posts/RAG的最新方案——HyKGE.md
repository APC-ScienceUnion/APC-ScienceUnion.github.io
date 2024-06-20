---
layout: 知识图谱
title: RAG的最新方案——HyKGE
date: 2024-06-20 19:10:50
tags: ['计算机科学','知识图谱','大型语言模型','检索增强生成','LLM','KGs','RAG','投稿作品']
categories: '计算机科学'
copyright_author: 'Thinker'
cover: https://hips.hearstapps.com/hmg-prod/images/types-of-doctors-1600114658.jpg
---
# HyKGE框架简介

![论文标题](https://oss.suning.com/mbap/mbapbk/98f96338270d8fd429d38f7374d993d3.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884489&Signature=N03Z1P%2Bej0Yfj%2BBAFKlI%2B6P912o%3D)

> 本文基于由北京大学计算机学院Xinke Jiang、Ruizhe Zhang、Yongxin Xu、Rihong Qiu等作者共同撰写的论文《<a href="https://arxiv.org/abs/2312.15883">HyKGE: A Hypothesis Knowledge Graph Enhanced Framework for Accurate and Reliable Medical LLMs Responses</a>》。

HyKGE代表了**知识图谱**（KGs）与**检索增强生成**（RAG）技术结合的最新进展。通过利用**大型语言模型**（LLM）的深度语义理解与知识生成能力，结合知识图谱丰富的结构化信息，HyKGE能够显著提高医学信息检索的效率，并确保回答的精确度。这一突破性成果为医学LLMs的发展开辟了新的视野，同时也为未来在更广泛的应用场景中利用大型语言模型和知识图谱提供了宝贵的经验和启示。

# RAG面临的技术挑战与解决方案

在传统的检索增强生成（RAG）方法中，主要有如下不足：

- **检索粒度单一**
    - 文档检索通常基于整个文档或段落，检索粒度较粗；

- **全局语义理解能力有限**
    - 基于关键词的文档匹配忽略了文档间的深层语义关系；

- **缺乏推理能力**
    - 文档型数据库无法实现复杂查询与推理。

而面对这些问题，HyKGE框架则充分发挥了LLMs和KGs的互补优势。大型语言模型（LLMs）以其强大的通用知识和语言处理能力而闻名，但它们在特定领域的知识准确性和可靠性方面存在局限性。与此同时，知识图谱（KGs）以其结构化和准确性而受到重视，但它们缺乏处理自然语言的能力。HyKGE框架的提出，正是为了充分发挥LLMs和KGs的互补优势，以专业知识图谱作为检索数据源，提供包括实体信息、实体关系、推理路径在内的多粒度信息增益。

# HyKGE框架的核心特性

HyKGE框架通过以下几个关键技术挑战的解决方案，实现了对LLMs性能的显著提升：

## **用户查询的不完整性**
HyKGE利用LLMs的零样本能力，通过生成假设性回答（Hypothetical Outputs，HO）增强图谱检索，探索性回答医学知识，并利用命名实体识别模型（NER）在KGs中寻找精准定位关键信息点，即锚点。这一过程帮助我们筛选和剔除了那些由HO分析中可能产生的不准确实体关系，避免LLMs的幻觉现象和LLMs对实体关系的错误认知而影响大模型回答。
![图片1.png](https://oss.suning.com/mbap/mbapbk/716ff7714c4b6254c4a4060512ead680.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884542&Signature=DOIFnuQ3cAfQe1xLH%2BMdlGzk4xY%3D)

## **检索知识的噪声问题**
检索知识中含有大量噪声，过滤噪声时需要兼顾相关性和多样性。HyKGE采用HO片段重排名机制，通过分片假设性回答和用户问句，去除低密度文本，然后进行知识重排名，过滤噪声知识，保留相关且多样的检索知识。
![图片2.png](https://oss.suning.com/mbap/mbapbk/99314cda2acb18ebf1644b611bf24ae3.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884538&Signature=Te0g2QoE3l4Tq6M0g0hkxuhb9Vk%3D)

# HyKGE整体模型

![图片4.png](https://oss.suning.com/mbap/mbapbk/5ab39425a1d2feba74feccb344bfe872.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884563&Signature=l%2BAXn3yP04HAaXXYRMiBVYYx2cE%3D)

HyKGE框架的核心思想是在检索前阶段利用LLMs的**零样本**（zero-shot）能力和其丰富的知识来扩展KGs中的探索方向，并通过精心设计的**提示**（prompt）增强LLMs回答的密度和效率。具体来说，HyKGE包含以下几个关键组件：

- **假设输出模块**（Hypothesis Output Module）
该模块利用LLMs生成假设输出，以补偿用户查询的不完整性。

- **命名实体识别模块**（Named Entity Recognition Module）
该模块从假设输出和用户查询中提取医疗实体。

- **知识图谱检索模块**（Knowledge Graph Retrieval Module）
该模块使用提取的实体作为锚点，搜索知识图谱中的推理链。

- **HO片段粒度感知重排模块**（HO Fragment Granularity-aware Rerank Module）
在检索后阶段，通过使用假设输出的片段和用户查询来重排和过滤检索到的知识，以保持多样性和相关性的平衡。

# 实验与评估

- **数据集**
作者在三个中文医学问答数据集做了测试：MMCU-Medical、CMB-Exam和CMB-Clin，涵盖单选题、多选题和开放式医学问答。

- **知识图谱**
融合了CMeKG、CPubMed-KG和Disease-KG等开源医学知识图谱，包含疾病、药物、症状和诊断治疗技术的实体和关系，融合的知识图谱（KG）包含1,288,721个实体和3,569,427个关系。

- **基线模型**
选择了GPT 3.5和Baichuan 13B-Chat两种通用领域的大型模型作为基线模型。

- **对比方法**
与KGRAG、QE、CoN、CoK、KALMV、KG-GPT、SuRe等八种其他模型进行比较。

- **评估指标**
采用Exact Match (EM)、Partial Correct Rate (PCR)、Artificial Correlation Judgement (ACJ)、Perplexity (PPL)、ROUGE-Recall (ROUGE-R)和BLEU-4等指标进行评估。

## 实验结果

![图片5.png](https://oss.suning.com/mbap/mbapbk/91177030410565cad3807ad22a3e8cab.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884942&Signature=XXPZigd6l3u25U%2BpLhbNmnFwMWg%3D)

实验结果表明，HyKGE框架在多个评估指标上表现卓越，它不仅超越了基线模型，也优于现有的其他检索增强生成（RAG）方法。这一成就凸显了HyKGE在提供答案的**准确性**和**可解释性**方面的显著进步。通过案例研究，我们进一步观察到HyKGE在处理复杂医学问题时的一系列优势：它能够有效地生成假设性答案，对这些假设进行验证，纠正可能存在的错误，并最终提供全面且深入的回答。

除此之外，作者还分析了计算效率开销。尽管HyKGE在时间开销上略高于某些方法，但其性能提升证明了额外时间成本的合理性。换句话说，HyKGE所增加的处理时间，换来的是更高的答案质量和更强的系统可靠性，这对于医学领域来说尤其重要，因为在这一领域，准确和可信的信息可以带来生死攸关的差异。

![图片6.png](https://oss.suning.com/mbap/mbapbk/a5a582aae7e247de058bfdea9cc47b59.png?SDOSSAccessKeyId=42IA0GY51YZ1397N&Expires=1718884571&Signature=JYd3cn745sAtXRlAth9VilAe8nA%3D)

# 实际应用与未来展望
HyKGE框架是一个为大型语言模型（LLM）设计的假设知识图谱增强框架，旨在显著增强模型在医疗领域问答任务中的准确性和可靠性。通过在三个不同的医疗问答任务上使用两种LLM-turbo模型进行的广泛实验，作者验证了HyKGE框架的有效性。实验结果令人鼓舞，显示HyKGE不仅显著提升了回答的精确度，还有效减少了模型在处理复杂医疗问题时可能遇到的不确定性。

尽管HyKGE已经取得了显著的成果，但我们认识到，在未来的研究中，如何在检索后阶段动态优化片段粒度仍然是一个值得深入探索的方向。我们期待这一技术能够不断进步，为医疗专业人员和患者提供更加精准的信息服务。