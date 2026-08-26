'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

const root = path.resolve(__dirname, '..');
const postRoot = path.join(root, 'source', '_posts');
const imageRoot = path.join(root, 'source', 'images');
const manifestPath = path.join(root, 'tools', 'external-images-manifest.json');
const uncategorized = '未分类';
const reservedImageDirectories = new Set(['apc-news', 'daily']);

// Three historical asset buckets intentionally differ from the Chinese post
// filename. Keep their public names stable while assigning them to the owning
// post's physical category directory.
const imageDirectoryOwners = Object.freeze({
  'artificial-intelligence-intuitive-introduction': '人工智能(AI) 通俗演义',
  '为何所有8位及以上的数都可以变为等式？': '为何所有8位及以上的数都可以变为等式？——硅基-沉默整数平衡化定理及其证明简明介绍',
  '嫦娥奔月': '嫦娥奔月，这次她要做什么？'
});

function normalizeSource(raw) {
  return raw.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
}

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function pathIdentity(file) {
  return path.resolve(file).normalize('NFC').toLocaleLowerCase('en');
}

function isEnglishData(data) {
  const language = String(data.lang || '').toLowerCase();
  return language === 'en' || language.startsWith('en-');
}

function categoryFromData(data, file) {
  const raw = data.categories;
  const values = (Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw])
    .map(value => String(value).trim())
    .filter(Boolean);
  if (values.length > 1) {
    throw new Error(`${relative(file)}: expected at most one article category, found ${values.join(', ')}`);
  }
  return values[0] || uncategorized;
}

function readPost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const data = frontMatter.parse(normalizeSource(raw));
  return {
    file,
    raw,
    data,
    name: path.basename(file, '.md'),
    english: isEnglishData(data)
  };
}

function buildCatalog() {
  const posts = markdownFiles(postRoot).map(readPost);
  const chinese = posts.filter(post => !post.english);
  const english = posts.filter(post => post.english);
  const chineseByKey = new Map();
  const englishByKey = new Map();

  for (const post of chinese) {
    if (chineseByKey.has(post.name)) {
      throw new Error(`duplicate Chinese post basename: ${post.name}`);
    }
    post.key = post.name;
    post.category = categoryFromData(post.data, post.file);
    chineseByKey.set(post.key, post);
  }

  for (const post of english) {
    const key = String(post.data.translation_key || '').trim();
    if (!key) throw new Error(`${relative(post.file)}: English post has no translation_key`);
    if (englishByKey.has(key)) throw new Error(`duplicate English translation_key: ${key}`);
    const source = chineseByKey.get(key);
    if (!source) throw new Error(`${relative(post.file)}: no Chinese source named ${key}`);
    post.key = key;
    post.category = source.category;
    englishByKey.set(key, post);
  }

  for (const key of chineseByKey.keys()) {
    if (!englishByKey.has(key)) throw new Error(`missing English post for ${key}`);
  }

  const destinations = new Map();
  for (const post of posts) {
    post.destination = path.join(postRoot, post.category, path.basename(post.file));
    const identity = pathIdentity(post.destination);
    const previous = destinations.get(identity);
    if (previous && path.resolve(previous.file) !== path.resolve(post.file)) {
      throw new Error(`post destination collision: ${relative(previous.file)} and ${relative(post.file)}`);
    }
    destinations.set(identity, post);
  }

  return {
    posts,
    chinese,
    english,
    chineseByKey,
    englishByKey,
    categories: new Set(chinese.map(post => post.category))
  };
}

function ownerForImageDirectory(directoryName, catalog) {
  const key = imageDirectoryOwners[directoryName] || directoryName;
  const owner = catalog.chineseByKey.get(key);
  if (!owner) throw new Error(`cannot assign image directory to a post: ${directoryName}`);
  return owner;
}

function imageDirectoryRecords(catalog) {
  const records = [];
  const topEntries = fs.readdirSync(imageRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const entry of topEntries) {
    if (reservedImageDirectories.has(entry.name)) continue;
    const top = path.join(imageRoot, entry.name);
    if (catalog.categories.has(entry.name)) {
      const children = fs.readdirSync(top, { withFileTypes: true });
      const looseFiles = children.filter(child => child.isFile());
      if (looseFiles.length) {
        throw new Error(`${relative(top)}: category image directory contains loose files`);
      }
      for (const child of children.filter(child => child.isDirectory())) {
        const owner = ownerForImageDirectory(child.name, catalog);
        if (owner.category !== entry.name) {
          throw new Error(`${relative(path.join(top, child.name))}: belongs to ${owner.category}`);
        }
        records.push({
          name: child.name,
          owner,
          current: path.join(top, child.name),
          destination: path.join(imageRoot, owner.category, child.name)
        });
      }
      continue;
    }

    const owner = ownerForImageDirectory(entry.name, catalog);
    records.push({
      name: entry.name,
      owner,
      current: top,
      destination: path.join(imageRoot, owner.category, entry.name)
    });
  }

  const publicNames = new Map();
  const ownersWithImages = new Set();
  for (const record of records) {
    const identity = record.name.normalize('NFC').toLocaleLowerCase('en');
    if (publicNames.has(identity)) {
      throw new Error(`duplicate flattened public image directory: ${record.name}`);
    }
    publicNames.set(identity, record);
    ownersWithImages.add(record.owner.key);
  }
  for (const owner of catalog.chinese) {
    if (!ownersWithImages.has(owner.key)) {
      throw new Error(`article has no image directory: ${owner.key}`);
    }
  }
  return records;
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(full) : entry.isFile() ? [full] : [];
  });
}

