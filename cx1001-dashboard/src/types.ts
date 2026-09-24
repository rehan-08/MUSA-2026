export type ClusterState = 'noise' | 'rising_pattern' | 'escalated_alert';
export type AlertStatus = 'open' | 'reviewed' | 'closed';
export type ReportCategory = 'catcalling' | 'loitering' | 'unsafe_lighting' | 'other';

export interface Cluster {
  cluster_id: string;
  geohash_bucket: string;
  time_window: string;
  report_count: number;
  diversity_score: number;
  spread_score: number;
  confidence_score: number;
  state: ClusterState;
  updated_at: string;
}

export interface ClusterNote {
  category: ReportCategory | null;
  timestamp: string;
  note: string;
}

export interface ClusterDetail extends Cluster {
  category_breakdown: Partial<Record<ReportCategory | 'other', number>>;
  timestamp_histogram: { date: string; count: number }[];
  notes: ClusterNote[];
}

export interface AlertClusterSummary {
  geohash_bucket: string;
  confidence_score: number;
  report_count: number;
}

export interface Alert {
  alert_id: string;
  cluster_id: string;
  escalated_at: string;
  status: AlertStatus;
  cluster_summary: AlertClusterSummary;
}

export type WsMessage = { type: 'cluster_updated'; cluster: Cluster } | { type: 'alert_created'; alert: Alert };

export interface DataSource {
  fetchClusters(state?: ClusterState): Promise<Cluster[]>;
  fetchClusterDetail(id: string): Promise<ClusterDetail>;
  fetchAlerts(status?: AlertStatus): Promise<Alert[]>;
  updateAlertStatus(id: string, status: AlertStatus): Promise<Alert>;
  /** Registers a listener for live updates; returns an unsubscribe function. */
  subscribe(onMessage: (msg: WsMessage) => void, onStatusChange?: (connected: boolean) => void): () => void;
}
