import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { openDatabase, transaction } from './db.js';
import { codeMessage } from './mail.js';
import { createVisits } from './visits.js';
import { fail, sha256, hmac, emailValue, nicknameValue, nicknameKey, passwordValue, hashPassword, verifyPassword, publicUser, privateUser } from './security.js';

const MINUTE = 60000;
const DAY = 86400000;
const genericCodeMessage = '如果该邮箱可用于此操作，验证码将发送到邮箱，10 分钟内有效。';

export async function createApp(config, { sendMail, now = Date.now } = {}) {
  if (!sendMail) throw new Error('A mail transport must be configured.');
  const db = openDatabase(config.database);
  // Only the deployment allowlist may grant the owner role, including accounts
  // created before the owner address was configured. Nicknames never grant it.
  if(config.adminEmail) {
    const owner=db.prepare('SELECT id FROM users WHERE email=?').get(config.adminEmail);
    if(owner)db.prepare("UPDATE users SET role='admin' WHERE id=?").run(owner.id);
  }
  const dummyHash = await hashPassword(randomBytes(32).toString('hex'));
  const cookieName = config.production ? '__Host-apc_session' : 'apc_session';
  const topics = config.topicsFile ? new Set(JSON.parse(readFileSync(config.topicsFile, 'utf8')).topics) : null;
  if (config.production && (!topics || !topics.size)) throw new Error('Production requires a nonempty article manifest.');
  const visits = createVisits(db, { secret: config.secret, topics, now });
  let passwordJobs = 0;
  const passwordWork = async fn => {
    if (passwordJobs >= 4) fail(429, '登录请求较多，请稍后重试。');
    passwordJobs++;
    try { return await fn(); } finally { passwordJobs--; }
  };
  const getUser = id => db.prepare('SELECT * FROM users WHERE id=?').get(id);
  const byEmail = email => db.prepare('SELECT * FROM users WHERE email=?').get(email);
  const digestCode = (email, purpose, userId, code) => hmac(config.secret, `${email}|${purpose}|${userId}|${code}`);
  const cookie = (token, expires) => `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires}${config.production ? '; Secure' : ''}`;
  function session(req) {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    return db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(sha256(token), now()) || null;
  }
  function requireUser(req) { const user = session(req); if (!user) fail(401, '请先登录。'); return user; }
  function startSession(res, id) {
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(sha256(token), id, now() + 14 * DAY);
    res.setHeader('Set-Cookie', cookie(token, 14 * DAY / 1000));
  }
  function rate(key, limit, windowMs) {
    const hashed = hmac(config.secret, key);
    const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(hashed);
    if (row && row.expires_at > now()) {
      if (row.hits >= limit) fail(429, '请求过于频繁或今日邮件额度已用完，请稍后再试。');
      db.prepare('UPDATE rate_limits SET hits=hits+1 WHERE key=?').run(hashed);
    } else db.prepare('INSERT OR REPLACE INTO rate_limits VALUES (?,?,?)').run(hashed, 1, now() + windowMs);
  }
  function codeCheck(email, purpose, userId, code, consume = true) {
    const row = db.prepare('SELECT * FROM codes WHERE email=? AND purpose=? AND user_id=?').get(email, purpose, userId);
    if (!row || row.expires_at <= now() || row.attempts >= 5) fail(400, '验证码错误或已失效，请重新获取。');
    if (typeof code !== 'string' || !/^\d{6}$/.test(code) || row.digest !== digestCode(email, purpose, userId, code)) {
      db.prepare('UPDATE codes SET attempts=attempts+1 WHERE email=? AND purpose=? AND user_id=?').run(email, purpose, userId);
      fail(400, '验证码错误或已失效，请重新获取。');
    }
    if (consume) db.prepare('DELETE FROM codes WHERE email=? AND purpose=? AND user_id=?').run(email, purpose, userId);
  }
  function assertNickname(nickname, userId, role) {
    const key = nicknameKey(nickname);
    if (key === nicknameKey(config.adminNickname) && role !== 'admin') fail(400, '该昵称为站长保留，请选择其他昵称。');
    const existing = db.prepare('SELECT id FROM users WHERE nickname_key=?').get(key);
    if (existing && existing.id !== userId) fail(409, '该昵称已被使用。');
  }
  function topicValue(value) {
    if (value === 'guestbook') return value;
    if (typeof value !== 'string' || value.length > 1000 || !value.startsWith('/') || /[?#\x00-\x20]/.test(value)) fail(400, '文章标识无效。');
    if (topics && !topics.has(value)) fail(404, '文章不存在。');
    return value;
  }
  async function body(req) {
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, '请使用 JSON 请求。');
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16384) fail(413, '请求内容过长。');
      chunks.push(chunk);
    }
    try {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400, '请求格式错误。');
      return data;
    } catch { fail(400, '请求格式错误。'); }
  }
  function json(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
  let lastCleanup = 0;
  async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const origin = req.headers.origin;
    try {
      if (origin && !config.origins.includes(origin)) fail(403, '不允许的来源。');
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Community-Request');
        res.writeHead(204); res.end(); return;
      }
      const socketIp = req.socket.remoteAddress || 'unknown';
      // Only Caddy on loopback may overwrite the client address. Never trust arbitrary X-Forwarded-For.
      const ip = config.trustProxy && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(socketIp)
        ? req.headers['x-real-ip'] || socketIp : socketIp;
      rate(`requests:${ip}`, 240, MINUTE);
      if (now() - lastCleanup > 10 * MINUTE) {
        db.prepare('DELETE FROM rate_limits WHERE expires_at<=?').run(now());
        db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now());
        db.prepare('DELETE FROM codes WHERE expires_at<=?').run(now());
        lastCleanup = now();
      }
      if (!['GET','HEAD'].includes(req.method) && (!origin || req.headers['x-community-request'] !== '1')) fail(403, '请求校验失败，请刷新页面。');
      const url = new URL(req.url, 'http://localhost');
      const route = url.pathname;
      if (req.method === 'GET' && route === '/api/health') return json(res, 200, { ok: true });
      if (req.method === 'GET' && route === '/api/visits') return json(res, 200, visits.read(url.searchParams.get('topic') || '/'));
      if (req.method === 'POST' && route === '/api/visits') {
        rate(`visits:${ip}`, 60, MINUTE);
        return json(res, 200, visits.record(await body(req)));
      }
      if (req.method === 'GET' && route === '/api/stats') return json(res, 200, { registeredUsers: db.prepare('SELECT count(*) AS count FROM users').get().count });
      if (req.method === 'GET' && route === '/api/session') {
        const user = session(req);
        return json(res, 200, { user: user ? privateUser(user) : null });
      }
      if (req.method === 'POST' && route === '/api/auth/code') {
        const data = await body(req);
        const email = emailValue(data.email), purpose = data.purpose;
        if (!['register','reset','bind'].includes(purpose)) fail(400, '验证码用途无效。');
        const user = purpose === 'bind' ? requireUser(req) : null;
        const userId = user?.id || '';
        rate(`mail-ip:${ip}`, 5, 60 * MINUTE);
        rate(`mail-address:${email}`, 1, MINUTE);
        rate(`mail-address-day:${email}`, 10, DAY);
        const existing = byEmail(email);
        if ((purpose === 'register' && existing) || (purpose === 'reset' && !existing) || (purpose === 'bind' && existing)) return json(res, 200, { message: genericCodeMessage });
        if (purpose === 'bind') {
          if (user.role === 'admin') fail(403, '管理员邮箱由服务器配置管理。');
          if (!await passwordWork(() => verifyPassword(passwordValue(data.password), user.password_hash))) fail(400, '当前密码错误。');
        }
        rate(`mail-global-day:${new Date(now()).toISOString().slice(0,10)}`, config.mailDailyLimit, DAY);
        rate(`mail-global-month:${new Date(now()).toISOString().slice(0,7)}`, config.mailMonthlyLimit, 32 * DAY);
        const code = String(randomInt(100000, 1000000));
        const digest = digestCode(email, purpose, userId, code);
        db.prepare('INSERT OR REPLACE INTO codes (email,purpose,user_id,digest,expires_at,attempts) VALUES (?,?,?,?,?,0)').run(email, purpose, userId, digest, now() + 10 * MINUTE);
        try { await sendMail(codeMessage(email, code, purpose)); }
        catch {
          db.prepare('DELETE FROM codes WHERE email=? AND purpose=? AND user_id=? AND digest=?').run(email, purpose, userId, digest);
          fail(503, '邮件暂时发送失败，请稍后重试。');
        }
        return json(res, 200, { message: genericCodeMessage });
      }
      if (req.method === 'POST' && route === '/api/auth/register') {
        const data = await body(req), email = emailValue(data.email);
        rate(`register:${ip}`, 15, 60 * MINUTE);
        const role = config.adminEmail && email === config.adminEmail ? 'admin' : 'user';
        const nickname = role === 'admin' ? config.adminNickname : nicknameValue(data.nickname);
        assertNickname(nickname, null, role);
        codeCheck(email, 'register', '', data.code, false);
        const passwordHash = await passwordWork(() => hashPassword(passwordValue(data.password)));
        const id = randomUUID();
        // Re-check after the asynchronous hash; the code can only be consumed once.
        codeCheck(email, 'register', '', data.code, false);
        if (byEmail(email)) fail(409, '无法注册，请登录或找回密码。');
        assertNickname(nickname, null, role);
        transaction(db, () => {
          codeCheck(email, 'register', '', data.code);
          db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)').run(id, email, nickname, nicknameKey(nickname), passwordHash, randomBytes(16).toString('hex'), role, now());
        });
        startSession(res, id);
        return json(res, 201, { user: privateUser(getUser(id)) });
      }
      if (req.method === 'POST' && route === '/api/auth/login') {
        const data = await body(req), email = emailValue(data.email);
        rate(`login-ip:${ip}`, 30, 15 * MINUTE);
        rate(`login-email:${email}`, 10, 15 * MINUTE);
        const user = byEmail(email);
        const verified = await passwordWork(() => verifyPassword(passwordValue(data.password), user?.password_hash || dummyHash));
        const current = user && getUser(user.id);
        if (!verified || !current || current.email !== email || current.password_hash !== user.password_hash) fail(401, '邮箱或密码错误。');
        startSession(res, user.id);
        return json(res, 200, { user: privateUser(current) });
      }
      if (req.method === 'POST' && route === '/api/auth/logout') {
        const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || '';
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha256(token));
        res.setHeader('Set-Cookie', cookie('', 0));
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && route === '/api/auth/reset') {
        const data = await body(req), email = emailValue(data.email);
        rate(`reset:${ip}`, 20, 15 * MINUTE);
        codeCheck(email, 'reset', '', data.code, false);
        const user = byEmail(email);
        if (!user) fail(400, '验证码错误或已失效。');
        const password = passwordValue(data.password);
        const passwordHash = await passwordWork(async () => {
          if (await verifyPassword(password, user.password_hash)) fail(400, '新密码不能与原密码相同。');
          return hashPassword(password);
        });
        codeCheck(email, 'reset', '', data.code, false);
        if (getUser(user.id)?.email !== email) fail(400, '账号信息已改变，请重新获取验证码。');
        transaction(db, () => {
          codeCheck(email, 'reset', '', data.code);
          db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash, user.id);
          db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
          db.prepare('DELETE FROM codes WHERE email=? OR user_id=?').run(email, user.id);
        });
        res.setHeader('Set-Cookie', cookie('', 0));
        return json(res, 200, { message: '密码已重置，所有旧登录已失效，请使用新密码登录。' });
      }
      if (req.method === 'PATCH' && route === '/api/me') {
        const user = requireUser(req), data = await body(req), nickname = nicknameValue(data.nickname);
        assertNickname(nickname, user.id, user.role);
        db.prepare('UPDATE users SET nickname=?,nickname_key=? WHERE id=?').run(nickname, nicknameKey(nickname), user.id);
        return json(res, 200, { user: privateUser(getUser(user.id)) });
      }
      if (req.method === 'POST' && route === '/api/me/password') {
        const user = requireUser(req), data = await body(req);
        rate(`password:${user.id}`, 10, 15 * MINUTE);
        const passwordHash = await passwordWork(async () => {
          if (!await verifyPassword(passwordValue(data.currentPassword), user.password_hash)) fail(400, '当前密码错误。');
          const password = passwordValue(data.password);
          if (await verifyPassword(password, user.password_hash)) fail(400, '新密码不能与原密码相同。');
          return hashPassword(password);
        });
        if (!session(req) || getUser(user.id)?.password_hash !== user.password_hash) fail(401, '登录已失效，请重新登录。');
        transaction(db, () => {
          db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash, user.id);
          db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
          db.prepare('DELETE FROM codes WHERE email=? OR user_id=?').run(user.email, user.id);
        });
        res.setHeader('Set-Cookie', cookie('', 0));
        return json(res, 200, { message: '密码已修改，请重新登录。' });
      }
      if (req.method === 'POST' && route === '/api/me/email') {
        const user = requireUser(req), data = await body(req), email = emailValue(data.email);
        if (user.role === 'admin') fail(403, '管理员邮箱由服务器配置管理。');
        rate(`bind:${user.id}`, 10, 15 * MINUTE);
        if (!await passwordWork(() => verifyPassword(passwordValue(data.password), user.password_hash))) fail(400, '当前密码错误。');
        if (!session(req) || getUser(user.id)?.password_hash !== user.password_hash) fail(401, '登录已失效，请重新登录。');
        codeCheck(email, 'bind', user.id, data.code, false);
        if (byEmail(email) || email === config.adminEmail) fail(409, '无法绑定该邮箱。');
        transaction(db, () => {
          codeCheck(email, 'bind', user.id, data.code);
          db.prepare('UPDATE users SET email=? WHERE id=?').run(email, user.id);
          db.prepare('DELETE FROM codes WHERE email=? OR user_id=?').run(user.email, user.id);
          db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
        });
        startSession(res, user.id);
        return json(res, 200, { user: privateUser(getUser(user.id)) });
      }
      if (req.method === 'GET' && route === '/api/comments') {
        const topic = topicValue(url.searchParams.get('topic'));
        const limit = Math.min(30, Math.max(1, Number(url.searchParams.get('limit')) || 20));
        const before = Number(url.searchParams.get('before')) || Number.MAX_SAFE_INTEGER;
        if (!Number.isSafeInteger(before) || !Number.isInteger(limit)) fail(400, '分页参数错误。');
        const rows = db.prepare(`SELECT c.id,c.body,c.created_at,u.id AS user_id,u.nickname,u.avatar_seed,u.role FROM comments c JOIN users u ON u.id=c.user_id
          WHERE c.topic=? AND c.deleted_at IS NULL AND c.id<? ORDER BY c.id DESC LIMIT ?`).all(topic, before, limit + 1);
        const more = rows.length > limit; if (more) rows.pop();
        return json(res, 200, { items: rows.map(r => ({ id: r.id, body: r.body, createdAt: r.created_at, user: publicUser({ ...r, id: r.user_id }) })), nextCursor: more ? rows.at(-1).id : null,
          total: db.prepare('SELECT count(*) AS count FROM comments WHERE topic=? AND deleted_at IS NULL').get(topic).count });
      }
      if (req.method === 'POST' && route === '/api/comments') {
        const user = requireUser(req), data = await body(req), topic = topicValue(data.topic);
        const text = typeof data.body === 'string' ? data.body.trim() : '';
        if (!text || [...text].length > 2000 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) fail(400, '请输入 1–2000 字的评论。');
        rate(`comment-interval:${user.id}`, 1, 10000);
        rate(`comment-hour:${user.id}`, 30, 60 * MINUTE);
        const result = db.prepare('INSERT INTO comments(topic,user_id,body,created_at) VALUES(?,?,?,?)').run(topic, user.id, text, now());
        return json(res, 201, { id: Number(result.lastInsertRowid) });
      }
      if (req.method === 'DELETE' && /^\/api\/comments\/\d+$/.test(route)) {
        const user = requireUser(req), id = Number(route.split('/').at(-1));
        const comment = db.prepare('SELECT * FROM comments WHERE id=? AND deleted_at IS NULL').get(id);
        if (!comment) fail(404, '评论不存在。');
        if (user.role !== 'admin' && comment.user_id !== user.id) fail(403, '只能移除自己的评论。');
        db.prepare('UPDATE comments SET deleted_at=?,deleted_by=? WHERE id=?').run(now(), user.id, id);
        return json(res, 200, { ok: true });
      }
      fail(404, '接口不存在。');
    } catch (error) {
      const status = error.status || 500;
      if (status === 429) res.setHeader('Retry-After', '60');
      if (status === 500) console.error('Community request failed:', error.code || error.name);
      if (!res.headersSent) json(res, status, { error: status === 500 ? '服务暂时不可用，请稍后重试。' : error.message });
      else res.end();
    }
  }
  return { handler, db, close: () => db.close() };
}
