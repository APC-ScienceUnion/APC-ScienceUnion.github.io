"use strict";

(function startScienceTurtleSoup() {
  const Catalog = globalThis.ScienceSoupCatalog;
  const Engine = globalThis.ScienceSoupEngine;
  const Api = globalThis.ScienceSoupApi;
  if (!Catalog || !Engine || !Api) throw new Error("科学海龟汤前端模块没有完整加载。");

  const STORAGE_KEY = "apc.science-turtle-soup.current.v2";
  const BACKUP_KEY = "apc.science-turtle-soup.backup.v2";
  const OPFS_FILE = "science-turtle-soup-active-v2.json";
  const LEGACY_STORAGE_KEYS = [
    "apc.science-turtle-soup.current.v1",
    "apc.science-turtle-soup.backup.v1"
  ];
  const LEGACY_OPFS_FILE = "science-turtle-soup-active.json";
  const LOCK_NAME = "apc.science-turtle-soup.writer.v2";
  const LOCK_DB_NAME = "apc.science-turtle-soup.coordination.v2";
  const LOCK_STORE_NAME = "leases";
  const LOCK_LEASE_MS = 12000;
  const MAX_FILE_BYTES = 512 * 1024;
  const tabId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const elements = {};
  const ids = [
    "rulesButton", "newGameButton", "domainSymbol", "domainName", "sessionState", "caseCode",
    "surfaceTitle", "surfaceHint", "questionCount", "knownCount", "excludedCount", "suggestionList",
    "roundLabel", "historyList", "composer", "questionInput", "characterCount", "guessButton",
    "askButton", "finishedPanel", "finishedEyebrow", "finishedTitle", "answerName", "answerReveal",
    "finishedNewGame", "saveStatus", "saveDetail", "lockChip", "yesCount", "noCount", "unknownCount",
    "yesRecords", "noRecords", "unknownRecords", "exportButton", "importButton", "revealButton", "recordInput",
    "setupDialog", "domainGrid", "replaceWarning", "startStatus", "startGameButton", "guessDialog", "guessForm", "guessInput",
    "submitGuessButton", "rulesDialog", "toast", "networkBanner", "networkMessage", "retryButton"
  ];
  for (const id of ids) elements[id] = document.getElementById(id);

  let currentSession = null;
  let selectedDomainId = Catalog.DOMAINS[0].id;
  let isWritable = false;
  let serverValidated = false;
  let isOnline = navigator.onLine !== false;
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
  let networkState = "idle";
  let networkMessage = "";
  let retryTask = null;
  let persistenceBlocked = false;
  let startRetryContext = null;
  let startRetryTimer = null;
  let pendingRetryTimer = null;
  let dailyLimitResetAt = 0;
  let dailyLimitMessage = "";
  let dailyResetTimer = null;

  function showToast(message, isError) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = String(message);
    elements.toast.classList.toggle("is-error", Boolean(isError));
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3600);
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
      storageInfo.error = "自动缓存不可用，请及时导出记录";
      return false;
    }
  }

  async function readOpfsText(fileName, markAvailable) {
    if (!navigator.storage || typeof navigator.storage.getDirectory !== "function") return null;
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle(fileName);
      const file = await handle.getFile();
      if (file.size > MAX_FILE_BYTES) throw new Error("本地状态文件过大");
      if (markAvailable) storageInfo.opfs = true;
      return await file.text();
    } catch (error) {
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
      const opfs = parseStoredCandidate(await readOpfsText(OPFS_FILE, true), "opfs");
      if (current) candidates.push(current);
      if (backup) candidates.push(backup);
      if (opfs) candidates.push(opfs);
      candidates.sort((a, b) => b.timestamp - a.timestamp || b.session.state.revision - a.session.state.revision);
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
      if (!persisted) storageInfo.error = "本机缓存失败；当前页面仍保留 AI 结果";
      renderSaveStatus();
      return { bundle, persisted, local: localSaved, opfs: opfsSaved };
    }
  };

  async function hasLegacyState() {
    if (LEGACY_STORAGE_KEYS.some((key) => Boolean(safeStorageGet(key)))) return true;
    return Boolean(await readOpfsText(LEGACY_OPFS_FILE, false));
  }

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
    serverValidated = false;
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
      // A failed lease refresh must never leave the page writable.
    }
    loseWriterAccess();
    return false;
  }

  function broadcastUpdate() {
    if (!channel) return;
    channel.postMessage({
      type: "state-updated",
      sessionId: currentSession ? currentSession.state.sessionId : "",
      revision: currentSession ? currentSession.state.revision : -1
    });
  }

  async function reloadReadonlyState() {
    if (isWritable) return;
    const restored = await StateStore.load();
    if (restored) {
      currentSession = restored.session;
      render();
    }
  }

  function setNetwork(nextState, message, onRetry) {
    networkState = nextState;
    networkMessage = message || "";
    retryTask = typeof onRetry === "function" ? onRetry : null;
    renderNetworkStatus();
    updateComposerState();
  }

  function renderNetworkStatus() {
    if (!elements.networkBanner) return;
    const visible = networkState !== "idle";
    elements.networkBanner.hidden = !visible;
    elements.networkBanner.className = `network-banner is-${networkState}`;
    elements.networkMessage.textContent = networkMessage || "AI 服务就绪";
    elements.retryButton.hidden = !retryTask || mutationInProgress || !isOnline;
    elements.retryButton.disabled = mutationInProgress || !isOnline;
  }

  function errorMessage(error, fallback) {
    if (!isOnline || (error && error.code === "NETWORK_ERROR")) {
      return "当前无法连接 AI 服务。本次操作没有被算作“不清楚”，请联网后用原操作重试。";
    }
    return error && error.message ? error.message : fallback;
  }

  function retryDelayMs(error, fallback) {
    const supplied = error && Number.isFinite(error.retryAfterMs) && error.retryAfterMs > 0
      ? error.retryAfterMs
      : fallback;
    return Math.min(Math.max(supplied || 3000, 1000), 60000);
  }

  function setStartStatus(message, tone, kind) {
    if (!elements.startStatus) return;
    elements.startStatus.textContent = message || "";
    elements.startStatus.hidden = !message;
    elements.startStatus.className = `start-status${tone ? ` is-${tone}` : ""}`;
    if (kind) elements.startStatus.dataset.kind = kind;
    else delete elements.startStatus.dataset.kind;
  }

  function clearStartRetry() {
    if (startRetryTimer !== null) window.clearTimeout(startRetryTimer);
    startRetryTimer = null;
    startRetryContext = null;
  }

  function clearPendingRetry() {
    if (pendingRetryTimer !== null) window.clearTimeout(pendingRetryTimer);
    pendingRetryTimer = null;
  }

  function clearDailyLimit() {
    if (dailyResetTimer !== null) window.clearTimeout(dailyResetTimer);
    dailyResetTimer = null;
    dailyLimitResetAt = 0;
    dailyLimitMessage = "";
  }

  function isDailyLimitActive() {
    if (!dailyLimitResetAt) return false;
    if (dailyLimitResetAt > Date.now()) return true;
    clearDailyLimit();
    if (elements.startStatus && elements.startStatus.dataset.kind === "daily-limit") {
      setStartStatus("", "", "");
    }
    return false;
  }

  function formatShanghaiReset(resetMs) {
    const local = new Date(resetMs + (8 * 60 * 60 * 1000));
    const month = local.getUTCMonth() + 1;
    const day = local.getUTCDate();
    const hour = String(local.getUTCHours()).padStart(2, "0");
    const minute = String(local.getUTCMinutes()).padStart(2, "0");
    return `${month} 月 ${day} 日 ${hour}:${minute}`;
  }

  function rememberDailyLimit(error) {
    clearStartRetry();
    clearDailyLimit();
    const parsed = error && typeof error.resetAt === "string" ? Date.parse(error.resetAt) : NaN;
    const fallback = Date.now() + Math.max(
      error && Number.isFinite(error.retryAfterMs) ? error.retryAfterMs : 60000,
      1000
    );
    dailyLimitResetAt = Number.isFinite(parsed) && parsed > Date.now() ? parsed : fallback;
    const base = errorMessage(error, "今天的开局次数已经用完。");
    dailyLimitMessage = `${base} 可在上海时间 ${formatShanghaiReset(dailyLimitResetAt)} 后再开局。`;
    setStartStatus(dailyLimitMessage, "error", "daily-limit");
    setNetwork("error", dailyLimitMessage, null);
    const waitMs = Math.min(Math.max(dailyLimitResetAt - Date.now() + 250, 1000), 2147483000);
    dailyResetTimer = window.setTimeout(() => {
      clearDailyLimit();
      if (elements.startStatus && elements.startStatus.dataset.kind === "daily-limit") {
        setStartStatus("", "", "");
      }
      setNetwork("idle", "", null);
      render();
    }, waitMs);
  }

  function rememberRetryableStart(error, actionId, domainId) {
    clearStartRetry();
    startRetryContext = { actionId, domainId };
    const message = errorMessage(error, "无法开始 AI 场次。");
    setStartStatus(`${message} 请使用同一次开局重试。`, "waiting", "start-retry");
    setNetwork("error", message, () => startNewGame({ actionId, domainId, skipConfirm: true }));
  }

  function scheduleStartRetry(error, actionId, domainId) {
    clearStartRetry();
    const delay = retryDelayMs(error, 3000);
    const message = `${errorMessage(error, "这一局仍在生成。")} 将在 ${Math.ceil(delay / 1000)} 秒后自动重试。`;
    startRetryContext = { actionId, domainId };
    startRetryTimer = window.setTimeout(() => {
      startRetryTimer = null;
      const context = startRetryContext;
      if (!context || !elements.setupDialog.open) {
        startRetryContext = null;
        if (elements.startStatus && elements.startStatus.dataset.kind === "start-progress") {
          setStartStatus("", "", "");
        }
        setNetwork("idle", "", null);
        render();
        return;
      }
      if (!isOnline || !isWritable) {
        setStartStatus("这一局仍在生成；联网并取得操作权后，请使用同一次开局重试。", "waiting", "start-retry");
        setNetwork("offline", "当前离线，尚未重试这次开局。", () => startNewGame({ ...context, skipConfirm: true }));
        render();
        return;
      }
      startRetryContext = null;
      startNewGame({ ...context, skipConfirm: true });
    }, delay);
    setStartStatus(message, "waiting", "start-progress");
    setNetwork("error", message, null);
  }

  function restorePendingDraft(pending, openGuess) {
    if (!pending || typeof pending.text !== "string") return;
    if (pending.kind === "question") {
      elements.questionInput.value = pending.text;
    } else if (pending.kind === "guess") {
      elements.guessInput.value = pending.text;
      if (openGuess && !elements.guessDialog.open) elements.guessDialog.showModal();
    }
  }

  function schedulePendingRetry(error, pending) {
    clearPendingRetry();
    const delay = retryDelayMs(error, 3000);
    const actionId = pending.actionId;
    const message = `${errorMessage(error, "AI 仍在处理这条内容。")} 将在 ${Math.ceil(delay / 1000)} 秒后用原操作重试。`;
    pendingRetryTimer = window.setTimeout(() => {
      pendingRetryTimer = null;
      const latest = currentSession && currentSession.pendingAction;
      if (!latest || latest.actionId !== actionId) return;
      if (!isOnline || !isWritable) {
        setNetwork("offline", "原操作仍待确认；联网并取得操作权后可以重试。", () => sendPendingAction());
        return;
      }
      sendPendingAction();
    }, delay);
    setNetwork("error", message, null);
  }

  function blockForPersistence(message, afterSave, restoreValidation) {
    persistenceBlocked = true;
    serverValidated = false;
    setNetwork("warning", message, () => retryCurrentPersistence(afterSave, restoreValidation));
  }

  async function retryCurrentPersistence(afterSave, restoreValidation) {
    if (!currentSession || mutationInProgress || !isWritable) return;
    mutationInProgress = true;
    let continueAfterSave = false;
    setNetwork("syncing", "正在重新写入本机场次状态…", null);
    render();
    try {
      if (!(await ensureWriterAccess())) return;
      const saved = await StateStore.save(currentSession);
      if (!saved.persisted) {
        blockForPersistence("本机仍无法保存场次；请允许站点存储或先导出记录。", afterSave, restoreValidation);
        return;
      }
      persistenceBlocked = false;
      serverValidated = restoreValidation !== false;
      broadcastUpdate();
      setNetwork("idle", "", null);
      showToast("本机场次状态已恢复保存。");
      continueAfterSave = typeof afterSave === "function";
    } finally {
      mutationInProgress = false;
      render();
    }
    if (continueAfterSave) await afterSave();
  }

  async function stillOwnWriterAfterNetwork() {
    if (await ensureWriterAccess()) return true;
    serverValidated = false;
    setNetwork("error", "等待 AI 时本页面失去了场次操作权；返回结果未写入，请在当前可写标签页继续。", null);
    return false;
  }

  function renderDomainOptions() {
    elements.domainGrid.replaceChildren();
    for (const domain of Catalog.DOMAINS) {
      const label = document.createElement("label");
      label.className = "domain-option";
      label.dataset.domain = domain.id;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "science-domain";
      input.value = domain.id;
      input.checked = domain.id === selectedDomainId;
      input.disabled = mutationInProgress;
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
    if (isDailyLimitActive()) {
      setStartStatus(dailyLimitMessage, "error", "daily-limit");
    } else if (!startRetryContext) {
      setStartStatus("", "", "");
    }
    selectedDomainId = currentSession ? currentSession.state.domainId : selectedDomainId;
    renderDomainOptions();
    elements.replaceWarning.hidden = !(currentSession && currentSession.state.status === "playing");
    if (!elements.setupDialog.open) elements.setupDialog.showModal();
  }

  async function startNewGame(options) {
    options = options || {};
    if (!isWritable || mutationInProgress) return;
    if (isDailyLimitActive()) {
      setStartStatus(dailyLimitMessage, "error", "daily-limit");
      render();
      return;
    }
    if (startRetryTimer !== null) return;
    if (options.actionId && startRetryContext && startRetryContext.actionId === options.actionId) {
      clearStartRetry();
    } else if (!options.actionId && startRetryContext) {
      clearStartRetry();
    }
    if (persistenceBlocked) {
      showToast("请先重试保存或导出当前场次，再开始新游戏。", true);
      return;
    }
    if (!isOnline) {
      setNetwork("offline", "当前离线，联网后才能创建 AI 场次。", () => startNewGame(options));
      return;
    }
    if (!options.skipConfirm && currentSession && currentSession.state.status === "playing") {
      const confirmed = window.confirm("开始新场次会覆盖当前未结束的游戏。是否继续？");
      if (!confirmed) return;
    }
    const actionId = options.actionId || Api.createActionId();
    const domainId = options.domainId || selectedDomainId;
    mutationInProgress = true;
    setStartStatus("AI 正在准备新的科学汤面…", "waiting", "creating");
    setNetwork("creating", "AI 正在准备新的科学汤面…", null);
    render();
    try {
      if (!(await ensureWriterAccess())) return;
      const payload = await Api.start(domainId, actionId);
      if (!(await stillOwnWriterAfterNetwork())) return;
      const nextSession = Engine.createSession(payload);
      if (nextSession.state.domainId !== domainId) throw new Error("AI 返回了错误的科学领域。");
      const saved = await StateStore.save(nextSession);
      if (!saved.persisted) {
        rememberRetryableStart({
          message: "新场次未能写入本机，当前场次没有被替换。请允许站点存储后重试。",
          retryable: true
        }, actionId, domainId);
        showToast("新场次未保存，当前场次没有被替换。", true);
        return;
      }
      clearStartRetry();
      clearPendingRetry();
      clearDailyLimit();
      setStartStatus("", "", "");
      currentSession = nextSession;
      persistenceBlocked = false;
      serverValidated = true;
      elements.questionInput.value = "";
      elements.guessInput.value = "";
      if (elements.setupDialog.open) elements.setupDialog.close();
      render(true);
      broadcastUpdate();
      setNetwork("idle", "", null);
      showToast("AI 场次已开始。");
      elements.questionInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      serverValidated = Boolean(currentSession && serverValidated);
      const message = errorMessage(error, "无法开始 AI 场次。");
      if (error && error.code === "DAILY_GAME_LIMIT") {
        rememberDailyLimit(error);
      } else if (error && error.code === "START_IN_PROGRESS") {
        scheduleStartRetry(error, actionId, domainId);
      } else if (error && error.retryable !== false) {
        rememberRetryableStart(error, actionId, domainId);
      } else {
        clearStartRetry();
        setStartStatus(message, "error", "start-error");
        setNetwork("error", message, null);
      }
      showToast(message, true);
    } finally {
      mutationInProgress = false;
      render();
    }
  }

  async function persistPending(session) {
    const saved = await StateStore.save(session);
    if (!saved.persisted) {
      storageInfo.error = "待确认操作未能缓存；请勿刷新页面";
      renderSaveStatus();
    }
    return saved;
  }

  async function beginPlayerAction(kind, text) {
    if (!isWritable || mutationInProgress || !serverValidated || !isOnline || !currentSession) return;
    if (currentSession.state.status !== "playing" || currentSession.pendingAction) return;
    mutationInProgress = true;
    let shouldSend = false;
    try {
      if (!(await ensureWriterAccess())) return;
      currentSession = Engine.beginAction(currentSession, {
        actionId: Api.createActionId(),
        kind,
        text,
        at: new Date().toISOString()
      });
      const saved = await persistPending(currentSession);
      if (!saved.persisted) {
        blockForPersistence("待确认操作未能写入本机，尚未发送给 AI。请重试保存或导出记录。", () => sendPendingAction());
        return;
      }
      render(true);
      shouldSend = true;
    } catch (error) {
      showToast(error.message || "无法准备这次操作。", true);
    } finally {
      mutationInProgress = false;
      render();
    }
    if (shouldSend) await sendPendingAction();
  }

  async function reconcileConflict() {
    if (!currentSession) return;
    try {
      restorePendingDraft(currentSession.pendingAction, false);
      clearPendingRetry();
      const withoutPending = currentSession.pendingAction ? Engine.cancelPending(currentSession) : currentSession;
      const payload = await Api.resume(withoutPending.sessionToken);
      if (!(await stillOwnWriterAfterNetwork())) return;
      const reconciled = Engine.resumeSession(withoutPending, payload);
      currentSession = reconciled;
      const saved = await StateStore.save(reconciled);
      if (!saved.persisted) {
        blockForPersistence("同步后的场次未能写入本机；请重试保存或导出记录。", null);
        return;
      }
      persistenceBlocked = false;
      serverValidated = true;
      render();
      broadcastUpdate();
      setNetwork("error", "场次已同步。刚才的输入没有记入记录，请检查后重新提交。", null);
    } catch (error) {
      serverValidated = false;
      setNetwork("error", errorMessage(error, "场次同步失败。"), () => resumeCurrentSession());
    }
  }

  async function sendPendingAction() {
    if (!isWritable || mutationInProgress || !currentSession || !currentSession.pendingAction) return;
    if (!isOnline) {
      setNetwork("offline", "当前离线；待确认操作没有被当作“不清楚”。联网后可用原操作重试。", () => sendPendingAction());
      return;
    }
    clearPendingRetry();
    mutationInProgress = true;
    const pending = currentSession.pendingAction;
    setNetwork("sending", "AI 判断中…请稍候，本次输入尚未计入问答。", null);
    render(true);
    try {
      if (!(await ensureWriterAccess())) return;
      let payload;
      if (pending.kind === "question") {
        payload = await Api.question(currentSession.sessionToken, pending.text, pending.baseRevision, pending.actionId);
      } else if (pending.kind === "guess") {
        payload = await Api.guess(currentSession.sessionToken, pending.text, pending.baseRevision, pending.actionId);
      } else {
        payload = await Api.reveal(currentSession.sessionToken, pending.baseRevision, pending.actionId);
      }
      if (!(await stillOwnWriterAfterNetwork())) return;
      const nextSession = Engine.applyServerAction(currentSession, payload);
      clearPendingRetry();
      currentSession = nextSession;
      serverValidated = true;
      if (pending.kind === "question" && elements.questionInput.value === pending.text) {
        elements.questionInput.value = "";
      }
      if (pending.kind === "guess") {
        if (elements.guessInput.value === pending.text) elements.guessInput.value = "";
        if (elements.guessDialog.open) elements.guessDialog.close();
      }
      render(true);
      const saved = await StateStore.save(nextSession);
      if (!saved.persisted) {
        blockForPersistence("AI 已确认本次结果，但本机缓存失败。请立即导出记录或重试保存。", null);
        showToast("AI 结果已生效，但本机缓存失败。", true);
      } else {
        persistenceBlocked = false;
        broadcastUpdate();
        setNetwork("idle", "", null);
      }
      const last = nextSession.turns[nextSession.turns.length - 1];
      if (last && last.answer === "correct") {
        showToast("回答正确，本场游戏已结束。");
        window.setTimeout(() => elements.finishedPanel.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      } else if (pending.kind === "guess") {
        showToast("还不是正确答案，继续缩小范围吧。");
      }
    } catch (error) {
      if (!(await stillOwnWriterAfterNetwork())) return;
      const actionFailed = error && ["ACTION_FAILED", "ACTION_PREVIOUSLY_FAILED"].includes(error.code);
      if (actionFailed) {
        clearPendingRetry();
        restorePendingDraft(pending, true);
        currentSession = Engine.cancelPending(currentSession);
        const saved = await StateStore.save(currentSession);
        const message = `${errorMessage(error, "这次 AI 判断没有完成。")} 原输入已恢复，请检查后重新提交。`;
        if (!saved.persisted) {
          blockForPersistence("失败操作未能从本机待处理状态中移除；原输入已恢复，请先重试保存。", null);
        } else {
          broadcastUpdate();
          setNetwork("error", message, null);
        }
        render();
      } else if (error && error.code === "ACTION_IN_PROGRESS") {
        const saved = await persistPending(currentSession);
        if (!saved.persisted) {
          blockForPersistence("AI 仍在处理原操作，但待确认状态未能保存在本机；请先重试保存。", () => sendPendingAction());
        } else {
          schedulePendingRetry(error, pending);
        }
      } else if (error && error.status === 409) {
        await reconcileConflict();
      } else if (error && error.retryable === false) {
        currentSession = Engine.cancelPending(currentSession);
        if (["SESSION_EXPIRED", "INVALID_SESSION_TOKEN", "ORIGIN_NOT_ALLOWED"].includes(error.code)) {
          serverValidated = false;
        }
        const saved = await StateStore.save(currentSession);
        if (!saved.persisted) {
          const mayResume = !["SESSION_EXPIRED", "INVALID_SESSION_TOKEN", "ORIGIN_NOT_ALLOWED"].includes(error.code);
          blockForPersistence("被拒绝的操作未能从本机待处理状态中移除，请重试保存或导出记录。", null, mayResume);
        } else {
          setNetwork("error", errorMessage(error, "AI 服务拒绝了本次输入。"), null);
        }
        render();
      } else {
        const saved = await persistPending(currentSession);
        if (!saved.persisted) {
          blockForPersistence("待确认操作未能保存在本机；请重试保存后再发送。", () => sendPendingAction());
        } else {
          setNetwork(isOnline ? "error" : "offline", errorMessage(error, "AI 判断失败。"), () => sendPendingAction());
        }
      }
      showToast(actionFailed
        ? "这次 AI 判断没有完成；原输入已恢复，请重新提交。"
        : errorMessage(error, "AI 判断失败；本次操作尚未计入记录。"), true);
    } finally {
      mutationInProgress = false;
      render();
    }
  }

  async function resumeCurrentSession(options) {
    options = options || {};
    if (!currentSession || mutationInProgress || !isWritable) return;
    if (!isOnline) {
      serverValidated = false;
      setNetwork("offline", "当前离线，只能查看本机缓存；联网后可继续。", () => resumeCurrentSession(options));
      render();
      return;
    }
    mutationInProgress = true;
    setNetwork("syncing", options.initial ? "正在验证上次 AI 场次…" : "正在同步 AI 场次…", null);
    render();
    try {
      if (!(await ensureWriterAccess())) return;
      const payload = await Api.resume(currentSession.sessionToken);
      if (!(await stillOwnWriterAfterNetwork())) return;
      const resumed = Engine.resumeSession(currentSession, payload);
      const saved = await StateStore.save(resumed);
      if (!saved.persisted) {
        serverValidated = false;
        setNetwork("error", "AI 场次已验证，但未能写入本机；原缓存没有被替换。请允许站点存储后重试。", () => resumeCurrentSession(options));
        return;
      }
      currentSession = resumed;
      restorePendingDraft(resumed.pendingAction, false);
      persistenceBlocked = false;
      serverValidated = true;
      render();
      broadcastUpdate();
      if (resumed.pendingAction) {
        setNetwork("error", "上次操作的结果仍待确认。请用原操作重试，网络失败不会算作“不清楚”。", () => sendPendingAction());
      } else {
        setNetwork("idle", "", null);
        if (!options.silent) showToast("已与 AI 服务同步上次场次。");
      }
    } catch (error) {
      serverValidated = false;
      setNetwork(isOnline ? "error" : "offline", errorMessage(error, "无法验证上次 AI 场次。"), error && error.retryable !== false
        ? () => resumeCurrentSession(options)
        : null);
      if (!options.initial) showToast(errorMessage(error, "场次同步失败。"), true);
    } finally {
      mutationInProgress = false;
      render();
    }
  }

  async function submitQuestion() {
    const text = elements.questionInput.value;
    if (!text.trim()) {
      showToast("请先输入一个问题。", true);
      return;
    }
    await beginPlayerAction("question", text);
  }

  async function submitGuess(event) {
    event.preventDefault();
    const text = elements.guessInput.value;
    if (!text.trim()) {
      showToast("请输入对象名称。", true);
      return;
    }
    await beginPlayerAction("guess", text);
  }

  async function revealAnswer() {
    if (!currentSession || currentSession.state.status !== "playing" || !isWritable) return;
    const confirmed = window.confirm("确定要放弃并揭晓汤底吗？这不会算作答对。");
    if (!confirmed) return;
    await beginPlayerAction("reveal", "");
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
      anchor.download = `science-turtle-soup-v2-${stamp}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("当前公开记录与恢复凭据已导出，请妥善保管。");
    } catch (error) {
      showToast(error.message || "导出失败。", true);
    }
  }

  async function importRecord(file) {
    if (!file || !isWritable || mutationInProgress) return;
    if (!isOnline) {
      showToast("上传恢复必须先联网验证场次凭据。", true);
      elements.recordInput.value = "";
      return;
    }
    mutationInProgress = true;
    setNetwork("syncing", "正在向 AI 服务验证上传记录…", null);
    render();
    try {
      if (file.size <= 0) throw new Error("记录文件为空。");
      if (file.size > MAX_FILE_BYTES) throw new Error("记录文件超过 512 KB 上限。");
      const text = await file.text();
      const bundle = JSON.parse(text);
      const candidate = Engine.importSession(bundle);
      if (currentSession && currentSession.state.status === "playing") {
        const confirmed = window.confirm("上传记录会在服务端验证成功后替换当前场次。是否继续？");
        if (!confirmed) {
          setNetwork("idle", "", null);
          return;
        }
      }
      if (!(await ensureWriterAccess())) return;
      const payload = await Api.resume(candidate.sessionToken);
      if (!(await stillOwnWriterAfterNetwork())) return;
      const restored = Engine.resumeSession(candidate, payload);
      const saved = await StateStore.save(restored);
      if (!saved.persisted) {
        setNetwork("error", "上传记录通过验证，但未能写入本机；当前场次没有被替换。请允许站点存储后重新上传。", null);
        showToast("上传记录未能保存，当前场次没有被替换。", true);
        return;
      }
      currentSession = restored;
      restorePendingDraft(restored.pendingAction, false);
      persistenceBlocked = false;
      serverValidated = true;
      render(true);
      broadcastUpdate();
      if (restored.pendingAction) {
        setNetwork("error", "记录已恢复，但有一项操作仍待确认。", () => sendPendingAction());
      } else {
        setNetwork("idle", "", null);
        showToast("记录已由 AI 服务验证并恢复。");
      }
    } catch (error) {
      const message = error instanceof SyntaxError
        ? "JSON 文件无法解析，当前场次未改变。"
        : (error.message || "记录验证失败，当前场次未改变。");
      setNetwork("error", message, null);
      showToast(message, true);
    } finally {
      mutationInProgress = false;
      elements.recordInput.value = "";
      render();
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

  function appendHistoryItem(turn, index, pending) {
    const item = document.createElement("article");
    item.className = pending ? "history-item is-pending" : "history-item";
    const number = document.createElement("span");
    number.className = "history-index";
    number.textContent = pending ? "··" : String(index + 1).padStart(2, "0");
    const copy = document.createElement("div");
    copy.className = "history-copy";
    const question = document.createElement("p");
    question.textContent = turn.kind === "reveal" ? "玩家选择放弃并请求揭晓汤底" : turn.text;
    const meta = document.createElement("small");
    if (pending) {
      meta.textContent = "已保留原输入 · 等待服务端确认";
    } else {
      const time = new Date(turn.at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      meta.textContent = `${turn.kind === "guess" ? "汤底猜测" : turn.kind === "reveal" ? "结束场次" : "真假提问"} · ${time}`;
    }
    copy.append(question, meta);
    const chip = document.createElement("span");
    if (pending) {
      chip.className = "answer-chip pending";
      chip.textContent = "AI 判断中";
    } else {
      const chipClass = turn.answer === "revealed" ? "unknown" : turn.answer;
      chip.className = `answer-chip ${chipClass}`;
      chip.textContent = turn.answerLabel;
    }
    item.append(number, copy, chip);
    elements.historyList.append(item);
  }

  function renderHistory(turns, pendingAction, scrollToEnd) {
    elements.historyList.replaceChildren();
    if (!turns.length && !pendingAction) {
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
    turns.forEach((turn, index) => appendHistoryItem(turn, index, false));
    if (pendingAction) appendHistoryItem(pendingAction, turns.length, true);
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
      elements.saveDetail.textContent = "公开进度缓存在本机；问题会发送给 AI 服务判断。";
    } else if (storageInfo.local && storageInfo.opfs) {
      elements.saveStatus.textContent = "公开进度已缓存";
      elements.saveDetail.textContent = "浏览器与站点私有文件均有副本；AI 服务负责验证加密场次。";
    } else if (storageInfo.local) {
      elements.saveStatus.textContent = "已缓存到浏览器";
      elements.saveDetail.textContent = "可导出含恢复凭据的记录文件作为额外备份。";
    } else if (storageInfo.opfs) {
      elements.saveStatus.textContent = "已写入本地状态文件";
      elements.saveDetail.textContent = "浏览器键值存储不可用，请同时导出备份。";
    } else {
      elements.saveStatus.textContent = storageInfo.error || "仅在当前页面保留";
      elements.saveDetail.textContent = "当前页面仍保留 AI 结果，但刷新后可能无法自动恢复。";
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
    const playing = Boolean(currentSession && currentSession.state.status === "playing");
    const canPlay = Boolean(isWritable && serverValidated && isOnline && !mutationInProgress && playing && !currentSession.pendingAction);
    const dailyLimitActive = isDailyLimitActive();
    const waitingForStartRetry = startRetryTimer !== null;
    const hasText = elements.questionInput.value.trim().length > 0;
    elements.questionInput.disabled = !canPlay;
    elements.askButton.disabled = !canPlay || !hasText;
    elements.guessButton.disabled = !canPlay;
    elements.askButton.textContent = mutationInProgress && currentSession && currentSession.pendingAction
      ? "AI 判断中…"
      : "提交问题 ↗";
    elements.characterCount.textContent = String(elements.questionInput.value.length);
    elements.composer.classList.toggle("is-disabled", !canPlay);
    elements.submitGuessButton.disabled = !canPlay;
    elements.guessInput.disabled = !canPlay;
    elements.startGameButton.disabled = mutationInProgress || !isOnline || !isWritable || dailyLimitActive || waitingForStartRetry;
    elements.startGameButton.textContent = waitingForStartRetry
      ? "等待后自动重试…"
      : startRetryContext
        ? "重试本次开局"
        : networkState === "creating" ? "AI 准备中…" : "开始游戏";
    for (const input of elements.domainGrid.querySelectorAll("input")) {
      input.disabled = mutationInProgress || waitingForStartRetry || Boolean(startRetryContext);
    }
    renderNetworkStatus();
  }

  function render(scrollToEnd) {
    const hasSession = Boolean(currentSession);
    const state = hasSession ? currentSession.state : null;
    const domain = state ? Catalog.domainMap.get(state.domainId) : null;
    const playing = Boolean(state && state.status === "playing");
    const canPlay = Boolean(isWritable && serverValidated && isOnline && !mutationInProgress && playing && !currentSession.pendingAction);
    elements.domainSymbol.textContent = domain ? domain.icon : "?";
    elements.domainName.textContent = domain ? domain.label : "尚未开局";
    elements.caseCode.textContent = state ? `CASE ${state.sessionId.slice(-6).toUpperCase()}` : "CASE —";
    elements.surfaceTitle.textContent = state ? state.surface.title : "选择一个领域，开始第一场科学推理。";
    elements.surfaceHint.textContent = state
      ? (state.surface.hint || "AI 只会回答“是 / 不是 / 不清楚”；请一次提出一个可判断真假的问题。")
      : "汤面只会告诉你对象的大类，真正的答案藏在问答之中。";
    const turns = hasSession ? currentSession.turns : [];
    const questionTurns = turns.filter((turn) => turn.kind !== "reveal");
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
    renderHistory(turns, hasSession ? currentSession.pendingAction : null, scrollToEnd);
    renderRecordList(elements.yesRecords, yesRecords, "尚无已确认信息");
    renderRecordList(elements.noRecords, noRecords, "尚无已排除信息");
    renderRecordList(elements.unknownRecords, unknownRecords, "尚无不确定问题");
    renderSuggestionButtons(domain, canPlay);
    elements.sessionState.className = "session-state";
    if (!state) {
      elements.sessionState.innerText = "等待开始";
    } else if (state.status === "playing") {
      elements.sessionState.classList.add("is-playing");
      if (!isWritable) elements.sessionState.innerText = "另一标签页操作中";
      else if (mutationInProgress) elements.sessionState.innerText = "AI 判断中";
      else if (!serverValidated || !isOnline) elements.sessionState.innerText = "离线查看";
      else elements.sessionState.innerText = "推理进行中";
    } else {
      elements.sessionState.classList.add("is-finished");
      elements.sessionState.innerText = state.status === "solved" ? "已答对" : "已揭晓";
    }
    const stateDot = document.createElement("i");
    elements.sessionState.prepend(stateDot);
    elements.exportButton.disabled = !hasSession;
    elements.importButton.disabled = !isWritable || !isOnline || mutationInProgress;
    elements.newGameButton.disabled = !isWritable || !isOnline || mutationInProgress;
    elements.revealButton.disabled = !canPlay;
    elements.finishedNewGame.disabled = !isWritable || !isOnline || mutationInProgress;
    updateComposerState();
    renderSaveStatus();
    const finished = Boolean(state && state.status !== "playing");
    elements.finishedPanel.hidden = !finished;
    if (finished) {
      const solved = state.status === "solved";
      elements.finishedEyebrow.textContent = solved ? "CASE SOLVED" : "CASE REVEALED";
      elements.finishedTitle.textContent = solved ? "回答正确，本场结束" : "汤底已揭晓";
      elements.answerName.textContent = state.reveal.answerName;
      elements.answerReveal.textContent = state.reveal.explanation;
    } else {
      elements.answerName.textContent = "";
      elements.answerReveal.textContent = "";
    }
  }

  function bindEvents() {
    elements.rulesButton.addEventListener("click", () => elements.rulesDialog.showModal());
    elements.newGameButton.addEventListener("click", openSetup);
    elements.finishedNewGame.addEventListener("click", openSetup);
    elements.startGameButton.addEventListener("click", () => {
      const retry = startRetryContext;
      startNewGame(retry ? { ...retry, skipConfirm: true } : undefined);
    });
    elements.setupDialog.addEventListener("close", () => {
      clearStartRetry();
      if (!elements.startStatus || elements.startStatus.dataset.kind !== "daily-limit") {
        setStartStatus("", "", "");
      }
      render();
    });
    elements.askButton.addEventListener("click", submitQuestion);
    elements.questionInput.addEventListener("input", updateComposerState);
    elements.questionInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        submitQuestion();
      }
    });
    elements.guessButton.addEventListener("click", () => {
      if (!elements.guessDialog.open) elements.guessDialog.showModal();
      window.setTimeout(() => elements.guessInput.focus(), 0);
    });
    elements.guessForm.addEventListener("submit", submitGuess);
    elements.revealButton.addEventListener("click", revealAnswer);
    elements.exportButton.addEventListener("click", downloadRecord);
    elements.importButton.addEventListener("click", () => elements.recordInput.click());
    elements.recordInput.addEventListener("change", () => importRecord(elements.recordInput.files && elements.recordInput.files[0]));
    elements.retryButton.addEventListener("click", () => {
      const task = retryTask;
      if (task && !mutationInProgress) task();
    });
    window.addEventListener("offline", () => {
      isOnline = false;
      serverValidated = false;
      setNetwork("offline", "当前离线，只能查看本机缓存；联网后可继续。", currentSession ? () => resumeCurrentSession() : null);
      render();
    });
    window.addEventListener("online", () => {
      isOnline = true;
      if (currentSession && isWritable) resumeCurrentSession({ silent: true });
      else {
        setNetwork("idle", "", null);
        render();
      }
    });
    window.addEventListener("pagehide", () => {
      clearStartRetry();
      clearPendingRetry();
      clearDailyLimit();
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
      channel = new BroadcastChannel("apc-science-turtle-soup.v2");
      channel.addEventListener("message", (event) => {
        if (event.data && event.data.type === "state-updated") reloadReadonlyState();
      });
    }
    isWritable = await acquireWriterLock();
    const restored = await StateStore.load();
    if (restored) {
      currentSession = restored.session;
      restorePendingDraft(currentSession.pendingAction, false);
      storageInfo.local = storageInfo.local || restored.source === "local" || restored.source === "backup";
      storageInfo.opfs = storageInfo.opfs || restored.source === "opfs";
    }
    render();
    if (!isWritable) {
      showToast("同一浏览器的另一标签页正在操作本场游戏；当前页面为只读。", true);
      return;
    }
    if (currentSession) {
      await resumeCurrentSession({ initial: true, silent: true });
      return;
    }
    if (await hasLegacyState()) {
      setNetwork("error", "检测到旧版 v1 本地记录。它含本地题库种子，与 AI v2 不兼容；旧记录未被修改。", null);
      showToast("旧版 v1 记录无法直接恢复到 AI v2，原记录仍保留。", true);
    }
    if (isOnline) openSetup();
    else setNetwork("offline", "当前离线，联网后才能创建 AI 场次。", null);
  }

  initialize().catch((error) => {
    window.clearInterval(leaseTimer);
    leaseTimer = null;
    const release = releaseLock;
    releaseLock = null;
    if (release) release();
    lockMode = "readonly";
    isWritable = false;
    serverValidated = false;
    setNetwork("error", `${error.message || "游戏初始化失败。"} 页面已切换为只读，请刷新重试。`, null);
    showToast(error.message || "游戏初始化失败。", true);
    render();
  });
})();
