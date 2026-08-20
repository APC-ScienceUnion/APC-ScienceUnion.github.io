"use strict";

(function attachScienceSoupEngine(root, factory) {
  const casesApi = typeof module === "object" && module.exports
    ? require("./cases.js")
    : root.ScienceSoupCases;
  const api = factory(casesApi);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceSoupEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildScienceSoupEngine(casesApi) {
  if (!casesApi) throw new Error("科学海龟汤题库没有加载。");

  const FORMAT = "apc.science-turtle-soup.session";
  const SCHEMA_VERSION = 1;
  const MAX_TEXT_LENGTH = 220;
  const MAX_ACTIONS = 400;
  const ANSWERS = Object.freeze({ YES: "yes", NO: "no", UNKNOWN: "unknown", CORRECT: "correct" });
  const ANSWER_LABELS = Object.freeze({ yes: "是", no: "不是", unknown: "不清楚", correct: "回答正确" });
  const STATUSES = new Set(["playing", "solved", "revealed"]);
  const ACTION_KINDS = new Set(["question", "guess", "reveal"]);

  const OPEN_QUESTION_PATTERN = /(为什么|为何|怎么|怎样|如何|是什么|是谁|哪里|哪儿|何时|什么时候|多少|几个|几岁|请介绍|详细说|解释一下)/;
  const CHOICE_PATTERN = /(还是|或者|或是|二选一|不是.+而是|以及|并且|同时|而且|且|或)/;
  const UNSAFE_PROMPT_PATTERN = /(忽略.{0,8}规则|直接.{0,8}(答案|汤底)|告诉我.{0,8}(答案|汤底)|查看源代码|开发者工具)/;
  const AMBIGUOUS_NEGATION_PATTERN = /(不是不是|并非不|难道不是|不可能不是|没有没有|没没|不会不会|不能不能|不可以不可以|会不会不|能不能不|有没有没|可不可以不)/;
  const IDENTITY_GROUPS = new Set([
    "kind", "gender", "role", "chemClass", "organicClass", "mineralClass",
    "bioKingdom", "bioClass", "vertebrate", "astroType"
  ]);
  const SCHOLARLY_GROUPS = new Set(["mathField", "physicsField", "computerField"]);

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/e\s*=\s*mc\s*[²2]/g, "e=mc2")
      .replace(/[\s\u3000]+/g, "")
      .replace(/[，。！？!?、；;：:“”‘’'"（）()《》【】\[\]{}·…—–_~`]/g, "");
  }

  function cleanInput(value) {
    const text = String(value == null ? "" : value).trim();
    if (!text) throw new Error("请输入一个问题。");
    if (text.length > MAX_TEXT_LENGTH) throw new Error(`每次输入请控制在 ${MAX_TEXT_LENGTH} 字以内。`);
    return text;
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function assertPlainObject(value, label) {
    if (!isPlainObject(value)) throw new Error(`${label}格式不正确。`);
  }

  function assertOnlyKeys(value, allowed, label) {
    const allowedSet = new Set(allowed);
    for (const key of Object.keys(value)) {
      if (!allowedSet.has(key)) throw new Error(`${label}包含未知字段“${key}”。`);
    }
  }

  function assertIsoDate(value, label) {
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
    if (typeof value !== "string" || value.length > 40 || !isoPattern.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new Error(`${label}不是有效时间。`);
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getDomain(domainId) {
    const domain = casesApi.domainMap.get(domainId);
    if (!domain) throw new Error("所选科学领域不存在。");
    return domain;
  }

  function selectCase(domainId, seed) {
    getDomain(domainId);
    if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error("选题随机种子无效。");
    const entries = casesApi.casesByDomain.get(domainId);
    if (!entries || !entries.length) throw new Error("这个领域暂时没有可用题目。");
    return entries[(seed >>> 0) % entries.length];
  }

  function getCaseForSession(session) {
    return selectCase(session.domainId, session.seed);
  }

  function makeSession(options) {
    const input = options || {};
    const domainId = input.domainId;
    const seed = input.seed;
    const sessionId = input.sessionId;
    const startedAt = input.startedAt || new Date().toISOString();
    if (typeof domainId !== "string" || typeof sessionId !== "string" || typeof seed !== "number") {
      throw new Error("场次基础字段格式无效。");
    }
    getDomain(domainId);
    selectCase(domainId, seed);
    if (!/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) throw new Error("场次编号无效。");
    assertIsoDate(startedAt, "开局时间");
    return {
      schemaVersion: SCHEMA_VERSION,
      datasetVersion: casesApi.DATASET_VERSION,
      sessionId,
      domainId,
      seed: seed >>> 0,
      status: "playing",
      startedAt,
      updatedAt: startedAt,
      endedAt: null,
      revision: 0,
      actions: [],
      turns: [],
      records: { yes: [], no: [], unknown: [] }
    };
  }

  function traitScopeKind(trait) {
    if (trait.id.startsWith("bio.")) return "kind.organism";
    if (trait.id.startsWith("astro.")) return "kind.celestial";
    if (["mineralClass", "hardness", "magnetism", "gemUse", "acidReaction", "solubility", "mineralComposition"].includes(trait.group)) return "kind.mineral";
    if (["gender", "life", "country", "era", "role", "mathField", "physicsField", "computerField"].includes(trait.group)) return "kind.person";
    if (["chemClass", "organicClass", "matterState", "flammability", "acidBase", "chemColor", "corrosive", "toxicity", "composition", "use"].includes(trait.group)) return "kind.substance";
    return null;
  }

  function evaluateTrait(entry, trait) {
    if (entry.yes.includes(trait.id)) return true;
    if (entry.no.includes(trait.id)) return false;
    const requiredKind = traitScopeKind(trait);
    if (requiredKind && !entry.yes.includes(requiredKind)) return false;
    if (entry.closedGroups.includes(trait.group)) return false;
    return null;
  }

  function negateStatement(statement) {
    return `“${statement}”这一判断不成立`;
  }

  function allAliases() {
    const aliases = [];
    for (const entry of casesApi.CASES) {
      for (const alias of entry.aliases) {
        const normalized = normalizeText(alias);
        if (normalized) aliases.push({ normalized, entry });
      }
    }
    return aliases.sort((a, b) => b.normalized.length - a.normalized.length);
  }

  const aliasIndex = allAliases();
  const SUBJECT_PREFIXES = Object.freeze([
    "这位计算机科学家", "这位计算机科学相关人物", "这位数学家", "这位物理学家", "这位科学家", "这位人物",
    "这个化学物质", "这种化学物质", "这个天文对象", "这种物质", "这个物质", "这种矿物", "这个矿物",
    "这种生物", "这个生物", "这个对象", "这个天体", "这颗天体", "该人物", "该物质", "该矿物", "该生物",
    "该对象", "该天体", "对象", "这位", "这个", "这种", "这颗", "他", "她", "它", "这"
  ].sort((a, b) => b.length - a.length));
  const propositionIndex = new Map();

  function registerVariant(trait, value, negated, priority) {
    const text = normalizeText(value);
    if (!text) return;
    const variants = propositionIndex.get(text) || [];
    const existing = variants.find((item) => item.trait.id === trait.id && item.negated === negated);
    if (existing) existing.priority = Math.max(existing.priority, priority);
    else variants.push({ trait, negated, priority });
    propositionIndex.set(text, variants);
  }

  function looksNegative(value) {
    return /^(?:不|没|无|非|不可|不能|不会|难|低毒|通常不|目前不)/.test(value);
  }

  function registerNegativeTransforms(trait, value, priority) {
    const text = normalizeText(value);
    if (!text || looksNegative(text)) return;
    const transformed = [];
    const replacements = [
      [/^常温下是/, "常温下不是"], [/^自身会/, "自身不会"], [/^自己会/, "自己不会"],
      [/^研究过/, "没有研究过"], [/^研究/, "不研究"], [/^是一/, "不是一"], [/^是/, "不是"],
      [/^属于/, "不属于"], [/^来自/, "不来自"], [/^生活/, "不生活"], [/^具有/, "不具有"],
      [/^含有/, "不含有"], [/^含/, "不含"], [/^能够/, "不能"], [/^能/, "不能"], [/^会/, "不会"],
      [/^可以/, "不可以"], [/^可/, "不可"], [/^容易/, "不容易"], [/^位于/, "不位于"], [/^在/, "不在"],
      [/^呈/, "不呈"], [/^需要/, "不需要"], [/^围绕/, "不围绕"], [/^绕/, "不绕"], [/^公转/, "不公转"],
      [/^反射/, "不反射"], [/^面临/, "不面临"], [/^遇/, "不遇"], [/^常被/, "不常被"], [/^用作/, "不用作"],
      [/^已经去世/, "尚未去世"], [/^去世/, "没有去世"], [/^逝世/, "没有逝世"]
    ];
    for (const [pattern, replacement] of replacements) {
      if (pattern.test(text)) {
        transformed.push(text.replace(pattern, replacement));
        break;
      }
    }
    const related = text.match(/^与(.+?)(?:的发展|的发明)?(?:有关|相关|有关系)$/);
    if (related) transformed.push(`与${related[1]}无关`);
    if (!transformed.length) transformed.push(`不是${text}`, `不${text}`);
    for (const form of transformed) registerVariant(trait, form, true, priority);
  }

  function propertyTemplates(group) {
    const templates = {
      matterState: { positive: ["是", "处于"], negative: ["不是", "不处于"] },
      acidBase: { positive: ["是", "呈"], negative: ["不是", "不呈"] },
      chemColor: { positive: ["是", "呈"], negative: ["不是", "不呈"] },
      corrosive: { positive: ["有", "具有"], negative: ["没有", "不具有"] },
      toxicity: { positive: ["有", "具有"], negative: ["没有", "不具有"] },
      composition: { positive: ["含", "含有"], negative: ["不含", "不含有"] },
      mineralComposition: { positive: ["含", "含有"], negative: ["不含", "不含有"] },
      magnetism: { positive: ["有", "具有"], negative: ["没有", "不具有"] },
      gemUse: { positive: ["是"], negative: ["不是"] },
      solubility: { positive: ["能", "可以"], negative: ["不能", "无法"] },
      flight: { positive: ["能", "会", "可以"], negative: ["不能", "不会", "不可以"] },
      photosynthesis: { positive: ["能进行", "可以进行", "会进行"], negative: ["不能进行", "无法进行", "不会进行"] },
      cellularity: { positive: ["是", "属于"], negative: ["不是", "不属于"] },
      astroLocation: { positive: ["位于", "在"], negative: ["不位于", "不在"] },
      lightSource: { positive: ["是"], negative: ["不是"] },
      astroComposition: { positive: ["是", "属于"], negative: ["不是", "不属于"] },
      atmosphere: { positive: ["有", "具有"], negative: ["没有", "不具有"] },
      rings: { positive: ["有", "具有"], negative: ["没有", "不具有"] },
      visibility: { positive: ["能", "可以"], negative: ["不能", "无法"] }
    };
    return templates[group] || { positive: [], negative: [] };
  }

  function registerTraitVariants(trait) {
    registerVariant(trait, trait.statement, false, 1200 + trait.statement.length);
    for (const rawPattern of trait.patterns) {
      const pattern = normalizeText(rawPattern);
      if (!pattern) continue;
      registerVariant(trait, pattern, false, 1000 + pattern.length);

      if (IDENTITY_GROUPS.has(trait.group)) {
        for (const prefix of ["是", "属于", "算是", "是一位", "是一个", "是一种", "是一颗"]) {
          registerVariant(trait, `${prefix}${pattern}`, false, 760 + pattern.length);
        }
        for (const prefix of ["不是", "不属于", "不算是"]) {
          registerVariant(trait, `${prefix}${pattern}`, true, 750 + pattern.length);
        }
        if (trait.group === "mineralClass") {
          registerVariant(trait, `是${pattern}矿物`, false, 790 + pattern.length);
          registerVariant(trait, `是一种${pattern}矿物`, false, 800 + pattern.length);
          registerVariant(trait, `是一种${pattern}类矿物`, false, 800 + pattern.length);
          registerVariant(trait, `属于${pattern}类矿物`, false, 790 + pattern.length);
        }
      } else if (trait.group === "country") {
        registerVariant(trait, `是${pattern}`, false, 760 + pattern.length);
        registerVariant(trait, `不是${pattern}`, true, 750 + pattern.length);
        if (pattern.startsWith("来自")) registerVariant(trait, `不${pattern}`, true, 780 + pattern.length);
      } else if (trait.group === "era") {
        for (const prefix of ["生活在", "生活于", "活跃于", "出生于"]) registerVariant(trait, `${prefix}${pattern}`, false, 760 + pattern.length);
        for (const prefix of ["不生活在", "不生活于", "没有生活在", "并非生活在"]) registerVariant(trait, `${prefix}${pattern}`, true, 750 + pattern.length);
      } else if (SCHOLARLY_GROUPS.has(trait.group)) {
        for (const prefix of ["研究", "研究过", "从事", "专攻", "涉及"]) registerVariant(trait, `${prefix}${pattern}`, false, 760 + pattern.length);
        for (const prefix of ["不研究", "并不研究", "从未研究", "没有研究", "没有研究过", "未研究过"]) {
          registerVariant(trait, `${prefix}${pattern}`, true, 770 + pattern.length);
        }
        for (const suffix of ["有关", "相关", "有关系"]) registerVariant(trait, `与${pattern}${suffix}`, false, 760 + pattern.length);
        registerVariant(trait, `对${pattern}有贡献`, false, 760 + pattern.length);
        registerVariant(trait, `与${pattern}无关`, true, 770 + pattern.length);
      } else {
        const predicatePattern = /^(?:是|属于|来自|生活|研究|与|常温|容易|不易|可|不可|不|没|无|含|有|具有|呈|遇|主要|通常|自身|自己|需要|绕|围绕|公转|面临|已经|仍然|还在|去世|逝世|能够|不能|会|能|反射|位于|在)/;
        if (!predicatePattern.test(pattern)) {
          const templates = propertyTemplates(trait.group);
          for (const prefix of templates.positive) {
            registerVariant(trait, `${prefix}${pattern}`, false, 720 + pattern.length);
          }
          for (const prefix of templates.negative) {
            registerVariant(trait, `${prefix}${pattern}`, true, 710 + pattern.length);
          }
        }
        if (trait.group === "use") {
          registerVariant(trait, `与${pattern}有关`, false, 740 + pattern.length);
          registerVariant(trait, `与${pattern}有联系`, false, 740 + pattern.length);
        }
        if (trait.group === "matterState" && pattern.startsWith("常温")) registerVariant(trait, `在${pattern}`, false, 790 + pattern.length);
        if (trait.group === "lightSource" && pattern.startsWith("会")) registerVariant(trait, `自身${pattern}`, false, 790 + pattern.length);
        if (predicatePattern.test(pattern)) registerNegativeTransforms(trait, pattern, 730 + pattern.length);
      }
      registerNegativeTransforms(trait, trait.statement, 700 + trait.statement.length);
    }
  }

  for (const trait of casesApi.TRAITS) registerTraitVariants(trait);

  function stripGuessWrapper(normalized) {
    let candidate = normalized
      .replace(/^(我猜|我认为|我觉得|我的答案是|答案是|汤底是|这个对象是|这个是|这是|它是|他是|她是|就是|是不是|是否是)/, "")
      .replace(/(对不对|正确吗|是吗|对吗|吗|么|吧)$/, "");
    candidate = candidate.replace(/^(一位|一个|一种|一颗)/, "");
    return candidate;
  }

  function detectKnownGuess(text) {
    const normalized = normalizeText(text);
    if (!normalized) return null;
    const wrapped = stripGuessWrapper(normalized);
    const candidates = [normalized, wrapped];
    for (const candidate of candidates) {
      const found = aliasIndex.find((alias) => alias.normalized === candidate);
      if (found) return found.entry;
    }
    return null;
  }

  function normalizeQuestionForMatching(normalized) {
    return normalized
      .replace(/^请问/, "")
      .replace(/是不是不/g, "不")
      .replace(/是不是/g, "是")
      .replace(/会不会/g, "会")
      .replace(/能不能/g, "能")
      .replace(/可不可以/g, "可以")
      .replace(/有没有/g, "有")
      .replace(/是否/g, "")
      .replace(/(对不对|正确吗|是吗|对吗|吗|么|呢|吧|呀|啊)$/, "");
  }

  function propositionRemainder(text) {
    let normalized = normalizeQuestionForMatching(normalizeText(text));
    for (const subject of SUBJECT_PREFIXES) {
      if (normalized.startsWith(subject)) {
        normalized = normalized.slice(subject.length);
        break;
      }
    }
    return normalized;
  }

  function findTraitMatches(entry, text) {
    const remainder = propositionRemainder(text);
    const variants = (propositionIndex.get(remainder) || []).filter((variant) => {
      const requiredKind = traitScopeKind(variant.trait);
      return !requiredKind || entry.yes.includes(requiredKind);
    });
    if (!variants.length) return [];
    const highestPriority = Math.max(...variants.map((variant) => variant.priority));
    return variants
      .filter((variant) => variant.priority === highestPriority)
      .map((variant) => ({
        trait: variant.trait,
        negated: variant.negated,
        baseTruth: evaluateTrait(entry, variant.trait)
      }));
  }

  function judgeQuestion(entry, rawText) {
    const text = cleanInput(rawText);
    const normalized = normalizeText(text);
    const knownGuess = detectKnownGuess(text);
    if (knownGuess) {
      if (knownGuess.id === entry.id) {
        return { answer: ANSWERS.CORRECT, answerLabel: ANSWER_LABELS.correct, reason: "correct-guess", records: [] };
      }
      return {
        answer: ANSWERS.NO,
        answerLabel: ANSWER_LABELS.no,
        reason: "wrong-known-guess",
        records: [{ bucket: "no", key: `guess:${normalizeText(knownGuess.name)}`, text: `不是${knownGuess.name}` }]
      };
    }

    if (OPEN_QUESTION_PATTERN.test(normalized)) {
      return { answer: ANSWERS.UNKNOWN, answerLabel: ANSWER_LABELS.unknown, reason: "open-question", records: [] };
    }
    if (AMBIGUOUS_NEGATION_PATTERN.test(normalized)) {
      return { answer: ANSWERS.UNKNOWN, answerLabel: ANSWER_LABELS.unknown, reason: "ambiguous-question", records: [] };
    }
    if (UNSAFE_PROMPT_PATTERN.test(normalized)) {
      return { answer: ANSWERS.UNKNOWN, answerLabel: ANSWER_LABELS.unknown, reason: "not-a-science-question", records: [] };
    }

    const matches = findTraitMatches(entry, text);
    if (!matches.length || matches.length > 6) {
      const reason = CHOICE_PATTERN.test(normalized) ? "ambiguous-question" : "no-reviewed-fact";
      return { answer: ANSWERS.UNKNOWN, answerLabel: ANSWER_LABELS.unknown, reason, records: [] };
    }

    const propositionTruths = matches.map((match) => {
      if (match.baseTruth === null) return null;
      return match.negated ? !match.baseTruth : match.baseTruth;
    });
    let answer;
    if (propositionTruths.every((truth) => truth === true)) answer = ANSWERS.YES;
    else if (propositionTruths.every((truth) => truth === false)) answer = ANSWERS.NO;
    else answer = ANSWERS.UNKNOWN;

    if (answer === ANSWERS.UNKNOWN) {
      return { answer, answerLabel: ANSWER_LABELS[answer], reason: "fact-not-complete", records: [] };
    }

    const recordMap = new Map();
    for (const match of matches) {
      if (match.baseTruth === null) continue;
      const bucket = match.baseTruth ? "yes" : "no";
      const record = {
        bucket,
        key: `trait:${match.trait.id}:${match.baseTruth ? "1" : "0"}`,
        text: match.baseTruth ? match.trait.statement : negateStatement(match.trait.statement)
      };
      recordMap.set(record.key, record);
    }
    return {
      answer,
      answerLabel: ANSWER_LABELS[answer],
      reason: "reviewed-fact",
      records: Array.from(recordMap.values())
    };
  }

  function judgeGuess(entry, rawText) {
    const text = cleanInput(rawText);
    const normalized = stripGuessWrapper(normalizeText(text));
    if (!normalized) throw new Error("请输入你猜测的完整对象名称。");
    const correct = entry.aliases.some((alias) => normalizeText(alias) === normalized);
    if (correct) return { answer: ANSWERS.CORRECT, answerLabel: ANSWER_LABELS.correct, reason: "correct-guess", records: [] };
    const safeCandidate = text.replace(/[。！？!?]+$/g, "").slice(0, 80);
    return {
      answer: ANSWERS.NO,
      answerLabel: ANSWER_LABELS.no,
      reason: "wrong-guess",
      records: [{ bucket: "no", key: `guess:${normalizeText(safeCandidate)}`, text: `不是${safeCandidate}` }]
    };
  }

  function addRecord(session, record, turnId) {
    const list = session.records[record.bucket];
    if (!list || list.some((item) => item.key === record.key)) return;
    list.push({ key: record.key, text: record.text, turnId });
  }

  function applyAction(currentSession, actionInput) {
    if (!currentSession || !STATUSES.has(currentSession.status)) throw new Error("当前场次状态无效。");
    if (currentSession.status !== "playing") throw new Error("当前游戏已经结束，请开始新场次。");
    if (currentSession.actions.length >= MAX_ACTIONS) throw new Error("本场记录已达到上限，请先导出并开始新游戏。");

    assertPlainObject(actionInput, "操作");
    const kind = String(actionInput.kind || "");
    if (!ACTION_KINDS.has(kind)) throw new Error("操作类型无效。");
    const at = actionInput.at || new Date().toISOString();
    assertIsoDate(at, "操作时间");
    const session = clone(currentSession);
    const entry = getCaseForSession(session);
    const turnId = `turn-${session.revision + 1}`;
    let text = "";
    let result;

    if (kind === "question") {
      text = cleanInput(actionInput.text);
      result = judgeQuestion(entry, text);
    } else if (kind === "guess") {
      text = cleanInput(actionInput.text);
      result = judgeGuess(entry, text);
    } else {
      result = { answer: ANSWERS.UNKNOWN, answerLabel: ANSWER_LABELS.unknown, reason: "revealed", records: [] };
    }

    session.actions.push({ kind, text, at });
    session.revision += 1;
    session.updatedAt = at;

    if (kind === "reveal") {
      session.status = "revealed";
      session.endedAt = at;
      session.turns.push({ id: turnId, kind, text: "", answer: "revealed", answerLabel: "已揭晓", at, reason: "revealed" });
      return session;
    }

    session.turns.push({
      id: turnId,
      kind,
      text,
      answer: result.answer,
      answerLabel: result.answerLabel,
      at,
      reason: result.reason
    });

    if (result.answer === ANSWERS.CORRECT) {
      session.status = "solved";
      session.endedAt = at;
    } else if (result.answer === ANSWERS.UNKNOWN) {
      addRecord(session, { bucket: "unknown", key: `question:${normalizeText(text)}`, text }, turnId);
    } else {
      for (const record of result.records) addRecord(session, record, turnId);
    }
    return session;
  }

  function exportSession(session, exportedAt) {
    if (!session || !STATUSES.has(session.status)) throw new Error("没有可导出的有效场次。");
    const at = exportedAt || new Date().toISOString();
    assertIsoDate(at, "导出时间");
    return {
      format: FORMAT,
      schemaVersion: SCHEMA_VERSION,
      datasetVersion: casesApi.DATASET_VERSION,
      exportedAt: at,
      session: {
        sessionId: session.sessionId,
        domainId: session.domainId,
        seed: session.seed,
        startedAt: session.startedAt,
        actions: session.actions.map((action) => ({ kind: action.kind, text: action.text, at: action.at }))
      }
    };
  }

  function importSession(bundle) {
    assertPlainObject(bundle, "记录文件");
    assertOnlyKeys(bundle, ["format", "schemaVersion", "datasetVersion", "exportedAt", "session"], "记录文件");
    if (bundle.format !== FORMAT) throw new Error("这不是科学海龟汤记录文件。");
    if (bundle.schemaVersion !== SCHEMA_VERSION) throw new Error("记录文件版本不受支持。");
    if (bundle.datasetVersion !== casesApi.DATASET_VERSION) throw new Error("题库版本不一致，无法可靠恢复。");
    assertIsoDate(bundle.exportedAt, "导出时间");
    assertPlainObject(bundle.session, "场次");
    assertOnlyKeys(bundle.session, ["sessionId", "domainId", "seed", "startedAt", "actions"], "场次");
    if (!Array.isArray(bundle.session.actions)) throw new Error("问答记录必须是数组。");
    if (bundle.session.actions.length > MAX_ACTIONS) throw new Error("问答记录数量超过上限。");

    let session = makeSession({
      sessionId: bundle.session.sessionId,
      domainId: bundle.session.domainId,
      seed: bundle.session.seed,
      startedAt: bundle.session.startedAt
    });

    for (let index = 0; index < bundle.session.actions.length; index += 1) {
      const action = bundle.session.actions[index];
      assertPlainObject(action, `第 ${index + 1} 条记录`);
      assertOnlyKeys(action, ["kind", "text", "at"], `第 ${index + 1} 条记录`);
      if (!ACTION_KINDS.has(action.kind)) throw new Error(`第 ${index + 1} 条记录类型无效。`);
      if (typeof action.text !== "string" || action.text.length > MAX_TEXT_LENGTH) throw new Error(`第 ${index + 1} 条文字段无效。`);
      if (action.kind !== "reveal" && !action.text.trim()) throw new Error(`第 ${index + 1} 条记录内容为空。`);
      if (action.kind === "reveal" && action.text !== "") throw new Error(`第 ${index + 1} 条揭晓记录格式无效。`);
      assertIsoDate(action.at, `第 ${index + 1} 条记录时间`);
      if (session.status !== "playing") throw new Error("记录在游戏结束后仍包含额外操作。");
      session = applyAction(session, action);
    }
    return session;
  }

  return Object.freeze({
    FORMAT,
    SCHEMA_VERSION,
    MAX_TEXT_LENGTH,
    MAX_ACTIONS,
    ANSWERS,
    ANSWER_LABELS,
    normalizeText,
    selectCase,
    getCaseForSession,
    makeSession,
    judgeQuestion,
    judgeGuess,
    applyAction,
    exportSession,
    importSession
  });
});
