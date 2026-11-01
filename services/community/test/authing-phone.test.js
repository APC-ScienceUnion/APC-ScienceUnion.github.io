import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { createAuthingPhoneVerification } from '../src/authing-phone.js';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const settings = { issuer: 'https://blog-test.authing.cn/oidc', clientId: 'test-app', clientSecret: 'test-only-secret',
  redirectUri: 'http://127.0.0.1:8787/api/identity/callback', production: false };
const session = 'test-session-binding-'.repeat(3);
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (claims, header = { alg: 'RS256', kid: 'test-key' }) => {
  const payload = `${encode(header)}.${encode(claims)}`;
  return `${payload}.${sign('RSA-SHA256', Buffer.from(payload), privateKey).toString('base64url')}`;
};

function fixture(options = {}) {
  let clock = 1800000000000;
  let authorization;
  const calls = [];
  const verifier = createAuthingPhoneVerification({...settings,...options.settings}, {
    now: () => clock,
    fetchImpl: async (url, request) => {
      calls.push({ url, request });
      assert.equal(request.redirect, 'error');
      assert.ok(request.signal instanceof AbortSignal);
      if (options.failNetwork) throw new Error('secret provider error with a private phone');
      if (options.oversized) return new Response('x'.repeat(65537), { headers: { 'Content-Type': 'application/json' } });
      if (options.html) return new Response('<html>login</html>', { headers: { 'Content-Type': 'text/html' } });
      if (url.endsWith('/token')) {
        const form = new URLSearchParams(request.body);
        assert.equal(form.get('client_id'), settings.clientId);
        assert.equal(form.get('client_secret'), settings.clientSecret);
        assert.equal(form.get('redirect_uri'), options.settings?.redirectUri || settings.redirectUri);
        assert.equal(form.get('grant_type'), 'authorization_code');
        assert.equal(createHash('sha256').update(form.get('code_verifier')).digest('base64url'), authorization.searchParams.get('code_challenge'));
        const seconds = Math.floor(clock / 1000);
        const claims = { iss: settings.issuer, aud: settings.clientId, sub: 'verified-reader', nonce: authorization.searchParams.get('nonce'),
          exp: seconds + 300, iat: seconds, auth_time: seconds, ...options.claims };
        let token = jwt(claims, options.header);
        if (options.tamper) token = `${token.split('.')[0]}.${encode({ ...claims, sub: 'forged-reader' })}.${token.split('.')[2]}`;
        return Response.json({ id_token: token, access_token: 'server-only-access-token', token_type: 'Bearer' });
      }
      if (url.endsWith('/jwks.json')) return Response.json({ keys: options.keys || [jwk] });
      if (url.endsWith('/api/v3/get-identities')) {
        assert.equal(url,'https://blog-test.authing.cn/api/v3/get-identities');
        assert.equal(request.headers.authorization,'server-only-access-token');
        assert.equal(request.headers['x-authing-app-id'],settings.clientId);
        return Response.json({statusCode:200,data:options.identities});
      }
      assert.equal(url, `${settings.issuer}/me`);
      assert.equal(request.headers.Authorization, 'Bearer server-only-access-token');
      if (options.expireInFlight) clock += 300001;
      return Response.json({ sub: 'verified-reader', phone_number: '+8613800138000', phone_number_verified: true,
        role: 'admin', email: 'untrusted@example.test', ...options.profile });
    }
  });
  const begin = () => {
    authorization = new URL(verifier.start(session).authorizationUrl);
    return { state: authorization.searchParams.get('state'), code: 'one-time-code', sessionBinding: session };
  };
  return { verifier, calls, begin, get authorization() { return authorization; }, advance: ms => { clock += ms; } };
}

