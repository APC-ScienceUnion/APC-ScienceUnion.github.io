'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {safeSegment,localReference,articleReferences,importImages}=require('../tools/upload_images');
test('article references preserve encoded Unicode and resolve categorized files to public routes',()=>{
 const config={imageOrigin:'https://img.example.test',siteOrigin:'https://blog.example.test'};
 const records=[{sourceFile:path.resolve('source/images/物理学/文章/图.png'),sourceRoute:'images/物理学/文章/图.png',publicRoute:'images/文章/图.png'}];
 for(const ref of ['/images/文章/图.png','https://img.example.test/images/%E6%96%87%E7%AB%A0/%E5%9B%BE.png','../images/物理学/文章/图.png'])assert.equal(localReference(ref,path.resolve('source/_posts/article.md'),records,config),records[0]);
 assert.equal(localReference('https://external.test/a.png','article.md',records,config),null);
 const refs=articleReferences('cover: /images/文章/图.png\n![](/images/文章/图.png)\n<img src="/images/文章/图.png">');assert.equal(refs.length,3);
});
test('upload paths reject traversal, device names and unsafe imports before writing',()=>{
 for(const name of ['..','../escape','x/y','x\\y','CON','NUL.png','bad.','bad '])assert.equal(safeSegment(name),false,name);
 assert.equal(safeSegment('可用的中文目录'),true);
 assert.throws(()=>importImages('../escape','test',[{name:'x.png',data:'eA=='}]));
 assert.throws(()=>importImages('物理学','test',[{name:'../x.png',data:'eA=='}]));
 assert.throws(()=>importImages('物理学','test',[{name:'x.exe',data:'eA=='}]));
});
