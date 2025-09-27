document.addEventListener("DOMContentLoaded",()=>{const d=document.querySelectorAll("[data-today-in-history]");if(d.length===0)return;const e="https://60s.viki.moe/v2/today-in-history";d.forEach(e=>{e.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:center;padding:20px;">
        <div style="width:28px;height:28px;border:3px solid #93c5fd;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>
        <span style="margin-left:10px;color:#666;">正在加载历史上的今天...</span>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `});fetch(e).then(e=>{if(!e.ok)throw new Error(`HTTP 错误: ${e.status}`);return e.json()}).then(e=>{if(!e||e.code!==200||!e.data)throw new Error("接口返回异常");const{date:t,items:i=[]}=e.data;const o=`历史上的今天 - ${t||""}`;const n=e=>String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");const r=e=>{const t=n(e.year);const i=n(e.title);const o=n(e.description||"");const r=e.link||"#";return`
          <li style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
            <div style="flex:0 0 auto;min-width:64px;height:28px;background:#f3f4f6;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#374151;">${t}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
                <a class="tih-link" href="${r}" target="_blank" rel="noopener" title="点击打开链接">${i}</a>
              </div>
              ${o?`<div style="margin-top:6px;color:#4b5563;line-height:1.75;white-space:normal;overflow:visible;text-overflow:initial;word-break:break-word;overflow-wrap:anywhere;">${o}</div>`:""}
            </div>
          </li>
        `};const a=i.length?i.map(r).join(""):'<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';const l=`
        <style>
          .tih-link{
            display:inline-block;
            font-size:1.05rem;
            color:#1d4ed8; /* 蓝色强调，突出可点击 */
            text-decoration:none;
            background:rgba(37,99,235,0.08);
            border:1px solid rgba(37,99,235,0.15);
            padding:2px 8px;
            border-radius:8px;
            line-height:1.4;
            white-space:normal;
            overflow:visible;
            text-overflow:initial;
            word-break:break-word;
            overflow-wrap:anywhere;
            transition:background .2s ease, box-shadow .2s ease, color .2s ease;
          }
          .tih-link:hover{
            background:rgba(37,99,235,0.14);
            box-shadow:0 2px 10px rgba(37,99,235,0.18);
            text-decoration:underline;
          }
          .tih-link:focus-visible{
            outline:none;
            box-shadow:0 0 0 3px rgba(37,99,235,0.28);
          }
        </style>
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
            <h2 style="margin:0;font-size:20px;color:#111827;">${o}</h2>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${a}</ol>
        </div>
      `;d.forEach(e=>e.innerHTML=l)}).catch(e=>{const t=`
        <div style="color:#b91c1c;padding:15px;background:#fee2e2;border-left:4px solid #ef4444;border-radius:8px;">
          加载历史上的今天失败: ${e.message}
        </div>
      `;d.forEach(e=>e.innerHTML=t)})});