// Explicit local test only: never imports or writes the blog account database.
import { randomBytes } from 'node:crypto';
import { createAuthingPhoneVerification } from './authing-phone.js';

export function createAuthingLocalTest(env = process.env) {
  if (env.NODE_ENV === 'production') throw new Error('Local identity testing is unavailable in production.');
  const origin = 'http://127.0.0.1:8787';
  const adapter = createAuthingPhoneVerification({
    issuer: env.AUTHING_ISSUER, clientId: env.AUTHING_CLIENT_ID,
    clientSecret: env.AUTHING_CLIENT_SECRET,
    redirectUri: `${origin}/api/identity/callback`, production: false, requireFreshAuthentication:false,
    wechatSource:{id:'6ae548be56a05303119d566f',connectionId:'6ae548be285e80d292c269df'}
  }, {fetchImpl:async (url, options)=>{
    const response=await fetch(url,options);
    // Diagnostic metadata only: never log credentials, tokens, subjects or phones.
    const meta={endpoint:new URL(url).pathname,status:response.status};
    if(response.ok){
      try {
        const value=await response.clone().json();
        if(new URL(url).pathname.endsWith('/token')){
          const parts=typeof value.id_token==='string'?value.id_token.split('.'):[];
          const header=parts.length===3?JSON.parse(Buffer.from(parts[0],'base64url').toString()):{};
          const claims=parts.length===3?JSON.parse(Buffer.from(parts[1],'base64url').toString()):{};
          Object.assign(meta,{rs256:header.alg==='RS256',kidPresent:typeof header.kid==='string',issuerMatches:claims.iss===env.AUTHING_ISSUER,audienceMatches:claims.aud===env.AUTHING_CLIENT_ID,noncePresent:typeof claims.nonce==='string',authTimePresent:Number.isSafeInteger(claims.auth_time),authAge:Number.isSafeInteger(claims.auth_time)?Math.floor(Date.now()/1000)-claims.auth_time:null,bearer:typeof value.token_type==='string'&&value.token_type.toLowerCase()==='bearer'});
        }
        if(new URL(url).pathname.endsWith('/me')){
          Object.assign(meta,{subjectPresent:typeof value.sub==='string',phonePresent:typeof value.phone_number==='string',phoneVerified:value.phone_number_verified===true,phoneVerifiedType:typeof value.phone_number_verified});
        }
      }catch{meta.jsonReadable=false;}
    }
    console.log('Local identity diagnostic:',JSON.stringify(meta));
    return response;
  }});
  const sessions = new Map();
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return async function handle(req, res) {
    const url = new URL(req.url, origin);
    if (!['/identity-test', '/api/identity/start', '/api/identity/callback'].includes(url.pathname)) return false;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', `default-src 'none'; style-src 'unsafe-inline'; form-action 'self' ${new URL(env.AUTHING_ISSUER).origin}; frame-ancestors 'none'; base-uri 'none'`);
    const page = (message, status = 200) => {
      res.writeHead(status, {'Content-Type':'text/html; charset=utf-8'});
      res.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>微信手机号本机测试</title><style>body{font:16px/1.8 system-ui;background:#f3f6fb;color:#1e293b;margin:0;padding:8vh 24px}main{max-width:620px;margin:auto;background:white;padding:32px;border-radius:20px}h1{font-size:24px}button{background:#2463eb;border:0;color:white;padding:12px 24px;border-radius:8px;font:inherit;cursor:pointer}p{color:#475569}</style><main><h1>微信手机号本机测试</h1><p>${escape(message)}</p><p>扫码后由 Authing 接收微信授权手机号。本机只检查认证结果并显示脱敏号码，不写入博客账号数据库，不发送短信。</p><form method="post" action="/api/identity/start"><button>开始微信验证</button></form></main></html>`);
    };
    if (req.headers.host !== '127.0.0.1:8787') { page('请使用本机地址 127.0.0.1:8787。', 400); return true; }
    for (const [key, value] of sessions) if (value.expiresAt <= Date.now()) sessions.delete(key);
    let sid = req.headers.cookie?.match(/(?:^|;\s*)apc_identity_test=([A-Za-z0-9_-]{43})(?:;|$)/)?.[1];
    let session = sessions.get(sid);
    if (url.pathname === '/identity-test' && req.method === 'GET') {
      if (!session) {
        if (sessions.size >= 100) { page('测试会话过多，请稍后再试。', 429); return true; }
        sid = randomBytes(32).toString('base64url');
        session = {expiresAt:Date.now()+30*60*1000, message:'已准备好。请点击下方按钮，然后用微信扫码。'};
        sessions.set(sid, session);
        res.setHeader('Set-Cookie', `apc_identity_test=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`);
      }
      page(session.message); return true;
    }
    if (!session) { page('本机测试会话已失效，请重新打开测试页面。', 400); return true; }
    if (url.pathname === '/api/identity/start' && req.method === 'POST') {
      if (req.headers.origin !== origin) { page('请从本机测试页面发起。', 403); return true; }
      try {
        const {authorizationUrl} = adapter.start(sid);
        res.writeHead(303, {Location:authorizationUrl}); res.end();
      } catch { page('无法发起验证，请稍后重新尝试。', 400); }
      return true;
    }
    if (url.pathname === '/api/identity/callback' && req.method === 'GET') {
      try {
        if (url.searchParams.has('error') || url.searchParams.getAll('state').length !== 1 || url.searchParams.getAll('code').length !== 1) throw new Error('Invalid callback');
        const result = await adapter.finish({state:url.searchParams.get('state'), code:url.searchParams.get('code'), sessionBinding:sid});
        session.message = `微信手机号来源验证成功：${result.phone.slice(0,6)}****${result.phone.slice(-4)}。服务端已验证签名、登录会话及指定微信连接中的手机号来源。本次未证明重新登录时间，尚未绑定博客账号。`;
      } catch { session.message = '认证未完成：未取得可验证的手机号结果，或本次请求已过期。请重新发起测试；不会将此结果用于开放评论。'; }
      res.writeHead(303, {Location:'/identity-test'}); res.end(); return true;
    }
    page('不支持此请求。', 405); return true;
  };
}
