'use strict';

const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

const root = path.resolve(__dirname, '..');

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(file);
    return entry.isFile() && entry.name.endsWith('.md') ? [file] : [];
  });
}

function readPost(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
  const data = frontMatter.parse(raw);
  return { file, name: path.basename(file, '.md'), data };
}

function isEnglish(post) {
  return /^en(?:-|$)/iu.test(String(post.data.lang || ''));
}

// Existence only: translation_key identifies the Chinese source filename.
// Content, metadata, formatting, and historical fingerprints are not compared.
function checkPostPairs(postRoot = path.join(root, 'source', '_posts'), options = {}) {
  const posts = markdownFiles(postRoot).map(readPost);
  const chinese = posts.filter(post => !isEnglish(post));
  const english = posts.filter(isEnglish);
  const translatedKeys = new Set(english.map(post => post.data.translation_key));
  const missing = chinese.filter(post => !translatedKeys.has(post.name));
  if (missing.length && !options.allowIncomplete) {
    throw new Error('Missing English version for ' + missing.length + ' Chinese post(s):\n- ' +
      missing.map(post => path.relative(postRoot, post.file).split(path.sep).join('/')).join('\n- '));
  }
  return { chinese: chinese.length, english: english.length, missing };
}

if (require.main === module) {
  try {
    const result = checkPostPairs(undefined, { allowIncomplete: process.argv.includes('--allow-incomplete') });
    console.log('Bilingual file-existence check passed: ' + result.chinese + ' Chinese posts, ' +
      (result.chinese - result.missing.length) + ' with English versions' +
      (result.missing.length ? ', ' + result.missing.length + ' missing (in-progress mode)' : '') + '.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { checkPostPairs };
