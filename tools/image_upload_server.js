'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {root,configuration,importImages,upload}=require('./upload_images');
const token=crypto.randomBytes(32).toString('hex');
const port=Number(process.env.APC_UPLOAD_PORT||4318),origin=`http://127.0.0.1:${port}`;
let busy=false;
function reply(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{
  if(req.headers.host!==`127.0.0.1:${port}`){reply(res,403,{error:'仅允许本机访问。'});return;}
  if(req.method==='GET'&&req.url==='/'){
    const html=fs.readFileSync(path.join(__dirname,'image_upload.html'),'utf8').replace('__UPLOAD_TOKEN__',token);
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src blob: data:; frame-ancestors 'none'; base-uri 'none'"});res.end(html);return;
  }
  if(req.method==='GET'&&req.url==='/categories'){
    const categories=fs.readdirSync(path.join(root,'source/images'),{withFileTypes:true}).filter(e=>e.isDirectory()&&!['daily','apc-news'].includes(e.name)).map(e=>e.name);reply(res,200,{categories});return;
  }
  if(req.method!=='POST'||req.url!=='/upload'){reply(res,404,{error:'没有这个页面。'});return;}
  if(req.headers.origin!==origin||req.headers['x-upload-token']!==token||!String(req.headers['content-type']).startsWith('application/json')){reply(res,403,{error:'请求校验失败，请重新打开工具。'});return;}
  if(busy){reply(res,409,{error:'已有上传正在进行，请稍候。'});return;}
  busy=true;
  try{
    const chunks=[];let length=0;
    for await(const chunk of req){length+=chunk.length;if(length>72*1024*1024)throw new Error('每批图片不得超过 50 MB。');chunks.push(chunk);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const config=configuration();
    const records=importImages(body.category,body.bucket,body.files);
    const result=await upload(records,config);reply(res,200,result);
  }catch(error){reply(res,400,{error:error.message});}
  finally{busy=false;}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`工具可能已打开，请访问 ${origin}`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
  console.log(`图片上传工具：${origin}\n仅此电脑可访问。关闭此窗口即可停止工具。`);
  if(process.argv.includes('--open')&&process.platform==='win32')require('node:child_process').spawn('explorer.exe',[origin],{windowsHide:true,stdio:'ignore'}).on('error',()=>{});
});
