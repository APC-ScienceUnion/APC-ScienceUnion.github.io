---
layout: post
title: 'HyKGE: Knowledge-Graph-Enhanced RAG for Medical LLMs'
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
# Introducing HyKGE

![Paper title](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-001-36cd72f936.png)

> This article draws on “<a href="https://arxiv.org/abs/2312.15883">HyKGE: A Hypothesis Knowledge Graph Enhanced Framework for Accurate and Reliable Medical LLMs Responses</a>,” by Xinke Jiang, Ruizhe Zhang, Yongxin Xu, Rihong Qiu, and other researchers at Peking University's School of Computer Science.

HyKGE is a recent approach to combining **knowledge graphs** (KGs) with **retrieval-augmented generation** (RAG). It pairs the semantic understanding and generative abilities of **large language models** (LLMs) with the rich, structured information stored in knowledge graphs. The result can make medical-information retrieval more efficient while keeping answers accurate. This work opens another path for medical LLMs and offers useful lessons for applying large language models and knowledge graphs in a wider range of settings.

# RAG's Technical Challenges—and HyKGE's Answers

Traditional retrieval-augmented generation (RAG) has several major limitations:

- **A single level of retrieval granularity**
    - Systems usually retrieve whole documents or paragraphs, so the results are relatively coarse-grained;

- **Limited global semantic understanding**
    - Keyword-based matching misses deeper semantic relationships among documents;

- **No reasoning capability**
    - Document databases cannot handle complex queries and reasoning.

HyKGE tackles these problems by combining the complementary strengths of LLMs and KGs. Large language models bring broad general knowledge and powerful language-processing abilities, but their domain-specific knowledge may be inaccurate or unreliable. Knowledge graphs are structured and precise, but they cannot process natural language. HyKGE puts the two together. Using a specialized knowledge graph as its retrieval source, it supplies information at several levels of granularity: entities, relationships between entities, and reasoning paths.

# Core Features of the HyKGE Framework

HyKGE improves LLM performance by addressing several key technical challenges:

## **Incomplete User Queries**
HyKGE uses an LLM's zero-shot ability to generate hypothetical outputs (HOs), explore possible answers to a medical question, and improve graph retrieval. A named entity recognition model (NER) then locates the relevant information points, or anchors, in the KGs. This process filters out inaccurate entity relationships that HO analysis may introduce, preventing hallucinations and mistaken relationships from distorting the model's final answer.
![Figure 1.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-002-0640db393f.png)

## **Noise in Retrieved Knowledge**
Retrieved knowledge contains plenty of noise, and removing it means balancing relevance against diversity. HyKGE uses an HO-fragment reranking mechanism: it breaks the hypothetical output and user query into segments, removes low-density text, then reranks the knowledge. Noise is filtered out while relevant, diverse results remain.
![Figure 2.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-003-23f0c48341.png)

# The HyKGE Model

![Figure 4.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-004-c04ffb56e2.png)

HyKGE's central idea is to use an LLM's **zero-shot** ability and broad knowledge before retrieval to expand the possible directions explored in KGs. Carefully designed **prompts** then make the model's responses denser and more efficient. The framework contains four key components:

- **Hypothesis Output Module**
This module asks LLMs to generate hypothetical outputs that compensate for incomplete user queries.

- **Named Entity Recognition Module**
This module extracts medical entities from both the hypothetical output and the user's query.

- **Knowledge Graph Retrieval Module**
This module treats the extracted entities as anchors and searches the knowledge graph for reasoning chains.

- **HO Fragment Granularity-aware Rerank Module**
After retrieval, this module uses fragments of the hypothetical output and the user's query to rerank and filter the retrieved knowledge while balancing diversity and relevance.

# Experiments and Evaluation

- **Datasets**
The authors tested the framework on three Chinese medical question-answering datasets: MMCU-Medical, CMB-Exam, and CMB-Clin. Together, they cover single-choice, multiple-choice, and open-ended medical questions.

- **Knowledge Graphs**
The system combines open-source medical knowledge graphs including CMeKG, CPubMed-KG, and Disease-KG. These graphs contain entities and relationships covering diseases, drugs, symptoms, and diagnostic and treatment techniques. The merged knowledge graph (KG) contains 1,288,721 entities and 3,569,427 relationships.

- **Baseline Models**
The study used two general-purpose large models, GPT 3.5 and Baichuan 13B-Chat, as baselines.

- **Comparison Methods**
The comparison covered eight other models, including KGRAG, QE, CoN, CoK, KALMV, KG-GPT, and SuRe.

- **Evaluation Metrics**
The evaluation used Exact Match (EM), Partial Correct Rate (PCR), Artificial Correlation Judgement (ACJ), Perplexity (PPL), ROUGE-Recall (ROUGE-R), BLEU-4, and other metrics.

## Results

![Figure 5.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-005-bd19f65389.png)

The results show strong performance across several metrics. HyKGE outperforms both the baselines and other existing retrieval-augmented generation (RAG) methods, demonstrating clear gains in answer **accuracy** and **explainability**. Case studies show further advantages on complex medical questions: HyKGE can generate hypothetical answers, check them, correct possible errors, and ultimately provide comprehensive, in-depth responses.

The authors also measured computational overhead. HyKGE takes slightly longer than some methods, but its performance gains justify the extra cost. In short, more processing time buys higher-quality answers and a more reliable system. That tradeoff matters especially in medicine, where accurate, trustworthy information can mean the difference between life and death.

![Figure 6.png](/images/RAG%E7%9A%84%E6%9C%80%E6%96%B0%E6%96%B9%E6%A1%88%E2%80%94%E2%80%94HyKGE/fig-006-265bdf33ac.png)

# Practical Applications and Future Directions
HyKGE is a hypothesis knowledge graph–enhanced framework designed to make medical question answering by large language models (LLMs) more accurate and reliable. The authors tested it extensively with two LLM-turbo models on three different medical question-answering tasks. The results suggest that HyKGE both improves answer accuracy and reduces the uncertainty models may encounter on complex medical questions.

Despite these results, dynamically optimizing fragment granularity after retrieval remains an important direction for future research. Further progress could provide medical professionals and patients with more precise information services.
