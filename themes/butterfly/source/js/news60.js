(() => {
  'use strict';

  const SELECTOR = '[data-news60]';
  const API_URLS = [
    'https://60s.viki.moe/v2/60s?encoding=text',
    'https://60s-api.viki.moe/v2/60s?encoding=text',
  ];
  const REQUEST_TIMEOUT_MS = 8000;
  const MAX_RESPONSE_CHARS = 64 * 1024;
  const MAX_RESPONSE_BYTES = MAX_RESPONSE_CHARS * 4;

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function safeArticleHref(value) {
    const candidate = String(value || '').trim();
    if (
      !candidate.startsWith('/')
      || candidate.startsWith('//')
      || candidate.includes('\\')
      || /(?:^|\/)\.\.(?:\/|$)/.test(candidate)
      || /[\u0000-\u001f\u007f]/.test(candidate)
    ) return '/2099/12/31/%E6%AF%8F%E6%97%A5%E6%96%B0%E9%97%BB/';
    return candidate;
  }

  function englishNoticeHtml() {
    let chineseArticleUrl = '/2099/12/31/%E6%AF%8F%E6%97%A5%E6%96%B0%E9%97%BB/';
    try {
      const languageLink = document.querySelector('#language-switch a');
      if (languageLink && typeof languageLink.getAttribute === 'function') {
        chineseArticleUrl = safeArticleHref(languageLink.getAttribute('href'));
      }
    } catch (_) {}

    return `
      <div role="status" style="margin:16px 0;padding:18px 20px;background:rgba(127,127,127,.08);border-radius:10px;line-height:1.65;color:var(--font-color,#555);">
        <p style="margin:0 0 10px;">The 60-second news feed is currently available only in Chinese, so its Chinese text is not shown on this English page.</p>
        <a href="${escapeHtml(chineseArticleUrl)}" lang="zh-CN" hreflang="zh-CN">Open the Chinese version of this article</a>
      </div>`;
  }

  function loadingHtml() {
    return typeof window.apcLoadingHtml === 'function'
      ? window.apcLoadingHtml('正在加载每日新闻…')
      : '<p role="status" style="padding:20px;color:#888;">正在加载每日新闻…</p>';
  }

  function normalizeLines(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function newsTextHtml(lines) {
    if (!Array.isArray(lines) || !lines.length) throw new Error('empty news response');

    const heading = `<h2>${escapeHtml(lines[0])}</h2>`;
    const items = lines.slice(1, -1).map((line) => {
      const cleaned = line.replace(/^\d+[.、]\s*/, '');
      return `<li style="margin-bottom:8px;">${escapeHtml(cleaned)}</li>`;
    }).join('');
    const list = items ? `<ol>${items}</ol>` : '';
    const footer = lines.length > 1
      ? `<div style="margin-top:15px;font-style:italic;">${escapeHtml(lines[lines.length - 1])}</div>`
      : '';

    return `${heading}${list}${footer}`;
  }

  async function fetchNewsText() {
    let lastError;
    for (const apiUrl of API_URLS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: { Accept: 'text/plain' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const declaredLength = Number(
          response.headers && typeof response.headers.get === 'function'
            ? response.headers.get('content-length')
            : 0
        );
        if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
          throw new Error('news response is too large');
        }
        const responseText = await response.text();
        if (responseText.length > MAX_RESPONSE_CHARS) {
          throw new Error('news response is too large');
        }
        const lines = normalizeLines(responseText);
        if (lines.length) return lines;
        throw new Error('empty news response');
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
    }
    throw lastError || new Error('news feed unavailable');
  }

  function init() {
    const containers = Array.from(document.querySelectorAll(SELECTOR));
    if (!containers.length) return;

    const language = String(
      (document.documentElement && document.documentElement.lang) || ''
    );
    if (/^en(?:-|$)/i.test(language)) {
      const notice = englishNoticeHtml();
      containers.forEach((container) => { container.innerHTML = notice; });
      return;
    }

    containers.forEach((container) => { container.innerHTML = loadingHtml(); });
    fetchNewsText()
      .then((lines) => {
        const html = newsTextHtml(lines);
        containers.forEach((container) => { container.innerHTML = html; });
      })
      .catch((error) => {
        containers.forEach((container) => {
          container.innerHTML = `
            <div role="status" style="color:#d9534f;padding:15px;background:#f8d7da;border-left:4px solid #d9534f;">
              每日新闻暂时无法加载，请稍后刷新页面。
            </div>`;
        });
        try { console.error('[News60] News feed unavailable.', error); } catch (_) {}
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
