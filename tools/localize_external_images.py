#!/usr/bin/env python3
"""Download rendered external images and replace their references with local paths.

The site intentionally keeps ``post_asset_folder`` disabled.  Article assets are
stored under ``source/images/<Chinese category>/<legacy asset bucket>/`` while
their public URLs remain ``/images/<legacy asset bucket>/...``.  Chinese and
English partners share one bucket; the English post inherits both the category
and bucket from its ``translation_key``.  Other content gets a similarly stable,
page-oriented asset directory.

Only image *rendering* contexts are migrated.  Ordinary links to source material,
papers, image attribution pages, scripts, fonts, APIs, and comments are left alone.
Daily images whose URL is returned dynamically by an API are also outside this
static migration; see ``tools/EXTERNAL_IMAGES.md``.
"""

from __future__ import annotations

import argparse
import ast
import concurrent.futures
import dataclasses
import functools
import hashlib
import json
import mimetypes
import os
import re
import ssl
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable, Iterator


REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = REPO_ROOT / "source"
PUBLIC_ROOT = REPO_ROOT / "public"
MANIFEST_PATH = REPO_ROOT / "tools" / "external-images-manifest.json"
POST_ROOT = SOURCE_ROOT / "_posts"

UNCATEGORIZED_POST_SECTION = "未分类"
POST_ASSET_BUCKET_ALIASES = {
    "人工智能(AI) 通俗演义": "artificial-intelligence-intuitive-introduction",
    (
        "为何所有8位及以上的数都可以变为等式？"
        "——硅基-沉默整数平衡化定理及其证明简明介绍"
    ): "为何所有8位及以上的数都可以变为等式？",
}

TEXT_SUFFIXES = {
    ".md",
    ".markdown",
    ".html",
    ".htm",
    ".yml",
    ".yaml",
    ".json",
    ".js",
    ".mjs",
    ".css",
    ".styl",
    ".pug",
    ".ejs",
}

IMAGE_SUFFIX_RE = re.compile(
    r"\.(?:avif|bmp|gif|ico|jpe?g|jpgg|png|svg|tiff?|webp)$", re.IGNORECASE
)
ABSOLUTE_URL_RE = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
HTML_TAG_RE = re.compile(r"<[a-z][^>]*>", re.IGNORECASE | re.DOTALL)
HTML_ATTR_RE = re.compile(
    r"(?P<name>[\w:-]+)\s*=\s*(?:"
    r"(?P<quote>[\"'])(?P<quoted>.*?)(?P=quote)|"
    r"(?P<bare>[^\s>]+))",
    re.IGNORECASE | re.DOTALL,
)
MARKDOWN_IMAGE_RE = re.compile(
    r"!\[[^\n]*?\]\(\s*<?(?P<url>https?://[^\s)>]+)", re.IGNORECASE
)
CSS_URL_RE = re.compile(
    r"url\(\s*[\"']?(?P<url>https?://[^\s\"')]+)", re.IGNORECASE
)
FRONT_MATTER_RE = re.compile(
    r"\A(?:\ufeff)?---\s*\r?\n(?P<body>.*?)(?:\r?\n)---\s*(?:\r?\n|\Z)",
    re.DOTALL,
)
YAML_KEY_RE = re.compile(r"^\s*(?:-\s*)?(?P<key>[^:#][^:]*?)\s*:\s*(?P<value>.*)$")
IMAGE_KEY_RE = re.compile(
    r"(?:^|_)(?:avatar|background|banner|cover|favicon|header|hero|icon|image|img|"
    r"index_img|logo|poster|reward|screenshot|thumbnail|top_img)(?:$|_)",
    re.IGNORECASE,
)
MAX_IMAGE_BYTES = 100 * 1024 * 1024
DOWNLOAD_TIMEOUT_SECONDS = 50
DEFAULT_WORKERS = 6
OWNED_ASSET_NAME_RE = re.compile(
    r"^(?:(?:asset|cover)-[0-9a-f]{10}|fig-\d{3,}-[0-9a-f]{10})\."
    r"(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$",
    re.IGNORECASE,
)


@dataclasses.dataclass(frozen=True)
class Reference:
    file: Path
    start: int
    end: int
    url: str
    kind: str
    line: int


@dataclasses.dataclass(frozen=True)
class Scope:
    key: str
    local_dir: Path
    public_dir: str
    numbered: bool


@dataclasses.dataclass(frozen=True)
class PostAssetLocation:
    """Physical and public asset identity shared by a bilingual post pair."""

    source_key: str
    category: str
    bucket: str


@dataclasses.dataclass
class AssetPlan:
    url: str
    scope: Scope
    references: list[Reference]
    stem: str = ""
    expected_local_path: Path | None = None
    expected_sha256: str | None = None
    expected_size: int | None = None
    expected_mime_type: str | None = None
    expected_fetched_url: str | None = None


@dataclasses.dataclass
class DownloadedImage:
    path: Path
    extension: str
    mime_type: str
    sha256: str
    size: int
    fetched_url: str
    cached: bool = False


@dataclasses.dataclass
class AssetResult:
    plan: AssetPlan
    image: DownloadedImage
    public_path: str


class DownloadFailure(RuntimeError):
    pass


def repo_relative(path: Path) -> str:
    return path.resolve().relative_to(REPO_ROOT).as_posix()


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def normalize_url_token(token: str) -> str:
    """Trim punctuation that cannot be part of the matched rendering URL."""

    return token.rstrip(",;]}")


def url_has_image_suffix(url: str) -> bool:
    try:
        path = urllib.parse.urlsplit(url).path
    except ValueError:
        return False
    return bool(IMAGE_SUFFIX_RE.search(path))


def find_urls_in_span(
    *,
    file: Path,
    text: str,
    start: int,
    end: int,
    kind: str,
    require_image_suffix: bool = False,
) -> Iterator[Reference]:
    fragment = text[start:end]
    for match in ABSOLUTE_URL_RE.finditer(fragment):
        token = normalize_url_token(match.group(0))
        if require_image_suffix and not url_has_image_suffix(token):
            continue
        absolute_start = start + match.start()
        absolute_end = absolute_start + len(token)
        yield Reference(
            file=file,
            start=absolute_start,
            end=absolute_end,
            url=token,
            kind=kind,
            line=line_number(text, absolute_start),
        )


