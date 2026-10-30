// Local-only preview. Fake mail stays in a private local file, never in API responses.
import http from 'node:http';
import { mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { hashPassword, nicknameKey } from './security.js';
import { randomBytes, randomUUID } from 'node:crypto';
if(process.env.NODE_ENV==='production')throw new Error('The preview server cannot run in production.');
const sitePort=Number(process.env.PREVIEW_SITE_PORT || 4000);
if(!Number.isInteger(sitePort)||sitePort<1024||sitePort>65535)throw new Error('PREVIEW_SITE_PORT must be an integer from 1024 to 65535.');
const directory=fileURLToPath(new URL('../data/',import.meta.url));mkdirSync(directory,{recursive:true,mode:0o700});
const app=await createApp({production:false,database:path.join(directory,'preview.sqlite'),secret:'local-preview-only-secret-not-for-production',origins:[`http://localhost:${sitePort}`,`http://127.0.0.1:${sitePort}`],adminEmail:'preview-admin@example.test',adminNickname:'guinyの时光',topicsFile:process.env.TOPICS_FILE || null,trustProxy:false,mailDailyLimit:100,mailMonthlyLimit:3000},
  {sendMail:async message=>appendFileSync(path.join(directory,'preview-mail.jsonl'),JSON.stringify(message)+'\n',{mode:0o600})});
if(!app.db.prepare('SELECT id FROM users WHERE email=?').get('preview@example.test'))app.db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)').run(randomUUID(),'preview@example.test','预览读者',nicknameKey('预览读者'),await hashPassword('LocalPreview-2026!'),randomBytes(16).toString('hex'),'user',Date.now());
const server=http.createServer(app.handler);server.listen(8787,'127.0.0.1',()=>console.log(`Local preview API: http://127.0.0.1:8787; site port: ${sitePort}; mail stays in ${path.join(directory,'preview-mail.jsonl')}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{app.close();process.exit(0);}));
