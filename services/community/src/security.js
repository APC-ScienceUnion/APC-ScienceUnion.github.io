import { randomBytes, scrypt, timingSafeEqual, createHash, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const parameters = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function fail(status, message) { throw new HttpError(status, message); }
export const sha256 = text => createHash('sha256').update(text).digest('hex');
export const hmac = (secret, text) => createHmac('sha256', secret).update(text).digest('hex');
export const nicknameKey = text => text.normalize('NFKC').toLowerCase();
export function emailValue(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) fail(400, '请输入有效的邮箱地址。');
  return value.trim().toLowerCase();
}
export function nicknameValue(value) {
  const s = typeof value === 'string' ? value.trim().normalize('NFKC') : '';
  if ([...s].length < 2 || [...s].length > 24 || /[<>\p{Cc}\p{Cf}]/u.test(s)) fail(400, '昵称须为 2–24 个字符，不能含控制符或尖括号。');
  return s;
}
export function passwordValue(value) {
  if (typeof value !== 'string' || [...value].length < 10 || Buffer.byteLength(value) > 256) fail(400, '密码至少 10 个字符，最多 256 字节。');
  return value;
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, parameters);
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [, salt, hex] = encoded.split(':');
  const key = await derive(password, salt, 64, parameters);
  const expected = Buffer.from(hex, 'hex');
  return expected.length === key.length && timingSafeEqual(key, expected);
}
export function publicUser(user) {
  return { id: user.id, nickname: user.nickname, avatarSeed: user.avatar_seed, role: user.role };
}
export function privateUser(user) {
  return { ...publicUser(user), email: user.email, createdAt: user.created_at };
}
