#!/usr/bin/env python3
"""Send an AstrBot science-history draft to the repository's guarded workflow.

The caller only needs a fine-grained GitHub token with repository
``Actions: write`` permission.  It does not receive permission to edit
repository contents.  GitHub Actions decodes the draft, re-fetches every
source through ``history_today_poster.py``, renders the poster, and commits the
validated snapshot with its own short-lived ``GITHUB_TOKEN``.

The token is read only from ``APC_GITHUB_ACTIONS_TOKEN``.  It must never be
placed in the AstrBot skill prompt, cron note, JSON payload, or command line.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any


TIMEZONE = "Asia/Shanghai"
REPOSITORY = "APC-ScienceUnion/APC-ScienceUnion.github.io"
WORKFLOW = "science_history.yml"
API_VERSION = "2026-03-10"
TOKEN_ENV = "APC_GITHUB_ACTIONS_TOKEN"
PAYLOAD_ENV = "SCIENCE_HISTORY_PAYLOAD_B64"
DELIVERY_ENV = "SCIENCE_HISTORY_DELIVERY_ID"
REVISION_ENV = "SCIENCE_HISTORY_ALLOW_REVISION"
MAX_CANONICAL_BYTES = 45_000


def today_shanghai() -> date:
    # Mainland China has used UTC+08:00 year-round since 1991.  A fixed offset
    # avoids requiring the optional ``tzdata`` wheel on Windows AstrBot hosts.
    return datetime.now(timezone(timedelta(hours=8))).date()


def canonical_payload_bytes(payload: dict[str, Any]) -> bytes:
    return (
        json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    ).encode("utf-8")


def validate_payload(payload: Any, *, require_today: bool = True) -> date:
    if not isinstance(payload, dict) or set(payload) != {"date", "timezone", "items"}:
        raise ValueError("AstrBot 候选稿只能包含 date/timezone/items 三个顶层字段")
    try:
        target = date.fromisoformat(str(payload["date"]))
    except ValueError as exc:
        raise ValueError("候选稿 date 必须是 YYYY-MM-DD") from exc
    if payload["timezone"] != TIMEZONE:
        raise ValueError("候选稿 timezone 必须是 Asia/Shanghai")
    if require_today and target != today_shanghai():
        raise ValueError(f"只接受北京时间当天稿件：收到 {target}，今天是 {today_shanghai()}")

    items = payload["items"]
    if not isinstance(items, list) or not 1 <= len(items) <= 20:
        raise ValueError("候选稿 items 数量必须为 1—20")
    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"第 {index} 条不是对象")
        for field in ("label", "title", "text", "sources"):
            if field not in item:
                raise ValueError(f"第 {index} 条缺少 {field}")
        if not all(isinstance(item[field], str) and item[field].strip() for field in ("label", "title", "text")):
            raise ValueError(f"第 {index} 条的 label/title/text 必须是非空字符串")
        if not isinstance(item["sources"], list) or not item["sources"]:
            raise ValueError(f"第 {index} 条缺少来源证据")
        for source_index, source in enumerate(item["sources"], start=1):
            if not isinstance(source, dict):
                raise ValueError(f"第 {index} 条第 {source_index} 个来源不是对象")
            for field in ("url", "level", "date_quote", "fact_quote"):
                if not isinstance(source.get(field), str) or not source[field].strip():
                    raise ValueError(f"第 {index} 条第 {source_index} 个来源缺少 {field}")
            if not source["url"].startswith("https://"):
                raise ValueError(f"第 {index} 条第 {source_index} 个来源必须使用 HTTPS")

    if len(canonical_payload_bytes(payload)) > MAX_CANONICAL_BYTES:
        raise ValueError("候选稿过大，无法安全放入 workflow_dispatch 输入")
    return target


def delivery_id(payload: dict[str, Any]) -> str:
    raw = canonical_payload_bytes(payload)
    return f"{payload['date']}:{hashlib.sha256(raw).hexdigest()}"


def encoded_payload(payload: dict[str, Any]) -> str:
    return base64.b64encode(canonical_payload_bytes(payload)).decode("ascii")


def projected_public_items(payload: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {"label": str(item["label"]), "title": str(item["title"]), "text": str(item["text"])}
        for item in payload["items"]
    ]


def current_snapshot_matches(payload: dict[str, Any], current_json: Path | None) -> bool:
    if current_json is None or not current_json.is_file():
        return False
    try:
        current = json.loads(current_json.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return False
    return current.get("date") == payload["date"] and current.get("items") == projected_public_items(payload)


def write_github_outputs(values: dict[str, str]) -> None:
    output = os.environ.get("GITHUB_OUTPUT")
    if not output:
        return
    with Path(output).open("a", encoding="utf-8", newline="\n") as handle:
        for key, value in values.items():
            if "\n" in value or "\r" in value:
                raise ValueError("GitHub output 不得包含换行")
            handle.write(f"{key}={value}\n")


def decode_workflow_payload(output: Path, current_json: Path | None) -> dict[str, str]:
    encoded = os.environ.get(PAYLOAD_ENV, "").strip()
    claimed_id = os.environ.get(DELIVERY_ENV, "").strip()
    if not encoded or not claimed_id:
        raise ValueError("工作流缺少 AstrBot payload 或 delivery_id")
    try:
        raw = base64.b64decode(encoded, validate=True)
        payload = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("AstrBot payload 不是有效的 base64 UTF-8 JSON") from exc
    target = validate_payload(payload)
    actual_id = delivery_id(payload)
    if claimed_id != actual_id:
        raise ValueError("AstrBot delivery_id 与候选稿哈希不一致")

    changed = not current_snapshot_matches(payload, current_json)
    if current_json and current_json.is_file():
        current = json.loads(current_json.read_text(encoding="utf-8-sig"))
        current_date = date.fromisoformat(str(current["date"]))
        if current_date > target:
            raise ValueError("拒绝用旧稿覆盖较新的科技史快照")
        allow_revision = os.environ.get(REVISION_ENV, "").strip().lower() == "true"
        if current_date == target and changed and not allow_revision:
            raise ValueError("当天快照已经存在但正文不同；自动任务拒绝覆盖，请人工允许修订")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(canonical_payload_bytes(payload))
    values = {
        "date": target.isoformat(),
        "delivery_id": actual_id,
        "changed": "true" if changed else "false",
    }
    write_github_outputs(values)
    return values


def dispatch(payload: dict[str, Any], token: str) -> str | None:
    body = json.dumps(
        {
            "ref": "source",
            "inputs": {
                "payload_b64": encoded_payload(payload),
                "delivery_id": delivery_id(payload),
                "allow_revision": False,
            },
        },
        separators=(",", ":"),
    ).encode("utf-8")
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPOSITORY}/actions/workflows/{WORKFLOW}/dispatches",
        data=body,
        method="POST",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "APC-AstrBot-Science-History/1.0",
            "X-GitHub-Api-Version": API_VERSION,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            response_body = response.read(256_000)
            if response.status not in {200, 204}:
                raise RuntimeError(f"GitHub 返回异常状态 {response.status}")
    except urllib.error.HTTPError as exc:
        detail = exc.read(4_000).decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub 拒绝启动工作流（HTTP {exc.code}）：{detail}") from exc
    if not response_body:
        return None
    try:
        result = json.loads(response_body)
    except json.JSONDecodeError:
        return None
    return str(result.get("html_url") or "") or None


def token_from_git_credential_manager() -> str:
    """Read the existing github.com credential without echoing it to the agent.

    This is a compatibility bridge for the current Windows host.  A dedicated
    fine-grained ``Actions: write`` token in ``APC_GITHUB_ACTIONS_TOKEN`` is
    preferred because Git credentials commonly carry broader repository scope.
    """
    try:
        completed = subprocess.run(
            ["git", "credential", "fill"],
            input="protocol=https\nhost=github.com\n\n",
            text=True,
            encoding="utf-8",
            capture_output=True,
            check=True,
            timeout=15,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise ValueError("无法从 Windows Git Credential Manager 取得 GitHub 凭证") from exc
    fields = {}
    for line in completed.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            fields[key.strip()] = value.strip()
    token = fields.get("password", "")
    if not token:
        raise ValueError("Windows Git Credential Manager 中没有 github.com 凭证")
    return token


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--input", type=Path, help="AstrBot 保存的带来源候选 JSON")
    mode.add_argument("--decode-env", action="store_true", help="在 GitHub runner 中解码工作流输入")
    parser.add_argument("--output", type=Path, help="--decode-env 的候选稿输出路径")
    parser.add_argument("--current-json", type=Path, help="用于幂等与防旧稿覆盖的当前公开 JSON")
    parser.add_argument("--dry-run", action="store_true", help="只验证并输出安全摘要，不访问 GitHub")
    parser.add_argument(
        "--use-git-credential",
        action="store_true",
        help="环境中无专用令牌时，使用本机 Git Credential Manager（兼容模式）",
    )
    parser.add_argument("--allow-non-today", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()

    try:
        if args.decode_env:
            if args.output is None:
                raise ValueError("--decode-env 必须提供 --output")
            values = decode_workflow_payload(args.output.resolve(), args.current_json.resolve() if args.current_json else None)
            print(f"AstrBot 候选稿已验证：{values['date']}，changed={values['changed']}。")
            return 0

        payload = json.loads(args.input.read_text(encoding="utf-8-sig"))
        target = validate_payload(payload, require_today=not args.allow_non_today)
        identifier = delivery_id(payload)
        if args.dry_run:
            print(f"AstrBot 候选稿验证通过：{target}，{len(payload['items'])} 条，delivery={identifier}。")
            return 0
        token = os.environ.get(TOKEN_ENV, "").strip()
        if not token and args.use_git_credential:
            token = token_from_git_credential_manager()
        if not token:
            raise ValueError(f"缺少环境变量 {TOKEN_ENV}；未向 GitHub 发送任何内容")
        run_url = dispatch(payload, token)
        if run_url:
            print(f"已把 {target} 的文本稿交给 GitHub 验证和部署：{run_url}")
        else:
            print(f"已把 {target} 的文本稿交给 GitHub 验证和部署。")
        return 0
    except Exception as exc:
        print(f"AstrBot 科技史稿件未提交：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
