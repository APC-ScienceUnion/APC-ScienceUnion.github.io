/**
 * 必应壁纸：与 bing-wallpaper SKILL 一致，使用 bing.ee123.net JSON（不用 HTML 抓取 / CORS 代理）。
 * 字段 imgurl、imgtitle、imgcopyright、imgshow、imgdetail 均来自 API，imgdetail 仅去 HTML 标签。
 */
document.addEventListener('DOMContentLoaded', () => {
  function yyyymmdd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  function stripHtml(html) {
    if (!html) return '';
    const t = document.createElement('div');
    t.innerHTML = html;
    return (t.textContent || t.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBlock(root, data) {
    const detail = stripHtml(data.imgdetail || '');
    const title = data.imgtitle || '';
    const show = data.imgshow || '';
    const copy = data.imgcopyright || '';
    const imgUrl = data.imgurl || '';
    let html = '';
    if (imgUrl) {
      html += `<figure style="margin:12px 0;"><img src="${esc(imgUrl)}" alt="${esc(title || '必应壁纸')}" style="max-width:100%;height:auto;border-radius:8px;display:block;" loading="lazy" referrerpolicy="no-referrer" /></figure>`;
    }
    if (title) html += `<h2 style="margin:16px 0 8px;">${esc(title)}</h2>`;
    if (show) html += `<p style="opacity:.92;margin:0 0 8px;">${esc(show)}</p>`;
    if (detail) html += `<div class="bing-api-detail" style="line-height:1.65;margin:8px 0;">${esc(detail)}</div>`;
    if (copy) html += `<p style="font-size:.9em;opacity:.85;margin-top:12px;">${esc(copy)}</p>`;
    if (!html) html = '<p style="color:#888;">必应 API 未返回可用内容。</p>';
    root.innerHTML = html;
  }

  function fetchJson(dateStr) {
    const url = `https://bing.ee123.net/img/?date=${dateStr}&size=1920x1080&imgtype=jpg&type=json`;
    return fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).then((data) => {
      if (!data || typeof data !== 'object') throw new Error('JSON 格式异常');
      return data;
    });
  }

  const dateStr = yyyymmdd(new Date());

  const wallLoading =
    typeof window.apcLoadingHtml === 'function'
      ? window.apcLoadingHtml('正在加载必应每日壁纸…')
      : '<p style="padding:20px;color:#888;">正在加载必应每日壁纸…</p>';
  const descLoading =
    typeof window.apcLoadingHtml === 'function'
      ? window.apcLoadingHtml('正在加载必应壁纸描述…')
      : '<p style="color:#888;">正在加载必应壁纸描述…</p>';

  document.querySelectorAll('[data-bing-wallpaper]').forEach((root) => {
    root.innerHTML = wallLoading;
    fetchJson(dateStr)
      .then((data) => renderBlock(root, data))
      .catch((err) => {
        console.error('必应 JSON 加载失败:', err);
        root.innerHTML = `<p style="color:#b91c1c;">必应壁纸加载失败：${esc(err.message)}</p>`;
      });
  });

  document.querySelectorAll('[data-bing-description]').forEach((el) => {
    el.innerHTML = descLoading;
    fetchJson(dateStr)
      .then((data) => {
        const parts = [];
        if (data.imgtitle) parts.push(`<h2>${esc(data.imgtitle)}</h2>`);
        if (data.imgshow) parts.push(`<p>${esc(data.imgshow)}</p>`);
        const d = stripHtml(data.imgdetail || '');
        if (d) parts.push(`<div class="bing-api-detail">${esc(d)}</div>`);
        if (data.imgcopyright) parts.push(`<p style="font-size:.9em;opacity:.85">${esc(data.imgcopyright)}</p>`);
        el.innerHTML = parts.length ? parts.join('') : '<p>暂无描述</p>';
      })
      .catch((err) => {
        console.error('必应描述失败:', err);
        el.innerHTML = `<span style="color:#b91c1c;">加载失败：${esc(err.message)}</span>`;
      });
  });
});
