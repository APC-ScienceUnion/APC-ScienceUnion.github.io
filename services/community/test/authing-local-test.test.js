import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthingLocalTest } from '../src/authing-local-test.js';

const config = {AUTHING_ISSUER:'https://test.authing.cn/oidc', AUTHING_CLIENT_ID:'test-app', AUTHING_CLIENT_SECRET:'test-secret'};
function request(handler, url, options = {}) {
  const headers = {};
  const res = {status:200, body:'', setHeader(k,v){headers[k.toLowerCase()]=v;}, writeHead(status, extra={}){this.status=status;for(const [k,v] of Object.entries(extra))this.setHeader(k,v);}, end(body=''){this.body=body;}};
  return handler({url, method:'GET', ...options, headers:{host:'127.0.0.1:8787',...options.headers}},res).then(handled=>({handled,...res,headers}));
}
test('local identity tool refuses production and leaves unrelated routes alone', async()=>{
  assert.throws(()=>createAuthingLocalTest({...config,NODE_ENV:'production'}));
  const response=await request(createAuthingLocalTest(config),'/api/session');
  assert.equal(response.handled,false);
});
test('test session is private, loopback-only and has safe form/referrer policies',async()=>{
  const handler=createAuthingLocalTest(config);
  assert.equal((await request(handler,'/identity-test',{headers:{host:'evil.example'}})).status,400);
  const result=await request(handler,'/identity-test');
  assert.match(result.headers['set-cookie'],/HttpOnly; SameSite=Lax; Path=\//);
  assert.equal(result.headers['cache-control'],'no-store');
  assert.equal(result.headers['referrer-policy'],'same-origin');
  assert.match(result.headers['content-security-policy'],/form-action 'self' https:\/\/test.authing.cn;/);
  assert.doesNotMatch(result.body,/test-secret/);
});
test('starting verification requires the same browser session and exact origin',async()=>{
  const handler=createAuthingLocalTest(config);
  assert.equal((await request(handler,'/api/identity/start',{method:'POST',headers:{origin:'http://127.0.0.1:8787'}})).status,400);
  const page=await request(handler,'/identity-test');
  const cookie=page.headers['set-cookie'].split(';')[0];
  for(const origin of [undefined,'null','https://evil.example']){
    assert.equal((await request(handler,'/api/identity/start',{method:'POST',headers:{cookie,origin}})).status,403);
  }
  const start=await request(handler,'/api/identity/start',{method:'POST',headers:{cookie,origin:'http://127.0.0.1:8787'}});
  assert.equal(start.status,303);
  const target=new URL(start.headers.location);
  assert.equal(target.origin,'https://test.authing.cn');
  assert.equal(target.searchParams.get('code_challenge_method'),'S256');
  assert.equal(target.searchParams.get('scope'),'openid phone');
  assert.equal(target.searchParams.get('redirect_uri'),'http://127.0.0.1:8787/api/identity/callback');
  assert.doesNotMatch(start.headers.location,/test-secret/);
});
test('invalid callback strips query data and cannot claim success',async()=>{
  const handler=createAuthingLocalTest(config);
  const page=await request(handler,'/identity-test');
  const cookie=page.headers['set-cookie'].split(';')[0];
  const result=await request(handler,'/api/identity/callback?state=unknown&code=private-test-code',{headers:{cookie}});
  assert.equal(result.status,303);
  assert.equal(result.headers.location,'/identity-test');
  const final=await request(handler,'/identity-test',{headers:{cookie}});
  assert.match(final.body,/认证未完成/);
  assert.doesNotMatch(final.body,/private-test-code|验证成功/);
});
