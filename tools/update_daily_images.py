#!/usr/bin/env python3
"""Refresh and verify local snapshots of the site's three daily images.

Downloaded image response bodies are written byte-for-byte.  This tool never
decodes, resizes, recompresses, transcodes, or strips metadata from an image.
"""

from __future__ import annotations

import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import time
from datetime import date, datetime, timedelta, timezone
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DAILY_DIR = ROOT / "source" / "images" / "daily"
MANIFEST = DAILY_DIR / "daily-images.json"
PLACEHOLDER = DAILY_DIR / "placeholder.svg"
PUBLIC_DIR = ROOT / "public" / "images" / "daily"
PROVIDERS = ("bing", "apod", "wikipedia")
SCHEMA_VERSION = 1
SHANGHAI = timezone(timedelta(hours=8), name="Asia/Shanghai")
USER_AGENT = (
    "APC-ScienceUnion-daily-image-snapshot/1.0 "
    "(+https://github.com/APC-ScienceUnion/APC-ScienceUnion.github.io)"
)
MAX_JSON_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BYTES = int(os.environ.get("DAILY_IMAGE_MAX_BYTES", 95 * 1024 * 1024))
RETRIES = max(1, int(os.environ.get("DAILY_IMAGE_RETRIES", "4")))
TIMEOUT = max(5, int(os.environ.get("DAILY_IMAGE_TIMEOUT", "35")))
RETENTION = max(1, int(os.environ.get("DAILY_IMAGE_RETENTION", "3")))


class SnapshotError(RuntimeError):
    """A provider response could not safely become a local snapshot."""


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def clean_html(value: Any, limit: int = 20_000) -> str:
    if not value:
        return ""
    parser = _TextExtractor()
    try:
        parser.feed(html.unescape(str(value)))
        text = " ".join(parser.parts)
    except Exception:
        text = re.sub(r"<[^>]*>", " ", html.unescape(str(value)))
    return re.sub(r"\s+", " ", text).strip()[:limit]


def request_bytes(
    url: str,
    *,
    accept: str,
    label: str,
    max_bytes: int,
) -> tuple[bytes, str, str]:
    """Fetch a response without requesting HTTP content compression."""

    last_error: Exception | None = None
    for attempt in range(1, RETRIES + 1):
        try:
            request = Request(
                url,
                headers={
                    "Accept": accept,
                    "User-Agent": USER_AGENT,
                    # Deliberately omit Accept-Encoding so the response body is
                    # not transparently transformed before being persisted.
                },
            )
            with urlopen(request, timeout=TIMEOUT) as response:
                content_type = response.headers.get("Content-Type", "")
                declared = response.headers.get("Content-Length")
                if declared:
                    try:
                        if int(declared) > max_bytes:
                            raise SnapshotError(
                                f"{label}: response is larger than {max_bytes} bytes"
                            )
                    except ValueError:
                        pass
                body = response.read(max_bytes + 1)
                if len(body) > max_bytes:
                    raise SnapshotError(
                        f"{label}: response is larger than {max_bytes} bytes"
                    )
                return body, content_type, response.geturl()
        except (HTTPError, URLError, TimeoutError, OSError, SnapshotError) as exc:
            last_error = exc
            if attempt == RETRIES:
                break
            time.sleep(min(2 ** (attempt - 1), 8))
    raise SnapshotError(f"{label}: fetch failed after {RETRIES} attempts: {last_error}")


