# Bilingual site maintenance

Posts are grouped by the Chinese article category at
`source/_posts/<Chinese category>/`. Chinese and English Markdown files live
side by side in that category directory. English posts are identified by their
`lang: en` front matter, never by a special directory name.

Every Chinese Markdown post below `source/_posts/` must have one English partner
in the same category directory. The `section` segment in `new_post_name` keeps
the physical category directory out of the post slug and taxonomy; new posts
without an explicit section go to `未分类`.

English front matter must include:

```yaml
layout: post
lang: en
translation_key: "Exact Chinese source basename without .md"
permalink: en/YYYY/MM/DD/ascii-kebab-slug/
aside: true
comments: false
tags: []
categories: []
```

Keep the original date, cover, author attribution, formulas, code, links, and
image paths. Translate visible prose, captions, image `alt`/`title` text, and
natural-language text inside formulas. English posts reuse the existing local
images; never duplicate or transform the image files.

Translation is not a word-substitution exercise. Every title and article must
also pass the native-English review in `tools/ENGLISH_EDITORIAL_STYLE.md`.
Read the complete current source, edit the English for meaning and voice, then
compare the result with the source again for omissions or invented claims.

`scripts/bilingual.js` separates the Chinese and English home, archive,
pagination, previous/next links, categories, and search indexes. English posts
keep empty taxonomy fields so Hexo does not double-count the Chinese terms;
their category cards and `/en/categories/` pages inherit the paired Chinese
post's category through `translation_key` and display the configured English
name. The header language icon pairs English `translation_key` values with the
Chinese source basename, so physical category directories do not affect pairing;
Chinese source filenames and URLs remain unchanged.

Standalone bilingual content currently includes `/about/` ↔ `/en/about/` and
all yearly APC News routes under `/apc-news/` ↔ `/en/apc-news/`. The English
news data in `source/_data/apc_news_en.yml` must stay in one-to-one order with
`apc_news.yml`; dates, covers, embedded image paths, and link targets are
immutable. `tools/apc-news-en-source.sha256` records the normalized source
fingerprint. Update it only after the complete English news dataset has been
reviewed against the current Chinese file. `tests/test_bilingual_pages.js`
enforces these source-level pairs.

Before deployment, run:

```text
npm run bilingual:check
npm run assets:refresh-references
npm run assets:check
npm run clean
npm run build
npm run bilingual:check-public
npm run assets:check-public
```

The gallery is outside the bilingual-post scope and must not be modified by
this workflow.
