#!/usr/bin/env python3
"""Build the local “科技史上的今天” JSON and long-poster snapshot.

Scheduled runs use Qwen's forced web-search/web-extractor mode to *propose*
events and short source-language excerpts. This program then retrieves every
URL and applies deterministic gates to the source class, the calendar date,
and the presence of those excerpts. Those gates are useful evidence checks;
they are intentionally not described as a substitute for semantic historical
review.

A separately reviewed research file can be published with
``--review-mode human-curated``. Its audit sidecar records that review mode and
does not pretend its Chinese evidence notes were verbatim webpage matches.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
import ipaddress
import json
import os
import re
import struct
import subprocess
import sys
import tempfile
import time
import unicodedata
import uuid
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import requests


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "source" / "ScienceHistory"
PUBLIC_JSON = OUTPUT_DIR / "science_today.json"
PUBLIC_POSTER = OUTPUT_DIR / "science_today.png"
AUDIT_FILE = ROOT / "tools" / "science_history" / "sources" / "science_today.sources.json"
RENDERER = ROOT / "tools" / "science_history" / "list_poster.mjs"
NOBEL_SCRIPT = ROOT / "tools" / "science_history" / "nobel_anniversaries.py"
TIMEZONE = "Asia/Shanghai"
FOOTER = ["图像制作：格物社/A.P.C.科学联盟", "灵感赖渊：缪卿九 "]
DECK = "从观测、实验到公共卫生，用一张图快速回看知识如何生长。"
QWEN_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
QWEN_MODEL = os.environ.get("SCIENCE_HISTORY_MODEL", "qwen3-max")
USER_AGENT = "APC-Science-History/2.0 (+https://apc-science.cn/)"
MAX_PAGE_BYTES = 5 * 1024 * 1024
STRONG_CLAIMS = ("首次", "首个", "第一", "唯一", "最大", "证明", "证实", "治愈", "first", "largest", "only")
MONTHS = (
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
)
MONTH_ABBR = ("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec")

# These are source-policy categories, not a claim that every page on a listed
# host is authoritative. The prompt and audit still record the institution and
# evidence for per-event review.
A_HOST_SUFFIXES = {
    "nobelprize.org", "nasa.gov", "nih.gov", "nlm.nih.gov", "cdc.gov",
    "si.edu", "loc.gov", "archives.gov", "uspto.gov", "usgs.gov",
    "noaa.gov", "nist.gov", "energy.gov", "royalsociety.org", "ieee.org",
    "acm.org", "acs.org", "aps.org", "aip.org", "apa.org", "aeaweb.org",
    "nationalarchives.gov.uk", "who.int", "unesco.org", "wipo.int",
    "epo.org", "cern.ch", "esa.int", "eso.org", "iau.org", "isro.gov.in",
    "darwinproject.ac.uk", "nature.com", "science.org", "pnas.org",
    "academic.oup.com", "cambridge.org", "springer.com", "link.springer.com",
    "sciencedirect.com", "thelancet.com", "nejm.org", "bmj.com", "jamanetwork.com",
    "onlinelibrary.wiley.com", "tandfonline.com", "doi.org",
    "royalsocietypublishing.org", "journals.aps.org",
}
B_HOST_SUFFIXES = {
    "sciencehistory.org", "hsm.ox.ac.uk", "history.aip.org", "britannica.com",
    "nationalacademies.org", "computerhistory.org",
}
BLOCKED_HOST_SUFFIXES = {
    "baidu.com", "baike.baidu.com", "sogou.com", "so.com", "360doc.com",
    "douyin.com", "toutiao.com", "163.com", "sohu.com", "ithome.com",
    "wikipedia.org", "wikimedia.org", "github.com", "reddit.com",
}


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.hidden = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in {"script", "style", "noscript", "svg"}:
            self.hidden += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"script", "style", "noscript", "svg"} and self.hidden:
            self.hidden -= 1

    def handle_data(self, data: str) -> None:
        if not self.hidden:
            self.parts.append(data)


def today_shanghai() -> date:
    return datetime.now(ZoneInfo(TIMEZONE)).date()


def parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise SystemExit("--date 必须使用 YYYY-MM-DD") from exc


def normalized_quote(value: str) -> str:
    value = unicodedata.normalize("NFKC", html.unescape(str(value))).casefold()
    return "".join(char for char in value if char.isalnum())


def has_month_day(value: str, target: date) -> bool:
    text = unicodedata.normalize("NFKC", value).casefold()
    month = target.month
    day = target.day
    patterns = [
        rf"(?<!\d)0?{month}\s*月\s*0?{day}\s*日",
        rf"(?<!\d)\d{{3,4}}\s*[-/.]\s*0?{month}\s*[-/.]\s*0?{day}(?!\d)",
        rf"\b{MONTHS[month - 1]}\s+0?{day}(?:st|nd|rd|th)?\b",
        rf"\b{MONTH_ABBR[month - 1]}\.?\s+0?{day}(?:st|nd|rd|th)?\b",
        rf"\b0?{day}(?:st|nd|rd|th)?\s+(?:of\s+)?{MONTHS[month - 1]}\b",
        rf"\b0?{day}\s+{MONTH_ABBR[month - 1]}\.?\b",
    ]
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)


def has_event_date(value: str, target: date, event_year: int) -> bool:
    if not has_month_day(value, target):
        return False
    text = unicodedata.normalize("NFKC", value).casefold()
    year = abs(event_year)
    if not re.search(rf"(?<!\d){year}(?!\d)", text):
        return False
    has_bce_marker = bool(re.search(r"公元前|\bb\.?c\.?e?\.?\b", text))
    return has_bce_marker if event_year < 0 else not has_bce_marker


def has_source_date(value: str, target: date, event_year: int, context: str) -> bool:
    if context == "event-date":
        return has_event_date(value, target, event_year)
    if context == "timezone-crosscheck":
        return any(
            has_event_date(value, target + timedelta(days=offset), event_year)
            for offset in (-1, 1)
        )
    return False


def hostname_allowed(url: str, level: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        return False
    host = parsed.hostname.lower().rstrip(".")
    try:
        address = ipaddress.ip_address(host)
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:
            return False
    except ValueError:
        pass
    if host == "localhost" or any(host == item or host.endswith("." + item) for item in BLOCKED_HOST_SUFFIXES):
        return False
    if level == "A":
        if any(host == item or host.endswith("." + item) for item in A_HOST_SUFFIXES):
            return True
        labels = host.split(".")
        return (
            host.endswith(".gov")
            or ".gov." in host
            or host.endswith(".edu")
            or ".edu." in host
            or any(part == "ac" for part in labels[-3:-1])
        )
    return hostname_allowed(url, "A") or any(
        host == item or host.endswith("." + item) for item in B_HOST_SUFFIXES
    )


def safe_url(url: str, level: str) -> str:
    clean = str(url or "").strip()
    if not hostname_allowed(clean, level):
        raise ValueError(f"不符合 {level} 级来源域名/URL 门禁")
    return clean


def fetch_page(url: str) -> dict[str, Any]:
    response = requests.get(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json,text/plain,application/pdf;q=0.8"},
        timeout=(20, 60),
        allow_redirects=True,
        stream=True,
    )
    response.raise_for_status()
    final_url = response.url
    # Redirects must not escape to a blocked/private destination. The final
    # publisher can be different from a DOI resolver, so accept A or B here.
    if not (hostname_allowed(final_url, "A") or hostname_allowed(final_url, "B")):
        raise ValueError("来源重定向到不允许的域名")
    chunks: list[bytes] = []
    size = 0
    for chunk in response.iter_content(64 * 1024):
        if not chunk:
            continue
        size += len(chunk)
        if size > MAX_PAGE_BYTES:
            raise ValueError("来源页面超过抓取上限")
        chunks.append(chunk)
    body = b"".join(chunks)
    content_type = response.headers.get("content-type", "").lower()
    if "pdf" in content_type or body.startswith(b"%PDF"):
        visible = ""
    else:
        encoding = response.encoding or "utf-8"
        try:
            decoded = body.decode(encoding, errors="replace")
        except LookupError:
            decoded = body.decode("utf-8", errors="replace")
        if "html" in content_type or "<html" in decoded[:1000].lower():
            parser = VisibleText()
            parser.feed(decoded)
            visible = " ".join(parser.parts)
        else:
            visible = decoded
    return {
        "url": final_url,
        "status": response.status_code,
        "content_type": content_type.split(";", 1)[0],
        "sha256": hashlib.sha256(body).hexdigest(),
        "text": re.sub(r"\s+", " ", visible).strip(),
    }


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"无法读取 JSON：{path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError("顶层 JSON 必须是对象")
    return value


def extract_json(text: str) -> dict[str, Any]:
    clean = text.strip()
    clean = re.sub(r"^```(?:json)?\s*", "", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\s*```$", "", clean)
    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        start, end = clean.find("{"), clean.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("Qwen 没有返回 JSON 对象")
        result = json.loads(clean[start : end + 1])
    if not isinstance(result, dict):
        raise ValueError("Qwen JSON 顶层必须是对象")
    return result


def run_nobel_candidates(target: date) -> dict[str, Any]:
    command = [sys.executable, str(NOBEL_SCRIPT), "--month", str(target.month), "--day", str(target.day)]
    result = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8", timeout=120)
    return json.loads(result.stdout)


def research_prompt(target: date, nobel: dict[str, Any]) -> str:
    iso = target.isoformat()
    month_name = MONTHS[target.month - 1].title()
    return f"""你是严谨的科技史研究编辑。目标是北京时间 {iso}，只研究历史上 {month_name} {target.day} 当天。

