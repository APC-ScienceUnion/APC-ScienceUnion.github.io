from __future__ import annotations

import base64
import importlib.util
import json
import os
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "science_history_dispatch", ROOT / "tools" / "dispatch_science_history.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


def item(title: str = "测试事件") -> dict:
    return {
        "label": "1969年",
        "title": title,
        "text": "研究机构在当天公布了可核对的实验结果，并推动后续研究者以更精确的方法理解这一科学现象及其影响。",
        "category": "science",
        "person_event": False,
        "importance": 5,
        "sources": [
            {
                "url": "https://www.nasa.gov/example",
                "level": "A",
                "authority_type": "agency archive",
                "date_context": "event-date",
                "date_quote": "August 24, 1969",
                "fact_quote": "the instrument returned its first calibrated record",
            }
        ],
    }


def payload(title: str = "测试事件") -> dict:
    return {"date": "2026-08-24", "timezone": "Asia/Shanghai", "items": [item(title)]}


class ScienceHistoryDispatchTests(unittest.TestCase):
    def test_workflow_has_no_competing_schedule_and_uses_guarded_input_mode(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "science_history.yml").read_text(encoding="utf-8")
        self.assertNotIn("schedule:", workflow)
        self.assertIn("payload_b64:", workflow)
        self.assertIn("--review-mode automated-retrieval-gates", workflow)
        self.assertIn("group: source-snapshot-writers", workflow)

    def test_payload_round_trip_and_delivery_hash(self) -> None:
        candidate = payload()
        with mock.patch.object(MODULE, "today_shanghai", return_value=date(2026, 8, 24)):
            self.assertEqual(MODULE.validate_payload(candidate), date(2026, 8, 24))
        decoded = json.loads(base64.b64decode(MODULE.encoded_payload(candidate)).decode("utf-8"))
        self.assertEqual(decoded, candidate)
        self.assertRegex(MODULE.delivery_id(candidate), r"^2026-08-24:[0-9a-f]{64}$")

    def test_payload_rejects_non_today_and_missing_source_evidence(self) -> None:
        candidate = payload()
        with mock.patch.object(MODULE, "today_shanghai", return_value=date(2026, 8, 25)):
            with self.assertRaisesRegex(ValueError, "只接受北京时间当天"):
                MODULE.validate_payload(candidate)

    def test_repository_shape_preflight_rejects_long_text_and_non_a_domain(self) -> None:
        candidate = payload()
        candidate["items"][0]["text"] = "过长" * 50
        with self.assertRaisesRegex(ValueError, "45—90"):
            MODULE.validate_repository_shape_gate(candidate)

        candidate = payload()
        candidate["items"][0]["sources"][0]["url"] = "https://example.com/source"
        with self.assertRaisesRegex(ValueError, "A 级来源"):
            MODULE.validate_repository_shape_gate(candidate)
        del candidate["items"][0]["sources"][0]["fact_quote"]
        with mock.patch.object(MODULE, "today_shanghai", return_value=date(2026, 8, 24)):
            with self.assertRaisesRegex(ValueError, "fact_quote"):
                MODULE.validate_payload(candidate)

    def test_decode_is_idempotent_for_matching_current_snapshot(self) -> None:
        candidate = payload()
        current = {"date": candidate["date"], "items": MODULE.projected_public_items(candidate)}
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            current_path = root / "current.json"
            output_path = root / "candidate.json"
            current_path.write_text(json.dumps(current, ensure_ascii=False), encoding="utf-8")
            environment = {
                MODULE.PAYLOAD_ENV: MODULE.encoded_payload(candidate),
                MODULE.DELIVERY_ENV: MODULE.delivery_id(candidate),
            }
            with mock.patch.dict(os.environ, environment, clear=False), mock.patch.object(
                MODULE, "today_shanghai", return_value=date(2026, 8, 24)
            ):
                result = MODULE.decode_workflow_payload(output_path, current_path)
            self.assertEqual(result["changed"], "false")
            self.assertEqual(json.loads(output_path.read_text(encoding="utf-8")), candidate)

    def test_decode_rejects_hash_mismatch_and_automatic_same_day_revision(self) -> None:
        candidate = payload()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            output_path = root / "candidate.json"
            current_path = root / "current.json"
            current_path.write_text(
                json.dumps({"date": candidate["date"], "items": MODULE.projected_public_items(payload("另一版本"))}),
                encoding="utf-8",
            )
            base_environment = {
                MODULE.PAYLOAD_ENV: MODULE.encoded_payload(candidate),
                MODULE.DELIVERY_ENV: "2026-08-24:" + "0" * 64,
            }
            with mock.patch.dict(os.environ, base_environment, clear=False), mock.patch.object(
                MODULE, "today_shanghai", return_value=date(2026, 8, 24)
            ):
                with self.assertRaisesRegex(ValueError, "哈希不一致"):
                    MODULE.decode_workflow_payload(output_path, current_path)

            base_environment[MODULE.DELIVERY_ENV] = MODULE.delivery_id(candidate)
            os.environ.pop(MODULE.REVISION_ENV, None)
            with mock.patch.dict(os.environ, base_environment, clear=False), mock.patch.object(
                MODULE, "today_shanghai", return_value=date(2026, 8, 24)
            ):
                with self.assertRaisesRegex(ValueError, "拒绝覆盖"):
                    MODULE.decode_workflow_payload(output_path, current_path)

    def test_dispatch_never_places_token_in_request_body(self) -> None:
        candidate = payload()
        captured = {}

        class Response:
            status = 204

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            @staticmethod
            def read(_limit):
                return b""

        def fake_open(request, timeout):
            captured["request"] = request
            captured["timeout"] = timeout
            return Response()

        with mock.patch.object(MODULE.urllib.request, "urlopen", side_effect=fake_open):
            self.assertIsNone(MODULE.dispatch(candidate, "secret-token"))
        request = captured["request"]
        self.assertNotIn(b"secret-token", request.data)
        self.assertEqual(request.get_header("Authorization"), "Bearer secret-token")
        self.assertIn("/actions/workflows/science_history.yml/dispatches", request.full_url)

    def test_wait_for_workflow_rejects_failed_run(self) -> None:
        failed = {
            "status": "completed",
            "conclusion": "failure",
            "html_url": "https://github.com/APC-ScienceUnion/APC-ScienceUnion.github.io/actions/runs/123",
        }
        with mock.patch.object(MODULE, "discover_run", return_value=failed):
            with self.assertRaisesRegex(RuntimeError, "工作流执行失败"):
                MODULE.wait_for_workflow("token", MODULE.datetime.now(MODULE.timezone.utc), None, 30)

    def test_git_credential_fallback_returns_password_without_logging_command_output(self) -> None:
        completed = mock.Mock(stdout="protocol=https\nhost=github.com\nusername=bot\npassword=secret\n")
        with mock.patch.object(MODULE.subprocess, "run", return_value=completed) as run:
            self.assertEqual(MODULE.token_from_git_credential_manager(), "secret")
        self.assertTrue(run.call_args.kwargs["capture_output"])


if __name__ == "__main__":
    unittest.main()
