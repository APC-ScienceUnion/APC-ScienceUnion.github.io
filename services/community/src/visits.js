import { transaction } from './db.js';
import { fail, hmac } from './security.js';

const DAY = 86400000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Store aggregates and pseudonymous hashes, never raw IPs, cookies, or referrers.
export function createVisits(db, { secret, topics, now }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS visit_totals (
      id INTEGER PRIMARY KEY CHECK(id=1), started_at INTEGER NOT NULL,
      views INTEGER NOT NULL DEFAULT 0, visitors INTEGER NOT NULL DEFAULT 0
    ) STRICT;
    CREATE TABLE IF NOT EXISTS visit_pages (topic TEXT PRIMARY KEY, views INTEGER NOT NULL) STRICT;
    CREATE TABLE IF NOT EXISTS visit_browsers (hash TEXT PRIMARY KEY) STRICT;
    CREATE TABLE IF NOT EXISTS visit_receipts (hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL) STRICT;
    CREATE INDEX IF NOT EXISTS visit_receipts_expiry ON visit_receipts(expires_at);
  `);
  function topicValue(topic) {
    if (topic === '/') return topic;
    if (typeof topic !== 'string' || topic.length > 1000 || !topic.startsWith('/articles/') || /[?#\s\x00-\x1f]/.test(topic)) fail(400, '统计页面标识无效。');
    if (topics && !topics.has(topic)) fail(404, '文章不存在。');
    return topic;
  }
  function read(topic) {
    topic = topicValue(topic);
    const total = db.prepare('SELECT * FROM visit_totals WHERE id=1').get();
    return {
      startedAt: total ? new Date(total.started_at).toISOString() : null,
      siteViews: total?.views || 0, siteVisitors: total?.visitors || 0,
      pageViews: db.prepare('SELECT views FROM visit_pages WHERE topic=?').get(topic)?.views || 0,
      visitorBasis: 'anonymous-browser', receiptRetentionHours: 24
    };
  }
  function record(data) {
    const topic = topicValue(data.topic);
    if (typeof data.visitorId !== 'string' || !uuid.test(data.visitorId) || typeof data.viewId !== 'string' || !uuid.test(data.viewId)) fail(400, '统计标识无效。');
    const visitor = hmac(secret, `visitor:${data.visitorId.toLowerCase()}`);
    const receipt = hmac(secret, `visit:${data.viewId.toLowerCase()}`);
    return transaction(db, () => {
      db.prepare('DELETE FROM visit_receipts WHERE expires_at<=?').run(now());
      if (db.prepare('INSERT OR IGNORE INTO visit_receipts VALUES (?,?)').run(receipt, now() + DAY).changes) {
        db.prepare('INSERT OR IGNORE INTO visit_totals (id,started_at) VALUES (1,?)').run(now());
        const fresh = db.prepare('INSERT OR IGNORE INTO visit_browsers VALUES (?)').run(visitor).changes;
        db.prepare('UPDATE visit_totals SET views=views+1, visitors=visitors+? WHERE id=1').run(fresh);
        db.prepare('INSERT INTO visit_pages VALUES (?,1) ON CONFLICT(topic) DO UPDATE SET views=views+1').run(topic);
      }
      return read(topic);
    });
  }
  return { read, record };
}
