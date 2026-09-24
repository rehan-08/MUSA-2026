import type Database from 'better-sqlite3';

export type ReportCategory = 'catcalling' | 'loitering' | 'unsafe_lighting' | 'other';

export interface Report {
  report_id: string;
  geohash: string;
  timestamp: string;
  category?: ReportCategory;
  /** Optional free-text detail, only meaningful alongside category 'other'. Never required, never contains device identity. */
  note?: string;
  device_hash: string;
}

/** Row shape as stored, including server-internal fields not on the public Report type. */
export interface ReportRow {
  report_id: string;
  cluster_id: string;
  geohash: string;
  geohash_bucket: string;
  timestamp: string;
  time_window: string;
  category: ReportCategory | null;
  note: string | null;
  device_hash: string;
  received_at: string;
}

export interface NewReportRow {
  report_id: string;
  cluster_id: string;
  geohash: string;
  geohash_bucket: string;
  timestamp: string;
  time_window: string;
  category: ReportCategory | null;
  note: string | null;
  device_hash: string;
  received_at: string;
}

export class ReportRepository {
  constructor(private readonly db: Database.Database) {}

  insert(row: NewReportRow): void {
    this.db
      .prepare(
        `INSERT INTO reports
          (report_id, cluster_id, geohash, geohash_bucket, timestamp, time_window, category, note, device_hash, received_at)
         VALUES (@report_id, @cluster_id, @geohash, @geohash_bucket, @timestamp, @time_window, @category, @note, @device_hash, @received_at)`
      )
      .run(row);
  }

  findAllForCluster(clusterId: string): ReportRow[] {
    return this.db
      .prepare(`SELECT * FROM reports WHERE cluster_id = ? ORDER BY timestamp ASC`)
      .all(clusterId) as ReportRow[];
  }

  /** Wall-clock count of reports received from this device in the last `windowMs` ms - used for ingestion rate limiting. */
  countRecentByDevice(deviceHash: string, sinceIso: string): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) as count FROM reports WHERE device_hash = ? AND received_at >= ?`)
      .get(deviceHash, sinceIso) as { count: number };
    return row.count;
  }
}
