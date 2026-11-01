import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { openDatabase } from '../src/db.js';
import { createAudit,requestMetadata,AUDIT_RETENTION_MS } from '../src/audit.js';
import { createApp } from '../src/app.js';
import { sha256 } from '../src/security.js';

const req=(extra={})=>({method:'GET',url:'/api/identity/callback?code=PRIVATE-CODE&state=PRIVATE-STATE',headers:{cookie:'PRIVATE-COOKIE',authorization:'PRIVATE-TOKEN','user-agent':'Browser/1'},socket:{remoteAddress:'203.0.113.8',remotePort:50001,localAddress:'192.0.2.5',localPort:8787},...extra});

test('audit excludes bodies, credentials, queries and unknown route values; trusts proxy metadata only on loopback',()=>{
  const request=req({body:{password:'PRIVATE-PASSWORD'},headers:{'x-real-ip':'198.51.100.3','x-client-port':'443','x-server-address':'192.0.2.4','x-server-port':'443','user-agent':'Browser\r\nspoof'}});
  const meta=requestMetadata(request,true);
  assert.equal(meta.sourceIp,'203.0.113.8');assert.equal(meta.sourcePort,50001);
  assert.equal(meta.route,'/api/identity/callback');assert.doesNotMatch(JSON.stringify(meta),/PRIVATE|code=|state=|\r|\n/);
  request.socket.remoteAddress='127.0.0.1';
  assert.equal(requestMetadata(request,true).sourceIp,'198.51.100.3');
  assert.equal(requestMetadata(request,true).targetPort,443);
  request.headers['x-real-ip']='invalid';request.headers['x-client-port']='70000';
  assert.equal(requestMetadata(request,true).sourceIp,'127.0.0.1');assert.equal(requestMetadata(request,true).sourcePort,null);
  request.url='/api/PRIVATE-EMAIL';assert.equal(requestMetadata(request,true).route,'unknown');
  request.url='/api/admin/reviews/42';assert.equal(requestMetadata(request,true).objectId,'42');
});

test('audit retains at least 200 days and records interrupted requests without deleting pending records',()=>{
  const db=openDatabase(':memory:');let time=1;
  try{
    const audit=createAudit(db,{now:()=>time});
    const old=audit.start(req(),'reader',false);audit.finish(old,'reader',200);
    time=2;const unfinished=audit.start(req(),null,false);
    time=AUDIT_RETENTION_MS+1;const boundary=audit.start(req(),null,false);audit.finish(boundary,null,499);
    assert.ok(db.prepare('SELECT id FROM security_audit WHERE id=?').get(old));
    time+=86400001;audit.start(req(),null,false);
    assert.equal(db.prepare('SELECT id FROM security_audit WHERE id=?').get(old),undefined);
    assert.ok(db.prepare('SELECT id FROM security_audit WHERE id=?').get(unfinished));
    assert.equal(db.prepare('SELECT status FROM security_audit WHERE id=?').get(boundary).status,499);
  }finally{db.close();}
});

test('actual API records actor and moderation outcomes, excludes secrets, and fails closed if audit cannot persist',async t=>{
  const app=await createApp({production:false,database:':memory:',secret:'test-only-audit-secret'.repeat(3),origins:['http://localhost'],adminNickname:'Owner',trustProxy:false},{sendMail:async()=>{throw Error('No mail expected');}});
  app.db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run('reader','private@example.test','Reader','reader','unused','a'.repeat(32),'user',Date.now());
  app.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(sha256('a'.repeat(64)),'reader',Date.now()+60000);
  const server=http.createServer(app.handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(async()=>{await new Promise(r=>server.close(r));app.close();});
  const call=(path,data)=>fetch(`http://127.0.0.1:${server.address().port}${path}`,{method:data?'POST':'GET',headers:{Origin:'http://localhost','X-Community-Request':'1','Content-Type':'application/json',Cookie:'apc_session='+'a'.repeat(64),'User-Agent':'Audit-test'},body:data?JSON.stringify(data):undefined});
  const held=await call('/api/comments?code=PRIVATE-OAUTH',{topic:'guestbook',body:'代开发票 PRIVATE-BODY'});assert.equal(held.status,201);await held.json();
  const denied=await call('/api/admin/reviews');assert.equal(denied.status,403);await denied.json();
  const rows=app.db.prepare('SELECT * FROM security_audit ORDER BY id').all();
  assert.equal(rows[0].user_id,'reader');assert.equal(rows[0].status,201);assert.equal(rows[1].status,403);
  assert.equal(rows[0].route,'/api/comments');assert.ok(rows[0].source_port>0);
  assert.doesNotMatch(JSON.stringify(rows),/PRIVATE|private@example|aaaaaaaaaa/);
  app.db.exec('DROP TABLE security_audit');
  const rejected=await call('/api/auth/logout',{});assert.equal(rejected.status,503);await rejected.json();
  assert.equal(app.db.prepare('SELECT count(*) AS n FROM sessions').get().n,1);
});
