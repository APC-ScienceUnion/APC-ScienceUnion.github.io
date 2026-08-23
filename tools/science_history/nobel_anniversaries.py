#!/usr/bin/env python3
"""Find Nobel science/economics laureate birth and death anniversaries.

Results are candidates from the official Nobel Prize API and still require an
independent authoritative source before publication.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


API = "https://api.nobelprize.org/2.1/laureates"
USER_AGENT = "AstrBot-Science-History/1.0 (educational client)"
ALLOWED_CATEGORIES = {"phy", "che", "med", "eco"}
CHINA_TZ = timezone(timedelta(hours=8), name="Asia/Shanghai")


def get_json(url: str) -> dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(3):
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Nobel API unavailable: {last_error}")


def english(value: Any) -> str | None:
    if isinstance(value, dict):
        return value.get("en") or next(iter(value.values()), None)
    return str(value) if value else None


def exact_month_day(value: Any, month: int, day: int) -> bool:
    if not isinstance(value, str) or len(value) < 10 or "00" in value[5:10]:
        return False
    try:
        parsed = datetime.strptime(value[:10], "%Y-%m-%d")
    except ValueError:
        return False
    return parsed.month == month and parsed.day == day


def facts_link(laureate: dict[str, Any]) -> str | None:
    for link in laureate.get("links") or []:
        if isinstance(link, dict) and link.get("rel") == "external" and "nobelprize.org" in str(link.get("href")):
            return str(link["href"])
    return None


def relevant_prizes(laureate: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for prize in laureate.get("nobelPrizes") or []:
        if not isinstance(prize, dict):
            continue
        category = prize.get("category") or {}
        code = category.get("en") if isinstance(category, dict) else None
        category_code = str(prize.get("categoryFullName", {}).get("en", "")).lower()
        api_code = str(prize.get("category", {}).get("en", "")).lower()
        short = {"physics": "phy", "chemistry": "che", "physiology or medicine": "med", "economic sciences": "eco"}.get(api_code)
        if short not in ALLOWED_CATEGORIES and not any(x in category_code for x in ("physics", "chemistry", "medicine", "economic")):
            continue
        output.append({
            "award_year": prize.get("awardYear"),
            "category": code or english(prize.get("categoryFullName")),
            "motivation": english(prize.get("motivation")),
        })
    return output


def collect(month: int, day: int) -> list[dict[str, Any]]:
    # Current dataset is around one thousand records; 1000 normally fits in one
    # page, while the loop remains correct if it grows.
    offset = 0
    limit = 1000
    matches: list[dict[str, Any]] = []
    while True:
        url = API + "?" + urllib.parse.urlencode({"limit": limit, "offset": offset})
        payload = get_json(url)
        laureates = payload.get("laureates") or []
        for laureate in laureates:
            if not isinstance(laureate, dict):
                continue
            prizes = relevant_prizes(laureate)
            if not prizes:
                continue
            for event_type, block_name in (("birth", "birth"), ("death", "death")):
                block = laureate.get(block_name) or {}
                event_date = block.get("date") if isinstance(block, dict) else None
                if not exact_month_day(event_date, month, day):
                    continue
                matches.append({
                    "candidate_only": True,
                    "event_type": event_type,
                    "date": event_date,
                    "name": english(laureate.get("fullName")) or english(laureate.get("knownName")),
                    "laureate_id": laureate.get("id"),
                    "prizes": prizes,
                    "official_facts_url": facts_link(laureate),
                    "official_api_url": f"https://api.nobelprize.org/2.1/laureate/{laureate.get('id')}",
                })
        if len(laureates) < limit:
            break
        offset += limit
    return matches


def main() -> int:
    now = datetime.now(CHINA_TZ)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--month", type=int, default=now.month)
    parser.add_argument("--day", type=int, default=now.day)
    args = parser.parse_args()
    try:
        datetime(2000, args.month, args.day)
    except ValueError as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        return 2
    try:
        matches = collect(args.month, args.day)
    except Exception as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        return 1
    print(json.dumps({
        "month": args.month,
        "day": args.day,
        "warning": "官方 Nobel API 候选；发布前仍需独立权威来源核验，人物生卒条目不得超过最终条目总数的三分之一。",
        "candidate_count": len(matches),
        "candidates": matches,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
