"use strict";

(function attachScienceSoupApi(root, factory) {
  const api = factory(root || globalThis);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceSoupApi = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildScienceSoupApi(root) {
  const ENDPOINT = "/api/science-soup";
  const DEFAULT_TIMEOUT_MS = 32000;

  class ApiError extends Error {
    constructor(message, options) {
      super(message);
      this.name = "ScienceSoupApiError";
      this.code = options && options.code ? options.code : "REQUEST_FAILED";
      this.status = options && Number.isInteger(options.status) ? options.status : 0;
      this.retryable = Boolean(options && options.retryable);
      this.retryAfterMs = options && Number.isFinite(options.retryAfterMs) ? options.retryAfterMs : 0;
      this.requestId = options && typeof options.requestId === "string" ? options.requestId : "";
    }
  }

  function createActionId() {
    if (root.crypto && typeof root.crypto.randomUUID === "function") return root.crypto.randomUUID();
    if (root.crypto && typeof root.crypto.getRandomValues === "function") {
      const bytes = root.crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }
    throw new ApiError("当前浏览器无法生成安全的操作编号。", { code: "CRYPTO_UNAVAILABLE", retryable: false });
  }

  function assertOpaqueToken(token) {
    if (typeof token !== "string" || token.length < 32 || token.length > 16384) {
      throw new ApiError("场次恢复凭据无效。", { code: "INVALID_SESSION_TOKEN", retryable: false });
    }
  }

  function errorFromResponse(response, payload) {
    const source = payload && typeof payload.error === "object" ? payload.error : payload;
    const message = source && typeof source.message === "string" && source.message.trim()
      ? source.message.trim()
      : `AI 服务返回了错误（${response.status}）。`;
    const retryableStatus = response.status === 408 || response.status === 429 || response.status >= 500;
    return new ApiError(message, {
      code: source && typeof source.code === "string" ? source.code : `HTTP_${response.status}`,
      status: response.status,
      retryable: source && typeof source.retryable === "boolean" ? source.retryable : retryableStatus,
      retryAfterMs: source && Number.isFinite(source.retryAfterMs) ? source.retryAfterMs : 0,
      requestId: source && typeof source.requestId === "string" ? source.requestId : ""
    });
  }

  async function request(body, options) {
    if (!root.fetch) throw new ApiError("当前浏览器不支持连接 AI 服务。", { code: "FETCH_UNAVAILABLE", retryable: false });
    const timeoutMs = options && Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const externalSignal = options && options.signal;
    let externalAbort = null;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort(externalSignal.reason);
      else {
        externalAbort = () => controller.abort(externalSignal.reason);
        externalSignal.addEventListener("abort", externalAbort, { once: true });
      }
    }
    const timeout = root.setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);
    try {
      let response;
      try {
        response = await root.fetch(ENDPOINT, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        });
      } catch (error) {
        if (controller.signal.aborted && !(externalSignal && externalSignal.aborted)) {
          throw new ApiError("AI 判断超时，尚未确认本次操作是否成功。", { code: "TIMEOUT", retryable: true });
        }
        if (externalSignal && externalSignal.aborted) {
          throw new ApiError("请求已取消。", { code: "ABORTED", retryable: false });
        }
        throw new ApiError("无法连接 AI 服务，请检查网络后重试。", { code: "NETWORK_ERROR", retryable: true });
      }

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        if (response.ok) throw new ApiError("AI 服务返回了无法识别的数据。", { code: "INVALID_RESPONSE", status: response.status, retryable: true });
      }
      if (!response.ok) throw errorFromResponse(response, payload);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new ApiError("AI 服务返回了无效结果。", { code: "INVALID_RESPONSE", status: response.status, retryable: true });
      }
      return payload;
    } finally {
      root.clearTimeout(timeout);
      if (externalSignal && externalAbort) externalSignal.removeEventListener("abort", externalAbort);
    }
  }

  function start(domainId, actionId, options) {
    return request({ action: "start", domainId, actionId: actionId || createActionId() }, options);
  }

  function question(sessionToken, text, revision, actionId, options) {
    assertOpaqueToken(sessionToken);
    return request({ action: "question", sessionToken, text, revision, actionId }, options);
  }

  function guess(sessionToken, text, revision, actionId, options) {
    assertOpaqueToken(sessionToken);
    return request({ action: "guess", sessionToken, text, revision, actionId }, options);
  }

  function reveal(sessionToken, revision, actionId, options) {
    assertOpaqueToken(sessionToken);
    return request({ action: "reveal", sessionToken, revision, actionId }, options);
  }

  function resume(sessionToken, options) {
    assertOpaqueToken(sessionToken);
    return request({ action: "resume", sessionToken }, options);
  }

  return Object.freeze({
    ENDPOINT,
    DEFAULT_TIMEOUT_MS,
    ApiError,
    createActionId,
    request,
    start,
    question,
    guess,
    reveal,
    resume
  });
});