def scan_text(file: Path, text: str) -> list[Reference]:
    """Return external URLs used by actual static image-rendering contexts."""

    found: dict[tuple[int, int, str], Reference] = {}

    def add(ref: Reference) -> None:
        key = (ref.start, ref.end, ref.url)
        current = found.get(key)
        if current is None or ref.kind == "cover":
            found[key] = ref

    # HTML images plus the custom news-poster header consumed as an image by JS.
    for tag_match in HTML_TAG_RE.finditer(text):
        tag = tag_match.group(0)
        name_match = re.match(r"<\s*([\w:-]+)", tag)
        if not name_match:
            continue
        tag_name = name_match.group(1).lower()
        for attr_match in HTML_ATTR_RE.finditer(tag):
            attr_name = attr_match.group("name").lower()
            allowed = False
            if tag_name in {"img", "source"} and attr_name in {
                "src",
                "srcset",
                "data-src",
                "data-lazy-src",
            }:
                allowed = True
            elif tag_name == "video" and attr_name == "poster":
                allowed = True
            elif attr_name == "data-news60-header":
                allowed = True
            if not allowed:
                continue

            value = attr_match.group("quoted")
            if value is None:
                value = attr_match.group("bare") or ""
            value_start_in_tag = (
                attr_match.start("quoted")
                if attr_match.group("quoted") is not None
                else attr_match.start("bare")
            )
            value_start = tag_match.start() + value_start_in_tag
            for ref in find_urls_in_span(
                file=file,
                text=text,
                start=value_start,
                end=value_start + len(value),
                kind="html-image" if attr_name != "data-news60-header" else "data-image",
            ):
                add(ref)

    # Markdown image destinations, including nested brackets in alt text.
    for match in MARKDOWN_IMAGE_RE.finditer(text):
        url = normalize_url_token(match.group("url"))
        start = match.start("url")
        add(
            Reference(
                file=file,
                start=start,
                end=start + len(url),
                url=url,
                kind="markdown-image",
                line=line_number(text, start),
            )
        )

    # CSS and Butterfly's background: 'url(...)' configuration.
    for match in CSS_URL_RE.finditer(text):
        line_start = text.rfind("\n", 0, match.start()) + 1
        line_prefix = text[line_start : match.start()].lstrip()
        if file.suffix.lower() in {".yml", ".yaml"} and line_prefix.startswith("#"):
            continue
        url = normalize_url_token(match.group("url"))
        start = match.start("url")
        add(
            Reference(
                file=file,
                start=start,
                end=start + len(url),
                url=url,
                kind="css-image",
                line=line_number(text, start),
            )
        )

    # Markdown front matter.  Explicit image keys also cover endpoints without a
    # filename extension (for example the historical Bing cover URL).
    front_matter = FRONT_MATTER_RE.match(text)
    if front_matter:
        body_start = front_matter.start("body")
        body = front_matter.group("body")
        offset = 0
        for line in body.splitlines(keepends=True):
            plain = line.rstrip("\r\n")
            key_match = YAML_KEY_RE.match(plain)
            if key_match and not plain.lstrip().startswith("#"):
                key = key_match.group("key").strip()
                value_start = body_start + offset + key_match.start("value")
                value_end = body_start + offset + key_match.end("value")
                require_suffix = not bool(IMAGE_KEY_RE.search(key))
                for ref in find_urls_in_span(
                    file=file,
                    text=text,
                    start=value_start,
                    end=value_end,
                    kind="cover" if key.lower() == "cover" else "front-matter-image",
                    require_image_suffix=require_suffix,
                ):
                    add(ref)
            offset += len(line)

    # Standalone YAML is site data/config.  Any active URL with an image suffix
    # is an image value; image-named keys additionally support extensionless URLs.
    if file.suffix.lower() in {".yml", ".yaml"}:
        offset = 0
        for line in text.splitlines(keepends=True):
            plain = line.rstrip("\r\n")
            if plain.lstrip().startswith("#"):
                offset += len(line)
                continue
            # YAML comments begin after whitespace + '#'.  Do not mistake URLs
            # in explanatory comments (for example a gravatar documentation
            # link) for the value of an image-named key.
            active_plain = re.split(r"\s+#", plain, maxsplit=1)[0]
            # background: 'url(...)' is already handled by CSS_URL_RE and would
            # otherwise produce a second, closing-parenthesis-tainted match.
            if "url(" in active_plain.lower():
                offset += len(line)
                continue
            list_url_match = re.match(r"^\s*-\s+https?://", active_plain, re.IGNORECASE)
            key_match = None if list_url_match else YAML_KEY_RE.match(active_plain)
            key_is_image = bool(
                key_match and IMAGE_KEY_RE.search(key_match.group("key").strip())
            )
            span_start = offset
            if key_match:
                span_start = offset + key_match.start("value")
            for ref in find_urls_in_span(
                file=file,
                text=text,
                start=span_start,
                end=offset + len(active_plain),
                kind=(
                    "cover"
                    if key_match and key_match.group("key").strip().lower() == "cover"
                    else "yaml-image"
                ),
                require_image_suffix=not key_is_image,
            ):
                add(ref)
            offset += len(line)

    return sorted(found.values(), key=lambda ref: (ref.start, ref.end))


def discover_text_files() -> list[Path]:
    paths: set[Path] = set()
    for root in (SOURCE_ROOT, REPO_ROOT / "404"):
        if not root.exists():
            continue
        for path in root.rglob("*"):
            # Galleries are curated separately and intentionally keep their
            # current asset strategy.  Do not audit, download, or rewrite them.
            if path.is_relative_to(SOURCE_ROOT / "gallery"):
                continue
            if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES:
                paths.add(path)

    for path in (
        REPO_ROOT / "_config.yml",
        REPO_ROOT / "themes" / "butterfly" / "_config.yml",
    ):
        if path.exists():
            paths.add(path)

    return sorted(paths, key=lambda path: repo_relative(path).casefold())


def scan_repository() -> tuple[list[Reference], dict[Path, str]]:
    references: list[Reference] = []
    texts: dict[Path, str] = {}
    for file in discover_text_files():
        with file.open("r", encoding="utf-8", newline="") as handle:
            text = handle.read()
        refs = scan_text(file, text)
        if refs:
            texts[file] = text
            references.extend(refs)
    return references, texts


def front_matter_fields(file: Path) -> dict[str, str]:
    """Read the top-level scalar fields needed for post asset routing.

    The localization tool intentionally has no YAML dependency.  Current post
    routing fields are top-level scalars (or the empty ``[]`` taxonomy used by
    English posts), so a small front-matter reader is sufficient and keeps the
    tool usable in a fresh Python environment.
    """

    text = file.read_text(encoding="utf-8-sig")
    match = FRONT_MATTER_RE.match(text)
    if not match:
        raise RuntimeError(f"post has no readable front matter: {repo_relative(file)}")

    fields: dict[str, str] = {}
    for line in match.group("body").splitlines():
        key_match = YAML_KEY_RE.match(line)
        if not key_match:
            continue
        key = key_match.group("key").strip()
        if key in {"category", "categories", "lang", "translation_key"}:
            fields[key] = key_match.group("value").strip()
    return fields


