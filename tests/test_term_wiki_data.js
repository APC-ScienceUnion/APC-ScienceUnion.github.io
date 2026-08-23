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
  assert.equal(Object.hasOwn(wiki, 'subtitle'), false)
  assert.equal(Object.hasOwn(wiki, 'description'), false)
  assert.equal(wiki.cardAssetBase, `/gallery/${expected.folder}/assets/cards`)
  assert.equal(Object.hasOwn(wiki, 'eyebrow'), false)

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

  const imageRefs = []
  for (const item of wiki.items) {
    for (const page of [1, 2]) {
      const ref = `${wiki.cardAssetBase}/${item.id}-${String(page).padStart(2, '0')}.png`
      const assetPath = path.join(root, 'source', ref.replace(/^\//, ''))
      assert.ok(fs.existsSync(assetPath), `missing term card asset: ${ref}`)
      const bytes = fs.readFileSync(assetPath)
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `invalid PNG signature: ${ref}`)
      assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR', `missing PNG IHDR: ${ref}`)
      assert.equal(bytes.readUInt32BE(16), 1587, `unexpected original width: ${ref}`)
      assert.equal(bytes.readUInt32BE(20), 2245, `unexpected original height: ${ref}`)
      const chunkTypes = []
      for (let offset = 8; offset + 12 <= bytes.length;) {
        const chunkLength = bytes.readUInt32BE(offset)
        const chunkType = bytes.subarray(offset + 4, offset + 8).toString('ascii')
        chunkTypes.push(chunkType)
        offset += 12 + chunkLength
        if (chunkType === 'IEND') break
      }
      assert.ok(chunkTypes.includes('pHYs'), `missing original PNG density metadata: ${ref}`)
      assert.ok(chunkTypes.includes('iTXt'), `missing original PNG text metadata: ${ref}`)
      assert.ok(chunkTypes.includes('eXIf'), `missing original PNG EXIF metadata: ${ref}`)
      assert.ok(bytes.length >= 50 * 1024, `term card asset unexpectedly small: ${ref}`)
      imageRefs.push(ref)
    }
  }
  assert.equal(imageRefs.length, expected.items * 2)
  assert.equal(new Set(imageRefs).size, imageRefs.length)
  const cardDirectory = path.join(root, 'source/gallery', expected.folder, 'assets/cards')
  assert.equal(fs.readdirSync(cardDirectory).some(name => name.endsWith('.webp')), false,
    `legacy WebP assets remain in ${expected.folder}`)
  return wiki
}

const geography = validateWiki('source/gallery/GeographyCard/data.js', {
  subject: 'geography', folder: 'GeographyCard', items: 25, categories: 4
})
const chemistry = validateWiki('source/gallery/ChemistryCard/data.js', {
  subject: 'chemistry', folder: 'ChemistryCard', items: 8, categories: 3
})

assert.equal(geography.items.filter(item => item.category === 'atmosphere').length, 7)
assert.equal(geography.items.filter(item => item.category === 'hydrology').length, 7)
assert.equal(geography.items.filter(item => item.category === 'geology').length, 9)
assert.equal(geography.items.filter(item => item.category === 'earth-space').length, 2)
assert.deepEqual(Array.from(chemistry.items, item => item.name), [
  '氢', '质子酸碱', '氢键', '碱金属', '锂', '钠', '钾', '铷、铯、钫'
])

