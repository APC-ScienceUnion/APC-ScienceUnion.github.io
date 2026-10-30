(() => {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  const english = document.documentElement.lang.startsWith('en');
  const counts = document.querySelectorAll('[data-visit-count]');
  const notes = document.querySelectorAll('[data-visit-start]');
  const explain = english
    ? 'Counted by anonymous browser; clearing browser data counts as a new visitor. Previous Busuanzi totals are excluded.'
    : '按匿名浏览器去重；清理浏览器数据后会重新计数。不含原不蒜子累计数。';
  const message = text => counts.forEach(node => { node.textContent = text; });
  const note = (text, detail = explain) => notes.forEach(node => { node.textContent = text; node.title = detail; });
  // Never add localhost, deployment previews, or archived copies to live totals.
  if (!['apc-science.cn', 'www.apc-science.cn'].includes(location.hostname)) {
    message('—'); note(english ? 'Preview · not counted' : '本地/预览页面不计数'); return;
  }
  const key = location.pathname;
  const state = window.apcVisitState || (window.apcVisitState = new Map());
  async function count() {
    message(english ? 'Loading…' : '加载中…');
    try {
      if (!state.has(key)) {
        state.set(key, (async () => {
          let visitorId;
          try { visitorId = localStorage.getItem('apc-visitor-v1'); } catch { /* Storage can be disabled. */ }
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId || '')) {
            visitorId = crypto.randomUUID();
            try { localStorage.setItem('apc-visitor-v1', visitorId); } catch { /* This visit still counts. */ }
          }
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          try {
            const response = await fetch(script.dataset.api + '/api/visits', {
              method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
              headers: { 'Content-Type': 'application/json', 'X-Community-Request': '1' },
              body: JSON.stringify({ topic: script.dataset.topic, visitorId, viewId: crypto.randomUUID() }),
              signal: controller.signal
            });
            if (!response.ok) throw new Error('Statistics unavailable');
            const result = await response.json();
            if (!['siteVisitors', 'siteViews', 'pageViews'].every(field => Number.isSafeInteger(result[field]) && result[field] >= 0)
              || !result.startedAt || !Number.isFinite(Date.parse(result.startedAt))) throw new Error('Invalid statistics');
            return result;
          } finally { clearTimeout(timeout); }
        })());
      }
      const result = await state.get(key);
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(result.startedAt));
      const part = name => parts.find(p => p.type === name).value;
      const date = `${part('year')}-${part('month')}-${part('day')}`;
      counts.forEach(node => { node.textContent = result[node.dataset.visitCount].toLocaleString(english ? 'en-US' : 'zh-CN'); node.title = explain; });
      note(english ? `Since ${date}` : `自 ${date} 起`,
        (english ? `Statistics started on ${date} (UTC+8). ` : `统计自 ${date} 起（北京时间）。`) + explain);
    } catch {
      message(english ? 'Unavailable' : '暂不可用');
      note(english ? 'New statistics · temporarily unavailable' : '新统计 · 服务暂不可用');
    }
  }
  if (document.visibilityState === 'prerender') document.addEventListener('visibilitychange', count, { once: true });
  else count();
})();
