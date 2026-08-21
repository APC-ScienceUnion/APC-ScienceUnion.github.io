"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Catalog = require("../source/science-turtle-soup/catalog.js");
const Engine = require("../source/science-turtle-soup/engine.js");
const Api = require("../source/science-turtle-soup/api.js");
const legacyFixture = require("./fixtures/science_turtle_soup_session_v1.json");

const TOKEN = `v2.${"a".repeat(80)}`;
const STARTED_AT = "2026-08-21T00:00:00.000Z";
const EXPIRES_AT = "2026-09-20T00:00:00.000Z";

function publicState(overrides) {
  const values = overrides || {};
  const status = values.status || "playing";
  const endedAt = status === "playing"
    ? null
    : (values.endedAt || values.updatedAt || "2026-08-21T00:01:00.000Z");
  const state = {
    sessionId: values.sessionId || "s-public-test-session",
    domainId: values.domainId || "mathematics",
    surface: values.surface || {
      title: "这是一位数学家。",
      hint: "对象由 AI 在开局时生成并锁定。"
    },
    status,
    revision: values.revision === undefined ? 0 : values.revision,
    startedAt: STARTED_AT,
    updatedAt: values.updatedAt || endedAt || STARTED_AT,
    endedAt,
    expiresAt: EXPIRES_AT
  };
  if (status !== "playing") {
    state.reveal = values.reveal || {
      answerName: "终局公开对象",
      explanation: "这段说明只允许在服务端确认终局以后出现。"
    };
  }
  return state;
}

function envelope(overrides) {
  const values = overrides || {};
  const payload = {
    sessionToken: values.sessionToken || TOKEN,
    state: publicState(values.state)
  };
  if (Object.prototype.hasOwnProperty.call(values, "result")) payload.result = values.result;
  return payload;
}

function newSession() {
  return Engine.createSession(envelope());
}

function pending(session, kind, text, actionId) {
  return Engine.beginAction(session, {
    actionId: actionId || "11111111-1111-4111-8111-111111111111",
    kind,
    text,
    at: "2026-08-21T00:00:10.000Z"
  });
}

test("公开目录只有七个领域且不含题库、别名或汤底", () => {
  assert.equal(Catalog.DOMAINS.length, 7);
  assert.equal(Catalog.domainMap.size, 7);
  const serialized = JSON.stringify(Catalog.DOMAINS);
  for (const forbidden of ["aliases", "factSheet", "objectName", "\"reveal\"", "\"seed\""]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  for (const domain of Catalog.DOMAINS) {
    assert.ok(domain.id && domain.label && domain.prompt);
    assert.equal(domain.suggestions.length, 3);
  }
});

test("新场次只接受服务端公开状态与不透明恢复凭据", () => {
  const session = newSession();
  assert.equal(session.schemaVersion, 2);
  assert.equal(session.sessionToken, TOKEN);
  assert.equal(session.state.status, "playing");
  assert.deepEqual(session.turns, []);
  assert.deepEqual(session.records, { yes: [], no: [], unknown: [] });
  assert.equal(session.pendingAction, null);
  const serialized = JSON.stringify(session);
  assert.equal(serialized.includes("\"seed\""), false);
  assert.equal(serialized.includes("\"caseId\""), false);
  assert.equal(Object.prototype.hasOwnProperty.call(session.state, "reveal"), false);
});

test("进行中的服务端状态若含汤底会被拒绝", () => {
  const state = publicState();
  state.reveal = { answerName: "不应出现", explanation: "不应在进行中下发。" };
  assert.throws(() => Engine.createSession({ sessionToken: TOKEN, state }), /进行中的场次不能含汤底/);
});

test("待确认问题不会提前成为问答或不清楚记录", () => {
  const session = pending(newSession(), "question", "他生活在 20 世纪吗？");
  assert.equal(session.pendingAction.text, "他生活在 20 世纪吗？");
  assert.equal(session.turns.length, 0);
  assert.equal(session.records.unknown.length, 0);
  assert.equal(session.state.revision, 0);
});

test("AI 正常答案提交后才追加公开问答和侧栏事实", () => {
  const before = pending(newSession(), "question", "他生活在 20 世纪吗？");
  const after = Engine.applyServerAction(before, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: {
      kind: "question",
      answer: "yes",
      answerLabel: "<b>不可信标签</b>",
      records: [{ bucket: "yes", text: "不渲染服务端自由文本" }]
    }
  }));
  assert.equal(after.pendingAction, null);
  assert.equal(after.turns.length, 1);
  assert.equal(after.turns[0].answer, "yes");
  assert.equal(after.turns[0].answerLabel, "是");
  assert.equal(after.records.yes[0].text, "他生活在 20 世纪吗？");
  assert.equal(JSON.stringify(after).includes("<b>"), false);
  assert.equal(JSON.stringify(after).includes("不渲染服务端自由文本"), false);
});

