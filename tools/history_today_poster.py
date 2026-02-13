#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Science History Today Poster Generator

使用 Gemini 3 API 先生成“科学史上的今天”Markdown 文本，
再按站点 front-end（news60.js / news60_poster.py）相同视觉风格生成长图。

示例用法：
  # 使用环境变量 GEMINI_API_KEY，日期默认今天
  python tools/history_today_poster.py --header https://example.com/header.jpg

  # 指定日期和输出文件
  python tools/history_today_poster.py --date 2025-11-23 --header header.jpg --out history_2025-11-23.png

依赖: Pillow, requests
  pip install pillow requests
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import os
from typing import List
import json

try:
  from PIL import Image, ImageDraw, ImageFont
except Exception:
  raise SystemExit("请先安装 Pillow: pip install pillow")

try:
  import requests
except Exception:
  requests = None


# 使用阿里云百炼千问3（Qwen3）OpenAI 兼容接口
QWEN_MODEL = "qwen3-max-preview"
QWEN_ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# 使用 Kimi 模型作为第一阶段问询（与前端保持一致：Kimi → Qwen3 校验）
KIMI_MODEL = "kimi-k2-0905-preview"
KIMI_ENDPOINT = "https://api.moonshot.cn/v1/chat/completions"


def load_font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont:
  """尝试加载常见中文字体，失败则回退到默认字体。"""
  candidates = [
    # Noto Sans SC（如项目中有可自行放到运行目录）
    "NotoSansSC-Regular.otf" if weight == "regular" else "NotoSansSC-Bold.otf",
    # macOS 常见中文字体
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    # Windows 微软雅黑
    "C:/Windows/Fonts/msyh.ttc" if weight == "regular" else "C:/Windows/Fonts/msyhbd.ttc",
  ]
  for path in candidates:
    if os.path.exists(path):
      try:
        return ImageFont.truetype(path, size)
      except Exception:
        continue
  return ImageFont.load_default()


def load_header_image(header: str, width: int, height: int) -> Image.Image:
  """
  头图加载：支持 URL 或本地路径；失败时使用暖色渐变占位图。
  采用 cover 模式裁切以适配输出区域。
  """
  img: Image.Image | None = None

  if header:
    try:
      if header.startswith("http"):
        if requests is None:
          raise RuntimeError("缺少 requests，无法下载远程头图")
        resp = requests.get(header, timeout=20)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
      else:
        img = Image.open(header).convert("RGB")
    except Exception:
      img = None

  if img is None:
    # 创建与 news60 风格一致的暖色渐变头图
    grad = Image.new("RGB", (width, height), "#f8d77a")
    draw = ImageDraw.Draw(grad)
    for y in range(height):
      ratio = y / float(height)
      r = int(248 + (243 - 248) * ratio)
      g = int(215 + (163 - 215) * ratio)
      b = int(122 + (78 - 122) * ratio)
      draw.line([(0, y), (width, y)], fill=(r, g, b))
    return grad

  iw, ih = img.size
  scale = max(width / iw, height / ih)
  dw, dh = int(iw * scale), int(ih * scale)
  img = img.resize((dw, dh), Image.LANCZOS)
  x = (dw - width) // 2
  y = (dh - height) // 2
  return img.crop((x, y, x + width, y + height))


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> List[str]:
  """逐字测量宽度进行换行，确保中英文混排适配。"""
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


def get_qwen_api_key(cli_key: str | None = None) -> str:
  """
  获取 Qwen API Key：
  优先使用命令行参数 --api-key，其次使用环境变量 QWEN_API_KEY。
  """
  key = cli_key or os.environ.get("QWEN_API_KEY")
  if not key:
    raise SystemExit("未找到 Qwen API Key，请使用 --api-key 参数或设置环境变量 QWEN_API_KEY")
  return key


def get_kimi_api_key(cli_key: str | None = None) -> str:
  """
  获取 Kimi API Key：
  优先使用命令行参数 --kimi-key，其次使用环境变量 KIMI_API_KEY。
  """
  key = cli_key or os.environ.get("KIMI_API_KEY")
  if not key:
    raise SystemExit("未找到 Kimi API Key，请使用 --kimi-key 参数或设置环境变量 KIMI_API_KEY")
  return key


