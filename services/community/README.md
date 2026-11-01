# 格物社社区与图片服务器

这是 Hexo 静态站点旁的独立 Node.js 24 服务。SQLite 保存账号和评论，Caddy 提供 HTTPS 和图片文件。生产服务不依赖 npm 包，不需要 Redis、独立数据库或付费短信。

## 已实现的行为

- 邮箱验证码注册，邮箱 + 密码登录；昵称唯一，随机几何头像保存在账号种子中。
- UUID `users.id` 是稳定身份，`users.role` 只允许 `user` / `admin`。客户端不能修改角色。
- `ADMIN_EMAIL` 必须在首次上线前配置。此邮箱经验证码验证后注册为管理员，默认昵称为 `guinyの时光`；普通用户无法抢占站长昵称。没有公开的初始化管理接口或默认管理员密码。
- 个人中心可修改昵称、密码和普通用户绑定邮箱。换邮箱需要当前密码和新邮箱验证码；旧邮箱找回码与其他会话随之失效。管理员邮箱只由运维配置管理。
- 找回密码必须设置不同的新密码，随后撤销全部旧会话，用户重新登录。原密码不能查询或发回邮件。
- 每篇文章都有独立评论，中英文翻译共享文章身份。新增 `community_comments: false` 可单独关闭；旧的 `comments: false` 属于原主题插件配置，不会意外隐藏新评论区。
- 首页侧栏留言板要求登录；生产评论和留言还必须完成微信手机号验证，注册统计只计算已完成邮箱验证的账号。
- 评论仅以纯文本显示，作者及管理员可以移除评论；数据库保留移除记录。站长个人中心可分页查看所有文章评论和留言并移除，管理列表不返回邮箱或手机号。

## 本地预览

在仓库根目录分别打开两个终端：

```powershell
# 终端一：启用仅用于本地的社区预览，绑定回环地址
npx hexo server --config '_config.yml,_config.community-preview.yml' --output tmp/community-preview-cache --ip 127.0.0.1 --port 4000

# 终端二：本地账号 API 与模拟邮件
node services/community/src/dev.js
```

打开 `http://127.0.0.1:4000/account/`，可预览注册、登录、个人中心与找回密码；文章下方显示评论，首页侧栏显示留言板与注册人数。预览配置不会修改正式的 `community` 设置，生成文件和 Hexo 缓存放在被 Git 忽略的 `tmp/community-preview-*`，与正式 `public/` 分开。正式部署不加载这份配置。

如果 4000 端口已有服务，将终端一的端口改为 4001，并在终端二启动前运行 `$env:PREVIEW_SITE_PORT='4001'`。不要停止其他任务占用的服务。API 始终监听本机 `127.0.0.1:8787`；无论从哪个目录启动，其数据库与模拟邮件都固定保存在 `services/community/data/`。

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
9. 运行现有图片一致性检查后，再执行 `node tools/server_assets.js rewrite public https://img.apc-science.cn`，最后发布静态站点。保留同路径静态图片作为备用，不再生成图片强制重定向；前端在服务器报错或超时时回退本站图片。每日快照元数据保留本地路径，其实际图片由前端映射到图片域名。
10. 用配置的管理员邮箱正常注册，收取验证码并自行设置密码。切勿将数据库、`.env`、SSH 私钥、备份或本地测试文件放入静态发布目录。

备案或域名验证未完成时，可使用 `deploy/Caddyfile.staging` 在服务器的 `127.0.0.1:8080` 检查服务；该配置明确绑定回环地址。正式配置通过检查后再切换 `deploy/Caddyfile`。个人备案须与网站实际主办者和内容相符，社团/单位性质的网站不能直接改填成个人博客。

## 当前开放状态与恢复记录

2026-10-25 已核对 ICP 审核通过，网站备案号为 `沪ICP备2026055463号-1`。站长决定本次只恢复文章和图片，账号、评论、留言暂缓开放。当前构建使用 `community.enable: false`，隐藏相关菜单和互动区域；直接访问个人中心仅显示尚未开放提示。服务器使用 `Caddyfile.images-only`，图片正常提供 HTTPS，API 开放健康检查及 `/api/visits` 访客统计，账号和评论请求返回 503。完整实现和 `Caddyfile` 保留供后续启用。上海服务器统计自北京时间 2026-10-26 23:35 开始，未合并原不蒜子累计数，详见 [访客统计说明](VISITOR_STATS.md)。