test("侧栏只记录玩家原命题并去重，不渲染服务端任意说明文本", () => {
  let session = pending(newSession(), "question", "他来自欧洲吗？", "22222222-2222-4222-8222-222222222222");
  session = Engine.applyServerAction(session, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "yes", answerLabel: "任意服务端文字不会显示" }
  }));
  session = pending(session, "question", "他来自欧洲吗？", "33333333-3333-4333-8333-333333333333");
  session = Engine.applyServerAction(session, envelope({
    state: { revision: 2, updatedAt: "2026-08-21T00:00:20.000Z" },
    result: { kind: "question", answer: "yes", answerLabel: "仍不显示" }
  }));
  assert.equal(session.turns.length, 2);
  assert.equal(session.records.yes.length, 1);
  assert.equal(session.records.yes[0].text, "他来自欧洲吗？");
  assert.equal(JSON.stringify(session).includes("任意服务端文字"), false);
});

test("网络或无效响应不会被折叠成 unknown", () => {
  const before = pending(newSession(), "question", "这是一个未知问题吗？");
  const invalid = envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "network-error" }
  });
  assert.throws(() => Engine.applyServerAction(before, invalid), /AI 问答结果无效/);
  assert.equal(before.turns.length, 0);
  assert.equal(before.records.unknown.length, 0);
  assert.ok(before.pendingAction);
});

test("服务端动作必须严格匹配类型、答案、终局状态与下一修订号", () => {
  const question = pending(newSession(), "question", "它是动物吗？");
  assert.throws(() => Engine.applyServerAction(question, envelope({
    state: { revision: 2, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "yes" }
  })), /修订号与当前操作不匹配/);
  assert.throws(() => Engine.applyServerAction(question, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "guess", answer: "incorrect" }
  })), /类型不匹配/);
  assert.throws(() => Engine.applyServerAction(question, envelope({
    state: { status: "solved", revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "yes" }
  })), /AI 问答结果无效/);

  const guess = pending(newSession(), "guess", "某个对象");
  assert.throws(() => Engine.applyServerAction(guess, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "guess", answer: "correct" }
  })), /AI 猜测结果无效/);
  assert.throws(() => Engine.applyServerAction(guess, envelope({
    state: { status: "solved", revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "guess", answer: "incorrect" }
  })), /AI 猜测结果无效/);
});

test("明确的 unknown 是已确认回合并保留玩家原文", () => {
  const text = "<img src=x onerror=alert(1)> 它喜欢咖啡吗？";
  const before = pending(newSession(), "question", text);
  const after = Engine.applyServerAction(before, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "unknown", answerLabel: "不清楚" }
  }));
  assert.equal(after.turns[0].answer, "unknown");
  assert.equal(after.records.unknown[0].text, text);
});

test("错误猜测不揭晓，正确猜测只信服务端终局状态", () => {
  let session = pending(newSession(), "guess", "错误对象", "44444444-4444-4444-8444-444444444444");
  session = Engine.applyServerAction(session, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "guess", answer: "incorrect" }
  }));
  assert.equal(session.state.status, "playing");
  assert.equal(session.turns[0].answer, "incorrect");
  assert.equal(Object.prototype.hasOwnProperty.call(session.state, "reveal"), false);
  assert.equal(session.records.no[0].text, "不是错误对象");

  session = pending(session, "guess", "正确对象", "55555555-5555-4555-8555-555555555555");
  session = Engine.applyServerAction(session, envelope({
    state: {
      status: "solved",
      revision: 2,
      updatedAt: "2026-08-21T00:00:20.000Z"
    },
    result: { kind: "guess", answer: "correct" }
  }));
  assert.equal(session.state.status, "solved");
  assert.equal(session.turns[1].answer, "correct");
  assert.equal(session.state.reveal.answerName, "终局公开对象");
});

test("放弃揭晓由服务端终局状态提供汤底", () => {
  const before = pending(newSession(), "reveal", "");
  const after = Engine.applyServerAction(before, envelope({
    state: {
      status: "revealed",
      revision: 1,
      updatedAt: "2026-08-21T00:00:20.000Z"
    },
    result: { kind: "reveal", answer: "revealed" }
  }));
  assert.equal(after.state.status, "revealed");
  assert.equal(after.turns[0].answer, "revealed");
  assert.ok(after.state.reveal.explanation);

  const withoutResult = Engine.applyServerAction(
    pending(newSession(), "reveal", "", "99999999-9999-4999-8999-999999999999"),
    envelope({
      state: { status: "revealed", revision: 1, updatedAt: "2026-08-21T00:00:20.000Z" }
    })
  );
  assert.equal(withoutResult.turns[0].answer, "revealed");
});

