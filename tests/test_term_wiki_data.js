'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')

function loadWiki (relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8')
  const sandbox = { window: {} }
  vm.runInNewContext(source, sandbox, { filename: relativePath })
  return { wiki: sandbox.window.TERM_WIKI, source }
}

function validateWiki (relativePath, expected) {
  const { wiki, source } = loadWiki(relativePath)
  assert.ok(wiki && typeof wiki === 'object')
  assert.equal(wiki.subject, expected.subject)
  assert.equal(wiki.items.length, expected.items)
  assert.equal(wiki.categories.length, expected.categories)
  assert.ok(wiki.title)
  assert.ok(wiki.subtitle)

  const categoryIds = new Set(wiki.categories.map(category => category.id))
  assert.equal(categoryIds.size, wiki.categories.length)
  const itemIds = new Set()

  for (const item of wiki.items) {
    assert.match(item.id, /^[a-z0-9][a-z0-9-]*$/)
    assert.equal(itemIds.has(item.id), false, `duplicate item id: ${item.id}`)
    itemIds.add(item.id)
    assert.ok(categoryIds.has(item.category), `unknown category: ${item.category}`)
    assert.ok(item.name)
    assert.ok(item.en)
    assert.ok(item.summary.length >= 16)
    assert.ok(Array.isArray(item.sections) && item.sections.length >= 2)
    assert.ok(item.sections.every(section => section.title && section.text.length >= 16))
  }

  assert.doesNotMatch(source, /canva\.com\/design\//i)
  return wiki
}

const geography = validateWiki('source/gallery/GeographyCard/data.js', {
  subject: 'geography', items: 25, categories: 4
})
const chemistry = validateWiki('source/gallery/ChemistryCard/data.js', {
  subject: 'chemistry', items: 8, categories: 3
})

assert.equal(geography.items.filter(item => item.category === 'atmosphere').length, 7)
assert.equal(geography.items.filter(item => item.category === 'hydrology').length, 7)
assert.equal(geography.items.filter(item => item.category === 'geology').length, 9)
assert.equal(geography.items.filter(item => item.category === 'earth-space').length, 2)
assert.deepEqual(Array.from(chemistry.items, item => item.name), [
  '氢', '质子酸碱', '氢键', '碱金属', '锂', '钠', '钾', '铷、铯、钫'
])

for (const folder of ['GeographyCard', 'ChemistryCard']) {
  const html = fs.readFileSync(path.join(root, 'source', 'gallery', folder, 'index.html'), 'utf8')
  assert.match(html, /data-term-wiki-root/)
  assert.match(html, /data\.js/)
  assert.match(html, /\/gallery\/term-wiki\/app\.js/)
  assert.doesNotMatch(html, /canva\.com\/design\//i)
}

const plantIndex = fs.readFileSync(path.join(root, 'source/gallery/PlantCard/index.md'), 'utf8')
const plantRefs = [...plantIndex.matchAll(/!\[\]\((\/gallery\/PlantCard\/assets\/2019\/[^)]+)\)/g)]
assert.equal(plantRefs.length, 48)
assert.equal(new Set(plantRefs.map(match => match[1])).size, 48)
for (const [, ref] of plantRefs) {
  assert.ok(fs.existsSync(path.join(root, 'source', ref.replace(/^\//, ''))), `missing plant asset: ${ref}`)
}
assert.doesNotMatch(plantIndex, /https?:\/\//i)

console.log('term wiki data and local gallery assets: ok')
