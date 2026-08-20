"use strict";

(function attachScienceSoupCases(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceSoupCases = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildScienceSoupCases() {
  const DATASET_VERSION = 1;

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
  ];

  const TRAITS = [
    // 对象类别
    { id: "kind.person", group: "kind", statement: "是一位真实人物", patterns: ["真实人物", "真人", "一个人", "人类"] },
    { id: "kind.substance", group: "kind", statement: "是一种化学物质", patterns: ["化学物质", "物质"] },
    { id: "kind.mineral", group: "kind", statement: "是一种矿物", patterns: ["矿物"] },
    { id: "kind.organism", group: "kind", statement: "是一种生物", patterns: ["生物", "生命"] },
    { id: "kind.celestial", group: "kind", statement: "是一个天文对象", patterns: ["天文对象", "天体"] },

    // 人物与年代
    { id: "gender.female", group: "gender", statement: "是一位女性", patterns: ["女性", "女人", "女科学家", "女的"] },
    { id: "gender.male", group: "gender", statement: "是一位男性", patterns: ["男性", "男人", "男科学家", "男的"] },
    { id: "life.living", group: "life", statement: "目前仍然在世", patterns: ["仍然在世", "还在世", "健在", "活着"] },
    { id: "life.deceased", group: "life", statement: "已经去世", patterns: ["已经去世", "去世了", "已故", "逝世"] },
    { id: "era.17", group: "era", statement: "生活于 17 世纪", patterns: ["17世纪", "十七世纪"] },
    { id: "era.18", group: "era", statement: "生活于 18 世纪", patterns: ["18世纪", "十八世纪"] },
    { id: "era.19", group: "era", statement: "生活于 19 世纪", patterns: ["19世纪", "十九世纪"] },
    { id: "era.20", group: "era", statement: "生活于 20 世纪", patterns: ["20世纪", "二十世纪"] },
    { id: "era.21", group: "era", statement: "生活于 21 世纪", patterns: ["21世纪", "二十一世纪"] },

    // 国籍或主要身份来源（允许一人拥有多个）
    { id: "country.china", group: "country", statement: "来自中国", patterns: ["中国人", "来自中国", "中国籍", "华人"] },
    { id: "country.switzerland", group: "country", statement: "来自瑞士", patterns: ["瑞士人", "来自瑞士", "瑞士籍"] },
    { id: "country.germany", group: "country", statement: "来自德国", patterns: ["德国人", "来自德国", "德国籍"] },
    { id: "country.india", group: "country", statement: "来自印度", patterns: ["印度人", "来自印度", "印度籍"] },
    { id: "country.iran", group: "country", statement: "来自伊朗", patterns: ["伊朗人", "来自伊朗", "伊朗籍"] },
    { id: "country.uk", group: "country", statement: "来自英国", patterns: ["英国人", "来自英国", "英国籍", "苏格兰人", "英格兰人"] },
    { id: "country.usa", group: "country", statement: "来自美国", patterns: ["美国人", "来自美国", "美国籍"] },
    { id: "country.france", group: "country", statement: "来自法国", patterns: ["法国人", "来自法国", "法国籍"] },
    { id: "country.poland", group: "country", statement: "来自波兰", patterns: ["波兰人", "来自波兰", "波兰籍"] },
    { id: "country.hungary", group: "country", statement: "来自匈牙利", patterns: ["匈牙利人", "来自匈牙利", "匈牙利籍"] },

    // 学科身份与贡献
    { id: "role.mathematician", group: "role", statement: "是一位数学家", patterns: ["数学家", "研究数学"] },
    { id: "role.physicist", group: "role", statement: "是一位物理学家", patterns: ["物理学家", "研究物理"] },
    { id: "role.chemist", group: "role", statement: "是一位化学家", patterns: ["化学家", "研究化学"] },
    { id: "role.computerScientist", group: "role", statement: "是一位计算机科学家", patterns: ["计算机科学家", "电脑科学家", "研究计算机"] },
    { id: "math.numberTheory", group: "mathField", statement: "研究过数论", patterns: ["数论", "素数"] },
    { id: "math.analysis", group: "mathField", statement: "研究过数学分析", patterns: ["数学分析", "分析学"] },
    { id: "math.geometry", group: "mathField", statement: "研究过几何学", patterns: ["几何学", "几何"] },
    { id: "math.algebra", group: "mathField", statement: "研究过代数学", patterns: ["代数学", "抽象代数", "代数"] },
    { id: "math.graphTheory", group: "mathField", statement: "与图论的发展有关", patterns: ["图论", "柯尼斯堡七桥"] },
    { id: "math.calculus", group: "mathField", statement: "与微积分的发展有关", patterns: ["微积分", "无穷小"] },
    { id: "math.probability", group: "mathField", statement: "研究过概率论", patterns: ["概率论", "概率"] },
    { id: "physics.mechanics", group: "physicsField", statement: "研究过经典力学", patterns: ["经典力学", "力学"] },
    { id: "physics.gravity", group: "physicsField", statement: "研究过引力", patterns: ["万有引力", "引力", "重力"] },
    { id: "physics.optics", group: "physicsField", statement: "研究过光学", patterns: ["光学", "光的性质"] },
    { id: "physics.relativity", group: "physicsField", statement: "提出或发展了相对论", patterns: ["相对论", "质能方程", "e=mc2"] },
    { id: "physics.electromagnetism", group: "physicsField", statement: "研究过电磁学", patterns: ["电磁学", "电磁感应", "电磁场"] },
    { id: "physics.radioactivity", group: "physicsField", statement: "研究过放射性", patterns: ["放射性", "镭", "钋"] },
    { id: "physics.quantum", group: "physicsField", statement: "对量子理论有重要贡献", patterns: ["量子理论", "量子物理", "光电效应"] },
    { id: "physics.nuclear", group: "physicsField", statement: "研究过核物理", patterns: ["核物理", "原子核", "弱相互作用"] },
    { id: "computer.algorithm", group: "computerField", statement: "与早期算法或程序设计有关", patterns: ["算法", "程序设计", "第一个程序"] },
    { id: "computer.cryptography", group: "computerField", statement: "与密码分析有关", patterns: ["密码分析", "密码学", "破译密码", "恩尼格玛"] },
    { id: "computer.ai", group: "computerField", statement: "与人工智能思想有关", patterns: ["人工智能", "图灵测试", "机器智能"] },
    { id: "computer.compiler", group: "computerField", statement: "与编译器或高级语言有关", patterns: ["编译器", "高级语言", "cobol"] },
    { id: "computer.architecture", group: "computerField", statement: "与存储程序计算机体系结构有关", patterns: ["冯诺依曼结构", "存储程序", "计算机体系结构"] },
    { id: "computer.web", group: "computerField", statement: "与万维网的发明有关", patterns: ["万维网", "worldwideweb", "www", "网页"] },
    { id: "computer.softwareEngineering", group: "computerField", statement: "与软件工程有关", patterns: ["软件工程", "阿波罗程序", "登月软件"] },

    // 化学物质
    { id: "chem.elemental", group: "chemClass", statement: "是一种单质", patterns: ["单质", "元素物质", "化学元素"] },
    { id: "chem.compound", group: "chemClass", statement: "是一种化合物", patterns: ["化合物"] },
    { id: "chem.organic", group: "organicClass", statement: "属于有机物", patterns: ["有机物", "有机化合物"] },
    { id: "chem.inorganic", group: "organicClass", statement: "属于无机物", patterns: ["无机物", "无机化合物"] },
    { id: "chem.solid", group: "matterState", statement: "常温下是固体", patterns: ["常温下是固体", "常温固体", "固态", "固体"] },
    { id: "chem.liquid", group: "matterState", statement: "常温下是液体", patterns: ["常温下是液体", "常温液体", "液态", "液体"] },
    { id: "chem.gas", group: "matterState", statement: "常温下是气体", patterns: ["常温下是气体", "常温气体", "气态", "气体"] },
    { id: "chem.flammable", group: "flammability", statement: "容易燃烧", patterns: ["容易燃烧", "可燃", "易燃"] },
    { id: "chem.nonflammable", group: "flammability", statement: "通常不可燃", patterns: ["不可燃", "不燃烧", "难燃"] },
    { id: "chem.acid", group: "acidBase", statement: "呈酸性", patterns: ["强酸", "酸性", "酸"] },
    { id: "chem.base", group: "acidBase", statement: "呈碱性", patterns: ["碱性", "碱"] },
    { id: "chem.neutral", group: "acidBase", statement: "接近中性", patterns: ["中性", "酸碱中性"] },
    { id: "chem.colorless", group: "chemColor", statement: "通常无色", patterns: ["无色", "没有颜色"] },
    { id: "chem.white", group: "chemColor", statement: "常见外观为白色", patterns: ["白色", "白的"] },
    { id: "chem.corrosive", group: "corrosive", statement: "具有明显腐蚀性", patterns: ["腐蚀性", "腐蚀"] },
    { id: "chem.noncorrosive", group: "corrosive", statement: "通常不具有明显腐蚀性", patterns: ["没有腐蚀性", "不腐蚀"] },
    { id: "chem.toxic", group: "toxicity", statement: "具有明显毒性", patterns: ["有毒", "毒性强", "剧毒"] },
    { id: "chem.lowToxicity", group: "toxicity", statement: "通常不被归为有毒物质", patterns: ["无毒", "低毒", "毒性低"] },
    { id: "chem.containsCarbon", group: "composition", statement: "含有碳元素", patterns: ["含碳", "碳元素", "有碳"] },
    { id: "chem.containsOxygen", group: "composition", statement: "含有氧元素", patterns: ["含氧", "氧元素", "有氧"] },
    { id: "chem.containsHydrogen", group: "composition", statement: "含有氢元素", patterns: ["含氢", "氢元素", "有氢"] },
    { id: "chem.containsSodium", group: "composition", statement: "含有钠元素", patterns: ["含钠", "钠元素", "有钠"] },
    { id: "chem.containsChlorine", group: "composition", statement: "含有氯元素", patterns: ["含氯", "氯元素", "有氯"] },
    { id: "chem.containsSulfur", group: "composition", statement: "含有硫元素", patterns: ["含硫", "硫元素", "有硫"] },
    { id: "chem.foodUse", group: "use", statement: "与食品或饮品有常见联系", patterns: ["食品", "食物", "饮品", "可以吃", "可以喝", "调味"] },

    // 矿物
    { id: "mineral.silicate", group: "mineralClass", statement: "属于硅酸盐类矿物", patterns: ["硅酸盐"] },
    { id: "mineral.carbonate", group: "mineralClass", statement: "属于碳酸盐类矿物", patterns: ["碳酸盐"] },
    { id: "mineral.oxide", group: "mineralClass", statement: "属于氧化物类矿物", patterns: ["氧化物矿物", "氧化物"] },
    { id: "mineral.halide", group: "mineralClass", statement: "属于卤化物类矿物", patterns: ["卤化物"] },
    { id: "mineral.sulfate", group: "mineralClass", statement: "属于硫酸盐类矿物", patterns: ["硫酸盐"] },
    { id: "mineral.native", group: "mineralClass", statement: "属于自然元素矿物", patterns: ["自然元素矿物", "自然元素"] },
    { id: "mineral.veryHard", group: "hardness", statement: "硬度很高", patterns: ["硬度很高", "非常硬", "莫氏硬度10", "最硬"] },
    { id: "mineral.hard", group: "hardness", statement: "硬度较高", patterns: ["硬度较高", "比较硬", "莫氏硬度7"] },
    { id: "mineral.soft", group: "hardness", statement: "硬度较低", patterns: ["硬度较低", "很软", "比较软", "莫氏硬度2", "莫氏硬度3"] },
    { id: "mineral.magnetic", group: "magnetism", statement: "具有明显磁性", patterns: ["有磁性", "磁性", "能被磁铁吸引"] },
    { id: "mineral.nonmagnetic", group: "magnetism", statement: "通常没有明显磁性", patterns: ["没有磁性", "无磁性"] },
    { id: "mineral.gem", group: "gemUse", statement: "常被用作宝石", patterns: ["用作宝石", "宝石", "珠宝"] },
    { id: "mineral.notGem", group: "gemUse", statement: "通常不作为宝石使用", patterns: ["不用作宝石", "不是宝石"] },
    { id: "mineral.acidReaction", group: "acidReaction", statement: "遇稀酸会明显起泡", patterns: ["遇酸起泡", "盐酸起泡", "和酸反应", "酸反应"] },
    { id: "mineral.waterSoluble", group: "solubility", statement: "容易溶于水", patterns: ["溶于水", "水溶性", "容易溶解"] },
    { id: "mineral.containsIron", group: "mineralComposition", statement: "含有铁元素", patterns: ["含铁", "铁元素"] },
    { id: "mineral.containsSilicon", group: "mineralComposition", statement: "含有硅元素", patterns: ["含硅", "硅元素"] },
    { id: "mineral.containsCarbon", group: "mineralComposition", statement: "含有碳元素", patterns: ["含碳", "碳元素"] },
    { id: "mineral.containsCalcium", group: "mineralComposition", statement: "含有钙元素", patterns: ["含钙", "钙元素"] },

    // 生物
    { id: "bio.animal", group: "bioKingdom", statement: "属于动物", patterns: ["动物"] },
    { id: "bio.plant", group: "bioKingdom", statement: "属于植物", patterns: ["植物"] },
    { id: "bio.bacterium", group: "bioKingdom", statement: "属于细菌", patterns: ["细菌", "原核生物"] },
    { id: "bio.mammal", group: "bioClass", statement: "属于哺乳动物", patterns: ["哺乳动物", "哺乳类"] },
    { id: "bio.insect", group: "bioClass", statement: "属于昆虫", patterns: ["昆虫"] },
    { id: "bio.vertebrate", group: "vertebrate", statement: "是脊椎动物", patterns: ["脊椎动物", "有脊椎"] },
    { id: "bio.invertebrate", group: "vertebrate", statement: "是无脊椎动物", patterns: ["无脊椎动物", "没有脊椎"] },
    { id: "bio.aquatic", group: "habitat", statement: "主要生活在水中", patterns: ["生活在水中", "水生", "海洋生物"] },
    { id: "bio.terrestrial", group: "habitat", statement: "主要生活在陆地环境", patterns: ["生活在陆地", "陆生", "陆地生物"] },
    { id: "bio.canFly", group: "flight", statement: "能够主动飞行", patterns: ["会飞", "能飞", "飞行"] },
    { id: "bio.cannotFly", group: "flight", statement: "不能主动飞行", patterns: ["不会飞", "不能飞"] },
    { id: "bio.photosynthesis", group: "photosynthesis", statement: "能够进行光合作用", patterns: ["光合作用"] },
    { id: "bio.noPhotosynthesis", group: "photosynthesis", statement: "不能进行光合作用", patterns: ["不能光合作用", "不会光合作用"] },
    { id: "bio.microscopic", group: "sizeClass", statement: "通常需要显微镜才能清楚观察", patterns: ["微生物", "显微镜", "肉眼看不见", "微小"] },
    { id: "bio.macroscopic", group: "sizeClass", statement: "通常可用肉眼直接观察", patterns: ["肉眼可见", "看得见"] },
    { id: "bio.endangered", group: "conservation", statement: "面临较高灭绝风险", patterns: ["濒危", "灭绝风险", "保护动物"] },
    { id: "bio.notEndangered", group: "conservation", statement: "目前不属于受威胁物种", patterns: ["不濒危", "没有灭绝风险"] },
    { id: "bio.pollinator", group: "ecology", statement: "是重要的传粉者", patterns: ["传粉", "授粉"] },
    { id: "bio.singleCell", group: "cellularity", statement: "是单细胞生物", patterns: ["单细胞"] },
    { id: "bio.multicellular", group: "cellularity", statement: "是多细胞生物", patterns: ["多细胞"] },

    // 天文
    { id: "astro.star", group: "astroType", statement: "是一颗恒星", patterns: ["恒星", "星星"] },
    { id: "astro.planet", group: "astroType", statement: "是一颗行星", patterns: ["行星"] },
    { id: "astro.moon", group: "astroType", statement: "是一颗天然卫星", patterns: ["天然卫星", "卫星"] },
    { id: "astro.galaxy", group: "astroType", statement: "是一个星系", patterns: ["星系"] },
    { id: "astro.nebula", group: "astroType", statement: "是一个星云", patterns: ["星云"] },
    { id: "astro.solarSystem", group: "astroLocation", statement: "位于太阳系内", patterns: ["太阳系内", "在太阳系", "属于太阳系"] },
    { id: "astro.outsideSolarSystem", group: "astroLocation", statement: "位于太阳系外", patterns: ["太阳系外", "不在太阳系"] },
    { id: "astro.emitsLight", group: "lightSource", statement: "自身会产生可见光", patterns: ["自身发光", "自己发光", "会发光", "光源"] },
    { id: "astro.reflectsLight", group: "lightSource", statement: "主要依靠反射光被看见", patterns: ["反射太阳光", "反射光", "不会自己发光"] },
    { id: "astro.rocky", group: "astroComposition", statement: "属于岩石质天体", patterns: ["岩石质", "岩石行星", "类地"] },
    { id: "astro.gasGiant", group: "astroComposition", statement: "属于气态巨行星", patterns: ["气态巨行星", "气体行星", "气态行星"] },
    { id: "astro.hasAtmosphere", group: "atmosphere", statement: "具有大气层", patterns: ["有大气层", "具有大气", "大气层"] },
    { id: "astro.noThickAtmosphere", group: "atmosphere", statement: "没有浓厚大气层", patterns: ["没有大气层", "无大气层", "没有浓厚大气"] },
    { id: "astro.hasRings", group: "rings", statement: "具有行星环", patterns: ["有行星环", "有光环", "有环"] },
    { id: "astro.noRings", group: "rings", statement: "没有行星环", patterns: ["没有行星环", "没有环"] },
    { id: "astro.nakedEye", group: "visibility", statement: "在适当条件下可用肉眼看见", patterns: ["肉眼可见", "用肉眼", "不用望远镜"] },
    { id: "astro.telescope", group: "visibility", statement: "通常需要望远镜才能清楚观测", patterns: ["需要望远镜", "望远镜才能"] },
    { id: "astro.orbitsSun", group: "orbit", statement: "绕太阳运行", patterns: ["绕太阳", "围绕太阳", "公转太阳"] },
    { id: "astro.orbitsPlanet", group: "orbit", statement: "绕一颗行星运行", patterns: ["绕行星", "围绕行星", "绕地球"] }
  ];

  const COMMON_PERSON_GROUPS = ["kind", "gender", "life", "country", "era"];
  const COMMON_CHEM_GROUPS = ["kind", "chemClass", "organicClass", "matterState", "flammability", "acidBase", "chemColor", "corrosive", "toxicity"];
  const COMMON_MINERAL_GROUPS = ["kind", "mineralClass", "hardness", "magnetism", "gemUse", "acidReaction", "solubility"];
  const COMMON_BIO_GROUPS = ["kind", "bioKingdom", "bioClass", "vertebrate", "habitat", "flight", "photosynthesis", "sizeClass", "conservation", "cellularity"];
  const COMMON_ASTRO_GROUPS = ["kind", "astroType", "astroLocation", "lightSource", "astroComposition", "atmosphere", "rings", "visibility", "orbit"];

  function makeCase(id, domainId, name, aliases, yes, reveal, groups, no) {
    return Object.freeze({
      id,
      domainId,
      name,
      aliases: Object.freeze([name].concat(aliases || [])),
      yes: Object.freeze(yes || []),
      no: Object.freeze(no || []),
      closedGroups: Object.freeze(groups || []),
      reveal
    });
  }

  const CASES = [
    // 数学
    makeCase("math-euler", "mathematics", "莱昂哈德·欧拉", ["欧拉", "leonhardeuler", "euler"],
      ["kind.person", "role.mathematician", "gender.male", "life.deceased", "country.switzerland", "era.18", "math.numberTheory", "math.analysis", "math.graphTheory", "math.calculus"],
      "欧拉是 18 世纪瑞士数学家，在分析、数论、图论等多个领域留下了奠基性成果。", COMMON_PERSON_GROUPS),
    makeCase("math-gauss", "mathematics", "卡尔·弗里德里希·高斯", ["高斯", "卡尔高斯", "carlfriedrichgauss", "gauss"],
      ["kind.person", "role.mathematician", "gender.male", "life.deceased", "country.germany", "era.18", "era.19", "math.numberTheory", "math.geometry"],
      "高斯是德国数学家，成果横跨数论、几何、统计与物理测量。", COMMON_PERSON_GROUPS),
    makeCase("math-noether", "mathematics", "埃米·诺特", ["艾米诺特", "诺特", "emmynoether", "noether"],
      ["kind.person", "role.mathematician", "gender.female", "life.deceased", "country.germany", "era.19", "era.20", "math.algebra"],
      "埃米·诺特是德国数学家，对抽象代数和理论物理产生了深远影响。", COMMON_PERSON_GROUPS),
    makeCase("math-ramanujan", "mathematics", "斯里尼瓦瑟·拉马努金", ["拉马努金", "srinivasaramanujan", "ramanujan"],
      ["kind.person", "role.mathematician", "gender.male", "life.deceased", "country.india", "era.19", "era.20", "math.numberTheory", "math.analysis"],
      "拉马努金是印度数学家，以数论、无穷级数和连分数方面的惊人成果闻名。", COMMON_PERSON_GROUPS),
    makeCase("math-chen-jingrun", "mathematics", "陈景润", ["chenjingrun"],
      ["kind.person", "role.mathematician", "gender.male", "life.deceased", "country.china", "era.20", "math.numberTheory"],
      "陈景润是中国数学家，在解析数论和哥德巴赫猜想研究中取得重要成果。", COMMON_PERSON_GROUPS),
    makeCase("math-mirzakhani", "mathematics", "玛丽安·米尔扎哈尼", ["米尔扎哈尼", "maryammirzakhani", "mirzakhani"],
      ["kind.person", "role.mathematician", "gender.female", "life.deceased", "country.iran", "era.20", "era.21", "math.geometry"],
      "米尔扎哈尼是伊朗数学家，也是首位获得菲尔兹奖的女性。", COMMON_PERSON_GROUPS),

    // 化学
    makeCase("chem-water", "chemistry", "水", ["h2o", "一氧化二氢"],
      ["kind.substance", "chem.compound", "chem.inorganic", "chem.liquid", "chem.nonflammable", "chem.neutral", "chem.colorless", "chem.noncorrosive", "chem.lowToxicity", "chem.containsHydrogen", "chem.containsOxygen", "chem.foodUse"],
      "水的化学式为 H₂O，纯水在常温下是无色液体，并接近中性。", COMMON_CHEM_GROUPS),
    makeCase("chem-oxygen", "chemistry", "氧气", ["氧", "o2", "分子氧"],
      ["kind.substance", "chem.elemental", "chem.inorganic", "chem.gas", "chem.nonflammable", "chem.colorless", "chem.noncorrosive", "chem.containsOxygen"],
      "氧气是由氧元素组成的单质，常温下为无色气体；它助燃，但自身通常不被称为可燃物。", COMMON_CHEM_GROUPS),
    makeCase("chem-carbon-dioxide", "chemistry", "二氧化碳", ["co2", "碳酸气"],
      ["kind.substance", "chem.compound", "chem.inorganic", "chem.gas", "chem.nonflammable", "chem.colorless", "chem.noncorrosive", "chem.containsCarbon", "chem.containsOxygen"],
      "二氧化碳是常温下无色的无机化合物，由碳和氧两种元素组成。", COMMON_CHEM_GROUPS),
    makeCase("chem-sodium-chloride", "chemistry", "氯化钠", ["食盐", "nacl", "盐"],
      ["kind.substance", "chem.compound", "chem.inorganic", "chem.solid", "chem.nonflammable", "chem.neutral", "chem.white", "chem.noncorrosive", "chem.lowToxicity", "chem.containsSodium", "chem.containsChlorine", "chem.foodUse"],
      "氯化钠是由钠离子和氯离子构成的离子化合物，也是食盐的主要成分。", COMMON_CHEM_GROUPS),
    makeCase("chem-sulfuric-acid", "chemistry", "硫酸", ["h2so4"],
      ["kind.substance", "chem.compound", "chem.inorganic", "chem.liquid", "chem.nonflammable", "chem.acid", "chem.colorless", "chem.corrosive", "chem.containsHydrogen", "chem.containsSulfur", "chem.containsOxygen"],
      "硫酸是一种强酸，纯品通常为无色油状液体，并具有很强的腐蚀性。", COMMON_CHEM_GROUPS),
    makeCase("chem-ethanol", "chemistry", "乙醇", ["酒精", "c2h5oh", "ethylalcohol", "alcohol"],
      ["kind.substance", "chem.compound", "chem.organic", "chem.liquid", "chem.flammable", "chem.neutral", "chem.colorless", "chem.noncorrosive", "chem.toxic", "chem.containsCarbon", "chem.containsHydrogen", "chem.containsOxygen", "chem.foodUse"],
      "乙醇是无色、易燃的有机化合物，是酒精饮品中的主要醇类；摄入过量具有毒性。", COMMON_CHEM_GROUPS),

    // 地球科学 / 矿物
    makeCase("mineral-quartz", "earth-science", "石英", ["quartz", "二氧化硅晶体"],
      ["kind.mineral", "mineral.silicate", "mineral.hard", "mineral.nonmagnetic", "mineral.gem", "mineral.containsSilicon"],
      "石英主要成分为二氧化硅，莫氏硬度为 7，许多透明或有色品种可作宝石。", COMMON_MINERAL_GROUPS),
    makeCase("mineral-diamond", "earth-science", "金刚石", ["钻石", "diamond"],
      ["kind.mineral", "mineral.native", "mineral.veryHard", "mineral.nonmagnetic", "mineral.gem", "mineral.containsCarbon"],
      "金刚石由碳元素构成，莫氏硬度为 10，是天然物质中硬度最高的矿物。", COMMON_MINERAL_GROUPS),
    makeCase("mineral-calcite", "earth-science", "方解石", ["calcite", "碳酸钙矿物"],
      ["kind.mineral", "mineral.carbonate", "mineral.soft", "mineral.nonmagnetic", "mineral.notGem", "mineral.acidReaction", "mineral.containsCarbon", "mineral.containsCalcium"],
      "方解石的主要成分是碳酸钙，莫氏硬度约为 3，遇稀盐酸会明显起泡。", COMMON_MINERAL_GROUPS),
    makeCase("mineral-magnetite", "earth-science", "磁铁矿", ["magnetite", "四氧化三铁矿物"],
      ["kind.mineral", "mineral.oxide", "mineral.magnetic", "mineral.notGem", "mineral.containsIron"],
      "磁铁矿是重要的铁氧化物矿物，通常呈黑色并具有显著磁性。", COMMON_MINERAL_GROUPS),
    makeCase("mineral-halite", "earth-science", "岩盐", ["石盐", "halite", "天然氯化钠"],
      ["kind.mineral", "mineral.halide", "mineral.soft", "mineral.nonmagnetic", "mineral.notGem", "mineral.waterSoluble"],
      "岩盐是天然产出的氯化钠矿物，硬度较低并容易溶于水。", COMMON_MINERAL_GROUPS),
    makeCase("mineral-gypsum", "earth-science", "石膏", ["gypsum", "二水硫酸钙"],
      ["kind.mineral", "mineral.sulfate", "mineral.soft", "mineral.nonmagnetic", "mineral.notGem", "mineral.containsCalcium"],
      "石膏是含水硫酸钙矿物，莫氏硬度约为 2，可以被指甲刻划。", COMMON_MINERAL_GROUPS),

    // 生物
    makeCase("bio-panda", "biology", "大熊猫", ["熊猫", "giantpanda", "panda"],
      ["kind.organism", "bio.animal", "bio.mammal", "bio.vertebrate", "bio.terrestrial", "bio.cannotFly", "bio.noPhotosynthesis", "bio.macroscopic", "bio.endangered", "bio.multicellular"],
      "大熊猫是中国特有的哺乳动物，以竹子为主要食物，保护等级受到持续关注。", COMMON_BIO_GROUPS),
    makeCase("bio-blue-whale", "biology", "蓝鲸", ["bluewhale"],
      ["kind.organism", "bio.animal", "bio.mammal", "bio.vertebrate", "bio.aquatic", "bio.cannotFly", "bio.noPhotosynthesis", "bio.macroscopic", "bio.endangered", "bio.multicellular"],
      "蓝鲸是生活在海洋中的哺乳动物，也是现存体型最大的动物。", COMMON_BIO_GROUPS),
    makeCase("bio-ginkgo", "biology", "银杏", ["ginkgo", "白果树"],
      ["kind.organism", "bio.plant", "bio.terrestrial", "bio.cannotFly", "bio.photosynthesis", "bio.macroscopic", "bio.endangered", "bio.multicellular"],
      "银杏是裸子植物中的古老类群，虽然现被广泛栽培，但野生种群仍被列为濒危。", COMMON_BIO_GROUPS),
    makeCase("bio-ecoli", "biology", "大肠杆菌", ["大肠埃希菌", "escherichiacoli", "ecoli", "e.coli"],
      ["kind.organism", "bio.bacterium", "bio.noPhotosynthesis", "bio.microscopic", "bio.singleCell"],
      "大肠杆菌是一种单细胞细菌，许多菌株是人和其他温血动物肠道菌群的一部分。", COMMON_BIO_GROUPS.filter((group) => group !== "conservation")),
    makeCase("bio-honeybee", "biology", "蜜蜂", ["honeybee", "家蜂"],
      ["kind.organism", "bio.animal", "bio.insect", "bio.invertebrate", "bio.terrestrial", "bio.canFly", "bio.noPhotosynthesis", "bio.macroscopic", "bio.pollinator", "bio.multicellular"],
      "蜜蜂是能够飞行的社会性昆虫，也是许多开花植物的重要传粉者。", COMMON_BIO_GROUPS.filter((group) => group !== "conservation")),
    makeCase("bio-tardigrade", "biology", "缓步动物", ["水熊虫", "tardigrade", "水熊"],
      ["kind.organism", "bio.animal", "bio.invertebrate", "bio.aquatic", "bio.cannotFly", "bio.noPhotosynthesis", "bio.microscopic", "bio.multicellular"],
      "缓步动物俗称水熊虫，是微小的无脊椎动物，常生活在水膜或潮湿环境中。", COMMON_BIO_GROUPS.filter((group) => group !== "conservation")),

    // 天文
    makeCase("astro-sun", "astronomy", "太阳", ["sun"],
      ["kind.celestial", "astro.star", "astro.solarSystem", "astro.emitsLight", "astro.hasAtmosphere", "astro.nakedEye"],
      "太阳是太阳系中心的恒星，能量主要来自核心的核聚变。", COMMON_ASTRO_GROUPS),
    makeCase("astro-moon", "astronomy", "月球", ["月亮", "moon", "地球的卫星"],
      ["kind.celestial", "astro.moon", "astro.solarSystem", "astro.reflectsLight", "astro.rocky", "astro.noThickAtmosphere", "astro.noRings", "astro.nakedEye", "astro.orbitsPlanet"],
      "月球是地球唯一的天然卫星，主要依靠反射太阳光被我们看见。", COMMON_ASTRO_GROUPS),
    makeCase("astro-mars", "astronomy", "火星", ["mars", "红色星球"],
      ["kind.celestial", "astro.planet", "astro.solarSystem", "astro.reflectsLight", "astro.rocky", "astro.hasAtmosphere", "astro.noRings", "astro.nakedEye", "astro.orbitsSun"],
      "火星是太阳系中的岩石行星，表面富含氧化铁，因此呈现红色。", COMMON_ASTRO_GROUPS),
    makeCase("astro-jupiter", "astronomy", "木星", ["jupiter"],
      ["kind.celestial", "astro.planet", "astro.solarSystem", "astro.reflectsLight", "astro.gasGiant", "astro.hasAtmosphere", "astro.hasRings", "astro.nakedEye", "astro.orbitsSun"],
      "木星是太阳系最大的行星，属于气态巨行星，也具有较暗的行星环。", COMMON_ASTRO_GROUPS),
    makeCase("astro-sirius", "astronomy", "天狼星", ["sirius", "大犬座α"],
      ["kind.celestial", "astro.star", "astro.outsideSolarSystem", "astro.emitsLight", "astro.hasAtmosphere", "astro.nakedEye"],
      "天狼星是夜空中视星等最亮的恒星，位于太阳系之外。", COMMON_ASTRO_GROUPS),
    makeCase("astro-andromeda", "astronomy", "仙女座星系", ["m31", "andromedagalaxy", "安德罗墨达星系"],
      ["kind.celestial", "astro.galaxy", "astro.outsideSolarSystem", "astro.nakedEye"],
      "仙女座星系是距离银河系较近的大型旋涡星系，暗空条件下可用肉眼看到。", COMMON_ASTRO_GROUPS),
    makeCase("astro-milky-way", "astronomy", "银河系", ["milkyway", "themilkyway"],
      ["kind.celestial", "astro.galaxy", "astro.nakedEye"],
      "银河系是太阳系所在的棒旋星系，暗空下横贯天空的乳白色光带是它的一部分。", ["kind", "astroType", "visibility"]),
    makeCase("astro-crab-nebula", "astronomy", "蟹状星云", ["m1", "crabnebula"],
      ["kind.celestial", "astro.nebula", "astro.outsideSolarSystem", "astro.telescope"],
      "蟹状星云是公元 1054 年超新星爆发留下的遗迹，位于金牛座方向。", COMMON_ASTRO_GROUPS),

    // 计算机科学
    makeCase("cs-lovelace", "computer-science", "阿达·洛芙莱斯", ["阿达洛夫莱斯", "洛芙莱斯", "adalovelace", "lovelace"],
      ["kind.person", "gender.female", "life.deceased", "country.uk", "era.19", "computer.algorithm"],
      "阿达·洛芙莱斯为巴贝奇分析机写下算法说明，常被称为早期程序设计先驱。", COMMON_PERSON_GROUPS),
    makeCase("cs-turing", "computer-science", "艾伦·图灵", ["图灵", "alanturing", "turing"],
      ["kind.person", "role.mathematician", "role.computerScientist", "gender.male", "life.deceased", "country.uk", "era.20", "computer.cryptography", "computer.ai", "computer.algorithm"],
      "艾伦·图灵在可计算理论、密码分析和机器智能思想方面都有奠基性贡献。", COMMON_PERSON_GROUPS),
    makeCase("cs-hopper", "computer-science", "格蕾丝·霍珀", ["葛丽丝霍普", "霍珀", "gracehopper", "hopper"],
      ["kind.person", "role.computerScientist", "gender.female", "life.deceased", "country.usa", "era.20", "computer.compiler"],
      "格蕾丝·霍珀是美国计算机科学先驱，推动了编译器与面向业务的高级语言发展。", COMMON_PERSON_GROUPS),
    makeCase("cs-von-neumann", "computer-science", "约翰·冯·诺依曼", ["冯诺依曼", "johnvonneumann", "vonneumann"],
      ["kind.person", "role.mathematician", "role.computerScientist", "gender.male", "life.deceased", "country.hungary", "country.usa", "era.20", "computer.architecture"],
      "冯·诺依曼参与形成了存储程序计算机体系结构，也在数学与博弈论中贡献卓著。", COMMON_PERSON_GROUPS),
    makeCase("cs-berners-lee", "computer-science", "蒂姆·伯纳斯-李", ["伯纳斯李", "timbernerslee", "bernerslee"],
      ["kind.person", "role.computerScientist", "gender.male", "life.living", "country.uk", "era.20", "era.21", "computer.web"],
      "蒂姆·伯纳斯-李发明了万维网的核心方案，包括 URL、HTTP 与 HTML 的早期设计。", COMMON_PERSON_GROUPS),
    makeCase("cs-hamilton", "computer-science", "玛格丽特·汉密尔顿", ["汉密尔顿", "margarethamilton"],
      ["kind.person", "role.computerScientist", "gender.female", "life.living", "country.usa", "era.20", "era.21", "computer.softwareEngineering"],
      "玛格丽特·汉密尔顿领导团队开发阿波罗任务飞行软件，并推动“软件工程”观念普及。", COMMON_PERSON_GROUPS),

    // 物理
    makeCase("physics-newton", "physics", "艾萨克·牛顿", ["牛顿", "isaacnewton", "newton"],
      ["kind.person", "role.physicist", "role.mathematician", "gender.male", "life.deceased", "country.uk", "era.17", "era.18", "physics.mechanics", "physics.gravity", "physics.optics", "math.calculus"],
      "牛顿建立了经典力学体系，研究万有引力和光学，并独立发展了微积分方法。", COMMON_PERSON_GROUPS),
    makeCase("physics-einstein", "physics", "阿尔伯特·爱因斯坦", ["爱因斯坦", "alberteinstein", "einstein"],
      ["kind.person", "role.physicist", "gender.male", "life.deceased", "country.germany", "country.switzerland", "country.usa", "era.19", "era.20", "physics.relativity", "physics.quantum"],
      "爱因斯坦提出狭义和广义相对论，并以光电效应研究推动了量子理论。", COMMON_PERSON_GROUPS),
    makeCase("physics-curie", "physics", "玛丽·居里", ["居里夫人", "玛丽居里", "mariecurie", "curie"],
      ["kind.person", "role.physicist", "role.chemist", "gender.female", "life.deceased", "country.poland", "country.france", "era.19", "era.20", "physics.radioactivity"],
      "玛丽·居里系统研究放射性，并发现了钋和镭，是首位两获诺贝尔奖的人。", COMMON_PERSON_GROUPS),
    makeCase("physics-maxwell", "physics", "詹姆斯·克拉克·麦克斯韦", ["麦克斯韦", "jamesclerkmaxwell", "maxwell"],
      ["kind.person", "role.physicist", "gender.male", "life.deceased", "country.uk", "era.19", "physics.electromagnetism"],
      "麦克斯韦用方程组统一描述电场、磁场与电磁波，是经典电磁理论的奠基者。", COMMON_PERSON_GROUPS),
    makeCase("physics-faraday", "physics", "迈克尔·法拉第", ["法拉第", "michaelfaraday", "faraday"],
      ["kind.person", "role.physicist", "gender.male", "life.deceased", "country.uk", "era.18", "era.19", "physics.electromagnetism"],
      "法拉第通过实验发现电磁感应，并提出用力线理解电磁场。", COMMON_PERSON_GROUPS),
    makeCase("physics-wu", "physics", "吴健雄", ["chien-shiungwu", "wujianxiong"],
      ["kind.person", "role.physicist", "gender.female", "life.deceased", "country.china", "country.usa", "era.20", "physics.nuclear"],
      "吴健雄是实验物理学家，她领导的实验验证了弱相互作用中的宇称不守恒。", COMMON_PERSON_GROUPS)
  ];

  const domainMap = new Map(DOMAINS.map((domain) => [domain.id, Object.freeze(domain)]));
  const caseMap = new Map(CASES.map((entry) => [entry.id, entry]));
  const casesByDomain = new Map(DOMAINS.map((domain) => [domain.id, Object.freeze(CASES.filter((entry) => entry.domainId === domain.id))]));
  const traitMap = new Map(TRAITS.map((trait) => [trait.id, Object.freeze(trait)]));

  return Object.freeze({
    DATASET_VERSION,
    DOMAINS: Object.freeze(DOMAINS.map(Object.freeze)),
    TRAITS: Object.freeze(TRAITS.map(Object.freeze)),
    CASES: Object.freeze(CASES),
    domainMap,
    caseMap,
    casesByDomain,
    traitMap
  });
});
