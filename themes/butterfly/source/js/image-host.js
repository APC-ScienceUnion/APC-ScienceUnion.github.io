(() => {
  'use strict';
  const configured = document.querySelector('meta[name="image-host"]')?.content;
  if (!configured) return;
  let host;
  try {
    const url = new URL(configured);
    const loopback = name => ['localhost', '127.0.0.1', '[::1]'].includes(name);
    if (url.origin !== configured || (url.protocol !== 'https:' && !(loopback(location.hostname) && loopback(url.hostname)))) return;
    host = url.origin;
  } catch { return; }
  const extension = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i;
  const states = new WeakMap(), backgroundStates = new WeakMap(), probes = new Map(), localSources = new WeakSet();
  const cooldown = 60000, initialWait = 8000, largeImageWait = 60000;
  const storageKey = 'apc-image-failures:' + host;
  let failures = {}, hostUntil = 0, recentFailures = [];
  try { const saved=JSON.parse(sessionStorage.getItem(storageKey)||'{}'); failures=saved.files||{}; hostUntil=saved.hostUntil||0; } catch {}
  function save() {
    const now=Date.now();
    failures=Object.fromEntries(Object.entries(failures).filter(([,until])=>until>now).slice(-200));
    try { sessionStorage.setItem(storageKey,JSON.stringify({files:failures,hostUntil})); } catch {}
  }
  function urls(value) {
    try {
      const url=new URL(value,document.baseURI);
      if (![host,location.origin].includes(url.origin) || !extension.test(url.pathname)) return null;
      const suffix=url.pathname+url.search+url.hash;
      return {remote:host+suffix,local:location.origin+suffix};
    } catch { return null; }
  }
  function failed(remote) {
    const now=Date.now();
    if ((failures[remote]||0)>now) return;
    failures[remote]=now+cooldown;
    recentFailures=recentFailures.filter(item=>now-item.time<10000);
    recentFailures.push({remote,time:now});
    if (new Set(recentFailures.map(item=>item.remote)).size>=3) hostUntil=now+cooldown;
    save();
  }
  function prefer(value, local=false) {
    const pair=urls(value);
    return pair ? (local || hostUntil>Date.now() || failures[pair.remote]>Date.now() ? pair.local : pair.remote) : value;
  }
  function srcset(value, local) {
    if (!value || value.includes('data:')) return value;
    return value.split(',').map(part=>part.trim().split(/\s+/).map((v,i)=>i?v:prefer(v,local)).join(' ')).join(', ');
  }
  function set(element,name,value) { if(value && element.getAttribute(name)!==value)element.setAttribute(name,value); }
  function fallback(img) {
    const pair=urls(img.currentSrc||img.src);
    if (!pair || !(img.currentSrc||img.src).startsWith(host+'/')) return;
    const state=states.get(img)||{};
    clearTimeout(state.timer);
    failed(pair.remote);
    state.url=pair.remote; state.fallback=true; states.set(img,state);
    // A selected <source> otherwise overrides img.src and keeps retrying the host.
    img.closest('picture')?.querySelectorAll('source[srcset]').forEach(source=>{localSources.add(source);set(source,'srcset',srcset(source.getAttribute('srcset'),true));});
    if(img.hasAttribute('srcset'))set(img,'srcset',srcset(img.getAttribute('srcset'),true));
    set(img,'data-src',prefer(img.getAttribute('data-src')||pair.remote,true));
    set(img,'src',pair.local);
  }
  function watch(img) {
    const remote=img.currentSrc||img.src;
    if (!remote?.startsWith(host+'/')) return;
    const old=states.get(img);
    if(old?.url===remote)return;
    clearTimeout(old?.timer);
    const state={url:remote,fallback:false};states.set(img,state);
    if(img.complete) { if(!img.naturalWidth)fallback(img); return; }
    function deadline(extended=false) {
      if(states.get(img)!==state || img.complete || !img.isConnected)return;
      // Do not penalize a large image already arriving over the 5 Mbps connection.
      if(!extended && img.naturalWidth) { state.timer=setTimeout(()=>deadline(true),largeImageWait-initialWait);return; }
      fallback(img);
    }
    state.timer=setTimeout(()=>deadline(),initialWait);
  }
  const visible = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){visible.unobserve(entry.target);watch(entry.target);}
  }),{rootMargin:'300px'});
  function image(img) {
    const state=states.get(img);
    // External code may assign a new gallery image to the same element.
    const sameFallback=state?.fallback && urls(img.src)?.local===urls(state.url)?.local;
    for(const name of ['src','data-src'])set(img,name,prefer(img.getAttribute(name),sameFallback));
    if(img.hasAttribute('srcset'))set(img,'srcset',srcset(img.getAttribute('srcset'),sameFallback));
    if(img.loading==='lazy' && !img.complete && !img.naturalWidth)visible.observe(img);else watch(img);
  }
  function probe(remote) {
    if(probes.has(remote))return probes.get(remote);
    const result=new Promise(resolve=>{
      const img=new Image();let timer;
      function done(ok){clearTimeout(timer);img.onload=img.onerror=null;if(!ok){failed(remote);img.src='';}resolve(ok);}
      img.onload=()=>done(true);img.onerror=()=>done(false);img.src=remote;
      timer=setTimeout(()=>{
        if(img.naturalWidth)timer=setTimeout(()=>done(false),largeImageWait-initialWait);
        else done(false);
      },initialWait);
    });
    probes.set(remote,result);return result;
  }
  function background(element) {
    const original=element.style.backgroundImage;
    if(!original || backgroundStates.get(element)===original)return;
    const mapped=original.replace(/url\(["']?([^"')]+)["']?\)/g,(_,value)=>`url("${prefer(value)}")`);
    element.style.backgroundImage=mapped;backgroundStates.set(element,element.style.backgroundImage);
    const expected=element.style.backgroundImage;
    for(const match of expected.matchAll(/url\(["']?([^"')]+)["']?\)/g)){
      const pair=urls(match[1]);if(!pair || match[1]!==pair.remote)continue;
      // Shares the browser cache/request with the CSS image; no local download on success.
      probe(pair.remote).then(ok=>{
        if(ok || element.style.backgroundImage!==backgroundStates.get(element))return;
        element.style.backgroundImage=element.style.backgroundImage.split(pair.remote).join(pair.local);
        backgroundStates.set(element,element.style.backgroundImage);
      });
    }
  }
  function node(element) {
    if(!(element instanceof Element))return;
    if(element.matches('img'))image(element);
    else if(element.matches('picture source[srcset]'))set(element,'srcset',srcset(element.getAttribute('srcset'),localSources.has(element)));
    background(element);
  }
  function scan(root){node(root);root.querySelectorAll?.('img,picture source,[style]').forEach(node);}
  document.addEventListener('error',event=>{
    const img=event.target;
    if(img instanceof HTMLImageElement && (img.currentSrc||img.src).startsWith(host+'/')){
      event.stopImmediatePropagation();fallback(img);
    }
  },true);
  document.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)clearTimeout(states.get(event.target)?.timer);},true);
  scan(document.documentElement);
  new MutationObserver(records=>records.forEach(record=>{
    if(record.type==='attributes')node(record.target);else record.addedNodes.forEach(scan);
  })).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data-src','srcset','style']});
})();
