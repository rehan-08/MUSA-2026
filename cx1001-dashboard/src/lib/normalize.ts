import type { Cluster, ClusterDetail, ClusterNote } from '../types';

/**
 * The backend's REST `GET /clusters` list endpoint returns `report_count`
 * (matching this dashboard's contract), but its websocket `cluster_updated`
 * payload broadcasts the same internal Cluster shape it uses everywhere
 * else, which carries `report_ids` (an array) instead - a genuine drift
 * between the two independently-specified contracts, not a dashboard bug.
 * This derives report_count from report_ids.length when report_count is
 * missing, and drops report_ids since this dashboard never needs it (and
 * shouldn't display raw report id lists anyway).
 */
export function normalizeCluster(raw: Record<string, unknown>): Cluster {
  return {
    cluster_id: raw.cluster_id as string,
    geohash_bucket: raw.geohash_bucket as string,
    time_window: raw.time_window as string,
    report_count: (raw.report_count as number | undefined) ?? (raw.report_ids as unknown[] | undefined)?.length ?? 0,
    diversity_score: raw.diversity_score as number,
    spread_score: raw.spread_score as number,
    confidence_score: raw.confidence_score as number,
    state: raw.state as Cluster['state'],
    updated_at: raw.updated_at as string,
  };
}

/**
 * The dashboard's contract calls these `category_breakdown` and a
 * `{date,count}[]` `timestamp_histogram`. The CX1001 backend's actual
 * response uses `category_counts`, and a histogram keyed by 2-hour window
 * strings ("YYYY-MM-DDTHH") rather than a date array. This adapter accepts
 * either shape so the dashboard works against the real API as-is, without
 * requiring the backend to change - it just aggregates windows into daily
 * counts, which is what "reports per day" means anyway.
 */
export function normalizeClusterDetail(raw: Record<string, unknown>): ClusterDetail {
  const categoryBreakdown =
    (raw.category_breakdown as ClusterDetail['category_breakdown'] | undefined) ??
    (raw.category_counts as ClusterDetail['category_breakdown'] | undefined) ??
    {};

  const histogram = normalizeHistogram(raw.timestamp_histogram);

  return {
    cluster_id: raw.cluster_id as string,
    geohash_bucket: raw.geohash_bucket as string,
    time_window: raw.time_window as string,
    report_count: (raw.report_count as number) ?? (raw.report_ids as unknown[] | undefined)?.length ?? 0,
    diversity_score: raw.diversity_score as number,
    spread_score: raw.spread_score as number,
    confidence_score: raw.confidence_score as number,
    state: raw.state as ClusterDetail['state'],
    updated_at: raw.updated_at as string,
    category_breakdown: categoryBreakdown,
    timestamp_histogram: histogram,
    notes: (raw.notes as ClusterNote[] | undefined) ?? [],
  };
}

function normalizeHistogram(raw: unknown): { date: string; count: number }[] {
  if (Array.isArray(raw)) {
    return raw as { date: string; count: number }[];
  }
  if (raw && typeof raw === 'object') {
    const byDate = new Map<string, number>();
    for (const [key, value] of Object.entries(raw as Record<string, number>)) {
      const date = key.slice(0, 10); // "YYYY-MM-DDTHH" -> "YYYY-MM-DD"
      byDate.set(date, (byDate.get(date) ?? 0) + value);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  }
  return [];
}
