const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const WIDGET_FILE = path.join(ROOT, 'themes', 'butterfly', 'source', 'js', 'todayInHistory.js');

function makeContainer() {
  return {
    innerHTML: '',
    querySelector() { return null; },
  };
}

async function runWidget({ payload, fetchError, storage = new Map(), root = '/', language = 'zh-CN' }) {
  const callbacks = {};
  const requests = [];
  const container = makeContainer();
  const document = {
    documentElement: { lang: language },
    addEventListener(name, callback) { callbacks[name] = callback; },
    querySelectorAll(selector) { return selector === '[data-today-in-history]' ? [container] : []; },
    querySelector() { return null; },
  };
  const window = {
    CONFIG: { root },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
  };
  const context = {
    console: { error() {} },
    document,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (fetchError) throw fetchError;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(payload),
      };
    },
    window,
  };

  vm.runInNewContext(fs.readFileSync(WIDGET_FILE, 'utf8'), context, { filename: WIDGET_FILE });
  callbacks.DOMContentLoaded();
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { html: container.innerHTML, requests, storage };
}

const validSnapshot = {
  version: 1,
  date: '2026-08-24',
  timezone: 'Asia/Shanghai',
  kicker: 'SCIENCE HISTORY',
  title: '科技史上的今天',
  subtitle: '2026年8月24日（2026-08-24） · 2条科学坐标',
  deck: '从观测、实验到公共卫生，用一张图快速回看知识如何生长。',
  poster: '/ScienceHistory/science_today.png',
  items: [
    { label: '1609年', title: '望远镜观测', text: '一条经核验的科学史记录。' },
    { label: '1968年', title: '深空探测', text: '另一条经核验的科学史记录。' },
  ],
};

async function main() {
  const source = fs.readFileSync(WIDGET_FILE, 'utf8');
  assert.doesNotMatch(source, /api\.moonshot|dashscope|Kimi|Qwen|toDataURL|createElement\(['"]canvas/i);
  assert.match(source, /ScienceHistory\/science_today\.json/);
  assert.match(source, /ScienceHistory\/science_today\.png/);

  const successful = await runWidget({ payload: validSnapshot });
  assert.deepEqual(successful.requests.map(({ url }) => url), ['/ScienceHistory/science_today.json']);
  assert.equal(successful.requests[0].options.cache, 'no-cache');
  assert.equal(successful.requests[0].options.credentials, 'same-origin');
  assert.match(successful.html, /科技史上的今天/);
  assert.match(successful.html, /望远镜观测/);
  assert.match(successful.html, /src="\/ScienceHistory\/science_today\.png\?v=2026-08-24"/);
  assert.equal(successful.storage.size, 1, 'a valid local snapshot should be cached');

  const hostile = await runWidget({
    payload: {
      ...validSnapshot,
      title: '<img src=x onerror=alert(1)>',
      poster: 'https://outside.example/science.png',
      items: [{ label: '1900年', title: '<script>alert(1)</script>', text: '<b>unsafe</b>' }],
    },
  });
  assert.doesNotMatch(hostile.html, /outside\.example/);
  assert.doesNotMatch(hostile.html, /<script>|<b>unsafe<\/b>|<img src=x/i);
  assert.match(hostile.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(hostile.html, /src="\/ScienceHistory\/science_today\.png\?v=2026-08-24"/);

  const cached = await runWidget({
    payload: null,
    fetchError: new Error('offline'),
    storage: successful.storage,
  });
  assert.match(cached.html, /正在展示浏览器中最近一次成功保存的内容/);
  assert.match(cached.html, /望远镜观测/);

  const unavailable = await runWidget({ payload: null, fetchError: new Error('offline') });
  assert.match(unavailable.html, /今日科技史快照暂时无法加载/);
  assert.doesNotMatch(unavailable.html, /offline/);

  const legacy = await runWidget({
    root: '/library/',
    payload: {
      title: '科学史上的今天',
      date_text: '2026年8月24日',
      week: '星期一',
      items: ['1609年：伽利略展示望远镜', '1968年：一项深空探测任务启程'],
    },
  });
  assert.deepEqual(legacy.requests.map(({ url }) => url), ['/library/ScienceHistory/science_today.json']);
  assert.match(legacy.html, /src="\/library\/ScienceHistory\/science_today\.png"/);
  assert.match(legacy.html, /1609年/);
  assert.match(legacy.html, /伽利略展示望远镜/);

  console.log('Science-history local snapshot widget tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
