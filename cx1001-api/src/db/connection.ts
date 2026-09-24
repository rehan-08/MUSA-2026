import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createSchema } from './schema.js';

/**
 * Opens (creating if needed) a SQLite database at `path` and ensures the
 * schema exists. Pass ':memory:' for an ephemeral db (used by tests).
 *
 * This is the one file that changes to swap the local dev store for
 * Postgres: replace better-sqlite3 with a pg client here and update the
 * repositories' SQL dialect (placeholders, RETURNING, etc.) - route and
 * service code never imports better-sqlite3 directly.
 */
export function createDb(path: string = './data/cx1001.db'): Database.Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new Database(path);
  createSchema(db);
  return db;
}
