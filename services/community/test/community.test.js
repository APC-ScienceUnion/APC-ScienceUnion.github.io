import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';

async function fixture(t, options={}) {
  let time=Date.now(); const mail=[];
  const config={production:false,database:':memory:',secret:'test-secret-'.repeat(4),origins:['http://localhost:4000'],adminEmail:'owner@example.com',adminNickname:'guinyの时光',topicsFile:null,trustProxy:false,mailDailyLimit:90,mailMonthlyLimit:2900,...options};
  const app=await createApp(config,{identityProvider:options.identityProvider,now:()=>time,sendMail:async message=>{if(options.failMail)throw new Error('offline');mail.push(message);}});
  const server=http.createServer(app.handler); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));app.close();});
  const request=async(route,data,options={})=>{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api${route}`,{redirect:'manual',method:data===undefined?'GET':options.method||'POST',headers:{Origin:'http://localhost:4000','Content-Type':'application/json','X-Community-Request':'1',...(options.cookie?{Cookie:options.cookie}:{}),...options.headers},body:data===undefined?undefined:JSON.stringify(data)});
    const text=await response.text();
    return {status:response.status,data:text?JSON.parse(text):null,cookie:response.headers.get('set-cookie')?.split(';')[0],headers:response.headers};
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

function identityProviderFixture(){
  let counter=0;const pending=new Map();
  return {
    start(binding){const state=`test-state-${++counter}`;pending.set(state,binding);return {authorizationUrl:`https://test.authing.cn/oidc/auth?state=${state}`};},
    async finish({state,code,sessionBinding}){
      assert.equal(code,'test-provider-code');assert.equal(pending.get(state),sessionBinding);pending.delete(state);
      return {provider:'authing',evidence:'wechat-source',issuer:'https://test.authing.cn/oidc',subject:'test-wechat-subject',phone:'+8613800138000',sourceId:'a'.repeat(24),connectionId:'b'.repeat(24),verifiedAt:Date.now(),role:'admin'};
    }
  };
}

test('identity binding requires consent, password, same session and confirmation; gates comments for all roles',async t=>{
  const f=await fixture(t,{identityProvider:identityProviderFixture(),identityReturnUrl:'http://localhost:4000/account/',requireVerifiedIdentity:true});
  const alice=await f.register(),bob=await f.register('bob@example.com','Bob'),owner=await f.register('owner@example.com','Owner');
  for(const user of [alice,owner])assert.equal((await f.request('/comments',{topic:'guestbook',body:'not verified'},{cookie:user.cookie})).status,403);
  assert.equal((await f.request('/identity/start',{password:'secure-test-password'},{cookie:alice.cookie})).status,400);
  assert.equal((await f.request('/identity/start',{consent:true,password:'incorrect-password'},{cookie:alice.cookie})).status,400);
  const start=await f.request('/identity/start',{consent:true,password:'secure-test-password'},{cookie:alice.cookie});assert.equal(start.status,200);
  const state=new URL(start.data.authorizationUrl).searchParams.get('state');
  const callback=`/identity/callback?state=${state}&code=test-provider-code`;
  const wrong=await f.request(callback,undefined,{cookie:bob.cookie});assert.match(wrong.headers.get('location'),/identity=failed/);
  const accepted=await f.request(callback,undefined,{cookie:alice.cookie});assert.match(accepted.headers.get('location'),/identity=confirm/);
  const status=(await f.request('/identity/status',undefined,{cookie:alice.cookie})).data;
  assert.equal(status.verified,false);assert.equal(status.pending.phoneMasked,'+86138****8000');assert.doesNotMatch(JSON.stringify(status),/13800138000|test-wechat-subject/);
  assert.equal((await f.request('/identity/status',undefined,{cookie:bob.cookie})).data.pending,null);
  assert.equal((await f.request('/identity/confirm',{receipt:status.pending.receipt,confirm:true},{cookie:bob.cookie})).status,400);
  assert.equal((await f.request('/identity/confirm',{receipt:status.pending.receipt,confirm:true,role:'admin',phone:'+8613900139000'},{cookie:alice.cookie})).status,200);
  assert.equal((await f.request('/identity/confirm',{receipt:status.pending.receipt,confirm:true},{cookie:alice.cookie})).status,400);
  const session=(await f.request('/session',undefined,{cookie:alice.cookie})).data;
  assert.equal(session.identity.verified,true);assert.equal(session.user.role,'user');
  assert.equal((await f.request('/comments',{topic:'guestbook',body:'verified comment'},{cookie:alice.cookie})).status,201);
  assert.doesNotMatch(JSON.stringify((await f.request('/comments?topic=guestbook')).data),/phone|13800138000/);
  assert.match((await f.request(callback,undefined,{cookie:alice.cookie})).headers.get('location'),/identity=failed/);
});