function articleImageInventory(records) {
  const items = records.flatMap(record => walkFiles(record.current).map(file => {
    const rest = path.relative(record.current, file).split(path.sep).join('/');
    const bytes = fs.readFileSync(file);
    return {
      key: `${record.name}/${rest}`,
      bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex')
    };
  })).sort((left, right) => left.key.localeCompare(right.key, 'en'));
  const digest = crypto.createHash('sha256')
    .update(items.map(item => `${item.key}\0${item.sha256}`).join('\n'))
    .digest('hex');
  return {
    files: items.length,
    bytes: items.reduce((total, item) => total + item.bytes, 0),
    digest
  };
}

function assertLayout(catalog, records) {
  const errors = [];
  for (const post of catalog.posts) {
    if (path.resolve(post.file) !== path.resolve(post.destination)) {
      errors.push(`${relative(post.file)} should be ${relative(post.destination)}`);
    }
  }
  for (const record of records) {
    if (path.resolve(record.current) !== path.resolve(record.destination)) {
      errors.push(`${relative(record.current)} should be ${relative(record.destination)}`);
    }
  }
  const legacyEnglish = path.join(postRoot, 'en');
  if (fs.existsSync(legacyEnglish)) errors.push('source/_posts/en must not remain as a top-level language bucket');
  if (errors.length) {
    throw new Error(`content category layout check found ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  }
}

function updateManifest(postMoves, imageMoves) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const payload = JSON.parse(raw);
  const postMap = new Map(postMoves.map(move => [relative(move.from), relative(move.to)]));
  const imagePrefixes = imageMoves.map(move => ({
    oldPrefix: `${relative(move.from)}/`,
    newPrefix: `${relative(move.to)}/`
  }));

  for (const entry of payload.images || []) {
    if (typeof entry.local_path === 'string') {
      for (const mapping of imagePrefixes) {
        if (entry.local_path.startsWith(mapping.oldPrefix)) {
          entry.local_path = mapping.newPrefix + entry.local_path.slice(mapping.oldPrefix.length);
          break;
        }
      }
    }
    for (const reference of entry.references || []) {
      if (postMap.has(reference.file)) reference.file = postMap.get(reference.file);
    }
  }

  payload.managed_directories = (payload.managed_directories || []).map(directory => {
    for (const mapping of imagePrefixes) {
      const oldDirectory = mapping.oldPrefix.slice(0, -1);
      if (directory === oldDirectory) return mapping.newPrefix.slice(0, -1);
    }
    return directory;
  });
  payload.managed_directories.sort((left, right) => left.localeCompare(right, 'en'));
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function atomicWrite(file, contents) {
  const temporary = `${file}.content-layout-${process.pid}.tmp`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, file);
}

function migrate() {
  const catalog = buildCatalog();
  const records = imageDirectoryRecords(catalog);
  const postMoves = catalog.posts
    .filter(post => path.resolve(post.file) !== path.resolve(post.destination))
    .map(post => ({ from: post.file, to: post.destination }));
  const imageMoves = records
    .filter(record => path.resolve(record.current) !== path.resolve(record.destination))
    .map(record => ({ from: record.current, to: record.destination }));

  for (const move of [...postMoves, ...imageMoves]) {
    if (fs.existsSync(move.to)) throw new Error(`migration destination already exists: ${relative(move.to)}`);
  }
  const updatedManifest = updateManifest(postMoves, imageMoves);
  const applied = [];
  try {
    for (const move of [...postMoves, ...imageMoves]) {
      fs.mkdirSync(path.dirname(move.to), { recursive: true });
      fs.renameSync(move.from, move.to);
      applied.push(move);
    }
    atomicWrite(manifestPath, updatedManifest);
  } catch (error) {
    for (const move of applied.reverse()) {
      try {
        fs.mkdirSync(path.dirname(move.from), { recursive: true });
        fs.renameSync(move.to, move.from);
      } catch (rollbackError) {
        console.error(`rollback failed for ${relative(move.to)}: ${rollbackError.message}`);
      }
    }
    throw error;
  }

  const legacyEnglish = path.join(postRoot, 'en');
  if (fs.existsSync(legacyEnglish) && fs.readdirSync(legacyEnglish).length === 0) fs.rmdirSync(legacyEnglish);
  const migratedCatalog = buildCatalog();
  const migratedRecords = imageDirectoryRecords(migratedCatalog);
  assertLayout(migratedCatalog, migratedRecords);
  const inventory = articleImageInventory(migratedRecords);
  console.log(`Migrated ${postMoves.length} post file(s) and ${imageMoves.length} article image director${imageMoves.length === 1 ? 'y' : 'ies'}.`);
  console.log(`Verified ${migratedCatalog.chinese.length} Chinese + ${migratedCatalog.english.length} English posts in ${migratedCatalog.categories.size} physical categories.`);
  console.log(`Article images: ${inventory.files} files, ${inventory.bytes} bytes, digest ${inventory.digest}.`);
}

function check() {
  const catalog = buildCatalog();
  const records = imageDirectoryRecords(catalog);
  assertLayout(catalog, records);
  const inventory = articleImageInventory(records);
  console.log(`Content category layout check passed: ${catalog.chinese.length} Chinese + ${catalog.english.length} English posts; ${catalog.categories.size} directories.`);
  console.log(`Article images: ${inventory.files} files, ${inventory.bytes} bytes, digest ${inventory.digest}.`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0] && !['--check', '--migrate'].includes(args[0]))) {
    throw new Error('Usage: node tools/content_category_layout.js [--check | --migrate]');
  }
  if (args[0] === '--migrate') migrate();
  else check();
}

module.exports = {
  articleImageInventory,
  buildCatalog,
  imageDirectoryRecords,
  imageRoot,
  reservedImageDirectories,
  root,
  uncategorized,
  walkFiles
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
