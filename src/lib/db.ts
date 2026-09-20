import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Article } from './schema';
import { environment } from './env';

let connection: Database.Database | undefined;
export function openDatabase(path: string): Database.Database {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  // Migration 001. Future migrations must increment user_version, never reset data.
  if (db.pragma('user_version', { simple: true }) === 0) {
    db.transaction(() => {
      db.exec(`CREATE TABLE articles (
        id TEXT PRIMARY KEY, source_site INTEGER, source_id INTEGER,
        slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT NOT NULL,
        content_html TEXT NOT NULL, image TEXT NOT NULL, image_alt TEXT NOT NULL,
        image_caption TEXT NOT NULL, metadata TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('draft','publish','future')),
        published_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        UNIQUE(source_site, source_id)
      );
      CREATE INDEX articles_public ON articles(status, published_at);
      CREATE TABLE deliveries (key TEXT PRIMARY KEY, digest TEXT NOT NULL, response TEXT NOT NULL, created_at TEXT NOT NULL);
      PRAGMA user_version = 1;`);
    })();
  }
  return db;
}
export function getDb(): Database.Database {
  return (connection ??= openDatabase(environment().DATABASE_PATH));
}
function hydrate(row: unknown): Article {
  const value = row as Article & { metadata: string };
  return { ...value, metadata: JSON.parse(value.metadata) };
}
export function listArticles(db = getDb()): Article[] {
  return db
    .prepare(
      "SELECT * FROM articles WHERE status IN ('publish','future') AND published_at <= ? ORDER BY published_at DESC, id ASC",
    )
    .all(new Date().toISOString())
    .map(hydrate);
}
export function findArticle(slug: string, db = getDb()): Article | undefined {
  const row = db
    .prepare(
      "SELECT * FROM articles WHERE slug = ? AND status IN ('publish','future') AND published_at <= ?",
    )
    .get(slug, new Date().toISOString());
  return row ? hydrate(row) : undefined;
}
