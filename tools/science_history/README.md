# 科技史本地快照流水线

本站的“科技史上的今天”以本机 AstrBot 的 `science-history-today` skill 为主生产者：

1. AstrBot 每天北京时间 10:00 完成研究、来源核验和群内长图；
2. 在清理临时文件前，它把一份带 `url`、`date_quote`、`fact_quote` 的候选 JSON 交给 `../dispatch_science_history.py`；
3. 外部凭证只需本仓库的 GitHub `Actions: write` 权限，不能直接修改仓库内容；
4. `.github/workflows/science_history.yml` 解码并校验投递哈希，在 GitHub 端重新抓取每个来源、重新绘制长图，然后一次提交 JSON、PNG 和私有来源旁路；
5. 成功提交后触发既有 Pages 构建。任何接收、来源、渲染或构建失败都会保留上一份成功快照。

机器人只传结构化文本和证据，不传数 MB 的 PNG。GitHub 使用与 AstrBot 完全相同的 `list_poster.mjs` 重绘，因此部署可复现。仓库仍保存以下快照文件：

- `source/ScienceHistory/science_today.json`
- `source/ScienceHistory/science_today.png`

置顶文章只读取 JSON 中的核验文本，不加载或展示 PNG；长图继续保留给 AstrBot 群内发布及归档使用。

来源 URL 只保留在 `sources/science_today.sources.json` 审核旁路，不进入网页 JSON。

## AstrBot 候选稿

候选稿必须使用以下顶层结构，每条来源都保留来源页原语言的短逐字引文：

```json
{
  "date": "2026-08-24",
  "timezone": "Asia/Shanghai",
  "items": [
    {
      "label": "1969年",
      "title": "短标题",
      "text": "45—90字的完整中文事实叙述",
      "category": "science",
      "person_event": false,
      "importance": 5,
      "sources": [
        {
          "url": "https://www.nasa.gov/example",
          "level": "A",
          "authority_type": "official archive",
          "date_context": "event-date",
          "date_quote": "August 24, 1969",
          "fact_quote": "short verbatim source-language fact quote"
        }
      ]
    }
  ]
}
```

本机先做无网络演练：

```powershell
python F:/github/APC-ScienceUnion.github.io/tools/dispatch_science_history.py `
  --input C:/absolute/path/science-history-site-2026-08-24.json `
  --dry-run
```

实际投递首选由 AstrBot 进程环境提供 `APC_GITHUB_ACTIONS_TOKEN`。令牌不能写进 SKILL.md、cron note、JSON、命令行或日志；建议使用仅限本仓库、带到期日且只有 `Actions: write` 的 fine-grained token：

```powershell
python F:/github/APC-ScienceUnion.github.io/tools/dispatch_science_history.py `
  --input C:/absolute/path/science-history-site-2026-08-24.json
```

当前 Windows 主机也可在尚未配置专用令牌时使用 `--use-git-credential`，发布桥会在进程内从现有 Git Credential Manager 取凭证且不会输出它。这个兼容方式通常拥有更宽的仓库权限，只应作为过渡方案：

```powershell
python F:/github/APC-ScienceUnion.github.io/tools/dispatch_science_history.py `
  --input C:/absolute/path/science-history-site-2026-08-24.json `
  --use-git-credential
```

相同日期与正文的重复投递会直接成功且不重新部署；同日不同正文默认拒绝，避免模型重跑时悄悄覆盖已发布版本。确需订正时，应由维护者在 GitHub 手动允许修订。

## 手动兜底与检查

GitHub 不再与 AstrBot 同时在 10:00 独立生成内容。`science_history.yml` 仍可从 Actions 页面不带候选稿手动运行，此时使用原有 Qwen 研究路径作为故障兜底。

人工终检稿仍可直接在可信工作区生成：

```powershell
python tools/history_today_poster.py --date 2026-08-24 --input tools/science_history/research/2026-08-24.json --review-mode human-curated
```

离线门禁：

```powershell
npm run science-history:check
npm run science-history:check-public
```
