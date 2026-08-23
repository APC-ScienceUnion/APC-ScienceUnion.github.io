#!/usr/bin/env node
/**
 * Generic numbered-list poster renderer used by AstrBot information digests.
 *
 * Input JSON schema:
 * {
 *   "kicker": "SCIENCE HISTORY",
 *   "title": "科技史上的今天",
 *   "subtitle": "2026年8月10日 · 15条科学坐标",
 *   "theme": "history" | "astronomy" | "news",
 *   "items": [
 *     {"label":"1846年", "title":"史密森学会成立", "text":"一句完整叙述", "source_mark":"[1]", "chart_path":"可选绝对路径"}
 *   ],
 *   "footer": ["图像制作：格物社/A.P.C.科学联盟", "灵感赖渊：缪卿九 "]
 * }
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { dirname, extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = resolve(__dirname, "..", "..", "temp", "list-posters");
const TEMP_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_ITEMS = 24;
const MAX_ITEM_TEXT = 220;
const MAX_TOTAL_TEXT = 5500;
const MAX_OUTPUT_HEIGHT = 16000;
const MAX_CHART_BYTES = 8 * 1024 * 1024;
const HISTORY_FOOTER = Object.freeze([
  "图像制作：格物社/A.P.C.科学联盟",
  "灵感赖渊：缪卿九 ",
]);
const CHART_MIME_TYPES = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);

const THEMES = {
  history: {
    accent: "#2f6feb",
    accent2: "#68a0ff",
    ink: "#172033",
    muted: "#667085",
    paper: "#f7f9fc",
    header:
      "radial-gradient(circle at 78% 22%, rgba(116,168,255,.55), transparent 26%), linear-gradient(135deg,#101b36 0%,#203d75 55%,#315b9a 100%)",
  },
  astronomy: {
    accent: "#8b7cff",
    accent2: "#54d6ff",
    ink: "#eaf0ff",
    muted: "#aab6d4",
    paper: "#07101f",
    header:
      "radial-gradient(circle at 78% 26%, rgba(84,214,255,.42), transparent 22%), radial-gradient(circle at 25% 10%, rgba(139,124,255,.5), transparent 30%), linear-gradient(145deg,#060a18,#111c3b 58%,#162e51)",
  },
  news: {
    accent: "#258e9f",
    accent2: "#7ec8d2",
    ink: "#1f2937",
    muted: "#667085",
    paper: "#ffffff",
    header:
      "radial-gradient(circle at 78% 22%, rgba(126,200,210,.52), transparent 28%), linear-gradient(135deg,#173b48,#277b88 58%,#49a3aa)",
  },
};

function cleanupTempImages(maxAgeMs = TEMP_MAX_AGE_MS) {
  try {
    const now = Date.now();
    for (const file of readdirSync(TEMP_DIR)) {
      const path = join(TEMP_DIR, file);
      try {
        const stat = statSync(path);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) unlinkSync(path);
      } catch {}
    }
  } catch {}
}

function tempOutputPath() {
  mkdirSync(TEMP_DIR, { recursive: true });
  return join(
    TEMP_DIR,
    `poster_${Date.now()}_${Math.random().toString(36).slice(2)}.png`,
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function chartDataUri(value, index) {
  const input = String(value || "").trim();
  if (!input) return "";
  if (!isAbsolute(input)) {
    throw new Error(`第 ${index + 1} 条 chart_path 必须是绝对路径`);
  }
  const path = resolve(input);
  if (!existsSync(path)) throw new Error(`第 ${index + 1} 条图表不存在：${path}`);
  const stat = statSync(path);
  if (!stat.isFile()) throw new Error(`第 ${index + 1} 条 chart_path 不是文件`);
  if (stat.size <= 0 || stat.size > MAX_CHART_BYTES) {
    throw new Error(`第 ${index + 1} 条图表大小必须在 1 字节到 8 MB 之间`);
  }
  const mime = CHART_MIME_TYPES.get(extname(path).toLowerCase());
  if (!mime) throw new Error(`第 ${index + 1} 条图表只支持 PNG、JPEG 或 WebP`);
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

function normalizeInput(raw, themeOverride, minItems, requireCharts = false) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("输入必须是 JSON 对象");
  }
  const title = String(raw.title || "").trim();
  if (!title) throw new Error("缺少 title");
  if (!Array.isArray(raw.items)) throw new Error("items 必须是数组");
  if (raw.items.length < minItems) {
    throw new Error(`条目不足：需要至少 ${minItems} 条，实际 ${raw.items.length} 条`);
  }
  if (raw.items.length > MAX_ITEMS) {
    throw new Error(`条目超过 ${MAX_ITEMS} 条，请精简或分页`);
  }

  let totalTextLength = 0;
  const fingerprints = new Set();
  const items = raw.items.map((item, index) => {
    const data = typeof item === "string" ? { text: item } : item || {};
    const text = String(data.text || "").trim();
    if (!text) throw new Error(`第 ${index + 1} 条缺少 text`);
    if (text.length > MAX_ITEM_TEXT) {
      throw new Error(`第 ${index + 1} 条正文超过 ${MAX_ITEM_TEXT} 个字符`);
    }
    const label = String(data.label || data.date || "").trim();
    const itemTitle = String(data.title || "").trim();
    if (label.length > 30) throw new Error(`第 ${index + 1} 条 label 过长`);
    if (itemTitle.length > 60) throw new Error(`第 ${index + 1} 条 title 过长`);
    const fingerprint = `${label}\u0000${itemTitle}\u0000${text}`;
    if (fingerprints.has(fingerprint)) throw new Error(`第 ${index + 1} 条与前文重复`);
    fingerprints.add(fingerprint);
    totalTextLength += label.length + itemTitle.length + text.length;
    const chartData = chartDataUri(data.chart_path, index);
    if (requireCharts && !chartData) {
      throw new Error(`第 ${index + 1} 条缺少 chart_path；当前任务要求每条都配图`);
    }
    return {
      label,
      title: itemTitle,
      text,
      sourceMark: String(data.source_mark || "").trim(),
      chartData,
      chartCaption: String(data.chart_caption || "").trim(),
    };
  });
  if (totalTextLength > MAX_TOTAL_TEXT) {
    throw new Error(`正文总字符超过 ${MAX_TOTAL_TEXT}，请精简或分页`);
  }

  const themeName = String(themeOverride || raw.theme || "news").toLowerCase();
  if (!THEMES[themeName]) {
    throw new Error(`未知 theme：${themeName}；可选 history、astronomy、news`);
  }
  return {
    kicker: String(raw.kicker || "CURATED DIGEST").trim(),
    title,
    subtitle: String(raw.subtitle || "").trim(),
    deck: String(raw.deck || "").trim(),
    themeName,
    items,
    footer:
      themeName === "history"
        ? [...HISTORY_FOOTER]
        : Array.isArray(raw.footer)
          ? raw.footer.map((line) => String(line).trim()).filter(Boolean).slice(0, 4)
          : [],
  };
}

function buildHtml(data, width) {
  const theme = THEMES[data.themeName];
  const dark = data.themeName === "astronomy";
  const itemHtml = data.items
    .map((item, index) => {
      const label = item.label
        ? `<span class="label">${escapeHtml(item.label)}</span>`
        : "";
      const title = item.title
        ? `<strong>${escapeHtml(item.title)}</strong><span class="dot"> · </span>`
        : "";
      const source = item.sourceMark
        ? `<sup>${escapeHtml(item.sourceMark)}</sup>`
        : "";
      const chart = item.chartData
        ? `<figure class="chart"><img src="${item.chartData}" alt="${escapeHtml(item.chartCaption || item.title || "数据图")}">${item.chartCaption ? `<figcaption>${escapeHtml(item.chartCaption)}</figcaption>` : ""}</figure>`
        : "";
      return `<li>
        <span class="num">${String(index + 1).padStart(2, "0")}</span>
        <div class="item-body"><p>${label}${title}${escapeHtml(item.text)}${source}</p>${chart}</div>
      </li>`;
    })
    .join("");
  const footerHtml = data.footer
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  :root {
    --accent: ${theme.accent};
    --accent2: ${theme.accent2};
    --ink: ${theme.ink};
    --muted: ${theme.muted};
    --paper: ${theme.paper};
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${width}px; background: var(--paper); overflow-wrap: anywhere; word-break: break-word; }
  body { font-family: "Microsoft YaHei", "Noto Sans SC", "PingFang SC", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .poster { width: ${width}px; overflow: hidden; background: var(--paper); color: var(--ink); }
  .header {
    position: relative; min-height: 330px; padding: 62px 72px 58px;
    color: white; background: ${theme.header}; overflow: hidden;
  }
  .header::before, .header::after {
    content: ""; position: absolute; border: 1px solid rgba(255,255,255,.14); border-radius: 50%;
  }
  .header::before { width: 420px; height: 420px; right: -100px; top: -220px; }
  .header::after { width: 250px; height: 250px; right: 85px; top: -120px; }
  .kicker { position: relative; z-index: 2; font-size: 24px; font-weight: 700; letter-spacing: 5px; opacity: .78; }
  h1 { position: relative; z-index: 2; margin: 15px 0 12px; font-size: 68px; line-height: 1.16; letter-spacing: 1px; }
  .subtitle { position: relative; z-index: 2; font-size: 32px; font-weight: 600; opacity: .95; }
  .deck { position: relative; z-index: 2; margin-top: 15px; max-width: 850px; font-size: 25px; line-height: 1.55; opacity: .76; }
  .content { padding: 46px 70px 28px; }
  ol { list-style: none; margin: 0; padding: 0; }
  li { display: grid; grid-template-columns: 58px 1fr; gap: 18px; align-items: start; padding: 21px 0 23px; border-bottom: 1px solid ${dark ? "rgba(170,190,230,.16)" : "#e7ebf1"}; }
  .num { width: 50px; height: 50px; display: inline-flex; align-items: center; justify-content: center; margin-top: 2px; border-radius: 11px; color: white; background: linear-gradient(135deg,var(--accent),var(--accent2)); font-size: 22px; font-weight: 800; box-shadow: 0 7px 18px ${dark ? "rgba(84,214,255,.10)" : "rgba(47,111,235,.16)"}; }
  li p { margin: 0; font-size: 31px; line-height: 1.62; font-weight: 400; }
  .item-body { min-width: 0; }
  .chart { margin: 24px 0 4px; padding: 12px; border: 1px solid ${dark ? "rgba(170,190,230,.2)" : "#dce3ee"}; border-radius: 16px; background: ${dark ? "rgba(10,19,39,.72)" : "#f9fbfe"}; overflow: hidden; }
  .chart img { display: block; width: 100%; height: auto; max-height: 1080px; object-fit: contain; border-radius: 10px; }
  .chart figcaption { margin: 12px 8px 2px; color: var(--muted); font-size: 21px; line-height: 1.5; }
  li strong { font-weight: 750; }
  .label { display: inline-block; margin-right: 12px; color: var(--accent2); font-size: 25px; font-weight: 750; letter-spacing: .3px; }
  .dot { color: var(--muted); }
  sup { margin-left: 5px; color: var(--accent2); font-size: 17px; font-weight: 700; }
  .footer { margin: 0 70px; padding: 26px 0 48px; border-top: 2px solid ${dark ? "rgba(170,190,230,.2)" : "#dde3ec"}; }
  .footer p { margin: 4px 0; color: var(--muted); font-size: 22px; line-height: 1.55; }
</style>
</head>
<body><main class="poster">
  <header class="header">
    <div class="kicker">${escapeHtml(data.kicker)}</div>
    <h1>${escapeHtml(data.title)}</h1>
    <div class="subtitle">${escapeHtml(data.subtitle)}</div>
    ${data.deck ? `<div class="deck">${escapeHtml(data.deck)}</div>` : ""}
  </header>
  <section class="content"><ol>${itemHtml}</ol></section>
  <footer class="footer">${footerHtml}</footer>
</main></body></html>`;
}

function clampInteger(value, fallback, min, max, label) {
  const parsed = Number.parseInt(String(value), 10);
  const actual = Number.isFinite(parsed) ? parsed : fallback;
  if (actual < min || actual > max) {
    throw new Error(`${label} 必须在 ${min}—${max} 之间`);
  }
  return actual;
}

export async function generateListPoster({
  data,
  width = 1080,
  scale = 2,
  outPath,
  minItems = 1,
  requireCharts = false,
  force = false,
}) {
  cleanupTempImages();
  const safeWidth = clampInteger(width, 1080, 720, 1600, "width");
  const safeScale = clampInteger(scale, 2, 1, 2, "scale");
  const safeMinItems = clampInteger(minItems, 1, 1, MAX_ITEMS, "minItems");
  const normalized = normalizeInput(data, "", safeMinItems, Boolean(requireCharts));
  const finalPath = resolve(outPath || tempOutputPath());
  if (existsSync(finalPath) && !force) {
    throw new Error(`输出文件已存在：${finalPath}；请使用唯一文件名或 --force`);
  }
  mkdirSync(dirname(finalPath), { recursive: true });
  const partialPath = `${finalPath}.partial`;
  try {
    if (existsSync(partialPath)) unlinkSync(partialPath);
  } catch {}

  const puppeteer = await import("puppeteer");
  const launch = puppeteer.default?.launch ?? puppeteer.launch;
  const browser = await launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: safeWidth, height: 900, deviceScaleFactor: safeScale });
    await page.setContent(buildHtml(normalized, safeWidth), { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const poster = await page.$(".poster");
    if (!poster) throw new Error("未找到 .poster 元素");
    const bounds = await poster.boundingBox();
    if (!bounds) throw new Error("无法测量长图尺寸");
    if (bounds.height * safeScale > MAX_OUTPUT_HEIGHT) {
      throw new Error(
        `长图预计高 ${Math.ceil(bounds.height * safeScale)}px，超过 ${MAX_OUTPUT_HEIGHT}px；请精简或分页`,
      );
    }
    await poster.screenshot({ path: partialPath, type: "png" });
    renameSync(partialPath, finalPath);
  } finally {
    await browser.close();
    try {
      if (existsSync(partialPath)) unlinkSync(partialPath);
    } catch {}
  }
  return finalPath;
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      input: { type: "string", default: "" },
      out: { type: "string", default: "" },
      width: { type: "string", default: "1080" },
      scale: { type: "string", default: "2" },
      theme: { type: "string", default: "" },
      "min-items": { type: "string", default: "1" },
      "require-charts": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: true,
  });
  if (args.help) {
    console.log(
      "Usage: node list_poster.mjs --input digest.json [--out poster.png] [--width 1080] [--scale 1|2] [--theme history|astronomy|news] [--min-items 1] [--require-charts] [--force]",
    );
    return;
  }
  if (!args.input) throw new Error("缺少 --input JSON 文件");
  const width = clampInteger(args.width, 1080, 720, 1600, "width");
  const scale = clampInteger(args.scale, 2, 1, 2, "scale");
  const minItems = clampInteger(args["min-items"], 1, 1, MAX_ITEMS, "min-items");
  const raw = JSON.parse(readFileSync(resolve(args.input), "utf8").replace(/^\uFEFF/, ""));
  if (args.theme) raw.theme = args.theme;
  const outPath = args.out ? resolve(args.out) : tempOutputPath();
  const result = await generateListPoster({
    data: raw,
    width,
    scale,
    outPath,
    minItems,
    requireCharts: args["require-charts"],
    force: args.force,
  });
  console.log(result);
}

const isDirect = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });
}