test('identity receipts expire and session revocation prevents account binding',async t=>{
  const f=await fixture(t,{identityProvider:identityProviderFixture(),identityReturnUrl:'http://localhost:4000/account/',requireVerifiedIdentity:true});
  const user=await f.register();
  const start=await f.request('/identity/start',{consent:true,password:'secure-test-password'},{cookie:user.cookie});
  const state=new URL(start.data.authorizationUrl).searchParams.get('state');
  await f.request(`/identity/callback?state=${state}&code=test-provider-code`,undefined,{cookie:user.cookie});
  const pending=(await f.request('/identity/status',undefined,{cookie:user.cookie})).data.pending;
  await f.request('/auth/logout',{}, {cookie:user.cookie});
  const again=await f.request('/auth/login',{email:'alice@example.com',password:'secure-test-password'});
  assert.equal((await f.request('/identity/confirm',{receipt:pending.receipt,confirm:true},{cookie:again.cookie})).status,400);
  f.advance(300001);
  assert.equal((await f.request('/identity/status',undefined,{cookie:again.cookie})).data.pending,null);
  assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM verified_identities').get().n,0);
});

test('cancelling identity verification invalidates pending callbacks and receipts only in the current session',async t=>{
  const f=await fixture(t,{identityProvider:identityProviderFixture(),identityReturnUrl:'http://localhost:4000/account/',requireVerifiedIdentity:true});
  const user=await f.register(),other=await f.register('bob@example.com','Bob');
  const begin=async()=>{
    const response=await f.request('/identity/start',{consent:true,password:'secure-test-password'},{cookie:user.cookie});
    assert.equal(response.status,200);
    return `/identity/callback?state=${new URL(response.data.authorizationUrl).searchParams.get('state')}&code=test-provider-code`;
  };
  const cancelled=await begin();
  assert.equal((await f.request('/identity/cancel',{}, {cookie:user.cookie})).status,200);
  assert.match((await f.request(cancelled,undefined,{cookie:user.cookie})).headers.get('location'),/identity=failed/);
  const callback=await begin();
  await f.request('/identity/cancel',{}, {cookie:other.cookie});
  assert.match((await f.request(callback,undefined,{cookie:user.cookie})).headers.get('location'),/identity=confirm/);
  const pending=(await f.request('/identity/status',undefined,{cookie:user.cookie})).data.pending;
  await f.request('/identity/cancel',{}, {cookie:user.cookie});
  assert.equal((await f.request('/identity/status',undefined,{cookie:user.cookie})).data.pending,null);
  assert.equal((await f.request('/identity/confirm',{receipt:pending.receipt,confirm:true},{cookie:user.cookie})).status,400);
  assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM verified_identities').get().n,0);
});

test('cancellation and a new verification invalidate a callback still awaiting the provider',async t=>{
  for(const action of ['cancel','restart'])await t.test(action,async t=>{
    const provider=identityProviderFixture();
    const finish=provider.finish;
    let release,entered;
    const waiting=new Promise(resolve=>{entered=resolve;});
    provider.finish=async args=>{entered();await new Promise(resolve=>{release=resolve;});return finish(args);};
    const f=await fixture(t,{identityProvider:provider,identityReturnUrl:'http://localhost:4000/account/',requireVerifiedIdentity:true});
    const user=await f.register();
    const start=()=>f.request('/identity/start',{consent:true,password:'secure-test-password'},{cookie:user.cookie});
    const result=await start(),state=new URL(result.data.authorizationUrl).searchParams.get('state');
    const callback=f.request(`/identity/callback?state=${state}&code=test-provider-code`,undefined,{cookie:user.cookie});
    await waiting;
    try{
      const changed=action==='cancel'?await f.request('/identity/cancel',{}, {cookie:user.cookie}):await start();
      assert.equal(changed.status,200);
    }finally{release();}
    assert.match((await callback).headers.get('location'),/identity=failed/);
    assert.equal((await f.request('/identity/status',undefined,{cookie:user.cookie})).data.pending,null);
    assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM verified_identities').get().n,0);
  });
});

