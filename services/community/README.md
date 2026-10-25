# 格物社社区与图片服务器

这是 Hexo 静态站点旁的独立 Node.js 24 服务。SQLite 保存账号和评论，Caddy 提供 HTTPS 和图片文件。生产服务不依赖 npm 包，不需要 Redis、独立数据库或付费短信。

## 已实现的行为

- 邮箱验证码注册，邮箱 + 密码登录；昵称唯一，随机几何头像保存在账号种子中。
- UUID `users.id` 是稳定身份，`users.role` 只允许 `user` / `admin`。客户端不能修改角色。
- `ADMIN_EMAIL` 必须在首次上线前配置。此邮箱经验证码验证后注册为管理员，默认昵称为 `guinyの时光`；普通用户无法抢占站长昵称。没有公开的初始化管理接口或默认管理员密码。
- 个人中心可修改昵称、密码和普通用户绑定邮箱。换邮箱需要当前密码和新邮箱验证码；旧邮箱找回码与其他会话随之失效。管理员邮箱只由运维配置管理。
- 找回密码必须设置不同的新密码，随后撤销全部旧会话，用户重新登录。原密码不能查询或发回邮件。
- 每篇文章都有独立评论，中英文翻译共享文章身份。新增 `community_comments: false` 可单独关闭；旧的 `comments: false` 属于原主题插件配置，不会意外隐藏新评论区。
- 首页侧栏留言板要求登录，注册统计只计算已完成邮箱验证的账号。
- 评论仅以纯文本显示，作者及管理员可以移除评论；数据库保留移除记录。

## 本地预览

在仓库根目录运行 `npx hexo server --port 4000`，在另一个终端进入本目录运行 `node src/dev.js`。打开 `http://localhost:4000/account/`。

本地测试账号为 `preview@example.test`，密码为 `LocalPreview-2026!`，仅存在于 `data/preview.sqlite`。测试邮件写入本机 `data/preview-mail.jsonl`，不发送真实邮件，也不由 API 返回验证码。该服务拒绝在 `NODE_ENV=production` 下运行。生产数据库及安装包不含预览账号。

## 上线配置

1. 确認上海服务器域名的 ICP 备案与腾讯云接入条件。域名 DNS 目前托管在 Cloudflare，应在那里添加 `api`、`img` 的 A 记录。记录应指向实际服务器地址；不要修改现有博客根域名。
2. 在 Resend 创建 `notify.apc-science.cn` 发信域名，按控制台实际给出的 DKIM / SPF 验证值添加 TXT、CNAME 或 MX 记录并验证，不要修改根域名原有的邮箱记录。使用仅发信权限、限定到这个域名的 API Key。不要把密钥放进 Hexo 配置或浏览器。
3. 安装 Node.js 24.14.0 或更新的 Node 24 LTS，以及 Caddy。只开放网站需要的 TCP 80/443；API 监听 `127.0.0.1:8787`，SQLite 不监听网络。
4. 复制 `.env.example` 为服务器的 `/etc/apc-community.env`，设置 `APP_SECRET`（32 字节随机值）、真实 `ADMIN_EMAIL`、`MAIL_FROM`、`RESEND_API_KEY`。服务器文件权限设为 root 所有、`600`。
5. 生产路径设置为 `DATABASE_PATH=/var/lib/apc-community/community.sqlite`、`TOPICS_FILE=/var/lib/apc-community/community-topics.json`、`TRUST_PROXY=true`。域名来源列表只允许博客真实 HTTPS 域名。
6. 构建博客，执行 `node tools/server_assets.js prepare public tmp/community-deploy`。上传 `media/` 内的文件到 `/srv/apc-media/`，保持完整相对路径；上传文章清单到上述 `TOPICS_FILE`。同步时不要删除旧图片，旧文章和缓存仍可能需要它们。
7. 以 root 执行 `bash deploy/install.sh` 安装应用和 systemd 服务。安装脚本只管理本应用目录。将 `deploy/Caddyfile` 安装或合并到 Caddy 配置并先运行 `caddy validate`，再加载。
8. 检查 `/api/health`、HTTPS、实际图片和邮件投递后，设置根目录 `_config.yml` 的 `community.api_url` / `image_server.url`，或构建环境变量 `COMMUNITY_API_URL=https://api.apc-science.cn`、`IMAGE_HOST_URL=https://img.apc-science.cn`。
9. 运行现有图片一致性检查后，再执行 `node tools/server_assets.js rewrite public https://img.apc-science.cn`，最后发布静态站点。重写脚本也生成 Netlify 图片重定向，覆盖脚本动态拼接的旧地址。每日快照元数据保留本地路径，其实际图片由前端映射到图片域名。
10. 用配置的管理员邮箱正常注册，收取验证码并自行设置密码。切勿将数据库、`.env`、SSH 私钥、备份或本地测试文件放入静态发布目录。

备案或域名验证未完成时，可使用 `deploy/Caddyfile.staging` 在服务器的 `127.0.0.1:8080` 检查服务；该配置明确绑定回环地址。正式配置通过检查后再切换 `deploy/Caddyfile`。个人备案须与网站实际主办者和内容相符，社团/单位性质的网站不能直接改填成个人博客。

## 当前下线状态与恢复顺序

2026-10-25 已核对 ICP 审核通过，网站备案号为 `沪ICP备2026055463号-1`。站长决定本次只恢复文章和图片，账号、评论、留言暂缓开放。当前构建使用 `community.enable: false`，隐藏相关菜单和互动区域；直接访问个人中心仅显示尚未开放提示。服务器使用 `Caddyfile.images-only`，图片正常提供 HTTPS，API 只开放健康检查，账号和评论请求返回 503。完整实现和 `Caddyfile` 保留供后续启用。

