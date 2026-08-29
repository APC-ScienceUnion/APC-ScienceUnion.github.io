const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const WIDGET_FILE = path.join(ROOT, 'themes', 'butterfly', 'source', 'js', 'news60.js');

async function runWidget(responses, { fireTimeouts = 0 } = {}) {
  const callbacks = {};
  const requests = [];
  const container = { innerHTML: '' };
  const queue = [...responses];
  let remainingTimeouts = fireTimeouts;
  const document = {
    documentElement: { lang: 'zh-CN' },
    addEventListener(name, callback) { callbacks[name] = callback; },
    querySelectorAll(selector) { return selector === '[data-news60]' ? [container] : []; },
    querySelector() { return null; },
  };
  const context = {
    AbortController,
    clearTimeout() {},
    console: { error() {} },
    document,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (options.signal && options.signal.aborted) throw new Error('request aborted');
      const response = queue.shift();
      if (response instanceof Error) throw response;
      return {
        headers: {
          get(name) {
            return name === 'content-length' && response.contentLength != null
              ? String(response.contentLength)
              : null;
          },
        },
        ok: response.ok !== false,
        status: response.status || 200,
        text: async () => response.text,
      };
    },
    setTimeout(callback) {
      if (remainingTimeouts > 0) {
        remainingTimeouts -= 1;
        callback();
      }
      return 1;
    },
    window: {},
  };

  vm.runInNewContext(fs.readFileSync(WIDGET_FILE, 'utf8'), context, { filename: WIDGET_FILE });
  callbacks.DOMContentLoaded();
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { html: container.innerHTML, requests };
}

async function main() {
  const source = fs.readFileSync(WIDGET_FILE, 'utf8');
  assert.doesNotMatch(source, /createElement\(['"]canvas|toDataURL|generateNewsPoster|data-news60-header/i);

  const successful = await runWidget([{
    text: [
      '2026年8月30日 每日简报',
      '1. 第一条新闻',
      '2、<img src=x onerror=alert(1)>',
      '特别鸣谢：daily60s',
    ].join('\n'),
  }]);
  assert.equal(successful.requests.length, 1);
  assert.equal(successful.requests[0].options.cache, 'no-store');
  assert.equal(successful.requests[0].options.headers.Accept, 'text/plain');
  assert.ok(successful.requests[0].options.signal, '新闻请求必须绑定 AbortController signal');
  assert.match(successful.html, /<h2>2026年8月30日 每日简报<\/h2>/);
  assert.match(successful.html, /<li[^>]*>第一条新闻<\/li>/);
  assert.match(successful.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(successful.html, /特别鸣谢：daily60s/);
  assert.doesNotMatch(successful.html, /<(?:img|canvas)\b/i);

  const fallback = await runWidget([
    new Error('primary offline'),
    { text: '今日简报\n1. 备用接口正常\n页脚' },
  ]);
  assert.equal(fallback.requests.length, 2);
  assert.match(fallback.html, /备用接口正常/);
  assert.doesNotMatch(fallback.html, /<(?:img|canvas)\b/i);

  const timedOut = await runWidget([
    { text: '今日简报\n1. 超时后备用接口正常\n页脚' },
  ], { fireTimeouts: 1 });
  assert.equal(timedOut.requests.length, 2, '主端点超时后必须尝试备用端点');
  assert.equal(timedOut.requests[0].options.signal.aborted, true);
  assert.equal(timedOut.requests[1].options.signal.aborted, false);
  assert.match(timedOut.html, /超时后备用接口正常/);

  const oversized = await runWidget([
    { text: 'x'.repeat(64 * 1024 + 1) },
    { text: '今日简报\n1. 超限后备用接口正常\n页脚' },
  ]);
  assert.equal(oversized.requests.length, 2, '超出字符上限后必须尝试备用端点');
  assert.match(oversized.html, /超限后备用接口正常/);
  assert.doesNotMatch(oversized.html, /x{100}/);

  const declaredOversized = await runWidget([
    { text: '不会读取', contentLength: 64 * 1024 * 4 + 1 },
    { text: '今日简报\n1. Content-Length 超限后备用接口正常\n页脚' },
  ]);
  assert.equal(declaredOversized.requests.length, 2);
  assert.match(declaredOversized.html, /Content-Length 超限后备用接口正常/);

  const failed = await runWidget([new Error('secret one'), new Error('secret two')]);
  assert.match(failed.html, /每日新闻暂时无法加载/);
  assert.doesNotMatch(failed.html, /secret one|secret two/);

  console.log('60-second news text-only widget tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