def build_history_prompt(date: dt.date) -> str:
  """根据目标日期构造“科学史上的今天”提示词。"""
  iso = date.strftime("%Y-%m-%d")
  return f"""你是一个精通科学史的、严谨的学者，现在我要求你整理“科学史上的今天”资料，今天是{iso}。请注意，科学史包括自然科学（理学/工学/农学/医学等）与人文社科（哲学/经济学等）。你禁止包括任何娱乐新闻或无关紧要的小事

你的回答必须满足以下要求：

0、关于检索的网页只允许查询权威博物馆的历史资料以及公开的权威百科和网站百科资料、以及权威有名的杂志。
禁止百度搜狗360等中国百科、抖音、抖音百科、今天头条、360doc个人图书馆、网易、手机搜狐网、华人头条、IT之家、新晚报。


1、资料必须是历史上的重大事件。

2、你的回答必须符合规定日期**当天**实际发生过的历史事件，你必须查阅网络资料验证信息来源真实。

3、必须严格按照以下格式返回内容，禁止返回格式之外的任何信息。 每件史实必须在同一行内。

4、内容必须权威准确，最后只保留最权威最重要的**20**条。

```md

科学史上的今天（{iso}）

1. 年份（如：1101）：事件简要说明

...

15. 年份（如：2005）：事件简要说明

```

5、年份必须**由早到晚**排序。
"""


def call_qwen_history_today(date: dt.date, qwen_key: str, kimi_key: str) -> str:
  """
  调用 Kimi 生成“科学史上的今天”初稿，再用千问 Qwen3（qwen3-max-preview）进行校验与裁剪，
  返回最终用于绘制长图的 Markdown 文本。

  - 第一步：调用 Kimi（kimi-k2-0905-preview）生成“科学史上的今天（YYYY-MM-DD）”及条目
    - POST https://api.moonshot.cn/v1/chat/completions
    - Header: Authorization: Bearer <KIMI_API_KEY>
    - Body: { "model": "kimi-k2-0905-preview", "messages": [...], "temperature": 0.1 }

  - 第二步：调用 qwen3-max-preview 对 Doubao 返回内容进行审查与筛选
    - 按照阿里云百炼控制台提供的 qwen3-max OpenAI 兼容接口格式：
      - POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
      - Header: Authorization: Bearer <Qwen_API_KEY>
      - Body: {
          "model": "qwen3-max-preview",
          "messages": [...],
          "temperature": 0.1,
          "extra_body": { "enable_thinking": true }
        }

  前端 todayInHistory.js 中的链路也是 Kimi → Qwen3 校验，这里保持一致，方便调试和对齐结果。
  """
  if requests is None:
    raise SystemExit("需要 requests 库以调用 Kimi/Qwen API，请先安装: pip install requests")

  # ---------- Step 1: 调用 Kimi 生成“科学史上的今天”初稿 ----------
  kimi_prompt = build_history_prompt(date)

  kimi_payload = {
    "model": KIMI_MODEL,
    "messages": [
      {"role": "system", "content": "你是一个精通科学史的、严谨的学者。"},
      {"role": "user", "content": kimi_prompt},
    ],
    "temperature": 0.1,
  }

  try:
    km_resp = requests.post(
      KIMI_ENDPOINT,
      headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {kimi_key}",
      },
      json=kimi_payload,
      timeout=1800,
      proxies={},  # 显式禁用系统代理，避免 ProxyError
    )
    km_resp.raise_for_status()
  except Exception as e:
    raise SystemExit(f"调用 Kimi API 失败: {e}\n响应内容: {km_resp.text[:500] if 'km_resp' in locals() else ''}...");

  km_data = km_resp.json()
  km_choices = km_data.get("choices") or []
  if not km_choices:
    raise SystemExit(f"Kimi 返回内容为空: {km_data}")

  km_message = km_choices[0].get("message") or {}
  kimi_content = km_message.get("content") or ""
  if not isinstance(kimi_content, str) or not kimi_content.strip():
    raise SystemExit(f"Kimi 未返回可用文本: {km_data}")

  # ---------- Step 2: 调用 Qwen3 对 Kimi 返回内容进行校验与裁剪 ----------
  iso = date.strftime("%Y-%m-%d")
  qwen_prompt = f"""你是一个精通科学史的、严谨的学者。请检查我收集的资料【{kimi_content}】中的内容是否准确（你必须严格审查日期与事件的真实性）。

- 如果有条目错误，必须直接删除该条目。
- 检查无误后，保持资料原本的格式（科学史上的今天（{iso}）以及后续内容）返回给我（你需要确保剩下的条目都正确）。
- 如果所有条目均不正确，你只需要返回原本资料的header（即科学史上的今天（{iso}））。
- 禁止输出条目原本的序号
- 禁止输出条目外的内容。"""

  qwen_payload = {
    "model": QWEN_MODEL,
    "messages": [
      {"role": "system", "content": "你是一个精通科学史的、严谨的学者。"},
      {"role": "user", "content": qwen_prompt},
    ],
    # 为了与前端调用保持一致：温度 0.1 + 开启思考，但我们只读取最终回答文本
    "temperature": 0.1,
    "extra_body": {
      "enable_thinking": True,
    },
  }

  try:
    q_resp = requests.post(
      QWEN_ENDPOINT,
      headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {qwen_key}",
      },
      json=qwen_payload,
      timeout=1800,  # Qwen 校验也一并放宽到 1800 秒
      proxies={},    # 显式禁用系统代理
    )
    q_resp.raise_for_status()
  except Exception as e:
    raise SystemExit(f"调用 Qwen API 失败: {e}\n响应内容: {q_resp.text[:500] if 'q_resp' in locals() else ''}...")

  q_data = q_resp.json()
  choices = q_data.get("choices") or []
  if not choices:
    raise SystemExit(f"Qwen 返回内容为空: {q_data}")

  message = choices[0].get("message") or {}
  content = message.get("content") or ""
  if not isinstance(content, str) or not content.strip():
    raise SystemExit(f"Qwen 未返回可用文本: {q_data}")

  return content


