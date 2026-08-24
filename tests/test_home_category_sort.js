'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const root = path.resolve(__dirname, '..');
const targets = [
  { label: 'Chinese sidebar', file: path.join(root, 'public', 'index.html'), selector: '#aside-cat-list > .card-category-list-item' },
  { label: 'Chinese home navigation', file: path.join(root, 'public', 'index.html'), selector: '#home-category-bar .home-category-bar-item' },
  { label: 'English sidebar', file: path.join(root, 'public', 'en', 'index.html'), selector: '#aside-cat-list > .card-category-list-item' },
  { label: 'English home navigation', file: path.join(root, 'public', 'en', 'index.html'), selector: '#home-category-bar .home-category-bar-item' }
];

const summaries = [];
for (const target of targets) {
  assert.ok(fs.existsSync(target.file), `missing ${target.file}; build the site first`);
  const $ = cheerio.load(fs.readFileSync(target.file, 'utf8'));
  const categoryItems = $(target.selector);
  assert.ok(categoryItems.length > 1, `${target.label} should contain at least two categories`);

  const categories = categoryItems.map((_, element) => {
    const item = $(element);
    const name = item.find('.card-category-list-name, .home-category-bar-item-name').first().text().trim();
    const countText = item.find('.card-category-list-count, .home-category-bar-item-count').first().text().trim();
    const count = Number.parseInt((countText.match(/\d+/u) || [''])[0], 10);
    assert.ok(name, `${target.label} contains an item without a name`);
    assert.ok(Number.isInteger(count), `${target.label} / ${name}: category count is not an integer`);
    return { name, count };
  }).get();

  for (let index = 1; index < categories.length; index += 1) {
    const previous = categories[index - 1];
    const current = categories[index];
    assert.ok(
      previous.count >= current.count,
      `${target.label} is not sorted descending: ${previous.name} (${previous.count}) appears before ${current.name} (${current.count})`
    );
  }
  summaries.push(`${target.label}: ${categories.map(({ count }) => count).join(' > ')}`);
}

console.log(`Homepage category sorting check passed. ${summaries.join('; ')}.`);
