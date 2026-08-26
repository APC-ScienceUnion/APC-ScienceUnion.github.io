'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const defaultSourceRoot = path.join(repositoryRoot, 'source', 'images');
const reservedRoots = new Set(['apc-news', 'daily']);
const hashConcurrency = 6;

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function portableKey(value) {
  return toPosix(value).normalize('NFC').toLowerCase();
}

function assertOrdinaryDirectory(directory, label) {
  let stats;
  try {
    stats = fs.lstatSync(directory);
  } catch (error) {
    if (error && error.code === 'ENOENT') throw new Error(`missing ${label}: ${directory}`);
    throw error;
  }
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(`${label} must be an ordinary directory: ${directory}`);
  }
}

function sortedEntries(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

function walkOrdinaryFiles(directory, relativePrefix = '') {
  const files = [];
  for (const entry of sortedEntries(directory)) {
    const absolute = path.join(directory, entry.name);
    const relative = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`symbolic links are not allowed in static images: ${absolute}`);
    if (entry.isDirectory()) {
      files.push(...walkOrdinaryFiles(absolute, relative));
    } else if (entry.isFile()) {
      files.push({ absolute, relative });
    } else {
      throw new Error(`unsupported filesystem entry in static images: ${absolute}`);
    }
  }
  return files;
}

function assertNoPortableCollision(records, field, description) {
  const seen = new Map();
  for (const record of records) {
    const value = record[field];
    const key = portableKey(value);
    const previous = seen.get(key);
    if (previous) {
      throw new Error(`${description} collision: ${previous[field]} and ${value}`);
    }
    seen.set(key, record);
  }

  const fileKeys = new Set(seen.keys());
  for (const record of records) {
    const segments = toPosix(record[field]).split('/');
    for (let index = 1; index < segments.length; index += 1) {
      const ancestor = portableKey(segments.slice(0, index).join('/'));
      if (fileKeys.has(ancestor)) {
        throw new Error(`${description} file/directory collision at ${segments.slice(0, index).join('/')}`);
      }
    }
  }
}

function buildImagePlan(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || defaultSourceRoot);
  assertOrdinaryDirectory(sourceRoot, 'source image root');

  const records = [];
  const categories = new Set();
  const bucketNames = new Set();

  for (const topEntry of sortedEntries(sourceRoot)) {
    const topPath = path.join(sourceRoot, topEntry.name);
    if (topEntry.isSymbolicLink()) throw new Error(`symbolic links are not allowed in source/images: ${topPath}`);
    if (!topEntry.isDirectory()) {
      throw new Error(`source/images may contain only category or reserved directories: ${topPath}`);
    }

    if (reservedRoots.has(topEntry.name)) {
      for (const file of walkOrdinaryFiles(topPath)) {
        const sourceRelative = `${topEntry.name}/${file.relative}`;
        records.push({
          sourceFile: file.absolute,
          sourceRelative,
          publicRelative: sourceRelative,
          sourceRoute: `images/${sourceRelative}`,
          publicRoute: `images/${sourceRelative}`,
          categorized: false,
          category: null,
          bucket: topEntry.name
        });
      }
      continue;
    }

    categories.add(topEntry.name);
    const bucketEntries = sortedEntries(topPath);
    if (!bucketEntries.length) throw new Error(`empty image category directory: ${topPath}`);

    for (const bucketEntry of bucketEntries) {
      const bucketPath = path.join(topPath, bucketEntry.name);
      if (bucketEntry.isSymbolicLink()) throw new Error(`symbolic links are not allowed in image categories: ${bucketPath}`);
      if (!bucketEntry.isDirectory()) {
        throw new Error(`image category contains a loose file; expected <category>/<asset bucket>/: ${bucketPath}`);
      }
      if (reservedRoots.has(bucketEntry.name)) {
        throw new Error(`article asset bucket uses reserved public name ${bucketEntry.name}: ${bucketPath}`);
      }

      bucketNames.add(bucketEntry.name);
      const bucketFiles = walkOrdinaryFiles(bucketPath);
      if (!bucketFiles.length) throw new Error(`empty article asset bucket: ${bucketPath}`);
      for (const file of bucketFiles) {
        const sourceRelative = `${topEntry.name}/${bucketEntry.name}/${file.relative}`;
        const publicRelative = `${bucketEntry.name}/${file.relative}`;
        records.push({
          sourceFile: file.absolute,
          sourceRelative,
          publicRelative,
          sourceRoute: `images/${sourceRelative}`,
          publicRoute: `images/${publicRelative}`,
          categorized: true,
          category: topEntry.name,
          bucket: bucketEntry.name
        });
      }
    }
  }

  if (!records.length) throw new Error(`no static files found below ${sourceRoot}`);
  const categoryKeys = new Set([...categories].map(portableKey));
  for (const bucket of bucketNames) {
    if (categoryKeys.has(portableKey(bucket))) {
      throw new Error(`asset bucket ${bucket} conflicts with the public category-copy guard`);
    }
  }
  assertNoPortableCollision(records, 'sourceRelative', 'source image path');
  assertNoPortableCollision(records, 'publicRelative', 'flattened public image path');

  return {
    sourceRoot,
    records,
    categories: [...categories].sort((left, right) => left.localeCompare(right, 'zh-CN'))
  };
}