def parse_items_from_markdown(md: str) -> List[str]:
  """
  从大模型返回的 Markdown 中解析出事件条目列表。
  为保持兼容性，只要形如“序号. 内容”的行都会视作一条事件。
  """
  lines = [ln.strip() for ln in md.splitlines()]
  items: List[str] = []
  for ln in lines:
    if not ln:
      continue
    # 跳过标题行
    if ln.startswith("科学史上的今天"):
      continue
    # Markdown 代码块标记略过
    if ln.startswith("```"):
      continue

    # 只提取以“数字.” 开头的行
    # 允许有中文全角空格、冒号等，保持整体作为一行文本
    import re

    m = re.match(r"^(\d+)\.\s*(.+)$", ln)
    if not m:
      continue
    content = m.group(2).strip()
    if content:
      # 不再强行切分“年份：”部分，整行用于展示，避免因格式微调导致解析失败
      items.append(f"{m.group(1)}. {content}")

  if not items:
    raise SystemExit("未能从大模型返回内容中解析出任何事件条目，请检查返回格式是否符合约定。")
  return items


def build_poster_from_items(
  items: List[str],
  header: str,
  target_date: dt.date,
  width: int = 1080,
) -> Image.Image:
  """
  根据事件条目列表生成长图，版式参考 news60_poster.py，
  但顶部标题与底部版权 / 免责声明按需求调整。
  """
  y, m, d = target_date.year, target_date.month, target_date.day
  weekday = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"][target_date.weekday()]
  date_text = f"{y}年{m}月{d}日"
  title_text = "科学史上的今天"

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

  dummy = Image.new("RGB", (width, 10), "white")
  dw = ImageDraw.Draw(dummy)
  line_h = 56
  body_h = 0
  wrapped: List[List[str]] = []
  for it in items:
    wl = wrap_text(dw, it, font_item, content_w)
    wrapped.append(wl)
    body_h += len(wl) * line_h + 12

  # 英文小标题 + 中文标题 + 日期 + 星期整体高度估算
  title_block_h = 64 + 26 + 36 + 24 + 32

  # 页脚 5 行 + 上下间距
  footer_lines = [
    "图像制作：格物社 / A.P.C.科学联盟",
    "灵感赖渊：缪卿九",
    "头图供图：Marianna Armata/Getty Image",
    "特别鸣谢：Qwen-3-Max、kimi-k2-0905-preview",
    "免责声明：图片内容由 AI 总结生成，不代表格物社/A.P.C.科学联盟立场",
  ]
  footer_h = 36 * len(footer_lines) + 80

  total_h = header_h + 40 + title_block_h + 24 + body_h + footer_h

  canvas = Image.new("RGB", (width, total_h), "white")
  draw = ImageDraw.Draw(canvas)

  # 头图
  header_img = load_header_image(header, width, header_h)
  canvas.paste(header_img, (0, 0))

  # 大日期数字（与前端 JS 一致：靠右对齐）
  day_text = f"{d:02d}"
  # 先测量数字宽度，再计算靠右的位置
  day_width = draw.textlength(day_text, font=font_day)
  day_x = width - margin - day_width
  day_y = header_h - 220
  draw.text(
    (day_x, day_y),
    day_text,
    font=font_day,
    fill=(255, 255, 255),
    stroke_width=2,
    stroke_fill=(0, 0, 0),
  )

  y_cursor = header_h + 40

  # 英文小标题（可选，保持风格统一）
  draw.text((margin, y_cursor), "SCIENCE HISTORY TODAY", font=font_title_en, fill=(153, 153, 153))
  y_cursor += 36

  # 中文大标题
  draw.text((margin, y_cursor), title_text, font=font_title, fill=(34, 34, 34))
  y_cursor += 84

  # 日期 + 星期
  draw.text((margin, y_cursor), date_text, font=font_date, fill=(102, 102, 102))
  y_cursor += 62
  draw.text((margin, y_cursor), weekday, font=font_week, fill=(102, 102, 102))
  y_cursor += 60

  # 分割线
  draw.line([(margin, y_cursor), (width - margin, y_cursor)], fill=(238, 238, 238), width=2)
  y_cursor += 64

  # 正文条目
  for wl in wrapped:
    for seg in wl:
      draw.text((margin, y_cursor), seg, font=font_item, fill=(51, 51, 51))
      y_cursor += line_h
    y_cursor += 12

  # 页脚
  y_cursor += 8
  draw.line([(margin, y_cursor), (width - margin, y_cursor)], fill=(238, 238, 238), width=2)
  y_cursor += 36

  for line in footer_lines:
    draw.text((margin, y_cursor), line, font=font_footer, fill=(138, 138, 138))
    y_cursor += 34

  return canvas