请强制联网，逐条打开真实来源页面后，提出 20—24 个候选。范围包括自然科学、医学与公共卫生、数学、社会科学、科研仪器、数据库、研究机构和科学制度史；排除纯政治、战争、娱乐、商业和日期传说。不要把申请、公开、授权或演示混为一谈。人物生卒只是补充，最终不得超过三分之一。

每个候选至少需要一个 A 级来源：原始论文/专利/档案，Nobel、NASA、NIH、NLM、CDC、Smithsonian、Library of Congress、国家档案，专业学会、大学档案、研究机构、医院、博物馆或实验室正式页面。普通百科、媒体历史日历、搜索摘要、AI摘要不能作为来源。若使用“首次、首个、第一、唯一、最大、证明、治愈”等强断言，必须给第二个独立 A/B 级来源；否则降级措辞。

每个来源必须给 URL，以及来源页面原语言的短摘录 `date_quote` 和 `fact_quote`：`date_quote` 必须逐字包含事件的完整年月日，`fact_quote` 逐字证明核心事实；每段不超过 12 个英文单词或 35 个汉字，不得翻译、改写或只复述搜索摘要。默认 `date_context` 为 `event-date`。只有同一瞬间因 UTC/当地时区跨日且正文明确解释时，辅助来源才可标 `timezone-crosscheck` 并使用相邻一天；每条仍必须至少一条 A 源直接证明目标月日。脚本会重新下载页面并匹配摘录。每条中文 text 为自然的 45—90 个汉字，短、准，不写模板标签。按重要性给 importance 1—5。

