'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

const root = path.resolve(__dirname, '..');
const postRoot = path.join(root, 'source', '_posts');
const allowIncomplete = process.argv.includes('--allow-incomplete');

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}

function readPost(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
  const data = frontMatter.parse(raw);
  return {
    file,
    name: path.basename(file, '.md'),
    raw,
    body: data._content || '',
    data
  };
}

function isEnglish(post) {
  const language = String(post && post.data ? post.data.lang || '' : '').toLowerCase();
  return language === 'en' || language.startsWith('en-');
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b, 'en'));
}

function sourceFingerprint(post) {
  return crypto.createHash('sha256').update(post.raw, 'utf8').digest('hex');
}

function occurrences(text, pattern, group = 0) {
  return [...text.matchAll(pattern)].map(match => match[group]);
}

function renderedImageTargets(post) {
  const html = occurrences(
    post.body,
    /\b(?:src|data-news60-header)\s*=\s*(["'])(.*?)\1/giu,
    2
  );
  const markdown = occurrences(post.body, /!\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/gu, 1);
  // Hilbert's Tenth Problem, Part IV legitimately discusses the same figures in
  // a different explanatory order in English, so image targets are a multiset.
  return sorted([String(post.data.cover || ''), ...html, ...markdown].filter(Boolean));
}

function linkTargets(post) {
  const html = occurrences(post.body, /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/giu, 2);
  const markdown = occurrences(post.body, /(?<!!)\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/gu, 1);
  return [...html, ...markdown];
}

function externalUrls(post) {
  return occurrences(post.body, /https?:\/\/[^\s<>'"\])\p{Script=Han}]+/gu)
    .map(url => url.replace(/[.,;:!?。，；：！？、]+$/u, ''));
}

function count(text, pattern) {
  return occurrences(text, pattern).length;
}

function visibleCjkCount(post) {
  const text = post.body
    .replace(/```[\s\S]*?```/gu, '')
    .replace(/<[^>]*>/gu, '')
    .replace(/https?:\/\/\S+/gu, '')
    .replace(/\/images\/\S+/gu, '');
  return count(text, /[\p{Script=Han}]/gu);
}

function untranslatedAccessibleText(post) {
  const htmlAttributes = occurrences(
    post.body,
    /\b(?:alt|title|aria-label)\s*=\s*(["'])(.*?)\1/giu,
    2
  );
  const markdownAlts = occurrences(post.body, /!\[([^\]]*)\]\(/gu, 1);
  return [...htmlAttributes, ...markdownAlts].filter(value => /[\p{Script=Han}]/u.test(value));
}

function rolesForAttributionLine(line, language) {
  const normalized = line.trim()
    .replace(/^>\s*/u, '')
    .replace(/^(?:&(?:emsp|ensp|nbsp);\s*)+/giu, '')
    .replace(/^(?:\*\*|__)/u, '');
  const match = normalized.match(/^([^:：]{1,80}?)(?:\*\*|__)?\s*[:：]/u);
  if (!match) return [];

  const labels = language === 'zh'
    ? match[1].split(/[、，,&及和/]+/u).map(label => label.trim())
    : match[1].toLowerCase().split(/\s+(?:and|&)\s+|[,/&]+/u).map(label => label.trim());
  const roles = [];
  for (const label of labels) {
    if (language === 'zh') {
      if (label === '作者') roles.push('author');
      if (label === '审核' || label === '校审') roles.push('reviewer');
      if (label === '校对') roles.push('proofreader');
      if (label === '翻译' || label === '译者') roles.push('translator');
      if (label === '责任编辑') roles.push('editor');
    } else {
      if (/^authors?$/u.test(label)) roles.push('author');
      if (/^(?:reviewers?|reviewed by|review by)$/u.test(label)) roles.push('reviewer');
      if (/^(?:proofreaders?|proofread by)$/u.test(label)) roles.push('proofreader');
      if (/^(?:translators?|translation|translation by|translated by)$/u.test(label)) roles.push('translator');
      if (/^(?:editors?|edited by)$/u.test(label)) roles.push('editor');
    }
  }
  return roles;
}

function openingAttribution(post, language) {
  const lines = post.body.split('\n');
  const nonEmptyLines = lines
    .map((line, index) => ({ line, index }))
    .filter(item => item.line.trim());
  // Two Nobel posts place their translation credits after a short opening
  // excerpt, so scan the opening 40 non-empty lines rather than only line one.
  const start = nonEmptyLines
    .slice(0, 40)
    .findIndex(item => rolesForAttributionLine(item.line, language).length);
  const roles = { author: 0, reviewer: 0, proofreader: 0, translator: 0, editor: 0 };
  const lineIndexes = new Set();
  if (start < 0) return { roles, lineIndexes };

  for (let index = start; index < nonEmptyLines.length; index += 1) {
    const item = nonEmptyLines[index];
    const lineRoles = rolesForAttributionLine(item.line, language);
    if (!lineRoles.length) break;
    lineIndexes.add(item.index);
    for (const role of lineRoles) roles[role] += 1;
  }
  return { roles, lineIndexes };
}

function punctuationOnlyLine(line) {
  const visible = line
    .replace(/&(?:emsp|ensp|nbsp);/giu, '')
    .replace(/<br\s*\/?>/giu, '')
    .replace(/[\p{P}\p{S}\s]/gu, '');
  return visible === '';
}

function substantiveBodyStructure(post, language) {
  const attribution = openingAttribution(post, language);
  const lines = post.body.split('\n').map((line, index) => (
    attribution.lineIndexes.has(index) || punctuationOnlyLine(line) ? '' : line
  ));
  // A heading starts a semantic block even when the source omitted the optional
  // blank line before the following Markdown list (as in the solar-flare post).
  const body = lines.join('\n').replace(/(^#{1,6}\s+.*$)/gmu, '\n\n$1\n\n');
  return {
    attribution: attribution.roles,
    nonEmptyLines: lines.filter(line => line.trim()).length,
    blocks: body.split(/\n\s*\n/gu).filter(block => block.trim()).length
  };
}

function translationWordRatio(english, chinese) {
  const clean = value => value
    .replace(/```[\s\S]*?```/gu, '')
    .replace(/\$\$[\s\S]*?\$\$/gu, '')
    .replace(/<[^>]*>/gu, ' ')
    .replace(/https?:\/\/\S+/gu, ' ')
    .replace(/\/images\/\S+/gu, ' ')
    .replace(/\{%[\s\S]*?%\}/gu, ' ');
  const chineseCharacters = count(clean(chinese.body), /[\p{Script=Han}]/gu);
  const englishWords = count(clean(english.body), /[A-Za-z]+(?:['’][A-Za-z]+)*/gu);
  return chineseCharacters ? englishWords / chineseCharacters : 1;
}

function assertSameList(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
}

const posts = markdownFiles(postRoot).map(readPost);
const chinesePosts = posts.filter(post => !isEnglish(post));
const englishPosts = posts.filter(isEnglish);
const chineseByKey = new Map(chinesePosts.map(post => [post.name, post]));
const englishByKey = new Map();
const permalinks = new Set();
const errors = [];

const expectedEnglishPairs = chinesePosts.length;
assert.ok(
  chinesePosts.length >= 98,
  'The baseline Chinese source-post inventory unexpectedly shrank'
);

for (const english of englishPosts) {
  try {
    const key = String(english.data.translation_key || '');
  if (allowIncomplete && !key) continue;
  assert.ok(key, `${english.name}: missing translation_key`);
  assert.ok(!englishByKey.has(key), `${english.name}: duplicate translation_key ${key}`);
  assert.ok(chineseByKey.has(key), `${english.name}: translation_key does not name a Chinese source post`);
  englishByKey.set(key, english);

  assert.equal(english.data.lang, 'en', `${english.name}: lang must be en`);
  assert.equal(english.data.layout, 'post', `${english.name}: layout must be post`);
  assert.equal(english.data.aside, true, `${english.name}: aside must be true so English pages retain the full site layout`);
  assert.equal(english.data.comments, false, `${english.name}: comments must be false`);
  assert.deepEqual(english.data.tags || [], [], `${english.name}: English taxonomy must not reuse Chinese tags`);
  assert.deepEqual(english.data.categories || [], [], `${english.name}: English taxonomy must not reuse Chinese categories`);
  assert.ok(english.data.title && !/[\p{Script=Han}]/u.test(String(english.data.title)), `${english.name}: title is not English`);

  const permalink = String(english.data.permalink || '');
  assert.match(permalink, /^en\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/u, `${english.name}: invalid English permalink`);
  assert.ok(!permalinks.has(permalink), `${english.name}: duplicate permalink ${permalink}`);
  permalinks.add(permalink);

  const chinese = chineseByKey.get(key);
  const translationSourceSha256 = String(english.data.translation_source_sha256 || '');
  assert.match(translationSourceSha256, /^[a-f0-9]{64}$/u, `${english.name}: missing or invalid translation_source_sha256`);
  assert.equal(
    translationSourceSha256,
    sourceFingerprint(chinese),
    `${english.name}: Chinese source changed after the English translation was reviewed`
  );
  for (const field of ['date', 'cover', 'copyright_author', 'katex', 'top']) {
    assert.deepEqual(english.data[field], chinese.data[field], `${english.name}: original ${field} metadata changed`);
  }
  assert.equal(String(english.data.cover || ''), String(chinese.data.cover || ''), `${english.name}: cover path changed`);
  assertSameList(renderedImageTargets(english), renderedImageTargets(chinese), `${english.name}: rendered image targets changed`);
  assertSameList(linkTargets(english), linkTargets(chinese), `${english.name}: link target order changed`);
  assertSameList(externalUrls(english), externalUrls(chinese), `${english.name}: external source URL order changed`);

  for (const [label, pattern] of [
    ['HTML images', /<img\b/giu],
    ['HTML divs', /<div\b/giu],
    ['center blocks', /<center\b/giu],
    ['Markdown headings', /^#{1,6}\s+/gmu],
    ['code fences', /^```/gmu],
    ['Hexo tags', /\{%[\s\S]*?%\}/gu],
    ['display-math delimiters', /\$\$/gu],
    ['LaTeX environments', /\\begin\{/gu]
  ]) {
    assert.equal(count(english.body, pattern), count(chinese.body, pattern), `${english.name}: ${label} structure changed`);
  }

    const englishStructure = substantiveBodyStructure(english, 'en');
    const chineseStructure = substantiveBodyStructure(chinese, 'zh');
    assert.deepEqual(englishStructure.attribution, chineseStructure.attribution, `${english.name}: opening attribution roles changed`);
    assert.equal(englishStructure.nonEmptyLines, chineseStructure.nonEmptyLines, `${english.name}: non-empty body line count changed`);
    assert.equal(englishStructure.blocks, chineseStructure.blocks, `${english.name}: non-empty body block count changed`);
    assert.ok(visibleCjkCount(english) <= 80, `${english.name}: too much untranslated Chinese remains in visible prose`);
    assert.deepEqual(untranslatedAccessibleText(english), [], `${english.name}: untranslated Chinese remains in image/link accessibility text`);
    assert.ok(translationWordRatio(english, chinese) >= 0.4, `${english.name}: English prose is too short relative to the Chinese source`);
  } catch (error) {
    errors.push(error.message);
  }
}

if (errors.length) {
  throw new assert.AssertionError({
    message: `Bilingual content check found ${errors.length} problem(s):\n- ${errors.join('\n- ')}`
  });
}

if (!allowIncomplete) {
  assert.equal(englishPosts.length, expectedEnglishPairs, `Expected ${expectedEnglishPairs} completed English post pairs`);
  assert.equal(englishByKey.size, expectedEnglishPairs, 'The completed bilingual post inventory is incomplete');
  assert.deepEqual(sorted(englishByKey.keys()), sorted(chineseByKey.keys()), 'The bilingual post pairs are incomplete');
}

console.log(`Bilingual content check passed: ${englishPosts.length} English post pairs (${chinesePosts.length} Chinese source posts currently visible)${allowIncomplete ? ' (in-progress mode)' : ''}.`);
