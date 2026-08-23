# 科技史本地快照流水线

这里把本机 AstrBot 的 `science-history-today` 与 `dailyNews` 能力移植为可在 GitHub Actions 独立运行的版本：

- `source-policy.md`、`nobel_anniversaries.py` 与 `list_poster.mjs` 原样来自对应 skill；
- `../history_today_poster.py` 负责北京时间日期、Qwen 强制联网研究、来源原文门禁、暂存渲染、事务发布和离线检查；
- 网站只读取 `source/ScienceHistory/science_today.json` 与同目录 PNG；来源 URL 只保留在 `sources/science_today.sources.json` 审核旁路，不进入网页 JSON；
- `.github/workflows/science_history.yml` 每天北京时间 10:00 运行，使用仓库 Secret `QWEN_API_KEY`；成功后提交快照并触发 Pages 构建；
- 定时研究或渲染失败时，三份线上文件都不会被替换，工作流验证旧快照后以失败状态结束。

人工终检稿可通过以下方式生成首份或修订快照；这一路径仍要求每个来源提供短的逐字 `date_quote` 与 `fact_quote`，并在审核旁路标记为 `human-curated`：

```powershell
python tools/history_today_poster.py --date 2026-08-24 --input tools/science_history/research/2026-08-24.json --review-mode human-curated
```

离线门禁：

```powershell
npm run science-history:check
npm run science-history:check-public
```