def decode_front_matter_value(raw: str | None) -> object | None:
    """Decode the limited scalar/list syntax used by routing front matter."""

    if raw is None:
        return None
    value = raw.strip()
    if not value or value.lower() in {"null", "none", "~"}:
        return None
    try:
        return ast.literal_eval(value)
    except (SyntaxError, ValueError):
        # Plain YAML scalars such as ``lang: en`` are not Python literals.
        return value


def single_post_category(fields: dict[str, str], file: Path) -> str:
    raw = fields.get("categories", fields.get("category"))
    decoded = decode_front_matter_value(raw)
    if decoded is None or decoded == []:
        return UNCATEGORIZED_POST_SECTION
    if isinstance(decoded, (list, tuple)):
        categories = [str(item).strip() for item in decoded if str(item).strip()]
    else:
        categories = [str(decoded).strip()]
    if len(categories) != 1:
        raise RuntimeError(
            f"post must have exactly one directory category: {repo_relative(file)}"
        )
    return categories[0]


def string_front_matter_value(fields: dict[str, str], key: str) -> str:
    value = decode_front_matter_value(fields.get(key))
    return "" if value is None else str(value).strip()


@functools.lru_cache(maxsize=1)
def post_asset_locations() -> dict[Path, PostAssetLocation]:
    """Index every post and resolve English files through ``translation_key``."""

    if not POST_ROOT.is_dir():
        return {}

    locations: dict[Path, PostAssetLocation] = {}
    chinese_by_key: dict[str, PostAssetLocation] = {}
    english_posts: list[tuple[Path, str]] = []

    post_files = sorted(
        POST_ROOT.rglob("*.md"), key=lambda path: path.as_posix().casefold()
    )
    for file in post_files:
        fields = front_matter_fields(file)
        language = string_front_matter_value(fields, "lang").lower()
        translation_key = string_front_matter_value(fields, "translation_key")
        is_english = language == "en" or language.startswith("en-")
        if is_english:
            if not translation_key:
                raise RuntimeError(
                    f"English post is missing translation_key: {repo_relative(file)}"
                )
            english_posts.append((file.resolve(), translation_key))
            continue

        source_key = file.stem
        if source_key in chinese_by_key:
            raise RuntimeError(f"duplicate Chinese post key: {source_key}")
        location = PostAssetLocation(
            source_key=source_key,
            category=single_post_category(fields, file),
            bucket=POST_ASSET_BUCKET_ALIASES.get(source_key, source_key),
        )
        chinese_by_key[source_key] = location
        locations[file.resolve()] = location

    for file, translation_key in english_posts:
        location = chinese_by_key.get(translation_key)
        if location is None:
            raise RuntimeError(
                "English translation_key does not name a Chinese post: "
                f"{repo_relative(file)} -> {translation_key}"
            )
        locations[file] = location

    return locations


def post_asset_location(file: Path) -> PostAssetLocation:
    location = post_asset_locations().get(file.resolve())
    if location is None:
        raise RuntimeError(f"post is missing from asset index: {repo_relative(file)}")
    return location


def post_category_names() -> set[str]:
    return {location.category for location in post_asset_locations().values()}


def scope_for(file: Path) -> Scope:
    relative = file.resolve().relative_to(REPO_ROOT).as_posix()

    if relative.startswith("source/_posts/"):
        location = post_asset_location(file)
        return Scope(
            key=f"post:{location.source_key}",
            local_dir=(
                SOURCE_ROOT / "images" / location.category / location.bucket
            ),
            public_dir=f"/images/{location.bucket}",
            numbered=True,
        )

    if relative == "source/_data/apc_news.yml":
        return Scope(
            key="apc-news",
            local_dir=SOURCE_ROOT / "images" / "apc-news",
            public_dir="/images/apc-news",
            numbered=False,
        )

    if relative in {"source/_data/link.yml", "source/link/index.md"}:
        return Scope(
            key="link",
            local_dir=SOURCE_ROOT / "link" / "assets" / "images",
            public_dir="/link/assets/images",
            numbered=False,
        )

    if relative == "themes/butterfly/_config.yml" or relative == "_config.yml":
        return Scope(
            key="site-theme",
            local_dir=REPO_ROOT / "themes" / "butterfly" / "source" / "img" / "site",
            public_dir="/img/site",
            numbered=False,
        )

    # No current image falls through here, but the deterministic site bucket
    # keeps the script safe for future standalone pages and source data files.
    return Scope(
        key="site-content",
        local_dir=SOURCE_ROOT / "images" / "site-content",
        public_dir="/images/site-content",
        numbered=False,
    )


def empty_manifest_payload() -> dict:
    return {
        "version": 1,
        "scope": (
            "Fixed image-rendering references; daily API snapshots are tracked "
            "separately in source/images/daily/daily-images.json."
        ),
        "managed_directories": [],
        "images": [],
    }


def parse_manifest_payload(raw: bytes | None) -> dict:
    if raw is None:
        return empty_manifest_payload()
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"cannot read existing manifest: {exc}") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("images"), list):
        raise RuntimeError("existing manifest must contain an images list")
    return payload


def load_manifest_snapshot() -> tuple[bytes | None, dict]:
    try:
        raw = MANIFEST_PATH.read_bytes() if MANIFEST_PATH.exists() else None
    except OSError as exc:
        raise RuntimeError(f"cannot read existing manifest: {exc}") from exc
    return raw, parse_manifest_payload(raw)


def load_manifest_payload() -> dict:
    return load_manifest_snapshot()[1]


