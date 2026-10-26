const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const source = readFileSync('themes/butterfly/source/js/visitor-count.js', 'utf8');

function browser(options = {}) {
  const counts = ['siteVisitors', 'pageViews'].map(visitCount => ({ dataset: { visitCount }, textContent: '' }));
  const notes = [{}], stored = new Map();
  let requests = [];
  const context = vm.createContext({
    document: { currentScript: { dataset: { api: 'https://api.apc-science.cn', topic: '/articles/test' } },
      documentElement: { lang: options.lang || 'zh-CN' }, querySelectorAll: selector => selector === '[data-visit-count]' ? counts : notes },
    location: { hostname: options.hostname || 'apc-science.cn', pathname: '/test/' }, window: {},
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    crypto: { randomUUID }, AbortController, setTimeout, clearTimeout,
    fetch: async (url, init) => { requests.push({ url, init }); if (options.fail) throw new Error('offline'); return { ok: true, json: async () => ({ startedAt: '2026-10-25T17:00:00Z', siteVisitors: 5, siteViews: 12, pageViews: 4 }) }; }
  });
  const run = async () => { vm.runInContext(source, context); await new Promise(resolve => setImmediate(resolve)); };
  return { counts, notes, requests, run };
}

test('renders Beijing start date and counts; repeated script does not add another visit', async () => {
  const b = browser(); await b.run(); await b.run();
  assert.equal(b.requests.length, 1);
  assert.equal(b.requests[0].init.credentials, 'omit');
  assert.equal(b.requests[0].init.referrerPolicy, 'no-referrer');
  assert.equal(b.counts[0].textContent, '5'); assert.equal(b.counts[1].textContent, '4');
  assert.match(b.notes[0].textContent, /2026-10-26/);
  assert.match(b.notes[0].title, /不含原不蒜子/);
});
test('preview pages make no production requests and failures never display fabricated zeroes', async () => {
  const preview = browser({ hostname: 'localhost' }); await preview.run(); assert.equal(preview.requests.length, 0);
  const failed = browser({ fail: true, lang: 'en' }); await failed.run();
  assert.equal(failed.counts[0].textContent, 'Unavailable');
  assert.match(failed.notes[0].textContent, /temporarily unavailable/);
});
