---
layout: post
title: HyKGE—a New Framework for RAG
date: 2024-06-20 19:10:50
lang: en
translation_key: "RAG的最新方案——HyKGE"
translation_source_sha256: "664c8cd5a2e52ee800bd1fa357fc1c5ed3c189ea04f653f16cf780e5a147c365"
permalink: en/2024/06/20/hykge-a-new-rag-framework/
aside: true
comments: false
tags: []
categories: []
copyright_author: 'Thinker'
cover: /images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/cover-5901c3162e.jpg
---
# Introducing the HyKGE Framework

![Paper title](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-001-36cd72f936.png)

> This article is based on “<a href="https://arxiv.org/abs/2312.15883">HyKGE: A Hypothesis Knowledge Graph Enhanced Framework for Accurate and Reliable Medical LLMs Responses</a>,” a paper coauthored by Xinke Jiang, Ruizhe Zhang, Yongxin Xu, Rihong Qiu, and other researchers at Peking University's School of Computer Science.

HyKGE represents a recent advance in combining **knowledge graphs** (KGs) with **retrieval-augmented generation** (RAG). It draws on the deep semantic understanding and knowledge-generation capabilities of **large language models** (LLMs) while making use of the rich structured information in knowledge graphs. In this way, HyKGE can substantially improve the efficiency of medical-information retrieval while ensuring that its answers are accurate. This breakthrough opens up new possibilities for medical LLMs and offers valuable lessons for applying large language models and knowledge graphs to a wider range of use cases.

# Technical Challenges in RAG and HyKGE's Solutions

Traditional retrieval-augmented generation (RAG) has several main shortcomings:

- **A single level of retrieval granularity**
    - Documents are usually retrieved as whole documents or paragraphs, making retrieval relatively coarse-grained;

- **Limited global semantic understanding**
    - Keyword-based document matching overlooks deeper semantic relationships between documents;

- **No reasoning capability**
    - Document databases cannot perform complex queries and reasoning.

HyKGE addresses these problems by drawing on the complementary strengths of LLMs and KGs. Large language models (LLMs) are known for their extensive general knowledge and powerful language-processing abilities, but their domain-specific knowledge can be inaccurate or unreliable. Knowledge graphs (KGs), meanwhile, are valued for their structure and accuracy but cannot process natural language. HyKGE was designed to combine these complementary strengths. It uses a domain knowledge graph as its retrieval source, providing gains at multiple levels of granularity, including entity information, relationships between entities, and reasoning paths.

# Core Features of the HyKGE Framework

HyKGE significantly improves LLM performance by addressing several key technical challenges:

## **Incomplete User Queries**
HyKGE uses the zero-shot capabilities of LLMs to enhance graph retrieval by generating hypothetical outputs (HOs), provisionally answering medical questions, and applying a named entity recognition model (NER) to find the relevant key information points—anchors—in KGs. This process helps filter out inaccurate entity relationships that may arise in HO analysis, preventing LLM hallucinations and mistaken understandings of entity relationships from affecting the model's final answer.
![Figure 1.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-002-0640db393f.png)

## **Noise in Retrieved Knowledge**
Retrieved knowledge contains substantial noise, and filtering it requires a balance between relevance and diversity. HyKGE uses an HO-fragment reranking mechanism. It segments the hypothetical output and the user's question, removes low-density text, and then reranks the knowledge to filter out noise while retaining retrieved knowledge that is both relevant and diverse.
![Figure 2.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-003-23f0c48341.png)

# The Complete HyKGE Model

![Figure 4.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-004-c04ffb56e2.png)

The central idea behind HyKGE is to use the **zero-shot** capabilities and rich knowledge of LLMs during the pre-retrieval stage to broaden the directions explored in KGs. Carefully designed **prompts** then increase the density and efficiency of LLM answers. More specifically, HyKGE consists of the following key components:

- **Hypothesis Output Module**
This module uses LLMs to generate hypothetical outputs that compensate for incomplete user queries.

- **Named Entity Recognition Module**
This module extracts medical entities from the hypothetical output and the user's query.

- **Knowledge Graph Retrieval Module**
This module uses the extracted entities as anchors to search for reasoning chains in the knowledge graph.

- **HO Fragment Granularity-aware Rerank Module**
During the post-retrieval stage, this module uses fragments of the hypothetical output together with the user's query to rerank and filter the retrieved knowledge, balancing diversity against relevance.

# Experiments and Evaluation

- **Datasets**
The authors tested the framework on three Chinese medical question-answering datasets—MMCU-Medical, CMB-Exam, and CMB-Clin—which cover single-choice questions, multiple-choice questions, and open-ended medical questions.

- **Knowledge Graphs**
The system combines open-source medical knowledge graphs including CMeKG, CPubMed-KG, and Disease-KG. They contain entities and relationships for diseases, drugs, symptoms, and diagnostic and treatment techniques. The combined knowledge graph (KG) contains 1,288,721 entities and 3,569,427 relationships.

- **Baseline Models**
The study selected two general-purpose large models, GPT 3.5 and Baichuan 13B-Chat, as baselines.

- **Comparison Methods**
HyKGE was compared with eight other models, including KGRAG, QE, CoN, CoK, KALMV, KG-GPT, and SuRe.

- **Evaluation Metrics**
The study used metrics including Exact Match (EM), Partial Correct Rate (PCR), Artificial Correlation Judgement (ACJ), Perplexity (PPL), ROUGE-Recall (ROUGE-R), and BLEU-4.

## Results

![Figure 5.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-005-bd19f65389.png)

The results show that HyKGE performs strongly across multiple evaluation metrics, surpassing both the baseline models and other existing retrieval-augmented generation (RAG) methods. This performance highlights HyKGE's marked improvement in the **accuracy** and **explainability** of its answers. Case studies reveal further advantages when HyKGE handles complex medical questions: it can generate hypothetical answers effectively, verify those hypotheses, correct potential errors, and ultimately provide comprehensive, in-depth responses.

The authors also analyzed computational overhead. Although HyKGE takes slightly more time than some methods, its performance gains justify the additional cost. In other words, HyKGE trades extra processing time for higher-quality answers and a more reliable system. This matters especially in medicine, where accurate, trustworthy information can make a life-or-death difference.

![Figure 6.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-006-265bdf33ac.png)

# Practical Applications and Future Directions
HyKGE is a hypothesis knowledge graph–enhanced framework for large language models (LLMs), designed to improve the accuracy and reliability of question answering in medicine. The authors validated the framework through extensive experiments with two LLM-turbo models on three different medical question-answering tasks. The encouraging results show that HyKGE not only improves answer accuracy substantially but also reduces the uncertainty models may encounter when handling complex medical questions.

Despite HyKGE's strong results, dynamically optimizing fragment granularity during the post-retrieval stage remains an important direction for future research. We look forward to continued progress in this technology and to more precise information services for medical professionals and patients.
