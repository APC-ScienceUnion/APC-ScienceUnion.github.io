import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../src/config.js';
import { createConfiguredIdentityProvider } from '../src/identity-config.js';

const base={NODE_ENV:'production',APP_SECRET:'server-test-secret-'.repeat(3),ADMIN_EMAIL:'owner@example.test',TOPICS_FILE:'topics.json',
  ALLOWED_ORIGINS:'https://example.test',MAIL_FROM:'Blog <test@example.test>',RESEND_API_KEY:'test-key'};
const identity={IDENTITY_PROVIDER:'authing-wechat',AUTHING_ISSUER:'https://blog-test.authing.cn/oidc',AUTHING_CLIENT_ID:'test-app',AUTHING_CLIENT_SECRET:'test-only-client-secret',
  AUTHING_WECHAT_SOURCE_ID:'a'.repeat(24),AUTHING_WECHAT_CONNECTION_ID:'b'.repeat(24),AUTHING_REDIRECT_URI:'https://api.example.test/api/identity/callback',IDENTITY_RETURN_URL:'https://example.test/account/'};

test('production defaults to closed identity enrollment and always requires identity for comments',()=>{
  const config=readConfig(base);
  assert.equal(config.requireVerifiedIdentity,true);
  assert.equal(createConfiguredIdentityProvider(config),null);
  const ready=readConfig({...base,...identity});
  assert.equal(ready.requireVerifiedIdentity,true);
  assert.equal(ready.identity.requireFreshAuthentication,false);
  assert.equal(ready.identity.wechatSource.id,identity.AUTHING_WECHAT_SOURCE_ID);
  const provider=createConfiguredIdentityProvider(ready);
  const authorization=new URL(provider.start('s'.repeat(64)).authorizationUrl);
  assert.equal(authorization.searchParams.get('redirect_uri'),identity.AUTHING_REDIRECT_URI);
  assert.equal(authorization.searchParams.get('scope'),'openid phone');
});

test('identity configuration rejects wrong endpoints, missing pins, secrets and redirect destinations',()=>{
  for(const [key,value] of [
    ['IDENTITY_PROVIDER','unexpected'],['AUTHING_ISSUER','https://evil.test/oidc'],['AUTHING_CLIENT_ID',''],
    ['AUTHING_CLIENT_SECRET',''],['AUTHING_CLIENT_SECRET','secret with spaces'],
    ['AUTHING_WECHAT_SOURCE_ID',''],['AUTHING_WECHAT_CONNECTION_ID',''],
    ['AUTHING_REDIRECT_URI','http://api.example.test/api/identity/callback'],
    ['AUTHING_REDIRECT_URI','https://localhost/api/identity/callback'],
    ['AUTHING_REDIRECT_URI','https://api.example.test/other'],
    ['AUTHING_REDIRECT_URI','https://api.example.test/api/identity/callback?next=evil'],
    ['IDENTITY_RETURN_URL','https://evil.test/account/'],['IDENTITY_RETURN_URL','https://example.test/account/?next=evil'],
    ['IDENTITY_RETURN_URL','https://user@example.test/account/'],['IDENTITY_RETURN_URL','https://example.test/other']
  ]) assert.throws(()=>readConfig({...base,...identity,[key]:value}),key);
});