def build_plans(references: list[Reference]) -> list[AssetPlan]:
    grouped: dict[tuple[str, str], list[Reference]] = defaultdict(list)
    scopes: dict[str, Scope] = {}
    for ref in references:
        scope = scope_for(ref.file)
        scopes[scope.key] = scope
        grouped[(scope.key, ref.url)].append(ref)

    plans: list[AssetPlan] = []
    for (scope_key, url), refs in grouped.items():
        plans.append(
            AssetPlan(
                url=url,
                scope=scopes[scope_key],
                references=sorted(
                    refs,
                    key=lambda ref: (repo_relative(ref.file).casefold(), ref.start),
                ),
            )
        )

    plans.sort(
        key=lambda plan: (
            plan.scope.key.casefold(),
            repo_relative(plan.references[0].file).casefold(),
            plan.references[0].start,
            plan.url,
        )
    )

    # Incremental runs must preserve old paths and continue numbering after the
    # largest existing figure.  Without this, a future one-image update would
    # start at fig-001 again and could duplicate an already-localized URL.
    numbered_counters: Counter[str] = Counter()
    existing_entries: dict[tuple[str, str], dict] = {}
    manifest = load_manifest_payload()
    scope_by_local_dir = {
        repo_relative(scope.local_dir): scope for scope in scopes.values()
    }
    for entry in manifest["images"]:
        local_path = entry.get("local_path")
        source_url = entry.get("source_url")
        if not isinstance(local_path, str) or not isinstance(source_url, str):
            continue
        parent = Path(local_path).parent.as_posix()
        scope = scope_by_local_dir.get(parent)
        if scope is None:
            continue
        existing_entries[(scope.key, source_url)] = entry
        match = re.match(r"fig-(\d+)-", Path(local_path).name, re.IGNORECASE)
        if match:
            numbered_counters[scope.key] = max(
                numbered_counters[scope.key], int(match.group(1))
            )

    for plan in plans:
        existing_entry = existing_entries.get((plan.scope.key, plan.url))
        if existing_entry:
            local_path = existing_entry["local_path"]
            plan.stem = Path(local_path).stem
            plan.expected_local_path = REPO_ROOT / Path(local_path)
            plan.expected_sha256 = existing_entry.get("sha256")
            plan.expected_size = existing_entry.get("bytes")
            plan.expected_mime_type = existing_entry.get("mime_type")
            plan.expected_fetched_url = existing_entry.get("fetched_url")
            continue
        short_hash = hashlib.sha256(plan.url.encode("utf-8")).hexdigest()[:10]
        if plan.scope.numbered:
            if any(ref.kind == "cover" for ref in plan.references):
                plan.stem = f"cover-{short_hash}"
            else:
                numbered_counters[plan.scope.key] += 1
                plan.stem = f"fig-{numbered_counters[plan.scope.key]:03d}-{short_hash}"
        else:
            plan.stem = f"asset-{short_hash}"

    return plans


def sniff_image(header: bytes, content_type: str = "") -> tuple[str, str] | None:
    if header.startswith(b"\xff\xd8\xff"):
        return ".jpg", "image/jpeg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png", "image/png"
    if header.startswith((b"GIF87a", b"GIF89a")):
        return ".gif", "image/gif"
    if header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return ".webp", "image/webp"
    if header.startswith(b"BM"):
        return ".bmp", "image/bmp"
    if header.startswith((b"II*\x00", b"MM\x00*")):
        return ".tiff", "image/tiff"
    if header.startswith(b"\x00\x00\x01\x00"):
        return ".ico", "image/x-icon"
    if len(header) >= 12 and header[4:8] == b"ftyp" and header[8:12] in {
        b"avif",
        b"avis",
    }:
        return ".avif", "image/avif"

    sample = header[:65536].lstrip(b"\xef\xbb\xbf\x00\t\r\n ")
    lowered = sample.lower()
    if b"<svg" in lowered[:8192] and not lowered.startswith((b"<!doctype html", b"<html")):
        return ".svg", "image/svg+xml"

    mime = content_type.split(";", 1)[0].strip().lower()
    if mime.startswith("image/"):
        guessed = mimetypes.guess_extension(mime)
        if guessed == ".jpe":
            guessed = ".jpg"
        if guessed and IMAGE_SUFFIX_RE.search(guessed):
            return guessed, mime
    return None


def corrected_url_candidates(original_url: str) -> list[tuple[str, str | None]]:
    """Return (URL, Referer) candidates in safest order for known image hosts."""

    candidates: list[tuple[str, str | None]] = []

    def add(url: str, referer: str | None = None) -> None:
        pair = (url, referer)
        if pair not in candidates:
            candidates.append(pair)

    parsed = urllib.parse.urlsplit(original_url)
    host = (parsed.hostname or "").lower()

    # A historical typo in the Stone gallery is recoverable at the origin.  The
    # page now reuses an existing local copy, but retaining the fallback makes the
    # downloader robust if the URL is encountered elsewhere.
    if parsed.path.lower().endswith(".jpgg"):
        corrected_path = parsed.path[:-1]
        add(urllib.parse.urlunsplit(parsed._replace(path=corrected_path)))

    # Jetpack Photon URLs embed the real origin host as the first path segment.
    if re.fullmatch(r"i\d+\.wp\.com", host):
        stripped = parsed.path.lstrip("/")
        if "/" in stripped:
            inner_host, inner_path = stripped.split("/", 1)
            direct = urllib.parse.urlunsplit(
                ("https", inner_host, "/" + inner_path, parsed.query, "")
            )
            add(direct)
            if inner_host.endswith(".sinaimg.cn"):
                add(direct, "https://weibo.com/")
                for index in range(1, 5):
                    alternate = urllib.parse.urlunsplit(
                        ("https", f"wx{index}.sinaimg.cn", "/" + inner_path, parsed.query, "")
                    )
                    add(alternate)
                    add(alternate, "https://weibo.com/")

    if host.endswith(".sinaimg.cn"):
        add(original_url)
        add(original_url, "https://weibo.com/")
        for index in range(1, 5):
            alternate = urllib.parse.urlunsplit(
                parsed._replace(netloc=f"wx{index}.sinaimg.cn")
            )
            add(alternate)
            add(alternate, "https://weibo.com/")

    add(original_url)
    return candidates


def response_content_type(response: object) -> str:
    headers = getattr(response, "headers", None)
    if headers is None:
        return ""
    return headers.get("Content-Type", "")


def read_response_to_temp(response: object, target: Path) -> tuple[int, str, bytes]:
    declared = getattr(response, "headers", {}).get("Content-Length")
    if declared:
        try:
            if int(declared) > MAX_IMAGE_BYTES:
                raise DownloadFailure(f"declared size exceeds {MAX_IMAGE_BYTES} bytes")
        except ValueError:
            pass

    digest = hashlib.sha256()
    total = 0
    header = bytearray()
    with target.open("wb") as handle:
        while True:
            chunk = response.read(1024 * 256)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_IMAGE_BYTES:
                raise DownloadFailure(f"download exceeds {MAX_IMAGE_BYTES} bytes")
            digest.update(chunk)
            if len(header) < 65536:
                header.extend(chunk[: 65536 - len(header)])
            handle.write(chunk)
    if total == 0:
        raise DownloadFailure("empty response")
    return total, digest.hexdigest(), bytes(header)


def valid_cached_file(path: Path) -> DownloadedImage | None:
    try:
        with path.open("rb") as handle:
            header = handle.read(65536)
        sniffed = sniff_image(header)
        if not sniffed:
            return None
        extension, mime_type = sniffed
        if path.suffix.lower() != extension:
            return None
        digest = hashlib.sha256()
        size = 0
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                size += len(chunk)
                digest.update(chunk)
        return DownloadedImage(
            path=path,
            extension=extension,
            mime_type=mime_type,
            sha256=digest.hexdigest(),
            size=size,
            fetched_url="",
            cached=True,
        )
    except OSError:
        return None