async function mapLimit(values, limit, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      await worker(values[index], index);
    }
  });
  await Promise.all(runners);
}

async function fileDigest(file) {
  const before = await fs.promises.lstat(file);
  if (before.isSymbolicLink() || !before.isFile()) throw new Error(`expected an ordinary file: ${file}`);
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(file);
  for await (const chunk of stream) hash.update(chunk);
  const after = await fs.promises.lstat(file);
  if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) {
    throw new Error(`file changed while it was being verified: ${file}`);
  }
  return { bytes: after.size, sha256: hash.digest('hex') };
}

function outputImagesRoot(outputRoot, sourceRoot = defaultSourceRoot) {
  const resolvedOutput = path.resolve(outputRoot);
  const resolvedImages = path.join(resolvedOutput, 'images');
  const resolvedSource = path.resolve(sourceRoot);
  const relation = path.relative(resolvedSource, resolvedImages);
  const outputContainsSource = path.relative(resolvedImages, resolvedSource);
  const overlapsSource = (
    relation === '' || (!relation.startsWith('..') && !path.isAbsolute(relation)) ||
    outputContainsSource === '' || (!outputContainsSource.startsWith('..') && !path.isAbsolute(outputContainsSource))
  );
  if (overlapsSource) throw new Error(`refusing to publish over or around source images: ${resolvedImages}`);
  if (resolvedOutput === path.parse(resolvedOutput).root) {
    throw new Error(`refusing to use a filesystem root as the publish directory: ${resolvedOutput}`);
  }
  return { outputRoot: resolvedOutput, imagesRoot: resolvedImages };
}

function inventoryFiles(directory) {
  assertOrdinaryDirectory(directory, 'published image root');
  return walkOrdinaryFiles(directory);
}

async function verifyImageTree(plan, imagesRoot) {
  const errors = [];
  let publishedFiles;
  try {
    publishedFiles = inventoryFiles(imagesRoot);
  } catch (error) {
    throw new Error(`categorized image publication check failed:\n- ${error.message}`);
  }

  for (const category of plan.categories) {
    const forbidden = path.join(imagesRoot, category);
    if (fs.existsSync(forbidden)) errors.push(`nested category copy must not be published: images/${category}`);
  }

  const expected = new Map(plan.records.map(record => [portableKey(record.publicRelative), record]));
  const actual = new Map();
  for (const file of publishedFiles) {
    const key = portableKey(file.relative);
    const previous = actual.get(key);
    if (previous) {
      errors.push(`portable public path collision: ${previous.relative} and ${file.relative}`);
      continue;
    }
    actual.set(key, file);
    const record = expected.get(key);
    if (!record) errors.push(`unexpected published file: images/${file.relative}`);
    else if (file.relative !== record.publicRelative) {
      errors.push(`published path changed case or normalization: images/${file.relative} (expected images/${record.publicRelative})`);
    }
  }
  for (const record of plan.records) {
    if (!actual.has(portableKey(record.publicRelative))) {
      errors.push(`missing published file: images/${record.publicRelative}`);
    }
  }
  if (errors.length) {
    throw new Error(`categorized image publication check failed (${errors.length} problem(s)):\n- ${errors.slice(0, 40).join('\n- ')}${errors.length > 40 ? `\n- ... and ${errors.length - 40} more` : ''}`);
  }

  const digestErrors = [];
  let totalBytes = 0;
  await mapLimit(plan.records, hashConcurrency, async record => {
    try {
      const destination = path.join(imagesRoot, ...record.publicRelative.split('/'));
      const [source, published] = await Promise.all([
        fileDigest(record.sourceFile),
        fileDigest(destination)
      ]);
      if (source.bytes !== published.bytes) {
        throw new Error(`size mismatch (${source.bytes} source, ${published.bytes} published)`);
      }
      if (source.sha256 !== published.sha256) throw new Error('SHA-256 mismatch');
      totalBytes += source.bytes;
    } catch (error) {
      digestErrors.push(`images/${record.publicRelative}: ${error.message}`);
    }
  });
  if (digestErrors.length) {
    throw new Error(`categorized image byte check failed (${digestErrors.length} problem(s)):\n- ${digestErrors.slice(0, 40).join('\n- ')}${digestErrors.length > 40 ? `\n- ... and ${digestErrors.length - 40} more` : ''}`);
  }
  return { files: plan.records.length, bytes: totalBytes };
}