test("终局后不能创建新的待确认操作", () => {
  const guessing = pending(newSession(), "guess", "正确对象");
  const terminal = Engine.applyServerAction(guessing, envelope({
    state: { status: "solved", revision: 1 },
    result: { kind: "guess", answer: "correct" }
  }));
  assert.throws(
    () => pending(terminal, "question", "还能继续吗？"),
    /已经结束/
  );
});

test("恢复只覆盖权威状态并保留本地可见历史", () => {
  let session = pending(newSession(), "question", "他来自欧洲吗？");
  session = Engine.applyServerAction(session, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "yes" }
  }));
  const rotated = `v2.${"b".repeat(90)}`;
  const resumed = Engine.resumeSession(session, envelope({
    sessionToken: rotated,
    state: { revision: 2, updatedAt: "2026-08-21T00:00:30.000Z" }
  }));
  assert.equal(resumed.sessionToken, rotated);
  assert.equal(resumed.state.revision, 2);
  assert.equal(resumed.turns.length, 1);
  assert.equal(resumed.records.yes.length, 1);
});

test("恢复拒绝错场次、错领域和倒退修订号", () => {
  const session = newSession();
  assert.throws(() => Engine.resumeSession(session, envelope({
    state: { sessionId: "s-another-session" }
  })), /不匹配/);
  assert.throws(() => Engine.resumeSession(session, envelope({
    state: { domainId: "biology" }
  })), /不匹配/);
  const ahead = Engine.resumeSession(session, envelope({ state: { revision: 2 } }));
  assert.throws(() => Engine.resumeSession(ahead, envelope({ state: { revision: 1 } })), /更旧/);
});

test("超时后的 pending 可导出、恢复并用同一 actionId确认", () => {
  const actionId = "66666666-6666-4666-8666-666666666666";
  const before = pending(newSession(), "question", "它位于太阳系内吗？", actionId);
  const restored = Engine.importSession(JSON.parse(JSON.stringify(
    Engine.exportSession(before, "2026-08-21T00:02:00.000Z")
  )));
  assert.equal(restored.pendingAction.actionId, actionId);
  const after = Engine.applyServerAction(restored, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "no" }
  }));
  assert.equal(after.turns[0].id, actionId);
  assert.equal(after.turns.length, 1);
});