2026-10-30 已登录公安备案平台核对：网站于 2026-10-28 15:10 审核通过，状态为“有效”，公安备案号为 `沪公网安备31011202023849号`。博客页脚展示官方图标及[备案查询链接](https://beian.mps.gov.cn/#/query/webSearch?code=31011202023849)。图标取自公安备案平台 `https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png`，保存为主题静态资源 `img/mps-beian.png`，不依赖第三方图片加载。当前申请的互联网交互服务项为“否”；后续开放评论前，应核对备案信息变更要求，并补齐适用的真实身份认证、用户协议、隐私告知和内容管理流程；邮箱验证码本身不等于真实身份认证。参见[《互联网跟帖评论服务管理规定》第四条](https://www.cac.gov.cn/2022-11/16/c_1670253725725039.htm)。以下为此前下线操作及恢复步骤记录。

2026-10-11 按站长要求停止公开访问，站点内容和源代码保留。博客实际由 Netlify 提供页面，经 Cloudflare 代理；仓库还配置了独立的 GitHub Pages 入口。以下三处已分别停用，单独恢复其中一处不代表整个站点已恢复：

- Cloudflare 自定义规则 `Blog offline pending filing` 对 `apc-science.cn` 和 `www.apc-science.cn` 执行 Block；当前域名返回 403。其他子域名和邮件验证记录未改动。
- Netlify 的 `apc-science` 项目处于 Disabled，默认地址 `apc-science.netlify.app` 返回 404。项目与历史部署保留。
- GitHub 仓库的 Pages 来源分支设为 `None`，原配置为 `main` 的根目录；`apc-scienceunion.github.io` 返回 404。向仓库推送构建文件不会自动恢复这个来源设置。

在站长要求保持下线期间，不要启用 Netlify 项目、恢复 Pages 来源或关闭上述拦截规则。备案申请由站长安排的人员处理；以控制台的实际批准结果和接入条件为准，接到审核电话、提交初审或完成域名转入均不等于备案通过。

待备案和接入条件满足、站长决定恢复后，先在网站下线状态下同步最新图片与文章清单，配置并验证图片及账号接口的 HTTPS，再发布对应的静态构建。确认无缺图、评论身份正确后，启用 Netlify 项目，并仅停用上述临时 Cloudflare 规则。最后验证主域名、www、图片、注册邮件、登录、密码重置与评论；GitHub Pages 的备用入口按站长需要另行恢复，不是 Netlify 上线的前提。

## 评论身份认证（2026-11-01，正式账号联调中）

站长已要求继续推进身份认证，但暂不接受短信费用，优先寻找免费方案。未开通付费认证服务，未恢复生产账号、评论或留言。邮箱注册、密码登录和找回密码实现保留；身份核验应作为首次发言前的独立步骤，不将邮箱验证或普通第三方登录直接视为真实身份核验。

- 阿里云 **号码认证服务 PNVS 的短信认证**明确支持个人实名认证账号和 Web，无需企业营业执照，使用预置签名/模板；这是普通短信服务 SMS 之外的产品。小用量公开按量价为 0.06 元/条，用户已暂不采用。依据：[个人接入指南](https://help.aliyun.com/zh/pnvs/use-cases/sms-verify-for-individual-developers)、[产品选型和价格](https://help.aliyun.com/zh/sms/product-overview/selection-guide-for-short-message-service-and-sms-verification-service)。不要将赠送签名误读为免费发送额度。
- 免费候选为 **Authing「小登录」/ 微信 PC 小程序扫码**。官方文档称可免费获取手机号，可使用 Authing 提供的小程序；公开价格页列出免费版 8,000 月活跃用户、1 个社交账号连接和 1 个应用。尚需登录控制台核对当前免费版实际权限、是否另收手机号调用费用及移动端体验，并完成真实授权测试，不能据此宣称已获得长期免费服务。依据：[短信配置中的免费小登录说明](https://docs.authing.cn/v2/guides/userpool-config/sms/)、[小程序扫码接入](https://docs.authing.cn/v2/guides/wechat-ecosystem/wechat-miniprogram-qrcode/)、[价格页](https://www.authing.cn/pricing)。该免费版的短信仅共计 10 条，不能作为持续免费短信方案。
- 国家网络身份认证公共服务允许互联网平台自愿接入，但尚未核实个人博客的具体申请入口和接入条件，不将公众免费申领网号网证等同于本站已获接口资格。依据：[管理办法](https://www.cac.gov.cn/2025-05/23/c_1749711107835487.htm)。

控制台和真实测试进度（2026-10-31）：

- 已创建 `APC 博客读者` B2C 免费用户池，创建前取消了 30 天体验期；使用自带的标准 Web 示例应用，没有购买套餐。
- 已创建默认公有云 `PC 小程序扫码` 身份源 `apc-wechat-phone` 并关联示例应用。自动账号绑定关闭，仅配置本机回调 `http://127.0.0.1:8787/api/identity/callback`。应用采用 RS256 / client_secret_post，仅保留 authorization_code 授权模式，保留知情同意页。
- 初次扫码提示无权限，原因是应用访问规则默认为“所有人：拒绝”。经站长当次确认，已为该单个扫码账号保存 7 天允许规则，其他账号仍拒绝。
- 实际 OIDC Token / JWKS / UserInfo 请求成功，但即使请求 `prompt=login` 和 `max_age=1`，ID Token 仍不含 `auth_time`，且 `phone_number_verified` 为布尔 `false`。不能直接将登录成功视作手机号验证成功，也没有手动修改这个标记。
- 改为通过相同用户的 Access Token 调用官方 `/api/v3/get-identities`，核对微信 `openid` 身份、精确身份源 ID、连接 ID、身份源原始手机号与 UserInfo 号码一致。**本机真实的微信手机号来源验证已通过，并已绑定本地预览账号**。截图保存在 Git 忽略的 `tmp/community-deploy/community-identity-bound.png`。这不代表生产管理员已注册、长期免费额度保证或全部上线要求。

服务端实现：

- `src/authing-phone.js` 使用授权码 + PKCE，只请求 `openid phone`；事务有效期 5 分钟，绑定当前会话，网络请求前一次性消费，重启后须重新发起。固定 HTTPS issuer 和端点，校验 RS256、audience、nonce、有效期、新签发时间及 UserInfo subject 一致。默认模式仍严格要求新认证时间和 `phone_number_verified === true`。
- 微信来源模式额外固定 source / connection，只有唯一的匹配微信 openid 身份及来源手机号一致才接受；缺失、冲突、其他连接、可编辑资料号码不匹配均拒绝。来源验证不证明第三方重新登录时间；绑定时另要求本站当前密码、原会话和号码二次确认。生产允许显式配置该来源模式，仍强制 HTTPS；没有固定微信来源的普通 OIDC 模式仍要求有效的 `auth_time` 和已验证号码标记。
- `src/identity-store.js` 保存独立的账号身份表，手机号使用 AES-256-GCM 加密并绑定本地用户 ID，手机号和外部身份索引使用分用途 HMAC。一个手机号或外部身份只能绑定一个账号，不静默覆盖旧绑定，不改变本站 UUID / 角色。返回个人中心的只有脱敏号码。
- `app.js` 已实现本地绑定路由：POST `/api/identity/start` 要求本站登录、正确密码和同意验证；GET callback 绑定原会话和密码版本；GET `/api/identity/status` 提供脱敏号码和一次性确认凭据；POST `/api/identity/confirm` 显式确认后入库。POST `/api/identity/cancel` 撤销当前会话未完成的绑定。退出、换账号、改密码、超时或重放都不能继续绑定。
- 生产总是要求评论和留言写入者已绑定身份，管理员也不能绕过；未配置提供器时只关闭新验证，不放宽评论门禁。个人中心已接入验证、脱敏号码确认和取消流程；取消或重新发起会使处理中回调失效。浏览器真实联调已验证本地绑定、留言、文章评论、旧评论昵称同步，以及测试管理员查看和移除评论。新增账号与隐私说明，告知公开字段、邮件及手机号服务商、必要会话 Cookie 和移除内容的处理方式。
- 自动化测试使用模拟身份提供器，覆盖来源冲突、跨账号绑定、会话撤销、取消、重放、字段伪造、加密存储及评论门禁；真实微信授权与本地预览账号绑定另外通过浏览器验证。两类证据不能互相替代。
- 本次 71 项服务测试通过。隔离构建共生成 2,336 个文件，启用社区时的 298 个中英文文章页、两种语言个人中心和首页留言板/注册数入口均通过检查；浏览器实测注册人数为 2（仅本地测试账号）。线上健康检查为 200，账号及评论接口保持 503。
- 官方将该身份源标为 PC 网站扫码场景，页面明确建议电脑展示二维码、手机微信扫码；完成绑定后手机可继续用邮箱密码登录。手机同屏完成首次扫码尚未实测。浏览器直接尺寸覆盖未生效后，已改用本地 390px iframe 实际检查中英文个人中心和首页：内容视口扣除滚动条为 380px，文档宽度同为 380px，表单无横向溢出，个人中心卡片为单列 340px，留言板为 370px，注册数为 2。截图为 `tmp/community-deploy/community-mobile-account.png` 和 `community-mobile-home.png`；该验证只覆盖布局，不替代真实手机上的微信授权验证。

2026-10-31 站长明确要求停止推进公安备案变更，不再将公安平台登录或变更申请作为本次部署的操作前置条件；不代为修改或提交备案资料。现有邮箱注册、强制重置密码、昵称、头像和角色数据库保留在上海服务器；不导入第三方角色或信任浏览器提交的手机号。评论、留言及账号线上入口仍关闭。

正式进程 `server.js` 已接入 `identity-config.js`。在服务器私有环境文件中设置 `IDENTITY_PROVIDER=authing-wechat`，填写 Authing issuer、应用 ID、应用密钥、精确 source / connection ID、`AUTHING_REDIRECT_URI=https://api.apc-science.cn/api/identity/callback` 与 `IDENTITY_RETURN_URL=https://apc-science.cn/account/` 后才启用；任何缺失、无效来源或回跳地址都会阻止启动。默认 `none` 保持验证关闭。生产 `APP_SECRET` 是手机号加密和唯一索引密钥的来源，必须保留原值并安全备份，不复制本地预览密钥或数据库。正式回调和面向访客的访问规则须与服务器配置一致；2026-11-01 已完成正式配置，详见下方部署记录。

可在仓库根目录运行 `node services/community/deploy/package-release.mjs tmp/community-release-新版本名` 生成部署目录。打包仅复制明确列出的运行时代码和部署配置，统一 LF 换行，并输出 SHA-256 文件清单；排除开发服务器、测试、密钥及数据。更新已有服务器前先备份数据库及私有配置，记录当前 release 以便回退；先保留 images-only 代理检查新服务，待实名接入、真实邮件和管理员账号验证完成后再开放社区路由。

2026-10-31 刷新公安备案后台后确认会话过期，未以旧页面认定最新状态，也未修改备案资料。后续依站长指示停止该平台操作。

2026-11-01 腾讯云登录恢复后，已通过控制台自动化助手将 19 个明确列出的发布文件安装至 `/opt/apc-community/releases/20261101-identity`。切换前完成 SQLite 在线备份，并将旧环境文件、Caddy 配置及旧版本路径保存在 root 私有目录 `/var/backups/apc-community/20261101-identity`。安装过程中校验文件 SHA-256、检查 JavaScript 语法，并设置失败回退旧版本；服务重启后健康检查成功。生产环境文件和 Caddy 配置逐字节比较未变，身份认证仍未启用，账号及评论公网入口仍关闭。

站长于 2026-11-01 明确授权正式认证访问及联调后开放。Authing 应用现名为 `APC 博客 · 手机号验证`，默认访客授权已改为允许，回调白名单只保留 `https://api.apc-science.cn/api/identity/callback`。最初把本机和正式地址按换行填写，保存后仍出现 `redirect_uri_mismatch`；改为单一正式地址后已实际完成 OAuth 回跳，不再把编辑框显示成功等同于认证端已接受地址。应用密钥通过服务器临时 RSA-OAEP 公钥加密后传入私有环境文件，命令记录没有明文密钥；写入后已清除临时传输私钥。原 `APP_SECRET` 保留不变，内部 `/api/session` 已确认 `identityAvailable: true`、`identityRequired: true`。

正式 HTTPS 联调入口是 `https://api.apc-science.cn/account/`，使用与博客相同的账号前端，资源位于 `/srv/apc-account-preview`，不被搜索引擎索引。当前临时回跳地址为该个人中心，允许来源临时增加 API 自身 HTTPS 源。Caddy 已提供账号 API；未登录评论写入返回 401，未登录身份查询返回 401，非白名单来源返回 403，博客来源 CORS 预检返回 204。主博客社区入口尚未发布。站长已亲自完成邮箱验证码注册并设置密码，账号显示 `Guinyの时光` 和“站长”标识，微信来源手机号绑定已成功且仅展示脱敏号码。正式服务上的留言写入与软移除已实测通过，测试留言已从公开列表移除。

当前剩余工作：发布博客社区页面，将身份回跳切换回 `https://apc-science.cn/account/` 并收起临时个人中心入口，再核对主站 Cookie/CORS、留言板、文章评论及注册人数。邮箱注册已完成生产实测；密码重置的强制换密、旧会话失效等已通过自动测试，没有为了测试而替站长重置正式密码。本地管理员 `preview-admin@example.test` 仅供测试，不是站长的生产账号。既有受限图片上传账号不能用于程序部署，不得绕过其权限限制。

参考：[Authing 用户字段释义](https://docs.authing.cn/v2/guides/user/user-profile.html)、[获取外部身份源](https://docs.authing.cn/v3/reference/sdk/go/authentication/账号绑定/get-identities.html)、[官方 Node SDK](https://github.com/Authing/authing-node-sdk)（已核对 `AuthenticationClient.getIdentities` 和请求头实现）。

### 本机真实授权测试

`src/authing-local-test.js` 仅由本地 `dev.js` 在 `AUTHING_LOCAL_TEST=1` 时加载，生产模式拒绝启动。它使用独立的临时 Cookie 会话，只验证来源并显示脱敏号码，不写入博客账号数据库，不发送短信。只接受 `127.0.0.1:8787` Host，发起操作校验精确 Origin；结果只保存在内存中，30 分钟过期，授权事务 5 分钟过期。

本机凭据位于 Git 忽略的 `services/community/.env.authing-local`，Windows ACL 已限定当前用户、管理员和 SYSTEM；禁止提交或放入前端。先停止本机原来的 8787 预览进程，再在 PowerShell 启动：

```powershell
$env:PREVIEW_SITE_PORT='4001'
$env:AUTHING_LOCAL_TEST='1'
node --env-file=services/community/.env.authing-local services/community/src/dev.js
```

浏览器打开 `http://127.0.0.1:8787/identity-test`。此独立诊断页尚未与博客个人中心连接，不能用于保存绑定。诊断日志仅输出状态码和布尔判断，不输出手机号、用户标识、令牌或密钥。

### 本地个人中心绑定联调

使用同一个私有环境文件，额外设置持久的随机 `APP_SECRET`（至少 32 字符）、`AUTHING_WECHAT_SOURCE_ID` 和 `AUTHING_WECHAT_CONNECTION_ID`。不要使用演示密钥；丢失或修改密钥后将无法解密已有手机号。该模式与独立诊断页互斥：

```powershell
$env:PREVIEW_SITE_PORT='4001'
$env:AUTHING_LOCAL_TEST='0'
$env:AUTHING_BLOG_BINDING='1'
node --env-file=services/community/.env.authing-local services/community/src/dev.js
```

配合隔离的 Hexo 预览打开 `http://127.0.0.1:4001/account/`。数据仅写入 Git 忽略的 `services/community/data/preview.sqlite`，邮件写入本地预览收件箱；不接触生产账号。先输入本站当前密码并确认手机号用途，再进行微信授权，回到个人中心核对脱敏号码后确认绑定。测试账号已授权并绑定时无需重复扫码。应用仍只允许指定测试用户访问，不能据此开放生产评论。

## 后续图片和文章更新

2026-10-25 已恢复文章及图片公开访问，Netlify 已启用，Cloudflare 的备案临时拦截已禁用，GitHub Pages 保持关闭。账号、评论和留言仍未开放。

本地可双击仓库根目录的 `图片上传工具.cmd`，上传图片后复制 Markdown，也可按文章引用批量上传并规范路径。操作、故障回退策略及本机配置见 [图片上传说明](../../tools/IMAGE_HOSTING.md)。上传不会删除旧图，备用文件需与文章一起发布。

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
# 检查隔离的社区启用构建；先使用对应叠加配置执行 hexo generate
node tests/test_community_pages.js --public tmp/community-preview-public --config _config.yml,_config.community-preview.yml
node tests/test_site_navigation.js
node tests/test_daily_local_images.js
python tools/localize_gallery_images.py --check
```

官方参考：[Resend 免费额度](https://resend.com/pricing)、[发信域名验证](https://resend.com/docs/dashboard/domains/introduction)、[腾讯云轻量服务器 ICP 备案](https://cloud.tencent.com/document/product/1207/45756)。
