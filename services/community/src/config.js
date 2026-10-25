import path from 'node:path';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const config = {
    production,
    host: env.HOST || '127.0.0.1',
    port: Number(env.PORT || 8787),
    database: path.resolve(env.DATABASE_PATH || './data/community.sqlite'),
    secret: env.APP_SECRET || '',
    origins: (env.ALLOWED_ORIGINS || 'http://localhost:4000,http://127.0.0.1:4000').split(',').map(s => s.trim()).filter(Boolean),
    adminEmail: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    adminNickname: env.ADMIN_NICKNAME || 'guinyの时光',
    topicsFile: env.TOPICS_FILE ? path.resolve(env.TOPICS_FILE) : null,
    trustProxy: env.TRUST_PROXY === 'true',
    mailTransport: env.MAIL_TRANSPORT || 'resend',
    mailFrom: env.MAIL_FROM || '',
    resendKey: env.RESEND_API_KEY || '',
    mailDailyLimit: Number(env.MAIL_DAILY_LIMIT || 90),
    mailMonthlyLimit: Number(env.MAIL_MONTHLY_LIMIT || 2900)
  };
  if (config.secret.length < 32) throw new Error('APP_SECRET must contain at least 32 characters.');
  if (production) {
    if (!config.adminEmail || !config.topicsFile) throw new Error('ADMIN_EMAIL and TOPICS_FILE are required in production.');
    if (config.origins.some(s => !/^https:\/\/[^/]+$/.test(s))) throw new Error('Production origins must be exact HTTPS origins.');
    if (config.trustProxy && !['127.0.0.1', '::1'].includes(config.host)) throw new Error('Trusted proxy mode must bind to loopback.');
    if (config.mailTransport !== 'resend') throw new Error('Production requires Resend.');
    if (!config.mailFrom || !config.resendKey) throw new Error('Configure the mail provider before starting production.');
  }
  if (![config.mailDailyLimit, config.mailMonthlyLimit].every(n => Number.isInteger(n) && n > 0)) throw new Error('Mail limits must be positive integers.');
  return config;
}