test('anonymous visit API checks origins, deduplicates retries and limits writes without mail or login', async t => {
  const f = await fixture(t);
  const data = { topic: '/', visitorId: '12345678-1234-4234-8234-123456789abc', viewId: '12345678-1234-4234-8234-123456789abd' };
  assert.equal((await f.request('/visits', data, { headers: { Origin: 'https://evil.test' } })).status, 403);
  assert.equal((await f.request('/visits', data, { headers: { 'X-Community-Request': '' } })).status, 403);
  const one = await f.request('/visits', data);
  assert.equal(one.status, 200); assert.equal(one.data.siteVisitors, 1);
  assert.equal(one.cookie, undefined);
  const repeat = await f.request('/visits', data);
  assert.deepEqual(repeat.data, one.data);
  assert.equal((await f.request('/visits?topic=/')).data.siteViews, 1);
  for (let i = 0; i < 58; i++) assert.equal((await f.request('/visits', data)).status, 200);
  assert.equal((await f.request('/visits', data)).status, 429);
  assert.equal(f.mail.length, 0);
});

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

test('administrator overview spans topics, paginates, hides removed posts and never exposes private identity',async t=>{
  const f=await fixture(t),alice=await f.register(),owner=await f.register('owner@example.com','Owner');
  assert.equal((await f.request('/admin/comments')).status,401);
  assert.equal((await f.request('/admin/comments',undefined,{cookie:alice.cookie})).status,403);
  const first=await f.request('/comments',{topic:'guestbook',body:'Message'},{cookie:alice.cookie});
  f.advance(11000);
  const second=await f.request('/comments',{topic:'/articles/test',body:'Article comment'},{cookie:alice.cookie});
  const page=(await f.request('/admin/comments?limit=1',undefined,{cookie:owner.cookie})).data;
  assert.equal(page.items[0].id,second.data.id);assert.equal(page.items[0].topic,'/articles/test');assert.ok(page.nextCursor);
  const older=(await f.request('/admin/comments?limit=1&before='+page.nextCursor,undefined,{cookie:owner.cookie})).data;
  assert.equal(older.items[0].id,first.data.id);assert.equal(older.items[0].topic,'guestbook');assert.equal(older.nextCursor,null);
  assert.doesNotMatch(JSON.stringify(page),/email|phone|password|subject|alice@example/);
  assert.equal((await f.request('/comments/'+second.data.id,{}, {method:'DELETE',cookie:owner.cookie})).status,200);
  const remaining=(await f.request('/admin/comments',undefined,{cookie:owner.cookie})).data;
  assert.deepEqual(remaining.items.map(item=>item.id),[first.data.id]);
  assert.equal((await f.request('/admin/comments?before=1.5',undefined,{cookie:owner.cookie})).status,400);
});

