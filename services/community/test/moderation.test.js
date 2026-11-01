import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewMatches, moderationVersion } from '../src/moderation.js';
import { openDatabase } from '../src/db.js';
import { createReviews } from '../src/reviews.js';

test('curated dictionary avoids generic science, nationality and institution terms',()=>{
  for(const text of ['地球围绕太阳运行。','维基百科的阿拉伯天文学资料','伊斯兰与穆斯林的历史','共产党与形式主义的历史讨论',
    '硝酸甘油、六氟化铀、三硝基甲苯的分子结构','麻醉药和精神药品的作用机制','下载速度与免费使用','性伴侣与生殖健康'])assert.deepEqual(reviewMatches(text),[],text);
  assert.match(moderationVersion,/^[a-f0-9]{16}$/);
  assert.equal(reviewMatches('出售\u200b手 枪')[0].term,'出售手枪');
  assert.ok(reviewMatches('六四事件的历史讨论').length);
  assert.ok(reviewMatches('天安门事件').length);
  assert.equal(reviewMatches('出版物讨论代开发票的骗局')[0].term,'代开发票');
  assert.ok(reviewMatches('操你妈').length);
  assert.equal(reviewMatches('出售手枪'.repeat(300)).length,1);
});

test('legacy published rows survive initialization and pending text is outside public tables',()=>{
  const db=openDatabase(':memory:');
  try{
    db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run('u','u@example.test','昵称','昵称','hash','a'.repeat(32),'user',1);
    db.prepare('INSERT INTO comments(topic,user_id,body,created_at) VALUES(?,?,?,?)').run('guestbook','u','已有留言',2);
    const reviews=createReviews(db,{now:()=>3});
    reviews.hold('guestbook','u','代开发票');
    createReviews(db,{now:()=>4});
    assert.deepEqual(db.prepare('SELECT id,body FROM comments WHERE deleted_at IS NULL').all().map(r=>({...r})),[{id:1,body:'已有留言'}]);
    assert.equal(db.prepare('SELECT count(*) AS n FROM comment_reviews').get().n,1);
  }finally{db.close();}
});
