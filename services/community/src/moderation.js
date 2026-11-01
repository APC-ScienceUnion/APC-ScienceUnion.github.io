import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// This is a review aid, not a legal classification. Load once, fail closed if
// the bundled dictionary is missing or malformed; never fetch it at runtime.
const raw = readFileSync(new URL('./moderation-lexicon.json', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const lexicon = JSON.parse(raw);
export const moderationVersion = createHash('sha256').update(raw).digest('hex').slice(0, 16);
const entries = lexicon.entries;
if (!Array.isArray(entries) || !entries.length || entries.length > 2000 ||
    entries.some(e => typeof e.term !== 'string' || !/^[\u4e00-\u9fff]{3,40}$/.test(e.term) || typeof e.category !== 'string') ||
    new Set(entries.map(e => e.term)).size !== entries.length) throw new Error('Invalid review dictionary');

export function reviewMatches(text) {
  // Fold full-width characters, whitespace and invisible format characters.
  // Do not strip all punctuation: aggressive joining causes science false hits.
  const normalized = text.normalize('NFKC').toLowerCase().replace(/[\s\p{Cf}]/gu, '');
  return entries.filter(e => normalized.includes(e.term)).slice(0, 20)
    .map(({ term, category }) => ({ term, category }));
}
