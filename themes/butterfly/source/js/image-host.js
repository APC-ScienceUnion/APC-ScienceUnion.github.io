(() => {
  'use strict';
  const host=document.querySelector('meta[name="image-host"]')?.content;
  if(!host || !/^https:\/\/[^/]+$/.test(host) || ['localhost','127.0.0.1'].includes(location.hostname))return;
  function map(value){
    try{const url=new URL(value,document.baseURI);return url.origin===location.origin && /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i.test(url.pathname)?host+url.pathname+url.search+url.hash:value;}catch{return value;}
  }
  function node(element){
    if(!(element instanceof Element))return;
    for(const name of ['src','data-src','poster']){
      if(!element.matches('img,source,video'))continue;
      const value=element.getAttribute(name);if(value){const next=map(value);if(next!==value)element.setAttribute(name,next);}
    }
    if(element.hasAttribute('srcset')){
      const value=element.getAttribute('srcset');
      if(!value.includes('data:')){const next=value.split(',').map(p=>p.trim().split(/\s+/).map((v,i)=>i?v:map(v)).join(' ')).join(', ');if(value!==next)element.setAttribute('srcset',next);}
    }
    const background=element.style.backgroundImage;
    if(background){const next=background.replace(/url\(["']?([^"')]+)["']?\)/g,(_,value)=>`url("${map(value)}")`);if(background!==next)element.style.backgroundImage=next;}
  }
  function scan(root){node(root);root.querySelectorAll?.('img,source,video,[style]').forEach(node);}
  scan(document.documentElement);
  new MutationObserver(records=>records.forEach(record=>{if(record.type==='attributes')node(record.target);else record.addedNodes.forEach(scan);})).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data-src','srcset','poster','style']});
})();
