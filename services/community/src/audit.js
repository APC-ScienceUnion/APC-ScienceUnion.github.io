import { isIP } from 'node:net';

export const AUDIT_RETENTION_MS = 200 * 86400000;
const endpoints = new Set(['health','visits','stats','session','comments','auth/code','auth/register','auth/login','auth/logout','auth/reset','me','me/password','me/email','identity/status','identity/start','identity/callback','identity/confirm','identity/cancel','admin/comments','admin/reviews','me/reviews'].map(x=>'/api/'+x));
const clean = (value,max) => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g,'').slice(0,max) : '';
const port = value => /^\d{1,5}$/.test(String(value)) && Number(value)>0 && Number(value)<=65535 ? Number(value) : null;
const address = value => typeof value==='string' && isIP(value) ? value : '';

export function requestMetadata(req, trustProxy) {
  const proxied=trustProxy && ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  // Only allowlisted route names are retained: unknown paths and ALL query
  // strings can contain personal information or OAuth credentials.
  const path=(req.url||'').split('?')[0];
  const item=path.match(/^\/api\/(comments|admin\/reviews|me\/reviews)\/(\d{1,15})$/);
  return {
    route:endpoints.has(path)?path:item?`/api/${item[1]}/:id`:'unknown',
    objectId:item?item[2]:null,
    method:['GET','HEAD','POST','PATCH','DELETE','OPTIONS','PUT'].includes(req.method)?req.method:'OTHER',
    sourceIp:address(proxied?req.headers['x-real-ip']:null)||address(req.socket.remoteAddress),
    sourcePort:port(proxied?req.headers['x-client-port']:req.socket.remotePort),
    targetIp:address(proxied?req.headers['x-server-address']:null)||address(req.socket.localAddress),
    targetPort:port(proxied?req.headers['x-server-port']:req.socket.localPort),
    userAgent:clean(req.headers['user-agent'],512)
  };
}

export function createAudit(db,{now=Date.now}={}) {
  db.exec(`CREATE TABLE IF NOT EXISTS security_audit (
    id INTEGER PRIMARY KEY, started_at INTEGER NOT NULL, finished_at INTEGER,
    user_id TEXT, method TEXT NOT NULL, route TEXT NOT NULL, object_id TEXT,
    source_ip TEXT NOT NULL, source_port INTEGER, target_ip TEXT NOT NULL,
    target_port INTEGER, user_agent TEXT NOT NULL, status INTEGER
  ) STRICT;
  CREATE INDEX IF NOT EXISTS security_audit_time ON security_audit(started_at);`);
  let lastCleanup=0;
  const insert=db.prepare(`INSERT INTO security_audit(started_at,user_id,method,route,object_id,source_ip,source_port,target_ip,target_port,user_agent) VALUES(?,?,?,?,?,?,?,?,?,?)`);
  return {
    start(req,userId,trustProxy) {
      const time=now(),m=requestMetadata(req,trustProxy);
      // A failed audit insert prevents the operation from starting.
      const id=insert.run(time,userId||null,m.method,m.route,m.objectId,m.sourceIp,m.sourcePort,m.targetIp,m.targetPort,m.userAgent).lastInsertRowid;
      if(time-lastCleanup>86400000){
        db.prepare('DELETE FROM security_audit WHERE started_at<? AND finished_at IS NOT NULL').run(time-AUDIT_RETENTION_MS);
        lastCleanup=time;
      }
      return id;
    },
    finish(id,userId,status) {
      db.prepare('UPDATE security_audit SET finished_at=?,user_id=COALESCE(?,user_id),status=? WHERE id=? AND finished_at IS NULL').run(now(),userId||null,status,id);
    }
  };
}