def main():
  parser = argparse.ArgumentParser(description="生成“科学史上的今天”长图（Kimi + Qwen 校验链路）")
  parser.add_argument("--date", type=str, default="", help="目标日期，格式 YYYY-MM-DD，默认今天")
  parser.add_argument("--header", type=str, default="", help="头图 URL 或本地路径（可选）")
  parser.add_argument("--out", type=str, default="", help="输出文件路径，默认 history_YYYY-MM-DD.png")
  parser.add_argument("--width", type=int, default=1080, help="输出宽度，默认1080")
  parser.add_argument("--api-key", type=str, default="", help="Qwen API Key（可选，优先级高于环境变量 QWEN_API_KEY）")
  parser.add_argument("--kimi-key", type=str, default="", help="Kimi API Key（可选，优先级高于环境变量 KIMI_API_KEY）")

  args = parser.parse_args()

  # 解析日期
  if args.date:
    try:
      target_date = dt.datetime.strptime(args.date, "%Y-%m-%d").date()
    except ValueError:
      raise SystemExit("日期格式错误，请使用 YYYY-MM-DD，如 2025-11-23")
  else:
    target_date = dt.date.today()

  qwen_key = get_qwen_api_key(args.api_key or None)
  kimi_key = get_kimi_api_key(args.kimi_key or None)

  # 通过 Kimi + Qwen 联合生成 Markdown 文本
  md = call_qwen_history_today(target_date, qwen_key, kimi_key)

  # 解析出事件条目
  items = parse_items_from_markdown(md)

  # 默认输出到 Hexo 静态资源目录：source/ScienceHistory/
  # 放在根级子目录，避免与主题的 gallery 路由冲突，路径更简单：/ScienceHistory/...
  default_dir = os.path.join("source", "ScienceHistory")
  os.makedirs(default_dir, exist_ok=True)

  # 1）清理旧的 PNG（只保留最新一张），防止目录里积累历史长图
  for name in os.listdir(default_dir):
    if name.lower().endswith(".png"):
      try:
        os.remove(os.path.join(default_dir, name))
      except OSError:
        pass

  # 2）输出当日文本到 JSON，供前端静态读取
  y, m, d = target_date.year, target_date.month, target_date.day
  weekday = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"][target_date.weekday()]
  data = {
    "date": target_date.strftime("%Y-%m-%d"),
    "date_text": f"{y}年{m}月{d}日",
    "week": weekday,
    "title": "科学史上的今天",
    "items": items,
  }
  json_path = os.path.join(default_dir, "science_today.json")
  with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

  # 3）根据条目生成长图，并固定输出为 science_today.png
  poster = build_poster_from_items(items, args.header, target_date, width=args.width)
  out = args.out or os.path.join(default_dir, "science_today.png")
  poster.save(out, format="PNG")
  print("已生成:", out, "和 JSON:", json_path)


if __name__ == "__main__":
  main()


