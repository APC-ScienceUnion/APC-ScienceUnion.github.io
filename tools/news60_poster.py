#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Daily News Poster Generator

生成与站点前端一致风格的「今日简报」长图。

Usage examples:
  python tools/news60_poster.py --api --header https://example.com/header.jpg
  python tools/news60_poster.py --text-file mynews.txt --header header.jpg --out out.png

依赖: Pillow, requests
  pip install pillow requests
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import math
import os
from typing import List, Tuple

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception as e:  # pragma: no cover
    raise SystemExit("请先安装 Pillow: pip install pillow")

try:
    import requests
except Exception:
    requests = None


API_URL = "https://60s-api.viki.moe/v2/60s?encoding=text"


def load_font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont:
    # 尝试常见中文字体; 若缺失则回退到默认字体
    candidates = [
        "NotoSansSC-Regular.otf" if weight == "regular" else "NotoSansSC-Bold.otf",
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyhbd.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def fetch_lines_from_api() -> List[str]:
    if requests is None:
        raise SystemExit("需要 requests 库以从 API 获取数据，或改用 --text-file")
    resp = requests.get(API_URL, timeout=20)
    resp.raise_for_status()
    text = resp.text
    return [ln for ln in text.split("\n") if ln.strip()]


def read_lines_from_file(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        return [ln.strip("\n") for ln in f if ln.strip()]


def load_header_image(header: str, width: int, height: int) -> Image.Image:
    # 支持 URL 或本地路径; 失败时返回渐变图
    img: Image.Image | None = None
    if header:
        try:
            if header.startswith("http"):
                if requests is None:
                    raise RuntimeError("缺少 requests，无法下载远程图片")
                r = requests.get(header, timeout=20)
                r.raise_for_status()
                img = Image.open(io.BytesIO(r.content)).convert("RGB")
            else:
                img = Image.open(header).convert("RGB")
        except Exception:
            img = None

    if img is None:
        # 创建暖色渐变占位
        grad = Image.new("RGB", (width, height), "#f8d77a")
        draw = ImageDraw.Draw(grad)
        for y in range(height):
            ratio = y / float(height)
            r = int(248 + (243 - 248) * ratio)
            g = int(215 + (163 - 215) * ratio)
            b = int(122 + (78 - 122) * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        return grad

    # cover 模式适配输出区域
    iw, ih = img.size
    scale = max(width / iw, height / ih)
    dw, dh = int(iw * scale), int(ih * scale)
    img = img.resize((dw, dh), Image.LANCZOS)
    x = (dw - width) // 2
    y = (dh - height) // 2
    return img.crop((x, y, x + width, y + height))


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> List[str]:
    lines: List[str] = []
    buf = ""
    for ch in text:
        if draw.textlength(buf + ch, font=font) <= max_width:
            buf += ch
        else:
            if buf:
                lines.append(buf)
            buf = ch
    if buf:
        lines.append(buf)
    return lines


def build_poster(lines: List[str], header: str, width: int = 1080) -> Image.Image:
    now = dt.datetime.now()
    y, m, d = now.year, now.month, now.day
    weekday = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"][now.weekday()]
    date_text = f"{y}年{m}月{d}日"
    title_text = "今日简报"

    # 解析正文条目
    items = []
    for i in range(1, max(1, len(lines) - 1)):
        items.append(lines[i].lstrip().replace('\u3000', ' ').lstrip('\uFEFF'))
    items = [s.replace("\ufeff", "").replace("\r", "").strip() for s in items if s.strip()]
    # 去除前缀序号
    items = [__import__('re').sub(r"^\d+\.\s*", "", s) for s in items]

    # 画布布局
    margin = 72
    header_h = int(width * 0.56)
    content_w = width - margin * 2

    font_item = load_font(36)
    font_title = load_font(64, "bold")
    font_title_en = load_font(26)
    font_date = load_font(36)
    font_week = load_font(32)
    font_footer = load_font(26)
    font_day = load_font(200, "bold")

    # 预计算文字高度
    dummy = Image.new("RGB", (width, 10), "white")
    dw = ImageDraw.Draw(dummy)
    line_h = 56
    body_h = 0
    wrapped: List[List[str]] = []
    for idx, it in enumerate(items):
        ln = f"{idx+1}. {it}"
        wl = wrap_text(dw, ln, font_item, content_w)
        wrapped.append(wl)
        body_h += len(wl) * line_h + 12

    title_block_h = 64 + 26 + 36 + 24 + 32
    footer_h = 120
    total_h = header_h + 40 + title_block_h + 24 + body_h + footer_h

    canvas = Image.new("RGB", (width, total_h), "white")
    draw = ImageDraw.Draw(canvas)

    # 头图
    header_img = load_header_image(header, width, header_h)
    canvas.paste(header_img, (0, 0))

    # 头图上的大日
    day_text = f"{d:02d}"
    draw.text((margin, header_h - 220), day_text, font=font_day, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0,))

    y_cursor = header_h + 40
    # 英文小标题
    draw.text((margin, y_cursor), "NEWS TODAY", font=font_title_en, fill=(153, 153, 153))
    y_cursor += 36
    # 中文大标题
    draw.text((margin, y_cursor), title_text, font=font_title, fill=(34, 34, 34))
    y_cursor += 64
    # 日期+星期
    draw.text((margin, y_cursor), date_text, font=font_date, fill=(102, 102, 102))
    y_cursor += 42
    draw.text((margin, y_cursor), weekday, font=font_week, fill=(102, 102, 102))
    y_cursor += 40

    # 分割线
    draw.line([(margin, y_cursor), (width - margin, y_cursor)], fill=(238, 238, 238), width=2)
    y_cursor += 24

    # 正文
    for wl in wrapped:
        for seg in wl:
            draw.text((margin, y_cursor), seg, font=font_item, fill=(51, 51, 51))
            y_cursor += line_h
        y_cursor += 12

    # 页脚
    y_cursor += 8
    draw.line([(margin, y_cursor), (width - margin, y_cursor)], fill=(238, 238, 238), width=2)
    y_cursor += 36
    draw.text((margin, y_cursor), "制图：格物社 / A.P.C.科学联盟", font=font_footer, fill=(138, 138, 138))
    y_cursor += 34
    draw.text((margin, y_cursor), "头图供图：SORTZE", font=font_footer, fill=(138, 138, 138))
    y_cursor += 34
    draw.text((margin, y_cursor), "鸣谢：daily60s", font=font_footer, fill=(138, 138, 138))

    return canvas


def main():
    parser = argparse.ArgumentParser(description="生成每日新闻长图")
    parser.add_argument("--api", action="store_true", help="从默认 API 获取当日文本")
    parser.add_argument("--text-file", type=str, default="", help="从本地文本读取内容（每行一条，含首尾说明行）")
    parser.add_argument("--header", type=str, default="", help="头图 URL 或本地路径")
    parser.add_argument("--out", type=str, default="", help="输出文件路径，默认 news60_YYYY-MM-DD.png")
    parser.add_argument("--width", type=int, default=1080, help="输出宽度，默认1080")

    args = parser.parse_args()

    if not args.api and not args.text_file:
        args.api = True

    if args.api:
        lines = fetch_lines_from_api()
    else:
        if not os.path.exists(args.text_file):
            raise SystemExit(f"未找到文本文件: {args.text_file}")
        lines = read_lines_from_file(args.text_file)

    poster = build_poster(lines, args.header, width=args.width)
    now = dt.datetime.now()
    out = args.out or f"news60_{now.year}-{now.month}-{now.day}.png"
    poster.save(out, format="PNG")
    print("已生成:", out)


if __name__ == "__main__":
    main()


