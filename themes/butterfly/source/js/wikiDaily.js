(function () {
  'use strict';

  const SNAPSHOT_URL = '/images/daily/daily-images.json';
  const LOCAL_IMAGE_PREFIX = '/images/daily/';
  const CACHE_KEY = 'apc-wikipedia-daily-last-success-v1';
  const IS_ENGLISH_PAGE = /^en(?:-|$)/i.test(String(
    (document.documentElement && document.documentElement.lang) || ''
  ));
  const UI = IS_ENGLISH_PAGE
    ? {
        loading: 'Loading the Wikipedia Picture of the Day…',
        defaultTitle: 'Wikipedia Picture of the Day',
        snapshotUnavailable: 'Today\'s local snapshot is not available. Please try again later.',
        localImageUnavailable: 'The local image is not available. Please try again later.',
        cachedNotice: 'Today\'s snapshot is unavailable. Showing the most recent successful snapshot.',
        noDescription: 'An English description is not available for this snapshot.',
      }
    : {
        loading: '正在加载维基百科每日图片…',
        defaultTitle: '维基百科每日图片',
        snapshotUnavailable: '今日快照暂不可用，请稍后再试。',
        localImageUnavailable: '本地图片暂不可用，请稍后再试。',
        cachedNotice: '今日快照暂不可用，正在显示最近一次成功快照。',
        noDescription: '无描述信息',
      };

  document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('wiki-daily-placeholder');
    if (!placeholder) return;

    const container = document.createElement('div');
    container.id = 'wiki-picture-container';
    container.className = 'm-auto max-w-4xl bg-white rounded-lg shadow-md p-5 my-6';
    container.innerHTML =
      typeof window.apcLoadingHtml === 'function'
        ? window.apcLoadingHtml(UI.loading)
        : `<p style="padding:20px;color:#888;">${UI.loading}</p>`;
    placeholder.parentNode.replaceChild(container, placeholder);

    const cachedEntry = readCachedEntry();

    loadDailySnapshot()
      .then(function (snapshot) {
        const entry = getWikipediaEntry(snapshot);
        if (!entry) throw new Error('每日快照中没有可用的本地维基图片');
        renderEntry(container, entry, cachedEntry, false);
      })
      .catch(function (error) {
        console.warn('读取维基百科每日图片本地快照失败:', error);
        if (cachedEntry) {
          renderEntry(container, cachedEntry, null, true);
        } else {
          renderPlaceholder(container, UI.snapshotUnavailable);
        }
      });
  });

  function loadDailySnapshot() {
    if (!window.apcDailyImagesPromise) {
      window.apcDailyImagesPromise = fetch(SNAPSHOT_URL, {
        cache: 'no-store',
        credentials: 'same-origin'
      }).then(function (response) {
        if (!response.ok) {
          throw new Error(`快照请求失败（HTTP ${response.status}）`);
        }
        return response.json();
      });
    }
    return window.apcDailyImagesPromise;
  }

  function getWikipediaEntry(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;

    const providers =
      snapshot.providers && typeof snapshot.providers === 'object'
        ? snapshot.providers
        : snapshot;
    const wikipedia = providers.wikipedia;
    if (!wikipedia || typeof wikipedia !== 'object') return null;

    const candidates = [
      wikipedia,
      wikipedia.current,
      wikipedia.last_success,
      snapshot.last_success && snapshot.last_success.wikipedia
    ];

    for (const candidate of candidates) {
      const entry = normalizeEntry(candidate, snapshot.date);
      if (entry) return entry;
    }
    return null;
  }

  function normalizeEntry(value, defaultDate) {
    if (!value || typeof value !== 'object') return null;

    // local_url 是后端快照唯一允许进入 img.src 的字段。即使快照里保留了
    // source_image_url，也绝不把它用作图片回退地址。
    const localUrl = normalizeLocalImageUrl(value.local_url);
    if (!localUrl) return null;

    return {
      local_url: localUrl,
      date: firstString(value.date, defaultDate),
      title: firstString(value.title),
      description: firstString(value.description),
      credit: firstString(value.copyright, value.credit),
      article_url: normalizeHttpUrl(firstString(value.source_page_url, value.article_url))
    };
  }

  function normalizeLocalImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';

    try {
      const parsed = new URL(value.trim(), window.location.origin);
      if (parsed.origin !== window.location.origin) return '';
      if (!parsed.pathname.startsWith(LOCAL_IMAGE_PREFIX)) return '';
      return parsed.pathname + parsed.search;
    } catch (error) {
      return '';
    }
  }

  function normalizeHttpUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
    } catch (error) {
      return '';
    }
  }

  function firstString() {
    for (let index = 0; index < arguments.length; index += 1) {
      if (typeof arguments[index] === 'string' && arguments[index].trim()) {
        return arguments[index].trim();
      }
    }
    return '';
  }

  function englishText(value) {
    const result = firstString(value);
    return /[\u3400-\u9fff\uf900-\ufaff]/.test(result) ? '' : result;
  }

  function readCachedEntry() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(CACHE_KEY);
      return raw ? normalizeEntry(JSON.parse(raw), '') : null;
    } catch (error) {
      return null;
    }
  }

  function rememberEntry(entry) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
      }
    } catch (error) {
      // 隐私模式或禁用存储时仍可正常展示当前本地快照。
    }
  }

  function renderEntry(container, entry, cachedEntry, isCachedFallback) {
    const displayTitle = IS_ENGLISH_PAGE
      ? englishText(entry.title) || UI.defaultTitle
      : entry.title || UI.defaultTitle;
    const displayDescription = IS_ENGLISH_PAGE
      ? englishText(entry.description)
      : entry.description;
    const displayCredit = IS_ENGLISH_PAGE ? englishText(entry.credit) : entry.credit;
    const img = document.createElement('img');
    img.alt = displayTitle;
    img.className =
      'w-full h-auto rounded-lg shadow-lg transition-transform duration-500 hover:scale-[1.02]';

    img.addEventListener(
      'load',
      function () {
        rememberEntry(entry);
      },
      { once: true }
    );

    img.addEventListener(
      'error',
      function () {
        const canUseCache =
          !isCachedFallback && cachedEntry && cachedEntry.local_url !== entry.local_url;

        if (canUseCache) {
          renderEntry(container, cachedEntry, null, true);
        } else {
          renderPlaceholder(container, UI.localImageUnavailable, entry.date);
        }
      },
      { once: true }
    );

    // 赋值前已经过同源及 /images/daily/ 前缀校验。
    img.src = entry.local_url;

    container.innerHTML = '';

    if (isCachedFallback) {
      const notice = document.createElement('div');
      notice.className =
        'bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-amber-800';
      notice.textContent = UI.cachedNotice;
      container.appendChild(notice);
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = 'overflow-hidden rounded-lg shadow-lg mb-6';
    imageContainer.appendChild(img);
    container.appendChild(imageContainer);

    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'text-xl font-bold text-gray-800 mb-4';
    dateDisplay.textContent = formatDate(entry.date);
    container.appendChild(dateDisplay);

    if (displayTitle) {
      const title = document.createElement('div');
      title.className = 'text-lg font-semibold text-gray-800 mb-3';
      if (entry.article_url) {
        const link = document.createElement('a');
        link.href = entry.article_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = displayTitle;
        title.appendChild(link);
      } else {
        title.textContent = displayTitle;
      }
      container.appendChild(title);
    }

    if (displayDescription || displayCredit || (IS_ENGLISH_PAGE && entry.description)) {
      const description = document.createElement('div');
      description.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';

      if (displayDescription) {
        const body = document.createElement('div');
        body.innerHTML = convertWikiToHtml(displayDescription);
        description.appendChild(body);
      } else if (IS_ENGLISH_PAGE && entry.description) {
        const body = document.createElement('p');
        body.textContent = UI.noDescription;
        description.appendChild(body);
      }

      if (displayCredit) {
        const credit = document.createElement('p');
        credit.className = 'text-sm text-gray-500 mt-3';
        credit.textContent = displayCredit;
        description.appendChild(credit);
      }
      container.appendChild(description);
    }
  }

  function renderPlaceholder(container, message, date) {
    container.innerHTML = '';

    const empty = document.createElement('div');
    empty.className =
      'bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500';
    empty.setAttribute('role', 'status');

    const icon = document.createElement('i');
    icon.className = 'fas fa-image text-3xl mb-3';
    icon.setAttribute('aria-hidden', 'true');
    empty.appendChild(icon);

    const text = document.createElement('p');
    text.textContent = message;
    empty.appendChild(text);
    container.appendChild(empty);

    if (date) {
      const dateDisplay = document.createElement('div');
      dateDisplay.className = 'text-sm text-gray-500 mt-3';
      dateDisplay.textContent = formatDate(date);
      container.appendChild(dateDisplay);
    }
  }

  function formatDate(value) {
    const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match && IS_ENGLISH_PAGE) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
    }
    if (match) return `${match[1]}年${match[2]}月${match[3]}日`;

    const today = new Date();
    if (IS_ENGLISH_PAGE) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    }
    return `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, '0')}月${String(
      today.getDate()
    ).padStart(2, '0')}日`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 快照保存的是维基文本；这里只生成文字格式和百科链接，不生成任何图片标签。
  function convertWikiToHtml(wikiText) {
    if (!wikiText) return `<p>${UI.noDescription}</p>`;

    let html = escapeHtml(wikiText.replace(/\{\{.*?\}\}/gs, ''));
    html = html
      .replace(/'''(.+?)'''/g, '<strong>$1</strong>')
      .replace(/''(.+?)''/g, '<em>$1</em>');

    html = html.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, function (_, target, label) {
      const href = `https://en.wikipedia.org/wiki/${encodeURIComponent(target.replace(/ /g, '_'))}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    html = html.replace(/\[\[([^\]|]+)\]\]/g, function (_, target) {
      const href = `https://en.wikipedia.org/wiki/${encodeURIComponent(target.replace(/ /g, '_'))}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${target}</a>`;
    });

    html = html.replace(/\r?\n\r?\n/g, '</p><p>').replace(/\r?\n/g, '<br>');
    return `<p>${html}</p>`;
  }
})();
