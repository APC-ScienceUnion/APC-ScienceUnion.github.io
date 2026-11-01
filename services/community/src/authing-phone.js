// Server-only adapter. Not enabled by importing it: the application must supply
// an approved Authing application and bind each attempt to its own login session.
import { createHash, createPublicKey, randomBytes, verify } from 'node:crypto';

const TTL = 5 * 60 * 1000;
const random = () => randomBytes(32).toString('base64url');
const invalid = () => new Error('手机号认证未完成或已失效，请重新发起。');

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function decode(segment) {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw invalid();
  const bytes = Buffer.from(segment, 'base64url');
  if (bytes.toString('base64url') !== segment) throw invalid();
  const value = JSON.parse(bytes.toString('utf8'));
  if (!object(value)) throw invalid();
  return value;
}

function claimsFrom(token, keys, { issuer, clientId, nonce, now, requireFreshAuthentication }) {
  if (typeof token !== 'string' || token.length > 32768) throw invalid();
  const parts = token.split('.');
  if (parts.length !== 3 || !/^[A-Za-z0-9_-]+$/.test(parts[2])) throw invalid();
  const header = decode(parts[0]);
  // Never accept keys or algorithm instructions supplied by a token itself.
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid ||
      header.crit !== undefined || header.jku !== undefined || header.jwk !== undefined || header.x5u !== undefined) throw invalid();
  if (!Array.isArray(keys) || keys.length > 32) throw invalid();
  const matching = keys.filter(k => object(k) && k.kid === header.kid);
  if (matching.length !== 1) throw invalid();
  const jwk = matching[0];
  if (jwk.kty !== 'RSA' || (jwk.use !== undefined && jwk.use !== 'sig') ||
      (jwk.alg !== undefined && jwk.alg !== 'RS256') || jwk.d !== undefined ||
      (jwk.key_ops !== undefined && (!Array.isArray(jwk.key_ops) || !jwk.key_ops.includes('verify')))) throw invalid();
  const key = createPublicKey({ key: jwk, format: 'jwk' });
  if ((key.asymmetricKeyDetails?.modulusLength || 0) < 2048 ||
      !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'))) throw invalid();
  const claims = decode(parts[1]);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const seconds = Math.floor(now / 1000);
  if (claims.iss !== issuer || !audiences.length || audiences.some(a => typeof a !== 'string') || !audiences.includes(clientId) ||
      (audiences.length > 1 && claims.azp !== clientId) || (claims.azp !== undefined && claims.azp !== clientId) ||
      typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 255 || claims.nonce !== nonce ||
      !Number.isSafeInteger(claims.exp) || claims.exp <= seconds ||
      !Number.isSafeInteger(claims.iat) || claims.iat > seconds + 30 || claims.iat < seconds - TTL / 1000 - 30 || claims.exp <= claims.iat ||
      (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf > seconds + 30)) ||
      (requireFreshAuthentication && (!Number.isSafeInteger(claims.auth_time) || claims.auth_time < seconds - TTL / 1000 - 30)) ||
      (claims.auth_time !== undefined && (!Number.isSafeInteger(claims.auth_time) || claims.auth_time > seconds + 30))) throw invalid();
  return claims;
}

