import type Database from 'better-sqlite3';

export type ClusterState = 'noise' | 'rising_pattern' | 'escalated_alert';

export interface Cluster {
  cluster_id: string;
  geohash_bucket: string;
  time_window: string;
  report_ids: string[];
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: ClusterState;
  updated_at: string;
}

/** Row shape as stored - report_ids is not a column, it's derived from the reports table. */
export interface ClusterRow {
  cluster_id: string;
  geohash_bucket: string;
  time_window: string;
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: ClusterState;
  updated_at: string;
}

export interface ClusterScoreUpdate {
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: ClusterState;
  updated_at: string;
}

export class ClusterRepository {
  constructor(private readonly db: Database.Database) {}

  findByGeohashBucket(geohashBucket: string): ClusterRow | undefined {
    return this.db
      .prepare(`SELECT * FROM clusters WHERE geohash_bucket = ?`)
      .get(geohashBucket) as ClusterRow | undefined;
  }

  findById(clusterId: string): ClusterRow | undefined {
    return this.db.prepare(`SELECT * FROM clusters WHERE cluster_id = ?`).get(clusterId) as
      | ClusterRow
      | undefined;
  }

  /**
   * Creates a cluster for a geohash_bucket the first time a report lands there.
   * `time_window` records the 2-hour window of the report that OPENED the
   * cluster (i.e. creation window) - it is metadata about the cluster's
   * origin, not a live aggregate; spread_score is what tracks how many
   * distinct windows the cluster's active reports actually touch.
   */
  create(params: { cluster_id: string; geohash_bucket: string; time_window: string; updated_at: string }): ClusterRow {
    this.db
      .prepare(
        `INSERT INTO clusters (cluster_id, geohash_bucket, time_window, diversity_score, spread_score, confidence_score, state, updated_at)
         VALUES (@cluster_id, @geohash_bucket, @time_window, 0, 0, 0, 'noise', @updated_at)`
      )
      .run(params);
    return this.findById(params.cluster_id)!;
  }

  updateScores(clusterId: string, update: ClusterScoreUpdate): ClusterRow {
    this.db
      .prepare(
        `UPDATE clusters SET diversity_score = @diversity_score, spread_score = @spread_score,
           confidence_score = @confidence_score, state = @state, updated_at = @updated_at
         WHERE cluster_id = @cluster_id`
      )
      .run({ ...update, cluster_id: clusterId });
    return this.findById(clusterId)!;
  }

  list(state?: ClusterState): ClusterRow[] {
    if (state) {
      return this.db.prepare(`SELECT * FROM clusters WHERE state = ? ORDER BY updated_at DESC`).all(state) as ClusterRow[];
    }
    return this.db.prepare(`SELECT * FROM clusters ORDER BY updated_at DESC`).all() as ClusterRow[];
  }
}
