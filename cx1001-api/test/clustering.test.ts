import { describe, it, expect, beforeEach } from 'vitest';
import type Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { createDb } from '../src/db/connection.js';
import { ClusteringService } from '../src/services/clustering.js';
import { noopHub } from '../src/ws/hub.js';
import type { Alert } from '../src/models/alert.js';

function hash(label: string): string {
  return createHash('sha256').update(label).digest('hex');
}

describe('ClusteringService', () => {
  let db: Database.Database;
  let clustering: ClusteringService;

  beforeEach(() => {
    db = createDb(':memory:');
    clustering = new ClusteringService(db, noopHub);
  });

  it('creates a new cluster on first report to a geohash_bucket', () => {
    const result = clustering.ingestReport({
      geohash: 'tdr1qbrn',
      timestamp: '2026-09-20T08:00:00.000Z',
      device_hash: hash('d1'),
    });
    expect(result.cluster.geohash_bucket).toBe('tdr1qbrn');
    expect(result.cluster.report_ids).toHaveLength(1);
    // a single report is 100% diverse (1/1 devices) so it clears gate 1, but
    // touches only one time window so it fails gate 2 -> rising_pattern.
    expect(result.cluster.state).toBe('rising_pattern');
  });

  it('reuses the same cluster for reports in the same 8-char geohash bucket, even with extra precision', () => {
    clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:00:00.000Z', device_hash: hash('d1') });
    const second = clustering.ingestReport({ geohash: 'tdr1qbrnxx', timestamp: '2026-09-20T08:05:00.000Z', device_hash: hash('d2') });
    expect(second.cluster.report_ids).toHaveLength(2);
  });

  it('creates separate clusters for different geohash buckets', () => {
    const a = clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:00:00.000Z', device_hash: hash('d1') });
    const b = clustering.ingestReport({ geohash: 'zzzzzzzz', timestamp: '2026-09-20T08:00:00.000Z', device_hash: hash('d2') });
    expect(a.cluster.cluster_id).not.toBe(b.cluster.cluster_id);
  });

  it('recomputes scores from scratch on every new report', () => {
    clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:00:00.000Z', device_hash: hash('same') });
    const second = clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:05:00.000Z', device_hash: hash('same') });
    // both reports from the same device -> diversity stays low regardless of report count
    expect(second.cluster.diversity_score).toBe(0.5);
    expect(second.cluster.state).toBe('noise');
  });

  it('creates an alert exactly once when a cluster first reaches escalated_alert, not on subsequent reports', () => {
    const geohash = 'tdr1qbrn';
    const devices = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'].map(hash);
    const timestamps = [
      '2026-09-01T08:00:00.000Z',
      '2026-09-01T09:00:00.000Z',
      '2026-09-02T14:00:00.000Z',
      '2026-09-02T15:00:00.000Z',
      '2026-09-03T20:00:00.000Z',
      '2026-09-03T21:00:00.000Z',
      '2026-09-04T08:00:00.000Z',
      '2026-09-04T09:00:00.000Z',
    ];

    let lastResult;
    const alertsSeen: Alert[] = [];
    for (let i = 0; i < devices.length; i++) {
      lastResult = clustering.ingestReport({ geohash, timestamp: timestamps[i], device_hash: devices[i] });
      if (lastResult.alert) alertsSeen.push(lastResult.alert);
    }
    expect(lastResult!.cluster.state).toBe('escalated_alert');
    // the cluster may cross the escalation threshold before the final report;
    // what matters is it happened exactly once across the whole sequence.
    expect(alertsSeen).toHaveLength(1);

    // one more report to the already-escalated cluster should not create a second alert
    const extra = clustering.ingestReport({ geohash, timestamp: '2026-09-04T09:30:00.000Z', device_hash: hash('d1') });
    expect(extra.alert).toBeNull();
  });

  it('getClusterDetail returns category counts and a timestamp histogram without device hashes', () => {
    clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:00:00.000Z', category: 'catcalling', device_hash: hash('d1') });
    const { cluster } = clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T09:00:00.000Z', category: 'loitering', device_hash: hash('d2') });
    const detail = clustering.getClusterDetail(cluster.cluster_id)!;
    expect(detail.category_counts).toEqual({ catcalling: 1, loitering: 1 });
    expect(Object.values(detail.timestamp_histogram).reduce((a, b) => a + b, 0)).toBe(2);
    expect(JSON.stringify(detail)).not.toContain(hash('d1'));
  });

  it('getClusterDetail includes notes only for reports that had one, still without device hashes', () => {
    clustering.ingestReport({ geohash: 'tdr1qbrn', timestamp: '2026-09-20T08:00:00.000Z', category: 'catcalling', device_hash: hash('d1') });
    const { cluster } = clustering.ingestReport({
      geohash: 'tdr1qbrn',
      timestamp: '2026-09-20T09:00:00.000Z',
      category: 'other',
      note: 'Streetlight has been out for a week near the crossing.',
      device_hash: hash('d2'),
    });
    const detail = clustering.getClusterDetail(cluster.cluster_id)!;
    expect(detail.notes).toEqual([
      { category: 'other', timestamp: '2026-09-20T09:00:00.000Z', note: 'Streetlight has been out for a week near the crossing.' },
    ]);
    expect(JSON.stringify(detail)).not.toContain(hash('d2'));
  });
});
