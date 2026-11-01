import { createAuthingPhoneVerification } from './authing-phone.js';

// This provider proves a phone's WeChat source, not a fresh WeChat login.
// app.js separately requires a fresh local password and explicit confirmation
// in the same unchanged session before binding that identity to an account.
export function readIdentityConfig(env, { production, origins }) {
  const mode = env.IDENTITY_PROVIDER || 'none';
  if (!['none', 'authing-wechat'].includes(mode)) throw new Error('Unknown IDENTITY_PROVIDER.');
  if (mode === 'none') return { identity: null, identityReturnUrl: null, requireVerifiedIdentity: production };
  const callback = new URL(env.AUTHING_REDIRECT_URI || '');
  const returnUrl = new URL(env.IDENTITY_RETURN_URL || '');
  const isLoopback = host => ['localhost', '127.0.0.1', '[::1]'].includes(host);
  if (callback.pathname !== '/api/identity/callback' || callback.search || callback.hash || callback.username || callback.password ||
      (production ? callback.protocol !== 'https:' || isLoopback(callback.hostname) : callback.protocol !== 'https:' && !(callback.protocol === 'http:' && isLoopback(callback.hostname)))) {
    throw new Error('AUTHING_REDIRECT_URI must be the exact secure API callback.');
  }
  if (!origins.includes(returnUrl.origin) || !['/account/', '/en/account/'].includes(returnUrl.pathname) ||
      returnUrl.search || returnUrl.hash || returnUrl.username || returnUrl.password) throw new Error('IDENTITY_RETURN_URL must be an allowed account page.');
  if (typeof env.AUTHING_CLIENT_SECRET !== 'string' || env.AUTHING_CLIENT_SECRET.length < 16 || /\s/.test(env.AUTHING_CLIENT_SECRET)) throw new Error('Configure AUTHING_CLIENT_SECRET on the server.');
  const identity = {
    mode, issuer: env.AUTHING_ISSUER, clientId: env.AUTHING_CLIENT_ID, clientSecret: env.AUTHING_CLIENT_SECRET,
    redirectUri: callback.toString(), production, requireFreshAuthentication: false,
    wechatSource: { id: env.AUTHING_WECHAT_SOURCE_ID, connectionId: env.AUTHING_WECHAT_CONNECTION_ID }
  };
  // Validate pinned issuer/source/connection before opening a database or socket.
  createAuthingPhoneVerification(identity);
  return { identity, identityReturnUrl: returnUrl.toString(), requireVerifiedIdentity: true };
}

export function createConfiguredIdentityProvider(config, dependencies) {
  return config.identity ? createAuthingPhoneVerification(config.identity, dependencies) : null;
}
