import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db.js';
import { createIdentityStore } from '../src/identity-store.js';

const secret='identity-store-test-secret-with-32-characters';
const clock=1800000000000;
const proof={provider:'authing',evidence:'wechat-source',issuer:'https://test.authing.cn/oidc',subject:'wechat-account',phone:'+8613800138000',sourceId:'a'.repeat(24),connectionId:'b'.repeat(24),verifiedAt:clock};
function setup(t){
  const db=openDatabase(':memory:');t.after(()=>db.close());
  for(const id of ['reader','other'])db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)').run(id,`${id}@example.test`,id,id,'unused','avatar','user',clock);
  return {db,store:createIdentityStore(db,{secret,now:()=>clock})};
}
test('phone is encrypted, indexes are keyed, and status exposes only a masked number',t=>{
  const {db,store}=setup(t);
  assert.deepEqual(store.status('reader'),{verified:false});
  assert.deepEqual(store.bind('reader',proof),{verified:true,phoneMasked:'+86138****8000',verifiedAt:clock});
  const row=db.prepare('SELECT * FROM verified_identities').get();
  assert.doesNotMatch(JSON.stringify(row),/13800138000|wechat-account/);
  assert.match(row.subject_key,/^[a-f0-9]{64}$/);
  assert.match(row.phone_encrypted,/^v1\./);
  const reopened=createIdentityStore(db,{secret,now:()=>clock});
  assert.equal(reopened.status('reader').verified,true);
  assert.equal(db.prepare('SELECT role FROM users WHERE id=?').get('reader').role,'user');
});
test('identity and phone are unique and an existing binding cannot silently be replaced',t=>{
  const {db,store}=setup(t);store.bind('reader',proof);
  assert.throws(()=>store.bind('other',proof),{status:409});
  assert.throws(()=>store.bind('other',{...proof,subject:'different'}),{status:409});
  assert.throws(()=>store.bind('reader',{...proof,phone:'+8613800138001'}),{status:409});
  assert.equal(store.bind('reader',proof).verified,true);
  assert.equal(db.prepare('SELECT count(*) AS n FROM verified_identities').get().n,1);
});
test('untrusted, stale and malformed proof cannot create a binding',t=>{
  const {db,store}=setup(t);
  for(const change of [{evidence:'browser-says-verified'},{verifiedAt:clock-300001},{verifiedAt:clock+30001},{phone:'13800138000'},{issuer:'https://evil.example/oidc'},{subject:''},{connectionId:''}])assert.throws(()=>store.bind('reader',{...proof,...change}),{status:400});
  assert.throws(()=>store.bind('missing-user',proof),{status:401});
  assert.equal(db.prepare('SELECT count(*) AS n FROM verified_identities').get().n,0);
});
test('tampering and a wrong secret fail closed instead of presenting a verified identity',t=>{
  const {db,store}=setup(t);store.bind('reader',proof);
  assert.throws(()=>createIdentityStore(db,{secret:secret+'wrong'}).status('reader'));
  const row=db.prepare('SELECT phone_encrypted FROM verified_identities').get();
  const parts=row.phone_encrypted.split('.');const bytes=Buffer.from(parts[3],'base64url');bytes[0]^=1;parts[3]=bytes.toString('base64url');
  db.prepare('UPDATE verified_identities SET phone_encrypted=?').run(parts.join('.'));
  assert.throws(()=>store.status('reader'));
});
