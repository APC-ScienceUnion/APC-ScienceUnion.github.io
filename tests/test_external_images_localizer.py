from pathlib import Path
import unittest

from tools import localize_external_images as localizer


class RuntimeImageExemptionTests(unittest.TestCase):
    def scan(self, file: Path, text: str):
        return localizer.scan_text(file, text)

    def test_exact_homepage_bing_endpoint_is_allowed(self) -> None:
        refs = self.scan(
            localizer.THEME_CONFIG_PATH,
            f"index_img: {localizer.BING_DYNAMIC_INDEX_URL}\n",
        )
        self.assertEqual(refs, [])

    def test_same_endpoint_under_another_key_is_not_allowed(self) -> None:
        refs = self.scan(
            localizer.THEME_CONFIG_PATH,
            f"default_top_img: {localizer.BING_DYNAMIC_INDEX_URL}\n",
        )
        self.assertEqual([ref.url for ref in refs], [localizer.BING_DYNAMIC_INDEX_URL])

    def test_same_endpoint_in_another_file_is_not_allowed(self) -> None:
        refs = self.scan(
            localizer.REPO_ROOT / "_config.yml",
            f"index_img: {localizer.BING_DYNAMIC_INDEX_URL}\n",
        )
        self.assertEqual([ref.url for ref in refs], [localizer.BING_DYNAMIC_INDEX_URL])

    def test_other_endpoint_under_index_img_is_not_allowed(self) -> None:
        other_url = "https://example.invalid/dynamic-homepage-image"
        refs = self.scan(
            localizer.THEME_CONFIG_PATH,
            f"index_img: {other_url}\n",
        )
        self.assertEqual([ref.url for ref in refs], [other_url])

    def test_modified_bing_query_is_not_allowed(self) -> None:
        modified_url = localizer.BING_DYNAMIC_INDEX_URL.replace("index=0", "index=1")
        refs = self.scan(
            localizer.THEME_CONFIG_PATH,
            f"index_img: {modified_url}\n",
        )
        self.assertEqual([ref.url for ref in refs], [modified_url])


if __name__ == "__main__":
    unittest.main()
