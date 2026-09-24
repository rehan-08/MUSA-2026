import ngeohash from 'ngeohash';
import type { Alert, Cluster, ClusterDetail, ClusterNote, ReportCategory } from '../types';

/**
 * Six sample clusters around central Mumbai, scored to match the real
 * backend's sequential gate logic (not just plausible-looking numbers):
 *   - escalated_alert: diversity >= 0.6 AND all 3 time windows touched
 *     (spread = 1.0) - and once both gates clear, confidence lands >= 0.7
 *     almost by construction, which is the actual anti-gaming property of
 *     the C = 0.4D + 0.4S + 0.2V formula.
 *   - rising_pattern: diversity clears 0.6, but spread hasn't reached 3
 *     distinct time windows yet - so confidence is correctly 0 (the real
 *     engine never computes it once gate 2 stops the pipeline). This is the
 *     realistic "genuine pattern still building, or a tight brigade burst"
 *     state, not an invented in-between score.
 *   - noise: diversity is below 0.6 - one device (or a couple) doing most
 *     of the "reporting".
 */

interface FixtureSeed {
  cluster_id: string;
  label: string;
  lat: number;
  lon: number;
  report_count: number;
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: Cluster['state'];
  updated_at: string;
  categories: Partial<Record<ReportCategory, number>>;
  histogram: { date: string; count: number }[];
  notes?: ClusterNote[];
}

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const SEEDS: FixtureSeed[] = [
  {
    cluster_id: 'a1111111-1111-4111-8111-111111111111',
    label: 'Marine Drive',
    lat: 18.9432,
    lon: 72.8235,
    report_count: 12,
    diversity_score: 0.83,
    spread_score: 1,
    confidence_score: 0.9,
    state: 'escalated_alert',
    updated_at: new Date(now - 4 * 60 * 1000).toISOString(),
    categories: { catcalling: 5, loitering: 3, unsafe_lighting: 3, other: 1 },
    histogram: [
      { date: daysAgo(5), count: 3 },
      { date: daysAgo(3), count: 4 },
      { date: daysAgo(1), count: 3 },
      { date: daysAgo(0), count: 2 },
    ],
    notes: [
      {
        category: 'other',
        timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
        note: 'A group has been following women walking alone along the promenade after sunset, then backing off when anyone else is nearby.',
      },
    ],
  },
  {
    cluster_id: 'a2222222-2222-4222-8222-222222222222',
    label: 'Dadar Station (W)',
    lat: 19.0176,
    lon: 72.8438,
    report_count: 9,
    diversity_score: 0.78,
    spread_score: 1,
    confidence_score: 0.86,
    state: 'escalated_alert',
    updated_at: new Date(now - 40 * 60 * 1000).toISOString(),
    categories: { loitering: 4, unsafe_lighting: 3, other: 2 },
    histogram: [
      { date: daysAgo(6), count: 2 },
      { date: daysAgo(4), count: 3 },
      { date: daysAgo(2), count: 2 },
      { date: daysAgo(0), count: 2 },
    ],
    notes: [
      { category: 'other', timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'CCTV camera near the west exit looks like it has been broken for a while.' },
      { category: 'other', timestamp: new Date(now - 40 * 60 * 1000).toISOString(), note: 'Ticket counter staff left early again, exit was unattended and poorly lit.' },
    ],
  },
  {
    cluster_id: 'b1111111-1111-4111-8111-111111111111',
    label: 'Bandra Reclamation',
    lat: 19.05,
    lon: 72.82,
    report_count: 6,
    diversity_score: 0.83,
    spread_score: 0.6667,
    confidence_score: 0,
    state: 'rising_pattern',
    updated_at: new Date(now - 90 * 60 * 1000).toISOString(),
    categories: { catcalling: 3, loitering: 2, other: 1 },
    histogram: [
      { date: daysAgo(2), count: 3 },
      { date: daysAgo(1), count: 3 },
    ],
  },
  {
    cluster_id: 'b2222222-2222-4222-8222-222222222222',
    label: 'Andheri Station',
    lat: 19.1197,
    lon: 72.8468,
    report_count: 5,
    diversity_score: 0.6,
    spread_score: 0.3333,
    confidence_score: 0,
    state: 'rising_pattern',
    updated_at: new Date(now - 20 * 60 * 1000).toISOString(),
    categories: { unsafe_lighting: 3, other: 2 },
    histogram: [{ date: daysAgo(0), count: 5 }],
  },
  {
    cluster_id: 'c1111111-1111-4111-8111-111111111111',
    label: 'Kurla',
    lat: 19.0728,
    lon: 72.8826,
    report_count: 8,
    diversity_score: 0.125,
    spread_score: 0,
    confidence_score: 0,
    state: 'noise',
    updated_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    categories: { loitering: 8 },
    histogram: [
      { date: daysAgo(3), count: 4 },
      { date: daysAgo(1), count: 4 },
    ],
  },
  {
    cluster_id: 'c2222222-2222-4222-8222-222222222222',
    label: 'Powai',
    lat: 19.1197,
    lon: 72.9051,
    report_count: 7,
    diversity_score: 0.286,
    spread_score: 0,
    confidence_score: 0,
    state: 'noise',
    updated_at: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
    categories: { other: 7 },
    histogram: [{ date: daysAgo(2), count: 7 }],
  },
];

function toCluster(seed: FixtureSeed): Cluster {
  return {
    cluster_id: seed.cluster_id,
    geohash_bucket: ngeohash.encode(seed.lat, seed.lon, 8),
    time_window: seed.histogram[seed.histogram.length - 1]?.date ?? daysAgo(0),
    report_count: seed.report_count,
    diversity_score: seed.diversity_score,
    spread_score: seed.spread_score,
    confidence_score: seed.confidence_score,
    state: seed.state,
    updated_at: seed.updated_at,
  };
}

function toDetail(seed: FixtureSeed): ClusterDetail {
  return {
    ...toCluster(seed),
    category_breakdown: seed.categories,
    timestamp_histogram: seed.histogram,
    notes: seed.notes ?? [],
  };
}

export const sampleClusters: Cluster[] = SEEDS.map(toCluster);
export const sampleClusterDetails: Record<string, ClusterDetail> = Object.fromEntries(
  SEEDS.map((seed) => [seed.cluster_id, toDetail(seed)])
);

export const sampleAlerts: Alert[] = SEEDS.filter((s) => s.state === 'escalated_alert').map((seed, i) => ({
  alert_id: `e${i === 0 ? '1111111-1111-4111-8111-111111111111' : '2222222-2222-4222-8222-222222222222'}`,
  cluster_id: seed.cluster_id,
  escalated_at: seed.updated_at,
  status: 'open',
  cluster_summary: {
    geohash_bucket: ngeohash.encode(seed.lat, seed.lon, 8),
    confidence_score: seed.confidence_score,
    report_count: seed.report_count,
  },
}));

export { SEEDS as sampleSeeds };
