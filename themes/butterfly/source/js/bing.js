/**
 * 必应每日壁纸：只读取本站构建时生成的每日快照。
 * 图片路径必须位于 /images/daily/；加载失败时不会回退到任何外部图片。
 */
document.addEventListener('DOMContentLoaded', () => {
  const wallpaperRoots = document.querySelectorAll('[data-bing-wallpaper]');
  const descriptionRoots = document.querySelectorAll('[data-bing-description]');
  if (!wallpaperRoots.length && !descriptionRoots.length) return;

  const isEnglishPage = /^en(?:-|$)/i.test(String(
    (document.documentElement && document.documentElement.lang) || ''
  ));
  const ui = isEnglishPage
    ? {
        imageUnavailable: 'Today\'s local image snapshot is not available.',
        imageAlt: 'Bing wallpaper of the day',
        stale: 'The current snapshot is unavailable. Showing the most recent snapshot saved on this site.',
        staleShort: 'Showing the most recent snapshot saved on this site.',
        metadataUnavailable: 'An English description is not available for today\'s wallpaper. The image is shown from this site\'s local daily snapshot.',
        noDescription: 'No English description is available.',
        loadingWallpaper: 'Loading the Bing wallpaper of the day…',
        loadingDescription: 'Loading the Bing wallpaper description…',
        snapshotPending: 'The Bing daily snapshot is not ready yet. Please try again later.',
        descriptionPending: 'The Bing description snapshot is not ready yet.',
      }
    : {
        imageUnavailable: '今日图片快照暂不可用',
        imageAlt: '必应壁纸',
        stale: '当前快照暂不可用，正在显示上次保存的本站快照。',
        staleShort: '正在显示上次保存的本站快照。',
        metadataUnavailable: '',
        noDescription: '暂无描述',
        loadingWallpaper: '正在加载必应每日壁纸…',
        loadingDescription: '正在加载必应壁纸描述…',
        snapshotPending: '必应每日快照尚未准备好，请稍后再来。',
        descriptionPending: '必应描述快照尚未准备好。',
      };

  const DAILY_INDEX = '/images/daily/daily-images.json';
  const CACHE_KEY = 'apc-daily-bing-v1';

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function text(value) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  }

  function firstText(...values) {
    for (const value of values) {
      const result = text(value);
      if (result) return result;
    }
    return '';
  }

  function stripHtml(value) {
    const source = text(value);
    if (!source) return '';
    const holder = document.createElement('div');
    holder.innerHTML = source;
    return (holder.textContent || holder.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function englishText(value) {
    const result = text(value);
    return /[\u3400-\u9fff\uf900-\ufaff]/.test(result) ? '' : result;
  }

  function displayData(data) {
    if (!isEnglishPage) return data;
    return Object.assign({}, data, {
      title: englishText(data.title),
      show: englishText(data.show),
      detail: englishText(data.detail),
      copyright: englishText(data.copyright),
    });
  }

  /** 仅返回本站每日快照目录下的根相对路径。 */
  function safeDailyImage(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin || !url.pathname.startsWith('/images/daily/')) return '';
      return `${url.pathname}${url.search}`;
    } catch (_) {
      return '';
    }
  }

  function providerFrom(payload) {
    if (!payload || typeof payload !== 'object') return null;
    const providers = payload.providers && typeof payload.providers === 'object'
      ? payload.providers
      : payload;
    let provider = providers.bing;
    if (!provider && payload.items && typeof payload.items === 'object') provider = payload.items.bing;
    if (provider && typeof provider === 'object') provider = provider.current || provider.latest || provider;
    return provider && typeof provider === 'object' ? provider : null;
  }

  function normalize(raw) {
    const meta = raw && raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {};
    const localUrl = safeDailyImage(raw && raw.local_url);
    return {
      local_url: localUrl,
      title: firstText(raw && raw.headline, raw && raw.title, meta.headline, meta.title),
      show: firstText(raw && raw.subtitle, raw && raw.show, raw && raw.imgshow, meta.subtitle, meta.show),
      detail: stripHtml(firstText(
        raw && raw.description,
        raw && raw.detail,
        raw && raw.imgdetail,
        meta.description,
        meta.detail
      )),
      copyright: firstText(raw && raw.copyright, raw && raw.imgcopyright, meta.copyright),
      date: firstText(raw && raw.date, meta.date),
    };
  }

  function hasContent(data) {
    return Boolean(data && (data.local_url || data.title || data.show || data.detail || data.copyright));
  }

  function readCache() {
    try {
      const cached = normalize(JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null'));
      return hasContent(cached) ? cached : null;
    } catch (_) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function fetchDailyIndex() {
    if (!window.apcDailyImagesPromise) {
      window.apcDailyImagesPromise = fetch(DAILY_INDEX, {
        cache: 'no-store',
        credentials: 'same-origin',
      }).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }).then((payload) => {
        if (!payload || typeof payload !== 'object') throw new Error('每日快照格式异常');
        return payload;
      });
    }
    return window.apcDailyImagesPromise;
  }

  const bingPromise = fetchDailyIndex()
    .then((payload) => {
      const provider = providerFrom(payload);
      if (!provider) throw new Error('快照中没有必应数据');
      const data = normalize(provider);
      if (!hasContent(data)) throw new Error('必应快照内容为空');
      writeCache(data);
      return { data, stale: false };
    })
    .catch((error) => {
      const cached = readCache();
      if (cached) return { data: cached, stale: true };
      throw error;
    });

  function unavailableImage() {
    return `<div class="daily-image-placeholder" style="margin:12px 0;padding:28px 16px;text-align:center;color:#777;background:rgba(127,127,127,.08);border-radius:8px;">${ui.imageUnavailable}</div>`;
  }

  function attachImageFallback(root) {
    const image = root.querySelector && root.querySelector('img[data-daily-local-image]');
    if (!image) return;
    image.addEventListener('error', () => {
      const figure = image.closest && image.closest('figure');
      if (figure) figure.outerHTML = unavailableImage();
    }, { once: true });
  }

  function renderBlock(root, result) {
    const sourceData = result.data;
    const data = displayData(sourceData);
    let html = result.stale
      ? `<p style="font-size:.9em;color:#8a6500;">${ui.stale}</p>`
      : '';
    if (data.local_url) {
      html += `<figure style="margin:12px 0;"><img data-daily-local-image src="${esc(data.local_url)}" alt="${esc(data.title || ui.imageAlt)}" style="max-width:100%;height:auto;border-radius:8px;display:block;" loading="lazy" /></figure>`;
    } else {
      html += unavailableImage();
    }
    if (data.title) html += `<h2 style="margin:16px 0 8px;">${esc(data.title)}</h2>`;
    if (data.show) html += `<p style="opacity:.92;margin:0 0 8px;">${esc(data.show)}</p>`;
    if (data.detail) html += `<div class="bing-api-detail" style="line-height:1.65;margin:8px 0;">${esc(data.detail)}</div>`;
    if (data.copyright) html += `<p style="font-size:.9em;opacity:.85;margin-top:12px;">${esc(data.copyright)}</p>`;
    if (isEnglishPage && !data.title && !data.show && !data.detail && !data.copyright) {
      html += `<p style="color:#666;line-height:1.6;">${ui.metadataUnavailable}</p>`;
    }
    root.innerHTML = html;
    attachImageFallback(root);
  }

  const wallLoading = typeof window.apcLoadingHtml === 'function'
    ? window.apcLoadingHtml(ui.loadingWallpaper)
    : `<p style="padding:20px;color:#888;">${ui.loadingWallpaper}</p>`;
  const descLoading = typeof window.apcLoadingHtml === 'function'
    ? window.apcLoadingHtml(ui.loadingDescription)
    : `<p style="color:#888;">${ui.loadingDescription}</p>`;

  wallpaperRoots.forEach((root) => {
    root.innerHTML = wallLoading;
    bingPromise
      .then((result) => renderBlock(root, result))
      .catch((error) => {
        console.error('本站必应快照加载失败:', error);
        root.innerHTML = `${unavailableImage()}<p style="color:#888;">${ui.snapshotPending}</p>`;
      });
  });

  descriptionRoots.forEach((root) => {
    root.innerHTML = descLoading;
    bingPromise
      .then(({ data: sourceData, stale }) => {
        const data = displayData(sourceData);
        const parts = [];
        if (stale) parts.push(`<p style="font-size:.9em;color:#8a6500;">${ui.staleShort}</p>`);
        if (data.title) parts.push(`<h2>${esc(data.title)}</h2>`);
        if (data.show) parts.push(`<p>${esc(data.show)}</p>`);
        if (data.detail) parts.push(`<div class="bing-api-detail">${esc(data.detail)}</div>`);
        if (data.copyright) parts.push(`<p style="font-size:.9em;opacity:.85;">${esc(data.copyright)}</p>`);
        root.innerHTML = parts.length ? parts.join('') : `<p>${ui.noDescription}</p>`;
      })
      .catch((error) => {
        console.error('本站必应描述加载失败:', error);
        root.innerHTML = `<span style="color:#888;">${ui.descriptionPending}</span>`;
      });
  });
});
