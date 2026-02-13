document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-today-in-history]');
  if (containers.length === 0) return;

  // 渲染加载态
  containers.forEach(container => {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;padding:20px;">
        <div style="width:28px;height:28px;border:3px solid #93c5fd;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>
        <span style="margin-left:10px;color:#666;">正在加载科学史上的今天...</span>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
  });

  // 从静态 JSON + PNG 渲染文本和长图，不在浏览器内调用 Kimi/Qwen
  renderScienceHistoryFromStatic(containers);
});

// 使用静态生成的 science_today.json / science_today.png 渲染页面
function renderScienceHistoryFromStatic(containers) {
  // 兼容 Hexo 的 root 配置：在本地 (/) 和 GitHub Pages (/repo/) 下都能正确定位到静态资源
  let root = '/';
  try {
    if (window.KEEP && window.KEEP.hexo_config && window.KEEP.hexo_config.root) {
      root = window.KEEP.hexo_config.root;
    } else if (window.CONFIG && window.CONFIG.root) {
      root = window.CONFIG.root;
    }
  } catch (_) {}
  if (!root) root = '/';
  if (!root.endsWith('/')) root += '/';

  const jsonUrl = root + 'ScienceHistory/science_today.json?_=' + Date.now();
  const imgUrl = root + 'ScienceHistory/science_today.png';

  fetch(jsonUrl)
    .then(r => {
      if (!r.ok) throw new Error(`JSON 加载失败: ${r.status}`);
      return r.text();
    })
    .then(text => {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // 这里就是你现在看到的 Unexpected token '<' 的情况，说明拿到的是 HTML（如 404 页面），而不是 JSON
        throw new Error(`JSON 解析失败: ${e.message}，响应前 80 字符: ${text.slice(0, 80)}`);
      }

      const title = data.title || '科学史上的今天';
      const dateText = data.date_text || '';
      const weekText = data.week || '';
      const items = Array.isArray(data.items) ? data.items : [];

      const listHtml = items.length
        ? items.map(line => `
            <li style="padding:6px 0;border-bottom:1px solid #eee;line-height:1.7;">
              ${line}
            </li>
          `).join('')
        : '<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';

      const cardHtml = `
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:10px;">
            <div>
              <h2 style="margin:0;font-size:22px;color:#111827;">${title}</h2>
              <div style="margin-top:4px;color:#6b7280;font-size:14px;">${dateText} ${weekText}</div>
            </div>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${listHtml}</ol>
        </div>
      `;

      containers.forEach(c => {
        c.innerHTML = cardHtml;

        // 追加静态长图
        const wrap = document.createElement('div');
        wrap.style.marginTop = '18px';

        const img = new Image();
        img.src = imgUrl;
        img.alt = '科学史上的今天 长图';
        img.style.width = '100%';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 6px 24px rgba(0,0,0,.08)';

        wrap.appendChild(img);
        c.appendChild(wrap);
      });
    })
    .catch(err => {
      const errorHtml = `
        <div style="color:#b91c1c;padding:15px;background:#fee2e2;border-left:4px solid #ef4444;border-radius:8px;">
          加载科学史上的今天失败: ${err.message}
        </div>
      `;
      containers.forEach(c => c.innerHTML = errorHtml);
    });
}


// ================== 科学史上的今天 长图生成（千问 Qwen3） ==================

// 解析大模型返回的 Markdown 文本，提取事件条目
function parseScienceHistoryItems(md) {
  const lines = md.split('\n').map(l => l.trim());
  const items = [];
  const re = /^(\d+)\.\s*(.+)$/;

  for (const ln of lines) {
    if (!ln) continue;
    if (ln.startsWith('```')) continue;
    if (ln.startsWith('科学史上的今天')) continue;
    const m = ln.match(re);
    if (m && m[2]) {
      items.push(m[2].trim());
    }
  }
  return items;
}

