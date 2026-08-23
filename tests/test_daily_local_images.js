const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BING_FILE = path.join(ROOT, 'themes', 'butterfly', 'source', 'js', 'bing.js');
const APOD_FILE = path.join(ROOT, 'themes', 'butterfly', 'source', 'js', 'apod.js');

function makeRoot() {
  return {
    innerHTML: '',
    querySelector(selector) {
      if (selector !== 'img[data-daily-local-image]') return null;
      const match = this.innerHTML.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
      if (!match) return null;
      return {
        addEventListener() {},
        closest() { return null; },
        outerHTML: match[0],
      };
    },
  };
}

function htmlStrippingElement() {
  return {
    _html: '',
    textContent: '',
    innerText: '',
    set innerHTML(value) {
      this._html = String(value);
      this.textContent = this._html.replace(/<[^>]*>/g, ' ');
      this.innerText = this.textContent;
    },
    get innerHTML() {
      return this._html;
    },
  };
}

async function runWidget(file, selector, payload, { language = 'zh-CN' } = {}) {
  const callbacks = {};
  const requests = [];
  const root = makeRoot();
  const storage = new Map();
  const document = {
    documentElement: { lang: language },
    addEventListener(name, callback) {
      callbacks[name] = callback;
    },
    querySelectorAll(requested) {
      return requested === selector ? [root] : [];
    },
    createElement() {
      return htmlStrippingElement();
    },
  };
  const window = {
    location: { origin: 'https://example.test' },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
  };
  const context = {
    AbortController,
    URL,
    console: { error() {} },
    document,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, status: 200, json: async () => payload };
    },
    window,
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  callbacks.DOMContentLoaded();
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { html: root.innerHTML, requests };
}

async function main() {
  const bingSource = fs.readFileSync(BING_FILE, 'utf8');
  const apodSource = fs.readFileSync(APOD_FILE, 'utf8');
  for (const [name, source] of [['bing.js', bingSource], ['apod.js', apodSource]]) {
    assert.doesNotMatch(source, /https?:\/\//, `${name} 不应包含运行时外部地址`);
    assert.match(source, /\/images\/daily\/daily-images\.json/, `${name} 应读取统一的本站清单`);
  }
  assert.doesNotMatch(apodSource, /api[_-]?key|allorigins|zhconvert/i, 'APOD 不应再包含前端密钥或代理 API');

  const bing = await runWidget(BING_FILE, '[data-bing-wallpaper]', {
    providers: {
      bing: {
        local_url: '/images/daily/bing/2026-08-24.jpg',
        headline: '本地必应标题',
        description: '本地说明',
      },
    },
  });
  assert.deepEqual(bing.requests.map(({ url }) => url), ['/images/daily/daily-images.json']);
  assert.match(bing.html, /src="\/images\/daily\/bing\/2026-08-24\.jpg"/);
  assert.match(bing.html, /本地必应标题/);

  const apod = await runWidget(APOD_FILE, '[data-apod]', {
    apod: {
      local_url: '/images/daily/apod/2026-08-23.jpg',
      title: '本地 APOD 标题',
      description: '中文说明',
      explanation_en: 'English explanation',
      media_type: 'image',
    },
  });
  assert.deepEqual(apod.requests.map(({ url }) => url), ['/images/daily/daily-images.json']);
  assert.match(apod.html, /src="\/images\/daily\/apod\/2026-08-23\.jpg"/);
  assert.match(apod.html, /中文说明/);

  const englishBing = await runWidget(BING_FILE, '[data-bing-wallpaper]', {
    providers: {
      bing: {
        local_url: '/images/daily/bing/2026-08-24.jpg',
        headline: '本地必应标题',
        description: '仅有中文说明',
        copyright: '中文署名',
      },
    },
  }, { language: 'en' });
  assert.match(englishBing.html, /src="\/images\/daily\/bing\/2026-08-24\.jpg"/);
  assert.doesNotMatch(englishBing.html, /本地必应标题|仅有中文说明|中文署名/);
  assert.match(englishBing.html, /An English description is not available/);

  const englishApod = await runWidget(APOD_FILE, '[data-apod]', {
    providers: {
      apod: {
        local_url: '/images/daily/apod/2026-08-23.jpg',
        title: 'Mostly Perseids',
        date: '2026-08-23',
        description: '中文说明不应出现在英文页面',
        explanation_en: 'English explanation shown once.',
        copyright: 'Local Observatory',
      },
    },
  }, { language: 'en-US' });
  assert.match(englishApod.html, /src="\/images\/daily\/apod\/2026-08-23\.jpg"/);
  assert.doesNotMatch(englishApod.html, /中文说明不应出现在英文页面/);
  assert.match(englishApod.html, /Snapshot date:/);
  assert.equal((englishApod.html.match(/English explanation shown once\./g) || []).length, 1);

  const unsafeBing = await runWidget(BING_FILE, '[data-bing-wallpaper]', {
    providers: {
      bing: {
        local_url: 'https://images.example.invalid/wallpaper.jpg',
        image_path: '/images/daily/bing/should-not-be-used.jpg',
        title: '只有文字可显示',
      },
    },
  });
  assert.doesNotMatch(unsafeBing.html, /<img\b/i, '外链 local_url 不得生成 img');
  assert.doesNotMatch(unsafeBing.html, /should-not-be-used/, '图片只能读取 local_url 字段');
  assert.match(unsafeBing.html, /今日图片快照暂不可用/);

  const unsafeApod = await runWidget(APOD_FILE, '[data-apod]', {
    providers: {
      apod: {
        local_url: '//cdn.example.invalid/apod.jpg',
        source_image_url: 'https://cdn.example.invalid/source.jpg',
        title: '安全占位测试',
      },
    },
  });
  assert.doesNotMatch(unsafeApod.html, /<img\b/i, '协议相对外链不得生成 img');
  assert.doesNotMatch(unsafeApod.html, /cdn\.example\.invalid/);
  assert.match(unsafeApod.html, /今日天文图片快照暂不可用/);

  const manifestFile = path.join(ROOT, 'source', 'images', 'daily', 'daily-images.json');
  if (fs.existsSync(manifestFile)) {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    for (const provider of ['bing', 'apod']) {
      const entry = manifest.providers && manifest.providers[provider];
      assert.ok(entry, `真实清单缺少 ${provider}`);
      assert.match(entry.local_url, /^\/images\/daily\/[A-Za-z0-9._-]+$/);
      assert.ok(
        fs.existsSync(path.join(ROOT, 'source', ...entry.local_url.slice(1).split('/'))),
        `${provider} 的真实本地图片不存在`
      );
    }
    const realBing = await runWidget(BING_FILE, '[data-bing-wallpaper]', manifest);
    const realApod = await runWidget(APOD_FILE, '[data-apod]', manifest);
    assert.ok(realBing.html.includes(`src="${manifest.providers.bing.local_url}"`));
    assert.ok(realApod.html.includes(`src="${manifest.providers.apod.local_url}"`));
    if (manifest.providers.apod.description === manifest.providers.apod.explanation_en) {
      const escapedExplanation = manifest.providers.apod.explanation_en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.equal((realApod.html.match(new RegExp(escapedExplanation, 'g')) || []).length, 1);
    }
  }

  console.log('Daily snapshot frontend tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
