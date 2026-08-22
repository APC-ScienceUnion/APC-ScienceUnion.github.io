"use strict";

(function attachScienceSoupEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceSoupEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildScienceSoupEngine() {
  const FORMAT = "apc.science-turtle-soup.session";
  const SCHEMA_VERSION = 2;
  const MAX_TEXT_LENGTH = 220;
  const MAX_RECORD_TEXT_LENGTH = 500;
  const MAX_TURNS = 500;
  const MAX_TOKEN_LENGTH = 16384;
  const DOMAIN_IDS = new Set([
    "mathematics", "chemistry", "earth-science", "biology", "astronomy", "computer-science", "physics"
  ]);
  const STATUSES = new Set(["playing", "solved", "revealed"]);
  const ACTION_KINDS = new Set(["question", "guess", "reveal"]);
  const TURN_ANSWERS = new Set(["yes", "no", "unknown", "correct", "incorrect", "revealed"]);
  const ACTION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const ANSWER_LABELS = Object.freeze({
    yes: "是",
    no: "不是",
    unknown: "不清楚",
    correct: "答对了",
    incorrect: "未猜中",
    revealed: "已揭晓"
  });

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function assertPlainObject(value, label) {
    if (!isPlainObject(value)) throw new Error(`${label}格式无效。`);
  }

  function assertOnlyKeys(value, allowed, label) {
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) throw new Error(`${label}包含未知字段：${key}。`);
    }
  }

  function assertRequiredKeys(value, required, label) {
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) throw new Error(`${label}缺少字段：${key}。`);
    }
  }

  function assertString(value, label, options) {
    const max = options && options.max ? options.max : MAX_RECORD_TEXT_LENGTH;
    const allowEmpty = Boolean(options && options.allowEmpty);
    if (typeof value !== "string" || value.length > max || (!allowEmpty && !value.trim())) {
      throw new Error(`${label}无效。`);
    }
    return value;
  }

  function assertIsoDate(value, label, nullable) {
    if (nullable && value === null) return null;
    if (typeof value !== "string" || !value || !Number.isFinite(Date.parse(value))) throw new Error(`${label}无效。`);
    return value;
  }

  function normalizeSurface(surface, strictStored) {
    if (!strictStored && typeof surface === "string") {
      return { title: assertString(surface, "汤面", { max: 500 }), hint: "" };
    }
    assertPlainObject(surface, "汤面");
    assertOnlyKeys(surface, strictStored ? ["title", "hint"] : ["title", "prompt", "hint"], "汤面");
    const title = Object.prototype.hasOwnProperty.call(surface, "title") ? surface.title : surface.prompt;
    return {
      title: assertString(title, "汤面标题", { max: 500 }),
      hint: Object.prototype.hasOwnProperty.call(surface, "hint")
        ? assertString(surface.hint, "汤面提示", { max: 800, allowEmpty: true })
        : ""
    };
  }

  function normalizeReveal(reveal, strictStored) {
    if (!strictStored && typeof reveal === "string") {
      return { answerName: "汤底", explanation: assertString(reveal, "汤底说明", { max: 4000 }) };
    }
    assertPlainObject(reveal, "汤底");
    const allowed = strictStored
      ? ["answerName", "explanation"]
      : ["answerName", "answer", "name", "explanation", "description"];
    assertOnlyKeys(reveal, allowed, "汤底");
    const answerName = reveal.answerName || reveal.answer || reveal.name;
    const explanation = reveal.explanation || reveal.description;
    return {
      answerName: assertString(answerName, "汤底名称", { max: 300 }),
      explanation: assertString(explanation, "汤底说明", { max: 4000 })
    };
  }

  function normalizeState(state, strictStored) {
    assertPlainObject(state, "公开场次状态");
    const baseKeys = [
      "sessionId", "domainId", "surface", "status", "revision", "startedAt", "updatedAt", "endedAt", "expiresAt"
    ];
    assertOnlyKeys(state, baseKeys.concat("reveal"), "公开场次状态");
    assertRequiredKeys(state, baseKeys, "公开场次状态");
    const sessionId = assertString(state.sessionId, "场次编号", { max: 200 });
    const domainId = assertString(state.domainId, "领域编号", { max: 80 });
    if (!DOMAIN_IDS.has(domainId)) throw new Error("场次领域不受支持。");
    if (!STATUSES.has(state.status)) throw new Error("场次状态无效。");
    if (!Number.isSafeInteger(state.revision) || state.revision < 0) throw new Error("场次修订号无效。");
    const normalized = {
      sessionId,
      domainId,
      surface: normalizeSurface(state.surface, strictStored),
      status: state.status,
      revision: state.revision,
      startedAt: assertIsoDate(state.startedAt, "开始时间"),
      updatedAt: assertIsoDate(state.updatedAt, "更新时间"),
      endedAt: assertIsoDate(state.endedAt, "结束时间", true),
      expiresAt: assertIsoDate(state.expiresAt, "过期时间")
    };
    const startedMs = Date.parse(normalized.startedAt);
    const updatedMs = Date.parse(normalized.updatedAt);
    const expiresMs = Date.parse(normalized.expiresAt);
    if (updatedMs < startedMs || expiresMs <= updatedMs) throw new Error("场次时间顺序无效。");
    if (normalized.status === "playing") {
      if (normalized.endedAt !== null) throw new Error("进行中的场次不能含结束时间。");
      if (Object.prototype.hasOwnProperty.call(state, "reveal") && state.reveal !== null) {
        throw new Error("进行中的场次不能含汤底。");
      }
    } else {
      if (normalized.endedAt === null) throw new Error("已结束场次缺少结束时间。");
      const endedMs = Date.parse(normalized.endedAt);
      if (endedMs < startedMs || endedMs > updatedMs) throw new Error("场次结束时间顺序无效。");
      if (!Object.prototype.hasOwnProperty.call(state, "reveal") || state.reveal === null) {
        throw new Error("已结束场次缺少汤底。");
      }
      normalized.reveal = normalizeReveal(state.reveal, strictStored);
    }
    return normalized;
  }

  function normalizeToken(token) {
    const normalized = assertString(token, "场次恢复凭据", { max: MAX_TOKEN_LENGTH });
    if (normalized.length < 32) throw new Error("场次恢复凭据无效。");
    return normalized;
  }

  function normalizeEnvelope(payload) {
    assertPlainObject(payload, "AI 服务响应");
    assertOnlyKeys(payload, ["sessionToken", "state", "result"], "AI 服务响应");
    assertRequiredKeys(payload, ["sessionToken", "state"], "AI 服务响应");
    return {
      sessionToken: normalizeToken(payload.sessionToken),
      state: normalizeState(payload.state, false),
      result: payload.result
    };
  }

  function validateResultRecords(records) {
    if (records === undefined) return;
    if (!Array.isArray(records) || records.length > 12) throw new Error("AI 事实记录无效。");
    for (const record of records) {
      assertPlainObject(record, "AI 事实记录");
      assertOnlyKeys(record, ["bucket", "text"], "AI 事实记录");
      assertRequiredKeys(record, ["bucket", "text"], "AI 事实记录");
      if (!["yes", "no", "unknown"].includes(record.bucket)) throw new Error("AI 事实记录分类无效。");
      assertString(record.text, "AI 事实记录文字", { max: MAX_RECORD_TEXT_LENGTH });
    }
  }

  function normalizeTurn(turn, index) {
    const label = `第 ${index + 1} 条问答`;
    assertPlainObject(turn, label);
    assertOnlyKeys(turn, ["id", "kind", "text", "answer", "answerLabel", "at"], label);
    assertRequiredKeys(turn, ["id", "kind", "text", "answer", "answerLabel", "at"], label);
    const id = assertString(turn.id, `${label}编号`, { max: 200 });
    if (!ACTION_ID_PATTERN.test(id)) throw new Error(`${label}编号无效。`);
    if (!ACTION_KINDS.has(turn.kind)) throw new Error(`${label}类型无效。`);
    const text = assertString(turn.text, `${label}文字`, { max: MAX_TEXT_LENGTH, allowEmpty: turn.kind === "reveal" });
    if (turn.kind === "reveal" && text !== "") throw new Error(`${label}揭晓文字无效。`);
    if (!TURN_ANSWERS.has(turn.answer)) throw new Error(`${label}答案无效。`);
    if (turn.answerLabel !== ANSWER_LABELS[turn.answer]) throw new Error(`${label}答案标签无效。`);
    return { id, kind: turn.kind, text, answer: turn.answer, answerLabel: turn.answerLabel, at: assertIsoDate(turn.at, `${label}时间`) };
  }

  function normalizeRecords(records) {
    assertPlainObject(records, "侧栏记录");
    assertOnlyKeys(records, ["yes", "no", "unknown"], "侧栏记录");
    assertRequiredKeys(records, ["yes", "no", "unknown"], "侧栏记录");
    const normalized = { yes: [], no: [], unknown: [] };
    for (const bucket of Object.keys(normalized)) {
      if (!Array.isArray(records[bucket]) || records[bucket].length > MAX_TURNS) throw new Error(`${bucket} 记录无效。`);
      const seen = new Set();
      records[bucket].forEach((record, index) => {
        assertPlainObject(record, `${bucket} 第 ${index + 1} 条记录`);
        assertOnlyKeys(record, ["id", "text"], `${bucket} 第 ${index + 1} 条记录`);
        assertRequiredKeys(record, ["id", "text"], `${bucket} 第 ${index + 1} 条记录`);
        const id = assertString(record.id, "事实编号", { max: 200 });
        const text = assertString(record.text, "事实内容", { max: MAX_RECORD_TEXT_LENGTH });
        if (seen.has(text)) throw new Error(`${bucket} 记录含重复事实。`);
        seen.add(text);
        normalized[bucket].push({ id, text });
      });
    }
    return normalized;
  }

  function normalizePendingAction(pending) {
    if (pending === null) return null;
    assertPlainObject(pending, "待确认操作");
    assertOnlyKeys(pending, ["actionId", "kind", "text", "at", "baseRevision"], "待确认操作");
    assertRequiredKeys(pending, ["actionId", "kind", "text", "at", "baseRevision"], "待确认操作");
    const actionId = assertString(pending.actionId, "操作编号", { max: 200 });
    if (!ACTION_ID_PATTERN.test(actionId)) throw new Error("操作编号无效。");
    if (!ACTION_KINDS.has(pending.kind)) throw new Error("待确认操作类型无效。");
    const text = assertString(pending.text, "待确认操作文字", {
      max: MAX_TEXT_LENGTH,
      allowEmpty: pending.kind === "reveal"
    });
    if (pending.kind === "reveal" && text !== "") throw new Error("揭晓操作不能包含文字。");
    if (!Number.isSafeInteger(pending.baseRevision) || pending.baseRevision < 0) throw new Error("待确认操作修订号无效。");
    return { actionId, kind: pending.kind, text, at: assertIsoDate(pending.at, "操作时间"), baseRevision: pending.baseRevision };
  }

  function normalizeLocalSession(session) {
    assertPlainObject(session, "本地场次");
    assertOnlyKeys(session, ["schemaVersion", "sessionToken", "state", "turns", "records", "pendingAction"], "本地场次");
    assertRequiredKeys(session, ["schemaVersion", "sessionToken", "state", "turns", "records", "pendingAction"], "本地场次");
    if (session.schemaVersion !== SCHEMA_VERSION) throw new Error("本地场次版本不受支持。");
    if (!Array.isArray(session.turns) || session.turns.length > MAX_TURNS) throw new Error("问答记录数量超过上限。");
    const state = normalizeState(session.state, true);
    const turns = session.turns.map(normalizeTurn);
    const ids = new Set();
    for (const turn of turns) {
      if (ids.has(turn.id)) throw new Error("问答记录含重复操作编号。");
      ids.add(turn.id);
    }
    const pendingAction = normalizePendingAction(session.pendingAction);
    if (pendingAction && ids.has(pendingAction.actionId)) throw new Error("待确认操作已存在于问答记录中。");
    if (pendingAction && pendingAction.baseRevision > state.revision) throw new Error("待确认操作修订号超前。");
    if (turns.length > state.revision) throw new Error("问答记录多于服务端修订号。");
    if (state.status === "playing" && turns.some((turn) => turn.answer === "correct" || turn.answer === "revealed")) {
      throw new Error("进行中的场次含终局记录。");
    }
    const records = normalizeRecords(session.records);
    // Older v2 clients incorrectly treated a failed final guess as a scientific
    // "no" fact. Remove only those records identified by the corresponding
    // guess turn; genuine no-answers to player questions remain untouched.
    const obsoleteGuessRecordIds = new Set(
      turns
        .filter((turn) => turn.kind === "guess" && turn.answer === "incorrect")
        .map((turn) => `${turn.id}:no`)
    );
    records.no = records.no.filter((record) => !obsoleteGuessRecordIds.has(record.id));
    return {
      schemaVersion: SCHEMA_VERSION,
      sessionToken: normalizeToken(session.sessionToken),
      state,
      turns,
      records,
      pendingAction
    };
  }

  function createSession(payload) {
    const envelope = normalizeEnvelope(payload);
    if (envelope.state.status !== "playing") throw new Error("新场次必须处于进行中。");
    return {
      schemaVersion: SCHEMA_VERSION,
      sessionToken: envelope.sessionToken,
      state: envelope.state,
      turns: [],
      records: { yes: [], no: [], unknown: [] },
      pendingAction: null
    };
  }

  function beginAction(session, action) {
    const current = normalizeLocalSession(session);
    if (current.state.status !== "playing") throw new Error("本场游戏已经结束。");
    if (current.pendingAction) throw new Error("上一项操作仍在等待 AI 确认。");
    assertPlainObject(action, "玩家操作");
    assertOnlyKeys(action, ["actionId", "kind", "text", "at"], "玩家操作");
    const pendingAction = normalizePendingAction({
      actionId: action.actionId,
      kind: action.kind,
      text: action.text,
      at: action.at,
      baseRevision: current.state.revision
    });
    return { ...current, pendingAction };
  }

  function cancelPending(session) {
    const current = normalizeLocalSession(session);
    return { ...current, pendingAction: null };
  }

  function answerForAction(pending, result, state) {
    if (pending.kind === "reveal") {
      if (!result && state.status === "revealed") return "revealed";
      const answer = result && typeof result.answer === "string" ? result.answer : "";
      if (answer !== "revealed" || state.status !== "revealed") throw new Error("AI 揭晓结果无效。");
      return "revealed";
    }
    if (!result) throw new Error("AI 操作结果缺失。");
    const answer = typeof result.answer === "string" ? result.answer : "";
    if (pending.kind === "guess") {
      if (answer === "correct" && state.status === "solved") return "correct";
      if (answer === "incorrect" && state.status === "playing") return "incorrect";
      throw new Error("AI 猜测结果无效。");
    }
    if (state.status !== "playing" || !["yes", "no", "unknown"].includes(answer)) {
      throw new Error("AI 问答结果无效。");
    }
    return answer;
  }

  function applyServerAction(session, payload) {
    const current = normalizeLocalSession(session);
    if (!current.pendingAction) throw new Error("没有等待确认的玩家操作。");
    const envelope = normalizeEnvelope(payload);
    if (envelope.state.sessionId !== current.state.sessionId || envelope.state.domainId !== current.state.domainId) {
      throw new Error("AI 响应与当前场次不匹配。");
    }
    if (envelope.state.revision !== current.pendingAction.baseRevision + 1) {
      throw new Error("AI 响应修订号与当前操作不匹配。");
    }
    if (envelope.result !== undefined) {
      assertPlainObject(envelope.result, "AI 操作结果");
      assertOnlyKeys(envelope.result, ["kind", "answer", "answerLabel", "records"], "AI 操作结果");
      assertRequiredKeys(envelope.result, ["kind", "answer"], "AI 操作结果");
      validateResultRecords(envelope.result.records);
      if (envelope.result.kind !== current.pendingAction.kind) {
        throw new Error("AI 操作结果类型不匹配。");
      }
    } else if (current.pendingAction.kind !== "reveal") {
      throw new Error("AI 操作结果缺失。");
    }
    const pending = current.pendingAction;
    const answer = answerForAction(pending, envelope.result, envelope.state);
    const turn = {
      id: pending.actionId,
      kind: pending.kind,
      text: pending.text,
      answer,
      answerLabel: ANSWER_LABELS[answer],
      at: envelope.state.updatedAt || pending.at
    };
    const turns = current.turns.some((item) => item.id === turn.id) ? current.turns.slice() : current.turns.concat(turn);
    const records = {
      yes: current.records.yes.slice(),
      no: current.records.no.slice(),
      unknown: current.records.unknown.slice()
    };
    let additions = [];
    if (pending.kind === "question" && ["yes", "no", "unknown"].includes(answer)) {
      additions.push({ bucket: answer, id: `${pending.actionId}:${answer}`, text: pending.text });
    }
    for (const record of additions) {
      if (!records[record.bucket].some((item) => item.text === record.text)) {
        records[record.bucket].push({ id: record.id, text: record.text });
      }
    }
    return normalizeLocalSession({
      schemaVersion: SCHEMA_VERSION,
      sessionToken: envelope.sessionToken,
      state: envelope.state,
      turns,
      records,
      pendingAction: null
    });
  }

  function resumeSession(session, payload) {
    const current = normalizeLocalSession(session);
    const envelope = normalizeEnvelope(payload);
    if (envelope.state.sessionId !== current.state.sessionId || envelope.state.domainId !== current.state.domainId) {
      throw new Error("恢复凭据与记录中的场次不匹配。");
    }
    if (envelope.state.revision < current.state.revision) throw new Error("服务器场次比本地记录更旧，已拒绝替换。");
    if (current.state.status !== "playing" && envelope.state.status === "playing") {
      throw new Error("服务器场次状态与本地终局记录冲突。");
    }
    return normalizeLocalSession({ ...current, sessionToken: envelope.sessionToken, state: envelope.state });
  }

  function exportSession(session, exportedAt) {
    const current = normalizeLocalSession(session);
    const at = exportedAt || new Date().toISOString();
    assertIsoDate(at, "导出时间");
    return {
      format: FORMAT,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: at,
      sessionToken: current.sessionToken,
      state: current.state,
      turns: current.turns,
      records: current.records,
      pendingAction: current.pendingAction
    };
  }

  function importSession(bundle) {
    assertPlainObject(bundle, "记录文件");
    if (bundle.format === FORMAT && bundle.schemaVersion === 1) {
      throw new Error("旧版 v1 记录与 AI v2 不兼容；原文件和当前场次均未被修改。");
    }
    assertOnlyKeys(bundle, ["format", "schemaVersion", "exportedAt", "sessionToken", "state", "turns", "records", "pendingAction"], "记录文件");
    assertRequiredKeys(bundle, ["format", "schemaVersion", "exportedAt", "sessionToken", "state", "turns", "records", "pendingAction"], "记录文件");
    if (bundle.format !== FORMAT) throw new Error("这不是科学海龟汤记录文件。");
    if (bundle.schemaVersion !== SCHEMA_VERSION) throw new Error("记录文件版本不受支持。");
    assertIsoDate(bundle.exportedAt, "导出时间");
    return normalizeLocalSession({
      schemaVersion: bundle.schemaVersion,
      sessionToken: bundle.sessionToken,
      state: bundle.state,
      turns: bundle.turns,
      records: bundle.records,
      pendingAction: bundle.pendingAction
    });
  }

  return Object.freeze({
    FORMAT,
    SCHEMA_VERSION,
    MAX_TEXT_LENGTH,
    MAX_TURNS,
    ANSWER_LABELS,
    createSession,
    beginAction,
    cancelPending,
    applyServerAction,
    resumeSession,
    exportSession,
    importSession,
    validateSession: normalizeLocalSession,
    validateServerState(state) { return normalizeState(state, false); }
  });
});
