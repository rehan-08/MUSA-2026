import { getUnsyncedReports, markSynced, type QueuedReport } from './db';

const SYNC_INTERVAL_MS = 30_000;

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

/**
 * Attempts to POST one queued report. A 201 marks it synced; anything else
 * (network failure, offline, 429 rate-limit, 4xx/5xx) is treated the same
 * way - the report stays in the queue, untouched, to retry on the next
 * sync pass. Nothing here should ever throw or surface an error to the UI.
 */
async function syncOne(report: QueuedReport): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        geohash: report.geohash,
        timestamp: report.timestamp,
        category: report.category,
        note: report.note,
        device_hash: report.device_hash,
      }),
    });
    if (res.status === 201) {
      await markSynced(report.local_id);
    }
    // any other status (429, 400, 5xx) - leave queued, retry later.
  } catch {
    // offline / network error - leave queued, retry later.
  }
}

export async function syncQueuedReports(): Promise<void> {
  const unsynced = await getUnsyncedReports();
  for (const report of unsynced) {
    await syncOne(report);
  }
}

/**
 * Runs syncQueuedReports() on network reconnect and on a 30s interval while
 * the app is open (plus once immediately, so a queue built up in a prior
 * offline session doesn't wait a full interval before the first attempt).
 * Returns a cleanup function.
 */
export function startBackgroundSync(onSyncAttempt?: () => void): () => void {
  const run = () => {
    onSyncAttempt?.();
    void syncQueuedReports();
  };

  run();
  const intervalId = window.setInterval(run, SYNC_INTERVAL_MS);
  window.addEventListener('online', run);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener('online', run);
  };
}
