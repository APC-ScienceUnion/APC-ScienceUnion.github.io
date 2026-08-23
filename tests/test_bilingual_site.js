'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const frontMatter = require('hexo-front-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const postRoot = path.join(root, 'source', '_posts');
const englishRoot = path.join(postRoot, 'en');
const publicRoot = path.join(root, 'public');
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const siteUrl = new URL(config.url);

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (_error) {
    return false;
  }
}

function isDirectory(directory) {
  try {
    return fs.statSync(directory).isDirectory();
  } catch (_error) {
    return false;
  }
}

function readEnglishPosts() {
  return fs.readdirSync(englishRoot, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => {
      const file = path.join(englishRoot, entry.name);
      const source = fs.readFileSync(file, 'utf8')
        .replace(/^\uFEFF/u, '')
        .replace(/\r\n?/gu, '\n');
      const data = frontMatter.parse(source);
      return { file, data };
    });
}

function sourcePostCount() {
  return fs.readdirSync(postRoot, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .length;
}

function absoluteUrl(value, base = siteUrl) {
  return new URL(String(value), base).href;
}

function generatedFile(urlValue) {
  const url = new URL(urlValue, siteUrl);
  assert.equal(url.origin, siteUrl.origin, `generated route left the site: ${url.href}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  return path.join(publicRoot, ...pathname.split('/').filter(Boolean));
}

function loadPage(urlValue) {
  const file = generatedFile(urlValue);
  assert.ok(isFile(file), `missing generated page: ${file}`);
  const html = fs.readFileSync(file, 'utf8');
  return { file, html, $: cheerio.load(html), url: new URL(urlValue, siteUrl) };
}

function alternate($, language) {
  const values = $(`link[rel="alternate"][hreflang="${language}"]`)
    .map((_index, element) => $(element).attr('href'))
    .get();
  assert.equal(values.length, 1, `expected one ${language} alternate link`);
  return absoluteUrl(values[0]);
}

function assertHeaderSwitch(page, expectedTarget, expectedLanguage) {
  const switches = page.$('#language-switch > a.language-switch');
  assert.equal(switches.length, 1, `missing language switch in ${page.file}`);
  assert.equal(
    absoluteUrl(switches.attr('href'), page.url),
    absoluteUrl(expectedTarget),
    `language switch points to the wrong counterpart in ${page.file}`
  );
  assert.equal(switches.attr('hreflang'), expectedLanguage);
  assert.ok(switches.attr('aria-label'), `language switch has no accessible label in ${page.file}`);
  assert.equal(page.$('#menus').children().last().attr('id'), 'language-switch', `language switch is not the rightmost header item in ${page.file}`);
  assert.equal(switches.find('i.fa-language').length, 1, `language switch icon is missing in ${page.file}`);
  assert.equal(switches.text().trim(), '', `language switch must remain icon-only in ${page.file}`);
}

function assertLocalStaticImages(page) {
  const candidates = [];
  page.$('img[src], img[data-src], source[src], video[poster]').each((_index, element) => {
    for (const attribute of ['src', 'data-src', 'poster']) {
      const value = page.$(element).attr(attribute);
      if (value) candidates.push(value);
    }
  });
  page.$('[srcset]').each((_index, element) => {
    const value = page.$(element).attr('srcset') || '';
    for (const item of value.split(',')) {
      const target = item.trim().split(/\s+/u)[0];
      if (target) candidates.push(target);
    }
  });
  page.$('[style]').each((_index, element) => {
    const style = page.$(element).attr('style') || '';
    for (const match of style.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/giu)) {
      if (match[2]) candidates.push(match[2]);
    }
  });

  for (const candidate of candidates) {
    if (/^(?:data:|blob:)/iu.test(candidate)) continue;
    assert.doesNotMatch(
      candidate,
      /^(["']).*\1$/su,
      `Image URL contains nested quote characters after HTML/CSS minification: ${candidate} in ${page.file}`
    );
    const target = new URL(candidate, page.url);
    assert.equal(target.origin, siteUrl.origin, `English page loads an external image: ${candidate} in ${page.file}`);
    assert.ok(isFile(generatedFile(target)), `English page references a missing local image: ${candidate} in ${page.file}`);
  }
}

function paginatedFiles(baseDirectory) {
  const files = [path.join(baseDirectory, 'index.html')];
  const pages = path.join(baseDirectory, 'page');
  if (isDirectory(pages)) {
    for (const entry of fs.readdirSync(pages, { withFileTypes: true })) {
      if (entry.isDirectory()) files.push(path.join(pages, entry.name, 'index.html'));
    }
  }
  return files.filter(isFile);
}

function publicRoute(file) {
  const relative = path.relative(publicRoot, file).split(path.sep).join('/');
  return `/${relative.replace(/index\.html$/u, '')}`;
}

function assertIndexPair(chinesePath, englishPath) {
  const chinesePage = loadPage(chinesePath);
  const englishPage = loadPage(englishPath);
  const chineseUrl = absoluteUrl(chinesePath);
  const englishUrl = absoluteUrl(englishPath);

  assert.equal(chinesePage.$('html').attr('lang'), 'zh-CN', `wrong Chinese index html lang in ${chinesePage.file}`);
  assert.equal(englishPage.$('html').attr('lang'), 'en', `wrong English index html lang in ${englishPage.file}`);
  assert.equal(chinesePage.$('meta[property="og:locale"]').attr('content'), 'zh_CN', `wrong Chinese index Open Graph locale in ${chinesePage.file}`);
  assert.equal(chinesePage.$('meta[property="og:locale:alternate"]').attr('content'), 'en_US', `missing English index Open Graph alternate in ${chinesePage.file}`);
  assert.equal(englishPage.$('meta[property="og:locale"]').attr('content'), 'en_US', `wrong English index Open Graph locale in ${englishPage.file}`);
  assert.equal(englishPage.$('meta[property="og:locale:alternate"]').attr('content'), 'zh_CN', `missing Chinese index Open Graph alternate in ${englishPage.file}`);
  assert.equal(absoluteUrl(chinesePage.$('link[rel="canonical"]').attr('href')), chineseUrl, `wrong Chinese index canonical in ${chinesePage.file}`);
  assert.equal(absoluteUrl(englishPage.$('link[rel="canonical"]').attr('href')), englishUrl, `wrong English index canonical in ${englishPage.file}`);
  assert.equal(alternate(chinesePage.$, 'zh-CN'), chineseUrl, `Chinese index hreflang is not self-referential in ${chinesePage.file}`);
  assert.equal(alternate(chinesePage.$, 'en'), englishUrl, `Chinese index has the wrong English hreflang in ${chinesePage.file}`);
  assert.equal(alternate(chinesePage.$, 'x-default'), chineseUrl, `Chinese index x-default is wrong in ${chinesePage.file}`);
  assert.equal(alternate(englishPage.$, 'zh-CN'), chineseUrl, `English index has the wrong Chinese hreflang in ${englishPage.file}`);
  assert.equal(alternate(englishPage.$, 'en'), englishUrl, `English index hreflang is not self-referential in ${englishPage.file}`);
  assert.equal(alternate(englishPage.$, 'x-default'), chineseUrl, `English index x-default is wrong in ${englishPage.file}`);
  assertHeaderSwitch(chinesePage, englishUrl, 'en');
  assertHeaderSwitch(englishPage, chineseUrl, 'zh-CN');
}

function collectArticlePaths(files, selector) {
  const paths = [];
  for (const file of files) {
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    $(selector).each((_index, element) => {
      const href = $(element).attr('href');
      if (href) paths.push(new URL(href, siteUrl).pathname);
    });
  }
  return paths;
}

assert.ok(isDirectory(publicRoot), 'missing public directory; build the site first');
const englishPosts = readEnglishPosts();
const expectedPairCount = sourcePostCount();
assert.equal(englishPosts.length, expectedPairCount, `expected all ${expectedPairCount} English source posts before public verification`);
const pairedChinesePaths = new Set();

for (const post of englishPosts) {
  const permalink = String(post.data.permalink || '');
  const englishUrl = absoluteUrl(`/${permalink}`);
  const englishPage = loadPage(englishUrl);
  assert.equal(englishPage.$('html').attr('lang'), 'en', `wrong html lang in ${englishPage.file}`);
  assert.equal(absoluteUrl(englishPage.$('link[rel="canonical"]').attr('href')), englishUrl, `wrong English canonical in ${englishPage.file}`);
  assert.equal(englishPage.$('meta[property="og:locale"]').attr('content'), 'en_US', `wrong English Open Graph locale in ${englishPage.file}`);
  assert.equal(englishPage.$('meta[property="og:locale:alternate"]').attr('content'), 'zh_CN', `missing Chinese Open Graph alternate in ${englishPage.file}`);

  const englishAlternate = alternate(englishPage.$, 'en');
  const chineseAlternate = alternate(englishPage.$, 'zh-CN');
  pairedChinesePaths.add(new URL(chineseAlternate).pathname);
  const defaultAlternate = alternate(englishPage.$, 'x-default');
  assert.equal(englishAlternate, englishUrl, `English hreflang is not self-referential in ${englishPage.file}`);
  assert.equal(defaultAlternate, chineseAlternate, `x-default must point to Chinese in ${englishPage.file}`);
  assertHeaderSwitch(englishPage, chineseAlternate, 'zh-CN');
  assertLocalStaticImages(englishPage);

  const chinesePage = loadPage(chineseAlternate);
  assert.equal(chinesePage.$('html').attr('lang'), 'zh-CN', `wrong html lang in ${chinesePage.file}`);
  assert.equal(absoluteUrl(chinesePage.$('link[rel="canonical"]').attr('href')), chineseAlternate, `wrong Chinese canonical in ${chinesePage.file}`);
  assert.equal(chinesePage.$('meta[property="og:locale"]').attr('content'), 'zh_CN', `wrong Chinese Open Graph locale in ${chinesePage.file}`);
  assert.equal(chinesePage.$('meta[property="og:locale:alternate"]').attr('content'), 'en_US', `missing English Open Graph alternate in ${chinesePage.file}`);
  assert.equal(alternate(chinesePage.$, 'en'), englishUrl, `Chinese page has the wrong English hreflang in ${chinesePage.file}`);
  assert.equal(alternate(chinesePage.$, 'zh-CN'), chineseAlternate, `Chinese hreflang is not self-referential in ${chinesePage.file}`);
  assert.equal(alternate(chinesePage.$, 'x-default'), chineseAlternate, `Chinese x-default is wrong in ${chinesePage.file}`);
  assertHeaderSwitch(chinesePage, englishUrl, 'en');

  englishPage.$('nav.pagination-post a[href]').each((_index, element) => {
    const target = new URL(englishPage.$(element).attr('href'), englishPage.url);
    assert.equal(target.origin, siteUrl.origin, `English pagination left the site in ${englishPage.file}`);
    assert.ok(target.pathname.startsWith('/en/'), `English pagination crossed into Chinese in ${englishPage.file}: ${target.pathname}`);
  });
  chinesePage.$('nav.pagination-post a[href]').each((_index, element) => {
    const target = new URL(chinesePage.$(element).attr('href'), chinesePage.url);
    assert.ok(!target.pathname.startsWith('/en/'), `Chinese pagination crossed into English in ${chinesePage.file}: ${target.pathname}`);
  });
}

const englishHomePaths = collectArticlePaths(
  paginatedFiles(path.join(publicRoot, 'en')),
  '.recent-post-item a.article-title'
);
const englishHome = loadPage('/en/');

const chineseIndexRoutes = paginatedFiles(publicRoot).map(publicRoute);
const englishIndexRoutes = new Set(paginatedFiles(path.join(publicRoot, 'en')).map(publicRoute));
assert.equal(englishIndexRoutes.size, chineseIndexRoutes.length, 'Chinese and English home pagination counts differ');
for (const chinesePath of chineseIndexRoutes) {
  const englishPath = chinesePath === '/' ? '/en/' : `/en${chinesePath}`;
  assert.ok(englishIndexRoutes.has(englishPath), `missing paired English index page: ${englishPath}`);
  assertIndexPair(chinesePath, englishPath);
}

assert.ok(!/[\p{Script=Han}]/u.test(englishHome.$('meta[name="description"]').attr('content') || ''), 'English home has a Chinese meta description');
englishHome.$('.menus_items a[href]').each((_index, element) => {
  const target = new URL(englishHome.$(element).attr('href'), englishHome.url);
  assert.ok(target.pathname.startsWith('/en/'), `English navigation exposes an untranslated route: ${target.pathname}`);
});
assert.ok(englishHomePaths.every(route => route.startsWith('/en/')), 'English home contains a Chinese article route');
assert.equal(new Set(englishHomePaths).size, expectedPairCount, `English home pagination does not expose exactly ${expectedPairCount} English articles`);

const chineseHomePaths = collectArticlePaths(
  paginatedFiles(publicRoot),
  '.recent-post-item a.article-title'
);
assert.ok(chineseHomePaths.every(route => !route.startsWith('/en/')), 'Chinese home contains an English article route');
const uniqueChineseHomePaths = new Set(chineseHomePaths);
assert.equal(uniqueChineseHomePaths.size, expectedPairCount, `Chinese home pagination does not expose exactly ${expectedPairCount} paired articles`);
for (const route of pairedChinesePaths) {
  assert.ok(uniqueChineseHomePaths.has(route), `Chinese home is missing a paired article: ${route}`);
}

const englishArchivePaths = collectArticlePaths(
  paginatedFiles(path.join(publicRoot, 'en', 'archives')),
  'a.article-sort-item-title'
);
assert.ok(englishArchivePaths.every(route => route.startsWith('/en/')), 'English archive contains a Chinese article route');
assert.equal(new Set(englishArchivePaths).size, expectedPairCount, `English archive does not expose exactly ${expectedPairCount} English articles`);

const chineseArchiveFiles = paginatedFiles(path.join(publicRoot, 'archives'));
const chineseArchivePaths = collectArticlePaths(chineseArchiveFiles, 'a.article-sort-item-title');
assert.ok(chineseArchivePaths.every(route => !route.startsWith('/en/')), 'Chinese archive contains an English article route');
assert.equal(new Set(chineseArchivePaths).size, expectedPairCount, `Chinese archive does not expose exactly ${expectedPairCount} Chinese articles`);

const chineseArchiveRoutes = chineseArchiveFiles.map(publicRoute);
const englishArchiveRoutes = new Set(paginatedFiles(path.join(publicRoot, 'en', 'archives')).map(publicRoute));
assert.equal(englishArchiveRoutes.size, chineseArchiveRoutes.length, 'Chinese and English archive pagination counts differ');
for (const chinesePath of chineseArchiveRoutes) {
  const englishPath = `/en${chinesePath}`;
  assert.ok(englishArchiveRoutes.has(englishPath), `missing paired English archive page: ${englishPath}`);
  assertIndexPair(chinesePath, englishPath);
}

function searchPaths(file) {
  assert.ok(isFile(file), `missing search index: ${file}`);
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { xmlMode: true });
  return $('entry > link').map((_index, element) => $(element).attr('href')).get();
}

function searchUrls(file) {
  assert.ok(isFile(file), `missing search index: ${file}`);
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { xmlMode: true });
  return $('entry > url').map((_index, element) => $(element).text()).get();
}

const englishSearch = searchPaths(path.join(publicRoot, 'en', 'search.xml'));
assert.equal(englishSearch.length, expectedPairCount, `English search index must contain exactly ${expectedPairCount} posts`);
for (const href of englishSearch) {
  const target = new URL(href, siteUrl);
  assert.equal(target.origin, siteUrl.origin, `English search contains a protocol-relative/external route: ${href}`);
  assert.ok(target.pathname.startsWith('/en/'), `English search contains a Chinese route: ${href}`);
}

const englishSearchUrls = searchUrls(path.join(publicRoot, 'en', 'search.xml'));
assert.deepEqual(englishSearchUrls, englishSearch, 'English search link and runtime URL fields disagree');
for (const value of englishSearchUrls) {
  const target = new URL(value, siteUrl);
  assert.equal(target.origin, siteUrl.origin, `English runtime search URL left the site: ${value}`);
  assert.ok(target.pathname.startsWith('/en/'), `English runtime search URL contains a Chinese route: ${value}`);
}

const chineseSearch = searchPaths(path.join(publicRoot, 'search.xml'));
assert.equal(chineseSearch.length, expectedPairCount, `Chinese search index must contain exactly ${expectedPairCount} posts`);
assert.ok(chineseSearch.every(href => !new URL(href, siteUrl).pathname.startsWith('/en/')), 'Chinese search contains an English route');
const chineseSearchUrls = searchUrls(path.join(publicRoot, 'search.xml'));
assert.deepEqual(chineseSearchUrls, chineseSearch, 'Chinese search link and runtime URL fields disagree');
for (const value of chineseSearchUrls) {
  const target = new URL(value, siteUrl);
  assert.equal(target.origin, siteUrl.origin, `Chinese runtime search URL left the site: ${value}`);
  assert.ok(!target.pathname.startsWith('/en/'), `Chinese runtime search URL contains an English route: ${value}`);
}

console.log(`Bilingual public-site check passed: ${expectedPairCount} paired posts, isolated listings/search, mutual switches, and valid hreflang/canonical links.`);