test('WeChat source proof pins external source, connection and immutable source phone', async()=>{
  const source={id:'a'.repeat(24),connectionId:'b'.repeat(24)};
  const identity={provider:'wechat',type:'openid',extIdpId:source.id,originConnIds:[source.connectionId],userIdInIdp:'wechat-openid',userInfoInIdp:{phone:'13800138000'}};
  const options={settings:{requireFreshAuthentication:false,wechatSource:source},claims:{auth_time:undefined},profile:{phone_number_verified:false},identities:[identity]};
  const f=fixture(options);
  const result=await f.verifier.finish(f.begin());
  assert.equal(result.phone,'+8613800138000');
  assert.equal(result.evidence,'wechat-source');
  assert.equal(result.connectionId,source.connectionId);
  for(const identities of [[],[identity,identity],[{...identity,provider:'github'}],[{...identity,type:'unionid'}],
    [{...identity,extIdpId:'c'.repeat(24)}],[{...identity,originConnIds:['c'.repeat(24)]}],
    [{...identity,userInfoInIdp:{phone:'13800138001'}}],[{...identity,userInfoInIdp:{}}],
    [{...identity,userId:'someone-else'}],[{...identity,userIdInIdp:''}]]){
    const bad=fixture({...options,identities});await assert.rejects(bad.verifier.finish(bad.begin()));
  }
  assert.throws(()=>createAuthingPhoneVerification({...settings,production:true,wechatSource:source}));
});

test('production accepts pinned WeChat source evidence over HTTPS without claiming fresh provider login',async()=>{
  const source={id:'a'.repeat(24),connectionId:'b'.repeat(24)};
  const f=fixture({settings:{production:true,redirectUri:'https://api.example.test/api/identity/callback',requireFreshAuthentication:false,wechatSource:source},
    claims:{auth_time:undefined},profile:{phone_number_verified:false},identities:[{provider:'wechat',type:'openid',extIdpId:source.id,originConnIds:[source.connectionId],userIdInIdp:'wechat-openid',userInfoInIdp:{phone:'13800138000'}}]});
  const proof=await f.verifier.finish(f.begin());
  assert.equal(proof.evidence,'wechat-source');
  assert.equal(f.authorization.searchParams.has('max_age'),false);
  assert.equal('auth_time' in proof,false);
});

test('production without pinned source evidence still requires fresh authentication and verified phone', async()=>{
  assert.throws(()=>createAuthingPhoneVerification({...settings,production:true,requireFreshAuthentication:false}));
  const f=fixture({settings:{requireFreshAuthentication:false},claims:{auth_time:undefined}});
  const callback=f.begin();
  assert.equal(f.authorization.searchParams.has('max_age'),false);
  assert.equal(f.authorization.searchParams.has('prompt'),false);
  assert.equal((await f.verifier.finish(callback)).phone,'+8613800138000');
  const bad=fixture({settings:{requireFreshAuthentication:false},claims:{auth_time:undefined},profile:{phone_number_verified:false}});
  await assert.rejects(bad.verifier.finish(bad.begin()));
});

