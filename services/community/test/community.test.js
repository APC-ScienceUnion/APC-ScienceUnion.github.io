import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';

async function fixture(t, options={}) {
  let time=Date.now(); const mail=[];
  const config={production:false,database:':memory:',secret:'test-secret-'.repeat(4),origins:['http://localhost:4000'],adminEmail:'owner@example.com',adminNickname:'guinyの时光',topicsFile:null,trustProxy:false,mailDailyLimit:90,mailMonthlyLimit:2900,...options};
  const app=await createApp(config,{now:()=>time,sendMail:async message=>{if(options.failMail)throw new Error('offline');mail.push(message);}});
  const server=http.createServer(app.handler); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));app.close();});
  const request=async(route,data,options={})=>{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api${route}`,{method:data===undefined?'GET':options.method||'POST',headers:{Origin:'http://localhost:4000','Content-Type':'application/json','X-Community-Request':'1',...(options.cookie?{Cookie:options.cookie}:{}),...options.headers},body:data===undefined?undefined:JSON.stringify(data)});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0],headers:response.headers};
  };
  const code=async(email,purpose='register',extra={})=>{
    const response=await request('/auth/code',{email,purpose,...extra.data},extra); assert.equal(response.status,200,JSON.stringify(response.data));
    return mail.at(-1)?.text.match(/验证码：(\d{6})/)[1];
  };
  const register=async(email='alice@example.com',nickname='Alice',extra={})=>{
    const otp=await code(email); const response=await request('/auth/register',{email,nickname,password:'secure-test-password',code:otp,...extra}); assert.equal(response.status,201,JSON.stringify(response.data));return response;
  };
  return {app,mail,request,code,register,advance:(ms=3600001)=>{time+=ms;}};
}

test('verified registration: fixed identity, role allowlist, nickname protection and private email',async t=>{
  const f=await fixture(t);const ordinary=await f.register('alice@example.com','Alice',{role:'admin'});
  assert.equal(ordinary.data.user.role,'user');assert.match(ordinary.data.user.id,/^[\da-f-]{36}$/);assert.match(ordinary.data.user.avatarSeed,/^[\da-f]{32}$/);
  assert.equal(f.app.db.prepare('SELECT password_hash FROM users').get().password_hash.startsWith('scrypt:'),true);
  assert.equal((await f.request('/me',{nickname:'guinyの时光'},{method:'PATCH',cookie:ordinary.cookie})).status,400);
  const owner=await f.register('owner@example.com','anything');assert.equal(owner.data.user.role,'admin');assert.equal(owner.data.user.nickname,'guinyの时光');
  const posted=await f.request('/comments',{topic:'/articles/test',body:'hello'},{cookie:ordinary.cookie});assert.equal(posted.status,201);
  const list=await f.request('/comments?topic=%2Farticles%2Ftest');assert.equal(JSON.stringify(list.data).includes('email'),false);
  assert.equal((await f.request('/stats')).data.registeredUsers,2);
  assert.equal((await f.request('/session',undefined,{cookie:ordinary.cookie})).data.user.email,'alice@example.com');
});

test('OTP required, one-time, purpose-bound, expires and locks after five failures',async t=>{
  const f=await fixture(t);const otp=await f.code('alice@example.com');
  const data={email:'alice@example.com',nickname:'Alice',password:'secure-test-password',code:otp};
  assert.equal((await f.request('/auth/reset',data)).status,400);
  for(let i=0;i<5;i++)assert.equal((await f.request('/auth/register',{...data,code:'000000'})).status,400);
  assert.equal((await f.request('/auth/register',data)).status,400);
  f.advance();data.code=await f.code(data.email);f.advance(600001);assert.equal((await f.request('/auth/register',data)).status,400);
  f.advance();data.code=await f.code(data.email);
  const attempts=await Promise.all([f.request('/auth/register',data),f.request('/auth/register',data)]);
  assert.deepEqual(attempts.map(a=>a.status).sort(),[201,400]);
});

test('reset requires a different password, revokes every session and never signs in automatically',async t=>{
  const f=await fixture(t);const first=await f.register();
  const second=await f.request('/auth/login',{email:'alice@example.com',password:'secure-test-password'});assert.equal(second.status,200);
  f.advance(61000);const otp=await f.code('alice@example.com','reset');
  assert.equal((await f.request('/auth/reset',{email:'alice@example.com',code:otp,password:'secure-test-password'})).status,400);
  const reset=await f.request('/auth/reset',{email:'alice@example.com',code:otp,password:'new-test-password'});assert.equal(reset.status,200);
  for(const cookie of [first.cookie,second.cookie])assert.equal((await f.request('/session',undefined,{cookie})).data.user,null);
  assert.equal((await f.request('/auth/login',{email:'alice@example.com',password:'secure-test-password'})).status,401);
  assert.equal((await f.request('/auth/login',{email:'alice@example.com',password:'new-test-password'})).status,200);
  assert.equal((await f.request('/auth/reset',{email:'alice@example.com',code:otp,password:'third-test-password'})).status,400);
});

test('comments isolate articles, escape via plain data, paginate and enforce author/admin removal',async t=>{
  const f=await fixture(t);const alice=await f.register();const bob=await f.register('bob@example.com','Bob');const owner=await f.register('owner@example.com','Owner');
  const malicious='<img src=x onerror=alert(1)>';
  const a=await f.request('/comments',{topic:'/articles/one',body:malicious},{cookie:alice.cookie});assert.equal(a.status,201);
  assert.equal((await f.request('/comments',{topic:'/articles/two',body:'no auth'})).status,401);
  assert.equal((await f.request('/comments',{topic:'/articles/one',body:'too fast'},{cookie:alice.cookie})).status,429);
  assert.equal((await f.request('/comments/'+a.data.id,{}, {method:'DELETE',cookie:bob.cookie})).status,403);
  assert.equal((await f.request('/comments?topic=%2Farticles%2Ftwo')).data.total,0);
  await f.request('/me',{nickname:'Alice renamed',role:'admin'},{method:'PATCH',cookie:alice.cookie});
  const list=(await f.request('/comments?topic=%2Farticles%2Fone')).data;
  assert.equal(list.items[0].body,malicious);assert.equal(list.items[0].user.nickname,'Alice renamed');assert.equal(list.items[0].user.role,'user');
  f.advance(11000);await f.request('/comments',{topic:'/articles/one',body:'second'},{cookie:alice.cookie});
  const first=(await f.request('/comments?topic=%2Farticles%2Fone&limit=1')).data;assert.ok(first.nextCursor);
  const next=(await f.request('/comments?topic=%2Farticles%2Fone&limit=1&before='+first.nextCursor)).data;assert.equal(next.items[0].id,a.data.id);
  assert.equal((await f.request('/comments/'+a.data.id,{}, {method:'DELETE',cookie:owner.cookie})).status,200);
  assert.equal(f.app.db.prepare('SELECT deleted_by FROM comments WHERE id=?').get(a.data.id).deleted_by,owner.data.user.id);
  f.advance(11000);assert.equal((await f.request('/comments',{topic:'guestbook',body:'a greeting'},{cookie:alice.cookie})).status,201);
});

test('CSRF protection, session cookie attributes, logout and password change',async t=>{
  const f=await fixture(t);const registered=await f.register();
  assert.match(registered.headers.get('set-cookie'),/HttpOnly; SameSite=Lax/);
  assert.equal((await f.request('/me',{nickname:'CSRF'},{method:'PATCH',cookie:registered.cookie,headers:{Origin:'https://attacker.example'}})).status,403);
  assert.equal((await f.request('/me',{nickname:'CSRF'},{method:'PATCH',cookie:registered.cookie,headers:{'X-Community-Request':''}})).status,403);
  assert.equal((await f.request('/me/password',{currentPassword:'wrong-password',password:'new-password-example'},{cookie:registered.cookie})).status,400);
  assert.equal((await f.request('/me/password',{currentPassword:'secure-test-password',password:'new-password-example'},{cookie:registered.cookie})).status,200);
  assert.equal((await f.request('/session',undefined,{cookie:registered.cookie})).data.user,null);
  const logged=await f.request('/auth/login',{email:'alice@example.com',password:'new-password-example'});
  assert.equal((await f.request('/auth/logout',{}, {cookie:logged.cookie})).status,200);
  assert.equal((await f.request('/session',undefined,{cookie:logged.cookie})).data.user,null);
});

test('email binding requires password, verified new address and invalidates recovery/session state',async t=>{
  const f=await fixture(t);const alice=await f.register();
  const other=await f.request('/auth/login',{email:'alice@example.com',password:'secure-test-password'});
  const otp=await f.code('new@example.com','bind',{cookie:alice.cookie,data:{password:'secure-test-password'}});
  assert.equal((await f.request('/me/email',{email:'new@example.com',password:'incorrect-password',code:otp},{cookie:alice.cookie})).status,400);
  const rebound=await f.request('/me/email',{email:'new@example.com',password:'secure-test-password',code:otp},{cookie:alice.cookie});assert.equal(rebound.status,200);
  assert.equal(rebound.data.user.email,'new@example.com');assert.equal(rebound.data.user.id,alice.data.user.id);
  assert.equal((await f.request('/session',undefined,{cookie:other.cookie})).data.user,null);
  assert.equal((await f.request('/auth/login',{email:'alice@example.com',password:'secure-test-password'})).status,401);
  assert.equal((await f.request('/auth/login',{email:'new@example.com',password:'secure-test-password'})).status,200);
});

test('mail cooldown, account enumeration response, hard free-plan caps and failure handling',async t=>{
  const f=await fixture(t,{mailDailyLimit:1});await f.code('first@example.com');
  assert.equal((await f.request('/auth/code',{email:'first@example.com',purpose:'register'})).status,429);
  assert.equal((await f.request('/auth/code',{email:'second@example.com',purpose:'register'})).status,429);assert.equal(f.mail.length,1);
  const a=(await f.request('/auth/code',{email:'absent@example.com',purpose:'reset'})).data;
  assert.equal(a.message,f.mail.length ? '如果该邮箱可用于此操作，验证码将发送到邮箱，10 分钟内有效。' : '');
  const broken=await fixture(t,{failMail:true});
  assert.equal((await broken.request('/auth/code',{email:'first@example.com',purpose:'register'})).status,503);
  assert.equal(broken.app.db.prepare('SELECT count(*) AS count FROM codes').get().count,0);
});

test('production refuses incomplete or insecure configuration',()=>{
  assert.throws(()=>readConfig({NODE_ENV:'production'}),/APP_SECRET/);
  const env={NODE_ENV:'production',APP_SECRET:'s'.repeat(40),ADMIN_EMAIL:'owner@example.com',TOPICS_FILE:'topics.json',ALLOWED_ORIGINS:'http://localhost:4000'};
  assert.throws(()=>readConfig(env),/HTTPS/);
  env.ALLOWED_ORIGINS='https://apc-science.cn';assert.throws(()=>readConfig(env),/mail provider/);
  env.MAIL_FROM='APC <hello@example.com>';env.RESEND_API_KEY='placeholder';env.TRUST_PROXY='true';env.HOST='0.0.0.0';assert.throws(()=>readConfig(env),/loopback/);
});
