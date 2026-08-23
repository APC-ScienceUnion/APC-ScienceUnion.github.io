(() => {
  'use strict';

  const SELECTOR = '[data-today-in-history]';
  const SNAPSHOT_FILE = 'ScienceHistory/science_today.json';
  const DEFAULT_POSTER_FILE = 'ScienceHistory/science_today.png';
  const CACHE_KEY = 'apcScienceHistorySnapshot:v2';
  const MAX_ITEMS = 24;

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function cleanText(value, fallback = '', maxLength = 260) {
    const text = typeof value === 'string'
      ? value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    return (text || fallback).slice(0, maxLength);
  }

  function configuredRoot() {
    let candidate = '/';
    try {
      if (window.KEEP && window.KEEP.hexo_config && window.KEEP.hexo_config.root) {
        candidate = window.KEEP.hexo_config.root;
      } else if (window.CONFIG && window.CONFIG.root) {
        candidate = window.CONFIG.root;
      }
    } catch (_) {}

    candidate = String(candidate || '/').trim();
    if (
      !candidate.startsWith('/')
      || candidate.startsWith('//')
      || candidate.includes('\\')
      || /(?:^|\/)\.\.(?:\/|$)/.test(candidate)
      || /%(?:2e|2f|5c)/i.test(candidate)
      || /[?#\u0000-\u001f\u007f]/.test(candidate)
    ) return '/';

    return candidate.endsWith('/') ? candidate : `${candidate}/`;
  }

  function siteAssetPath(file, root) {
    const relative = String(file || '').replace(/^\/+/, '');
    return `${root}${relative}`.replace(/\/{2,}/g, '/');
  }

  function safePosterPath(value, root) {
    let candidate = typeof value === 'string' ? value.trim() : '';
    if (!candidate) return siteAssetPath(DEFAULT_POSTER_FILE, root);

    if (
      candidate.startsWith('//')
      || /^[a-z][a-z\d+.-]*:/i.test(candidate)
      || candidate.includes('\\')
      || /(?:^|\/)\.\.(?:\/|$)/.test(candidate)
      || /%(?:2e|2f|5c)/i.test(candidate)
      || /[?#\u0000-\u001f\u007f]/.test(candidate)
      || !/\.(?:png|jpe?g|webp|avif)$/i.test(candidate)
    ) return siteAssetPath(DEFAULT_POSTER_FILE, root);

    candidate = candidate.replace(/^\/+/, '');
    const rootPrefix = root.replace(/^\/+|\/+$/g, '');
    if (rootPrefix && candidate.startsWith(`${rootPrefix}/`)) return `/${candidate}`;
    return siteAssetPath(candidate, root);
  }

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

  function normalizeItem(item) {
    if (typeof item === 'string') {
      const text = cleanText(item, '', 320);
      if (!text) return null;
      const legacy = text.match(/^(\d{3,4}年?)\s*[：:—-]?\s*(.*)$/);
      return {
        label: legacy ? legacy[1] : '',
        title: '',
        text: legacy && legacy[2] ? legacy[2] : text,
      };
    }

    if (!item || typeof item !== 'object') return null;
    const label = cleanText(item.label || item.year, '', 24);
    const title = cleanText(item.title, '', 100);
    const text = cleanText(item.text || item.description, '', 320);
    if (!label && !title && !text) return null;
    return { label, title, text };
  }

  function normalizeSnapshot(raw, root) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) {
      throw new Error('Invalid science-history snapshot');
    }

    const items = raw.items.slice(0, MAX_ITEMS).map(normalizeItem).filter(Boolean);
    if (!items.length) throw new Error('Science-history snapshot contains no verified items');

    const subtitle = cleanText(
      raw.subtitle,
      [cleanText(raw.date_text, '', 40), cleanText(raw.week, '', 20)].filter(Boolean).join(' '),
      160
    );
    const dateCandidate = cleanText(raw.date || raw.generated_for || raw.snapshot_date, '', 32);
    const subtitleDate = subtitle.match(/\b\d{4}-\d{2}-\d{2}\b/);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateCandidate)
      ? dateCandidate
      : (subtitleDate ? subtitleDate[0] : '');

    return {
      version: Number.isFinite(Number(raw.version)) ? Number(raw.version) : 1,
      date,
      kicker: cleanText(raw.kicker, 'SCIENCE HISTORY', 60),
      title: cleanText(raw.title, '科技史上的今天', 80),
      subtitle,
      deck: cleanText(raw.deck, '', 260),
      poster: safePosterPath(
        raw.poster || raw.poster_url || raw.image || raw.image_url || raw.local_url,
        root
      ),
      items,
    };
  }

  function loadingHtml() {
    return `
      <div role="status" aria-live="polite" style="margin:16px 0;padding:18px 20px;border-radius:12px;background:rgba(127,127,127,.08);color:var(--font-color,#555);">
        正在加载今日科技史快照…
      </div>`;
  }

  function unavailableHtml() {
    return `
      <div role="status" style="margin:16px 0;padding:18px 20px;border-left:4px solid #d97706;border-radius:10px;background:rgba(217,119,6,.1);color:var(--font-color,#555);line-height:1.7;">
        <strong>今日科技史快照暂时无法加载。</strong><br>
        定时任务会保留最近一次成功生成的文件；请稍后刷新页面。
      </div>`;
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
        <p style="margin:0 0 10px;">Today's science-history data is currently available only in Chinese. The Chinese text and poster are not embedded here because an editorially reviewed English edition is not yet available.</p>
        <a href="${escapeHtml(chineseArticleUrl)}" lang="zh-CN" hreflang="zh-CN">Open the Chinese version of this article</a>
      </div>`;
  }

  function snapshotHtml(snapshot, fromCache) {
    const status = fromCache
      ? `<div role="status" style="margin:0 0 14px;padding:10px 12px;border-radius:8px;background:rgba(217,119,6,.1);color:var(--font-color,#555);">本站快照暂时不可用，正在展示浏览器中最近一次成功保存的内容。</div>`
      : '';
    const meta = snapshot.date
      ? `本站每日快照 · ${escapeHtml(snapshot.date)}`
      : '本站每日快照';
    const list = snapshot.items.map((item) => {
      const heading = [
        item.label ? `<span style="display:inline-block;margin-right:8px;color:#b45309;font-weight:700;">${escapeHtml(item.label)}</span>` : '',
        item.title ? `<strong>${escapeHtml(item.title)}</strong>` : '',
      ].join('');
      return `
        <li style="padding:12px 0;border-bottom:1px solid rgba(127,127,127,.18);line-height:1.75;">
          ${heading ? `<div>${heading}</div>` : ''}
          ${item.text ? `<div${heading ? ' style="margin-top:3px;"' : ''}>${escapeHtml(item.text)}</div>` : ''}
        </li>`;
    }).join('');
    const version = snapshot.date ? `?v=${encodeURIComponent(snapshot.date)}` : '';

    return `
      ${status}
      <section style="max-width:900px;margin:16px auto;padding:20px;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,.18);color:var(--font-color,#333);">
        <div style="font-size:12px;letter-spacing:.12em;color:#b45309;font-weight:700;">${escapeHtml(snapshot.kicker)}</div>
        <h2 style="margin:6px 0 0;font-size:24px;color:var(--font-color,#222);">${escapeHtml(snapshot.title)}</h2>
        ${snapshot.subtitle ? `<div style="margin-top:5px;color:var(--font-color,#666);opacity:.76;font-size:14px;">${escapeHtml(snapshot.subtitle)}</div>` : ''}
        ${snapshot.deck ? `<p style="margin:12px 0 4px;line-height:1.7;">${escapeHtml(snapshot.deck)}</p>` : ''}
        <ol style="list-style:none;padding:0;margin:12px 0 0;">${list}</ol>
        <div style="margin-top:12px;font-size:12px;opacity:.62;">${meta}</div>
      </section>
      <figure data-science-history-poster-wrap style="max-width:900px;margin:18px auto 0;">
        <img data-science-history-poster src="${escapeHtml(snapshot.poster + version)}" alt="${escapeHtml(snapshot.title)}长图" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.08);">
      </figure>`;
  }

  function attachPosterFallback(container) {
    if (!container || typeof container.querySelector !== 'function') return;
    const image = container.querySelector('[data-science-history-poster]');
    if (!image || typeof image.addEventListener !== 'function') return;
    image.addEventListener('error', () => {
      const figure = typeof image.closest === 'function'
        ? image.closest('[data-science-history-poster-wrap]')
        : null;
      if (figure) {
        figure.innerHTML = '<div role="status" style="padding:14px;border-radius:8px;background:rgba(127,127,127,.08);color:var(--font-color,#666);">今日长图快照暂时不可用，已保留上方经核验的文字记录。</div>';
      }
    }, { once: true });
  }

  function renderSnapshot(containers, snapshot, fromCache) {
    const html = snapshotHtml(snapshot, fromCache);
    containers.forEach((container) => {
      container.innerHTML = html;
      attachPosterFallback(container);
    });
  }

  function cachedSnapshot(root) {
    try {
      if (!window.localStorage) return null;
      const cached = window.localStorage.getItem(CACHE_KEY);
      return cached ? normalizeSnapshot(JSON.parse(cached), root) : null;
    } catch (_) {
      return null;
    }
  }

  function saveSnapshot(snapshot) {
    try {
      if (window.localStorage) window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
    } catch (_) {}
  }

  async function loadSnapshot(containers, root) {
    try {
      const response = await fetch(siteAssetPath(SNAPSHOT_FILE, root), {
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`);
      const rawText = await response.text();
      const snapshot = normalizeSnapshot(JSON.parse(rawText), root);
      saveSnapshot(snapshot);
      renderSnapshot(containers, snapshot, false);
    } catch (error) {
      const cached = cachedSnapshot(root);
      if (cached) {
        renderSnapshot(containers, cached, true);
      } else {
        containers.forEach((container) => { container.innerHTML = unavailableHtml(); });
      }
      try { console.error('[ScienceHistory] Local snapshot unavailable.', error); } catch (_) {}
    }
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
    loadSnapshot(containers, configuredRoot());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
