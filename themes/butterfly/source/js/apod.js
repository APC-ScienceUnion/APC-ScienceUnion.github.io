/**
 * APOD：只读取本站构建时生成的每日快照。
 * 图片路径必须位于 /images/daily/；浏览器不会请求 NASA 或其他外部图片服务。
 */
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-apod]');
  if (!containers.length) return;

  const isEnglishPage = /^en(?:-|$)/i.test(String(
    (document.documentElement && document.documentElement.lang) || ''
  ));
  const ui = isEnglishPage
    ? {
        imageUnavailable: 'Today\'s local astronomy image snapshot is not available.',
        imageAlt: 'Astronomy Picture of the Day',
        stale: 'The current snapshot is unavailable. Showing the most recent snapshot saved on this site.',
        snapshotDate: 'Snapshot date:',
        descriptionUnavailable: 'An English description is not available for this snapshot.',
        copyright: 'Credit:',
        loading: 'Loading the Astronomy Picture of the Day…',
        snapshotPending: 'The APOD daily snapshot is not ready yet. Please try again later.',
      }
    : {
        imageUnavailable: '今日天文图片快照暂不可用',
        imageAlt: '每日一天文图',
        stale: '当前快照暂不可用，正在显示上次保存的本站快照。',
        snapshotDate: '快照日期：',
        descriptionUnavailable: '',
        copyright: '版权：',
        loading: '正在加载每日一天文图片…',
        snapshotPending: 'APOD 每日快照尚未准备好，请稍后再来。',
      };

  const DAILY_INDEX = '/images/daily/daily-images.json';
  const CACHE_KEY = 'apc-daily-apod-v1';

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

  function englishText(value) {
    const result = text(value);
    return /[\u3400-\u9fff\uf900-\ufaff]/.test(result) ? '' : result;
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
    let provider = providers.apod;
    if (!provider && payload.items && typeof payload.items === 'object') provider = payload.items.apod;
    if (provider && typeof provider === 'object') provider = provider.current || provider.latest || provider;
    return provider && typeof provider === 'object' ? provider : null;
  }

  function normalize(raw) {
    const meta = raw && raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {};
    const description = firstText(raw && raw.description, meta.description);
    const explanationEn = firstText(raw && raw.explanation_en, meta.explanation_en);
    return {
      local_url: safeDailyImage(raw && raw.local_url),
      title: firstText(raw && raw.title, meta.title),
      title_en: firstText(raw && raw.title_en, meta.title_en),
      date: firstText(raw && raw.date, meta.date),
      // 兼容旧快照：若两个字段完全相同，不在中文页重复英文说明。
      description: description === explanationEn ? '' : description,
      explanation_en: explanationEn,
      tomorrow: firstText(raw && raw.tomorrow, meta.tomorrow),
      copyright: firstText(raw && raw.copyright, meta.copyright),
      media_type: firstText(raw && raw.media_type, meta.media_type) || 'image',
    };
  }

  function hasContent(data) {
    return Boolean(data && (
      data.local_url || data.title || data.title_en || data.description || data.explanation_en
        || data.tomorrow || data.copyright
    ));
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

  const apodPromise = fetchDailyIndex()
    .then((payload) => {
      const provider = providerFrom(payload);
      if (!provider) throw new Error('快照中没有 APOD 数据');
      const data = normalize(provider);
      if (!hasContent(data)) throw new Error('APOD 快照内容为空');
      writeCache(data);
      return { data, stale: false };
    })
    .catch((error) => {
      const cached = readCache();
      if (cached) return { data: cached, stale: true };
      throw error;
    });

  function paragraphs(value) {
    if (!value) return '';
    return String(value)
      .split(/\n+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p style="margin:.4em 0;">${esc(part)}</p>`)
      .join('');
  }

  function unavailableImage() {
    return `<div class="daily-image-placeholder" style="margin:12px 0;padding:28px 16px;text-align:center;color:#777;background:rgba(127,127,127,.08);border-radius:8px;">${ui.imageUnavailable}</div>`;
  }

  function attachImageFallback(box) {
    const image = box.querySelector && box.querySelector('img[data-daily-local-image]');
    if (!image) return;
    image.addEventListener('error', () => {
      image.outerHTML = unavailableImage();
    }, { once: true });
  }

  function render(box, result) {
    const data = result.data;
    const displayTitle = isEnglishPage
      ? firstText(englishText(data.title_en), englishText(data.title))
      : data.title;
    const displayCopyright = isEnglishPage ? englishText(data.copyright) : data.copyright;
    const englishDescription = isEnglishPage
      ? firstText(englishText(data.explanation_en), englishText(data.description))
      : '';
    let html = result.stale
      ? `<p style="font-size:.9em;color:#8a6500;">${ui.stale}</p>`
      : '';

    if (data.local_url) {
      html += `<img data-daily-local-image src="${esc(data.local_url)}" alt="${esc(displayTitle || ui.imageAlt)}" style="max-width:100%;display:block;margin:0 auto;border-radius:8px;" loading="lazy" />`;
    } else {
      html += unavailableImage();
    }

    if (displayTitle || data.date) {
      html += '<div style="margin-top:14px;">';
      if (displayTitle) html += `<h2 style="margin-bottom:6px;">${esc(displayTitle)}</h2>`;
      if (data.date) html += `<p style="color:#666;font-size:.9em;">${ui.snapshotDate}${esc(data.date)}</p>`;
      html += '</div>';
    }

    if (isEnglishPage && englishDescription) {
      html += `<div style="margin-top:14px;line-height:1.65;">${paragraphs(englishDescription)}</div>`;
    } else if (isEnglishPage) {
      html += `<p style="color:#888;">${ui.descriptionUnavailable}</p>`;
    } else if (data.description) {
      html += `<div style="margin-top:14px;line-height:1.65;">${paragraphs(data.description)}</div>`;
    } else if (data.explanation_en) {
      html += '<p style="color:#888;">中文说明暂不可用，以下为英文说明：</p>';
      html += `<div style="margin-top:8px;line-height:1.6;">${paragraphs(data.explanation_en)}</div>`;
    }

    if (displayCopyright) {
      html += `<p style="margin-top:12px;font-size:.9em;color:#666;">${ui.copyright}${esc(displayCopyright)}</p>`;
    }

    if (!isEnglishPage && data.tomorrow) {
      html += `<p style="margin-top:12px;font-size:.9em;color:#666;">明日图片预告：${esc(data.tomorrow)}</p>`;
    }

    if (!isEnglishPage && data.description && data.explanation_en) {
      html += '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(0,0,0,.08);">';
      html += '<p style="margin:0 0 10px;color:#888;font-size:.88em;">NASA 英文原文</p>';
      html += `<div style="line-height:1.65;color:#444;font-size:.95em;">${paragraphs(data.explanation_en)}</div>`;
      html += '</div>';
    }

    box.innerHTML = html;
    attachImageFallback(box);
  }

  const loadingHtml = typeof window.apcLoadingHtml === 'function'
    ? window.apcLoadingHtml(ui.loading)
    : `<p style="padding:20px;color:#888;">${ui.loading}</p>`;
  containers.forEach((box) => {
    box.innerHTML = loadingHtml;
  });

  apodPromise
    .then((result) => {
      containers.forEach((box) => render(box, result));
    })
    .catch((error) => {
      console.error('本站 APOD 快照加载失败:', error);
      containers.forEach((box) => {
        box.innerHTML = `${unavailableImage()}<p style="color:#888;">${ui.snapshotPending}</p>`;
      });
    });
});