def fetch_json(url: str, *, label: str) -> dict[str, Any]:
    body, content_type, _ = request_bytes(
        url,
        accept="application/json",
        label=label,
        max_bytes=MAX_JSON_BYTES,
    )
    mime = content_type.split(";", 1)[0].strip().lower()
    if mime not in {"application/json", "text/json", "text/plain", ""} and not mime.endswith(
        "+json"
    ):
        raise SnapshotError(f"{label}: expected JSON MIME type, got {mime!r}")
    try:
        value = json.loads(body.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SnapshotError(f"{label}: invalid JSON response: {exc}") from exc
    if not isinstance(value, dict):
        raise SnapshotError(f"{label}: JSON root is not an object")
    return value


def sniff_image(body: bytes) -> tuple[str, str] | None:
    if body.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", ".jpg"
    if body.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", ".png"
    if body.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif", ".gif"
    if len(body) >= 12 and body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return "image/webp", ".webp"
    if body.startswith(b"BM"):
        return "image/bmp", ".bmp"
    if body.startswith((b"II*\x00", b"MM\x00*")):
        return "image/tiff", ".tif"
    if len(body) >= 12 and body[4:8] == b"ftyp" and body[8:12] in {
        b"avif",
        b"avis",
    }:
        return "image/avif", ".avif"
    prefix = body[:4096].lstrip(b"\xef\xbb\xbf\x00\t\r\n ").lower()
    if prefix.startswith(b"<?xml"):
        end = prefix.find(b"?>")
        if end >= 0:
            prefix = prefix[end + 2 :].lstrip()
    if prefix.startswith(b"<svg") or b"<svg " in prefix[:512]:
        return "image/svg+xml", ".svg"
    return None


def canonical_mime(content_type: str) -> str:
    mime = content_type.split(";", 1)[0].strip().lower()
    aliases = {
        "image/jpg": "image/jpeg",
        "image/pjpeg": "image/jpeg",
        "image/x-png": "image/png",
        "image/x-icon": "image/vnd.microsoft.icon",
        "application/svg+xml": "image/svg+xml",
    }
    return aliases.get(mime, mime)


def validate_image(body: bytes, content_type: str, *, label: str) -> tuple[str, str]:
    sniffed = sniff_image(body)
    if sniffed is None:
        raise SnapshotError(f"{label}: unrecognized image signature")
    actual_mime, extension = sniffed
    declared_mime = canonical_mime(content_type)
    generic_binary = {
        "",
        "application/octet-stream",
        "binary/octet-stream",
        "application/binary",
    }
    if declared_mime in generic_binary:
        # Several otherwise reliable static image origins use a generic binary
        # MIME type.  The signature is authoritative in that narrow case.
        return actual_mime, extension
    if not declared_mime.startswith("image/"):
        raise SnapshotError(f"{label}: non-image MIME type {declared_mime!r}")
    if declared_mime != actual_mime:
        raise SnapshotError(
            f"{label}: MIME/signature mismatch ({declared_mime!r} vs {actual_mime!r})"
        )
    return actual_mime, extension


def download_image(url: str, *, label: str) -> tuple[bytes, str, str, str]:
    body, content_type, final_url = request_bytes(
        url,
        # Do not negotiate a modern/derived representation: persist whatever
        # byte stream the provenance URL returns by default.
        accept="*/*",
        label=label,
        max_bytes=MAX_IMAGE_BYTES,
    )
    mime, extension = validate_image(body, content_type, label=label)
    return body, mime, extension, final_url


def iso_date(compact: str) -> str:
    if not re.fullmatch(r"\d{8}", compact):
        raise SnapshotError(f"invalid provider date {compact!r}")
    return f"{compact[:4]}-{compact[4:6]}-{compact[6:]}"


def bing_snapshot() -> tuple[dict[str, Any], bytes, str]:
    api_url = "https://www.bing.com/HPImageArchive.aspx?" + urlencode(
        {"format": "js", "idx": "0", "n": "1", "mkt": "zh-CN"}
    )
    payload = fetch_json(api_url, label="Bing metadata")
    images = payload.get("images")
    if not isinstance(images, list) or not images or not isinstance(images[0], dict):
        raise SnapshotError("Bing metadata: no image entry")
    item = images[0]
    snapshot_date = iso_date(str(item.get("enddate") or item.get("startdate") or ""))
    urlbase = str(item.get("urlbase") or "")
    api_path = str(item.get("url") or "")
    candidates: list[str] = []
    if urlbase.startswith("/"):
        candidates.append(f"https://www.bing.com{urlbase}_UHD.jpg")
    if api_path.startswith("/"):
        candidates.append(f"https://www.bing.com{api_path}")
    if not candidates:
        raise SnapshotError("Bing metadata: no usable image URL")

    errors: list[str] = []
    for candidate in dict.fromkeys(candidates):
        try:
            body, mime, extension, final_url = download_image(
                candidate, label="Bing image"
            )
            break
        except SnapshotError as exc:
            errors.append(str(exc))
    else:
        raise SnapshotError("Bing image: " + "; ".join(errors))

    copyright_text = clean_html(item.get("copyright"))
    subject = re.split(r"\s*\(©", copyright_text, maxsplit=1)[0].strip()
    metadata = {
        "date": snapshot_date,
        "title": subject or clean_html(item.get("title")) or "必应每日壁纸",
        "headline": clean_html(item.get("title")),
        "description": "",
        "copyright": copyright_text,
        "source_page_url": str(item.get("copyrightlink") or "https://www.bing.com/"),
        "source_image_url": candidate,
        "fetched_url": final_url,
        "mime": mime,
    }
    return metadata, body, extension


def apod_page_url(snapshot_date: str) -> str:
    parsed = date.fromisoformat(snapshot_date)
    return f"https://apod.nasa.gov/apod/ap{parsed:%y%m%d}.html"


def apod_snapshot() -> tuple[dict[str, Any], bytes, str]:
    api_key = os.environ.get("NASA_API_KEY", "").strip() or "DEMO_KEY"
    base_url = "https://api.nasa.gov/planetary/apod"
    initial = fetch_json(
        base_url + "?" + urlencode({"api_key": api_key}),
        label="NASA APOD metadata",
    )
    try:
        base_date = date.fromisoformat(str(initial.get("date")))
    except ValueError as exc:
        raise SnapshotError("NASA APOD metadata: invalid date") from exc

    lookback = max(0, int(os.environ.get("APOD_IMAGE_LOOKBACK_DAYS", "14")))
    errors: list[str] = []
    for offset in range(lookback + 1):
        if offset == 0:
            record = initial
        else:
            query_date = (base_date - timedelta(days=offset)).isoformat()
            record = fetch_json(
                base_url
                + "?"
                + urlencode({"api_key": api_key, "date": query_date}),
                label=f"NASA APOD metadata for {query_date}",
            )
        if record.get("media_type") != "image":
            continue
        snapshot_date = str(record.get("date") or "")
        try:
            date.fromisoformat(snapshot_date)
        except ValueError:
            errors.append("invalid APOD date")
            continue
        candidates = [str(record.get("hdurl") or ""), str(record.get("url") or "")]
        for candidate in dict.fromkeys(value for value in candidates if value.startswith("http")):
            try:
                body, mime, extension, final_url = download_image(
                    candidate, label=f"NASA APOD image for {snapshot_date}"
                )
                metadata = {
                    "date": snapshot_date,
                    "title": clean_html(record.get("title")) or "NASA APOD",
                    "description": clean_html(record.get("explanation")),
                    "explanation_en": clean_html(record.get("explanation")),
                    "copyright": clean_html(record.get("copyright")),
                    "media_type": "image",
                    "source_page_url": apod_page_url(snapshot_date),
                    "source_image_url": candidate,
                    "fetched_url": final_url,
                    "mime": mime,
                }
                return metadata, body, extension
            except SnapshotError as exc:
                errors.append(str(exc))
    if not errors:
        errors.append(f"no image in the latest {lookback + 1} APOD entries")
    raise SnapshotError("NASA APOD: " + "; ".join(errors))


def metadata_value(extmetadata: Any, name: str) -> str:
    if not isinstance(extmetadata, dict):
        return ""
    value = extmetadata.get(name)
    if isinstance(value, dict):
        value = value.get("value")
    return clean_html(value)


def wikipedia_api(params: dict[str, str], *, label: str) -> dict[str, Any]:
    return fetch_json(
        "https://en.wikipedia.org/w/api.php?" + urlencode(params), label=label
    )


def wikipedia_snapshot() -> tuple[dict[str, Any], bytes, str]:
    today = datetime.now(SHANGHAI).date()
    lookback = max(0, int(os.environ.get("WIKIPEDIA_IMAGE_LOOKBACK_DAYS", "7")))
    errors: list[str] = []
    for offset in range(lookback + 1):
        snapshot_date = (today - timedelta(days=offset)).isoformat()
        title = f"Template:POTD protected/{snapshot_date}"
        listing = wikipedia_api(
            {
                "action": "query",
                "format": "json",
                "formatversion": "2",
                "prop": "images",
                "titles": title,
            },
            label=f"Wikipedia POTD metadata for {snapshot_date}",
        )
        pages = listing.get("query", {}).get("pages", [])
        if not isinstance(pages, list) or not pages:
            errors.append(f"{snapshot_date}: no template page")
            continue
        images = pages[0].get("images", []) if isinstance(pages[0], dict) else []
        if not isinstance(images, list) or not images:
            errors.append(f"{snapshot_date}: no image in template")
            continue

        for image_item in images:
            file_title = str(image_item.get("title") or "") if isinstance(image_item, dict) else ""
            if not file_title.startswith("File:"):
                continue
            details = wikipedia_api(
                {
                    "action": "query",
                    "format": "json",
                    "formatversion": "2",
                    "prop": "imageinfo",
                    "iiprop": "url|mime|size|extmetadata",
                    "titles": file_title,
                },
                label=f"Wikipedia image metadata for {snapshot_date}",
            )
            detail_pages = details.get("query", {}).get("pages", [])
            if not isinstance(detail_pages, list) or not detail_pages:
                continue
            info_list = detail_pages[0].get("imageinfo", []) if isinstance(detail_pages[0], dict) else []
            if not isinstance(info_list, list) or not info_list or not isinstance(info_list[0], dict):
                continue
            info = info_list[0]
            candidate = str(info.get("url") or "")
            if not candidate.startswith("http"):
                continue
            try:
                body, mime, extension, final_url = download_image(
                    candidate, label=f"Wikipedia POTD image for {snapshot_date}"
                )
            except SnapshotError as exc:
                errors.append(str(exc))
                continue

            extmetadata = info.get("extmetadata")
            object_name = metadata_value(extmetadata, "ObjectName")
            description = metadata_value(extmetadata, "ImageDescription")
            artist = metadata_value(extmetadata, "Artist")
            credit = metadata_value(extmetadata, "Credit")
            license_name = metadata_value(extmetadata, "LicenseShortName")
            copyright_parts = list(dict.fromkeys(v for v in (artist, credit, license_name) if v))
            page_url = str(info.get("descriptionurl") or "")
            if not page_url:
                page_url = "https://en.wikipedia.org/wiki/" + quote(file_title.replace(" ", "_"))
            metadata = {
                "date": snapshot_date,
                "title": object_name or file_title.removeprefix("File:"),
                "description": description,
                "copyright": " · ".join(copyright_parts),
                "article_url": page_url,
                "source_page_url": page_url,
                "source_image_url": candidate,
                "fetched_url": final_url,
                "mime": mime,
            }
            return metadata, body, extension
        errors.append(f"{snapshot_date}: no downloadable image")
    raise SnapshotError("Wikipedia POTD: " + "; ".join(errors[-8:]))


def atomic_write(path: Path, body: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", prefix=f".{path.name}.", suffix=".tmp", dir=path.parent, delete=False
        ) as handle:
            temporary = Path(handle.name)
            handle.write(body)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def load_manifest() -> dict[str, Any]:
    if not MANIFEST.exists():
        return {"schema_version": SCHEMA_VERSION, "providers": {}}
    try:
        payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SnapshotError(f"cannot read existing daily image manifest: {exc}") from exc
    if not isinstance(payload, dict):
        raise SnapshotError("existing daily image manifest is not an object")
    providers = payload.get("providers")
    if not isinstance(providers, dict):
        raise SnapshotError("existing daily image manifest has no providers object")
    return payload


def local_path_from_url(local_url: Any, *, base: Path = ROOT / "source") -> Path:
    if not isinstance(local_url, str) or not re.fullmatch(
        r"/images/daily/[A-Za-z0-9._-]+", local_url
    ):
        raise SnapshotError(f"unsafe local daily image URL: {local_url!r}")
    relative = Path(*local_url.removeprefix("/").split("/"))
    return base / relative


def verify_entry(provider: str, entry: Any, *, base: Path = ROOT / "source") -> list[str]:
    errors: list[str] = []
    if not isinstance(entry, dict):
        return [f"{provider}: manifest entry is not an object"]
    try:
        path = local_path_from_url(entry.get("local_url"), base=base)
    except SnapshotError as exc:
        return [f"{provider}: {exc}"]
    if entry.get("image_path") != entry.get("local_url"):
        errors.append(f"{provider}: image_path must equal local_url")
    if not path.is_file():
        errors.append(f"{provider}: missing {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}")
        return errors
    body = path.read_bytes()
    expected_bytes = entry.get("bytes")
    expected_hash = entry.get("sha256")
    expected_mime = entry.get("mime")
    if expected_bytes != len(body):
        errors.append(f"{provider}: byte count mismatch")
    actual_hash = hashlib.sha256(body).hexdigest()
    if expected_hash != actual_hash:
        errors.append(f"{provider}: SHA-256 mismatch")
    sniffed = sniff_image(body)
    if sniffed is None:
        errors.append(f"{provider}: unknown image signature")
    else:
        if expected_mime != sniffed[0]:
            errors.append(f"{provider}: MIME/signature mismatch")
        if path.suffix.lower() != sniffed[1]:
            errors.append(f"{provider}: filename extension/signature mismatch")
    return errors


def build_entry(
    provider: str, metadata: dict[str, Any], body: bytes, extension: str
) -> dict[str, Any]:
    digest = hashlib.sha256(body).hexdigest()
    snapshot_date = str(metadata["date"])
    filename = f"{provider}-{snapshot_date}-{digest[:12]}{extension}"
    local_url = f"/images/daily/{filename}"
    entry = dict(metadata)
    entry.update(
        {
            "local_url": local_url,
            "image_path": local_url,
            "bytes": len(body),
            "sha256": digest,
        }
    )
    return entry


def cleanup_old_images(providers: dict[str, Any]) -> None:
    referenced = {
        str(entry.get("local_url", "")).rsplit("/", 1)[-1]
        for entry in providers.values()
        if isinstance(entry, dict)
    }
    for provider in PROVIDERS:
        candidates = sorted(
            (
                path
                for path in DAILY_DIR.glob(f"{provider}-*")
                if path.is_file() and path.name not in referenced
            ),
            key=lambda path: path.name,
            reverse=True,
        )
        keep_unreferenced = max(0, RETENTION - 1)
        for path in candidates[keep_unreferenced:]:
            path.unlink()


def update() -> int:
    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    old_manifest = load_manifest()
    old_providers = old_manifest.get("providers", {})
    providers = dict(old_providers)
    fetchers: dict[str, Callable[[], tuple[dict[str, Any], bytes, str]]] = {
        "bing": bing_snapshot,
        "apod": apod_snapshot,
        "wikipedia": wikipedia_snapshot,
    }
    failures: list[str] = []
    changed: list[str] = []

    for provider in PROVIDERS:
        try:
            metadata, body, extension = fetchers[provider]()
            entry = build_entry(provider, metadata, body, extension)
            target = local_path_from_url(entry["local_url"])
            if target.exists():
                if target.read_bytes() != body:
                    raise SnapshotError(f"{provider}: existing content-addressed file differs")
            else:
                atomic_write(target, body)
            if providers.get(provider) != entry:
                providers[provider] = entry
                changed.append(provider)
            print(
                f"{provider}: {entry['date']} -> {entry['local_url']} "
                f"({entry['bytes']} bytes, {entry['mime']})"
            )
        except Exception as exc:  # keep the last known-good provider snapshot
            previous = old_providers.get(provider)
            fallback_errors = verify_entry(provider, previous)
            if fallback_errors:
                failures.append(f"{provider}: {exc}; no valid previous snapshot")
            else:
                print(
                    f"WARNING: {provider}: refresh failed ({exc}); preserving previous snapshot",
                    file=sys.stderr,
                )

    missing = [provider for provider in PROVIDERS if provider not in providers]
    if missing:
        failures.append("missing providers: " + ", ".join(missing))
    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1

    new_manifest = {
        "schema_version": SCHEMA_VERSION,
        "updated_at": old_manifest.get("updated_at", ""),
        "providers": providers,
    }
    comparable_old = {
        "schema_version": old_manifest.get("schema_version"),
        "providers": old_providers,
    }
    comparable_new = {
        "schema_version": SCHEMA_VERSION,
        "providers": providers,
    }
    if comparable_new != comparable_old or not MANIFEST.exists():
        new_manifest["updated_at"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        encoded = (json.dumps(new_manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        atomic_write(MANIFEST, encoded)
        print("updated manifest: " + ", ".join(changed or PROVIDERS))
    else:
        print("daily image manifest is already current")
    cleanup_old_images(providers)
    return check(public=False)


def check(*, public: bool) -> int:
    errors: list[str] = []
    try:
        manifest = load_manifest()
    except SnapshotError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    if manifest.get("schema_version") != SCHEMA_VERSION:
        errors.append(
            f"schema_version must be {SCHEMA_VERSION}, got {manifest.get('schema_version')!r}"
        )
    providers = manifest.get("providers", {})
    for provider in PROVIDERS:
        errors.extend(verify_entry(provider, providers.get(provider)))
    if not PLACEHOLDER.is_file():
        errors.append("missing source/images/daily/placeholder.svg")
    elif sniff_image(PLACEHOLDER.read_bytes()) != ("image/svg+xml", ".svg"):
        errors.append("placeholder.svg has an invalid SVG signature")

    if public:
        if not PUBLIC_DIR.is_dir():
            errors.append("public/images/daily does not exist; generate the site first")
        else:
            for provider in PROVIDERS:
                entry = providers.get(provider)
                if not isinstance(entry, dict):
                    continue
                errors.extend(verify_entry(f"public/{provider}", entry, base=ROOT / "public"))
            public_manifest = PUBLIC_DIR / MANIFEST.name
            if not public_manifest.is_file():
                errors.append("public daily-images.json is missing")
            elif public_manifest.read_bytes() != MANIFEST.read_bytes():
                errors.append("public daily-images.json differs from source")
            public_placeholder = PUBLIC_DIR / PLACEHOLDER.name
            if not public_placeholder.is_file():
                errors.append("public placeholder.svg is missing")
            elif public_placeholder.read_bytes() != PLACEHOLDER.read_bytes():
                errors.append("public placeholder.svg differs from source")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    location = "source and public" if public else "source"
    print(f"daily image check passed ({location}; {len(PROVIDERS)} providers)")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Update or verify byte-exact local daily image snapshots"
    )
    parser.add_argument(
        "--check", action="store_true", help="verify snapshots without using the network"
    )
    parser.add_argument(
        "--public",
        action="store_true",
        help="with --check, also verify generated copies under public/",
    )
    args = parser.parse_args()
    if args.public and not args.check:
        parser.error("--public requires --check")
    return args


def main() -> int:
    args = parse_args()
    return check(public=args.public) if args.check else update()


if __name__ == "__main__":
    raise SystemExit(main())
