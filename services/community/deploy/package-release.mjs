// Assemble a secret-free release from an explicit allowlist. Never copy data/,
// .env files, development servers, tests or the working directory wholesale.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const source=fileURLToPath(new URL('../',import.meta.url));
const target=path.resolve(process.argv[2]||'');
if(!process.argv[2]||existsSync(target))throw new Error('Pass a new, nonexistent output directory.');
const files=[
  'package.json',
  ...['app','audit','authing-phone','backup','config','db','identity-config','identity-store','mail','moderation','reviews','security','server','visits'].map(name=>`src/${name}.js`),
  'src/moderation-lexicon.json','src/moderation-LICENSE.txt',
  ...['install.sh','community.service','backup.service','backup.timer','Caddyfile','Caddyfile.images-only','Caddyfile.staging'].map(name=>`deploy/${name}`)
];
const records=[];
for(const name of files){
  // All release files are text; Linux service scripts require LF line endings.
  const data=Buffer.from(readFileSync(path.join(source,name),'utf8').replace(/\r\n/g,'\n'));
  const destination=path.join(target,name);mkdirSync(path.dirname(destination),{recursive:true});
  writeFileSync(destination,data,{flag:'wx'});
  records.push({path:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
writeFileSync(path.join(target,'release-manifest.json'),JSON.stringify({version:1,files:records},null,2)+'\n',{flag:'wx'});
console.log(`Prepared ${records.length} allowlisted files in ${target}. No credentials or user database included.`);
