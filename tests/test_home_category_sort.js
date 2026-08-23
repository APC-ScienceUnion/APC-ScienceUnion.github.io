'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const root = path.resolve(__dirname, '..');
const homeFile = path.join(root, 'public', 'index.html');

assert.ok(fs.existsSync(homeFile), 'missing public/index.html; build the site first');

const $ = cheerio.load(fs.readFileSync(homeFile, 'utf8'));
const categoryItems = $('#aside-cat-list > .card-category-list-item');

assert.ok(categoryItems.length > 1, 'homepage category card should contain at least two categories');

const categories = categoryItems.map((_, element) => {
  const item = $(element);
  const name = item.children('.card-category-list-link')
    .find('.card-category-list-name')
    .first()
    .text()
    .trim();
  const countText = item.children('.card-category-list-link')
    .find('.card-category-list-count')
    .first()
    .text()
    .trim();
  const count = Number.parseInt(countText, 10);

  assert.ok(name, 'category card contains an item without a name');
  assert.ok(Number.isInteger(count), `${name}: category count is not an integer`);

  return { name, count };
}).get();

for (let index = 1; index < categories.length; index += 1) {
  const previous = categories[index - 1];
  const current = categories[index];
  assert.ok(
    previous.count >= current.count,
    `category card is not sorted descending: ${previous.name} (${previous.count}) appears before ${current.name} (${current.count})`
  );
}

console.log(`Homepage category card check passed: ${categories.map(({ name, count }) => `${name} (${count})`).join(' > ')}.`);
