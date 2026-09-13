'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { checkPostPairs } = require('./test_bilingual_content');
const { checkStandalonePages } = require('./test_bilingual_pages');

function fixture(run) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(temporaryRoot, 'bilingual-existence-'));
  const write = (relative, contents) => {
    const file = path.join(directory, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents, 'utf8');
  };
  try {
    run(directory, write);
  } finally {
    const target = fs.realpathSync(directory);
    assert.equal(path.dirname(target), temporaryRoot);
    assert.ok(path.basename(target).startsWith('bilingual-existence-'));
    fs.rmSync(target, { recursive: true });
  }
}

const english = '---\nlang: en\ntranslation_key: 测试\n---\n';

test('Windows CRLF, Unix LF and BOM files use the same pairing metadata', () => {
  fixture((directory, write) => {
    write('测试.md', '\uFEFF---\r\ntitle: 测试\r\n---\r\n正文');
    write('english.md', '\uFEFF' + english.replace(/\n/g, '\r\n'));
    assert.equal(checkPostPairs(directory).chinese, 1);
    assert.equal(checkPostPairs(directory).missing.length, 0);
  });
});

test('existing English file passes regardless of prose, formatting or metadata', () => {
  fixture((directory, write) => {
    write('数学/测试.md', '---\ntitle: 原标题\ndate: 2026-01-01\n---\n中文正文');
    write('数学/english.md', english);
    assert.equal(checkPostPairs(directory).missing.length, 0);
    write('数学/测试.md', '---\ntitle: 新标题\ncover: /new.png\n---\n<!-- changed -->\n# 新段落\n**术语** $x^2$\n![图](/changed.png)');
    write('数学/english.md', '---\nlang: en-US\ntranslation_key: 测试\n---\n未同步的正文');
    assert.equal(checkPostPairs(directory).missing.length, 0);
  });
});

test('missing English file fails and names the Chinese file', () => {
  fixture((directory, write) => {
    write('数学/测试.md', '中文正文');
    assert.throws(() => checkPostPairs(directory), /数学\/测试\.md/u);
    write('数学/english.md', '---\nlang: en\ntranslation_key: 其他文章\n---\n');
    assert.throws(() => checkPostPairs(directory), /数学\/测试\.md/u);
  });
});

test('a directory cannot substitute for an English file', () => {
  fixture((directory, write) => {
    write('测试.md', '正文');
    fs.mkdirSync(path.join(directory, 'english.md'));
    assert.throws(() => checkPostPairs(directory), /Missing English version/u);
  });
});

test('one counterpart is sufficient; extra English files do not block the check', () => {
  fixture((directory, write) => {
    write('测试.md', '正文');
    write('english.md', english);
    write('extra.md', '---\nlang: en\ntranslation_key: 额外文章\n---\n');
    write('another.md', english);
    assert.equal(checkPostPairs(directory).missing.length, 0);
  });
});

test('in-progress mode reports missing versions without failing', () => {
  fixture((directory, write) => {
    write('测试.md', '正文');
    assert.equal(checkPostPairs(directory, { allowIncomplete: true }).missing.length, 1);
  });
});

test('standalone pages and news data only require counterpart files', () => {
  fixture((directory, write) => {
    write('source/about/index.md', 'Changed Chinese page');
    write('source/en/about/index.md', '');
    write('source/_data/apc_news.yml', '- title: 新增新闻\n');
    write('source/_data/apc_news_en.yml', '[]');
    assert.equal(checkStandalonePages(directory), 2);
  });
});

test('missing standalone counterpart fails, including a directory in place of a file', () => {
  fixture((directory, write) => {
    write('source/honor-hall/index.md', '中文页面');
    assert.throws(() => checkStandalonePages(directory), /source\/en\/honor-hall\/index\.md/u);
    fs.mkdirSync(path.join(directory, 'source/en/honor-hall/index.md'), { recursive: true });
    assert.throws(() => checkStandalonePages(directory), /source\/en\/honor-hall\/index\.md/u);
  });
});

test('standalone sections absent from the source need no counterpart', () => {
  fixture(directory => assert.equal(checkStandalonePages(directory), 0));
});
