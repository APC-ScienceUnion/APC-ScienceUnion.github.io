'use strict';
// Stage all generated image formats, preserve URL paths, and verify byte-for-byte copies.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const imageExtension = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i;
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function walk(root, prefix='') {
  return fs.readdirSync(path.join(root,prefix),{withFileTypes:true}).flatMap(entry=>{
    if(entry.name.startsWith('.'))return [];
    const relative=prefix ? `${prefix}/${entry.name}` : entry.name;
    if(entry.isSymbolicLink())throw new Error(`Symlink not allowed: ${relative}`);
    return entry.isDirectory()?walk(root,relative):[relative];
  });
}
function origin(value) {
  const url=new URL(value);
  if(url.protocol!=='https:' || url.pathname!=='/' || url.search || url.hash || url.username || url.password)throw new Error('Image host must be an HTTPS origin.');
  return url.origin;
}
function prepare(publicRoot, outputRoot) {
  publicRoot=path.resolve(publicRoot); outputRoot=path.resolve(outputRoot);
  if(outputRoot===publicRoot || outputRoot.startsWith(publicRoot+path.sep))throw new Error('Stage images outside the public directory.');
  const records=walk(publicRoot).filter(file=>imageExtension.test(file)).map(file=>{
    const source=path.join(publicRoot,file), dest=path.join(outputRoot,'media',file);
    fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);
    const hash=digest(source);if(digest(dest)!==hash)throw new Error(`Copy verification failed: ${file}`);
    return {path:file,bytes:fs.statSync(source).size,sha256:hash};
  });
  fs.writeFileSync(path.join(outputRoot,'media-manifest.json'),JSON.stringify({version:1,files:records},null,2));
  fs.copyFileSync(path.join(publicRoot,'community-topics.json'),path.join(outputRoot,'community-topics.json'));
  console.log(`Staged and verified ${records.length} images (${(records.reduce((n,r)=>n+r.bytes,0)/1024/1024).toFixed(1)} MiB).`);
  return records;
}
function rewrite(publicRoot, host, site='https://apc-science.cn') {
  host=origin(host); const local=new URL(site).origin;
  const files=walk(publicRoot), images=new Set(files.filter(file=>imageExtension.test(file)).map(file=>'/'+file));
  function rewriteUrl(value, file) {
    if(!value || value.startsWith('data:') || value.startsWith('#'))return value;
    try {
      const base=new URL('/'+file,local);
      const url=new URL(value,base);
      if(url.origin!==local || !images.has(decodeURIComponent(url.pathname)))return value;
      return host+url.pathname+url.search+url.hash;
    } catch{return value;}
  }
  let changed=0;
  for(const file of files.filter(file=>/\.(html|css|js|json|xml)$/i.test(file))) {
    // The daily widgets validate local paths in their cached metadata. Their rendered
    // image URLs are mapped by image-host.js; preserve metadata and checksums here.
    if(file==='images/daily/daily-images.json')continue;
    const absolute=path.join(publicRoot,file), before=fs.readFileSync(absolute,'utf8');
    // Only rewrite complete literal image URLs that resolve to an actual generated asset.
    let after=before.replace(/(["'])([^"'<>\r\n]+)\1/g,(all,quote,value)=>quote+rewriteUrl(value,file)+quote);
    after=after.replace(/url\(\s*([^)'"\s]+)\s*\)/g,(all,value)=>`url(${rewriteUrl(value,file)})`);
    // srcset lists have descriptors; rewrite each URL separately.
    after=after.replace(/srcset=(["'])([^"']+)\1/g,(all,quote,value)=>'srcset='+quote+value.split(',').map(part=>part.trim().split(/\s+/).map((v,i)=>i===0?rewriteUrl(v,file):v).join(' ')).join(', ')+quote);
    if(after!==before){fs.writeFileSync(absolute,after);changed++;}
  }
  // Covers URLs assembled by gallery/game JavaScript on Netlify, with no change to legacy paths.
  const redirectFile=path.join(publicRoot,'_redirects');
  const existing=(fs.existsSync(redirectFile)?fs.readFileSync(redirectFile,'utf8'):'').replace(/# APC IMAGES START\n[\s\S]*?# APC IMAGES END\n?/g,'');
  const block=[...images].sort().map(p=>`${p.split('/').map(encodeURIComponent).join('/')} ${host}${p.split('/').map(encodeURIComponent).join('/')} 302!`).join('\n');
  fs.writeFileSync(redirectFile,'# APC IMAGES START\n'+block+'\n# APC IMAGES END\n'+existing);
  console.log(`Rewrote image references in ${changed} files; added ${images.size} legacy image redirects.`);
}
if(require.main===module){
  const [command,publicRoot='public',target]=process.argv.slice(2);
  if(!target)throw new Error('Usage: node tools/server_assets.js prepare public <stage> | rewrite public <https-image-origin>');
  if(command==='prepare')prepare(publicRoot,target);
  else if(command==='rewrite')rewrite(publicRoot,target);
  else throw new Error('Unknown command.');
}
module.exports={prepare,rewrite};
