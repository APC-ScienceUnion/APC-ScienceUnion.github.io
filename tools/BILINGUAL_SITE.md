# Bilingual site maintenance

Every top-level Markdown file in `source/_posts/` must have one English partner in
`source/_posts/en/`.

English front matter must include:

```yaml
layout: post
lang: en
translation_key: "Exact Chinese source filename without .md"
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

`scripts/bilingual.js` separates the Chinese and English home, archive,
pagination, previous/next links, categories, and search indexes. English posts
keep empty taxonomy fields so Hexo does not double-count the Chinese terms;
their category cards and `/en/categories/` pages inherit the paired Chinese
post's category through `translation_key` and display the configured English
name. The header language icon pairs posts by `translation_key`; Chinese source
filenames and URLs remain unchanged.

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
