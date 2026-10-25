'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const counts={local:{},remote:{}};
const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="#207465"/></svg>');
function serveImage(req,res,remote){const key=req.url.split('?')[0];const group=remote?'remote':'local';counts[group][key]=(counts[group][key]||0)+1;if(remote&&key.includes('timeout'))return;if(remote&&key.includes('missing')){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'image/svg+xml','Content-Length':svg.length,'Cache-Control':'max-age=3600'});res.end(svg);}
http.createServer((req,res)=>{
 if(req.url==='/js/image-host.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(fs.readFileSync(path.join(__dirname,'../themes/butterfly/source/js/image-host.js')));return;}
 if(req.url==='/counts'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(counts));return;}
 if(req.url.startsWith('/images/')){serveImage(req,res,false);return;}
 res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<!doctype html><meta name="image-host" content="http://127.0.0.1:4321"><script src="/js/image-host.js" defer></script><h1>图片回退验证</h1><p id="result">正在运行：正常加载、404、无响应、动态图片、响应式图片、背景图、延迟加载。</p><img id="ok" src="http://127.0.0.1:4321/images/success.svg"><img id="missing" src="http://127.0.0.1:4321/images/missing.svg"><img id="timeout" src="http://127.0.0.1:4321/images/timeout.svg"><picture><source srcset="http://127.0.0.1:4321/images/missing.svg 1x, http://127.0.0.1:4321/images/missing2.svg 2x"><img id="picture" src="http://127.0.0.1:4321/images/missing.svg"></picture><div id="background" style="width:100px;height:60px;background-image:url(http://127.0.0.1:4321/images/missing.svg)"></div><div style="height:3000px"></div><img id="lazy" loading="lazy" src="http://127.0.0.1:4321/images/lazy.svg"><script>
setTimeout(()=>{const img=document.createElement('img');img.id='dynamic';img.src='/images/missing.svg';document.body.prepend(img);},1000);
setTimeout(async()=>{const c=await (await fetch('/counts')).json();const local=id=>document.getElementById(id).currentSrc.startsWith(location.origin+'/')&&document.getElementById(id).naturalWidth>0;const checks={success:document.getElementById('ok').naturalWidth>0&&!c.local['/images/success.svg'],error:local('missing'),timeout:local('timeout'),picture:local('picture'),dynamic:local('dynamic'),background:document.getElementById('background').style.backgroundImage.includes(location.origin+'/'),lazy:!c.local['/images/lazy.svg'],noLoop:(c.remote['/images/missing.svg']||0)<5};document.getElementById('result').textContent=(Object.values(checks).every(Boolean)?'PASS ':'FAIL ')+JSON.stringify(checks);},11000);
</script>`);
}).listen(4320,'127.0.0.1');
http.createServer((req,res)=>serveImage(req,res,true)).listen(4321,'127.0.0.1');
console.log('http://127.0.0.1:4320');
