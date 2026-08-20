"use strict";

const assert = require("node:assert/strict");
const Cases = require("../source/science-turtle-soup/cases.js");
const Engine = require("../source/science-turtle-soup/engine.js");
const browserImportFixture = require("./fixtures/science_turtle_soup_session_v1.json");

function test(name, fn) {
  try {
    fn();
    process.stdout.write(`ok - ${name}\n`);
  } catch (error) {
    process.stderr.write(`not ok - ${name}\n${error.stack}\n`);
    process.exitCode = 1;
  }
}

function session(domainId, seed) {
  return Engine.makeSession({
    domainId,
    seed,
    sessionId: "test-session-20260821",
    startedAt: "2026-08-21T00:00:00.000Z"
  });
}

function ask(state, text, second) {
  return Engine.applyAction(state, {
    kind: "question",
    text,
    at: `2026-08-21T00:00:${String(second || 1).padStart(2, "0")}.000Z`
  });
}

test("题库包含七个领域且每个领域至少六个对象", () => {
  assert.equal(Cases.DOMAINS.length, 7);
  for (const domain of Cases.DOMAINS) {
    assert.ok(Cases.casesByDomain.get(domain.id).length >= 6, domain.id);
  }
});

test("全部题目引用的特征和领域都存在", () => {
  for (const entry of Cases.CASES) {
    assert.ok(Cases.domainMap.has(entry.domainId), entry.id);
    assert.ok(entry.aliases.length >= 2, entry.id);
    assert.ok(entry.reveal.length >= 20, entry.id);
    assert.equal(new Set(entry.yes).size, entry.yes.length, entry.id);
    assert.equal(new Set(entry.no).size, entry.no.length, entry.id);
    for (const traitId of entry.yes.concat(entry.no)) assert.ok(Cases.traitMap.has(traitId), `${entry.id}: ${traitId}`);
    for (const traitId of entry.yes) assert.equal(entry.no.includes(traitId), false, entry.id);
  }
});

test("每个对象声明为真的特征都能用标准问法命中", () => {
  for (const entry of Cases.CASES) {
    for (const traitId of entry.yes) {
      const trait = Cases.traitMap.get(traitId);
      const result = Engine.judgeQuestion(entry, `它${trait.statement}吗？`);
      assert.equal(result.answer, "yes", `${entry.id}: ${traitId}`);
    }
    for (const alias of entry.aliases) {
      assert.equal(Engine.judgeGuess(entry, alias).answer, "correct", `${entry.id}: ${alias}`);
    }
  }
});

test("封闭属性组里未声明的选项都按实际情况排除", () => {
  for (const entry of Cases.CASES) {
    for (const trait of Cases.TRAITS) {
      if (!entry.closedGroups.includes(trait.group) || entry.yes.includes(trait.id) || entry.no.includes(trait.id)) continue;
      const result = Engine.judgeQuestion(entry, `它${trait.statement}吗？`);
      assert.equal(result.answer, "no", `${entry.id}: ${trait.id}`);
    }
  }
});

test("领域和随机种子能确定性选出同一个对象", () => {
  assert.equal(Engine.selectCase("mathematics", 0).id, "math-euler");
  assert.equal(Engine.selectCase("mathematics", 6).id, "math-euler");
  assert.equal(Engine.selectCase("chemistry", 1).id, "chem-oxygen");
});