test('matched posts stay private; only an admin can approve exactly once with original text and author',async t=>{
  const f=await fixture(t),alice=await f.register(),bob=await f.register('bob@example.com','Bob'),owner=await f.register('owner@example.com','Owner');
  const text='科普讨论：出售\u200b手 枪 <script>alert(1)</script>';
  const held=await f.request('/comments',{topic:'guestbook',body:text,status:'published'},{cookie:alice.cookie});
  assert.equal(held.status,201);assert.equal(held.data.status,'pending');assert.equal(held.data.id,undefined);
  assert.doesNotMatch(JSON.stringify(held.data),/matches|term|category/);
  assert.deepEqual((await f.request('/comments?topic=guestbook')).data,{items:[],nextCursor:null,total:0});
  assert.deepEqual((await f.request('/admin/comments',undefined,{cookie:owner.cookie})).data.items,[]);
  assert.equal((await f.request('/me/reviews')).status,401);
  const mine=(await f.request('/me/reviews',undefined,{cookie:alice.cookie})).data;
  assert.equal(mine.items[0].body,text);assert.equal(mine.items[0].status,'pending');
  assert.doesNotMatch(JSON.stringify(mine),/matches|lexiconVersion|email|phone/);
  assert.equal((await f.request('/me/reviews',undefined,{cookie:bob.cookie})).data.total,0);
  assert.equal((await f.request('/admin/reviews',undefined,{cookie:alice.cookie})).status,403);
  const route='/admin/reviews/'+held.data.reviewId;
  assert.equal((await f.request(route,{decision:'approve'},{cookie:alice.cookie})).status,403);
  const queue=(await f.request('/admin/reviews',undefined,{cookie:owner.cookie})).data;
  assert.equal(queue.items[0].matches[0].term,'出售手枪');
  assert.doesNotMatch(JSON.stringify(queue),/email|phone|password|alice@example/);
  assert.equal((await f.request(route,{decision:'unknown'},{cookie:owner.cookie})).status,400);
  await f.request('/me',{nickname:'Alice updated'},{method:'PATCH',cookie:alice.cookie});
  const outcomes=await Promise.all([1,2].map(()=>f.request(route,{decision:'approve',body:'replacement',user_id:owner.data.user.id},{cookie:owner.cookie})));
  assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,409]);
  const published=(await f.request('/comments?topic=guestbook')).data;
  assert.equal(published.total,1);assert.equal(published.items[0].body,text);assert.equal(published.items[0].user.id,alice.data.user.id);
  assert.equal(published.items[0].user.nickname,'Alice updated');assert.equal((await f.request('/me/reviews',undefined,{cookie:alice.cookie})).data.total,0);
  assert.equal((await f.request('/admin/reviews?status=approved',undefined,{cookie:owner.cookie})).data.items.length,1);
  assert.equal((await f.request('/me/reviews/'+held.data.reviewId,{}, {method:'DELETE',cookie:alice.cookie})).status,409);
  assert.equal((await f.request('/comments/'+published.items[0].id,{}, {method:'DELETE',cookie:alice.cookie})).status,200);
  assert.equal((await f.request('/comments?topic=guestbook')).data.total,0);
});

test('rejection, withdrawal, pagination and rate limits also protect article reviews and admin submissions',async t=>{
  const f=await fixture(t),alice=await f.register(),bob=await f.register('bob@example.com','Bob'),owner=await f.register('owner@example.com','Owner');
  const send=async(cookie)=>f.request('/comments',{topic:'/articles/test',body:'代开发票'},{cookie});
  const first=await send(alice.cookie);
  assert.equal((await send(alice.cookie)).status,429);
  assert.equal((await f.request('/admin/reviews/'+first.data.reviewId,{decision:'reject'},{cookie:owner.cookie})).status,200);
  assert.equal((await f.request('/comments?topic=/articles/test')).data.total,0);
  assert.equal((await f.request('/me/reviews',undefined,{cookie:alice.cookie})).data.items[0].status,'rejected');
  f.advance(11000);const second=await send(alice.cookie);
  const page=(await f.request('/me/reviews?limit=1',undefined,{cookie:alice.cookie})).data;
  assert.equal(page.items[0].id,second.data.reviewId);assert.ok(page.nextCursor);
  const next=(await f.request('/me/reviews?limit=1&before='+page.nextCursor,undefined,{cookie:alice.cookie})).data;
  assert.equal(next.items[0].id,first.data.reviewId);assert.equal(next.nextCursor,null);
  const withdraw='/me/reviews/'+second.data.reviewId;
  assert.equal((await f.request(withdraw,{}, {method:'DELETE',cookie:bob.cookie})).status,404);
  assert.equal((await f.request(withdraw,{}, {method:'DELETE',cookie:alice.cookie})).status,200);
  assert.equal((await f.request('/admin/reviews/'+second.data.reviewId,{decision:'approve'},{cookie:owner.cookie})).status,409);
  assert.equal((await send(owner.cookie)).data.status,'pending');
  assert.equal((await f.request('/admin/reviews?status=withdrawn',undefined,{cookie:owner.cookie})).status,400);
  assert.equal((await f.request('/admin/reviews?before=1.5',undefined,{cookie:owner.cookie})).status,400);
  assert.equal((await f.request('/me/reviews?limit=-1',undefined,{cookie:alice.cookie})).status,400);
  assert.equal((await f.request('/comments?topic=/articles/test')).data.total,0);
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
