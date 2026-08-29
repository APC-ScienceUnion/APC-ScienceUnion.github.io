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
from urllib.parse import parse_qs, quote, urlencode, urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen


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
BING_API_ROOT = "https://bing.ee123.net/img/"
BING_API_HOSTS = frozenset({"bing.ee123.net"})
BING_IMAGE_HOSTS = frozenset({"cn.bing.com", "www.bing.com"})
NCKU_APOD_URL = "https://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/apod.html"
NCKU_APOD_HOSTS = frozenset({"sprite.phys.ncku.edu.tw"})

_OPENCC_CONVERTER: Any = None


class SnapshotError(RuntimeError):
    """A provider response could not safely become a local snapshot."""


def validate_provider_url(
    value: Any, *, allowed_hosts: frozenset[str], label: str
) -> str:
    if not isinstance(value, str) or not value:
        raise SnapshotError(f"{label}: URL is missing")
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as exc:
        raise SnapshotError(f"{label}: URL is invalid") from exc
    if (
        parsed.scheme != "https"
        or parsed.hostname not in allowed_hosts
        or port not in {None, 443}
        or parsed.username is not None
        or parsed.password is not None
    ):
        hosts = ", ".join(sorted(allowed_hosts))
        raise SnapshotError(
            f"{label}: URL must use HTTPS on an approved host ({hosts})"
        )
    return value


class _RestrictedRedirectHandler(HTTPRedirectHandler):
    def __init__(self, allowed_hosts: frozenset[str], label: str) -> None:
        super().__init__()
        self.allowed_hosts = allowed_hosts
        self.label = label

    def redirect_request(
        self,
        req: Request,
        fp: Any,
        code: int,
        msg: str,
        headers: Any,
        newurl: str,
    ) -> Request | None:
        validate_provider_url(
            newurl,
            allowed_hosts=self.allowed_hosts,
            label=f"{self.label} redirect",
        )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