for (const [folder, subject] of [['GeographyCard', 'geography'], ['ChemistryCard', 'chemistry']]) {
  const page = fs.readFileSync(path.join(root, 'source', 'gallery', folder, 'index.md'), 'utf8')
  assert.match(page, /layout: term-wiki/)
  assert.match(page, /type: term-wiki/)
  assert.match(page, /top_img: false/)
  assert.match(page, new RegExp(`term_wiki_subject: ${subject}`))
  assert.match(page, new RegExp(`term_wiki_data: \/gallery\/${folder}\/data\\.js`))
  assert.doesNotMatch(page, /description:|term_wiki_credit:/)
  assert.doesNotMatch(page, /<header|<footer|wiki-sitebar|wiki-footer/i)
  assert.doesNotMatch(page, /canva\.com\/design\//i)
}

const sharedApp = fs.readFileSync(path.join(root, 'source/gallery/term-wiki/app.js'), 'utf8')
const sharedStyles = fs.readFileSync(path.join(root, 'source/gallery/term-wiki/styles.css'), 'utf8')
const wikiLayout = fs.readFileSync(path.join(root, 'themes/butterfly/layout/term-wiki.pug'), 'utf8')
assert.doesNotMatch(sharedApp, /term-wiki__eyebrow|term-wiki__ambient|DISCIPLINE ATLAS|<kbd/)
assert.doesNotMatch(sharedApp, /config\.subtitle|查看词卡原图 →/)
assert.match(sharedApp, /term-wiki__modal/)
assert.match(sharedApp, /term-wiki__card-image/)
assert.match(sharedApp, /term-wiki__card-thumbnail/)
assert.match(sharedApp, /term-wiki__card-arrow', '→'/)
assert.match(sharedApp, /previous-card-page/)
assert.match(sharedApp, /next-card-page/)
assert.match(sharedApp, /toggle-image-zoom/)
assert.match(sharedApp, /--tw-zoom-width/)
assert.match(sharedApp, /fittedRect\.width \* 2/)
assert.match(sharedApp, /pageShell\.inert = true/)
assert.match(sharedApp, /focusModalAfterOpen/)
assert.match(sharedApp, /查看文字版内容/)
assert.match(sharedApp, /\.png`/)
assert.doesNotMatch(sharedApp, /\.webp/)
assert.doesNotMatch(sharedApp, /term-wiki__drawer/)
assert.doesNotMatch(sharedStyles, /wiki-sitebar|wiki-footer|radial-gradient|backdrop-filter|text-bg-hover/)
assert.match(sharedStyles, /\.term-wiki__modal/)
assert.match(sharedStyles, /\.term-wiki__viewer/)
assert.match(sharedStyles, /\.term-wiki__card-image/)
assert.match(sharedStyles, /\.term-wiki__image-frame\.is-zoomed/)
assert.match(sharedStyles, /justify-content:\s*flex-start/)
assert.match(sharedStyles, /width:\s*var\(--tw-zoom-width\)/)
assert.match(sharedStyles, /html\.term-wiki-document\[data-theme='dark'\]/)
assert.match(sharedStyles, /html\.term-wiki-document\[data-theme='auto'\]/)
assert.match(sharedStyles, /\.term-wiki__portal/)
assert.match(sharedStyles, /term-wiki-card-arrow-nudge/)
assert.doesNotMatch(sharedStyles, /height:\s*200%/)
assert.doesNotMatch(sharedStyles, /\.term-wiki__drawer/)
const fixedFontSizes = [...sharedStyles.matchAll(/font-size:\s*(\d+)px/g)].map(match => Number(match[1]))
assert.ok(fixedFontSizes.length > 0)
assert.equal(Math.min(...fixedFontSizes), 16)
assert.doesNotMatch(sharedStyles, /font-size:\s*0\.\d+rem/)
assert.doesNotMatch(wikiLayout, /extends includes\/layout\.pug/)
assert.match(wikiLayout, /include \.\/includes\/header\/index\.pug/)
assert.match(wikiLayout, /#term-wiki\(data-term-wiki-root/)
assert.match(wikiLayout, /gallery\/term-wiki\/styles\.css/)
assert.match(wikiLayout, /gallery\/term-wiki\/app\.js/)
assert.match(wikiLayout, /term-gallery-20260824-1/)
assert.match(wikiLayout, /page\.term_wiki_data\) \+ '\?v='/)
assert.doesNotMatch(wikiLayout, /#page|term-wiki-credit|includes\/footer/)

const plantIndex = fs.readFileSync(path.join(root, 'source/gallery/PlantCard/index.md'), 'utf8')
const plantRefs = [...plantIndex.matchAll(/!\[\]\((\/gallery\/PlantCard\/assets\/2019\/[^)]+)\)/g)]
assert.equal(plantRefs.length, 48)
assert.equal(new Set(plantRefs.map(match => match[1])).size, 48)
for (const [, ref] of plantRefs) {
  assert.ok(fs.existsSync(path.join(root, 'source', ref.replace(/^\//, ''))), `missing plant asset: ${ref}`)
}
assert.doesNotMatch(plantIndex, /https?:\/\//i)

console.log('term wiki data and local gallery assets: ok')