async function publishImages(outputRoot, options = {}) {
  const plan = buildImagePlan(options);
  const output = outputImagesRoot(outputRoot, plan.sourceRoot);
  await fs.promises.mkdir(output.outputRoot, { recursive: true });

  const nonce = `${process.pid}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const stage = path.join(output.outputRoot, `.categorized-images-stage-${nonce}`);
  const backup = path.join(output.outputRoot, `.categorized-images-backup-${nonce}`);
  await fs.promises.mkdir(stage);

  try {
    await mapLimit(plan.records, hashConcurrency, async record => {
      const destination = path.join(stage, ...record.publicRelative.split('/'));
      await fs.promises.mkdir(path.dirname(destination), { recursive: true });
      await fs.promises.copyFile(record.sourceFile, destination, fs.constants.COPYFILE_EXCL);
    });
    await verifyImageTree(plan, stage);

    let previousMoved = false;
    try {
      if (fs.existsSync(output.imagesRoot)) {
        const existing = fs.lstatSync(output.imagesRoot);
        if (existing.isSymbolicLink() || !existing.isDirectory()) {
          throw new Error(`published images target is not an ordinary directory: ${output.imagesRoot}`);
        }
        await fs.promises.rename(output.imagesRoot, backup);
        previousMoved = true;
      }
      await fs.promises.rename(stage, output.imagesRoot);
    } catch (error) {
      if (previousMoved && !fs.existsSync(output.imagesRoot) && fs.existsSync(backup)) {
        await fs.promises.rename(backup, output.imagesRoot);
      }
      throw error;
    }
    if (fs.existsSync(backup)) {
      await fs.promises.rm(backup, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  } finally {
    if (fs.existsSync(stage)) {
      await fs.promises.rm(stage, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  }

  const result = await verifyImageTree(plan, output.imagesRoot);
  return { ...result, output: output.imagesRoot };
}

async function checkImages(outputRoot, options = {}) {
  const plan = buildImagePlan(options);
  const output = outputImagesRoot(outputRoot, plan.sourceRoot);
  const result = await verifyImageTree(plan, output.imagesRoot);
  return { ...result, output: output.imagesRoot };
}

function usage() {
  return 'Usage: node tools/publish_categorized_images.js (--publish | --check) <public-directory>';
}

async function main() {
  const [mode, output, ...rest] = process.argv.slice(2);
  if (rest.length || !['--publish', '--check'].includes(mode) || !output) throw new Error(usage());
  const result = mode === '--publish' ? await publishImages(output) : await checkImages(output);
  const action = mode === '--publish' ? 'published and verified' : 'verified';
  console.log(`Categorized static images ${action}: ${result.files} files, ${result.bytes} bytes; public URLs remain flat below ${result.output}.`);
}

module.exports = {
  buildImagePlan,
  checkImages,
  defaultSourceRoot,
  publishImages,
  reservedRoots,
  verifyImageTree
};

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
