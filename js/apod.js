document.addEventListener("DOMContentLoaded",()=>{const t=document.querySelectorAll("[data-apod]");if(t.length===0)return;const e="5a1S3uxboIVQSPCg6bdNSg2pjHnaelBbedbgUhbE";const o=`https://api.nasa.gov/planetary/apod?api_key=${e}`;fetch(o).then(t=>{if(!t.ok)throw new Error(`HTTP 错误! 状态: ${t.status}`);return t.json()}).then(a=>{t.forEach(t=>{const e=a.media_type||"image";const o=e==="image";let i="";if(o){i+=`<img src="${a.url}" alt="${a.title}" style="max-width: 100%; display: block; margin: 0 auto;">`}i+=`<div style="margin-top: 15px;">
            <h2 style="margin-bottom: 5px;">${a.title}</h2>
            <p style="color: #666; font-size: 0.9em;">${a.date}</p>
          </div>`;i+=`<div style="margin-top: 15px; line-height: 1.6;">${a.explanation}</div>`;if(a.copyright){i+=`<div style="margin-top: 15px; font-size: 0.9em; color: #888;">
              版权信息：${a.copyright}
            </div>`}t.innerHTML=i})}).catch(e=>{t.forEach(t=>{t.innerHTML=`<div style="color: #d9534f; padding: 15px; background: #f8d7da; border-left: 4px solid #d9534f;">
            加载 APOD 数据失败: ${e.message}
          </div>`})})});