from __future__ import annotations

from datetime import datetime
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from tools import update_daily_images as daily


NCKU_FIXTURE = """<!doctype html>
<html><head><meta charset="UTF-8"><title>APOD: 2026 年 8 月 30 日 – Eclipse Pair</title></head>
<body>
<center>
2026 年 8 月 30 日<br>
<a href="image/2608/high-resolution.jpg"><img src="image/2608/preview.jpg"></a>
</center>
<center>
<b>雙食 <!--Eclipse Pair--></b><br>
<b>影像提供與<a href="rights.html">版權</a>：</b><a href="author.html">攝影師</a>
</center>
<!-- 英文原文:Explanation: The English explanation from the same mirror page . Growing Gallery: housekeeping that must not be published. APOD's main NASA site is moving: more housekeeping. -->
<p>解說：</p>
<p>歷時兩週，天體彼此<a href="alignment.html">對齊</a>。</p>
<p>食季裡可見壯麗影像。</p>
<center><b>明日的圖片：</b><a href="ap260831.html">一個螺旋星系</a></center>
</body></html>
"""


class FixedDateTime(datetime):
    @classmethod
    def now(cls, tz=None):
        return cls(2026, 8, 30, 12, 0, 0, tzinfo=tz)


class DailyImageProviderTests(unittest.TestCase):
    @staticmethod
    def bing_payload() -> dict[str, object]:
        return {
            "status": "200",
            "date": "2026/08/30",
            "imgurl": "https://cn.bing.com/th?id=OHR.Example_1920x1080.jpg",
            "imgtitle": "原始标题  ",
            "imgshow": "原始副标题",
            "imgdetail": "<p>第一段。</p><p>第二段 &amp; 更多。</p>",
            "imgcopyright": "© Original Author",
        }

    def test_strip_html_preserves_block_boundaries_and_inline_text(self) -> None:
        value = "<p>第一段<a href='#'>紧邻链接</a>。</p><p>第二段<br>下一行 &amp; 更多</p>"
        self.assertEqual(
            daily.strip_html_tags(value),
            "第一段紧邻链接。\n第二段\n下一行 & 更多",
        )

    def test_bing_uses_only_skill_fields_without_rewriting(self) -> None:
        payload = self.bing_payload()
        api_url = "https://bing.ee123.net/img/?date=20260830&size=1920x1080&imgtype=jpg&type=json"
        metadata, image_url = daily.parse_bing_payload(
            payload,
            expected_date=FixedDateTime.now(daily.SHANGHAI).date(),
            api_url=api_url,
        )
        self.assertEqual(metadata["title"], payload["imgtitle"])
        self.assertEqual(metadata["headline"], payload["imgtitle"])
        self.assertEqual(metadata["subtitle"], payload["imgshow"])
        self.assertEqual(metadata["description"], "第一段。\n第二段 & 更多。")
        self.assertEqual(metadata["copyright"], payload["imgcopyright"])
        self.assertEqual(image_url, payload["imgurl"])

    def test_bing_rejects_stale_date_and_unapproved_image_hosts(self) -> None:
        base = {
            "status": 200,
            "date": "2026/08/30",
            "imgurl": "https://www.bing.com/th?id=OHR.Example.jpg",
            "imgtitle": "标题",
            "imgshow": "副标题",
            "imgdetail": "<p>描述</p>",
            "imgcopyright": "版权",
        }
        stale = dict(base, date="2026/08/29")
        with self.assertRaisesRegex(daily.SnapshotError, "requested 2026-08-30"):
            daily.parse_bing_payload(
                stale,
                expected_date=FixedDateTime.now(daily.SHANGHAI).date(),
                api_url="https://bing.ee123.net/img/",
            )
        for unsafe_url in (
            "http://cn.bing.com/image.jpg",
            "https://127.0.0.1/internal.jpg",
            "https://images.example.invalid/wallpaper.jpg",
        ):
            with self.subTest(unsafe_url=unsafe_url):
                with self.assertRaisesRegex(daily.SnapshotError, "approved Bing image host"):
                    daily.parse_bing_payload(
                        dict(base, imgurl=unsafe_url),
                        expected_date=FixedDateTime.now(daily.SHANGHAI).date(),
                        api_url="https://bing.ee123.net/img/",
                    )

    def test_bing_rejects_unapproved_api_and_image_final_urls(self) -> None:
        download = mock.Mock()
        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(
                daily,
                "fetch_json_response",
                return_value=(self.bing_payload(), "https://attacker.example.invalid/img/"),
            ),
            mock.patch.object(daily, "download_image", download),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
                daily.bing_snapshot()
        download.assert_not_called()

        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(
                daily,
                "fetch_json_response",
                return_value=(
                    self.bing_payload(),
                    "https://bing.ee123.net/img/?date=20260830&size=1920x1080&imgtype=jpg&type=json",
                ),
            ),
            mock.patch.object(
                daily,
                "download_image",
                return_value=(
                    b"\xff\xd8\xfffixture",
                    "image/jpeg",
                    ".jpg",
                    "https://127.0.0.1/internal.jpg",
                ),
            ),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
                daily.bing_snapshot()

    def test_request_layer_rejects_malicious_redirect_and_final_url(self) -> None:
        handler = daily._RestrictedRedirectHandler(daily.BING_API_HOSTS, "Bing metadata")
        with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
            handler.redirect_request(
                mock.Mock(),
                None,
                302,
                "Found",
                {},
                "https://127.0.0.1/internal",
            )

        response = mock.MagicMock()
        response.__enter__.return_value = response
        response.headers = {"Content-Type": "application/json"}
        response.read.return_value = b"{}"
        response.geturl.return_value = "https://attacker.example.invalid/final"
        opener = mock.Mock()
        opener.open.return_value = response
        with (
            mock.patch.object(daily, "RETRIES", 1),
            mock.patch.object(daily, "build_opener", return_value=opener),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
                daily.request_bytes(
                    "https://bing.ee123.net/img/",
                    accept="application/json",
                    label="Bing metadata",
                    max_bytes=1024,
                    allowed_redirect_hosts=daily.BING_API_HOSTS,
                )

    def test_ncku_parser_keeps_text_and_media_from_one_page(self) -> None:
        record = daily.parse_ncku_apod(NCKU_FIXTURE, page_url=daily.NCKU_APOD_URL)
        self.assertEqual(record["date"], "2026-08-30")
        self.assertEqual(record["title"], "双食")
        self.assertEqual(record["title_en"], "Eclipse Pair")
        self.assertEqual(
            record["description"],
            "历时两周，天体彼此对齐。\n食季里可见壮丽影像。",
        )
        self.assertEqual(record["copyright"], "摄影师")
        self.assertEqual(record["tomorrow"], "一个螺旋星系")
        self.assertEqual(
            record["explanation_en"],
            "The English explanation from the same mirror page.",
        )
        self.assertEqual(
            record["source_image_url"],
            "https://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/image/2608/high-resolution.jpg",
        )

    def test_ncku_rejects_media_from_a_different_month(self) -> None:
        with self.assertRaisesRegex(daily.SnapshotError, "image/YYYYMM"):
            daily.parse_ncku_apod(
                NCKU_FIXTURE.replace("image/2608/", "image/2607/"),
                page_url=daily.NCKU_APOD_URL,
            )

    def test_ncku_rejects_redirected_page_origin(self) -> None:
        with self.assertRaisesRegex(daily.SnapshotError, "approved HTTPS host"):
            daily.parse_ncku_apod(
                NCKU_FIXTURE,
                page_url="https://attacker.example.invalid/apod.html",
            )

    def test_apod_never_mixes_nasa_media_or_text(self) -> None:
        downloaded = mock.Mock(
            return_value=(b"\xff\xd8\xfffixture", "image/jpeg", ".jpg", "https://sprite.phys.ncku.edu.tw/final.jpg")
        )
        nasa = {
            "date": "2026-08-30",
            "media_type": "image",
            "title": "NASA title must not be used",
            "explanation": "NASA explanation must not be used",
            "hdurl": "https://apod.nasa.gov/forbidden.jpg",
        }
        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(daily, "fetch_html", return_value=(NCKU_FIXTURE, daily.NCKU_APOD_URL)),
            mock.patch.object(daily, "fetch_json", return_value=nasa),
            mock.patch.object(daily, "download_image", downloaded),
        ):
            metadata, _, _ = daily.apod_snapshot()
        requested_url = downloaded.call_args.args[0]
        self.assertTrue(requested_url.startswith("https://sprite.phys.ncku.edu.tw/"))
        self.assertNotIn("apod.nasa.gov", requested_url)
        self.assertEqual(metadata["title"], "双食")
        self.assertNotIn("NASA title", json.dumps(metadata, ensure_ascii=False))
        self.assertNotIn("NASA explanation", json.dumps(metadata, ensure_ascii=False))

    def test_apod_rejects_stale_mirror_before_network_mix(self) -> None:
        stale_page = NCKU_FIXTURE.replace("2026 年 8 月 30 日", "2026 年 8 月 29 日").replace(
            "image/2608/", "image/2608/"
        )
        nasa_fetch = mock.Mock()
        media_fetch = mock.Mock()
        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(daily, "fetch_html", return_value=(stale_page, daily.NCKU_APOD_URL)),
            mock.patch.object(daily, "fetch_json", nasa_fetch),
            mock.patch.object(daily, "download_image", media_fetch),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "does not match Asia/Shanghai"):
                daily.apod_snapshot()
        nasa_fetch.assert_not_called()
        media_fetch.assert_not_called()

    def test_apod_tolerates_unavailable_nasa_cross_check(self) -> None:
        downloaded = mock.Mock(
            return_value=(b"\xff\xd8\xfffixture", "image/jpeg", ".jpg", "https://sprite.phys.ncku.edu.tw/final.jpg")
        )
        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(daily, "fetch_html", return_value=(NCKU_FIXTURE, daily.NCKU_APOD_URL)),
            mock.patch.object(daily, "fetch_json", side_effect=daily.SnapshotError("rate limited")),
            mock.patch.object(daily, "download_image", downloaded),
        ):
            metadata, _, _ = daily.apod_snapshot()
        self.assertEqual(metadata["date"], "2026-08-30")
        downloaded.assert_called_once()

    def test_apod_rejects_successful_but_mismatched_nasa_cross_check(self) -> None:
        media_fetch = mock.Mock()
        for nasa in (
            {"date": "2026-08-29", "media_type": "image"},
            {"date": "2026-08-30", "media_type": "video"},
        ):
            with self.subTest(nasa=nasa):
                media_fetch.reset_mock()
                with (
                    mock.patch.object(daily, "datetime", FixedDateTime),
                    mock.patch.object(
                        daily,
                        "fetch_html",
                        return_value=(NCKU_FIXTURE, daily.NCKU_APOD_URL),
                    ),
                    mock.patch.object(daily, "fetch_json", return_value=nasa),
                    mock.patch.object(daily, "download_image", media_fetch),
                ):
                    with self.assertRaisesRegex(daily.SnapshotError, "do not match"):
                        daily.apod_snapshot()
                media_fetch.assert_not_called()

    def test_apod_rejects_unapproved_page_and_media_final_urls(self) -> None:
        nasa_fetch = mock.Mock()
        media_fetch = mock.Mock()
        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(
                daily,
                "fetch_html",
                return_value=(NCKU_FIXTURE, "https://attacker.example.invalid/apod.html"),
            ),
            mock.patch.object(daily, "fetch_json", nasa_fetch),
            mock.patch.object(daily, "download_image", media_fetch),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
                daily.apod_snapshot()
        nasa_fetch.assert_not_called()
        media_fetch.assert_not_called()

        with (
            mock.patch.object(daily, "datetime", FixedDateTime),
            mock.patch.object(
                daily,
                "fetch_html",
                return_value=(NCKU_FIXTURE, daily.NCKU_APOD_URL),
            ),
            mock.patch.object(
                daily,
                "fetch_json",
                return_value={"date": "2026-08-30", "media_type": "image"},
            ),
            mock.patch.object(
                daily,
                "download_image",
                return_value=(
                    b"\xff\xd8\xfffixture",
                    "image/jpeg",
                    ".jpg",
                    "https://attacker.example.invalid/apod.jpg",
                ),
            ),
        ):
            with self.assertRaisesRegex(daily.SnapshotError, "approved host"):
                daily.apod_snapshot()

    def test_manifest_metadata_is_part_of_fallback_validity(self) -> None:
        manifest = json.loads(daily.MANIFEST.read_text(encoding="utf-8"))
        bing = manifest["providers"]["bing"]
        apod = manifest["providers"]["apod"]
        self.assertEqual(daily.verify_provider_metadata("bing", bing), [])
        self.assertEqual(daily.verify_provider_metadata("apod", apod), [])

        for key in ("title", "description", "source_page_url", "source_image_url", "fetched_url"):
            with self.subTest(provider="bing", key=key):
                broken = dict(bing)
                broken.pop(key)
                self.assertTrue(daily.verify_provider_metadata("bing", broken))
        for key in (
            "title",
            "title_en",
            "description",
            "explanation_en",
            "tomorrow",
            "source_page_url",
            "source_image_url",
            "fetched_url",
        ):
            with self.subTest(provider="apod", key=key):
                broken = dict(apod)
                broken.pop(key)
                self.assertTrue(daily.verify_provider_metadata("apod", broken))

        nasa_sourced = dict(apod, source_image_url="https://apod.nasa.gov/image.jpg")
        self.assertTrue(daily.verify_provider_metadata("apod", nasa_sourced))
        english_only = dict(apod, description="English-only fallback text")
        self.assertTrue(daily.verify_provider_metadata("apod", english_only))
        housekeeping = dict(
            apod,
            explanation_en=apod["explanation_en"] + " Growing Gallery: should be removed",
        )
        self.assertTrue(daily.verify_provider_metadata("apod", housekeeping))

    def test_provider_failure_preserves_previous_verified_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            daily_dir = root / "source" / "images" / "daily"
            daily_dir.mkdir(parents=True)
            placeholder = daily_dir / "placeholder.svg"
            placeholder.write_text("<svg xmlns='http://www.w3.org/2000/svg'></svg>", encoding="utf-8")
            body = b"\xff\xd8\xffprevious"
            image = daily_dir / "bing-2026-08-29-previous.jpg"
            image.write_bytes(body)
            local_url = f"/images/daily/{image.name}"
            manifest = daily_dir / "daily-images.json"
            old_entry = {
                "date": "2026-08-29",
                "title": "原始标题",
                "headline": "原始标题",
                "subtitle": "原始副标题",
                "description": "原始描述",
                "copyright": "© Original Author",
                "source_page_url": "https://bing.ee123.net/img/?date=20260829&size=1920x1080&imgtype=jpg&type=json",
                "source_image_url": "https://cn.bing.com/th?id=OHR.Previous.jpg",
                "fetched_url": "https://cn.bing.com/th?id=OHR.Previous.jpg",
                "local_url": local_url,
                "image_path": local_url,
                "bytes": len(body),
                "sha256": hashlib.sha256(body).hexdigest(),
                "mime": "image/jpeg",
            }
            manifest.write_text(
                json.dumps(
                    {"schema_version": 1, "updated_at": "before", "providers": {"bing": old_entry}},
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            before_manifest = manifest.read_bytes()
            with (
                mock.patch.multiple(
                    daily,
                    ROOT=root,
                    DAILY_DIR=daily_dir,
                    MANIFEST=manifest,
                    PLACEHOLDER=placeholder,
                    PROVIDERS=("bing",),
                ),
                mock.patch.object(daily, "bing_snapshot", side_effect=daily.SnapshotError("upstream down")),
            ):
                self.assertEqual(daily.update(), 0)
            self.assertEqual(manifest.read_bytes(), before_manifest)
            self.assertEqual(image.read_bytes(), body)


if __name__ == "__main__":
    unittest.main()
