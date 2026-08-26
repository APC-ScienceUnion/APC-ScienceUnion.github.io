# External image localization

The rendered, fixed image assets in this Hexo site are committed locally. This
prevents old articles, news cards, book covers, and theme artwork from breaking
when an image host changes or disappears.

## Commands

```powershell
npm run assets:localize
npm run assets:check
npm run assets:check-public
npm run daily-images:update
npm run daily-images:check
npm run daily-images:check-public
```

`assets:localize` scans only image-rendering contexts, downloads and validates
each image byte-for-byte, rewrites the source references, and records hashes in
`tools/external-images-manifest.json`. It is safe to rerun: already-localized
sources are ignored and a failed run keeps completed downloads as a resumable
cache without partially rewriting source files.

The downloader does not resize, recompress, transcode, optimize, or strip
metadata. The validated response body is committed exactly as received.

The tool requires Python 3.10 or newer.

`assets:check` fails if a fixed external image reference reappears, a manifested
file is missing, or its size, MIME type, or SHA-256 digest changes.

The manifest also records the directories owned by this migration. This catches
an accidentally dropped manifest entry without claiming unrelated images that
were created locally by a different import or authoring workflow.

After a Hexo build, `assets:check-public` additionally verifies that every
generated image is still byte-for-byte identical. CI runs this after generation,
so an accidental image optimizer or metadata stripper will fail deployment.

## Asset layout

- Posts: `source/images/<Chinese category>/<legacy asset bucket>/`
- APC news: `source/images/apc-news/`
- Resource covers: `source/link/assets/images/`
- Theme artwork: `themes/butterfly/source/img/site/`
- Daily Bing/APOD/Wikipedia snapshots: `source/images/daily/`

Chinese and English posts are mixed under `source/_posts/<Chinese category>/`.
The English post's `translation_key` identifies its Chinese partner, so both
versions inherit the same physical category and legacy asset bucket. The two
historical bucket aliases remain stable:

- `人工智能(AI) 通俗演义` uses
  `artificial-intelligence-intuitive-introduction`.
- `为何所有8位及以上的数都可以变为等式？——硅基-沉默整数平衡化定理及其证明简明介绍`
  uses `为何所有8位及以上的数都可以变为等式？`.

The Chang'e 5 post defaults to its full, same-named bucket; its older
`嫦娥奔月` bucket remains an explicitly referenced supplemental directory.

The category is a repository-only organizational layer. Article assets are
still published at `/images/<legacy asset bucket>/...`, with no category in the
URL, so existing article references, inbound links, and caches remain valid.
APC news and daily snapshots retain their dedicated top-level paths. Public
references remain root-relative, matching the existing
`post_asset_folder: false` and `relative_link: false` settings.

The build's asset-publishing step performs this category-to-flat mapping by
copying the original files. It must not resize, recompress, transcode, optimize,
or strip metadata; `assets:check-public` verifies the published bytes against
the manifest afterward.

## Deliberate exclusions

Ordinary links to sources, papers, attribution pages, scripts, fonts, APIs, and
third-party services are not images rendered by the static site and are not
rewritten.

Everything under `source/gallery/` is explicitly excluded. Galleries are curated
separately and this workflow neither audits nor modifies their image references.

The “每日新闻” widgets for Bing, NASA APOD, and Wikipedia are handled by a
separate scheduled snapshot workflow. `daily-images:update` downloads the three
original response bodies without image processing, writes a hashed local index,
and preserves the previous valid snapshot if a provider is unavailable. The
browser accepts only same-origin `/images/daily/` paths from that index; source
image URLs remain provenance metadata and are never image fallbacks.

The daily checks verify byte counts, MIME signatures, SHA-256 digests, and—after
Hexo generation—the public copies. The scheduled workflow keeps the latest three
snapshots per provider so a temporary upstream outage does not blank the page.
