// Read-only provenance and corpus audit. It does not execute upstream code or
// modify posts. Corpus matches are observations, never a publication gate.
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { reviewMatches, moderationVersion } from '../services/community/src/moderation.js';
const lexicon=JSON.parse(readFileSync(new URL('../services/community/src/moderation-lexicon.json',import.meta.url),'utf8'));
if(process.argv[2]){
  const cache=new Map();
  for(const entry of lexicon.entries)for(const source of entry.sources){
    if(source==='本站补充')continue;
    if(!cache.has(source)){
      const text=execFileSync('git',['-C',process.argv[2],'show',`${lexicon.commit}:Vocabulary/${source}.txt`],{encoding:'utf8'});
      cache.set(source,new Set(text.split(/\r?\n/).map(s=>s.normalize('NFKC').trim().toLowerCase())));
    }
    if(!cache.get(source).has(entry.term))throw new Error(`Unverified source: ${source} / ${entry.term}`);
  }
  const license=execFileSync('git',['-C',process.argv[2],'show',`${lexicon.commit}:LICENSE`],{encoding:'utf8'});
  if(license.replace(/\r\n/g,'\n')!==readFileSync(new URL('../services/community/src/moderation-LICENSE.txt',import.meta.url),'utf8').replace(/\r\n/g,'\n'))throw new Error('License differs from upstream');
}
let checked=0;const hits=[];
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
  const path=new URL(encodeURIComponent(entry.name)+(entry.isDirectory()?'/':''),dir);
  if(entry.isDirectory()){walk(path);continue;}
  if(!entry.name.endsWith('.md'))continue;
  let text=readFileSync(path,'utf8');
  const front=text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if(front&&/^lang:\s*['"]?en/m.test(front[1]))continue;
  text=text.replace(/^---\s*\n[\s\S]*?\n---\s*\n/,'').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g,'').replace(/<[^>]+>|https?:\/\/\S+/g,'');
  checked++;const matches=reviewMatches(text);if(matches.length)hits.push({file:entry.name,terms:matches.map(m=>m.term)});
}}walk(new URL('../source/_posts/',import.meta.url));
console.log(JSON.stringify({version:moderationVersion,terms:lexicon.entries.length,upstreamVerified:!!process.argv[2],articlesChecked:checked,hits},null,2));