test('Authing phone proof uses PKCE and server-fetched verified claims without importing profile privileges', async () => {
  const f = fixture(); const callback = f.begin();
  assert.equal(f.authorization.searchParams.get('scope'), 'openid phone');
  assert.equal(f.authorization.searchParams.get('max_age'), '1');
  assert.equal(f.authorization.searchParams.get('prompt'), 'login');
  assert.equal(f.authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(f.authorization.searchParams.has('client_secret'), false);
  const identity = await f.verifier.finish(callback);
  assert.deepEqual(identity, { provider: 'authing', issuer: settings.issuer, subject: 'verified-reader', phone: '+8613800138000', verifiedAt: 1800000000000 });
  assert.equal(f.calls.length, 3);
  await assert.rejects(f.verifier.finish(callback));
  assert.equal(f.calls.length, 3);
});

test('unknown states and other sessions cannot exchange codes; callbacks are consumed atomically', async () => {
  const f = fixture(); const callback = f.begin();
  await assert.rejects(f.verifier.finish({ ...callback, state: 'invented' }));
  await assert.rejects(f.verifier.finish({ ...callback, sessionBinding: 'other-session' }));
  assert.equal(f.calls.length, 0);
  const results = await Promise.allSettled([f.verifier.finish(callback), f.verifier.finish(callback)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(f.calls.length, 3);
});

test('expired attempts and authentication failures cannot be replayed', async () => {
  const expired = fixture(); const callback = expired.begin(); expired.advance(300001);
  await assert.rejects(expired.verifier.finish(callback)); assert.equal(expired.calls.length, 0);
  for (const option of ['failNetwork', 'oversized', 'html', 'expireInFlight']) {
    const f = fixture({ [option]: true }); const input = f.begin();
    await assert.rejects(f.verifier.finish(input), { message: '手机号认证未完成或已失效，请重新发起。' });
    const requests = f.calls.length;
    await assert.rejects(f.verifier.finish(input)); assert.equal(f.calls.length, requests);
  }
});

test('signed tokens must belong to this application, fresh authentication and exact nonce', async t => {
  const cases = {
    issuer: { iss: 'https://attacker.authing.cn/oidc' }, audience: { aud: 'other-app' },
    multiAudience: { aud: ['test-app', 'other-app'] }, authorizedParty: { azp: 'other-app' },
    nonce: { nonce: 'wrong' }, noNonce: { nonce: undefined }, subject: { sub: '' },
    expired: { exp: 1799999999 }, noExpiry: { exp: undefined },
    future: { iat: 1800000040 }, old: { iat: 1799999600 },
    staleAuth: { auth_time: 1799999600 }, noAuthTime: { auth_time: undefined },
    futureAuth: { auth_time: 1800000040 }, notBefore: { nbf: 1800000040 },
    inconsistentPhone: { phone_number: '+8613900139000' }, unverifiedSignedPhone: { phone_number_verified: false }
  };
  for (const [name, claims] of Object.entries(cases)) await t.test(name, async () => {
    const f = fixture({ claims }); await assert.rejects(f.verifier.finish(f.begin()));
  });
});

test('rejects forged signatures, untrusted key metadata and algorithm confusion', async t => {
  const cases = {
    tampered: { tamper: true }, none: { header: { alg: 'none', kid: 'test-key' } },
    hmac: { header: { alg: 'HS256', kid: 'test-key' } },
    externalKey: { header: { alg: 'RS256', kid: 'test-key', jku: 'https://evil.test/keys' } },
    critical: { header: { alg: 'RS256', kid: 'test-key', crit: ['custom'] } },
    unknownKey: { keys: [{ ...jwk, kid: 'unknown' }] }, duplicateKeys: { keys: [jwk, jwk] },
    encryptionKey: { keys: [{ ...jwk, use: 'enc' }] }, signingOnlyKey: { keys: [{ ...jwk, key_ops: ['sign'] }] }
  };
  for (const [name, options] of Object.entries(cases)) await t.test(name, async () => {
    const f = fixture(options); await assert.rejects(f.verifier.finish(f.begin()));
    assert.equal(f.calls.some(c => c.url.endsWith('/me')), false);
  });
});

test('userinfo must refer to signed subject and explicitly verified mainland phone', async t => {
  for (const [name, profile] of Object.entries({
    subject: { sub: 'different-user' }, unverified: { phone_number_verified: false },
    stringFlag: { phone_number_verified: 'true' }, missingFlag: { phone_number_verified: undefined },
    missingPhone: { phone_number: undefined }, foreign: { phone_number: '+12025550123' },
    malformed: { phone_number: 'not a phone' }
  })) await t.test(name, async () => {
    const f = fixture({ profile }); await assert.rejects(f.verifier.finish(f.begin()));
  });
});

test('configuration rejects arbitrary endpoints, credentials in URLs and unsafe callbacks', () => {
  for (const issuer of ['http://blog.authing.cn/oidc', 'https://authing.cn.evil.test/oidc', 'https://blog.authing.cn/other', 'https://user:pass@blog.authing.cn/oidc', 'https://blog.authing.cn/oidc?x=1']) {
    assert.throws(() => createAuthingPhoneVerification({ ...settings, issuer }));
  }
  assert.throws(() => createAuthingPhoneVerification({ ...settings, production: true }));
  assert.throws(() => createAuthingPhoneVerification({ ...settings, redirectUri: 'http://example.com/callback' }));
  assert.throws(() => createAuthingPhoneVerification({ ...settings, redirectUri: 'https://example.com/callback#fragment' }));
});
