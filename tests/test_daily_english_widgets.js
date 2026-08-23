const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const JS_ROOT = path.join(ROOT, 'themes', 'butterfly', 'source', 'js');
const NEWS_FILE = path.join(JS_ROOT, 'news60.js');
const HISTORY_FILE = path.join(JS_ROOT, 'todayInHistory.js');
const WIKI_FILE = path.join(JS_ROOT, 'wikiDaily.js');

function runChineseOnlyNotice(file, selector) {
  const callbacks = {};
  const root = { innerHTML: '' };
  const requests = [];
  const document = {
    documentElement: { lang: 'en' },
    addEventListener(name, callback) { callbacks[name] = callback; },
    querySelectorAll(requested) { return requested === selector ? [root] : []; },
    querySelector(requested) {
      if (requested !== '#language-switch a') return null;
      return { getAttribute(name) { return name === 'href' ? '/zh/daily-news/' : ''; } };
    },
  };
  const context = {
    console: { error() {}, warn() {}, debug() {} },
    document,
    window: {},
    fetch: async (...args) => {
      requests.push(args);
      throw new Error('English notice widgets must not fetch Chinese-only data');
    },
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  callbacks.DOMContentLoaded();
  return { html: root.innerHTML, requests };
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this._innerHTML = '';
    this.textContent = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  replaceChild(next, current) {
    const index = this.children.indexOf(current);
    if (index >= 0) this.children.splice(index, 1, next);
    else this.children.push(next);
    next.parentNode = this;
    current.parentNode = null;
    return current;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener() {}

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

function visibleText(node) {
  const ownHtml = String(node._innerHTML || '').replace(/<[^>]*>/g, ' ');
  return [node.textContent || '', ownHtml, ...node.children.map(visibleText)].join(' ');
}

function allElements(node) {
  return [node, ...node.children.flatMap(allElements)];
}

async function runWiki(language, entry) {
  const callbacks = {};
  const requests = [];
  const page = new MockElement('main');
  const placeholder = new MockElement('div');
  placeholder.id = 'wiki-daily-placeholder';
  page.appendChild(placeholder);
  const storage = new Map();
  const document = {
    documentElement: { lang: language },
    addEventListener(name, callback) { callbacks[name] = callback; },
    getElementById(id) { return id === 'wiki-daily-placeholder' ? placeholder : null; },
    createElement(tagName) { return new MockElement(tagName); },
  };
  const window = {
    location: { origin: 'https://example.test' },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
  };
  const context = {
    URL,
    console: { error() {}, warn() {}, debug() {} },
    document,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => ({ providers: { wikipedia: entry } }),
      };
    },
    window,
  };
  vm.runInNewContext(fs.readFileSync(WIKI_FILE, 'utf8'), context, { filename: WIKI_FILE });
  callbacks.DOMContentLoaded();
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { page, requests };
}

async function main() {
  for (const [file, selector, expected] of [
    [NEWS_FILE, '[data-news60]', /60-second news feed is currently available only in Chinese/],
    [HISTORY_FILE, '[data-today-in-history]', /science-history data is currently available only in Chinese/],
  ]) {
    const result = runChineseOnlyNotice(file, selector);
    assert.match(result.html, expected);
    assert.match(result.html, /href="\/zh\/daily-news\/"/);
    assert.match(result.html, /hreflang="zh-CN"/);
    assert.doesNotMatch(result.html, /[\u3400-\u9fff\uf900-\ufaff]/u);
    assert.doesNotMatch(result.html, /<(?:img|canvas)\b/i);
    assert.equal(result.requests.length, 0, `${path.basename(file)} must not fetch Chinese-only data on English pages`);
  }

  const englishWiki = await runWiki('en-US', {
    date: '2026-08-24',
    local_url: '/images/daily/wikipedia-2026-08-24.jpg',
    image_path: '/images/daily/must-not-be-used.jpg',
    source_image_url: 'https://upload.wikimedia.invalid/external.jpg',
    title: '中文标题',
    description: '中文说明',
    copyright: '中文署名',
    article_url: 'https://en.wikipedia.org/wiki/Example',
  });
  assert.deepEqual(englishWiki.requests.map(({ url }) => url), ['/images/daily/daily-images.json']);
  const englishElements = allElements(englishWiki.page);
  const englishImages = englishElements.filter((element) => element.tagName === 'img');
  assert.equal(englishImages.length, 1);
  assert.equal(englishImages[0].src, '/images/daily/wikipedia-2026-08-24.jpg');
  assert.doesNotMatch(englishImages[0].src, /wikimedia|must-not-be-used/);
  const englishText = visibleText(englishWiki.page);
  assert.match(englishText, /Wikipedia Picture of the Day/);
  assert.match(englishText, /August 24, 2026/);
  assert.match(englishText, /An English description is not available/);
  assert.doesNotMatch(englishText, /中文标题|中文说明|中文署名/);

  const chineseWiki = await runWiki('zh-CN', {
    date: '2026-08-24',
    local_url: '/images/daily/wikipedia-2026-08-24.jpg',
    title: '中文标题',
    description: '中文说明',
    copyright: '中文署名',
  });
  const chineseText = visibleText(chineseWiki.page);
  assert.match(chineseText, /中文标题/);
  assert.match(chineseText, /中文说明/);
  assert.match(chineseText, /中文署名/);
  assert.match(chineseText, /2026年08月24日/);

  console.log('English daily-widget tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
