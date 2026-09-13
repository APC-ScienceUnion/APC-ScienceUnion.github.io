# Bilingual site maintenance

Posts are grouped by the Chinese article category at
`source/_posts/<Chinese category>/`. Chinese and English Markdown files live
side by side in that category directory. English posts are identified by their
`lang: en` front matter, never by a special directory name.

Every Chinese Markdown post below `source/_posts/` must have an English partner.
The existing category layout places partners in the same category directory.
The `section` segment in `new_post_name` keeps
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

## Automated bilingual check: file existence only

`npm run bilingual:check` only verifies that each Chinese post has an English
Markdown file. `lang: en` (or an `en-` locale) identifies an English file, and
its `translation_key` identifies the Chinese source basename. The check does
not compare prose, comments, headings, paragraph counts, formulas, dates,
images, links, or other metadata. An additional English file does not fail
this existence check.

Standalone content follows the same rule: About and Honor Hall pages, Honor
Hall data, and APC News data each need their corresponding English file when
the Chinese file exists. Individual news entries are not compared.

Source fingerprint fields have been removed and are no longer checked or
maintained. Chinese edits require no fingerprint updates. Translation quality
remains a manual editorial responsibility.

The existence check has regression tests for changed content, missing
counterparts, and standalone files. In-progress
reporting remains available as `npm run bilingual:check-progress`.

The older generated-page navigation regression suite remains available as
the optional `npm run site-navigation:check-public` command after a build.
It is not run by the deployment workflow and is not a translation gate.
Independent category-layout, image-integrity, widget, and other site checks
remain enabled.

Before deployment, run:

```text
npm run bilingual:check
npm run assets:refresh-references
npm run assets:check
npm run clean
npm run build
npm run assets:check-public
```

The gallery is outside the bilingual-post scope and must not be modified by
this workflow.
