document.addEventListener('DOMContentLoaded', () => {
    const newsContainers = document.querySelectorAll('[data-news60]');
    if (newsContainers.length === 0) return;
    
    const apiUrl = 'https://60s-api.viki.moe/v2/60s?encoding=text';
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        // 分割文本为行
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // 确保至少有1行
        if (lines.length === 0) {
          throw new Error('API返回空内容');
        }
        
        // 处理文本格式
        let formattedContent = '';
        
        // 1. 第一行用<h2>标签
        formattedContent += `<h2>${lines[0]}</h2>`;
        
        // 2. 中间行用无序列表展示
        if (lines.length > 2) {
          formattedContent += '<ol>';
          
          // 处理中间行（从第2行到倒数第2行）
          for (let i = 1; i < lines.length - 1; i++) {
            // 移除原始文本中的数字序号（如"1."、"2."等）
            const cleanedLine = lines[i].replace(/^\d+\.\s*/, '');
            formattedContent += `<li style="margin-bottom: 8px; position: relative; padding-left: 15px;">
              ${cleanedLine}
            </li>`;
          }
          
          formattedContent += '</ol>';
        }
        
        // 3. 最后一行原样展示
        if (lines.length > 1) {
          formattedContent += `<div style="margin-top: 15px; font-style: italic;">${lines[lines.length - 1]}</div>`;
        }
        
        // 组装用于长图的数据（从文本中解析日期）
        const weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        const parsed = (function parseDateFromLines(ls){
          const all = ls.join(' ');
          let y,m,d;
          let mIso = all.match(/(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
          if (mIso) {
            y = parseInt(mIso[1],10); m = parseInt(mIso[2],10); d = parseInt(mIso[3],10);
          } else {
            const mCn = all.match(/(20\d{2})年(\d{1,2})月(\d{1,2})日/);
            if (mCn) { y = parseInt(mCn[1],10); m = parseInt(mCn[2],10); d = parseInt(mCn[3],10); }
          }
          const ref = (y&&m&&d) ? new Date(y, m-1, d) : new Date();
          return { y: y||ref.getFullYear(), m: m||ref.getMonth()+1, d: d||ref.getDate(), week: weekDays[ref.getDay()] };
        })(lines);
        const y = parsed.y, m = parsed.m, d = parsed.d;
        const dateText = `${y}年${m}月${d}日`;
        const weekText = parsed.week;
        const titleText = '今日简报';
        const items = [];
        for (let i = 1; i < lines.length - 1; i++) {
          items.push(lines[i].replace(/^\d+\.\s*/, '').trim());
        }

        // 插入处理后的内容 + 生成长图
        newsContainers.forEach(container => {
          container.innerHTML = formattedContent;

          const headerUrl = container.getAttribute('data-news60-header') || '';

          generateNewsPoster({
            headerUrl,
            dateText,
            weekText,
            titleText,
            items,
            footer: '图像制作：格物社 / A.P.C.科学联盟',
            year: y,
            month: m,
            day: d
          }).then(({dataUrl, fileName, canvas}) => {
            const wrap = document.createElement('div');
            wrap.style.marginTop = '18px';

            let visualEl;
            if (dataUrl) {
              const img = document.createElement('img');
              img.src = dataUrl;
              img.alt = '今日简报 长图';
              visualEl = img;
            } else {
              // CORS 受限时直接展示 Canvas（不可导出）
              visualEl = canvas;
            }
            visualEl.style.width = '100%';
            visualEl.style.borderRadius = '8px';
            visualEl.style.boxShadow = '0 6px 24px rgba(0,0,0,.08)';

            wrap.appendChild(visualEl);
            container.appendChild(wrap);
          }).catch(() => {
            // 忽略长图生成失败，保留文本展示
          });
        });
      })
      .catch(error => {
        newsContainers.forEach(container => {
          container.innerHTML = `<div style="color: #d9534f; padding: 15px; background: #f8d7da; border-left: 4px solid #d9534f;">
            加载60秒新闻失败: ${error.message}
          </div>`;
        });
      });
  });

// ================= Canvas 长图生成 =================
// 生成新闻长图
function generateNewsPoster({ headerUrl = '', dateText, weekText, titleText, items, footer, year, month, day }) {
  return new Promise(async (resolve, reject) => {
    try {
      const width = 1080; // 适配主流手机分享宽度
      const marginX = 72; // 两侧留白
      const headerH = Math.round(width * 0.50); // 适当缩短头图高度，减少对正文干扰

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
      const itemLineHeight = 64; // 增大行距
      let bodyHeight = 0;
      const wrappedItems = items.map((t, idx) => {
        const prefix = `${idx + 1}. `;
        const lines = wrapText(measureCtx, prefix + t, contentWidth);
        bodyHeight += lines.length * itemLineHeight + 24; // 增大段间距
        return lines;
      });

      // 标题 & 日期高度
      const titleBlockH = 64 + 26 + 36 + 24 + 32; // 主标题 + 英文标题 + 间距 + 日期 + 星期
      const footerH = 120;

      const totalHeight = headerH + 40 + titleBlockH + 24 + bodyHeight + footerH;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      // 背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      // 准备头图到离屏画布（cover 模式），后续按需裁切再绘制到主画布
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

      // 裁切头图：仅绘制顶部，正文区域为白色
      const cutStart = Math.max(0, headerH - 18);
      ctx.drawImage(headerCanvas, 0, 0, width, cutStart, 0, 0, width, cutStart);
      const gradToWhite = ctx.createLinearGradient(0, cutStart - 18, 0, cutStart);
      gradToWhite.addColorStop(0.0, 'rgba(255,255,255,0)');
      gradToWhite.addColorStop(1.0, '#ffffff');
      ctx.fillStyle = gradToWhite;
      ctx.fillRect(0, cutStart - 18, width, 18);

      let yCursor = headerH + 40;

      // 大号“日”显示在头图区域，完全位于渐变之上（纯白，带轻微阴影）
      const dayStr = (day < 10 ? '0' + day : '' + day);
      ctx.font = fonts.dayBadge;
      const ddMetrics = ctx.measureText(dayStr);
      const ddDesc = ddMetrics.actualBoundingBoxDescent || 0;
      const ddBaseline = Math.max(0, (cutStart - 12) - ddDesc); // 保证文字底部距离渐变12px
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.25)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dayStr, marginX, ddBaseline);
      ctx.restore();

      // 中文大标题
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
      yCursor += 48; // 增大分界线与正文的间距，保证正文在分界线之下

      // 正文条目
      ctx.fillStyle = '#333333';
      ctx.font = fonts.item;
      wrappedItems.forEach((lines, idx) => {
        const lineHeight = itemLineHeight;
        lines.forEach((ln) => {
          ctx.fillText(ln, marginX, yCursor);
          yCursor += lineHeight;
        });
        yCursor += 24; // 段间距
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
      ctx.fillText(footer, marginX, yCursor);
      yCursor += 34;
      ctx.fillText('头图供图：SORTZE', marginX, yCursor);
      yCursor += 34;
      ctx.fillText('特别鸣谢：daily60s API', marginX, yCursor);

      const fileName = `news60_${year}-${month}-${day}.png`;
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch (_) {
        // CORS 受限，返回空 dataUrl，并回传 canvas 用于直接展示
      }
      resolve({ dataUrl, fileName, canvas });
    } catch (e) {
      reject(e);
    }
  });
}

// 加载图片（带 CORS 回退）
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}