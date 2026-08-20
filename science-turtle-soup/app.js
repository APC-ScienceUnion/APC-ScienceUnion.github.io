"use strict";

(function startScienceTurtleSoup() {
  const Cases = globalThis.ScienceSoupCases;
  const Engine = globalThis.ScienceSoupEngine;
  if (!Cases || !Engine) throw new Error("科学海龟汤核心模块没有加载。");

  const STORAGE_KEY = "apc.science-turtle-soup.current.v1";
  const BACKUP_KEY = "apc.science-turtle-soup.backup.v1";
  const OPFS_FILE = "science-turtle-soup-active.json";
  const LOCK_NAME = "apc.science-turtle-soup.writer.v1";
  const LOCK_DB_NAME = "apc.science-turtle-soup.coordination.v1";
  const LOCK_STORE_NAME = "leases";
  const LOCK_LEASE_MS = 12000;
  const MAX_FILE_BYTES = 256 * 1024;
  const tabId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const elements = {};
  const ids = [
    "rulesButton", "newGameButton", "domainSymbol", "domainName", "sessionState", "caseCode",
    "surfaceTitle", "surfaceHint", "questionCount", "knownCount", "excludedCount", "suggestionList",
    "roundLabel", "historyList", "emptyHistory", "composer", "questionInput", "characterCount", "guessButton",
    "askButton", "finishedPanel", "finishedEyebrow", "finishedTitle", "answerName", "answerReveal",
    "finishedNewGame", "saveStatus", "saveDetail", "lockChip", "yesCount", "noCount", "unknownCount",
    "yesRecords", "noRecords", "unknownRecords", "exportButton", "importButton", "revealButton", "recordInput",
    "setupDialog", "domainGrid", "replaceWarning", "startGameButton", "guessDialog", "guessForm", "guessInput",
    "submitGuessButton", "rulesDialog", "toast"
  ];
  for (const id of ids) elements[id] = document.getElementById(id);

  let currentSession = null;
  let selectedDomainId = Cases.DOMAINS[0].id;
  let isWritable = false;
  let lockMode = "checking";
  let releaseLock = null;
  let leaseTimer = null;
  let toastTimer = null;
  let storageInfo = { local: false, opfs: false, error: "" };
  let saveQueue = Promise.resolve();
  let channel = null;
  let lockDatabasePromise = null;
  let leaseRefreshInFlight = false;
  let mutationInProgress = false;

  function showToast(message, isError) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = String(message);
    elements.toast.classList.toggle("is-error", Boolean(isError));
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
  }

  function randomSeed() {
    if (globalThis.crypto && typeof crypto.getRandomValues === "function") {
      return crypto.getRandomValues(new Uint32Array(1))[0];
    }
    return Math.floor(Math.random() * 0x100000000) >>> 0;
  }

  function makeSessionId() {
    if (globalThis.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `soup-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      storageInfo.error = "浏览器已禁止站点本地存储";
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      storageInfo.local = true;
      return true;
    } catch (error) {
      storageInfo.local = false;
      storageInfo.error = "自动保存不可用，请及时导出记录";
      return false;
    }
  }

  async function readOpfsText() {
    if (!navigator.storage || typeof navigator.storage.getDirectory !== "function") return null;
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle(OPFS_FILE);
      const file = await handle.getFile();
      if (file.size > MAX_FILE_BYTES) throw new Error("本地状态文件过大");
      storageInfo.opfs = true;
      return await file.text();
    } catch (error) {
      if (error && error.name === "NotFoundError") return null;
      return null;
    }
  }

  async function writeOpfsText(text) {
    if (!navigator.storage || typeof navigator.storage.getDirectory !== "function") return false;
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle(OPFS_FILE, { create: true });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      storageInfo.opfs = true;
      return true;
    } catch (error) {
      storageInfo.opfs = false;
      return false;
    }
  }

  function parseStoredCandidate(text, source) {
    if (!text || typeof text !== "string" || text.length > MAX_FILE_BYTES) return null;
    try {
      const bundle = JSON.parse(text);
      const session = Engine.importSession(bundle);
      return { source, bundle, session, timestamp: Date.parse(bundle.exportedAt) || 0 };
    } catch (error) {
      return null;
    }
  }

  const StateStore = {
    async load() {
      const candidates = [];
      const current = parseStoredCandidate(safeStorageGet(STORAGE_KEY), "local");
      const backup = parseStoredCandidate(safeStorageGet(BACKUP_KEY), "backup");
      const opfs = parseStoredCandidate(await readOpfsText(), "opfs");
      if (current) candidates.push(current);
      if (backup) candidates.push(backup);
      if (opfs) candidates.push(opfs);
      candidates.sort((a, b) => b.timestamp - a.timestamp || b.session.revision - a.session.revision);
      return candidates[0] || null;
    },

    async save(session) {
      const bundle = Engine.exportSession(session);
      const text = JSON.stringify(bundle);
      const previous = safeStorageGet(STORAGE_KEY);
      if (previous && previous !== text) safeStorageSet(BACKUP_KEY, previous);
      const localSaved = safeStorageSet(STORAGE_KEY, text);
      saveQueue = saveQueue.then(() => writeOpfsText(text)).catch(() => false);
      const opfsSaved = await saveQueue;
      const persisted = localSaved || opfsSaved;
      if (!persisted) storageInfo.error = "自动保存失败，请导出记录后再继续";
      renderSaveStatus();
      return { bundle, persisted, local: localSaved, opfs: opfsSaved };
    }
  };

  function openLockDatabase() {
    if (!globalThis.indexedDB) return Promise.reject(new Error("浏览器不支持单场互斥锁"));
    if (lockDatabasePromise) return lockDatabasePromise;
    lockDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(LOCK_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(LOCK_STORE_NAME)) {
          database.createObjectStore(LOCK_STORE_NAME, { keyPath: "name" });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(request.error || new Error("无法打开单场锁数据库"));
      request.onblocked = () => reject(new Error("单场锁数据库被其他页面占用"));
    });
    return lockDatabasePromise;
  }

  async function updateIndexedDbLease(mode) {
    const database = await openLockDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(LOCK_STORE_NAME, "readwrite");
      const store = transaction.objectStore(LOCK_STORE_NAME);
      const request = store.get(LOCK_NAME);
      let outcome = false;
      request.onsuccess = () => {
        const existing = request.result;
        const now = Date.now();
        const ownedByOther = existing
          && existing.owner !== tabId
          && Number.isFinite(existing.expiresAt)
          && existing.expiresAt > now;
        if (mode === "acquire") {
          if (ownedByOther) return;
          store.put({ name: LOCK_NAME, owner: tabId, expiresAt: now + LOCK_LEASE_MS });
          outcome = true;
        } else if (mode === "renew") {
          if (!existing || existing.owner !== tabId) return;
          store.put({ name: LOCK_NAME, owner: tabId, expiresAt: now + LOCK_LEASE_MS });
          outcome = true;
        } else if (mode === "release") {
          if (!existing || existing.owner !== tabId) return;
          store.delete(LOCK_NAME);
          outcome = true;
        }
      };
      transaction.oncomplete = () => resolve(outcome);
      transaction.onerror = () => reject(transaction.error || new Error("单场锁事务失败"));
      transaction.onabort = () => reject(transaction.error || new Error("单场锁事务被中止"));
    });
  }

  function loseWriterAccess() {
    isWritable = false;
    lockMode = "readonly";
    window.clearInterval(leaseTimer);
    leaseTimer = null;
    releaseLock = null;
    storageInfo.error = "单场锁已失效，请刷新页面后重试";
    render();
    showToast("本页已失去单场写入权，已切换为只读。", true);
  }

  async function acquireIndexedDbLease() {
    try {
      const acquired = await updateIndexedDbLease("acquire");
      if (!acquired) return false;
      leaseTimer = window.setInterval(() => {
        if (leaseRefreshInFlight) return;
        leaseRefreshInFlight = true;
        updateIndexedDbLease("renew")
          .then((renewed) => { if (!renewed) loseWriterAccess(); })
          .catch(() => loseWriterAccess())
          .finally(() => { leaseRefreshInFlight = false; });
      }, 3500);
      let released = false;
      releaseLock = () => {
        if (released) return;
        released = true;
        window.clearInterval(leaseTimer);
        leaseTimer = null;
        updateIndexedDbLease("release").catch(() => {});
      };
      return true;
    } catch (error) {
      storageInfo.error = "当前浏览器无法取得单场锁";
      return false;
    }
  }

  async function acquireWriterLock() {
    if (navigator.locks && typeof navigator.locks.request === "function") {
      const result = await new Promise((resolve) => {
        let resolved = false;
        navigator.locks.request(LOCK_NAME, { mode: "exclusive", ifAvailable: true }, async (lock) => {
          if (!resolved) {
            resolved = true;
            resolve(Boolean(lock));
          }
          if (!lock) return;
          await new Promise((release) => { releaseLock = release; });
        }).catch(() => {
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        });
      });
      if (result === null) {
        lockMode = "readonly";
        storageInfo.error = "浏览器单场锁请求失败";
        return false;
      }
      lockMode = result ? "web-lock" : "readonly";
      return Boolean(result);
    }
    const acquired = await acquireIndexedDbLease();
    lockMode = acquired ? "indexeddb-lock" : "readonly";
    return acquired;
  }

  async function ensureWriterAccess() {
    if (!isWritable) return false;
    if (lockMode !== "indexeddb-lock") return true;
    try {
      const renewed = await updateIndexedDbLease("renew");
      if (renewed) return true;
    } catch (error) {
      // Losing the coordination store must never leave this page writable.
    }
    loseWriterAccess();
    return false;
  }

  function broadcastUpdate() {
    if (channel) channel.postMessage({ type: "state-updated", revision: currentSession ? currentSession.revision : -1 });
  }

  async function reloadReadonlyState() {
    if (isWritable) return;
    const restored = await StateStore.load();
    if (restored) {
      currentSession = restored.session;
      render();
    }
  }

  function renderDomainOptions() {
    elements.domainGrid.replaceChildren();
    for (const domain of Cases.DOMAINS) {
      const label = document.createElement("label");
      label.className = "domain-option";
      label.dataset.domain = domain.id;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "science-domain";
      input.value = domain.id;
      input.checked = domain.id === selectedDomainId;
      input.addEventListener("change", () => {
        selectedDomainId = domain.id;
        updateDomainSelection();
      });

      const icon = document.createElement("span");
      icon.textContent = domain.icon;
      const copy = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = domain.label;
      const small = document.createElement("small");
      small.textContent = domain.description;
      copy.append(strong, small);
      const mark = document.createElement("span");
      mark.className = "radio-mark";
      mark.setAttribute("aria-hidden", "true");
      label.append(input, icon, copy, mark);
      elements.domainGrid.append(label);
    }
    updateDomainSelection();
  }

  function updateDomainSelection() {
    for (const option of elements.domainGrid.querySelectorAll(".domain-option")) {
      const selected = option.dataset.domain === selectedDomainId;
      option.classList.toggle("is-selected", selected);
      const input = option.querySelector("input");
      if (input) input.checked = selected;
    }
  }

  function openSetup() {
    if (!isWritable) {
      showToast("另一标签页正在操作本场游戏，请先关闭它再刷新此页。", true);
      return;
    }
    selectedDomainId = currentSession ? currentSession.domainId : selectedDomainId;
    renderDomainOptions();
    elements.replaceWarning.hidden = !(currentSession && currentSession.status === "playing");
    if (!elements.setupDialog.open) elements.setupDialog.showModal();
  }

  async function startNewGame() {
    if (!isWritable || mutationInProgress) return;
    if (currentSession && currentSession.status === "playing") {
      const confirmed = window.confirm("开始新场次会覆盖当前未结束的游戏。是否继续？");
      if (!confirmed) return;
    }
    mutationInProgress = true;
    updateComposerState();
    try {
      if (!(await ensureWriterAccess())) return;
      const nextSession = Engine.makeSession({
        domainId: selectedDomainId,
        seed: randomSeed(),
        sessionId: makeSessionId(),
        startedAt: new Date().toISOString()
      });
      const saved = await StateStore.save(nextSession);
      if (!saved.persisted) {
        showToast("无法保存新场次。请允许本地存储后重试。", true);
        return;
      }
      currentSession = nextSession;
      broadcastUpdate();
      if (elements.setupDialog.open) elements.setupDialog.close();
      render(true);
      elements.questionInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("新场次已开始，并已保存到本机。");
    } catch (error) {
      showToast(error.message || "无法开始新场次。", true);
    } finally {
      mutationInProgress = false;
      updateComposerState();
    }
  }

  async function applyPlayerAction(kind, text) {
    if (!isWritable || mutationInProgress || !currentSession || currentSession.status !== "playing") return;
    mutationInProgress = true;
    updateComposerState();
    try {
      if (!(await ensureWriterAccess())) return;
      const nextSession = Engine.applyAction(currentSession, { kind, text, at: new Date().toISOString() });
      const saved = await StateStore.save(nextSession);
      if (!saved.persisted) throw new Error("本次记录未能保存，请导出记录或允许本地存储后重试。");
      currentSession = nextSession;
      broadcastUpdate();
      render(true);
      const last = currentSession.turns[currentSession.turns.length - 1];
      if (last && last.answer === Engine.ANSWERS.CORRECT) {
        showToast("回答正确，本场游戏已结束。");
        window.setTimeout(() => elements.finishedPanel.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      }
      else if (kind === "guess") showToast("还不是正确答案，继续缩小范围吧。");
    } catch (error) {
      showToast(error.message || "无法处理这次输入。", true);
    } finally {
      mutationInProgress = false;
      updateComposerState();
    }
  }

  async function submitQuestion() {
    const text = elements.questionInput.value;
    if (!text.trim()) {
      showToast("请先输入一个问题。", true);
      return;
    }
    elements.questionInput.value = "";
    updateComposerState();
    await applyPlayerAction("question", text);
  }

  async function submitGuess(event) {
    event.preventDefault();
    const text = elements.guessInput.value;
    if (!text.trim()) {
      showToast("请输入对象名称。", true);
      return;
    }
    elements.guessInput.value = "";
    if (elements.guessDialog.open) elements.guessDialog.close();
    await applyPlayerAction("guess", text);
  }

  async function revealAnswer() {
    if (!currentSession || currentSession.status !== "playing" || !isWritable) return;
    const confirmed = window.confirm("确定要放弃并揭晓汤底吗？这不会算作答对。");
    if (!confirmed) return;
    await applyPlayerAction("reveal", "");
  }

  function downloadRecord() {
    if (!currentSession) return;
    try {
      const bundle = Engine.exportSession(currentSession);
      const text = JSON.stringify(bundle, null, 2);
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
      anchor.href = url;
      anchor.download = `science-turtle-soup-${stamp}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("当前场次记录已导出。");
    } catch (error) {
      showToast(error.message || "导出失败。", true);
    }
  }

  async function importRecord(file) {
    if (!file || !isWritable || mutationInProgress) return;
    mutationInProgress = true;
    updateComposerState();
    try {
      if (file.size <= 0) throw new Error("记录文件为空。");
      if (file.size > MAX_FILE_BYTES) throw new Error("记录文件超过 256 KB 上限。");
      const text = await file.text();
      const bundle = JSON.parse(text);
      const restored = Engine.importSession(bundle);
      if (currentSession && currentSession.status === "playing") {
        const confirmed = window.confirm("上传记录会替换当前场次。是否继续？");
        if (!confirmed) return;
      }
      if (!(await ensureWriterAccess())) return;
      const saved = await StateStore.save(restored);
      if (!saved.persisted) throw new Error("记录通过验证，但无法写入本机；当前场次未改变。");
      currentSession = restored;
      broadcastUpdate();
      render(true);
      showToast("记录已验证并恢复。");
    } catch (error) {
      showToast(error instanceof SyntaxError ? "JSON 文件无法解析，当前场次未改变。" : (error.message || "记录恢复失败。"), true);
    } finally {
      mutationInProgress = false;
      updateComposerState();
      elements.recordInput.value = "";
    }
  }

  function renderSuggestionButtons(domain, canPlay) {
    elements.suggestionList.replaceChildren();
    const suggestions = domain ? domain.suggestions : ["它是一位人物吗？", "它在常温下是固体吗？", "它位于太阳系内吗？"];
    for (const suggestion of suggestions) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion;
      button.disabled = !canPlay;
      button.addEventListener("click", () => {
        elements.questionInput.value = suggestion;
        updateComposerState();
        elements.questionInput.focus();
      });
      elements.suggestionList.append(button);
    }
  }

  function renderHistory(turns, scrollToEnd) {
    elements.historyList.replaceChildren();
    if (!turns.length) {
      const empty = document.createElement("div");
      empty.className = "empty-history";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "⌁";
      const title = document.createElement("strong");
      title.textContent = "还没有问题";
      const copy = document.createElement("p");
      copy.textContent = "尽量一次只问一个可以用“是或不是”判断的问题。";
      empty.append(icon, title, copy);
      elements.historyList.append(empty);
      return;
    }

    turns.forEach((turn, index) => {
      const item = document.createElement("article");
      item.className = "history-item";
      const number = document.createElement("span");
      number.className = "history-index";
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("div");
      copy.className = "history-copy";
      const question = document.createElement("p");
      question.textContent = turn.kind === "reveal" ? "玩家选择放弃并揭晓汤底" : turn.text;
      const meta = document.createElement("small");
      const time = new Date(turn.at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      meta.textContent = `${turn.kind === "guess" ? "汤底猜测" : turn.kind === "reveal" ? "结束场次" : "真假提问"} · ${time}`;
      copy.append(question, meta);
      const chip = document.createElement("span");
      const chipClass = turn.answer === "revealed" ? "unknown" : turn.answer;
      chip.className = `answer-chip ${chipClass}`;
      chip.textContent = turn.answer === "revealed" ? "已揭晓" : turn.answerLabel;
      item.append(number, copy, chip);
      elements.historyList.append(item);
    });
    if (scrollToEnd) elements.historyList.scrollTop = elements.historyList.scrollHeight;
  }

  function renderRecordList(element, records, emptyText) {
    element.replaceChildren();
    if (!records.length) {
      const empty = document.createElement("li");
      empty.className = "empty-record";
      empty.textContent = emptyText;
      element.append(empty);
      return;
    }
    for (const record of records) {
      const item = document.createElement("li");
      item.textContent = record.text;
      element.append(item);
    }
  }

  function renderSaveStatus() {
    if (!currentSession) {
      elements.saveStatus.textContent = "等待开局";
      elements.saveDetail.textContent = "刷新后可从本机恢复；游戏不会主动上传记录。";
    } else if (storageInfo.local && storageInfo.opfs) {
      elements.saveStatus.textContent = "已写入本地状态文件";
      elements.saveDetail.textContent = "同时保留浏览器恢复副本；请勿写入敏感信息。";
    } else if (storageInfo.local) {
      elements.saveStatus.textContent = "已保存到浏览器";
      elements.saveDetail.textContent = "此浏览器不支持私有文件增强，可用导出记录备份。";
    } else if (storageInfo.opfs) {
      elements.saveStatus.textContent = "已写入本地状态文件";
      elements.saveDetail.textContent = "浏览器键值存储不可用，请同时导出备份。";
    } else {
      elements.saveStatus.textContent = storageInfo.error || "仅在当前页面保留";
      elements.saveDetail.textContent = "请立即导出记录，刷新可能丢失。";
    }

    elements.lockChip.className = "lock-chip";
    if (isWritable) {
      elements.lockChip.classList.add("is-owner");
      elements.lockChip.textContent = "当前场次";
    } else {
      elements.lockChip.classList.add("is-readonly");
      elements.lockChip.textContent = lockMode === "checking" ? "检查中" : "只读";
    }
  }

  function updateComposerState() {
    const canPlay = Boolean(isWritable && !mutationInProgress && currentSession && currentSession.status === "playing");
    const hasText = elements.questionInput.value.trim().length > 0;
    elements.questionInput.disabled = !canPlay;
    elements.askButton.disabled = !canPlay || !hasText;
    elements.guessButton.disabled = !canPlay;
    elements.characterCount.textContent = String(elements.questionInput.value.length);
    elements.composer.classList.toggle("is-disabled", !canPlay);
  }

  function render(scrollToEnd) {
    const hasSession = Boolean(currentSession);
    const domain = hasSession ? Cases.domainMap.get(currentSession.domainId) : null;
    const entry = hasSession ? Engine.getCaseForSession(currentSession) : null;
    const canPlay = Boolean(isWritable && hasSession && currentSession.status === "playing");

    elements.domainSymbol.textContent = domain ? domain.icon : "?";
    elements.domainName.textContent = domain ? domain.label : "尚未开局";
    elements.caseCode.textContent = hasSession ? `CASE ${currentSession.sessionId.slice(-6).toUpperCase()}` : "CASE —";
    elements.surfaceTitle.textContent = domain ? domain.prompt : "选择一个领域，开始第一场科学推理。";
    elements.surfaceHint.textContent = domain
      ? "只对题库中已经核实的事实作判断；超出范围或语义含糊时会回答“不清楚”。"
      : "汤面只会告诉你对象的大类，真正的答案藏在问答之中。";

    const questionTurns = hasSession ? currentSession.turns.filter((turn) => turn.kind !== "reveal") : [];
    const yesRecords = hasSession ? currentSession.records.yes : [];
    const noRecords = hasSession ? currentSession.records.no : [];
    const unknownRecords = hasSession ? currentSession.records.unknown : [];
    elements.questionCount.textContent = String(questionTurns.length);
    elements.knownCount.textContent = String(yesRecords.length);
    elements.excludedCount.textContent = String(noRecords.length);
    elements.roundLabel.textContent = `${questionTurns.length} 轮`;
    elements.yesCount.textContent = `${yesRecords.length} 条`;
    elements.noCount.textContent = `${noRecords.length} 条`;
    elements.unknownCount.textContent = `${unknownRecords.length} 条`;
    renderHistory(hasSession ? currentSession.turns : [], scrollToEnd);
    renderRecordList(elements.yesRecords, yesRecords, "尚无已确认信息");
    renderRecordList(elements.noRecords, noRecords, "尚无已排除信息");
    renderRecordList(elements.unknownRecords, unknownRecords, "尚无不确定问题");
    renderSuggestionButtons(domain, canPlay);

    elements.sessionState.className = "session-state";
    if (!hasSession) {
      elements.sessionState.innerText = "等待开始";
    } else if (currentSession.status === "playing") {
      elements.sessionState.classList.add("is-playing");
      elements.sessionState.innerText = isWritable ? "推理进行中" : "另一标签页操作中";
    } else {
      elements.sessionState.classList.add("is-finished");
      elements.sessionState.innerText = currentSession.status === "solved" ? "已答对" : "已揭晓";
    }
    const stateDot = document.createElement("i");
    elements.sessionState.prepend(stateDot);

    elements.exportButton.disabled = !hasSession;
    elements.importButton.disabled = !isWritable;
    elements.newGameButton.disabled = !isWritable;
    elements.revealButton.disabled = !canPlay;
    elements.finishedNewGame.disabled = !isWritable;
    updateComposerState();
    renderSaveStatus();

    const finished = hasSession && currentSession.status !== "playing";
    elements.finishedPanel.hidden = !finished;
    if (finished) {
      const solved = currentSession.status === "solved";
      elements.finishedEyebrow.textContent = solved ? "CASE SOLVED" : "CASE REVEALED";
      elements.finishedTitle.textContent = solved ? "回答正确，本场结束" : "汤底已揭晓";
      elements.answerName.textContent = entry.name;
      elements.answerReveal.textContent = entry.reveal;
    } else {
      elements.answerName.textContent = "";
      elements.answerReveal.textContent = "";
    }
  }

  function bindEvents() {
    elements.rulesButton.addEventListener("click", () => elements.rulesDialog.showModal());
    elements.newGameButton.addEventListener("click", openSetup);
    elements.finishedNewGame.addEventListener("click", openSetup);
    elements.startGameButton.addEventListener("click", startNewGame);
    elements.askButton.addEventListener("click", submitQuestion);
    elements.questionInput.addEventListener("input", updateComposerState);
    elements.questionInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        submitQuestion();
      }
    });
    elements.guessButton.addEventListener("click", () => {
      elements.guessInput.value = "";
      elements.guessDialog.showModal();
      window.setTimeout(() => elements.guessInput.focus(), 0);
    });
    elements.guessForm.addEventListener("submit", submitGuess);
    elements.revealButton.addEventListener("click", revealAnswer);
    elements.exportButton.addEventListener("click", downloadRecord);
    elements.importButton.addEventListener("click", () => elements.recordInput.click());
    elements.recordInput.addEventListener("change", () => importRecord(elements.recordInput.files && elements.recordInput.files[0]));
    window.addEventListener("pagehide", () => {
      isWritable = false;
      const release = releaseLock;
      releaseLock = null;
      if (release) release();
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) window.location.reload();
    });
  }

  async function initialize() {
    bindEvents();
    renderDomainOptions();
    if (typeof BroadcastChannel === "function") {
      channel = new BroadcastChannel("apc-science-turtle-soup.v1");
      channel.addEventListener("message", (event) => {
        if (event.data && event.data.type === "state-updated") reloadReadonlyState();
      });
    }

    isWritable = await acquireWriterLock();
    const restored = await StateStore.load();
    if (restored) {
      currentSession = restored.session;
      storageInfo.local = storageInfo.local || restored.source === "local" || restored.source === "backup";
      storageInfo.opfs = storageInfo.opfs || restored.source === "opfs";
    }
    render();

    if (!isWritable) {
      showToast("同一浏览器的另一标签页正在操作本场游戏；当前页面为只读。", true);
    } else if (!currentSession) {
      openSetup();
    } else {
      showToast("已从本机恢复上次场次。");
    }
  }

  initialize().catch((error) => {
    window.clearInterval(leaseTimer);
    leaseTimer = null;
    const release = releaseLock;
    releaseLock = null;
    if (release) release();
    showToast(`${error.message || "游戏初始化失败。"} 页面已切换为只读，请刷新重试。`, true);
    lockMode = "readonly";
    isWritable = false;
    render();
  });
})();
