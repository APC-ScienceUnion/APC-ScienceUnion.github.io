/**
 * APOD：NASA JSON 配图；中文说明取自成大镜像（经 allorigins 拉 HTML）。
 * 繁转简：繁化姬公开 API（表单 POST），避免 opencc-js 动态 import 阻塞主线程。
 */
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-apod]');
  if (!containers.length) return;

  const loadingHtml =
    typeof window.apcLoadingHtml === 'function'
      ? window.apcLoadingHtml('正在加载每日一天文图片…')
      : '<p style="padding:20px;color:#888;">正在加载每日一天文图片…</p>';
  containers.forEach((box) => {
    box.innerHTML = loadingHtml;
  });

  const NASA_KEY = '5a1S3uxboIVQSPCg6bdNSg2pjHnaelBbedbgUhbE';
  const MIRROR_HTTP = 'http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/apod.html';
  const ALLORIGINS_RAW = `https://api.allorigins.win/raw?url=${encodeURIComponent(MIRROR_HTTP)}`;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fetchWithTimeout(url, init, ms) {
    const ac = new AbortController();
    const id = setTimeout(() => ac.abort(), ms);
    return fetch(url, { ...init, signal: ac.signal }).finally(() => clearTimeout(id));
  }

  async function fetchNasa() {
    const r = await fetchWithTimeout(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`,
      {},
      12000
    );
    if (!r.ok) throw new Error(`NASA HTTP ${r.status}`);
    return r.json();
  }

  /** 去掉 Markdown 链接，避免正文里一堆 [](url) */
  function stripMdLinks(s) {
    return String(s || '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  }

  /** innerText 常在表格里一字一行，把「汉字↵汉字」并成连续正文 */
  function collapseCjkLineBreaks(s) {
    let t = String(s || '');
    let prev;
    do {
      prev = t;
      t = t.replace(/([\u4e00-\u9fff\u3000-\u303f\w，、；：])\s*\n+\s*([\u4e00-\u9fff\u3000-\u303f\w])/g, '$1$2');
    } while (t !== prev);
    return t.replace(/\n{3,}/g, '\n\n').trim();
  }

  /** 截掉镜像页尾导航、NASA 英文脚注、重复「说明」等 */
  function stripMirrorFooterNoise(s) {
    let t = String(s || '');
    const cutters = [
      /\n\s*<\s*\|\s*旧图/i,
      /\n\s*\|\s*旧图\s*\|/,
      /\nAuthors\s*&\s*editors/i,
      /\nNASA\s+Official/i,
      /\nSpecific\s+rights\s+apply/i,
      /\nNASA\s+Web\s+Privacy/i,
      /\n太空天文实验室（/,
      /\n编辑[：:]\s*陈炳志/,
      /不斷更新的圖庫\s*[:：]/,
      /不断更新的图库\s*[:：]/,
      /明日的圖片\s*[:：]/,
      /明日的图片\s*[:：]/,
    ];
    for (const re of cutters) {
      const i = t.search(re);
      if (i > 0) t = t.slice(0, i);
    }
    return t.replace(/\n{3,}/g, '\n\n').trim();
  }

  const STOP_AFTER_EXPL =
    /(?:不斷更新的圖庫|不断更新的图库|明日的圖片|明日的图片|明日\s*[:：]|影像提供與版權|影像提供與版权|影像提供\s*[:：]|\n\s*\|\s*旧图|Authors\s*&\s*editors|NASA\s+Official|太空天文实验室（|<\s*\|\s*旧图)/;

  /**
   * 从镜像 HTML 的 innerText 抽取说明、版权、明日。
   * 页内常有多个「说明」或表格拆字换行；取最后一个「說明/说明：」后的正文，并用 STOP 截断，避免整页 innerText 灌进正文。
   */
  function parseMirrorFromHtml(html) {
    let detail = '';
    let copyright = '';
    let tomorrow = '';
    if (!html) return { detail, copyright, tomorrow };
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const bodyText = doc.body ? doc.body.innerText || '' : '';

      const labelMatches = [...bodyText.matchAll(/(?:說明|说明)\s*[:：]/g)];
      if (labelMatches.length) {
        const lastLabel = labelMatches[labelMatches.length - 1];
        let rest = bodyText.slice(lastLabel.index + lastLabel[0].length);
        const endIdx = rest.search(STOP_AFTER_EXPL);
        detail = (endIdx >= 0 ? rest.slice(0, endIdx) : rest).trim();
      }

      if (!detail) {
        const cpRe = /(?:影像提供與版權|影像提供與版权|影像提供)\s*[:：]/;
        const mCp = bodyText.match(cpRe);
        if (mCp && mCp.index != null && mCp.index > 0) {
          let pre = bodyText.slice(0, mCp.index).trim();
          const dateBlock = /\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日/;
          const lastDate = [...pre.matchAll(new RegExp(dateBlock, 'g'))].pop();
          if (lastDate) {
            pre = pre.slice(lastDate.index + lastDate[0].length).trim();
          }
          pre = pre
            .replace(/^#+\s+.*$/gm, '')
            .replace(/^APOD\s*:.+$/im, '')
            .replace(/^\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日\s*/m, '')
            .trim();
          detail = pre;
        }
      }

      detail = stripMirrorFooterNoise(collapseCjkLineBreaks(stripMdLinks(detail))).trim();

      const cpLong = bodyText.match(
        /(?:影像提供與版權|影像提供與版权|影像提供)\s*[:：]\s*([\s\S]+?)(?=不斷更新的圖庫|不断更新的图库|明日的圖片|明日的图片|明日\s*[:：]|\n-{3,}|$)/
      );
      if (cpLong) {
        copyright = stripMirrorFooterNoise(cpLong[1]).replace(/\s+/g, ' ').trim();
      }

      const tmAll = [...bodyText.matchAll(/(?:明日的圖片|明日的图片|明日)\s*[:：]\s*([^\n]+)/g)];
      if (tmAll.length) {
        let raw = tmAll[tmAll.length - 1][1].replace(/\s+/g, ' ').trim();
        const cutLib = raw.search(/不斷更新的圖庫|不断更新的图库/);
        if (cutLib >= 0) raw = raw.slice(0, cutLib).trim();
        tomorrow = raw;
      }

      copyright = stripMdLinks(copyright).trim();
      tomorrow = stripMdLinks(tomorrow).trim();
      // 镜像常把「說明：」+ 整段中文再接在版權行后，与正文 detail 重复，整段裁掉
      copyright = copyright.replace(/(?:說明|说明)\s*[:：][\s\S]*$/, '').replace(/\s+/g, ' ').trim();
    } catch (_) {}
    return { detail, copyright, tomorrow };
  }

  async function fetchMirrorHtml() {
    const r = await fetchWithTimeout(ALLORIGINS_RAW, {}, 15000);
    if (!r.ok) throw new Error(`镜像代理 HTTP ${r.status}`);
    return r.text();
  }

  const ZH_CHUNK = 5500;

  async function toSimp(text) {
    if (!text) return text;
    const out = [];
    for (let i = 0; i < text.length; i += ZH_CHUNK) {
      const chunk = text.slice(i, i + ZH_CHUNK);
      const body = new URLSearchParams();
      body.set('text', chunk);
      body.set('converter', 'Simplified');
      body.set('outputFormat', 'json');
      try {
        const r = await fetchWithTimeout('https://api.zhconvert.org/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: body.toString(),
        }, 15000);
        if (!r.ok) return text;
        const j = await r.json();
        if (j.code !== 0 || !j.data || typeof j.data.text !== 'string') return text;
        out.push(j.data.text);
      } catch (_) {
        return text;
      }
    }
    return out.join('');
  }

  function paragraphs(text) {
    if (!text) return '';
    return text
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `<p style="margin:.4em 0;">${esc(t)}</p>`)
      .join('');
  }

  Promise.all([fetchNasa(), fetchMirrorHtml().catch(() => '')])
    .then(async ([nasa, mirrorHtml]) => {
      const zh = parseMirrorFromHtml(mirrorHtml);
      let detail = await toSimp(zh.detail);
      let copyLine = await toSimp(zh.copyright);
      let tomorrow = await toSimp(zh.tomorrow);

      const media = nasa.media_type || 'image';
      const isImage = media === 'image';
      const imgSrc = isImage ? nasa.hdurl || nasa.url : '';
      const titleEn = nasa.title || '';
      const date = nasa.date || '';

      containers.forEach((box) => {
        let html = '';
        if (isImage && imgSrc) {
          html += `<img src="${esc(imgSrc)}" alt="${esc(titleEn)}" style="max-width:100%;display:block;margin:0 auto;border-radius:8px;" loading="lazy" referrerpolicy="no-referrer" />`;
        } else if (media === 'video') {
          const vu = nasa.url || '';
          html += `<p><a href="${esc(vu)}" target="_blank" rel="noopener">今日 APOD 为视频，点击观看</a></p>`;
        }
        html += `<div style="margin-top:14px;"><h2 style="margin-bottom:6px;">${esc(titleEn)}</h2><p style="color:#666;font-size:.9em;">${esc(date)}</p></div>`;
        if (detail) {
          html += `<div style="margin-top:14px;line-height:1.65;">${paragraphs(detail)}</div>`;
        } else if (nasa.explanation) {
          html += `<p style="color:#888;">中文说明暂不可用，以下为英文摘要：</p><div style="margin-top:8px;line-height:1.6;">${paragraphs(nasa.explanation)}</div>`;
        }
        if (copyLine) {
          html += `<div style="margin-top:12px;font-size:.9em;color:#666;">${paragraphs(copyLine)}</div>`;
        } else if (nasa.copyright) {
          html += `<p style="margin-top:12px;font-size:.9em;color:#666;">版权：${esc(nasa.copyright)}</p>`;
        }
        // 有中文说明时：紧跟版權行之后展示 NASA 英文原文（取代镜像页里跟在「说明：」后的重复中文）
        if (detail && nasa.explanation) {
          html += `<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(0,0,0,.08);">`;
          html += `<p style="margin:0 0 10px;color:#888;font-size:.88em;">NASA 英文原文</p>`;
          html += `<div style="line-height:1.65;color:#444;font-size:.95em;">${paragraphs(nasa.explanation)}</div>`;
          html += `</div>`;
        }
        if (tomorrow) {
          html += `<div style="margin-top:10px;font-size:.9em;color:#555;">${paragraphs(tomorrow)}</div>`;
        }
        box.innerHTML = html;
      });
    })
    .catch((err) => {
      console.error('APOD:', err);
      containers.forEach((box) => {
        box.innerHTML = `<div style="color:#b91c1c;padding:12px;">APOD 加载失败：${esc(err.message)}</div>`;
      });
    });
});
