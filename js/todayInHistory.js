document.addEventListener("DOMContentLoaded",()=>{const t=document.querySelectorAll("[data-today-in-history]");if(t.length===0)return;t.forEach(t=>{t.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:center;padding:20px;">
        <div style="width:28px;height:28px;border:3px solid #93c5fd;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>
        <span style="margin-left:10px;color:#666;">正在加载科学史上的今天...</span>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `});renderScienceHistoryFromStatic(t)});function renderScienceHistoryFromStatic(c){let t="/";try{if(window.KEEP&&window.KEEP.hexo_config&&window.KEEP.hexo_config.root){t=window.KEEP.hexo_config.root}else if(window.CONFIG&&window.CONFIG.root){t=window.CONFIG.root}}catch(t){}if(!t)t="/";if(!t.endsWith("/"))t+="/";const e=t+"ScienceHistory/science_today.json?_="+Date.now();const l=t+"ScienceHistory/science_today.png";fetch(e).then(t=>{if(!t.ok)throw new Error(`JSON 加载失败: ${t.status}`);return t.text()}).then(e=>{let t;try{t=JSON.parse(e)}catch(t){throw new Error(`JSON 解析失败: ${t.message}，响应前 80 字符: ${e.slice(0,80)}`)}const o=t.title||"科学史上的今天";const n=t.date_text||"";const i=t.week||"";const s=Array.isArray(t.items)?t.items:[];const r=s.length?s.map(t=>`
            <li style="padding:6px 0;border-bottom:1px solid #eee;line-height:1.7;">
              ${t}
            </li>
          `).join(""):'<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';const a=`
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:10px;">
            <div>
              <h2 style="margin:0;font-size:22px;color:#111827;">${o}</h2>
              <div style="margin-top:4px;color:#6b7280;font-size:14px;">${n} ${i}</div>
            </div>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${r}</ol>
        </div>
      `;c.forEach(t=>{t.innerHTML=a;const e=document.createElement("div");e.style.marginTop="18px";const o=new Image;o.src=l;o.alt="科学史上的今天 长图";o.style.width="100%";o.style.borderRadius="8px";o.style.boxShadow="0 6px 24px rgba(0,0,0,.08)";e.appendChild(o);t.appendChild(e)})}).catch(t=>{const e=`
        <div style="color:#b91c1c;padding:15px;background:#fee2e2;border-left:4px solid #ef4444;border-radius:8px;">
          加载科学史上的今天失败: ${t.message}
        </div>
      `;c.forEach(t=>t.innerHTML=e)})}function parseScienceHistoryItems(t){const e=t.split("\n").map(t=>t.trim());const o=[];const n=/^(\d+)\.\s*(.+)$/;for(const i of e){if(!i)continue;if(i.startsWith("```"))continue;if(i.startsWith("科学史上的今天"))continue;const s=i.match(n);if(s&&s[2]){o.push(s[2].trim())}}return o}function generateScienceHistoryPoster({headerUrl:A="",dateText:M,weekText:N,titleText:P,items:I,year:j,month:L,day:O}){return new Promise(async(o,e)=>{try{const l=1080;const n=72;const d=Math.round(l*.56);const r=document.createElement("canvas");r.width=l;r.height=10;const a=r.getContext("2d");const c={date:'500 36px "Noto Sans SC","Microsoft YaHei",sans-serif',week:'400 32px "Noto Sans SC","Microsoft YaHei",sans-serif',titleEn:'600 26px "Noto Sans SC","Microsoft YaHei",sans-serif',title:'700 64px "Noto Sans SC","Microsoft YaHei",sans-serif',item:'400 36px "Noto Sans SC","Microsoft YaHei",sans-serif',footer:'400 26px "Noto Sans SC","Microsoft YaHei",sans-serif',dayBadge:'800 200px "Noto Sans SC","Microsoft YaHei",sans-serif'};const p=l-n*2;function s(e,t,o){const n=t.split("");let i="";const s=[];for(let t=0;t<n.length;t++){const r=i+n[t];const a=e.measureText(r).width;if(a>o&&i){s.push(i);i=n[t]}else{i=r}}if(i)s.push(i);return s}a.font=c.item;const f=56;let i=0;const h=I.map((t,e)=>{const o=`${e+1}. `;const n=s(a,o+t,p);i+=n.length*f+12;return n});const y=64+26+36+24+32;const m=["图像制作：格物社 / A.P.C.科学联盟","灵感赖渊：缪卿九","头图供图：Marianna Armata/Getty Image","特别鸣谢：Qwen-3-Max、kimi-k2-0905-preview","免责声明：图片内容由 AI 总结生成，不代表格物社/A.P.C.科学联盟立场"];const g=36*m.length+80;const x=d+40+y+24+i+g;const u=document.createElement("canvas");u.width=l;u.height=x;const w=u.getContext("2d");w.fillStyle="#ffffff";w.fillRect(0,0,l,x);const b=document.createElement("canvas");b.width=l;b.height=d;const S=b.getContext("2d");const v=async()=>{if(!A){const e=S.createLinearGradient(0,0,l,d);e.addColorStop(0,"#f8d77a");e.addColorStop(1,"#f3a34e");S.fillStyle=e;S.fillRect(0,0,l,d);return}try{const t=await loadImage(A);const o=t.width,n=t.height;const i=Math.max(l/o,d/n);const s=o*i,r=n*i;const a=(l-s)/2;const c=(d-r)/2;S.drawImage(t,a,c,s,r)}catch(t){const e=S.createLinearGradient(0,0,l,d);e.addColorStop(0,"#f8d77a");e.addColorStop(1,"#f3a34e");S.fillStyle=e;S.fillRect(0,0,l,d)}};await v();w.drawImage(b,0,0,l,d,0,0,l,d);let e=d+80;const E=O<10?"0"+O:""+O;w.font=c.dayBadge;w.fillStyle="#ffffff";w.strokeStyle="rgba(0,0,0,.25)";w.lineWidth=4;const $=w.measureText(E);const T=$.width;const C=l-n-T;const k=d-40;w.strokeText(E,C,k);w.fillText(E,C,k);w.fillStyle="#222222";w.font=c.title;w.fillText(P,n,e);e+=64;w.fillStyle="#666666";w.font=c.date;w.fillText(M,n,e);e+=42;w.font=c.week;w.fillText(N,n,e);e+=40;w.strokeStyle="#eeeeee";w.lineWidth=2;w.beginPath();w.moveTo(n,e);w.lineTo(l-n,e);w.stroke();e+=64;w.fillStyle="#333333";w.font=c.item;h.forEach(t=>{t.forEach(t=>{w.fillText(t,n,e);e+=f});e+=12});e+=8;w.strokeStyle="#eeeeee";w.beginPath();w.moveTo(n,e);w.lineTo(l-n,e);w.stroke();e+=36;w.fillStyle="#8a8a8a";w.font=c.footer;m.forEach(t=>{w.fillText(t,n,e);e+=34});const H=`history_today_${j}-${L}-${O}.png`;let t="";try{t=u.toDataURL("image/png")}catch(t){}o({dataUrl:t,fileName:H,canvas:u})}catch(t){e(t)}})}function renderScienceHistoryPoster(a){if(!a||!a.length)return;const o=a[0];const r=o.getAttribute("data-qwen-key")||"";const t=o.getAttribute("data-kimi-key")||"";const c=o.getAttribute("data-history-header")||"";if(!t||!r){try{console.error("[ScienceHistory] 缺少必要的 API Key：",{hasKimi:!!t,hasQwen:!!r})}catch(t){}return}const e=new Date;const l=e.getFullYear();const d=e.getMonth()+1;const p=e.getDate();const f=`${l}-${String(d).padStart(2,"0")}-${String(p).padStart(2,"0")}`;const n=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];const h=n[e.getDay()];const y=`${l}年${d}月${p}日`;const s=t=>String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");function m(t){if(!t)t="（今日未检索到符合条件的科学史重大事件。）";const e=String(t).split("\n");if(e.length&&e[0].trim().startsWith("```")){e.shift()}while(e.length&&e[e.length-1].trim().startsWith("```")){e.pop()}const o=e.join("\n").trim();const n=s(o);const i=`
      <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
        <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
          <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${f}</h2>
        </div>
        <div style="margin-top:4px;color:#374151;line-height:1.8;white-space:pre-wrap;font-size:0.97rem;">
          ${n}
        </div>
      </div>
    `;a.forEach(t=>{t.innerHTML=i})}const g=`scienceHistoryToday_${f}`;let i=null;try{if(typeof window!=="undefined"&&window.localStorage){const b=localStorage.getItem(g);if(b)i=JSON.parse(b)}}catch(t){i=null}if(i&&typeof i==="object"){const S=Array.isArray(i.items)?i.items:[];const v=typeof i.content==="string"?i.content:"";if(S.length){const E=S;const $=E.map(t=>`
        <li style="padding:8px 0;border-bottom:1px solid #eee;line-height:1.7;">
          ${t}
        </li>
      `).join("")||'<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';const T=`
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
            <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${f}</h2>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${$}</ol>
        </div>
      `;a.forEach(t=>{t.innerHTML=T});generateScienceHistoryPoster({headerUrl:c,dateText:y,weekText:h,titleText:"科学史上的今天",items:E,year:l,month:d,day:p}).then(({dataUrl:i,canvas:s})=>{a.forEach(t=>{const e=document.createElement("div");e.style.marginTop="18px";let o;if(i){const n=document.createElement("img");n.src=i;n.alt="科学史上的今天 长图";o=n}else{o=s}o.style.width="100%";o.style.borderRadius="8px";o.style.boxShadow="0 6px 24px rgba(0,0,0,.08)";e.appendChild(o);t.appendChild(e)})}).catch(t=>{const e=document.createElement("div");e.style.marginTop="10px";e.style.color="#b91c1c";e.style.padding="10px 12px";e.style.background="#fee2e2";e.style.borderLeft="4px solid #ef4444";e.style.borderRadius="8px";e.textContent=`科学史上的今天长图生成失败：${t.message}`;a.forEach(t=>t.appendChild(e.cloneNode(true)))});return}if(v){m(v);return}}const x=`我要求你整理“科学史上的今天”资料，今天是${f}。请注意，科学史包括自然科学（理学/工学/农学/医学等）与人文社科（哲学/经济学等）。你禁止包括任何娱乐新闻或无关紧要的小事。

你的回答必须满足以下要求：
0、关于检索的网页只允许查询权威博物馆的历史资料以及公开的权威百科和网站百科资料、以及权威有名的杂志。
禁止百度搜狗360等中国百科、抖音、抖音百科、今天头条、360doc个人图书馆、网易、手机搜狐网、华人头条、IT之家、新晚报。


1、资料必须是历史上的重大事件。

2、你的回答必须符合规定日期**当天**实际发生过的历史事件，你必须查阅网络资料验证信息来源真实。

3、必须严格按照以下格式返回内容，禁止返回格式之外的任何信息。 每件史实必须在同一行内。

4、内容必须权威准确，最后只保留最权威最重要的**20**条

\`\`\`md

科学史上的今天（${f}）

1. 年份（如：1101）：事件简要说明

...

15. 年份（如：2005）：事件简要说明

\`\`\`

5、年份必须**由早到晚**排序。`;const u="https://api.moonshot.cn/v1/chat/completions";const w="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";fetch(u,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:"kimi-k2-0905-preview",messages:[{role:"system",content:"你是一个精通科学史的、严谨的学者。"},{role:"user",content:x}],temperature:.1})}).then(t=>{if(!t.ok)throw new Error(`Kimi API 错误: ${t.status}`);return t.json()}).then(t=>{try{console.debug("[ScienceHistory][Kimi] raw response:",t)}catch(t){}const e=t&&t.choices||[];if(!e.length)throw new Error("Kimi 未返回候选结果");const o=e[0].message||{};const n=typeof o.content==="string"?o.content:Array.isArray(o.content)?o.content.map(t=>t.text||"").join(""):"";if(!n.trim())throw new Error("Kimi 返回文本为空");try{console.debug("[ScienceHistory][Kimi] message.content:",n)}catch(t){}const i=`你是一个精通科学史的、严谨的学者。请检查我收集的资料【${n}】中的内容是否准确（你必须严格审查日期与事件的真实性）。

- 如果有条目错误，必须直接删除该条目。
- 检查无误后，保持资料原本的格式（科学史上的今天（${f}）以及后续内容）返回给我（你需要确保剩下的条目都正确）
- 如果所有条目均不正确，你只需要返回原本资料的header（即科学史上的今天（${f}））
- 禁止输出条目原本的序号
- 禁止输出条目外的内容。`;const s={model:"qwen3-max-preview",messages:[{role:"system",content:"你是一个精通科学史的、严谨的学者"},{role:"user",content:i}],temperature:.1,extra_body:{enable_thinking:true}};return fetch(w,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify(s)})}).then(t=>{if(!t.ok)throw new Error(`Qwen3 API 错误: ${t.status}`);return t.json()}).then(t=>{try{console.debug("[ScienceHistory][Qwen3] raw response:",t)}catch(t){}const e=t&&t.choices||[];if(!e.length)throw new Error("Qwen3 未返回候选结果");const o=e[0].message||{};const n=typeof o.content==="string"?o.content:"";try{console.debug("[ScienceHistory][Qwen3] message.content:",n)}catch(t){}if(!n.trim())throw new Error("Qwen3 返回文本为空");const i=parseScienceHistoryItems(n);try{if(typeof window!=="undefined"&&window.localStorage){localStorage.setItem(g,JSON.stringify({items:i,content:n}))}}catch(t){}if(!i.length){try{console.warn("[ScienceHistory][Qwen3] 本日无可解析条目，直接展示模型原文。")}catch(t){}m(n);return}const s=i.map(t=>`
        <li style="padding:8px 0;border-bottom:1px solid #eee;line-height:1.7;">
          ${t}
        </li>
      `).join("")||'<div style="padding:16px;color:#6b7280;">今天暂无记录</div>';const r=`
        <div style="max-width:900px;margin:16px auto;padding:18px 20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(149,157,165,0.2);">
          <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:10px;">
            <h2 style="margin:0;font-size:20px;color:#111827;">科学史上的今天 - ${f}</h2>
          </div>
          <ol style="list-style:none;padding:0;margin:0;">${s}</ol>
        </div>
      `;a.forEach(t=>{t.innerHTML=r});return generateScienceHistoryPoster({headerUrl:c,dateText:y,weekText:h,titleText:"科学史上的今天",items:i,year:l,month:d,day:p})}).then(({dataUrl:i,canvas:s})=>{a.forEach(t=>{const e=document.createElement("div");e.style.marginTop="18px";let o;if(i){const n=document.createElement("img");n.src=i;n.alt="科学史上的今天 长图";o=n}else{o=s}o.style.width="100%";o.style.borderRadius="8px";o.style.boxShadow="0 6px 24px rgba(0,0,0,.08)";e.appendChild(o);t.appendChild(e)})}).catch(t=>{const e=document.createElement("div");e.style.marginTop="10px";e.style.color="#b91c1c";e.style.padding="10px 12px";e.style.background="#fee2e2";e.style.borderLeft="4px solid #ef4444";e.style.borderRadius="8px";e.textContent=`科学史上的今天长图生成失败：${t.message}`;o.appendChild(e)})}