公安联网备案仍需单独办理，尚无公安备案号，不展示占位或虚构号码。后续开放评论前，应补齐适用的真实身份认证、用户协议、隐私告知和内容管理流程；邮箱验证码本身不等于真实身份认证。参见[《互联网跟帖评论服务管理规定》第四条](https://www.cac.gov.cn/2022-11/16/c_1670253725725039.htm)。以下为此前下线操作及恢复步骤记录。

2026-10-11 按站长要求停止公开访问，站点内容和源代码保留。博客实际由 Netlify 提供页面，经 Cloudflare 代理；仓库还配置了独立的 GitHub Pages 入口。以下三处已分别停用，单独恢复其中一处不代表整个站点已恢复：

- Cloudflare 自定义规则 `Blog offline pending filing` 对 `apc-science.cn` 和 `www.apc-science.cn` 执行 Block；当前域名返回 403。其他子域名和邮件验证记录未改动。
- Netlify 的 `apc-science` 项目处于 Disabled，默认地址 `apc-science.netlify.app` 返回 404。项目与历史部署保留。
- GitHub 仓库的 Pages 来源分支设为 `None`，原配置为 `main` 的根目录；`apc-scienceunion.github.io` 返回 404。向仓库推送构建文件不会自动恢复这个来源设置。

在站长要求保持下线期间，不要启用 Netlify 项目、恢复 Pages 来源或关闭上述拦截规则。备案申请由站长安排的人员处理；以控制台的实际批准结果和接入条件为准，接到审核电话、提交初审或完成域名转入均不等于备案通过。

待备案和接入条件满足、站长决定恢复后，先在网站下线状态下同步最新图片与文章清单，配置并验证图片及账号接口的 HTTPS，再发布对应的静态构建。确认无缺图、评论身份正确后，启用 Netlify 项目，并仅停用上述临时 Cloudflare 规则。最后验证主域名、www、图片、注册邮件、登录、密码重置与评论；GitHub Pages 的备用入口按站长需要另行恢复，不是 Netlify 上线的前提。

## 后续图片和文章更新

已有定时任务会更新每日图片并触发 Pages 构建。启用服务器图床后，每次发布都必须先同步图片和 `community-topics.json`，确认服务可用，再发布含服务器地址的页面。`deploy/publish.sh` 提供 Linux/CI 上传流程，需要显式设置主机、SSH 用户、专用密钥和已核对的主机指纹；不要关闭 SSH 主机身份检查。

自动发布应使用权限仅限图片和文章清单的专用部署账号，不能使用临时调试密钥或生产 Resend 密钥。一次性部署后移除临时公钥。仓库提供 CI 接入口，但配置未就绪时不会自动启用。

生产自动部署使用 `apc-publish` 专用账号。SSH 公钥设置 `restrict` 和固定 `restricted-ssh.py` 入口，仅允许 `rrsync` 写入 `/srv` 下该账号拥有的图片、清单目录，禁止下载、删除、端口转发和交互终端，并将符号链接作无效化处理；唯一允许的 sudo 命令是 root 所有的 `accept-publish.py`。服务配置、数据库与邮件密钥不可由部署账号读写。客户端远端路径 `/apc-media/`、`/apc-publish/` 相对于受限根目录 `/srv`。GitHub Actions 使用 `APC_PUBLISH_KEY` 与已核对的 `APC_KNOWN_HOSTS` secrets，不关闭主机身份校验。

设置了 `COMMUNITY_API_URL` 或 `IMAGE_HOST_URL` 时，构建要求同时启用 `APC_SERVER_ENABLED=true`；同步或服务检查失败就停止发布，避免发布缺图页面或缺失新文章评论权限。

## 运维与恢复

- 服务：`systemctl status apc-community`；日志：`journalctl -u apc-community`。应用日志不输出验证码、密码、邮箱或密钥。
- 备份：`systemctl start apc-community-backup`，或者在正确环境下运行 `node src/backup.js`。SQLite 在线备份会包含 WAL 中的已提交数据，不能用运行中的裸数据库文件复制代替。
- 定时备份每日 03:15 运行，文件在 `/var/lib/apc-community/backups`，仅服务用户可读取。应将备份复制到独立存储，并按容量管理保留期限。
- 恢复：先停止服务，保存当前数据库和 `-wal` / `-shm` 文件，再从经过完整性检查的备份恢复到新的数据库路径。切换配置后启动并验证，保留原文件以便回退。
- 代码版本在 `/opt/apc-community/releases/`；回退 `current` 链接即可回退代码。修改数据库结构前必须先做可恢复备份。
- 验证码 10 分钟有效，5 次错误锁定；发信同邮箱间隔 60 秒，并限制每个 IP 和邮箱请求量。默认硬限制每日 90 封、每月 2,900 封，避免超出 Resend 免费额度。未使用的验证码只保存 HMAC；会话只保存哈希。
- 会话使用 `HttpOnly`、`Secure`、`SameSite=Lax` 的 host-only Cookie，并检查精确 Origin 与自定义请求头。API 与博客应处在同一主域下；外域的临时预览站不能直接共用生产登录。
- 生产按单进程运行。密码运算并发最多 4 个；应用内存上限 512MB。限流状态保存在 SQLite，重启不会重置邮件额度。

## 验证命令

```text
npm test --prefix services/community
node --test tests/test_server_assets.js
npx hexo generate
node tests/test_community_pages.js
node tests/test_site_navigation.js
node tests/test_daily_local_images.js
python tools/localize_gallery_images.py --check
```

官方参考：[Resend 免费额度](https://resend.com/pricing)、[发信域名验证](https://resend.com/docs/dashboard/domains/introduction)、[腾讯云轻量服务器 ICP 备案](https://cloud.tencent.com/document/product/1207/45756)。
