import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { generateId } from './uuid';

export type ReportCategory = 'catcalling' | 'loitering' | 'unsafe_lighting' | 'other';

export interface QueuedReport {
  local_id: string;
  geohash: string;
  timestamp: string;
  category?: ReportCategory;
  /** Optional free-text detail, only offered alongside category 'other'. */
  note?: string;
  device_hash: string;
  synced: boolean;
}

interface ReporterDBSchema extends DBSchema {
  meta: {
    key: string;
    value: { key: string; value: string };
  };
  reports: {
    key: string;
    value: QueuedReport;
  };
}

const DB_NAME = 'cx1001-reporter';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ReporterDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ReporterDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ReporterDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('meta', { keyPath: 'key' });
        // `synced` is a boolean, which IndexedDB can't use as an index key,
        // so unsynced reports are found by scanning + filtering (the queue
        // is small - a handful to a few dozen reports on one person's phone).
        db.createObjectStore('reports', { keyPath: 'local_id' });
      },
    });
  }
  return dbPromise;
}

/** Reads the locally-generated anonymous device id, creating one on first launch. Never sent to the server as-is. */
export async function getOrCreateDeviceId(): Promise<string> {
  const db = await getDb();
  const existing = await db.get('meta', 'device_id');
  if (existing) return existing.value;

  const fresh = generateId();
  await db.put('meta', { key: 'device_id', value: fresh });
  return fresh;
}

/** Replaces the local device id with a fresh one, effectively "forgetting" prior reports from the backend's perspective. */
export async function regenerateDeviceId(): Promise<string> {
  const db = await getDb();
  const fresh = generateId();
  await db.put('meta', { key: 'device_id', value: fresh });
  return fresh;
}

export async function queueReport(report: QueuedReport): Promise<void> {
  const db = await getDb();
  await db.put('reports', report);
}

export async function updateReportCategory(localId: string, category: ReportCategory): Promise<void> {
  const db = await getDb();
  const existing = await db.get('reports', localId);
  if (!existing) return;
  await db.put('reports', { ...existing, category });
}

export async function updateReportNote(localId: string, note: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get('reports', localId);
  if (!existing) return;
  await db.put('reports', { ...existing, note });
}

export async function getUnsyncedReports(): Promise<QueuedReport[]> {
  const db = await getDb();
  const all = await db.getAll('reports');
  return all.filter((r) => !r.synced);
}

export async function markSynced(localId: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get('reports', localId);
  if (!existing) return;
  await db.put('reports', { ...existing, synced: true });
}

export async function getUnsyncedCount(): Promise<number> {
  const unsynced = await getUnsyncedReports();
  return unsynced.length;
}
