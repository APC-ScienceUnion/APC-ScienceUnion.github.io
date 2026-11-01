import { transaction } from './db.js';
import { fail, publicUser } from './security.js';
import { reviewMatches, moderationVersion } from './moderation.js';

export function createReviews(db, { now }) {
  // Unpublished text never enters comments. Even an older release's public
  // queries cannot accidentally expose a pending or rejected submission.
  db.exec(`CREATE TABLE IF NOT EXISTS comment_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
    created_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','withdrawn')),
    matches TEXT NOT NULL,
    lexicon_version TEXT NOT NULL,
    reviewed_at INTEGER,
    reviewed_by TEXT REFERENCES users(id),
    comment_id INTEGER UNIQUE REFERENCES comments(id)
  ) STRICT;
  CREATE INDEX IF NOT EXISTS reviews_status ON comment_reviews(status,id DESC);
  CREATE INDEX IF NOT EXISTS reviews_user ON comment_reviews(user_id,id DESC);`);

  function hold(topic, userId, text) {
    const matches = reviewMatches(text);
    if (!matches.length) return null;
    const row = db.prepare(`INSERT INTO comment_reviews(topic,user_id,body,created_at,matches,lexicon_version)
      VALUES(?,?,?,?,?,?)`).run(topic, userId, text, now(), JSON.stringify(matches), moderationVersion);
    return { reviewId: Number(row.lastInsertRowid), status: 'pending' };
  }
  function list(user, params, admin) {
    if (admin && user.role !== 'admin') fail(403, '仅站长可审核。');
    const before = Number(params.get('before') || Number.MAX_SAFE_INTEGER);
    const limit = Math.min(30, Number(params.get('limit') || 20));
    if (!Number.isSafeInteger(before) || before < 1 || !Number.isInteger(limit) || limit < 1) fail(400, '分页参数错误。');
    const status = params.get('status') || 'pending';
    if (admin && !['pending','rejected','approved'].includes(status)) fail(400, '审核状态无效。');
    const filter = admin ? 'r.status=?' : "r.user_id=? AND r.status IN ('pending','rejected')";
    const value = admin ? status : user.id;
    const rows = db.prepare(`SELECT r.*,u.nickname,u.avatar_seed,u.role FROM comment_reviews r
      JOIN users u ON u.id=r.user_id WHERE ${filter} AND r.id<? ORDER BY r.id DESC LIMIT ?`).all(value,before,limit+1);
    const more = rows.length > limit; if (more) rows.pop();
    return { items: rows.map(r => ({ id:r.id,topic:r.topic,body:r.body,createdAt:r.created_at,status:r.status,
      ...(admin ? {matches:JSON.parse(r.matches),lexiconVersion:r.lexicon_version,reviewedAt:r.reviewed_at,
        user:publicUser({...r,id:r.user_id})} : {}) })), nextCursor:more?rows.at(-1).id:null,
      total:db.prepare(`SELECT count(*) AS n FROM comment_reviews r WHERE ${filter}`).get(value).n };
  }
  function decide(id, user, decision) {
    if (user.role !== 'admin') fail(403, '仅站长可审核。');
    if (!['approve','reject'].includes(decision)) fail(400, '审核操作无效。');
    return transaction(db, () => {
      const row = db.prepare('SELECT * FROM comment_reviews WHERE id=?').get(id);
      if (!row) fail(404, '记录不存在。');
      if (row.status !== 'pending') fail(409, '这条内容已处理，请刷新列表。');
      let commentId = null;
      if (decision === 'approve') {
        commentId = Number(db.prepare('INSERT INTO comments(topic,user_id,body,created_at) VALUES(?,?,?,?)')
          .run(row.topic,row.user_id,row.body,row.created_at).lastInsertRowid);
      }
      const status = decision === 'approve' ? 'approved' : 'rejected';
      db.prepare('UPDATE comment_reviews SET status=?,reviewed_at=?,reviewed_by=?,comment_id=? WHERE id=?')
        .run(status,now(),user.id,commentId,id);
      return {ok:true,status,commentId};
    });
  }
  function withdraw(id, user) {
    const row = db.prepare('SELECT * FROM comment_reviews WHERE id=? AND user_id=?').get(id,user.id);
    if (!row) fail(404, '记录不存在。');
    if (!['pending','rejected'].includes(row.status)) fail(409, '这条内容已处理，请刷新列表。');
    db.prepare("UPDATE comment_reviews SET status='withdrawn',reviewed_at=?,reviewed_by=? WHERE id=?").run(now(),user.id,id);
    return {ok:true};
  }
  return {hold,list,decide,withdraw};
}