def validate_manifest_cache(plan: AssetPlan, image: DownloadedImage) -> None:
    """Refuse to bless a changed manifested asset during an incremental run."""

    if plan.expected_sha256 is None:
        return
    mismatches: list[str] = []
    if image.sha256 != plan.expected_sha256:
        mismatches.append("SHA-256")
    if plan.expected_size is not None and image.size != plan.expected_size:
        mismatches.append("size")
    if (
        plan.expected_mime_type is not None
        and image.mime_type != plan.expected_mime_type
    ):
        mismatches.append("MIME type")
    if mismatches:
        relative = (
            repo_relative(plan.expected_local_path)
            if plan.expected_local_path is not None
            else plan.stem
        )
        raise DownloadFailure(
            f"manifested cache changed ({', '.join(mismatches)}): {relative}; "
            "run assets:check and restore the original bytes"
        )


def download_plan(plan: AssetPlan, temp_root: Path) -> DownloadedImage:
    plan.scope.local_dir.mkdir(parents=True, exist_ok=True)
    if plan.expected_local_path is not None:
        cached = valid_cached_file(plan.expected_local_path)
        if cached:
            validate_manifest_cache(plan, cached)
            cached.fetched_url = plan.expected_fetched_url or plan.url
            return cached
        if plan.expected_local_path.exists():
            raise DownloadFailure(
                f"manifested cache is not a valid image: "
                f"{repo_relative(plan.expected_local_path)}"
            )

    for candidate in sorted(plan.scope.local_dir.glob(plan.stem + ".*")):
        cached = valid_cached_file(candidate)
        if cached:
            validate_manifest_cache(plan, cached)
            return cached

    failures: list[str] = []
    request_candidates = corrected_url_candidates(plan.url)
    ssl_context = ssl.create_default_context()

    for round_index in range(3):
        for candidate_url, referer in request_candidates:
            headers = {
                "User-Agent": "APC-ScienceUnion-image-localizer/1.0",
                "Accept": "*/*",
            }
            if referer:
                headers["Referer"] = referer
            request = urllib.request.Request(candidate_url, headers=headers)
            temp_path = temp_root / (
                hashlib.sha256(
                    f"{plan.scope.key}\0{plan.url}\0{round_index}\0{candidate_url}\0{referer}".encode(
                        "utf-8"
                    )
                ).hexdigest()
                + ".part"
            )
            try:
                with urllib.request.urlopen(
                    request,
                    timeout=DOWNLOAD_TIMEOUT_SECONDS,
                    context=ssl_context,
                ) as response:
                    status = getattr(response, "status", 200)
                    if status not in {200, 206}:
                        raise DownloadFailure(f"HTTP {status}")
                    content_type = response_content_type(response)
                    size, sha256, header = read_response_to_temp(response, temp_path)
                    sniffed = sniff_image(header, content_type)
                    if not sniffed:
                        preview = header[:80].decode("utf-8", errors="replace").replace("\n", " ")
                        raise DownloadFailure(
                            f"not an image ({content_type or 'unknown'}; {preview!r})"
                        )
                    extension, mime_type = sniffed
                    final_path = plan.scope.local_dir / f"{plan.stem}{extension}"
                    downloaded = DownloadedImage(
                        path=final_path,
                        extension=extension,
                        mime_type=mime_type,
                        sha256=sha256,
                        size=size,
                        fetched_url=response.geturl(),
                    )
                    validate_manifest_cache(plan, downloaded)
                    if final_path.exists():
                        existing = valid_cached_file(final_path)
                        if existing and existing.sha256 == sha256:
                            temp_path.unlink(missing_ok=True)
                            existing.fetched_url = response.geturl()
                            return existing
                        raise DownloadFailure(f"target collision: {repo_relative(final_path)}")
                    os.replace(temp_path, final_path)
                    return downloaded
            except (OSError, urllib.error.URLError, urllib.error.HTTPError, DownloadFailure) as exc:
                temp_path.unlink(missing_ok=True)
                failures.append(f"{candidate_url} [{referer or 'no referer'}]: {exc}")

        if round_index < 2:
            time.sleep(0.8 * (round_index + 1))

    detail = failures[-6:]
    raise DownloadFailure("; ".join(detail))


def encode_public_path(path: str) -> str:
    # Encoding makes the same root path safe in Markdown destinations, HTML
    # attributes, CSS url(), and unquoted YAML scalars (notably post names with
    # spaces or ASCII parentheses).
    return urllib.parse.quote(path, safe="/-._~")


def download_all(plans: list[AssetPlan], workers: int) -> tuple[list[AssetResult], list[tuple[AssetPlan, str]]]:
    results: list[AssetResult] = []
    failures: list[tuple[AssetPlan, str]] = []
    print_lock = threading.Lock()
    completed = 0

    temp_parent = REPO_ROOT / "tmp"
    temp_parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="external-images-", dir=temp_parent) as temp_dir:
        temp_root = Path(temp_dir)
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_plan = {
                executor.submit(download_plan, plan, temp_root): plan for plan in plans
            }
            for future in concurrent.futures.as_completed(future_to_plan):
                plan = future_to_plan[future]
                try:
                    image = future.result()
                    raw_public = f"{plan.scope.public_dir}/{image.path.name}"
                    results.append(
                        AssetResult(
                            plan=plan,
                            image=image,
                            public_path=encode_public_path(raw_public),
                        )
                    )
                except Exception as exc:  # noqa: BLE001 - every failed URL is reported.
                    failures.append((plan, str(exc)))
                with print_lock:
                    completed += 1
                    if completed % 25 == 0 or completed == len(plans):
                        print(
                            f"downloaded/checked {completed}/{len(plans)} assets "
                            f"({len(failures)} failed)",
                            flush=True,
                        )

    results.sort(
        key=lambda result: (
            result.plan.scope.key.casefold(),
            result.plan.references[0].file.as_posix().casefold(),
            result.plan.references[0].start,
        )
    )
    failures.sort(key=lambda item: (item[0].scope.key, item[0].url))
    return results, failures


def read_utf8_text(path: Path) -> str:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return handle.read()


def build_replacement_updates(
    results: list[AssetResult], texts: dict[Path, str]
) -> tuple[dict[Path, tuple[bytes | None, bytes]], dict[Path, str]]:
    replacements: dict[Path, list[tuple[int, int, str, str]]] = defaultdict(list)
    for result in results:
        for ref in result.plan.references:
            replacements[ref.file].append(
                (ref.start, ref.end, ref.url, result.public_path)
            )

    updates: dict[Path, tuple[bytes | None, bytes]] = {}
    projected_texts: dict[Path, str] = {}
    for file, items in sorted(
        replacements.items(), key=lambda item: repo_relative(item[0]).casefold()
    ):
        text = texts.get(file)
        if text is None:
            raise RuntimeError(f"missing source snapshot: {repo_relative(file)}")
        current = read_utf8_text(file)
        if current != text:
            raise RuntimeError(
                f"source changed during download: {repo_relative(file)}"
            )
        original_text = text
        for start, end, original, replacement in sorted(items, reverse=True):
            if text[start:end] != original:
                raise RuntimeError(
                    f"source changed before replacement: {repo_relative(file)}:{line_number(text, start)}"
                )
            text = text[:start] + replacement + text[end:]

        updates[file] = (
            original_text.encode("utf-8"),
            text.encode("utf-8"),
        )
        projected_texts[file] = text

    return updates, projected_texts


