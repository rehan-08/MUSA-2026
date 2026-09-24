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

describe('anti-gaming scoring engine (proof-of-concept for judges)', () => {
  let db: Database.Database;
  let clustering: ClusteringService;

  beforeEach(() => {
    db = createDb(':memory:');
    clustering = new ClusteringService(db, noopHub);
  });

  it('single device flooding never escalates', () => {
    const geohash = 'tdr1qbrn';
    const device = hash('lone-spammer');

    let lastResult;
    for (let i = 0; i < 50; i++) {
      // spread across many distinct time windows/days so ONLY diversity is the blocker
      const timestamp = new Date(Date.UTC(2026, 8, 1 + Math.floor(i / 2), (i % 2) * 12, 0)).toISOString();
      lastResult = clustering.ingestReport({ geohash, timestamp, device_hash: device });
    }

    expect(lastResult!.cluster.state).toBe('noise');
    expect(lastResult!.cluster.diversity_score).toBeLessThan(0.6);
  });

  it('coordinated burst brigade never escalates', () => {
    const geohash = 'tdr1qc4m';
    const burstStartMs = Date.parse('2026-09-20T18:00:00.000Z');

    let lastResult;
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(burstStartMs + i * 20_000).toISOString(); // 30 devices within one 10-minute span
      lastResult = clustering.ingestReport({
        geohash,
        timestamp,
        device_hash: hash(`brigade-device-${i}`),
      });
    }

    expect(lastResult!.cluster.state).not.toBe('escalated_alert');
    expect(['noise', 'rising_pattern']).toContain(lastResult!.cluster.state);
    expect(lastResult!.cluster.spread_score).toBeLessThan(1.0);
  });

  it('genuine slow pattern escalates', () => {
    const geohash = 'tdr1qzzz';
    // 10 reports, 8 distinct devices, spread across 4 time windows over 5 simulated days
    const plan: { device: string; day: number; hour: number; minute?: number }[] = [
      { device: 'd1', day: 0, hour: 8 },
      { device: 'd2', day: 0, hour: 9 },
      { device: 'd3', day: 1, hour: 14 },
      { device: 'd4', day: 1, hour: 15 },
      { device: 'd5', day: 3, hour: 20 },
      { device: 'd6', day: 3, hour: 21 },
      { device: 'd7', day: 5, hour: 8 },
      { device: 'd8', day: 5, hour: 9 },
      { device: 'd1', day: 5, hour: 9, minute: 15 },
      { device: 'd2', day: 5, hour: 9, minute: 30 },
    ];

    let lastResult;
    const alertsSeen: Alert[] = [];
    for (const r of plan) {
      const timestamp = new Date(Date.UTC(2026, 8, 1 + r.day, r.hour, r.minute ?? 0)).toISOString();
      lastResult = clustering.ingestReport({ geohash, timestamp, device_hash: hash(r.device) });
      if (lastResult.alert) alertsSeen.push(lastResult.alert);
    }

    expect(lastResult!.cluster.state).toBe('escalated_alert');
    // the cluster may cross the escalation threshold partway through the
    // sequence (once it has enough diversity+spread); what matters for the
    // anti-gaming guarantee is that it escalated at least once and stayed there.
    expect(alertsSeen.length).toBeGreaterThanOrEqual(1);
  });
});
