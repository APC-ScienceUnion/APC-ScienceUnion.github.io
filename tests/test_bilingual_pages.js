'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pagePairs = [
  ['source/about/index.md', 'source/en/about/index.md'],
  ['source/honor-hall/index.md', 'source/en/honor-hall/index.md'],
  ['source/honor-hall/data.js', 'source/en/honor-hall/data.js'],
  ['source/_data/apc_news.yml', 'source/_data/apc_news_en.yml']
];

function isFile(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

// Standalone content follows the same file-existence-only policy as posts.
function checkStandalonePages(base = root) {
  const pairs = pagePairs.filter(([chinese]) => isFile(path.join(base, chinese)));
  const missing = pairs.filter(([, english]) => !isFile(path.join(base, english)));
  if (missing.length) {
    throw new Error('Missing English counterpart file(s):\n- ' +
      missing.map(([, english]) => english).join('\n- '));
  }
  return pairs.length;
}

if (require.main === module) {
  try {
    console.log('Bilingual standalone-file existence check passed: ' + checkStandalonePages() + ' pairs.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { checkStandalonePages };
