'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cheerio=require('cheerio');
const root=path.resolve(__dirname,'../public');
const config=require('js-yaml').load(fs.readFileSync(path.resolve(__dirname,'../_config.yml'),'utf8'));
const enabled=config.community?.enable === true;
const read=file=>cheerio.load(fs.readFileSync(path.join(root,file),'utf8'));
for(const file of ['index.html','en/index.html']){const home=read(file);assert.equal(home('.apc-guestbook[data-topic="guestbook"]').length,Number(enabled));assert.equal(home('[data-community-users]').length,Number(enabled));assert.equal(home('#menus a[href$="/account/"]').length,Number(enabled));}
for(const file of ['account/index.html','en/account/index.html']){const $=read(file);assert.equal($('#apc-account').length,Number(enabled));assert.equal($('script[src="/js/community.js"]').length,Number(enabled));assert.equal($('link[href="/css/community.css"]').length,Number(enabled));if(!enabled)assert.match($('#page').text(),/暂未开放|not available yet/);}
const topics=new Set(JSON.parse(fs.readFileSync(path.join(root,'community-topics.json'),'utf8')).topics);
let count=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name.startsWith('.'))continue;const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(e.name.endsWith('.html')){const $=cheerio.load(fs.readFileSync(full,'utf8'));if($('#post article#article-container').length){assert.equal($('.apc-discussion').length,Number(enabled),full);if(enabled)assert.ok(topics.has($('.apc-discussion').attr('data-topic')),full);else assert.equal($('meta[name="community-api"]').length,0,full);count++;}}}}
walk(root);assert.ok(count>=294,`Expected all bilingual posts, found ${count}`);console.log(`Community ${enabled?'enabled':'disabled'} UI verified on ${count} article pages, account pages and home sidebars.`);