def reserve_sibling_path(path: Path, suffix: str) -> Path:
    descriptor, raw_path = tempfile.mkstemp(
        prefix=f".{path.name}.external-images-",
        suffix=suffix,
        dir=path.parent,
    )
    os.close(descriptor)
    reserved = Path(raw_path)
    reserved.unlink()
    return reserved


def atomic_replace_bytes(
    updates: dict[Path, tuple[bytes | None, bytes]],
) -> None:
    """Commit a set of files together, restoring every original on failure."""

    ordered = sorted(
        updates.items(),
        key=lambda item: (
            item[0] == MANIFEST_PATH,
            repo_relative(item[0]).casefold(),
        ),
    )

    def actual_bytes(path: Path) -> bytes | None:
        return path.read_bytes() if path.exists() else None

    for path, (expected, _replacement) in ordered:
        if actual_bytes(path) != expected:
            raise RuntimeError(f"file changed before commit: {repo_relative(path)}")

    temporaries: dict[Path, Path] = {}
    backups: list[tuple[Path, Path | None]] = []
    commit_succeeded = False
    try:
        for path, (expected, replacement) in ordered:
            temporary = reserve_sibling_path(path, ".tmp")
            with temporary.open("wb") as handle:
                handle.write(replacement)
                handle.flush()
                os.fsync(handle.fileno())
            if expected is not None and path.exists():
                os.chmod(temporary, path.stat().st_mode)
            temporaries[path] = temporary

        # Close the download/edit race before making the first visible change.
        for path, (expected, _replacement) in ordered:
            if actual_bytes(path) != expected:
                raise RuntimeError(
                    f"file changed while preparing commit: {repo_relative(path)}"
                )

        for path, (expected, _replacement) in ordered:
            backup: Path | None = None
            if expected is not None:
                backup = reserve_sibling_path(path, ".bak")
                os.replace(path, backup)
            backups.append((path, backup))
            os.replace(temporaries[path], path)
        commit_succeeded = True
    except Exception as commit_error:
        recovery_errors: list[str] = []
        for path, backup in reversed(backups):
            try:
                if backup is None:
                    path.unlink(missing_ok=True)
                else:
                    os.replace(backup, path)
            except OSError as recovery_error:
                recovery_errors.append(
                    f"{repo_relative(path)} (backup retained at {backup}): "
                    f"{recovery_error}"
                )
        if recovery_errors:
            raise RuntimeError(
                "localization commit failed and rollback was incomplete; "
                "do not delete the listed backups:\n- "
                + "\n- ".join(recovery_errors)
            ) from commit_error
        raise
    finally:
        for temporary in temporaries.values():
            try:
                temporary.unlink(missing_ok=True)
            except OSError as cleanup_error:
                print(
                    f"warning: could not remove temporary file {temporary}: "
                    f"{cleanup_error}",
                    file=sys.stderr,
                )
        if commit_succeeded:
            for _path, backup in backups:
                if backup is None:
                    continue
                try:
                    backup.unlink(missing_ok=True)
                except OSError as cleanup_error:
                    print(
                        f"warning: committed successfully but could not remove "
                        f"backup {backup}: {cleanup_error}",
                        file=sys.stderr,
                    )


def replace_references(results: list[AssetResult], texts: dict[Path, str]) -> None:
    updates, _projected_texts = build_replacement_updates(results, texts)
    atomic_replace_bytes(updates)


def merge_manifest_entries(existing: list[dict], additions: list[dict]) -> list[dict]:
    """Merge incremental results without discarding earlier provenance."""

    merged: dict[str, dict] = {}
    for entry in existing:
        local_path = entry.get("local_path")
        if isinstance(local_path, str) and local_path:
            merged[local_path] = entry

    for addition in additions:
        local_path = addition["local_path"]
        previous = merged.get(local_path)
        if previous:
            # A cached incremental reuse did not make a new network request; keep
            # the original resolved URL instead of replacing it with a guess.
            if addition.get("fetched_url") == addition.get("source_url"):
                addition["fetched_url"] = previous.get(
                    "fetched_url", addition["fetched_url"]
                )
        merged[local_path] = addition

    return sorted(
        merged.values(), key=lambda entry: entry["local_path"].casefold()
    )


def manifest_additions(results: list[AssetResult]) -> list[dict]:
    additions = []
    for result in results:
        refs_by_file: Counter[str] = Counter(
            repo_relative(ref.file) for ref in result.plan.references
        )
        additions.append(
            {
                "source_url": result.plan.url,
                "fetched_url": result.image.fetched_url or result.plan.url,
                "local_path": repo_relative(result.image.path),
                "public_path": result.public_path,
                "mime_type": result.image.mime_type,
                "bytes": result.image.size,
                "sha256": result.image.sha256,
                "references": [
                    {"file": file, "count": count}
                    for file, count in sorted(refs_by_file.items())
                ],
            }
        )
    return additions


def collect_manifest_reference_counts(
    images: list[dict], projected_texts: dict[Path, str] | None = None
) -> dict[str, Counter[str]]:
    public_paths = {
        entry.get("public_path")
        for entry in images
        if isinstance(entry.get("public_path"), str) and entry.get("public_path")
    }
    counts = {public_path: Counter() for public_path in public_paths}
    if not public_paths:
        return counts

    matcher = re.compile(
        "|".join(re.escape(path) for path in sorted(public_paths, key=len, reverse=True))
    )
    overrides = projected_texts or {}
    for file in discover_text_files():
        text = overrides.get(file)
        if text is None:
            text = read_utf8_text(file)
        relative = repo_relative(file)
        for match in matcher.finditer(text):
            counts[match.group(0)][relative] += 1
    return counts


def refresh_manifest_references(
    images: list[dict], projected_texts: dict[Path, str] | None = None
) -> None:
    counts = collect_manifest_reference_counts(images, projected_texts)
    for entry in images:
        per_file = counts.get(entry.get("public_path"), Counter())
        entry["references"] = [
            {"file": file, "count": count}
            for file, count in sorted(per_file.items())
        ]


