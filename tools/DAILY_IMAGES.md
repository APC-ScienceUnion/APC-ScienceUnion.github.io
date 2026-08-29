# Daily image snapshots

`update_daily_images.py` keeps the Bing wallpaper, APOD, and English Wikipedia
picture of the day inside `source/images/daily/`. The browser reads only
`/images/daily/daily-images.json` and the local URLs listed there.

## Commands

```sh
python -m pip install --requirement tools/daily_images_requirements.txt
npm run daily-images:update
npm run daily-images:check
npm run daily-images:check-public  # after Hexo has generated public/
```

OpenCC is pinned in `tools/daily_images_requirements.txt` and converts the NCKU
APOD mirror's traditional Chinese copy to simplified Chinese. `NASA_API_KEY` is
optional; if it is absent, NASA's public `DEMO_KEY` is used only for a
consistency check. No credential is stored in the manifest.

## Provider text and provenance

The Bing snapshot follows the AstrBot `bing-wallpaper` provider exactly. It
requests
`https://bing.ee123.net/img/?date=YYYYMMDD&size=1920x1080&imgtype=jpg&type=json`,
requires the response date to match the requested Asia/Shanghai date, downloads
only an HTTPS image URL on `cn.bing.com` or `www.bing.com`, and maps the API's
`imgtitle`, `imgshow`, `imgdetail`, and `imgcopyright` fields without inventing
copy. Only HTML tags are removed from `imgdetail`; paragraph and line boundaries
are retained. The API request and image download validate every redirect and the
final URL against their separate provider host allowlists.

APOD copy and media come from one response: the current NCKU Physics mirror at
`https://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/apod.html`. The updater
extracts the page date, Chinese title and explanation, copyright, tomorrow
preview, same-page English title/explanation, and the high-resolution
`image/YYYYMM/` link. It accepts the snapshot only when the mirror date matches
the Asia/Shanghai calendar date, converts all Chinese fields with OpenCC, and
downloads only that same-origin NCKU media URL. NASA metadata may confirm the
date and media type, but NASA text and media URLs are never mixed into the NCKU
snapshot. A rate-limited or unavailable NASA check is a warning rather than a
reason to discard an otherwise complete NCKU snapshot; a successful but
contradictory check rejects it. Mirror-only English housekeeping such as gallery
promotions and site-migration notices is removed after the scientific
explanation.

## Byte preservation and failures

Image response bodies are persisted directly. The updater does not decode,
resize, recompress, transcode, or strip metadata. It checks both the HTTP MIME
type and the file signature; generic binary MIME types are accepted only when a
recognized image signature is present. Every entry records its byte count,
SHA-256, and detected MIME type.

Each provider is refreshed independently. A failed request, stale provider
date, unsupported APOD media page, or incomplete response leaves that provider's
last verified manifest entry and file untouched. A fallback is valid only when
both its image bytes and its provider-specific text/provenance fields pass the
offline checks. Content-addressed filenames avoid stale browser caches, and the
current plus two prior files are retained.

The canonical image field is `providers.<name>.local_url`, always under
`/images/daily/`. `image_path` is an identical compatibility alias. External
`source_page_url`, `source_image_url`, and `fetched_url` values are provenance
only and must never be assigned to a rendered image.

`.github/workflows/daily_images.yml` refreshes at 09:20 and 18:20
Asia/Shanghai and can also be run manually. The morning run refreshes Bing and
Wikipedia even when NCKU is still on the previous date; the later run catches
the new APOD after the mirror publishes it. It commits only
`source/images/daily/` to the `source` branch and then explicitly dispatches the
existing Pages workflow.
