'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {buildImagePlan}=require('./publish_categorized_images');
const root=path.resolve(__dirname,'..');
const imageExtension=/\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i;
const configPath=path.join(root,'.image-upload.local.json');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const encodeRoute=route=>'/'+route.split('/').map(encodeURIComponent).join('/');
function configuration(){
  if(!fs.existsSync(configPath))throw new Error('请先按照 tools/IMAGE_HOSTING.md 配置 .image-upload.local.json。');
  const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
  for(const key of ['keyFile','knownHostsFile','rsync','ssh'])if(!fs.existsSync(config[key]))throw new Error(`配置中的 ${key} 文件不存在。`);
  if(!/^[a-z0-9.-]+$/i.test(config.host)||!/^[a-z_][a-z0-9_-]*$/i.test(config.user))throw new Error('服务器或账号格式无效。');
  for(const key of ['imageOrigin','siteOrigin']){const url=new URL(config[key]);if(url.protocol!=='https:'||url.origin!==config[key])throw new Error('图片和网站地址必须是 HTTPS 源站地址。');}
  return config;
}
function allRecords(){return buildImagePlan().records.filter(r=>imageExtension.test(r.sourceFile));}
function localReference(value,article,records,config){
  let clean=value.trim().replace(/^<|>$/g,'');
  try {
    if(/^https?:\/\//i.test(clean)){
      const url=new URL(clean);if(![config.siteOrigin,config.imageOrigin].includes(url.origin))return null;clean=url.pathname;
    }
    clean=decodeURIComponent(clean.split(/[?#]/)[0]);
  }catch{return null;}
  if(!imageExtension.test(clean))return null;
  const sourceAbsolute=path.resolve(path.dirname(article),clean);
  return records.find(r=>'/'+r.publicRoute===clean||'/'+r.sourceRoute===clean||r.sourceFile===sourceAbsolute||path.resolve(root,clean)===r.sourceFile)||null;
}
function articleReferences(text){
  const refs=[];
  const patterns=[/!\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)/g,/<img\b[^>]*\bsrc=["']([^"']+)["']/gi,/^\s*(?:cover|top_img):\s*["']?([^\r\n"']+)["']?\s*$/gm];
  for(const pattern of patterns)for(const match of text.matchAll(pattern)){
    const offset=match.index+match[0].indexOf(match[1]);refs.push({value:match[1],start:offset,end:offset+match[1].length});
  }
  return refs;
}
function planInput(input,config=configuration()){
  const absolute=path.resolve(input),stat=fs.lstatSync(absolute);
  if(stat.isSymbolicLink())throw new Error('不能上传符号链接。');
  const records=allRecords();
  if(stat.isFile()&&/\.md$/i.test(absolute)){
    const text=fs.readFileSync(absolute,'utf8'),changes=[],selected=new Map(),missing=[];
    for(const ref of articleReferences(text)){
      const record=localReference(ref.value,absolute,records,config);
      if(record){selected.set(record.publicRoute,record);changes.push({...ref,replacement:encodeRoute(record.publicRoute)});}
      else if(!/^https?:\/\//i.test(ref.value)&&imageExtension.test(ref.value.split(/[?#]/)[0]))missing.push(ref.value);
    }
    if(missing.length)throw new Error('以下图片无法在 source/images 中定位：'+missing.join('、'));
    return {records:[...selected.values()],article:absolute,text,changes};
  }
  const selected=records.filter(r=>r.sourceFile===absolute||(stat.isDirectory()&&r.sourceFile.startsWith(absolute+path.sep)));
  if(!selected.length)throw new Error('请选择 source/images 内的图片、目录，或引用这些图片的 Markdown 文章。');
  return {records:selected};
}
function msys(file){return file.replace(/\\/g,'/').replace(/^([a-z]):/i,(_,drive)=>'/'+drive.toLowerCase());}
function quote(value){return "'"+value.replace(/'/g,"'\\''")+"'";}
function execute(file,args,options){return new Promise((resolve,reject)=>{
  const child=spawn(file,args,{...options,windowsHide:true,shell:false});let output='';
  child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{output+=data;});
  child.once('error',reject);child.once('close',code=>code===0?resolve(output):reject(new Error(`图片同步失败（${code}）：${output.slice(-1500)}`)));
});}
async function upload(records,config=configuration()){
  if(!records.length)throw new Error('没有找到需要上传的图片。');
  const stage=fs.mkdtempSync(path.join(os.tmpdir(),'apc-image-upload-'));
  try {
    for(const record of records){
      if(!imageExtension.test(record.publicRoute)||record.publicRoute.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('图片目标路径无效。');
      const destination=path.join(stage,...record.publicRoute.split('/'));
      fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(record.sourceFile,destination);
    }
    const convert=process.platform==='win32'?msys:value=>value;
    const remoteShell=[config.ssh,'-i',config.keyFile,'-o','BatchMode=yes','-o','IdentitiesOnly=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','ServerAliveInterval=15','-o','ServerAliveCountMax=3','-o','UserKnownHostsFile='+convert(config.knownHostsFile)].map((v,i)=>quote(i===0||i===2?convert(v):v)).join(' ');
    await execute(config.rsync,['-az','--checksum','--chmod=D755,F644','--timeout=90','-e',remoteShell,convert(stage)+'/',`${config.user}@${config.host}:/apc-media/`],{cwd:root,env:{...process.env,PATH:[config.runtimePath||'',process.env.PATH].filter(Boolean).join(path.delimiter)}});
    const results=[];
    for(const record of records){
      const route=encodeRoute(record.publicRoute),serverUrl=config.imageOrigin+route;
      const response=await fetch(serverUrl,{method:'HEAD',signal:AbortSignal.timeout(15000)});
      if(!response.ok||Number(response.headers.get('content-length'))!==fs.statSync(record.sourceFile).size)throw new Error('已传输，但公网校验未通过：'+serverUrl+'。本地文件已保留，可重试。');
      results.push({source:path.relative(root,record.sourceFile),serverDirectory:'/srv/apc-media/'+path.posix.dirname(record.publicRoute),path:route,url:serverUrl,fallback:config.siteOrigin+route,markdown:`![](${route})`});
    }
    const reportDir=path.join(root,'tmp/community-uploads');fs.mkdirSync(reportDir,{recursive:true});
    const report=path.join(reportDir,new Date().toISOString().replace(/[:.]/g,'-')+'.json');fs.writeFileSync(report,JSON.stringify(results,null,2)+'\n');
    return {images:results,report};
  }finally{fs.rmSync(stage,{recursive:true,force:true});}
}
function rewriteArticle(plan){
  if(!plan.article)return null;
  if(fs.readFileSync(plan.article,'utf8')!==plan.text)throw new Error('文章在上传期间被修改，已跳过自动改写，请重新运行。');
  let result=plan.text;
  for(const item of [...plan.changes].sort((a,b)=>b.start-a.start))result=result.slice(0,item.start)+item.replacement+result.slice(item.end);
  if(result===plan.text)return null;
  const dir=path.join(root,'tmp/community-uploads/backups');fs.mkdirSync(dir,{recursive:true});
  const backup=path.join(dir,Date.now()+'-'+path.basename(plan.article));fs.writeFileSync(backup,plan.text);fs.writeFileSync(plan.article,result);return backup;
}
function safeSegment(value){return typeof value==='string'&&value.length>0&&value.length<=120&&!/[\x00-\x1f<>:"/\\|?*]/.test(value)&&!/[. ]$/.test(value)&&!['.','..'].includes(value)&&! /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value);}
function importImages(category,bucket,files){
  if(!safeSegment(category)||!safeSegment(bucket)||['daily','apc-news'].includes(category)||['daily','apc-news'].includes(bucket))throw new Error('分类和目录名称无效，请勿使用保留名称或路径符号。');
  if(!Array.isArray(files)||!files.length||files.length>100)throw new Error('请选择 1–100 张图片。');
  const base=path.join(root,'source/images',category,bucket),prepared=[],seen=new Set();let total=0;
  for(const file of files){
    const pieces=String(file.name||'').split('/');
    if(!pieces.every(safeSegment)||!imageExtension.test(file.name))throw new Error('仅支持图片文件及安全的相对路径。');
    const portableName=file.name.normalize('NFC').toLowerCase();
    if(seen.has(portableName))throw new Error('本批存在重名图片，请分别命名：'+file.name);
    seen.add(portableName);
    const bytes=Buffer.from(file.data||'','base64');total+=bytes.length;
    if(!bytes.length||total>50*1024*1024)throw new Error('每批图片总大小不得超过 50 MB。');
    const destination=path.join(base,...pieces);
    // Do not follow a user-created symlink/junction outside the source image tree.
    let current=root;
    for(const component of path.relative(root,destination).split(path.sep)){current=path.join(current,component);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw new Error('目标路径包含符号链接。');}
    if(fs.existsSync(destination)&&hash(fs.readFileSync(destination))!==hash(bytes))throw new Error('同名图片内容不同，请换一个文件名：'+file.name);
    prepared.push({destination,bytes,publicRoute:'images/'+bucket+'/'+file.name});
  }
  const existing=allRecords();
  if(existing.some(r=>r.bucket?.normalize('NFC').toLowerCase()===bucket.normalize('NFC').toLowerCase()&&r.category!==category))throw new Error('该图片目录已被其他分类使用，请换目录名。');
  for(const item of prepared){const collision=existing.find(r=>r.publicRoute.normalize('NFC').toLowerCase()===item.publicRoute.normalize('NFC').toLowerCase());if(collision&&collision.sourceFile!==item.destination)throw new Error('该图片目录已被其他分类使用，请换目录名。');}
  for(const item of prepared){fs.mkdirSync(path.dirname(item.destination),{recursive:true});fs.writeFileSync(item.destination,item.bytes);}
  return prepared.map(item=>({sourceFile:item.destination,publicRoute:item.publicRoute}));
}
async function main(){
  const args=process.argv.slice(2),input=args.find(a=>!a.startsWith('--'));
  if(!input||args.includes('--help')){console.log('用法：node tools/upload_images.js <图片/目录/文章.md> [--dry-run] [--write]\n--write：上传成功后将文章图片路径转为本站相对路径，自动备份原文。\n--dry-run：只预览清单，不上传、不改文章。');return;}
  if(args.some(a=>a.startsWith('--')&&!['--write','--dry-run'].includes(a)))throw new Error('未知选项。');
  const config=configuration(),plan=planInput(input,config);
  if(args.includes('--dry-run')){console.log(JSON.stringify(plan.records.map(r=>({source:r.sourceFile,path:encodeRoute(r.publicRoute)})),null,2));return;}
  const result=await upload(plan.records,config);
  if(args.includes('--write')){const backup=rewriteArticle(plan);if(backup)console.log('原文备份：'+backup);}
  for(const image of result.images)console.log(`${image.source}\n服务器目录：${image.serverDirectory}\n图片网址：${image.url}\n文章用法：${image.markdown}\n`);
  console.log('上传并校验完成。报告：'+result.report+'\n本地备份须随文章一起提交发布后，访客才能使用回退。');
}
module.exports={root,configuration,planInput,articleReferences,localReference,upload,rewriteArticle,importImages,safeSegment};
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