test("playing 导出文件含 token 与公开记录但没有 seed、caseId 或汤底", () => {
  let session = pending(newSession(), "question", "他来自欧洲吗？");
  session = Engine.applyServerAction(session, envelope({
    state: { revision: 1, updatedAt: "2026-08-21T00:00:12.000Z" },
    result: { kind: "question", answer: "yes" }
  }));
  const bundle = Engine.exportSession(session, "2026-08-21T00:02:00.000Z");
  const serialized = JSON.stringify(bundle);
  assert.equal(bundle.schemaVersion, 2);
  assert.equal(bundle.sessionToken, TOKEN);
  assert.equal(bundle.turns.length, 1);
  for (const forbidden of ["\"seed\"", "\"caseId\"", "\"aliases\"", "\"objectName\"", "\"reveal\""]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  assert.deepEqual(Engine.importSession(JSON.parse(serialized)), session);
});

test("终局导出允许服务端已公开的 reveal", () => {
  const revealing = pending(newSession(), "reveal", "");
  const terminal = Engine.applyServerAction(revealing, envelope({
    state: { status: "revealed", revision: 1 },
    result: { kind: "reveal", answer: "revealed" }
  }));
  const serialized = JSON.stringify(Engine.exportSession(terminal, "2026-08-21T00:02:00.000Z"));
  assert.equal(serialized.includes("\"reveal\""), true);
  assert.equal(serialized.includes("终局公开对象"), true);
});

test("旧 v1 文件被明确拒绝且输入对象不被修改", () => {
  const before = JSON.stringify(legacyFixture);
  assert.throws(() => Engine.importSession(legacyFixture), /旧版 v1 记录与 AI v2 不兼容/);
  assert.equal(JSON.stringify(legacyFixture), before);
});

test("导入严格拒绝未知字段、空 token、超长文字和伪终局", () => {
  const good = Engine.exportSession(newSession(), "2026-08-21T00:02:00.000Z");
  const unknown = JSON.parse(JSON.stringify(good));
  unknown.state.seed = 42;
  assert.throws(() => Engine.importSession(unknown), /未知字段/);

  const noToken = JSON.parse(JSON.stringify(good));
  noToken.sessionToken = "";
  assert.throws(() => Engine.importSession(noToken), /恢复凭据无效/);

  const longPending = JSON.parse(JSON.stringify(good));
  longPending.pendingAction = {
    actionId: "77777777-7777-4777-8777-777777777777",
    kind: "question",
    text: "问".repeat(221),
    at: STARTED_AT,
    baseRevision: 0
  };
  assert.throws(() => Engine.importSession(longPending), /文字无效/);

  const fakeReveal = JSON.parse(JSON.stringify(good));
  fakeReveal.state.reveal = { answerName: "伪造", explanation: "进行中的文件不应接受汤底。" };
  assert.throws(() => Engine.importSession(fakeReveal), /进行中的场次不能含汤底/);
});

test("16KB 上限内的加密 token 可导入导出", () => {
  const largeToken = `v2.${"x".repeat(12000)}`;
  const session = Engine.createSession(envelope({ sessionToken: largeToken }));
  const restored = Engine.importSession(Engine.exportSession(session, "2026-08-21T00:02:00.000Z"));
  assert.equal(restored.sessionToken, largeToken);
});

test("API 五种动作使用同源端点与精确 JSON body", async (t) => {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return new Response(JSON.stringify(envelope()), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
  t.after(() => { global.fetch = originalFetch; });

  const actionId = "88888888-8888-4888-8888-888888888888";
  await Api.start("biology", actionId);
  await Api.question(TOKEN, "它是动物吗？", 0, actionId);
  await Api.guess(TOKEN, "某个对象", 1, actionId);
  await Api.reveal(TOKEN, 2, actionId);
  await Api.resume(TOKEN);

  assert.equal(calls.length, 5);
  for (const call of calls) {
    assert.equal(call.url, "/api/science-soup");
    assert.equal(call.options.method, "POST");
    assert.equal(call.options.credentials, "same-origin");
    assert.equal(call.options.cache, "no-store");
    assert.equal(call.options.headers["Content-Type"], "application/json");
  }
  assert.deepEqual(calls.map((call) => call.body), [
    { action: "start", domainId: "biology", actionId },
    { action: "question", sessionToken: TOKEN, text: "它是动物吗？", revision: 0, actionId },
    { action: "guess", sessionToken: TOKEN, text: "某个对象", revision: 1, actionId },
    { action: "reveal", sessionToken: TOKEN, revision: 2, actionId },
    { action: "resume", sessionToken: TOKEN }
  ]);
});

test("API 自动生成符合服务端契约的随机 UUID v4", () => {
  const first = Api.createActionId();
  const second = Api.createActionId();
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.match(first, pattern);
  assert.match(second, pattern);
  assert.notEqual(first, second);
  assert.throws(() => Engine.beginAction(newSession(), {
    actionId: "action-not-a-uuid",
    kind: "question",
    text: "它是动物吗？",
    at: "2026-08-21T00:00:10.000Z"
  }), /操作编号无效/);
});

test("API 网络错误和超时是可重试错误，不伪造 unknown", async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });

  global.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(
    () => Api.request({ action: "resume", sessionToken: TOKEN }),
    (error) => error.code === "NETWORK_ERROR" && error.retryable === true
  );

  global.fetch = (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  });
  await assert.rejects(
    () => Api.request({ action: "resume", sessionToken: TOKEN }, { timeoutMs: 5 }),
    (error) => error.code === "TIMEOUT" && error.retryable === true
  );
});

test("API 错误响应保留服务端错误码与重试建议", async (t) => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({
    error: {
      code: "AI_UNAVAILABLE",
      message: "AI 暂时没有响应，请重试。",
      retryable: true,
      retryAfterMs: 3000,
      requestId: "request-test"
    }
  }), {
    status: 503,
    headers: { "Content-Type": "application/json" }
  });
  t.after(() => { global.fetch = originalFetch; });
  await assert.rejects(
    () => Api.resume(TOKEN),
    (error) => error.status === 503
      && error.code === "AI_UNAVAILABLE"
      && error.retryable
      && error.retryAfterMs === 3000
  );
});

test("静态入口不再引用或发布 cases.js，app 不再依赖本地题库", () => {
  const root = path.resolve(__dirname, "../source/science-turtle-soup");
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.equal(fs.existsSync(path.join(root, "cases.js")), false);
  assert.equal(index.includes("cases.js"), false);
  assert.equal(index.includes("./catalog.js"), true);
  assert.equal(index.includes("./api.js"), true);
  assert.equal(app.includes("ScienceSoupCases"), false);
  assert.equal(app.includes("getCaseForSession"), false);
  assert.equal(app.includes("randomSeed"), false);
});