export function createAuthingPhoneVerification({ issuer, clientId, clientSecret = '', redirectUri, production = true, requireFreshAuthentication = true, wechatSource = null }, { fetchImpl = fetch, now = Date.now } = {}) {
  if (typeof requireFreshAuthentication !== 'boolean' || (production && !requireFreshAuthentication && !wechatSource)) throw new Error('Production requires fresh authentication or pinned WeChat source evidence.');
  if (wechatSource && (!/^[a-f0-9]{24}$/.test(wechatSource.id || '') || !/^[a-f0-9]{24}$/.test(wechatSource.connectionId || ''))) throw new Error('WeChat source verification requires an exact source and connection.');
  const host = new URL(issuer);
  if (host.protocol !== 'https:' || host.port || host.username || host.password || host.search || host.hash ||
      !/^[a-z0-9-]+\.authing\.cn$/.test(host.hostname) || host.pathname !== '/oidc') {
    throw new Error('Use the exact HTTPS Authing /oidc issuer shown in the application console.');
  }
  if (typeof clientId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(clientId) || typeof clientSecret !== 'string') throw new Error('Invalid Authing application configuration.');
  const callback = new URL(redirectUri);
  const local = !production && callback.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(callback.hostname);
  if ((!local && callback.protocol !== 'https:') || callback.username || callback.password || callback.search || callback.hash) throw new Error('Use HTTPS for the callback, or loopback HTTP for local development.');
  const pending = new Map();

  async function request(path, options = {}) {
    // Endpoints are pinned to the configured issuer; no discovery or token can
    // redirect secrets to another host. Provider errors are never sent to users.
    const endpoint = path === '/api/v3/get-identities' ? `${host.origin}${path}` : `${issuer}${path}`;
    const response = await fetchImpl(endpoint, {
      ...options, redirect: 'error', signal: AbortSignal.timeout(10000)
    });
    if (!response.ok || !/^application\/json(?:;|$)/i.test(response.headers.get('content-type') || '')) throw invalid();
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body) {
      size += chunk.byteLength;
      if (size > 65536) throw invalid();
      chunks.push(Buffer.from(chunk));
    }
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!object(result)) throw invalid();
    return result;
  }

  function start(sessionBinding) {
    if (typeof sessionBinding !== 'string' || sessionBinding.length < 32 || sessionBinding.length > 256) throw invalid();
    for (const [state, item] of pending) if (item.expiresAt <= now()) pending.delete(state);
    if (pending.size >= 1000) throw new Error('认证请求较多，请稍后重试。');
    const state = random(), nonce = random(), verifier = random();
    pending.set(state, { nonce, verifier, sessionBinding, expiresAt: now() + TTL });
    const url = new URL(`${issuer}/auth`);
    url.search = new URLSearchParams({
      client_id: clientId, redirect_uri: redirectUri, response_type: 'code', response_mode: 'query',
      scope: 'openid phone', state, nonce,
      ...(requireFreshAuthentication ? {max_age:'1', prompt:'login'} : {}),
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256'
    }).toString();
    return { authorizationUrl: url.toString(), expiresAt: now() + TTL };
  }

  async function finish({ state, code, sessionBinding }) {
    const attempt = pending.get(state);
    if (!attempt || attempt.expiresAt <= now() || attempt.sessionBinding !== sessionBinding) throw invalid();
    // Consume before awaiting any network work: concurrent/replayed callbacks
    // cannot bind a second account. Provider failure requires a fresh attempt.
    pending.delete(state);
    if (typeof code !== 'string' || !code || code.length > 4096 || /[\x00-\x20]/.test(code)) throw invalid();
    try {
      const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId,
        redirect_uri: redirectUri, code, code_verifier: attempt.verifier });
      if (clientSecret) form.set('client_secret', clientSecret);
      const tokens = await request('/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() });
      if (typeof tokens.access_token !== 'string' || !tokens.access_token || tokens.access_token.length > 32768 ||
          /[\x00-\x20]/.test(tokens.access_token) || typeof tokens.token_type !== 'string' || tokens.token_type.toLowerCase() !== 'bearer') throw invalid();
      const jwks = await request('/.well-known/jwks.json');
      const claims = claimsFrom(tokens.id_token, jwks.keys, { issuer, clientId, nonce: attempt.nonce, now: now(), requireFreshAuthentication });
      const profile = await request('/me', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      if (attempt.expiresAt <= now() || claims.exp <= Math.floor(now() / 1000) ||
          profile.sub !== claims.sub || (!wechatSource && profile.phone_number_verified !== true) || typeof profile.phone_number !== 'string') throw invalid();
      const phone = profile.phone_number.replace(/^\+86/, '');
      if (!/^1[3-9]\d{9}$/.test(phone) || (claims.phone_number !== undefined && claims.phone_number !== profile.phone_number) ||
          (!wechatSource && claims.phone_number_verified !== undefined && claims.phone_number_verified !== true)) throw invalid();
      if (wechatSource) {
        // The generic flag is not proof of WeChat phone authorization. Read the
        // immutable external identity via the same user's token, then pin both
        // source and connection. Never trust the editable profile phone alone.
        const identities = await request('/api/v3/get-identities', {headers:{authorization:tokens.access_token,'x-authing-app-id':clientId}});
        if (identities.statusCode !== 200 || !Array.isArray(identities.data) || identities.data.length > 100) throw invalid();
        const matches = identities.data.filter(i => object(i) && i.provider === 'wechat' && i.type === 'openid' &&
          i.extIdpId === wechatSource.id && Array.isArray(i.originConnIds) && i.originConnIds.includes(wechatSource.connectionId));
        if (matches.length !== 1 || typeof matches[0].userIdInIdp !== 'string' || !matches[0].userIdInIdp ||
            (matches[0].userId !== undefined && matches[0].userId !== claims.sub) ||
            typeof matches[0].userInfoInIdp?.phone !== 'string' || matches[0].userInfoInIdp.phone.replace(/^\+86/,'') !== phone ||
            attempt.expiresAt <= now() || claims.exp <= Math.floor(now()/1000)) throw invalid();
      }
      // No provider roles, email, nickname, password or tokens cross this boundary.
      return { provider: 'authing', issuer, subject: claims.sub, phone: `+86${phone}`, verifiedAt: now(),
        ...(wechatSource ? {evidence:'wechat-source',sourceId:wechatSource.id,connectionId:wechatSource.connectionId} : {}) };
    } catch {
      throw invalid();
    }
  }

  return { start, finish };
}