class _PlainTextExtractor(HTMLParser):
    """Drop tags while retaining the boundaries represented by block markup."""

    _BLOCK_TAGS = {
        "address",
        "article",
        "aside",
        "blockquote",
        "br",
        "dd",
        "div",
        "dl",
        "dt",
        "figcaption",
        "figure",
        "footer",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "li",
        "main",
        "nav",
        "ol",
        "p",
        "pre",
        "section",
        "table",
        "td",
        "th",
        "tr",
        "ul",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def _separator(self) -> None:
        if self.parts and not self.parts[-1].endswith(("\n", "\r")):
            self.parts.append("\n")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "br":
            self._separator()

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in self._BLOCK_TAGS:
            self._separator()

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in self._BLOCK_TAGS:
            self._separator()

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


def strip_html_tags(value: Any) -> str:
    """Remove markup from an API field without rewriting its text."""

    if value is None:
        return ""
    source = str(value)
    parser = _PlainTextExtractor()
    try:
        parser.feed(source)
        parser.close()
        return "".join(parser.parts).strip("\r\n")
    except Exception:
        return html.unescape(re.sub(r"<[^>]*>", "", source))


def extracted_html_text(value: Any) -> str:
    """Turn HTML into readable text without inserting spaces around inline tags."""

    lines = []
    for line in strip_html_tags(value).splitlines():
        normalized = re.sub(r"[\t\f\v ]+", " ", line).strip()
        normalized = re.sub(r" +([,.;:!?，。；：！？])", r"\1", normalized)
        if normalized:
            lines.append(normalized)
    return "\n".join(lines)


def ncku_english_explanation(value: Any) -> str:
    text = extracted_html_text(value)
    housekeeping = re.search(
        r"\s+(?:Growing Gallery:|APOD(?:'|’)s main NASA site is moving\b)",
        text,
        re.I,
    )
    return text[: housekeeping.start()].rstrip() if housekeeping else text


def simplified_chinese(value: Any, *, label: str) -> str:
    global _OPENCC_CONVERTER
    text = str(value or "").strip()
    try:
        if _OPENCC_CONVERTER is None:
            from opencc import OpenCC

            _OPENCC_CONVERTER = OpenCC("t2s")
        return str(_OPENCC_CONVERTER.convert(text))
    except (ImportError, OSError, ValueError) as exc:
        raise SnapshotError(
            f"{label}: OpenCC conversion is unavailable; install the daily-image requirements"
        ) from exc


def request_bytes(
    url: str,
    *,
    accept: str,
    label: str,
    max_bytes: int,
    allowed_redirect_hosts: frozenset[str] | None = None,
) -> tuple[bytes, str, str]:
    """Fetch a response without requesting HTTP content compression."""

    if allowed_redirect_hosts is not None:
        validate_provider_url(url, allowed_hosts=allowed_redirect_hosts, label=label)
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
            if allowed_redirect_hosts is None:
                response_context = urlopen(request, timeout=TIMEOUT)
            else:
                opener = build_opener(
                    _RestrictedRedirectHandler(allowed_redirect_hosts, label)
                )
                response_context = opener.open(request, timeout=TIMEOUT)
            with response_context as response:
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
                final_url = response.geturl()
                if allowed_redirect_hosts is not None:
                    validate_provider_url(
                        final_url,
                        allowed_hosts=allowed_redirect_hosts,
                        label=f"{label} final URL",
                    )
                return body, content_type, final_url
        except (HTTPError, URLError, TimeoutError, OSError, SnapshotError) as exc:
            last_error = exc
            if attempt == RETRIES:
                break
            time.sleep(min(2 ** (attempt - 1), 8))
    raise SnapshotError(f"{label}: fetch failed after {RETRIES} attempts: {last_error}")


def fetch_json_response(
    url: str,
    *,
    label: str,
    allowed_redirect_hosts: frozenset[str] | None = None,
) -> tuple[dict[str, Any], str]:
    body, content_type, final_url = request_bytes(
        url,
        accept="application/json",
        label=label,
        max_bytes=MAX_JSON_BYTES,
        allowed_redirect_hosts=allowed_redirect_hosts,
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
    return value, final_url


def fetch_json(url: str, *, label: str) -> dict[str, Any]:
    return fetch_json_response(url, label=label)[0]


def fetch_html(
    url: str,
    *,
    label: str,
    allowed_redirect_hosts: frozenset[str] | None = None,
) -> tuple[str, str]:
    body, content_type, final_url = request_bytes(
        url,
        accept="text/html,application/xhtml+xml",
        label=label,
        max_bytes=MAX_JSON_BYTES,
        allowed_redirect_hosts=allowed_redirect_hosts,
    )
    mime = content_type.split(";", 1)[0].strip().lower()
    if mime not in {"", "text/html", "application/xhtml+xml", "text/plain"}:
        raise SnapshotError(f"{label}: expected HTML MIME type, got {mime!r}")

    encodings: list[str] = []
    header_charset = re.search(r"charset\s*=\s*['\"]?([^;'\"\s]+)", content_type, re.I)
    if header_charset:
        encodings.append(header_charset.group(1))
    meta_charset = re.search(
        br"<meta\b[^>]*charset\s*=\s*['\"]?([^'\"\s/>]+)",
        body[:4096],
        re.I,
    )
    if meta_charset:
        try:
            encodings.append(meta_charset.group(1).decode("ascii"))
        except UnicodeDecodeError:
            pass
    encodings.extend(("utf-8-sig", "big5", "cp950"))
    errors: list[str] = []
    for encoding in dict.fromkeys(encodings):
        try:
            return body.decode(encoding), final_url
        except (LookupError, UnicodeDecodeError) as exc:
            errors.append(f"{encoding}: {exc}")
    raise SnapshotError(f"{label}: cannot decode HTML ({'; '.join(errors)})")


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


def download_image(
    url: str,
    *,
    label: str,
    allowed_redirect_hosts: frozenset[str] | None = None,
) -> tuple[bytes, str, str, str]:
    body, content_type, final_url = request_bytes(
        url,
        # Do not negotiate a modern/derived representation: persist whatever
        # byte stream the provenance URL returns by default.
        accept="*/*",
        label=label,
        max_bytes=MAX_IMAGE_BYTES,
        allowed_redirect_hosts=allowed_redirect_hosts,
    )
    mime, extension = validate_image(body, content_type, label=label)
    return body, mime, extension, final_url


def required_json_text(payload: dict[str, Any], key: str, *, label: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise SnapshotError(f"{label}: missing non-empty {key}")
    return value


def parse_bing_payload(
    payload: dict[str, Any], *, expected_date: date, api_url: str
) -> tuple[dict[str, Any], str]:
    if str(payload.get("status")) != "200":
        raise SnapshotError(f"Bing metadata: API status is {payload.get('status')!r}")
    raw_date = required_json_text(payload, "date", label="Bing metadata")
    try:
        response_date = datetime.strptime(raw_date, "%Y/%m/%d").date()
    except ValueError as exc:
        raise SnapshotError(f"Bing metadata: invalid date {raw_date!r}") from exc
    if response_date != expected_date:
        raise SnapshotError(
            f"Bing metadata: requested {expected_date.isoformat()} but API returned "
            f"{response_date.isoformat()}"
        )

    image_url = required_json_text(payload, "imgurl", label="Bing metadata")
    parsed_image = urlsplit(image_url)
    if parsed_image.scheme != "https" or parsed_image.hostname not in BING_IMAGE_HOSTS:
        raise SnapshotError(
            "Bing metadata: imgurl must use HTTPS on an approved Bing image host"
        )
    # These four fields are intentionally neither summarized nor embellished.
    title = required_json_text(payload, "imgtitle", label="Bing metadata")
    subtitle = required_json_text(payload, "imgshow", label="Bing metadata")
    detail = required_json_text(payload, "imgdetail", label="Bing metadata")
    copyright_text = required_json_text(payload, "imgcopyright", label="Bing metadata")
    metadata = {
        "date": response_date.isoformat(),
        "title": title,
        "headline": title,
        "subtitle": subtitle,
        "description": strip_html_tags(detail),
        "copyright": copyright_text,
        "source_page_url": api_url,
        "source_image_url": image_url,
    }
    return metadata, image_url


def bing_snapshot() -> tuple[dict[str, Any], bytes, str]:
    expected_date = datetime.now(SHANGHAI).date()
    api_url = BING_API_ROOT + "?" + urlencode(
        {
            "date": expected_date.strftime("%Y%m%d"),
            "size": "1920x1080",
            "imgtype": "jpg",
            "type": "json",
        }
    )
    payload, final_api_url = fetch_json_response(
        api_url,
        label="Bing metadata",
        allowed_redirect_hosts=BING_API_HOSTS,
    )
    validate_provider_url(
        final_api_url, allowed_hosts=BING_API_HOSTS, label="Bing metadata final URL"
    )
    metadata, image_url = parse_bing_payload(
        payload, expected_date=expected_date, api_url=final_api_url
    )
    body, mime, extension, final_url = download_image(
        image_url,
        label="Bing image",
        allowed_redirect_hosts=BING_IMAGE_HOSTS,
    )
    validate_provider_url(
        final_url, allowed_hosts=BING_IMAGE_HOSTS, label="Bing image final URL"
    )
    metadata.update({"fetched_url": final_url, "mime": mime})
    return metadata, body, extension


def parse_ncku_apod(page: str, *, page_url: str) -> dict[str, Any]:
    expected_origin = urlsplit(NCKU_APOD_URL)
    page_origin = urlsplit(page_url)
    if (
        page_origin.scheme != "https"
        or page_origin.hostname != expected_origin.hostname
        or page_origin.port not in {None, 443}
    ):
        raise SnapshotError("NCKU APOD: page redirected outside the approved HTTPS host")

    date_match = re.search(
        r"(?P<year>\d{4})\s*年\s*(?P<month>\d{1,2})\s*月\s*(?P<day>\d{1,2})\s*日",
        page,
    )
    if not date_match:
        raise SnapshotError("NCKU APOD: page date is missing")
    try:
        snapshot_day = date(
            int(date_match.group("year")),
            int(date_match.group("month")),
            int(date_match.group("day")),
        )
    except ValueError as exc:
        raise SnapshotError("NCKU APOD: page date is invalid") from exc

    title = ""
    title_en = ""
    copyright_text = ""
    for center_match in re.finditer(r"<center\b[^>]*>(.*?)</center\s*>", page, re.I | re.S):
        block = center_match.group(1)
        bolds = list(re.finditer(r"<b\b[^>]*>(.*?)</b\s*>", block, re.I | re.S))
        credit_index = next(
            (
                index
                for index, item in enumerate(bolds)
                if re.search(r"(?:影像提供|圖像提供|图像提供)", clean_html(item.group(1)))
                and re.search(r"(?:版權|版权)", clean_html(item.group(1)))
            ),
            None,
        )
        if credit_index is None or credit_index == 0:
            continue
        title_fragment = bolds[credit_index - 1].group(1)
        title = extracted_html_text(title_fragment)
        english_comment = re.search(r"<!--\s*([^<>]*[A-Za-z][^<>]*)\s*-->", title_fragment)
        if english_comment:
            title_en = extracted_html_text(english_comment.group(1))
        copyright_text = extracted_html_text(block[bolds[credit_index].end() :])
        break
    if not title:
        raise SnapshotError("NCKU APOD: title is missing")

    explanation_marker = re.search(r"(?:解說|說明|解说|说明)\s*[：:]", page)
    if not explanation_marker:
        raise SnapshotError("NCKU APOD: Chinese explanation marker is missing")
    remainder = page[explanation_marker.end() :]
    description_end = re.search(
        r"<center\b[^>]*>.*?(?:圖庫持續更新|图库持续更新|明日的圖片|明日的图片)",
        remainder,
        re.I | re.S,
    )
    if not description_end:
        raise SnapshotError("NCKU APOD: Chinese explanation boundary is missing")
    description = extracted_html_text(remainder[: description_end.start()])
    if not description:
        raise SnapshotError("NCKU APOD: Chinese explanation is empty")

    english_explanation_match = re.search(
        r"<!--\s*英文原文\s*:\s*Explanation\s*:\s*(.*?)-->", page, re.I | re.S
    )
    explanation_en = (
        ncku_english_explanation(english_explanation_match.group(1))
        if english_explanation_match
        else ""
    )

    tomorrow_match = re.search(r"(?:明日的圖片|明日的图片)\s*[：:]", page)
    tomorrow = ""
    if tomorrow_match:
        tomorrow_tail = page[tomorrow_match.end() :]
        tomorrow_fragment = re.split(
            r"<(?:p|hr)\b|</center\s*>", tomorrow_tail, maxsplit=1, flags=re.I
        )[0]
        tomorrow = extracted_html_text(tomorrow_fragment)
    if not tomorrow:
        raise SnapshotError("NCKU APOD: tomorrow preview is missing")

    expected_media_dirs = {snapshot_day.strftime("%y%m"), snapshot_day.strftime("%Y%m")}
    media_url = ""
    for media_match in re.finditer(
        r"\b(?:href|src)\s*=\s*(['\"])(?P<path>image/(?P<folder>\d{4,6})/[^'\"?#]+)\1",
        page,
        re.I,
    ):
        if media_match.group("folder") not in expected_media_dirs:
            continue
        relative = html.unescape(media_match.group("path"))
        candidate = urljoin(page_url, relative)
        candidate_origin = urlsplit(candidate)
        if (
            candidate_origin.scheme == "https"
            and candidate_origin.netloc == page_origin.netloc
        ):
            media_url = candidate
            break
    if not media_url:
        raise SnapshotError("NCKU APOD: matching image/YYYYMM/ media link is missing")

    return {
        "date": snapshot_day.isoformat(),
        "title": simplified_chinese(title, label="NCKU APOD title"),
        "title_en": title_en,
        "description": simplified_chinese(description, label="NCKU APOD explanation"),
        "explanation_en": explanation_en,
        "copyright": simplified_chinese(copyright_text, label="NCKU APOD copyright"),
        "tomorrow": simplified_chinese(tomorrow, label="NCKU APOD tomorrow preview"),
        "media_type": "image",
        "source_page_url": page_url,
        "source_image_url": media_url,
    }


def apod_snapshot() -> tuple[dict[str, Any], bytes, str]:
    page, final_page_url = fetch_html(
        NCKU_APOD_URL,
        label="NCKU APOD page",
        allowed_redirect_hosts=NCKU_APOD_HOSTS,
    )
    validate_provider_url(
        final_page_url, allowed_hosts=NCKU_APOD_HOSTS, label="NCKU APOD page final URL"
    )
    metadata = parse_ncku_apod(page, page_url=final_page_url)
    mirror_date = date.fromisoformat(str(metadata["date"]))
    shanghai_today = datetime.now(SHANGHAI).date()
    if mirror_date != shanghai_today:
        raise SnapshotError(
            f"NCKU APOD: page date {mirror_date.isoformat()} does not match "
            f"Asia/Shanghai date {shanghai_today.isoformat()}"
        )

    # NASA is a consistency check only.  Its text and media URLs are never
    # mixed with the NCKU page's Chinese copy and media.
    api_key = os.environ.get("NASA_API_KEY", "").strip() or "DEMO_KEY"
    try:
        nasa_record = fetch_json(
            "https://api.nasa.gov/planetary/apod?" + urlencode({"api_key": api_key}),
            label="NASA APOD consistency metadata",
        )
    except SnapshotError as exc:
        # The public DEMO_KEY is shared and can be rate-limited.  A complete,
        # current, internally consistent NCKU page remains authoritative.
        print(
            f"WARNING: NASA APOD consistency check unavailable ({exc}); "
            "continuing with the complete NCKU snapshot",
            file=sys.stderr,
        )
    else:
        if str(nasa_record.get("date") or "") != metadata["date"]:
            raise SnapshotError(
                "NASA APOD consistency check: NASA and NCKU dates do not match"
            )
        if nasa_record.get("media_type") != metadata["media_type"]:
            raise SnapshotError(
                "NASA APOD consistency check: NASA and NCKU media types do not match"
            )

    body, mime, extension, final_url = download_image(
        str(metadata["source_image_url"]),
        label=f"NCKU APOD image for {metadata['date']}",
        allowed_redirect_hosts=NCKU_APOD_HOSTS,
    )
    validate_provider_url(
        final_url, allowed_hosts=NCKU_APOD_HOSTS, label="NCKU APOD image final URL"
    )
    metadata.update({"fetched_url": final_url, "mime": mime})
    return metadata, body, extension


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


def local_path_from_url(local_url: Any, *, base: Path | None = None) -> Path:
    if base is None:
        base = ROOT / "source"
    if not isinstance(local_url, str) or not re.fullmatch(
        r"/images/daily/[A-Za-z0-9._-]+", local_url
    ):
        raise SnapshotError(f"unsafe local daily image URL: {local_url!r}")
    relative = Path(*local_url.removeprefix("/").split("/"))
    return base / relative


def _manifest_text(
    provider: str,
    entry: dict[str, Any],
    key: str,
    errors: list[str],
) -> str:
    value = entry.get(key)
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{provider}: {key} must be a non-empty string")
        return ""
    return value


def _manifest_provider_url(
    provider: str,
    entry: dict[str, Any],
    key: str,
    allowed_hosts: frozenset[str],
    errors: list[str],
) -> str:
    value = _manifest_text(provider, entry, key, errors)
    if not value:
        return ""
    try:
        return validate_provider_url(
            value,
            allowed_hosts=allowed_hosts,
            label=f"{provider} {key}",
        )
    except SnapshotError as exc:
        errors.append(str(exc))
        return ""


def verify_provider_metadata(provider: str, entry: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    snapshot_date = _manifest_text(provider, entry, "date", errors)
    snapshot_day: date | None = None
    if snapshot_date:
        try:
            snapshot_day = date.fromisoformat(snapshot_date)
        except ValueError:
            errors.append(f"{provider}: date must use YYYY-MM-DD")

    if provider == "bing":
        values = {
            key: _manifest_text(provider, entry, key, errors)
            for key in (
                "title",
                "headline",
                "subtitle",
                "description",
                "copyright",
            )
        }
        if values["title"] and values["headline"] and values["title"] != values["headline"]:
            errors.append("bing: title must exactly equal headline/imgtitle")
        if values["description"] and re.search(
            r"</?[A-Za-z][^>]*>", values["description"]
        ):
            errors.append("bing: description must not contain HTML tags")

        api_url = _manifest_provider_url(
            provider, entry, "source_page_url", BING_API_HOSTS, errors
        )
        if api_url:
            parsed_api = urlsplit(api_url)
            if parsed_api.path != "/img/":
                errors.append("bing: source_page_url must use the /img/ endpoint")
            query = parse_qs(parsed_api.query, keep_blank_values=True)
            expected_query = {
                "size": ["1920x1080"],
                "imgtype": ["jpg"],
                "type": ["json"],
            }
            for key, expected in expected_query.items():
                if query.get(key) != expected:
                    errors.append(f"bing: source_page_url has invalid {key}")
            if snapshot_day is not None and query.get("date") != [
                snapshot_day.strftime("%Y%m%d")
            ]:
                errors.append("bing: source_page_url date does not match entry date")
        _manifest_provider_url(
            provider, entry, "source_image_url", BING_IMAGE_HOSTS, errors
        )
        _manifest_provider_url(provider, entry, "fetched_url", BING_IMAGE_HOSTS, errors)

    elif provider == "apod":
        values = {
            key: _manifest_text(provider, entry, key, errors)
            for key in (
                "title",
                "title_en",
                "description",
                "explanation_en",
                "tomorrow",
            )
        }
        if entry.get("media_type") != "image":
            errors.append("apod: media_type must be image")
        for key in ("title", "description", "tomorrow"):
            value = values[key]
            if not value:
                continue
            try:
                if simplified_chinese(value, label=f"apod {key}") != value.strip():
                    errors.append(f"apod: {key} must be simplified Chinese")
            except SnapshotError as exc:
                errors.append(str(exc))
        for key in ("title", "description"):
            if values[key] and not re.search(r"[\u3400-\u9fff\uf900-\ufaff]", values[key]):
                errors.append(f"apod: {key} must contain Chinese text")
        for key in ("title_en", "explanation_en"):
            if values[key] and re.search(r"[\u3400-\u9fff\uf900-\ufaff]", values[key]):
                errors.append(f"apod: {key} must not contain Chinese text")
        if values["explanation_en"] and re.search(
            r"(?:Growing Gallery:|APOD(?:'|’)s main NASA site is moving)",
            values["explanation_en"],
            re.I,
        ):
            errors.append("apod: explanation_en contains mirror housekeeping text")

        page_url = _manifest_provider_url(
            provider, entry, "source_page_url", NCKU_APOD_HOSTS, errors
        )
        if page_url and urlsplit(page_url).path != urlsplit(NCKU_APOD_URL).path:
            errors.append("apod: source_page_url must use the NCKU current APOD page")
        for key in ("source_image_url", "fetched_url"):
            media_url = _manifest_provider_url(
                provider, entry, key, NCKU_APOD_HOSTS, errors
            )
            if not media_url or snapshot_day is None:
                continue
            expected_folders = {
                snapshot_day.strftime("%y%m"),
                snapshot_day.strftime("%Y%m"),
            }
            media_path = urlsplit(media_url).path
            if not any(f"/image/{folder}/" in media_path for folder in expected_folders):
                errors.append(f"apod: {key} path does not match the entry month")

    return errors


def verify_entry(provider: str, entry: Any, *, base: Path | None = None) -> list[str]:
    if base is None:
        base = ROOT / "source"
    errors: list[str] = []
    if not isinstance(entry, dict):
        return [f"{provider}: manifest entry is not an object"]
    errors.extend(verify_provider_metadata(provider, entry))
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
            metadata_errors = verify_provider_metadata(provider, entry)
            if metadata_errors:
                raise SnapshotError("; ".join(metadata_errors))
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
