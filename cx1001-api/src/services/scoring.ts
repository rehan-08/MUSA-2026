import type { ClusterState } from '../models/cluster.js';

export const ROLLING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Floors an ISO timestamp to its 2-hour bucket start, expressed as the
 * `YYYY-MM-DDTHH` of the bucket's first (even) hour, e.g.
 *   2026-09-20T15:23:11Z -> "2026-09-20T14"   (hours 14-15 bucket)
 *   2026-09-20T08:00:00Z -> "2026-09-20T08"   (hours 08-09 bucket)
 * Always computed in UTC so bucketing is stable regardless of server
 * timezone. The spread_score's "distinct time windows" count is defined as
 * the number of distinct strings this function returns across a cluster's
 * active reports, so any change here changes scoring behavior.
 */
export function floorToTwoHourWindow(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = d.getUTCHours();
  const evenHour = hour - (hour % 2);
  return `${year}-${month}-${day}T${String(evenHour).padStart(2, '0')}`;
}

export interface ScoringReport {
  device_hash: string;
  timestamp: string;
}

/**
 * Given the set of reports currently "active" in a cluster (already filtered
 * to the rolling 7-day lookback), returns those still within `ROLLING_WINDOW_MS`
 * of the most recent report among them. Reports older than that fall out of
 * the cluster's live scoring set even though their rows remain in the DB.
 */
export function filterToRollingWindow<T extends { timestamp: string }>(reports: T[]): T[] {
  if (reports.length === 0) return [];
  const maxTs = Math.max(...reports.map((r) => Date.parse(r.timestamp)));
  const cutoff = maxTs - ROLLING_WINDOW_MS;
  return reports.filter((r) => Date.parse(r.timestamp) >= cutoff);
}

export interface ScoringResult {
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: ClusterState;
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Anti-gaming scoring engine. Evaluated as SEQUENTIAL GATES, not a single
 * weighted pass:
 *
 *   1. diversity_score D = unique device_hashes / total reports.
 *      D < 0.6 -> 'noise', STOP (spread/volume/confidence are not computed,
 *      reported as 0). Kills one device (or a few colluding devices)
 *      flooding a single spot - high volume, near-zero diversity.
 *
 *   2. spread_score S = min(1, distinct 2-hour time windows touched / 3).
 *      S < 1.0 -> 'rising_pattern', STOP (confidence not computed, reported
 *      as 0). Kills a coordinated brigade: many distinct devices, but all
 *      piling on inside one short burst - high diversity, zero spread.
 *
 *   3. Otherwise compute volume_score V = min(1, log2(1+n)/log2(1+20)) and
 *      confidence C = 0.4*D + 0.4*S + 0.2*V.
 *        C >= 0.7        -> 'escalated_alert'
 *        0.4 <= C < 0.7  -> 'rising_pattern'
 *        C < 0.4          -> 'noise' (defensive; shouldn't normally happen
 *                             once gates 1 & 2 have passed)
 *
 * Call this with the cluster's full active-report set every time - scores
 * are always recomputed from scratch, never incrementally updated.
 */
export function scoreCluster(reports: ScoringReport[]): ScoringResult {
  const total = reports.length;
  if (total === 0) {
    return { diversity_score: 0, spread_score: 0, confidence_score: 0, state: 'noise' };
  }

  const uniqueDevices = new Set(reports.map((r) => r.device_hash)).size;
  const D = round4(uniqueDevices / total);

  if (D < 0.6) {
    return { diversity_score: D, spread_score: 0, confidence_score: 0, state: 'noise' };
  }

  const uniqueWindows = new Set(reports.map((r) => floorToTwoHourWindow(r.timestamp))).size;
  const S = round4(Math.min(1, uniqueWindows / 3));

  if (S < 1.0) {
    return { diversity_score: D, spread_score: S, confidence_score: 0, state: 'rising_pattern' };
  }

  const V = Math.min(1, Math.log2(1 + total) / Math.log2(1 + 20));
  const C = round4(0.4 * D + 0.4 * S + 0.2 * V);

  let state: ClusterState;
  if (C >= 0.7) state = 'escalated_alert';
  else if (C >= 0.4) state = 'rising_pattern';
  else state = 'noise';

  return { diversity_score: D, spread_score: S, confidence_score: C, state };
}
