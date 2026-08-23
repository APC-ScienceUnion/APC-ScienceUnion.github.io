from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("science_history", ROOT / "tools" / "history_today_poster.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


def text_of_length(prefix: str, length: int = 52) -> str:
    return (prefix + "这项研究留下了可核对的实验记录，并推动后续研究者用更精确的方法理解相关现象。")[:length]


class ScienceHistoryPipelineTests(unittest.TestCase):
    def automated_item(self, *, strong: bool = False, sources: list[dict] | None = None) -> dict:
        return {
            "label": "1969年",
            "title": "测试事件" + ("首次完成" if strong else ""),
            "text": text_of_length("研究机构在当天公布测试结果，"),
            "category": "science",
            "person_event": False,
            "importance": 5,
            "sources": sources
            or [
                {
                    "url": "https://www.nasa.gov/example",
                    "level": "A",
                    "authority_type": "agency archive",
                    "date_quote": "August 24, 1969",
                    "fact_quote": "the instrument returned its first calibrated record",
                }
            ],
        }

    def test_automated_gate_matches_retrieved_quotes_and_date(self) -> None:
        item = MODULE.validate_item_shape(self.automated_item())
        page = {
            "url": "https://www.nasa.gov/example",
            "status": 200,
            "content_type": "text/html",
            "sha256": "a" * 64,
            "text": "On August 24, 1969, the instrument returned its first calibrated record.",
        }
        with mock.patch.object(MODULE, "fetch_page", return_value=page):
            accepted = MODULE.validate_automated_sources([item], date(2026, 8, 24))
        self.assertEqual(len(accepted), 1)
        self.assertEqual(accepted[0]["sources"][0]["retrieved_sha256"], "a" * 64)

    def test_automated_gate_rejects_quote_not_on_page(self) -> None:
        item = MODULE.validate_item_shape(self.automated_item())
        page = {
            "url": "https://www.nasa.gov/example",
            "status": 200,
            "content_type": "text/html",
            "sha256": "b" * 64,
            "text": "August 24, 1969, but no matching core fact appears here.",
        }
        with mock.patch.object(MODULE, "fetch_page", return_value=page):
            self.assertEqual(MODULE.validate_automated_sources([item], date(2026, 8, 24)), [])

    def test_automated_gate_rejects_date_quote_with_wrong_event_year(self) -> None:
        raw = self.automated_item()
        raw["sources"][0]["date_quote"] = "August 24, 2023"
        item = MODULE.validate_item_shape(raw)
        page = {
            "url": "https://www.nasa.gov/example",
            "status": 200,
            "content_type": "text/html",
            "sha256": "c" * 64,
            "text": "On August 24, 2023, the instrument returned its first calibrated record.",
        }
        with mock.patch.object(MODULE, "fetch_page", return_value=page):
            self.assertEqual(MODULE.validate_automated_sources([item], date(2026, 8, 24)), [])

    def test_strong_claim_requires_an_independent_second_host(self) -> None:
        with self.assertRaisesRegex(ValueError, "独立第二"):
            MODULE.validate_item_shape(self.automated_item(strong=True))

    def test_subdomains_of_same_institution_are_not_independent(self) -> None:
        sources = [
            {"url": "https://www.nasa.gov/a", "level": "A"},
            {"url": "https://science.nasa.gov/b", "level": "A"},
        ]
        self.assertEqual(MODULE.source_hosts_independent(sources), 1)

    def test_human_curated_requires_verbatim_quote_fields(self) -> None:
        raw = self.automated_item()
        raw["sources"][0] = {
            "url": "https://www.nasa.gov/example",
            "level": "A",
            "evidence": "中文审校摘要不是逐字证据",
        }
        payload = {"date": "2026-08-24", "timezone": "Asia/Shanghai", "items": [raw]}
        with self.assertRaisesRegex(ValueError, "date_quote/fact_quote"):
            MODULE.curate_items(payload, date(2026, 8, 24), "human-curated")

    def test_public_payload_contains_no_source_or_external_url(self) -> None:
        item = MODULE.validate_item_shape(self.automated_item())
        public = MODULE.public_payload(date(2026, 8, 24), [item])
        MODULE.validate_public_json(public)
        serialized = json.dumps(public, ensure_ascii=False)
        self.assertNotIn("sources", serialized)
        self.assertNotIn("https://", serialized)

    def test_transactional_publish_replaces_complete_set(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            destinations = [root / "live" / name for name in ("a", "b", "c")]
            staged = [root / "stage" / name for name in ("a", "b", "c")]
            for destination in destinations:
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text("old", encoding="utf-8")
            for source in staged:
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text("new", encoding="utf-8")
            MODULE.transactional_publish(list(zip(staged, destinations, strict=True)))
            self.assertEqual([path.read_text(encoding="utf-8") for path in destinations], ["new"] * 3)

    def test_transactional_publish_restores_all_old_files_after_midway_failure(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            destinations = [root / "live" / name for name in ("a", "b", "c")]
            staged = [root / "stage" / name for name in ("a", "b", "c")]
            for destination in destinations:
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text("old-" + destination.name, encoding="utf-8")
            for source in staged:
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text("new-" + source.name, encoding="utf-8")

            real_replace = MODULE.os.replace
            failed = False

            def fail_second_staged_replace(source, destination):
                nonlocal failed
                source_path = Path(source)
                if not failed and source_path.parent.name == "stage" and source_path.name == "b":
                    failed = True
                    raise OSError("simulated publish failure")
                return real_replace(source, destination)

            with mock.patch.object(MODULE.os, "replace", side_effect=fail_second_staged_replace):
                with self.assertRaisesRegex(OSError, "simulated"):
                    MODULE.transactional_publish(list(zip(staged, destinations, strict=True)))
            self.assertEqual(
                [path.read_text(encoding="utf-8") for path in destinations],
                ["old-a", "old-b", "old-c"],
            )


if __name__ == "__main__":
    unittest.main()
