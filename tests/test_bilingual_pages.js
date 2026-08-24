'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');

function normalizedSource(file) {
  return fs.readFileSync(file, 'utf8')
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n?/gu, '\n');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function dateKey(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').slice(0, 10);
}

function embeddedImagePaths(value) {
  return [...String(value || '').matchAll(/\/images\/[^\s)'"<>]+/gu)]
    .map(match => match[0]);
}

function externalTargets(value) {
  return [...String(value || '').matchAll(/https?:\/\/[^\s)'"<>]+/gu)]
    .map(match => match[0]);
}

function nonEmptyBlocks(value) {
  return String(value || '').trim().split(/\n\s*\n/gu).filter(Boolean).length;
}

function markdownStructure(value) {
  return String(value || '').split(/\r?\n/gu)
    .map(line => {
      if (/^\s*!\[/u.test(line)) return 'image';
      const heading = line.match(/^\s*(#{1,6})\s/u);
      if (heading) return `heading-${heading[1].length}`;
      if (/^\s*>/u.test(line)) return 'quote';
      if (/^\s*[-*+]\s/u.test(line)) return 'unordered-item';
      if (/^\s*(?:\[\d+\]\s+|\d+、|\d+[.)](?!\d))/u.test(line)) return 'ordered-item';
      return '';
    })
    .filter(Boolean);
}

function numericTokens(value) {
  return String(value || '').match(/\d+(?:\.\d+)?%?/gu) || [];
}

function assertSourceNumbersPreserved(chineseValue, englishValue, label) {
  const required = numericTokens(chineseValue);
  const available = numericTokens(englishValue);
  const counts = new Map();
  for (const token of available) counts.set(token, (counts.get(token) || 0) + 1);
  for (const token of required) {
    const remaining = counts.get(token) || 0;
    assert.ok(remaining > 0, `${label} dropped or changed numeric token ${token}`);
    counts.set(token, remaining - 1);
  }
}

const chineseAboutFile = path.join(root, 'source', 'about', 'index.md');
const englishAboutFile = path.join(root, 'source', 'en', 'about', 'index.md');
assert.ok(fs.existsSync(englishAboutFile), 'missing English About page source');
const chineseAboutSource = normalizedSource(chineseAboutFile);
const englishAbout = frontMatter.parse(normalizedSource(englishAboutFile));
assert.equal(englishAbout.lang, 'en');
assert.equal(englishAbout.translation_key, 'page:about');
assert.equal(englishAbout.permalink, 'en/about/');
assert.equal(englishAbout.translation_source_sha256, sha256(chineseAboutSource), 'English About page is stale');
assert.ok(String(englishAbout._content || '').trim().length > 0, 'English About page is empty');

const allowedAboutNames = ['格物社', 'APC科学联盟', 'AIPC没有I'];
const englishAboutProse = allowedAboutNames.reduce(
  (value, name) => value.split(name).join(''),
  String(englishAbout._content || '')
);
assert.doesNotMatch(englishAboutProse, /[\p{Script=Han}]/u, 'English About page contains untranslated Chinese prose');

const chineseNews = yaml.load(normalizedSource(path.join(root, 'source', '_data', 'apc_news.yml')));
const chineseNewsSource = normalizedSource(path.join(root, 'source', '_data', 'apc_news.yml'));
const newsFingerprint = fs.readFileSync(path.join(root, 'tools', 'apc-news-en-source.sha256'), 'utf8').trim();
assert.equal(newsFingerprint, sha256(chineseNewsSource), 'English APC News data is stale');
const englishNewsFile = path.join(root, 'source', '_data', 'apc_news_en.yml');
assert.ok(fs.existsSync(englishNewsFile), 'missing English APC News data');
const englishNews = yaml.load(normalizedSource(englishNewsFile));
assert.ok(Array.isArray(chineseNews) && Array.isArray(englishNews));
assert.equal(englishNews.length, chineseNews.length, 'English APC News does not cover every Chinese entry');

for (let index = 0; index < chineseNews.length; index += 1) {
  const chinese = chineseNews[index];
  const english = englishNews[index];
  const label = `APC News item ${index + 1}`;
  assert.ok(english && typeof english === 'object', `${label} is missing`);
  assert.equal(dateKey(english.start), dateKey(chinese.start), `${label} start date changed`);
  assert.equal(dateKey(english.end), dateKey(chinese.end), `${label} end date changed`);
  assert.equal(english.cover || '', chinese.cover || '', `${label} cover changed`);
  assert.ok(String(english.title || '').trim(), `${label} has no English title`);
  assert.ok(String(english.content || '').trim(), `${label} has no English content`);
  assert.doesNotMatch(String(english.title), /[\p{Script=Han}]/u, `${label} title contains untranslated Chinese`);
  assert.doesNotMatch(String(english.content), /[\p{Script=Han}]/u, `${label} content contains untranslated Chinese`);
  assert.deepEqual(
    embeddedImagePaths(english.content),
    embeddedImagePaths(chinese.content),
    `${label} image references changed`
  );
  assert.deepEqual(
    externalTargets(english.content),
    externalTargets(chinese.content),
    `${label} external links changed`
  );
  assert.equal(
    nonEmptyBlocks(english.content),
    nonEmptyBlocks(chinese.content),
    `${label} lost or added a Markdown block`
  );
  assert.deepEqual(
    markdownStructure(english.content),
    markdownStructure(chinese.content),
    `${label} changed the Markdown structure`
  );
  assertSourceNumbersPreserved(
    `${chinese.title}\n${chinese.content}`,
    `${english.title}\n${english.content}`,
    label
  );
}

console.log(`Bilingual standalone-page check passed: About and ${englishNews.length} APC News entries.`);
