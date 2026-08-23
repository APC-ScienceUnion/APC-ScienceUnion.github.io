# Daily image snapshots

`update_daily_images.py` keeps the Bing wallpaper, NASA APOD, and English
Wikipedia picture of the day inside `source/images/daily/`. The browser reads
only `/images/daily/daily-images.json` and the local URLs listed there.

## Commands

```sh
npm run daily-images:update
npm run daily-images:check
npm run daily-images:check-public  # after Hexo has generated public/
```

The updater uses Python's standard library only. `NASA_API_KEY` is optional; if
it is absent, NASA's public `DEMO_KEY` is used. No credential is stored in the
manifest.

## Byte preservation and failures

Image response bodies are persisted directly. The updater does not decode,
resize, recompress, transcode, or strip metadata. It checks both the HTTP MIME
type and the file signature; generic binary MIME types are accepted only when a
recognized image signature is present. Every entry records its byte count,
SHA-256, and detected MIME type.

Each provider is refreshed independently. A failed request leaves that
provider's last verified manifest entry and file untouched. NASA video entries
are skipped by looking back for the latest image. Content-addressed filenames
avoid stale browser caches, and the current plus two prior files are retained.

The canonical image field is `providers.<name>.local_url`, always under
`/images/daily/`. `image_path` is an identical compatibility alias. External
`source_page_url`, `source_image_url`, and `fetched_url` values are provenance
only and must never be assigned to a rendered image.

`.github/workflows/daily_images.yml` refreshes the snapshots each day and can
also be run manually. It commits only `source/images/daily/` to the `source`
branch and then explicitly dispatches the existing Pages workflow.
