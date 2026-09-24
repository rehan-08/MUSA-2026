import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { ClusterRepository, type Cluster, type ClusterState } from '../models/cluster.js';
import { ReportRepository, type ReportCategory, type ReportRow } from '../models/report.js';
import { AlertRepository, type Alert } from '../models/alert.js';
import { scoreCluster, filterToRollingWindow, floorToTwoHourWindow } from './scoring.js';
import type { WsHub } from '../ws/hub.js';

/**
 * Truncates a client-supplied geohash to an 8-character bucket.
 *
 * A geohash's prefix is exactly its coarser containing cell (that's the
 * defining property of the base32 geohash encoding), so taking the first 8
 * characters of an already-valid geohash IS the canonical ~50m cell - no
 * decode/re-encode round trip is needed, which also avoids floating point
 * edge cases at cell boundaries. If the client sends a shorter (coarser)
 * geohash than 8 chars we just use what we have, giving a larger cell.
 */
export function normalizeGeohashBucket(geohash: string, precision = 8): string {
  return geohash.toLowerCase().slice(0, precision);
}

export interface NewReportInput {
  geohash: string;
  timestamp?: string;
  category?: ReportCategory;
  note?: string;
  device_hash: string;
}

export interface IngestResult {
  report_id: string;
  cluster: Cluster;
  alert: Alert | null;
}

function toClusterDTO(row: { cluster_id: string; geohash_bucket: string; time_window: string; diversity_score: number; spread_score: number; confidence_score: number; state: ClusterState; updated_at: string }, activeReports: ReportRow[]): Cluster {
  return {
    cluster_id: row.cluster_id,
    geohash_bucket: row.geohash_bucket,
    time_window: row.time_window,
    report_ids: activeReports.map((r) => r.report_id),
    diversity_score: row.diversity_score,
    spread_score: row.spread_score,
    confidence_score: row.confidence_score,
    state: row.state,
    updated_at: row.updated_at,
  };
}

export class ClusteringService {
  private readonly clusterRepo: ClusterRepository;
  private readonly reportRepo: ReportRepository;
  private readonly alertRepo: AlertRepository;

  constructor(db: Database.Database, private readonly wsHub: WsHub) {
    this.clusterRepo = new ClusterRepository(db);
    this.reportRepo = new ReportRepository(db);
    this.alertRepo = new AlertRepository(db);
  }

  /**
   * Ingests one report: finds-or-creates the cluster for its geohash_bucket
   * (one cluster per location, accumulating reports/windows over a rolling
   * 7-day lookback - not one cluster per exact time window), appends the
   * report, and recomputes the cluster's score from scratch over its
   * currently-active (rolling-window) report set. Broadcasts over the
   * websocket hub when the cluster's state changes, and creates+broadcasts
   * an Alert the moment a cluster newly reaches 'escalated_alert'.
   */
  ingestReport(input: NewReportInput): IngestResult {
    const geohashBucket = normalizeGeohashBucket(input.geohash);
    const timestamp = input.timestamp ?? new Date().toISOString();
    const timeWindow = floorToTwoHourWindow(timestamp);
    const now = new Date().toISOString();
    const reportId = uuidv4();

    let clusterRow = this.clusterRepo.findByGeohashBucket(geohashBucket);
    const previousState: ClusterState | null = clusterRow?.state ?? null;

    if (!clusterRow) {
      clusterRow = this.clusterRepo.create({
        cluster_id: uuidv4(),
        geohash_bucket: geohashBucket,
        time_window: timeWindow,
        updated_at: now,
      });
    }

    this.reportRepo.insert({
      report_id: reportId,
      cluster_id: clusterRow.cluster_id,
      geohash: input.geohash,
      geohash_bucket: geohashBucket,
      timestamp,
      time_window: timeWindow,
      category: input.category ?? null,
      note: input.note ?? null,
      device_hash: input.device_hash,
      received_at: now,
    });

    const allReports = this.reportRepo.findAllForCluster(clusterRow.cluster_id);
    const activeReports = filterToRollingWindow(allReports);

    const scoring = scoreCluster(activeReports.map((r) => ({ device_hash: r.device_hash, timestamp: r.timestamp })));

    const updatedRow = this.clusterRepo.updateScores(clusterRow.cluster_id, {
      diversity_score: scoring.diversity_score,
      spread_score: scoring.spread_score,
      confidence_score: scoring.confidence_score,
      state: scoring.state,
      updated_at: now,
    });

    const clusterDTO = toClusterDTO(updatedRow, activeReports);

    let alert: Alert | null = null;
    if (scoring.state !== previousState) {
      this.wsHub.broadcast({ type: 'cluster_updated', cluster: clusterDTO });
    }
    if (scoring.state === 'escalated_alert' && previousState !== 'escalated_alert') {
      alert = this.alertRepo.create({
        alert_id: uuidv4(),
        cluster_id: clusterRow.cluster_id,
        escalated_at: now,
        notified_authority_id: null,
        status: 'open',
      });
      this.wsHub.broadcast({ type: 'alert_created', alert });
    }

    return { report_id: reportId, cluster: clusterDTO, alert };
  }

  getCluster(clusterId: string): Cluster | undefined {
    const row = this.clusterRepo.findById(clusterId);
    if (!row) return undefined;
    const activeReports = filterToRollingWindow(this.reportRepo.findAllForCluster(clusterId));
    return toClusterDTO(row, activeReports);
  }

  getClusterDetail(clusterId: string):
    | (Cluster & {
        category_counts: Record<string, number>;
        timestamp_histogram: Record<string, number>;
        notes: { category: ReportCategory | null; timestamp: string; note: string }[];
      })
    | undefined {
    const row = this.clusterRepo.findById(clusterId);
    if (!row) return undefined;
    const activeReports = filterToRollingWindow(this.reportRepo.findAllForCluster(clusterId));

    const category_counts: Record<string, number> = {};
    const timestamp_histogram: Record<string, number> = {};
    const notes: { category: ReportCategory | null; timestamp: string; note: string }[] = [];
    for (const r of activeReports) {
      const cat = r.category ?? 'other';
      category_counts[cat] = (category_counts[cat] ?? 0) + 1;
      timestamp_histogram[r.time_window] = (timestamp_histogram[r.time_window] ?? 0) + 1;
      if (r.note) notes.push({ category: r.category, timestamp: r.timestamp, note: r.note });
    }

    return { ...toClusterDTO(row, activeReports), category_counts, timestamp_histogram, notes };
  }

  listClusters(state?: ClusterState): Cluster[] {
    return this.clusterRepo.list(state).map((row) => {
      const activeReports = filterToRollingWindow(this.reportRepo.findAllForCluster(row.cluster_id));
      return toClusterDTO(row, activeReports);
    });
  }
}