只返回一个 JSON 对象，禁止 Markdown：
{{"date":"{iso}","timezone":"Asia/Shanghai","items":[{{"label":"YYYY年","title":"短标题","text":"45—90字","category":"science|medicine|social-science|institution|instrument|person","person_event":false,"importance":5,"sources":[{{"url":"https://...","level":"A","authority_type":"official archive","date_context":"event-date","date_quote":"source-language verbatim quote","fact_quote":"source-language verbatim quote"}}]}}]}}

Nobel 官方 API 给出的当天人物候选如下；它们仅供发现线索，不能自动视为已核验，也不能主导整期：
{json.dumps(nobel, ensure_ascii=False, separators=(',', ':'))}
"""


def call_qwen(target: date, api_key: str) -> dict[str, Any]:
    payload = {
        "model": QWEN_MODEL,
        "messages": [
            {"role": "system", "content": "你是科技史研究编辑，只输出严格 JSON。"},
            {"role": "user", "content": research_prompt(target, run_nobel_candidates(target))},
        ],
        "temperature": 0.1,
        "stream": True,
        "enable_thinking": True,
        "enable_search": True,
        "search_options": {
            "forced_search": True,
            "enable_source": True,
            "search_strategy": "agent_max",
        },
    }
    error: Exception | None = None
    for attempt in range(3):
        parts: list[str] = []
        try:
            with requests.post(
                QWEN_ENDPOINT,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=(30, 900),
                stream=True,
            ) as response:
                response.raise_for_status()
                response.encoding = "utf-8"
                for raw_line in response.iter_lines(decode_unicode=True):
                    if not raw_line:
                        continue
                    line = str(raw_line).strip()
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if data == "[DONE]":
                        break
                    chunk = json.loads(data)
                    for choice in chunk.get("choices") or []:
                        content = (choice.get("delta") or {}).get("content")
                        # Do not concatenate reasoning_content: only the final
                        # answer is a candidate dataset.
                        if isinstance(content, str):
                            parts.append(content)
            if not parts:
                raise ValueError("Qwen 流式响应没有 final content")
            return extract_json("".join(parts))
        except Exception as exc:  # network/API response; retry as one unit
            error = exc
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"Qwen 联网研究失败：{error}")


def label_year(label: str) -> int:
    text = unicodedata.normalize("NFKC", label.strip()).lower()
    match = re.search(r"\d{1,4}", text)
    if not match:
        raise ValueError("label 缺少年份")
    year = int(match.group())
    if any(token in text for token in ("公元前", "bc", "bce")):
        year = -year
    return year


def is_strong(item: dict[str, Any]) -> bool:
    content = (str(item.get("title") or "") + " " + str(item.get("text") or "")).casefold()
    return any(claim in content for claim in STRONG_CLAIMS)


def source_hosts_independent(sources: Iterable[dict[str, Any]]) -> int:
    known = sorted(A_HOST_SUFFIXES | B_HOST_SUFFIXES, key=len, reverse=True)
    multi_level = ("ac.uk", "gov.uk", "edu.au", "gov.au", "edu.cn", "ac.cn", "ac.jp", "gc.ca")

    def institution(source: dict[str, Any]) -> str:
        url = str(source.get("final_url") or source.get("url") or "")
        host = (urlparse(url).hostname or "").lower().rstrip(".")
        for suffix in known:
            if host == suffix or host.endswith("." + suffix):
                return suffix
        labels = host.split(".")
        if any(host.endswith("." + suffix) or host == suffix for suffix in multi_level):
            return ".".join(labels[-3:]) if len(labels) >= 3 else host
        return ".".join(labels[-2:]) if len(labels) >= 2 else host

    return len({institution(source) for source in sources if institution(source)})


def validate_source_shape(source: Any) -> dict[str, Any]:
    if not isinstance(source, dict):
        raise ValueError("source 必须是对象")
    level = str(source.get("level") or source.get("grade") or "").upper()
    if level not in {"A", "B"}:
        raise ValueError("source.level 必须是 A 或 B")
    url = safe_url(str(source.get("url") or ""), level)
    return {**source, "level": level, "url": url}


def validate_item_shape(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValueError("条目必须是对象")
    label = str(raw.get("label") or "").strip()
    title = str(raw.get("title") or "").strip()
    text = str(raw.get("text") or "").strip()
    if not label or not title or not text:
        raise ValueError("缺少 label/title/text")
    year = label_year(label)
    if len(title) > 60:
        raise ValueError("title 超过 60 字")
    if not 45 <= len(text) <= 90:
        raise ValueError(f"text 应为 45—90 字，实际 {len(text)}")
    sources = [validate_source_shape(source) for source in raw.get("sources") or []]
    if not sources or not any(source["level"] == "A" for source in sources):
        raise ValueError("每条至少需要一个 A 级来源")
    item = {
        **raw,
        "label": label,
        "title": title,
        "text": text,
        "sources": sources,
        "_year": year,
        "person_event": (
            bool(raw.get("person_event"))
            or str(raw.get("category") or "") == "person"
            or any(marker in title + text for marker in ("出生", "逝世", "去世"))
        ),
        "importance": max(1, min(5, int(raw.get("importance") or 3))),
    }
    if is_strong(item) and source_hosts_independent(sources) < 2:
        raise ValueError("强断言缺少独立第二 A/B 来源")
    return item


def validate_automated_sources(items: list[dict[str, Any]], target: date) -> list[dict[str, Any]]:
    urls = sorted({source["url"] for item in items for source in item["sources"]})
    pages: dict[str, dict[str, Any] | Exception] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_page, url): url for url in urls}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                pages[url] = future.result()
            except Exception as exc:
                pages[url] = exc

    accepted: list[dict[str, Any]] = []
    for item in items:
        validated: list[dict[str, Any]] = []
        for source in item["sources"]:
            page = pages[source["url"]]
            if isinstance(page, Exception) or not page.get("text"):
                continue
            date_quote = str(source.get("date_quote") or "").strip()
            fact_quote = str(source.get("fact_quote") or "").strip()
            date_context = str(source.get("date_context") or "event-date").strip()
            if not (8 <= len(normalized_quote(date_quote)) <= 180 and 8 <= len(normalized_quote(fact_quote)) <= 240):
                continue
            page_text = normalized_quote(str(page["text"]))
            if normalized_quote(date_quote) not in page_text or normalized_quote(fact_quote) not in page_text:
                continue
            if not has_source_date(date_quote, target, int(item["_year"]), date_context):
                continue
            validated.append(
                {
                    "level": source["level"],
                    "url": source["url"],
                    "final_url": page["url"],
                    "authority_type": str(source.get("authority_type") or "").strip(),
                    "date_context": date_context,
                    "date_quote": date_quote,
                    "fact_quote": fact_quote,
                    "retrieved_sha256": page["sha256"],
                    "content_type": page["content_type"],
                }
            )
        if not any(
            source["level"] == "A" and source["date_context"] == "event-date"
            for source in validated
        ):
            continue
        if is_strong(item) and source_hosts_independent(validated) < 2:
            continue
        accepted.append({**item, "sources": validated})
    return accepted


def validate_human_sources(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    accepted: list[dict[str, Any]] = []
    for item in items:
        sources: list[dict[str, Any]] = []
        for source in item["sources"]:
            date_quote = str(source.get("date_quote") or "").strip()
            fact_quote = str(source.get("fact_quote") or "").strip()
            date_context = str(source.get("date_context") or "event-date").strip()
            if not date_quote or not fact_quote:
                raise ValueError(f"人工审校条目“{item['title']}”的来源缺少逐字 date_quote/fact_quote")
            if not has_source_date(
                date_quote,
                date.fromisoformat(str(item.get("_target_date"))),
                int(item["_year"]),
                date_context,
            ):
                raise ValueError(f"人工审校条目“{item['title']}”的 date_quote 不含完整事件日期")
            sources.append(
                {
                    "level": source["level"],
                    "url": source["url"],
                    "date_context": date_context,
                    "date_quote": date_quote,
                    "fact_quote": fact_quote,
                    "evidence_note": str(source.get("evidence") or "").strip(),
                }
            )
        if not any(
            source["level"] == "A" and source["date_context"] == "event-date"
            for source in sources
        ):
            raise ValueError(f"人工审校条目“{item['title']}”缺少直接证明目标月日的 A 级来源")
        accepted.append({**item, "sources": sources})
    return accepted


def curate_items(payload: dict[str, Any], target: date, review_mode: str) -> list[dict[str, Any]]:
    if payload.get("date") and payload.get("date") != target.isoformat():
        raise ValueError("候选 JSON 日期与目标日期不一致")
    if payload.get("timezone") and payload.get("timezone") != TIMEZONE:
        raise ValueError("候选 JSON 时区必须是 Asia/Shanghai")
    raw_items = payload.get("items")
    if not isinstance(raw_items, list):
        raise ValueError("候选 JSON 缺少 items 数组")
    shaped: list[dict[str, Any]] = []
    rejected: list[str] = []
    for index, raw in enumerate(raw_items):
        try:
            shaped.append(validate_item_shape(raw))
        except Exception as exc:
            rejected.append(f"#{index + 1}: {exc}")
    if rejected:
        print("候选结构门禁剔除：" + "；".join(rejected), file=sys.stderr)
    for item in shaped:
        item["_target_date"] = target.isoformat()
    if review_mode == "human-curated":
        accepted = validate_human_sources(shaped)
    else:
        accepted = validate_automated_sources(shaped, target)

    # Prefer more important candidates before the 20-item cap, then restore
    # the required chronological presentation order.
    accepted.sort(key=lambda item: (-item["importance"], item["_year"], item["title"]))
    accepted = accepted[:20]
    accepted.sort(key=lambda item: (item["_year"], item["title"]))
    while len(accepted) >= 15 and sum(bool(item["person_event"]) for item in accepted) > len(accepted) // 3:
        remove_at = max(index for index, item in enumerate(accepted) if item["person_event"])
        accepted.pop(remove_at)
    fingerprints: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in accepted:
        fingerprint = normalized_quote(item["title"] + item["text"])
        if fingerprint not in fingerprints:
            fingerprints.add(fingerprint)
            unique.append(item)
    if not unique:
        raise ValueError("没有条目通过来源与内容门禁；保留上一份快照")
    if len(unique) < 15:
        print(f"警告：仅 {len(unique)} 条通过核验，按技能规则以实际条数出图。", file=sys.stderr)
    return unique


def public_payload(target: date, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "version": 1,
        "date": target.isoformat(),
        "timezone": TIMEZONE,
        "kicker": "SCIENCE HISTORY",
        "title": "科技史上的今天",
        "subtitle": f"{target.year}年{target.month}月{target.day}日（{target.isoformat()}） · {len(items)}条科学坐标",
        "theme": "history",
        "deck": DECK,
        "poster": "/ScienceHistory/science_today.png",
        "items": [{"label": item["label"], "title": item["title"], "text": item["text"]} for item in items],
        "footer": FOOTER,
    }


def audit_payload(target: date, items: list[dict[str, Any]], mode: str) -> dict[str, Any]:
    if mode == "human-curated":
        validation = (
            "人工审校输入：date_quote/fact_quote 是编辑从来源中核对的短原文；"
            "脚本校验目标月日、HTTPS、来源级别/域名、双源规则与公开快照结构，"
            "不把 evidence_note 的中文摘要冒充网页逐字匹配。"
        )
    else:
        validation = (
            "自动取证门禁已重新抓取每个 URL，并匹配短的来源原文 date_quote/fact_quote 与目标月日。"
            "该门禁不等于自动完成全部语义史学论证，旁路信息保留供复核。"
        )
    return {
        "version": 1,
        "date": target.isoformat(),
        "timezone": TIMEZONE,
        "review_mode": mode,
        "model": None if mode == "human-curated" else QWEN_MODEL,
        "validation_scope": validation,
        "items": [
            {
                "label": item["label"],
                "title": item["title"],
                "text": item["text"],
                "item_sha256": hashlib.sha256(
                    json.dumps(
                        {"label": item["label"], "title": item["title"], "text": item["text"]},
                        ensure_ascii=False,
                        sort_keys=True,
                        separators=(",", ":"),
                    ).encode("utf-8")
                ).hexdigest(),
                "strong_claim": is_strong(item),
                "person_event": bool(item["person_event"]),
                "sources": item["sources"],
            }
            for item in items
        ],
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def canonical_json_bytes(payload: dict[str, Any]) -> bytes:
    """Serialize JSON deterministically without platform newline conversion.

    ``Path.write_text`` translates ``\n`` to CRLF on Windows, while GitHub
    Actions checks the repository out with LF.  Snapshot integrity should
    therefore bind the parsed JSON document, not the workstation's newline
    convention.  Binary poster files remain byte-for-byte hashed below.
    """
    return (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def canonical_json_sha256(payload: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json_bytes(payload)).hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        header = handle.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"不是有效 PNG：{path}")
    return struct.unpack(">II", header[16:24])


def renderer_environment() -> dict[str, str]:
    """Let the unmodified skill renderer use an installed Windows browser.

    Puppeteer's normal managed-browser lookup remains authoritative everywhere
    else.  This fallback only addresses Windows workstations where dependency
    install scripts were skipped but Chrome or Edge is already available.
    """
    environment = os.environ.copy()
    if os.name != "nt" or environment.get("PUPPETEER_EXECUTABLE_PATH"):
        return environment

    candidates: list[Path] = []
    for variable, suffixes in (
        (
            "PROGRAMFILES",
            ("Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe"),
        ),
        (
            "PROGRAMFILES(X86)",
            ("Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe"),
        ),
        (
            "LOCALAPPDATA",
            ("Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe"),
        ),
    ):
        base = environment.get(variable)
        if base:
            candidates.extend(Path(base) / suffix for suffix in suffixes)

    discovered = next((path for path in candidates if path.is_file()), None)
    if discovered is None:
        command = shutil.which("chrome") or shutil.which("msedge")
        discovered = Path(command) if command else None
    if discovered is not None:
        environment["PUPPETEER_EXECUTABLE_PATH"] = str(discovered)
    return environment


def validate_public_json(payload: dict[str, Any]) -> None:
    required = {"version", "date", "timezone", "kicker", "title", "subtitle", "theme", "deck", "poster", "items", "footer"}
    if set(payload) != required:
        raise ValueError(f"公开 JSON 字段不符，缺少/多出：{sorted(set(payload) ^ required)}")
    date.fromisoformat(str(payload["date"]))
    if payload["timezone"] != TIMEZONE or payload["title"] != "科技史上的今天" or payload["theme"] != "history":
        raise ValueError("公开 JSON 的时区、标题或主题不正确")
    if payload["poster"] != "/ScienceHistory/science_today.png" or payload["footer"] != FOOTER:
        raise ValueError("公开 JSON 的海报路径或固定署名不正确")
    items = payload["items"]
    if not isinstance(items, list) or not 1 <= len(items) <= 20:
        raise ValueError("公开 JSON items 数量必须为 1—20")
    years: list[int] = []
    for item in items:
        if not isinstance(item, dict) or set(item) != {"label", "title", "text"}:
            raise ValueError("公开 item 只能包含 label/title/text")
        years.append(label_year(str(item["label"])))
        if not 45 <= len(str(item["text"]).strip()) <= 90:
            raise ValueError("公开 item.text 不在 45—90 字")
    if years != sorted(years):
        raise ValueError("公开 items 未按年份升序")

    def strings(value: Any) -> Iterable[str]:
        if isinstance(value, str):
            yield value
        elif isinstance(value, dict):
            for key, child in value.items():
                if "source" in str(key).lower() or str(key).lower() in {"url", "citation"}:
                    raise ValueError("公开 JSON 不得含来源字段")
                yield from strings(child)
        elif isinstance(value, list):
            for child in value:
                yield from strings(child)

    for value in strings(payload):
        if re.search(r"(?:https?:)?//", value, re.IGNORECASE):
            raise ValueError("公开 JSON 不得含外部 URL")


def validate_audit(audit: dict[str, Any], public: dict[str, Any], *, require_snapshot_hashes: bool = True) -> None:
    if audit.get("date") != public["date"] or audit.get("timezone") != TIMEZONE:
        raise ValueError("来源旁路与公开快照日期/时区不一致")
    mode = audit.get("review_mode")
    if mode not in {"human-curated", "automated-retrieval-gates"}:
        raise ValueError("来源旁路 review_mode 不受支持")
    target = date.fromisoformat(public["date"])
    audit_items = audit.get("items")
    if not isinstance(audit_items, list) or len(audit_items) != len(public["items"]):
        raise ValueError("来源旁路与公开条目数量不一致")
    for index, (internal, visible) in enumerate(zip(audit_items, public["items"], strict=True), start=1):
        if internal.get("label") != visible["label"] or internal.get("title") != visible["title"]:
            raise ValueError(f"来源旁路第 {index} 条与公开条目不一致")
        if internal.get("text") != visible["text"]:
            raise ValueError(f"来源旁路第 {index} 条正文与公开条目不一致")
        canonical = json.dumps(visible, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
        if internal.get("item_sha256") != hashlib.sha256(canonical).hexdigest():
            raise ValueError(f"来源旁路第 {index} 条摘要哈希不一致")
        sources = internal.get("sources") or []
        if not any(str(source.get("level")).upper() == "A" for source in sources if isinstance(source, dict)):
            raise ValueError(f"来源旁路第 {index} 条缺少 A 级来源")
        if internal.get("strong_claim") and source_hosts_independent(sources) < 2:
            raise ValueError(f"来源旁路第 {index} 条强断言缺少独立第二来源")
        event_year = label_year(str(internal["label"]))
        for source in sources:
            normalized = validate_source_shape(source)
            date_quote = str(normalized.get("date_quote") or "").strip()
            fact_quote = str(normalized.get("fact_quote") or "").strip()
            date_context = str(normalized.get("date_context") or "event-date").strip()
            if not date_quote or not fact_quote or not has_source_date(date_quote, target, event_year, date_context):
                raise ValueError(f"来源旁路第 {index} 条缺少含完整事件日期的逐字证据")
            if mode == "automated-retrieval-gates":
                final_url = str(normalized.get("final_url") or "")
                if not (hostname_allowed(final_url, "A") or hostname_allowed(final_url, "B")):
                    raise ValueError(f"来源旁路第 {index} 条 final_url 不符合来源域门禁")
                if not re.fullmatch(r"[0-9a-f]{64}", str(normalized.get("retrieved_sha256") or "")):
                    raise ValueError(f"来源旁路第 {index} 条缺少抓取内容哈希")
        if not any(
            str(source.get("level") or "").upper() == "A"
            and str(source.get("date_context") or "event-date") == "event-date"
            for source in sources
            if isinstance(source, dict)
        ):
            raise ValueError(f"来源旁路第 {index} 条缺少直接证明目标月日的 A 级来源")
    if require_snapshot_hashes:
        if not re.fullmatch(r"[0-9a-f]{64}", str(audit.get("public_json_sha256") or "")):
            raise ValueError("来源旁路缺少公开 JSON 哈希")
        if not re.fullmatch(r"[0-9a-f]{64}", str(audit.get("poster_sha256") or "")):
            raise ValueError("来源旁路缺少长图哈希")
        if not isinstance(audit.get("poster_bytes"), int) or audit["poster_bytes"] <= 0:
            raise ValueError("来源旁路缺少长图字节数")


def check_snapshot(public_dir: Path | None = None) -> None:
    public = read_json(PUBLIC_JSON)
    audit = read_json(AUDIT_FILE)
    validate_public_json(public)
    validate_audit(audit, public)
    if audit["public_json_sha256"] != canonical_json_sha256(public):
        raise ValueError("公开 JSON 与来源旁路记录的哈希不一致")
    if audit["poster_sha256"] != hashlib.sha256(PUBLIC_POSTER.read_bytes()).hexdigest():
        raise ValueError("科技史长图与来源旁路记录的哈希不一致")
    if audit["poster_bytes"] != PUBLIC_POSTER.stat().st_size:
        raise ValueError("科技史长图字节数与来源旁路不一致")
    width, height = png_dimensions(PUBLIC_POSTER)
    if width < 720 or height < 900 or PUBLIC_POSTER.stat().st_size <= 0:
        raise ValueError("科技史长图尺寸或文件大小异常")
    if audit.get("poster_dimensions") != {"width": width, "height": height}:
        raise ValueError("科技史长图尺寸与来源旁路记录不一致")
    if public_dir is not None:
        built_json = public_dir / "ScienceHistory" / "science_today.json"
        built_poster = public_dir / "ScienceHistory" / "science_today.png"
        if built_json.read_bytes() != PUBLIC_JSON.read_bytes() or built_poster.read_bytes() != PUBLIC_POSTER.read_bytes():
            raise ValueError("构建产物与 source/ScienceHistory 权威快照字节不一致")


def transactional_publish(staged: list[tuple[Path, Path]]) -> None:
    backups: list[tuple[Path, Path]] = []
    published: list[Path] = []
    try:
        for source, destination in staged:
            destination.parent.mkdir(parents=True, exist_ok=True)
            if destination.exists():
                backup = destination.with_name(destination.name + f".backup-{uuid.uuid4().hex}")
                os.replace(destination, backup)
                backups.append((backup, destination))
            os.replace(source, destination)
            published.append(destination)
    except Exception:
        for destination in reversed(published):
            destination.unlink(missing_ok=True)
        for backup, destination in reversed(backups):
            if backup.exists():
                os.replace(backup, destination)
        raise
    else:
        for backup, _ in backups:
            try:
                backup.unlink(missing_ok=True)
            except OSError:
                # The new files are already published; a best-effort backup
                # cleanup must not turn a successful transaction into failure.
                pass


def generate(target: date, input_path: Path | None, review_mode: str) -> None:
    if input_path is not None:
        if review_mode != "human-curated":
            raise ValueError("--input 必须显式搭配 --review-mode human-curated")
        candidates = read_json(input_path)
    else:
        if review_mode == "human-curated":
            raise ValueError("human-curated 模式必须提供 --input")
        api_key = os.environ.get("QWEN_API_KEY", "").strip()
        if not api_key:
            raise ValueError("缺少 QWEN_API_KEY；不会覆盖上一份成功快照")
        candidates = call_qwen(target, api_key)
        review_mode = "automated-retrieval-gates"

    items = curate_items(candidates, target, review_mode)
    visible = public_payload(target, items)
    audit = audit_payload(target, items, review_mode)
    validate_public_json(visible)
    validate_audit(audit, visible, require_snapshot_hashes=False)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="science-history-", dir=ROOT) as temporary:
        stage = Path(temporary)
        stage_json = stage / "science_today.json"
        stage_poster = stage / "science_today.png"
        stage_audit = stage / "science_today.sources.json"
        write_json(stage_json, visible)
        subprocess.run(
            [
                "node", str(RENDERER), "--input", str(stage_json), "--out", str(stage_poster),
                "--theme", "history", "--min-items", "1",
            ],
            check=True,
            timeout=240,
            env=renderer_environment(),
        )
        width, height = png_dimensions(stage_poster)
        if width < 720 or height < 900 or stage_poster.stat().st_size <= 0:
            raise ValueError("渲染结果为空或尺寸异常")
        audit["public_json_sha256"] = canonical_json_sha256(visible)
        audit["poster_sha256"] = hashlib.sha256(stage_poster.read_bytes()).hexdigest()
        audit["poster_bytes"] = stage_poster.stat().st_size
        audit["poster_dimensions"] = {"width": width, "height": height}
        validate_audit(audit, visible)
        write_json(stage_audit, audit)
        transactional_publish(
            [(stage_poster, PUBLIC_POSTER), (stage_json, PUBLIC_JSON), (stage_audit, AUDIT_FILE)]
        )
    check_snapshot()
    print(f"已发布 {target.isoformat()} 的 {len(items)} 条科技史快照。")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default="", help="目标日期 YYYY-MM-DD；默认 Asia/Shanghai 当天")
    parser.add_argument("--input", type=Path, help="已人工审校的研究 JSON")
    parser.add_argument(
        "--review-mode", choices=("automated", "human-curated"), default="automated",
        help="输入审校模式；--input 必须显式使用 human-curated",
    )
    parser.add_argument("--check", action="store_true", help="离线检查现有快照")
    parser.add_argument("--public", type=Path, help="同时检查 Hexo 构建后的 public 目录字节一致")
    args = parser.parse_args()
    try:
        if args.check:
            check_snapshot(args.public.resolve() if args.public else None)
            print("科技史本地快照检查通过。")
            return 0
        target = parse_date(args.date) if args.date else today_shanghai()
        generate(target, args.input.resolve() if args.input else None, args.review_mode)
        return 0
    except Exception as exc:
        print(f"科技史快照未更新：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
