import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function openDatabase(filename) {
  if (filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename, { timeout: 5000 });
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL,
      nickname_key TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_seed TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      created_at INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS codes (
      email TEXT NOT NULL,
      purpose TEXT NOT NULL CHECK(purpose IN ('register','reset','bind')),
      user_id TEXT NOT NULL DEFAULT '',
      digest TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(email,purpose,user_id)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      hits INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
      created_at INTEGER NOT NULL,
      deleted_at INTEGER,
      deleted_by TEXT REFERENCES users(id)
    ) STRICT;
    CREATE INDEX IF NOT EXISTS comments_topic ON comments(topic,id DESC) WHERE deleted_at IS NULL;
    PRAGMA user_version=1;
  `);
  return db;
}

export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const value = fn(); db.exec('COMMIT'); return value; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
