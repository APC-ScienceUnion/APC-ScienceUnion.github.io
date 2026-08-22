"use strict";

(function attachScienceSoupCatalog(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceSoupCatalog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildScienceSoupCatalog() {
  const DOMAINS = [
    {
      id: "mathematics",
      label: "数学",
      icon: "∑",
      prompt: "这是一位数学家。",
      description: "从数学史人物出发，追问年代、国籍与研究方向。",
      suggestions: ["这位数学家生活在 20 世纪吗？", "这位数学家来自中国吗？", "这位数学家研究数论吗？"]
    },
    {
      id: "chemistry",
      label: "化学",
      icon: "⚗",
      prompt: "这是一种化学物质。",
      description: "判断组成、常温状态、酸碱性与常见性质。",
      suggestions: ["它在常温下是液体吗？", "它是一种化合物吗？", "它含有碳元素吗？"]
    },
    {
      id: "earth-science",
      label: "地球科学",
      icon: "◇",
      prompt: "这是一种矿物。",
      description: "从晶体、硬度、成分与磁性中锁定一种矿物。",
      suggestions: ["它是一种硅酸盐矿物吗？", "它具有磁性吗？", "它常被用作宝石吗？"]
    },
    {
      id: "biology",
      label: "生物",
      icon: "⌁",
      prompt: "这是一种生物。",
      description: "从分类、栖息环境和生理特征逐步排除。",
      suggestions: ["它是动物吗？", "它是脊椎动物吗？", "它能进行光合作用吗？"]
    },
    {
      id: "astronomy",
      label: "天文",
      icon: "✦",
      prompt: "这是一个天文对象。",
      description: "辨认恒星、行星、卫星、星系与深空天体。",
      suggestions: ["它位于太阳系内吗？", "它自身会发光吗？", "它是一颗行星吗？"]
    },
    {
      id: "computer-science",
      label: "计算机科学",
      icon: "⌘",
      prompt: "这是一位计算机科学相关人物。",
      description: "从早期计算、编程语言、网络与软件工程寻找答案。",
      suggestions: ["这是一位女性吗？", "这位人物仍然在世吗？", "这位人物与万维网有关吗？"]
    },
    {
      id: "physics",
      label: "物理",
      icon: "λ",
      prompt: "这是一位物理学家。",
      description: "追问年代、实验与理论贡献，辨认物理学史人物。",
      suggestions: ["这位物理学家生活在 19 世纪吗？", "这是一位女性吗？", "这位人物研究过电磁学吗？"]
    }
  ].map((domain) => Object.freeze({
    ...domain,
    suggestions: Object.freeze(domain.suggestions.slice())
  }));

  const domainMap = new Map(DOMAINS.map((domain) => [domain.id, domain]));

  return Object.freeze({
    DOMAINS: Object.freeze(DOMAINS),
    domainMap
  });
});
