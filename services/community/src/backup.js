import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve(process.env.BACKUP_DIR || './backups');
mkdirSync(output, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(path.resolve(process.env.DATABASE_PATH || './data/community.sqlite'), { readOnly: true });
const file = path.join(output, `community-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
await backup(db, file);
db.close();
console.log(`Backup saved: ${file}`);