// 生成“科学史上的今天”长图（Canvas）
function generateScienceHistoryPoster({ headerUrl = '', dateText, weekText, titleText, items, year, month, day }) {
  return new Promise(async (resolve, reject) => {
    try {
      const width = 1080;
      const marginX = 72;
      const headerH = Math.round(width * 0.56);

      // 构建测量用 canvas
      const measureCanvas = document.createElement('canvas');
      measureCanvas.width = width;
      measureCanvas.height = 10;
      const measureCtx = measureCanvas.getContext('2d');

      const fonts = {
        date: '500 36px "Noto Sans SC","Microsoft YaHei",sans-serif',
        week: '400 32px "Noto Sans SC","Microsoft YaHei",sans-serif',
        titleEn: '600 26px "Noto Sans SC","Microsoft YaHei",sans-serif',
        title: '700 64px "Noto Sans SC","Microsoft YaHei",sans-serif',
        item: '400 36px "Noto Sans SC","Microsoft YaHei",sans-serif',
        footer: '400 26px "Noto Sans SC","Microsoft YaHei",sans-serif',
        dayBadge: '800 200px "Noto Sans SC","Microsoft YaHei",sans-serif'
      };

      const contentWidth = width - marginX * 2;

      // 文本换行
      function wrapText(ctx, text, maxWidth) {
        const chars = text.split('');
        let line = '';
        const lines = [];
        for (let i = 0; i < chars.length; i++) {
          const test = line + chars[i];
          const w = ctx.measureText(test).width;
          if (w > maxWidth && line) {
            lines.push(line);
            line = chars[i];
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        return lines;
      }

      // 预计算正文高度
      measureCtx.font = fonts.item;
      const itemLineHeight = 56;
      let bodyHeight = 0;
      const wrappedItems = items.map((t, idx) => {
        const prefix = `${idx + 1}. `;
        const lines = wrapText(measureCtx, prefix + t, contentWidth);
        bodyHeight += lines.length * itemLineHeight + 12;
        return lines;
      });

      const titleBlockH = 64 + 26 + 36 + 24 + 32;

      const footerLines = [
        '图像制作：格物社 / A.P.C.科学联盟',
        '灵感赖渊：缪卿九',
        '头图供图：Marianna Armata/Getty Image',
        '特别鸣谢：Qwen-3-Max、kimi-k2-0905-preview',
        '免责声明：图片内容由 AI 总结生成，不代表格物社/A.P.C.科学联盟立场'
      ];
      const footerH = 36 * footerLines.length + 80;

      const totalHeight = headerH + 40 + titleBlockH + 24 + bodyHeight + footerH;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      // 背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      // 准备头图到离屏画布（cover 模式）
      const headerCanvas = document.createElement('canvas');
      headerCanvas.width = width;
      headerCanvas.height = headerH;
      const headerCtx = headerCanvas.getContext('2d');
      const drawHeaderToOffscreen = async () => {
        if (!headerUrl) {
          const grad = headerCtx.createLinearGradient(0, 0, width, headerH);
          grad.addColorStop(0, '#f8d77a');
          grad.addColorStop(1, '#f3a34e');
          headerCtx.fillStyle = grad;
          headerCtx.fillRect(0, 0, width, headerH);
          return;
        }
        try {
          const img = await loadImage(headerUrl);
          const iw = img.width, ih = img.height;
          const scale = Math.max(width / iw, headerH / ih);
          const dw = iw * scale, dh = ih * scale;
          const dx = (width - dw) / 2;
          const dy = (headerH - dh) / 2;
          headerCtx.drawImage(img, dx, dy, dw, dh);
        } catch (_) {
          const grad = headerCtx.createLinearGradient(0, 0, width, headerH);
          grad.addColorStop(0, '#f8d77a');
          grad.addColorStop(1, '#f3a34e');
          headerCtx.fillStyle = grad;
          headerCtx.fillRect(0, 0, width, headerH);
        }
      };

      await drawHeaderToOffscreen();

      // 绘制头图
      ctx.drawImage(headerCanvas, 0, 0, width, headerH, 0, 0, width, headerH);

      let yCursor = headerH + 80;

      // 大号日期（靠右对齐）
      const dayStr = (day < 10 ? '0' + day : '' + day);
      ctx.font = fonts.dayBadge;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      ctx.lineWidth = 4;
      const dayMetrics = ctx.measureText(dayStr);
      const dayWidth = dayMetrics.width;
      const dayX = width - marginX - dayWidth;
      const dayY = headerH - 40;
      ctx.strokeText(dayStr, dayX, dayY);
      ctx.fillText(dayStr, dayX, dayY);

      // 中文大标题（移除英文 SCINCE HISTORY TODAY 行）
      ctx.fillStyle = '#222222';
      ctx.font = fonts.title;
      ctx.fillText(titleText, marginX, yCursor);
      yCursor += 64;

      // 日期 + 星期
      ctx.fillStyle = '#666666';
      ctx.font = fonts.date;
      ctx.fillText(dateText, marginX, yCursor);
      yCursor += 42;
      ctx.font = fonts.week;
      ctx.fillText(weekText, marginX, yCursor);
      yCursor += 40;

      // 分割线
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginX, yCursor);
      ctx.lineTo(width - marginX, yCursor);
      ctx.stroke();
      yCursor += 64;

      // 正文条目
      ctx.fillStyle = '#333333';
      ctx.font = fonts.item;
      wrappedItems.forEach(lines => {
        lines.forEach(ln => {
          ctx.fillText(ln, marginX, yCursor);
          yCursor += itemLineHeight;
        });
        yCursor += 12;
      });

      // 页脚
      yCursor += 8;
      ctx.strokeStyle = '#eeeeee';
      ctx.beginPath();
      ctx.moveTo(marginX, yCursor);
      ctx.lineTo(width - marginX, yCursor);
      ctx.stroke();
      yCursor += 36;

      ctx.fillStyle = '#8a8a8a';
      ctx.font = fonts.footer;
      footerLines.forEach(line => {
        ctx.fillText(line, marginX, yCursor);
        yCursor += 34;
      });

      const fileName = `history_today_${year}-${month}-${day}.png`;
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch (_) {
        // CORS 限制时，返回空 dataUrl，回传 canvas 以供直接展示
      }
      resolve({ dataUrl, fileName, canvas });
    } catch (e) {
      reject(e);
    }
  });
}

// 调用 Qwen3（千问），生成“科学史上的今天”长图并追加到容器下方
function renderScienceHistoryPoster(containers) {
  if (!containers || !containers.length) return;

  const first = containers[0];
  const qwenKey = first.getAttribute('data-qwen-key') || '';
  const kimiKey = first.getAttribute('data-kimi-key') || '';
  const headerUrl = first.getAttribute('data-history-header') || '';

  if (!kimiKey || !qwenKey) {
    try {
      console.error('[ScienceHistory] 缺少必要的 API Key：', {
        hasKimi: !!kimiKey,
        hasQwen: !!qwenKey
      });
    } catch (_) {}
    return;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const weekText = weekDays[now.getDay()];
  const dateText = `${y}年${m}月${d}日`;

  // HTML 转义工具，避免 Qwen 原文直接插入造成 XSS
  const escapeHtml = s => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // 将 Qwen 返回的原始 Markdown 文本简单清洗后，以纯文本形式展示
  function renderRawMarkdownCard(rawContent) {
    if (!rawContent) rawContent = '（今日未检索到符合条件的科学史重大事件。）';
    const lines = String(rawContent).split('\n');
    // 去掉 ```md / ``` 代码块包裹
    if (lines.length && lines[0].trim().startsWith('```')) {
      lines.shift();
    }
    while (lines.length && lines[lines.length - 1].trim().startsWith('```')) {
      lines.pop();
    }
    const cleaned = lines.join('\n').trim();
    const safe = escapeHtml(cleaned);

    const cardHtml = `
      <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
        <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
          <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${iso}</h2>
        </div>
        <div style="margin-top:4px;color:#374151;line-height:1.8;white-space:pre-wrap;font-size:0.97rem;">
          ${safe}
        </div>
      </div>
    `;

    containers.forEach(c => {
      c.innerHTML = cardHtml;
    });
  }

  // ====== 当日缓存：若本地已有缓存结果，则直接渲染列表与长图，避免重复调用 Qwen3 ======
  const cacheKey = `scienceHistoryToday_${iso}`;
  let cached = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(cacheKey);
      if (raw) cached = JSON.parse(raw);
    }
  } catch (_) {
    cached = null;
  }

  if (cached && typeof cached === 'object') {
    const cachedItems = Array.isArray(cached.items) ? cached.items : [];
    const cachedContent = typeof cached.content === 'string' ? cached.content : '';

    // 情况1：有解析好的条目，按正常列表 + 长图渲染
    if (cachedItems.length) {
      const items = cachedItems;

      const listHtml = items.map(line => `
        <li style="padding:8px 0;border-bottom:1px solid #eee;line-height:1.7;">
          ${line}
        </li>
      `).join('') || '<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';

      const cardHtml = `
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
            <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${iso}</h2>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${listHtml}</ol>
        </div>
      `;

      containers.forEach(c => {
        c.innerHTML = cardHtml;
      });

      // 仍然需要本地重新绘制一次长图，但不再请求 Qwen3
      generateScienceHistoryPoster({
        headerUrl,
        dateText,
        weekText,
        titleText: '科学史上的今天',
        items,
        year: y,
        month: m,
        day: d
      }).then(({ dataUrl, canvas }) => {
        containers.forEach(c => {
          const wrap = document.createElement('div');
          wrap.style.marginTop = '18px';

          let visualEl;
          if (dataUrl) {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = '科学史上的今天 长图';
            visualEl = img;
          } else {
            visualEl = canvas;
          }

          visualEl.style.width = '100%';
          visualEl.style.borderRadius = '8px';
          visualEl.style.boxShadow = '0 6px 24px rgba(0,0,0,.08)';

          wrap.appendChild(visualEl);
          c.appendChild(wrap);
        });
      }).catch(err => {
        const error = document.createElement('div');
        error.style.marginTop = '10px';
        error.style.color = '#b91c1c';
        error.style.padding = '10px 12px';
        error.style.background = '#fee2e2';
        error.style.borderLeft = '4px solid #ef4444';
        error.style.borderRadius = '8px';
        error.textContent = `科学史上的今天长图生成失败：${err.message}`;
        containers.forEach(c => c.appendChild(error.cloneNode(true)));
      });

      return;
    }

    // 情况2：没有条目，但缓存了原始文本（例如“今日无重大事件”的说明），直接渲染原文
    if (cachedContent) {
      renderRawMarkdownCard(cachedContent);
      return;
    }
  }

  // ====== 第一步：调用 Kimi 生成初稿 ======

  const kimiPrompt = `我要求你整理“科学史上的今天”资料，今天是${iso}。请注意，科学史包括自然科学（理学/工学/农学/医学等）与人文社科（哲学/经济学等）。你禁止包括任何娱乐新闻或无关紧要的小事。

你的回答必须满足以下要求：
0、关于检索的网页只允许查询权威博物馆的历史资料以及公开的权威百科和网站百科资料、以及权威有名的杂志。
禁止百度搜狗360等中国百科、抖音、抖音百科、今天头条、360doc个人图书馆、网易、手机搜狐网、华人头条、IT之家、新晚报。


1、资料必须是历史上的重大事件。

2、你的回答必须符合规定日期**当天**实际发生过的历史事件，你必须查阅网络资料验证信息来源真实。

3、必须严格按照以下格式返回内容，禁止返回格式之外的任何信息。 每件史实必须在同一行内。

4、内容必须权威准确，最后只保留最权威最重要的**20**条

\`\`\`md

科学史上的今天（${iso}）

1. 年份（如：1101）：事件简要说明

...

15. 年份（如：2005）：事件简要说明

\`\`\`

5、年份必须**由早到晚**排序。`;

  const kimiUrl = 'https://api.moonshot.cn/v1/chat/completions';
  const qwenUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  // 先请求 Kimi
  fetch(kimiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${kimiKey}`
    },
    body: JSON.stringify({
      // 按照 Kimi 官方 Chat API 文档格式：
      // https://api.moonshot.cn/v1/chat/completions
      // 只需要 model + messages + temperature 等标准字段
      model: 'kimi-k2-0905-preview',
      messages: [
        { role: 'system', content: '你是一个精通科学史的、严谨的学者。' },
        { role: 'user', content: kimiPrompt }
      ],
      temperature: 0.1
    })
  })
    .then(r => {
      if (!r.ok) throw new Error(`Kimi API 错误: ${r.status}`);
      return r.json();
    })
    .then(kimiData => {
      // 调试日志：输出 Kimi 原始返回和 message.content
      try {
        console.debug('[ScienceHistory][Kimi] raw response:', kimiData);
      } catch (_) {}

      const kmChoices = (kimiData && kimiData.choices) || [];
      if (!kmChoices.length) throw new Error('Kimi 未返回候选结果');
      const kmMsg = kmChoices[0].message || {};
      const kimiContent = typeof kmMsg.content === 'string'
        ? kmMsg.content
        : (Array.isArray(kmMsg.content) ? kmMsg.content.map(p => p.text || '').join('') : '');

      if (!kimiContent.trim()) throw new Error('Kimi 返回文本为空');

      try {
        console.debug('[ScienceHistory][Kimi] message.content:', kimiContent);
      } catch (_) {}

      // ====== 第二步：调用 Qwen3 校验豆包结果 ======
      const qwenPrompt =
`你是一个精通科学史的、严谨的学者。请检查我收集的资料【${kimiContent}】中的内容是否准确（你必须严格审查日期与事件的真实性）。

- 如果有条目错误，必须直接删除该条目。
- 检查无误后，保持资料原本的格式（科学史上的今天（${iso}）以及后续内容）返回给我（你需要确保剩下的条目都正确）
- 如果所有条目均不正确，你只需要返回原本资料的header（即科学史上的今天（${iso}））
- 禁止输出条目原本的序号
- 禁止输出条目外的内容。`;

      const qwenBody = {
        model: 'qwen3-max-preview',
        messages: [
          { role: 'system', content: '你是一个精通科学史的、严谨的学者' },
          { role: 'user', content: qwenPrompt }
        ],
        // 与前端其它调用保持一致
        temperature: 0.1,
        extra_body: {
          enable_thinking: true
        }
      };

      return fetch(qwenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${qwenKey}`
        },
        body: JSON.stringify(qwenBody)
      });
    })
    .then(r => {
      if (!r.ok) throw new Error(`Qwen3 API 错误: ${r.status}`);
      return r.json();
    })
    .then(data => {
      // 调试日志：输出 Qwen3 原始返回和解析出的 message.content，便于排查格式问题
      try {
        // 使用 console.debug 避免干扰普通日志
        console.debug('[ScienceHistory][Qwen3] raw response:', data);
      } catch (_) {}

      const choices = (data && data.choices) || [];
      if (!choices.length) throw new Error('Qwen3 未返回候选结果');
      const msg = choices[0].message || {};
      const content = typeof msg.content === 'string' ? msg.content : '';
      try {
        console.debug('[ScienceHistory][Qwen3] message.content:', content);
      } catch (_) {}
      if (!content.trim()) throw new Error('Qwen3 返回文本为空');

      const items = parseScienceHistoryItems(content);

      // 写入当日缓存（同时缓存解析后的条目文本和原始内容）
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(cacheKey, JSON.stringify({ items, content }));
        }
      } catch (_) {
        // 本地存储失败不影响正常展示
      }

      // 若没有任何条目（例如 Qwen 明确说明“本日无重大事件”），
      // 不再视为错误，而是直接展示原始说明文本，不生成长图。
      if (!items.length) {
        try {
          console.warn('[ScienceHistory][Qwen3] 本日无可解析条目，直接展示模型原文。');
        } catch (_) {}
        renderRawMarkdownCard(content);
        return;
      }

      // 使用 Qwen3 的结果替换“历史上的今天”列表内容
      const listHtml = items.map(line => `
        <li style="padding:8px 0;border-bottom:1px solid #eee;line-height:1.7;">
          ${line}
        </li>
      `).join('') || '<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';

      const cardHtml = `
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
            <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${iso}</h2>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${listHtml}</ol>
        </div>
      `;

      containers.forEach(c => {
        c.innerHTML = cardHtml;
      });

      return generateScienceHistoryPoster({
        headerUrl,
        dateText,
        weekText,
        titleText: '科学史上的今天',
        items,
        year: y,
        month: m,
        day: d
      });
    })
    .then(({ dataUrl, canvas }) => {
      containers.forEach(c => {
        const wrap = document.createElement('div');
        wrap.style.marginTop = '18px';

        let visualEl;
        if (dataUrl) {
          const img = document.createElement('img');
          img.src = dataUrl;
          img.alt = '科学史上的今天 长图';
          visualEl = img;
        } else {
          visualEl = canvas;
        }

        visualEl.style.width = '100%';
        visualEl.style.borderRadius = '8px';
        visualEl.style.boxShadow = '0 6px 24px rgba(0,0,0,.08)';

        wrap.appendChild(visualEl);
        c.appendChild(wrap);
      });
    })
    .catch(err => {
      const error = document.createElement('div');
      error.style.marginTop = '10px';
      error.style.color = '#b91c1c';
      error.style.padding = '10px 12px';
      error.style.background = '#fee2e2';
      error.style.borderLeft = '4px solid #ef4444';
      error.style.borderRadius = '8px';
      error.textContent = `科学史上的今天长图生成失败：${err.message}`;
      first.appendChild(error);
    });
}