def prepare_manifest_update(
    results: list[AssetResult], projected_texts: dict[Path, str] | None = None
) -> tuple[bytes | None, bytes]:
    original, payload = load_manifest_snapshot()
    additions = manifest_additions(results)

    payload["version"] = 1
    payload["scope"] = (
        "Fixed image-rendering references; daily API snapshots are tracked "
        "separately in source/images/daily/daily-images.json."
    )
    payload["images"] = merge_manifest_entries(payload["images"], additions)
    managed_directories = {
        directory
        for directory in payload.get("managed_directories", [])
        if isinstance(directory, str) and directory
    }
    managed_directories.update(
        str(Path(entry["local_path"]).parent).replace("\\", "/")
        for entry in payload["images"]
        if isinstance(entry.get("local_path"), str) and entry["local_path"]
    )
    payload["managed_directories"] = sorted(
        managed_directories, key=str.casefold
    )
    refresh_manifest_references(payload["images"], projected_texts)
    replacement = (
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")
    return original, replacement


def write_manifest(results: list[AssetResult]) -> None:
    original, replacement = prepare_manifest_update(results)
    atomic_replace_bytes({MANIFEST_PATH: (original, replacement)})


def refresh_manifest_only() -> int:
    """Refresh source-reference provenance without touching image bytes."""

    references, _ = scan_repository()
    if references:
        print(
            "cannot refresh manifest while rendered external-image references remain",
            file=sys.stderr,
        )
        for ref in references[:30]:
            print(f"  {repo_relative(ref.file)}:{ref.line}: {ref.url}", file=sys.stderr)
        if len(references) > 30:
            print(f"  ... and {len(references) - 30} more", file=sys.stderr)
        return 1

    # Verify all existing files and hashes before rewriting provenance.  This
    # prevents a modified local image from being silently accepted by a
    # reference-only maintenance operation.
    errors = verify_manifest()
    non_reference_errors = [
        error for error in errors if not error.startswith("reference mismatch:")
    ]
    if non_reference_errors:
        print("manifest refresh refused:", file=sys.stderr)
        for error in non_reference_errors:
            print(error, file=sys.stderr)
        return 1

    original, replacement = prepare_manifest_update([])
    if original == replacement:
        print("manifest references are already current")
        return 0
    atomic_replace_bytes({MANIFEST_PATH: (original, replacement)})
    print("refreshed manifest references; image files and image hashes were unchanged")
    return 0


def commit_localization(results: list[AssetResult], texts: dict[Path, str]) -> None:
    updates, projected_texts = build_replacement_updates(results, texts)
    original_manifest, replacement_manifest = prepare_manifest_update(
        results, projected_texts
    )
    updates[MANIFEST_PATH] = (original_manifest, replacement_manifest)
    atomic_replace_bytes(updates)


def print_audit(references: list[Reference], plans: list[AssetPlan]) -> None:
    affected_files = {ref.file for ref in references}
    hosts = Counter(urllib.parse.urlsplit(plan.url).hostname or "" for plan in plans)
    print(
        f"found {len(references)} rendered external-image references outside galleries, "
        f"{len(plans)} scoped assets, {len(affected_files)} files"
    )
    for host, count in hosts.most_common(12):
        print(f"  {count:4d}  {host}")


def expected_public_path(local_path: str) -> str | None:
    normalized = local_path.replace("\\", "/")
    article_image_prefix = "source/images/"
    if normalized.startswith(article_image_prefix):
        relative = normalized.removeprefix(article_image_prefix)
        parts = relative.split("/")
        # Article images are grouped physically by the Chinese category, but
        # the published path deliberately omits that organizational layer so
        # existing links and caches remain valid.  Requiring category/bucket/
        # file avoids mistaking a legacy flat bucket for a category.
        if len(parts) >= 3 and parts[0] in post_category_names():
            return encode_public_path("/images/" + "/".join(parts[1:]))
    if normalized.startswith("source/"):
        return encode_public_path("/" + normalized.removeprefix("source/"))
    theme_prefix = "themes/butterfly/source/"
    if normalized.startswith(theme_prefix):
        return encode_public_path("/" + normalized.removeprefix(theme_prefix))
    return None


def discover_owned_asset_paths(managed_directories: Iterable[str]) -> set[str]:
    owned: set[str] = set()
    for relative in managed_directories:
        root = (REPO_ROOT / Path(relative)).resolve()
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and OWNED_ASSET_NAME_RE.fullmatch(path.name):
                owned.add(repo_relative(path))
    return owned


def verify_manifest() -> list[str]:
    errors: list[str] = []
    if not MANIFEST_PATH.exists():
        return [f"missing manifest: {repo_relative(MANIFEST_PATH)}"]
    try:
        payload = parse_manifest_payload(MANIFEST_PATH.read_bytes())
    except (OSError, RuntimeError) as exc:
        return [f"cannot read manifest: {exc}"]

    images = payload.get("images")
    if not isinstance(images, list):
        return ["manifest images must be a list"]

    managed_directories = payload.get("managed_directories")
    if managed_directories is None:
        # Backward-compatible migration for the original v1 manifest.  Once
        # written, this inventory remains independent from the image entries so
        # deleting an entire entry/directory from the manifest is detectable.
        managed_directories = sorted(
            {
                str(Path(entry.get("local_path", "")).parent).replace("\\", "/")
                for entry in images
                if isinstance(entry, dict)
                and isinstance(entry.get("local_path"), str)
                and entry.get("local_path")
            },
            key=str.casefold,
        )
    if not isinstance(managed_directories, list):
        return ["manifest managed_directories must be a list"]

    allowed_roots = tuple(
        root.resolve()
        for root in (
            SOURCE_ROOT / "images",
            SOURCE_ROOT / "link" / "assets" / "images",
            REPO_ROOT / "themes" / "butterfly" / "source" / "img" / "site",
        )
    )
    valid_managed_directories: list[str] = []
    for relative in managed_directories:
        if not isinstance(relative, str) or not relative:
            errors.append(f"invalid managed asset directory: {relative!r}")
            continue
        directory = (REPO_ROOT / Path(relative)).resolve()
        if not any(
            directory == allowed or directory.is_relative_to(allowed)
            for allowed in allowed_roots
        ):
            errors.append(f"managed asset directory is outside scope: {relative}")
            continue
        valid_managed_directories.append(relative)

    seen_paths: set[str] = set()
    seen_public_paths: set[str] = set()
    manifest_reference_counts: dict[str, Counter[str]] = {}
    for entry in images:
        if not isinstance(entry, dict):
            errors.append("manifest image entry must be an object")
            continue
        relative = entry.get("local_path", "")
        if not isinstance(relative, str) or not relative or relative in seen_paths:
            errors.append(f"duplicate or empty manifest path: {relative!r}")
            continue
        seen_paths.add(relative)
        path = (REPO_ROOT / Path(relative)).resolve()
        try:
            path.relative_to(REPO_ROOT.resolve())
        except ValueError:
            errors.append(f"manifest path leaves repository: {relative}")
            continue
        if relative.startswith("source/gallery/"):
            errors.append(f"gallery asset is outside manifest scope: {relative}")

        public_path = entry.get("public_path")
        if not isinstance(public_path, str) or not public_path:
            errors.append(f"missing public path: {relative}")
            public_path = ""
        elif public_path in seen_public_paths:
            errors.append(f"duplicate public path: {public_path}")
        else:
            seen_public_paths.add(public_path)
        expected_public = expected_public_path(relative)
        if public_path and public_path != expected_public:
            errors.append(
                f"public/local path mismatch: {relative} -> {public_path!r} "
                f"(expected {expected_public!r})"
            )

        expected_refs: Counter[str] = Counter()
        references = entry.get("references")
        if not isinstance(references, list):
            errors.append(f"references must be a list: {relative}")
        else:
            for reference in references:
                if not isinstance(reference, dict):
                    errors.append(f"invalid reference entry: {relative}")
                    continue
                ref_file = reference.get("file")
                count = reference.get("count")
                if (
                    not isinstance(ref_file, str)
                    or not ref_file
                    or not isinstance(count, int)
                    or isinstance(count, bool)
                    or count < 1
                ):
                    errors.append(f"invalid reference entry: {relative}")
                    continue
                if ref_file.startswith("source/gallery/"):
                    errors.append(f"gallery reference is outside manifest scope: {ref_file}")
                expected_refs[ref_file] += count
        if public_path:
            manifest_reference_counts[public_path] = expected_refs

        if not path.is_file():
            errors.append(f"missing image: {relative}")
            continue
        cached = valid_cached_file(path)
        if not cached:
            errors.append(f"invalid image: {relative}")
            continue
        if cached.size != entry.get("bytes"):
            errors.append(f"size mismatch: {relative}")
        if cached.sha256 != entry.get("sha256"):
            errors.append(f"sha256 mismatch: {relative}")
        if cached.mime_type != entry.get("mime_type"):
            errors.append(f"MIME mismatch: {relative}")

    try:
        actual_reference_counts = collect_manifest_reference_counts(images)
    except (OSError, UnicodeError, re.error) as exc:
        errors.append(f"cannot verify source references: {exc}")
        actual_reference_counts = {}
    for public_path, expected_refs in manifest_reference_counts.items():
        actual_refs = actual_reference_counts.get(public_path, Counter())
        if actual_refs != expected_refs:
            errors.append(
                f"reference mismatch: {public_path} "
                f"(manifest {sum(expected_refs.values())}, source {sum(actual_refs.values())})"
            )
    unmanifested = sorted(
        discover_owned_asset_paths(valid_managed_directories) - seen_paths
    )
    for relative in unmanifested[:30]:
        errors.append(f"localized asset missing from manifest: {relative}")
    if len(unmanifested) > 30:
        errors.append(
            f"... and {len(unmanifested) - 30} more localized assets missing from manifest"
        )
    return errors


def verify_public_manifest() -> list[str]:
    errors: list[str] = []
    if not PUBLIC_ROOT.is_dir():
        return ["missing generated public directory; run the site build first"]
    try:
        payload = parse_manifest_payload(MANIFEST_PATH.read_bytes())
    except (OSError, RuntimeError) as exc:
        return [f"cannot read manifest: {exc}"]

    for entry in payload["images"]:
        public_path = entry.get("public_path")
        if not isinstance(public_path, str) or not public_path.startswith("/"):
            continue
        relative = urllib.parse.unquote(public_path).lstrip("/")
        generated = (PUBLIC_ROOT / Path(relative)).resolve()
        try:
            generated.relative_to(PUBLIC_ROOT.resolve())
        except ValueError:
            errors.append(f"public path leaves generated directory: {public_path}")
            continue
        if not generated.is_file():
            errors.append(f"missing generated image: {public_path}")
            continue
        cached = valid_cached_file(generated)
        if not cached:
            errors.append(f"invalid generated image: {public_path}")
            continue
        if cached.size != entry.get("bytes"):
            errors.append(f"generated size mismatch: {public_path}")
        if cached.sha256 != entry.get("sha256"):
            errors.append(f"generated SHA-256 mismatch: {public_path}")
        if cached.mime_type != entry.get("mime_type"):
            errors.append(f"generated MIME mismatch: {public_path}")
    return errors


def check_repository(*, check_public: bool = False) -> int:
    references, _ = scan_repository()
    errors: list[str] = []
    if references:
        errors.append(
            f"{len(references)} rendered external-image references remain in "
            f"{len({ref.file for ref in references})} files"
        )
        for ref in references[:30]:
            errors.append(f"  {repo_relative(ref.file)}:{ref.line}: {ref.url}")
        if len(references) > 30:
            errors.append(f"  ... and {len(references) - 30} more")

    errors.extend(verify_manifest())
    if check_public:
        errors.extend(verify_public_manifest())
    if errors:
        print("external image check failed:", file=sys.stderr)
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    payload = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    total_bytes = sum(int(entry["bytes"]) for entry in payload["images"])
    target = "source and generated copies" if check_public else "source copies"
    print(
        f"external image check passed: {len(payload['images'])} manifested images, "
        f"{total_bytes / 1024 / 1024:.1f} MiB ({target})"
    )
    return 0


def parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="verify references and manifest")
    mode.add_argument(
        "--check-public",
        action="store_true",
        help="also verify generated files are byte-for-byte copies",
    )
    mode.add_argument(
        "--refresh-references",
        action="store_true",
        help="refresh manifest source-reference counts without touching image files",
    )
    mode.add_argument("--dry-run", action="store_true", help="audit without downloading or editing")
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_WORKERS,
        help=f"parallel downloads (default: {DEFAULT_WORKERS})",
    )
    return parser.parse_args(argv)


def main(argv: Iterable[str] | None = None) -> int:
    args = parse_args(argv)
    if args.workers < 1 or args.workers > 16:
        print("--workers must be between 1 and 16", file=sys.stderr)
        return 2
    if args.check:
        return check_repository()
    if args.check_public:
        return check_repository(check_public=True)
    if args.refresh_references:
        return refresh_manifest_only()

    references, texts = scan_repository()
    plans = build_plans(references)
    print_audit(references, plans)
    if args.dry_run:
        return 0
    if not plans:
        return check_repository()

    results, failures = download_all(plans, args.workers)
    if failures:
        print(f"\n{len(failures)} assets could not be localized:", file=sys.stderr)
        for plan, error in failures:
            first = plan.references[0]
            print(
                f"- {repo_relative(first.file)}:{first.line}\n"
                f"  {plan.url}\n"
                f"  {error}",
                file=sys.stderr,
            )
        print(
            "Downloaded files were kept as a resumable cache; source references were not changed.",
            file=sys.stderr,
        )
        return 1

    commit_localization(results, texts)
    print(
        f"localized {len(references)} references into {len(results)} image files; "
        f"manifest: {repo_relative(MANIFEST_PATH)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
