import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { fail } from './security.js';
import { transaction } from './db.js';

// Call only with server-verified proof after the application has checked the
// current session and recent password confirmation. No public phone setter.
export function createIdentityStore(db, {secret, now=Date.now}) {
  if(typeof secret!=='string'||secret.length<32)throw new Error('Identity storage requires a strong application secret.');
  const keyed = (purpose,value) => createHmac('sha256',secret).update(`${purpose}\0${value}`).digest('hex');
  const key=createHmac('sha256',secret).update('apc-identity-encryption-v1').digest();
  const encrypt = (phone,userId) => {
    const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    cipher.setAAD(Buffer.from(`apc-identity-phone-v1\0${userId}`));
    const data=Buffer.concat([cipher.update(phone,'utf8'),cipher.final()]);
    return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),data.toString('base64url')].join('.');
  };
  const decrypt = (encrypted,userId) => {
    const [version,iv,tag,data,...extra]=encrypted.split('.');
    if(version!=='v1'||extra.length)throw new Error('Invalid stored identity.');
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(iv,'base64url'));
    decipher.setAAD(Buffer.from(`apc-identity-phone-v1\0${userId}`));
    decipher.setAuthTag(Buffer.from(tag,'base64url'));
    const phone=Buffer.concat([decipher.update(Buffer.from(data,'base64url')),decipher.final()]).toString('utf8');
    if(!/^\+861[3-9]\d{9}$/.test(phone))throw new Error('Invalid stored identity.');
    return phone;
  };
  db.exec(`CREATE TABLE IF NOT EXISTS verified_identities (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    subject_key TEXT NOT NULL UNIQUE,
    phone_key TEXT NOT NULL UNIQUE,
    phone_encrypted TEXT NOT NULL,
    issuer TEXT NOT NULL,
    source_id TEXT NOT NULL,
    connection_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    verified_at INTEGER NOT NULL
  ) STRICT;`);
  function status(userId) {
    const row=db.prepare('SELECT phone_encrypted,verified_at FROM verified_identities WHERE user_id=?').get(userId);
    if(!row)return {verified:false};
    const phone=decrypt(row.phone_encrypted,userId);
    return {verified:true,phoneMasked:`${phone.slice(0,6)}****${phone.slice(-4)}`,verifiedAt:row.verified_at};
  }
  function bind(userId,proof) {
    if(!proof||proof.provider!=='authing'||proof.evidence!=='wechat-source'||
      typeof proof.issuer!=='string'||!/^https:\/\/[a-z0-9-]+\.authing\.cn\/oidc$/.test(proof.issuer)||
      typeof proof.subject!=='string'||!proof.subject||proof.subject.length>255||
      !/^[a-f0-9]{24}$/.test(proof.sourceId||'')||!/^[a-f0-9]{24}$/.test(proof.connectionId||'')||
      typeof proof.phone!=='string'||!/^\+861[3-9]\d{9}$/.test(proof.phone)||
      !Number.isSafeInteger(proof.verifiedAt)||proof.verifiedAt>now()+30000||proof.verifiedAt<now()-300000)fail(400,'手机号验证结果无效，请重新验证。');
    const subjectKey=keyed('identity-subject',`${proof.issuer}\0${proof.subject}`),phoneKey=keyed('identity-phone',proof.phone);
    return transaction(db,()=>{
      if(!db.prepare('SELECT id FROM users WHERE id=?').get(userId))fail(401,'登录已失效，请重新登录。');
      const existing=db.prepare('SELECT subject_key,phone_key FROM verified_identities WHERE user_id=?').get(userId);
      if(existing&&(existing.subject_key!==subjectKey||existing.phone_key!==phoneKey))fail(409,'此账号已绑定其他身份，不能直接覆盖。');
      const used=db.prepare('SELECT user_id FROM verified_identities WHERE subject_key=? OR phone_key=?').all(subjectKey,phoneKey);
      if(used.some(row=>row.user_id!==userId))fail(409,'该身份暂时无法绑定，请联系站长。');
      if(!existing)db.prepare('INSERT INTO verified_identities VALUES (?,?,?,?,?,?,?,?,?)').run(userId,subjectKey,phoneKey,encrypt(proof.phone,userId),proof.issuer,proof.sourceId,proof.connectionId,now(),proof.verifiedAt);
      else db.prepare('UPDATE verified_identities SET verified_at=? WHERE user_id=?').run(proof.verifiedAt,userId);
      return status(userId);
    });
  }
  return {status,bind};
}
