(function () {
  'use strict'

  window.TERM_WIKI = {
    subject: 'chemistry',
    title: '化学名词卡片',
    subtitle: '从氢出发，沿着化学键与碱金属族向下展开；把元素的性质、发现史和用途放进同一张概念坐标。',
    description: '8 个主题，连接氢及其相互作用、碱金属家族与元素纵向规律。',
    categories: [
      { id: 'hydrogen-system', label: '氢与相互作用', marker: 'H', description: '氢元素、质子转移与氢键' },
      { id: 'family-overview', label: '碱金属总论', marker: 'IA', description: '同族元素的共同结构与化学行为' },
      { id: 'alkali-elements', label: '碱金属谱系', marker: 'Li→Fr', description: '从锂到钫的发现、性质和应用' }
    ],
    items: [
      {
        id: 'hydrogen', name: '氢', en: 'Hydrogen', volume: '01', category: 'hydrogen-system',
        summary: '宇宙中最常见的元素之一；氢气无色无味、可燃，密度远小于空气。',
        keywords: ['H', '氢气', '氘', '氚', '凯文迪西', '拉瓦锡'],
        sections: [
          { title: '元素速写', text: '氢被视为一切元素之源。常温下的氢气无色无味、微溶于水，密度约为空气的十四分之一。' },
          { title: '发现与命名', text: '17 世纪波义耳记录了酸与铁产生的可燃气体；1766 年凯文迪西分离并确认它。1787 年拉瓦锡将其命名为 Hydrogen，意为“水之素”。' },
          { title: '同位素与利用', text: '氘用于反应机理和光谱研究，氚用于示踪并与核聚变相关；氢还用于合成氨、还原有机物及构建金属含氢配合物。' }
        ]
      },
      {
        id: 'bronsted-lowry', name: '质子酸碱', en: 'Brønsted–Lowry acid–base theory', volume: '02', category: 'hydrogen-system',
        summary: '以质子的给出与接受来定义酸和碱，把许多不同介质中的反应统一为质子转移。',
        keywords: ['酸', '碱', '质子', '共轭酸碱对', 'Brønsted', 'Lowry'],
        sections: [
          { title: '理论源流', text: '阿伦尼乌斯理论把酸碱限定在水溶液中的 H⁺ 与 OH⁻。1923 年，布朗斯特和劳里分别提出更广义的质子酸碱理论。' },
          { title: '核心定义', text: '能给出质子（H⁺）的物质是酸，能接受质子的物质是碱；既能给出又能接受质子的物质称为酸碱两性物质。' },
          { title: '作用与边界', text: '酸释放质子后成为共轭碱，碱接受质子后成为共轭酸。该理论适用范围广，但难以解释不含氢的一些酸碱行为。' }
        ]
      },
      {
        id: 'hydrogen-bond', name: '氢键', en: 'Hydrogen bond', volume: '03', category: 'hydrogen-system',
        summary: '与高电负性原子成键的氢，同另一原子之间形成的定向相互作用；它不是“氢原子之间的键”。',
        keywords: ['分子间力', 'HF', 'H2O', 'NH3', 'DNA', '沸点'],
        sections: [
          { title: '什么是氢键', text: '氢键涉及已通过共价键与其他原子键合的氢，以及另一个具有较强吸引能力的原子；其强度通常大于一般范德华作用。' },
          { title: '性质影响', text: 'NH₃、HF、H₂O 的熔沸点异常、溶解性、黏度、密度和部分电学性质都与氢键有关。' },
          { title: '结构与检测', text: '氢键对 DNA 等分子的结构至关重要，可通过红外光谱、核磁共振氢谱与衍射技术研究。' }
        ]
      },
      {
        id: 'alkali-metals', name: '碱金属', en: 'Alkali metals', volume: '04', category: 'family-overview',
        summary: '周期表最左侧 IA 族中除氢外的六种活泼金属：锂、钠、钾、铷、铯、钫。',
        keywords: ['IA族', 'ns1', '强还原性', '液氨', '负离子'],
        sections: [
          { title: '家族特征', text: '碱金属柔软、易熔、低密度且导电性良好，价电子构型为 ns¹，容易失去最外层电子形成离子型化合物。' },
          { title: '化学通性', text: '它们是强还原剂，在空气中迅速形成氧化物外壳，并能与水和多种非金属剧烈反应，实验与储存都需格外注意安全。' },
          { title: '家族趣谈', text: '碱金属可溶于液氨：稀溶液呈蓝色，高浓度时转为青铜色。在特殊气相条件下，碱金属还可能形成极活泼的负离子。' }
        ]
      },
      {
        id: 'lithium', name: '锂', en: 'Lithium', volume: '05', category: 'alkali-elements',
        summary: '银白、柔软，是已知最轻的金属；红色焰色和极低电极电势构成它鲜明的化学名片。',
        keywords: ['Li', '锂电池', '透锂长石', '锂辉石', '白色石油'],
        sections: [
          { title: '发现', text: '1817 年，J. A. Arfwedson 在透锂长石中辨识出新的碱金属。Lithium 源自希腊语“石头”，戴维次年通过电解熔融氧化锂获得金属锂。' },
          { title: '工业与合成', text: '现代主要电解熔融氯化锂生产金属锂。锂用于高能量密度电池，也作为还原剂；叔丁基锂等有机锂试剂广泛用于有机合成。' },
          { title: '医药与核工程', text: '碳酸锂是治疗双相情感障碍的经典药物；锂的氘化物、氚化物也出现在核工程相关体系中。' }
        ]
      },
      {
        id: 'sodium', name: '钠', en: 'Natrium / Sodium', volume: '06', category: 'alkali-elements',
        summary: '柔软活泼的银白色金属；钠离子是海水的重要阳离子，钠蒸气能发出明亮黄光。',
        keywords: ['Na', '钠灯', '氯碱工业', '食盐', '电解'],
        sections: [
          { title: '发现与命名', text: '1807 年戴维电解熔融体系分离钠。Sodium 的名称与历史上的碳酸钠用途有关，元素符号 Na 来自拉丁语 Natrium。' },
          { title: '工业角色', text: 'NaCl 是无机化学工业消耗最大的原料之一，用于氯碱、除雪、制碱、食品等；金属钠可还原制备钛等活泼金属。' },
          { title: '工程与生命', text: '液态钠可作快中子反应堆冷却剂，也用于有机还原体系；钠离子在神经信号传导和体液平衡中不可替代。' }
        ]
      },
      {
        id: 'potassium', name: '钾', en: 'Potassium / Kalium', volume: '07', category: 'alkali-elements',
        summary: '外观与钠相似、化学性质活泼；透过蓝色钴玻璃可观察其淡紫色焰色。',
        keywords: ['K', '钾肥', '草木灰', '超氧化钾', '焰色'],
        sections: [
          { title: '发现与命名', text: '戴维分离钾的工作标志着用电化学方法发现新元素。Potassium 源自 potash（草木灰），符号 K 来自 Kalium。' },
          { title: '农业与供氧', text: '植物生长离不开钾，钾盐产量大多用于肥料。超氧化钾可作矿井、潜艇和飞船的备用供氧剂。' },
          { title: '化合物差异', text: '不同碱金属阳离子会改变化合物性质：硬脂酸钾制成的肥皂柔软、熔点低，硬脂酸钠则更适合硬质肥皂。' }
        ]
      },
      {
        id: 'rubidium-caesium-francium', name: '铷、铯、钫', en: 'Rubidium · Caesium · Francium', volume: '08', category: 'alkali-elements',
        summary: '碱金属族较重的三名成员：铷与铯稀有，钫极少且具有强放射性。',
        keywords: ['Rb', 'Cs', 'Fr', '原子钟', '光电效应', '放射性'],
        sections: [
          { title: '发现', text: '1860 年本生与基尔霍夫借助分光镜发现铯，数月后确认铷；二者分别以深蓝和深红谱线命名。1939 年 Perey 发现钫，并以法国命名。' },
          { title: '铷与铯', text: '铷、铯在光照下容易发射电子，可用于光电器件；它们的原子跃迁频率极稳定，是铷钟、铯原子钟的基础。' },
          { title: '钫', text: '自然界中的钫极少，天然来源与锕的衰变有关；其同位素半衰期短、放射性强，通常只能取痕量研究。' }
        ]
      }
    ],
    references: ['格林伍德、厄恩肖：《元素化学》', '北京师范大学、华中师范大学、南京师范大学：《无机化学》第 5 版']
  }
}())
