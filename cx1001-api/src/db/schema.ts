import type Database from 'better-sqlite3';

/**
 * Creates all tables/indexes if they don't already exist. Safe to call on
 * every startup. Swapping to Postgres later means rewriting this file (and
 * connection.ts) with the equivalent DDL/driver - repositories and services
 * never see raw SQL from outside src/db, so nothing else changes.
 */
export function createSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS clusters (
      cluster_id        TEXT PRIMARY KEY,
      geohash_bucket     TEXT NOT NULL UNIQUE,
      time_window        TEXT NOT NULL,
      diversity_score    REAL NOT NULL DEFAULT 0,
      spread_score       REAL NOT NULL DEFAULT 0,
      confidence_score   REAL NOT NULL DEFAULT 0,
      state              TEXT NOT NULL DEFAULT 'noise',
      updated_at         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      report_id       TEXT PRIMARY KEY,
      cluster_id      TEXT NOT NULL REFERENCES clusters(cluster_id),
      geohash         TEXT NOT NULL,
      geohash_bucket  TEXT NOT NULL,
      timestamp       TEXT NOT NULL,
      time_window     TEXT NOT NULL,
      category        TEXT,
      note            TEXT,
      device_hash     TEXT NOT NULL,
      received_at     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reports_cluster ON reports(cluster_id);
    CREATE INDEX IF NOT EXISTS idx_reports_device_received ON reports(device_hash, received_at);

    CREATE TABLE IF NOT EXISTS alerts (
      alert_id               TEXT PRIMARY KEY,
      cluster_id              TEXT NOT NULL REFERENCES clusters(cluster_id),
      escalated_at             TEXT NOT NULL,
      notified_authority_id    TEXT,
      status                   TEXT NOT NULL DEFAULT 'open'
    );
    CREATE INDEX IF NOT EXISTS idx_alerts_cluster ON alerts(cluster_id);
  `);

  // Lightweight migration for pre-existing db files created before `note` existed.
  const columns = db.prepare(`PRAGMA table_info(reports)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === 'note')) {
    db.exec(`ALTER TABLE reports ADD COLUMN note TEXT`);
  }
}
