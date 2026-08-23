'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

const root = path.resolve(__dirname, '..');
const postRoot = path.join(root, 'source', '_posts');
const englishRoot = path.join(postRoot, 'en');
const fingerprintField = 'translation_source_sha256';

function usage() {
  return [
    'Usage: node tools/translation_source_fingerprint.js [--check | --write]',
    '',
    'With no option (or with --check), verify that every English post records the',
    'SHA-256 fingerprint of its current Chinese source. Use --write to update only',
    'the fingerprint field in English front matter.'
  ].join('\n');
}

function parseMode(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(usage());
    process.exit(0);
  }
  const unknown = argv.filter(argument => argument !== '--check' && argument !== '--write');
  if (unknown.length) throw new Error(`Unknown option(s): ${unknown.join(', ')}\n\n${usage()}`);
  if (argv.includes('--check') && argv.includes('--write')) {
    throw new Error('--check and --write are mutually exclusive');
  }
  return argv.includes('--write') ? 'write' : 'check';
}

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}

function normalizeSource(raw) {
  return raw.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
}

function sourceFingerprint(raw) {
  return crypto.createHash('sha256').update(normalizeSource(raw), 'utf8').digest('hex');
}

function readPost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const data = frontMatter.parse(normalizeSource(raw));
  return {
    file,
    name: path.basename(file, '.md'),
    raw,
    data
  };
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function pairPosts() {
  const chinesePosts = fs.readdirSync(postRoot, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => readPost(path.join(postRoot, entry.name)));
  const englishPosts = markdownFiles(englishRoot).map(readPost);
  const chineseByKey = new Map();
  const englishByKey = new Map();
  const errors = [];

  for (const chinese of chinesePosts) {
    if (chineseByKey.has(chinese.name)) {
      errors.push(`${relative(chinese.file)}: duplicate Chinese source key ${chinese.name}`);
    } else {
      chineseByKey.set(chinese.name, chinese);
    }
  }

  for (const english of englishPosts) {
    const keyValue = english.data.translation_key;
    const key = typeof keyValue === 'string' ? keyValue.trim() : '';
    if (!key) {
      errors.push(`${relative(english.file)}: missing string translation_key`);
      continue;
    }
    if (englishByKey.has(key)) {
      errors.push(`${relative(english.file)}: duplicate translation_key ${key}`);
      continue;
    }
    if (!chineseByKey.has(key)) {
      errors.push(`${relative(english.file)}: translation_key does not name a current Chinese source post: ${key}`);
      continue;
    }
    englishByKey.set(key, english);
  }

  for (const key of chineseByKey.keys()) {
    if (!englishByKey.has(key)) errors.push(`Missing English post for Chinese source: ${key}`);
  }

  if (errors.length) {
    throw new Error(`Translation pairing check found ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  }

  return [...chineseByKey.entries()].map(([key, chinese]) => ({
    key,
    chinese,
    english: englishByKey.get(key),
    fingerprint: sourceFingerprint(chinese.raw)
  }));
}

function updateFingerprintFrontMatter(post, fingerprint) {
  const raw = post.raw;
  const match = raw.match(/^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---(?=\r?\n|$))/u);
  if (!match) throw new Error(`${relative(post.file)}: cannot locate YAML front matter`);

  const prefix = match[1];
  let yaml = match[2];
  const closing = match[3];
  const lineEnding = prefix.endsWith('\r\n') ? '\r\n' : '\n';
  const fingerprintLines = yaml.match(/^translation_source_sha256\s*:.*$/gmu) || [];
  if (fingerprintLines.length > 1) {
    throw new Error(`${relative(post.file)}: duplicate ${fingerprintField} fields`);
  }

  const newLine = `${fingerprintField}: "${fingerprint}"`;
  if (fingerprintLines.length === 1) {
    yaml = yaml.replace(/^translation_source_sha256\s*:.*$/mu, newLine);
  } else {
    const keyPattern = /^translation_key\s*:.*$/mu;
    if (!keyPattern.test(yaml)) {
      throw new Error(`${relative(post.file)}: cannot locate translation_key in YAML front matter`);
    }
    yaml = yaml.replace(keyPattern, line => `${line}${lineEnding}${newLine}`);
  }

  const frontMatterEnd = prefix.length + match[2].length + closing.length;
  return `${prefix}${yaml}${closing}${raw.slice(frontMatterEnd)}`;
}

function check(pairs) {
  const errors = [];
  for (const { english, fingerprint } of pairs) {
    const recorded = String(english.data[fingerprintField] || '');
    if (!/^[a-f0-9]{64}$/u.test(recorded)) {
      errors.push(`${relative(english.file)}: missing or invalid ${fingerprintField}`);
    } else if (recorded !== fingerprint) {
      errors.push(`${relative(english.file)}: Chinese source changed after the English translation was reviewed`);
    }
  }
  if (errors.length) {
    throw new Error(`Translation source fingerprint check found ${errors.length} problem(s):\n- ${errors.join('\n- ')}\nRun \`node tools/translation_source_fingerprint.js --write\` only after reviewing the translations against the current Chinese sources.`);
  }
}

function write(pairs) {
  let changed = 0;
  for (const { english, fingerprint } of pairs) {
    const updated = updateFingerprintFrontMatter(english, fingerprint);
    if (updated !== english.raw) {
      fs.writeFileSync(english.file, updated, 'utf8');
      changed += 1;
    }
  }
  return changed;
}

function main() {
  const mode = parseMode(process.argv.slice(2));
  const pairs = pairPosts();
  if (mode === 'write') {
    const changed = write(pairs);
    check(pairPosts());
    console.log(`Updated ${changed} English source fingerprint(s); verified ${pairs.length} strict translation pair(s).`);
  } else {
    check(pairs);
    console.log(`Translation source fingerprint check passed: ${pairs.length} strict translation pair(s).`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

