import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db.js';
import { createVisits } from '../src/visits.js';

test('visits persist, deduplicate browsers and retries, and keep a stable start date', t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'apc-visits-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'test.sqlite');
  let db = openDatabase(file), time = Date.parse('2026-10-26T04:00:00Z');
  const config = { secret: 'test', topics: new Set(['/articles/one', '/articles/two']), now: () => time };
  let visits = createVisits(db, config);
  assert.equal(visits.read('/').startedAt, null);
  const first = { topic: '/articles/one', visitorId: randomUUID(), viewId: randomUUID() };
  assert.deepEqual(visits.record(first), visits.record(first));
  assert.equal(visits.read(first.topic).pageViews, 1);
  time += 1000;
  visits.record({ ...first, topic: '/articles/two', viewId: randomUUID() });
  const second = visits.record({ ...first, visitorId: randomUUID(), viewId: randomUUID() });
  assert.equal(second.siteVisitors, 2); assert.equal(second.siteViews, 3); assert.equal(second.pageViews, 2);
  assert.equal(second.startedAt, '2026-10-26T04:00:00.000Z');
  assert.equal(JSON.stringify(db.prepare('SELECT * FROM visit_browsers').all()).includes(first.visitorId), false);
  db.close(); db = openDatabase(file); visits = createVisits(db, config);
  try {
    assert.deepEqual(visits.read(first.topic), second);
    assert.deepEqual(visits.record(first), second);
    time += 86400001;
    visits.record({ ...first, viewId: randomUUID() });
    assert.equal(visits.read('/').siteVisitors, 2);
    assert.equal(db.prepare('SELECT count(*) n FROM visit_receipts').get().n, 1);
    assert.equal(db.prepare('SELECT count(*) n FROM users').get().n, 0);
  } finally { db.close(); }
});

test('rejects unknown pages, tracking query strings and invalid identities without changing counters', () => {
  const db = openDatabase(':memory:');
  try {
    const visits = createVisits(db, { secret: 'test', topics: new Set(['/articles/one']), now: Date.now });
    const data = { topic: '/', visitorId: randomUUID(), viewId: randomUUID() };
    for (const topic of ['//evil.test', '/articles/unknown', '/articles/one?email=x', '/articles/one#x', null]) assert.throws(() => visits.record({ ...data, topic }));
    for (const visitorId of ['', 'alice@example.com', null, 17]) assert.throws(() => visits.record({ ...data, visitorId }));
    assert.throws(() => visits.record({ ...data, viewId: 'invalid' }));
    assert.equal(visits.read('/').startedAt, null);
  } finally { db.close(); }
});