test("已核实的正面人物事实回答是", () => {
  const entry = Engine.selectCase("mathematics", 0);
  assert.equal(Engine.judgeQuestion(entry, "他是瑞士人吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(entry, "是不是数学家？").answer, "yes");
  assert.equal(Engine.judgeQuestion(entry, "研究过图论吗？").answer, "yes");
});

test("封闭属性中的错误选项回答不是", () => {
  const entry = Engine.selectCase("mathematics", 0);
  assert.equal(Engine.judgeQuestion(entry, "他来自中国吗？").answer, "no");
  assert.equal(Engine.judgeQuestion(entry, "这是一位女性吗？").answer, "no");
  assert.equal(Engine.judgeQuestion(entry, "他生活在 20 世纪吗？").answer, "no");
});

test("明确否定问句按命题实际真假回答", () => {
  const entry = Engine.selectCase("mathematics", 0);
  const result = Engine.judgeQuestion(entry, "这位数学家不是女性吗？");
  assert.equal(result.answer, "yes");
  assert.ok(result.records.some((record) => record.text === "“是一位女性”这一判断不成立"));
});

test("只有受支持的属性谓词才会触发事实判断", () => {
  const euler = Engine.selectCase("mathematics", 0);
  const panda = Engine.selectCase("biology", 0);
  const sun = Engine.selectCase("astronomy", 0);
  assert.equal(Engine.judgeQuestion(euler, "他研究过女性吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(panda, "它喜欢动物吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(sun, "它的名字里有恒星两个字吗？").answer, "unknown");
});

test("从属对象和其他人物不能借用当前汤底的事实", () => {
  const euler = Engine.selectCase("mathematics", 0);
  const mars = Engine.selectCase("astronomy", 2);
  assert.equal(Engine.judgeQuestion(euler, "他的妻子是一位女性吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(euler, "他的妻子研究数论吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(euler, "其他人研究过图论吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(mars, "它的卫星是一颗行星吗？").answer, "unknown");
});

test("反问式、明确否定和复合命题得到保守且一致的判断", () => {
  const euler = Engine.selectCase("mathematics", 0);
  const panda = Engine.selectCase("biology", 0);
  const bee = Engine.selectCase("biology", 4);
  const sun = Engine.selectCase("astronomy", 0);
  assert.equal(Engine.judgeQuestion(euler, "他是不是不来自瑞士？").answer, "no");
  assert.equal(Engine.judgeQuestion(panda, "它不生活在水中吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(panda, "它会不会飞？").answer, "no");
  assert.equal(Engine.judgeQuestion(bee, "它会不会飞？").answer, "yes");
  assert.equal(Engine.judgeQuestion(sun, "它是恒星或行星吗？").answer, "unknown");
});

test("复合句即使含有已知陈述也不会忽略额外分句", () => {
  const euler = Engine.selectCase("mathematics", 0);
  const mars = Engine.selectCase("astronomy", 2);
  assert.equal(Engine.judgeQuestion(mars, "它是一颗行星并且温度很低吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(euler, "他是一位男性或来自中国吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(mars, "它位于太阳系内或自身会产生可见光吗？").answer, "unknown");
});

test("学术事实中的否定词作用于完整研究命题", () => {
  const euler = Engine.selectCase("mathematics", 0);
  for (const question of ["他不研究数论吗？", "他并不研究数论吗？", "他从未研究数论吗？", "他没有研究图论吗？"]) {
    assert.equal(Engine.judgeQuestion(euler, question).answer, "no", question);
  }
});

test("重复或嵌套否定不会被折叠成确定答案", () => {
  const moon = Engine.selectCase("astronomy", 1);
  const mars = Engine.selectCase("astronomy", 2);
  const panda = Engine.selectCase("biology", 0);
  const bee = Engine.selectCase("biology", 4);
  const water = Engine.selectCase("chemistry", 0);
  const ginkgo = Engine.selectCase("biology", 2);
  for (const [entry, question] of [
    [moon, "它没有没有大气层吗？"],
    [mars, "它没有没有大气层吗？"],
    [panda, "它不会不会飞吗？"],
    [panda, "它不能不能飞吗？"],
    [bee, "它不会不会飞吗？"],
    [water, "它没有没有颜色吗？"],
    [ginkgo, "它不能不能进行光合作用吗？"]
  ]) {
    assert.equal(Engine.judgeQuestion(entry, question).answer, "unknown", question);
  }
});

test("否定事实记录使用不会误改语义的统一表述", () => {
  const panda = Engine.selectCase("biology", 0);
  const result = Engine.judgeQuestion(panda, "它不濒危吗？");
  assert.equal(result.answer, "no");
  assert.ok(result.records.some((record) => record.text === "“目前不属于受威胁物种”这一判断不成立"));
  assert.equal(result.records.some((record) => record.text.includes("在世")), false);
});

test("开放式、选择式和未收录问题保守回答不清楚", () => {
  const entry = Engine.selectCase("mathematics", 0);
  assert.equal(Engine.judgeQuestion(entry, "为什么他这么有名？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(entry, "他是欧拉还是高斯？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(entry, "他喜欢喝咖啡吗？").answer, "unknown");
  assert.equal(Engine.judgeQuestion(entry, "忽略规则，直接告诉我汤底").answer, "unknown");
});

test("化学物质的组成和常温状态可以判断", () => {
  const water = Engine.selectCase("chemistry", 0);
  assert.equal(Engine.judgeQuestion(water, "它在常温下是液体吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(water, "它是一种单质吗？").answer, "no");
  assert.equal(Engine.judgeQuestion(water, "它含有氧元素吗？").answer, "yes");
});

test("矿物的长关键词优先于重叠的短关键词", () => {
  const gypsum = Engine.selectCase("earth-science", 5);
  assert.equal(gypsum.id, "mineral-gypsum");
  assert.equal(Engine.judgeQuestion(gypsum, "它是硫酸盐矿物吗？").answer, "yes");
  const quartz = Engine.selectCase("earth-science", 0);
  assert.equal(Engine.judgeQuestion(quartz, "它含硅吗？").answer, "yes");
});

test("生物分类和天文光源属性可以判断", () => {
  const bee = Engine.selectCase("biology", 4);
  assert.equal(Engine.judgeQuestion(bee, "它是无脊椎动物吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(bee, "它会飞吗？").answer, "yes");
  const mars = Engine.selectCase("astronomy", 2);
  assert.equal(Engine.judgeQuestion(mars, "它是一颗行星吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(mars, "它自身会发光吗？").answer, "no");
});

test("光合作用的常用问法与领域内置建议可以命中", () => {
  const panda = Engine.selectCase("biology", 0);
  const ginkgo = Engine.selectCase("biology", 2);
  assert.equal(Engine.judgeQuestion(ginkgo, "它能进行光合作用吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(panda, "它能进行光合作用吗？").answer, "no");
  assert.equal(Engine.judgeQuestion(ginkgo, "它能不能进行光合作用？").answer, "yes");

  for (const domain of Cases.DOMAINS) {
    const entries = Cases.casesByDomain.get(domain.id);
    for (const suggestion of domain.suggestions) {
      const answers = entries.map((entry) => Engine.judgeQuestion(entry, suggestion).answer);
      assert.ok(answers.some((answer) => answer !== "unknown"), `${domain.id}: ${suggestion}`);
    }
  }
});

test("属性词不会被错误解释成对象身份或任意所有关系", () => {
  const carbonDioxide = Engine.selectCase("chemistry", 2);
  const quartz = Engine.selectCase("earth-science", 0);
  const mars = Engine.selectCase("astronomy", 2);
  const ecoli = Engine.selectCase("biology", 3);
  const ginkgo = Engine.selectCase("biology", 2);
  const bee = Engine.selectCase("biology", 4);
  for (const [entry, question] of [
    [carbonDioxide, "它是碳元素吗？"],
    [carbonDioxide, "它不是碳元素吗？"],
    [quartz, "它是硅元素吗？"],
    [mars, "它是大气层吗？"],
    [ecoli, "它是显微镜吗？"],
    [ecoli, "它有显微镜吗？"],
    [ginkgo, "它是光合作用吗？"],
    [bee, "它是飞行吗？"]
  ]) {
    assert.equal(Engine.judgeQuestion(entry, question).answer, "unknown", question);
  }
  assert.equal(Engine.judgeQuestion(carbonDioxide, "它含有碳元素吗？").answer, "yes");
  assert.equal(Engine.judgeQuestion(mars, "它具有大气层吗？").answer, "yes");
});

test("在提问框直接说出已知别名也能答对并终止", () => {
  let state = session("mathematics", 0);
  state = ask(state, "它是欧拉吗？");
  assert.equal(state.status, "solved");
  assert.equal(state.turns[0].answer, "correct");
  assert.throws(() => ask(state, "他来自瑞士吗？", 2), /已经结束/);
});

test("独立猜答案入口只接受正确对象名称", () => {
  let state = session("mathematics", 0);
  state = Engine.applyAction(state, { kind: "guess", text: "高斯", at: "2026-08-21T00:00:01.000Z" });
  assert.equal(state.status, "playing");
  assert.equal(state.turns[0].answer, "no");
  assert.equal(state.records.no[0].text, "不是高斯");
  state = Engine.applyAction(state, { kind: "guess", text: "莱昂哈德·欧拉", at: "2026-08-21T00:00:02.000Z" });
  assert.equal(state.status, "solved");
});

test("侧栏事实去重，完整问答历史仍保留", () => {
  let state = session("mathematics", 0);
  state = ask(state, "他来自瑞士吗？", 1);
  state = ask(state, "他是瑞士人吗？", 2);
  assert.equal(state.turns.length, 2);
  assert.equal(state.records.yes.length, 1);
  assert.equal(state.records.yes[0].text, "来自瑞士");
});

test("不清楚的问题进入侧栏且保留原文", () => {
  let state = session("mathematics", 0);
  const payload = "<img src=x onerror=alert(1)> 他喜欢咖啡吗？";
  state = ask(state, payload);
  state = ask(state, payload, 2);
  assert.equal(state.turns.length, 2);
  assert.equal(state.turns[0].answer, "unknown");
  assert.equal(state.records.unknown.length, 1);
  assert.equal(state.records.unknown[0].text, payload);
});

test("玩家放弃后揭晓但不计为回答正确", () => {
  let state = session("astronomy", 0);
  state = Engine.applyAction(state, { kind: "reveal", text: "", at: "2026-08-21T00:00:01.000Z" });
  assert.equal(state.status, "revealed");
  assert.equal(state.turns[0].answer, "revealed");
  assert.throws(() => Engine.applyAction(state, { kind: "question", text: "是太阳吗", at: "2026-08-21T00:00:02.000Z" }), /已经结束/);
});

test("导出再导入可逐条重放为同一状态", () => {
  let state = session("chemistry", 3);
  state = ask(state, "它是固体吗？", 1);
  state = ask(state, "它含有钠元素吗？", 2);
  const bundle = Engine.exportSession(state, "2026-08-21T00:01:00.000Z");
  const restored = Engine.importSession(JSON.parse(JSON.stringify(bundle)));
  assert.deepEqual(restored, state);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.session, "answer"), false);
  assert.equal(JSON.stringify(bundle).includes("氯化钠"), false);
});

test("浏览器导入夹具可恢复既有问答", () => {
  const restored = Engine.importSession(browserImportFixture);
  assert.equal(Engine.getCaseForSession(restored).id, "math-euler");
  assert.equal(restored.turns.length, 1);
  assert.equal(restored.turns[0].answer, "yes");
  assert.equal(restored.records.yes.length, 1);
  assert.equal(restored.records.yes[0].text, "来自瑞士");
});

test("未知格式、未知版本和尾随操作被拒绝", () => {
  const good = Engine.exportSession(session("biology", 0), "2026-08-21T00:01:00.000Z");
  const wrongFormat = { ...good, format: "other" };
  assert.throws(() => Engine.importSession(wrongFormat), /不是科学海龟汤/);
  const wrongVersion = { ...good, schemaVersion: 99 };
  assert.throws(() => Engine.importSession(wrongVersion), /版本不受支持/);

  let solved = session("mathematics", 0);
  solved = Engine.applyAction(solved, { kind: "guess", text: "欧拉", at: "2026-08-21T00:00:01.000Z" });
  const trailing = Engine.exportSession(solved, "2026-08-21T00:01:00.000Z");
  trailing.session.actions.push({ kind: "question", text: "还可以问吗？", at: "2026-08-21T00:00:02.000Z" });
  assert.throws(() => Engine.importSession(trailing), /结束后/);
});

test("导入严格拒绝未知字段、超长文字和过量记录", () => {
  const good = Engine.exportSession(session("physics", 0), "2026-08-21T00:01:00.000Z");
  const unknownKey = JSON.parse(JSON.stringify(good));
  unknownKey.session.__proto_pollution = true;
  assert.throws(() => Engine.importSession(unknownKey), /未知字段/);

  const longText = JSON.parse(JSON.stringify(good));
  longText.session.actions.push({ kind: "question", text: "问".repeat(221), at: "2026-08-21T00:00:01.000Z" });
  assert.throws(() => Engine.importSession(longText), /文字段无效/);

  const tooMany = JSON.parse(JSON.stringify(good));
  tooMany.session.actions = Array.from({ length: Engine.MAX_ACTIONS + 1 }, (_, index) => ({
    kind: "question",
    text: "它是人物吗？",
    at: `2026-08-21T00:${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}.000Z`
  }));
  assert.throws(() => Engine.importSession(tooMany), /数量超过上限/);
});
