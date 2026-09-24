import type { Alert, AlertStatus, Cluster, ClusterDetail, ClusterState, DataSource, WsMessage } from '../types';
import { sampleAlerts, sampleClusterDetails, sampleClusters } from '../fixtures/sampleClusters';

const TICK_MS = 8000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function bumpHistogram(histogram: { date: string; count: number }[]): { date: string; count: number }[] {
  const today = new Date().toISOString().slice(0, 10);
  const last = histogram[histogram.length - 1];
  if (last && last.date === today) {
    return [...histogram.slice(0, -1), { ...last, count: last.count + 1 }];
  }
  return [...histogram, { date: today, count: 1 }];
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * In-memory mock backend: serves the static fixtures over the same
 * DataSource interface as the real API, and simulates the websocket by
 * nudging a random rising_pattern cluster every ~8s using the SAME gate
 * formula the real engine uses (see cx1001-api's scoring engine) - spread
 * climbs toward 1.0 report by report, and confidence only appears once
 * spread actually clears the gate, at which point it typically jumps
 * straight past 0.7 and the cluster flips to escalated_alert. That's not a
 * simplification - it's how the real anti-gaming formula behaves once both
 * gates pass.
 */
export class MockDataSource implements DataSource {
  private clusters = new Map<string, Cluster>(sampleClusters.map((c) => [c.cluster_id, c]));
  private details = new Map<string, ClusterDetail>(Object.entries(sampleClusterDetails));
  private alerts = new Map<string, Alert>(sampleAlerts.map((a) => [a.alert_id, a]));
  private listeners = new Set<(msg: WsMessage) => void>();
  private timer: number | undefined;

  async fetchClusters(state?: ClusterState): Promise<Cluster[]> {
    await delay(150);
    const all = [...this.clusters.values()];
    return state ? all.filter((c) => c.state === state) : all;
  }

  async fetchClusterDetail(id: string): Promise<ClusterDetail> {
    await delay(150);
    const detail = this.details.get(id);
    if (!detail) throw new Error(`Unknown mock cluster: ${id}`);
    return detail;
  }

  async fetchAlerts(status?: AlertStatus): Promise<Alert[]> {
    await delay(150);
    const all = [...this.alerts.values()];
    return status ? all.filter((a) => a.status === status) : all;
  }

  async updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
    await delay(150);
    const existing = this.alerts.get(id);
    if (!existing) throw new Error(`Unknown mock alert: ${id}`);
    const updated: Alert = { ...existing, status };
    this.alerts.set(id, updated);
    return updated;
  }

  subscribe(onMessage: (msg: WsMessage) => void, onStatusChange?: (connected: boolean) => void): () => void {
    this.listeners.add(onMessage);
    this.ensureSimulatorRunning();
    onStatusChange?.(true);
    return () => {
      this.listeners.delete(onMessage);
      if (this.listeners.size === 0) this.stopSimulator();
    };
  }

  private ensureSimulatorRunning() {
    if (this.timer !== undefined) return;
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  private stopSimulator() {
    window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private emit(msg: WsMessage) {
    for (const listener of this.listeners) listener(msg);
  }

  private tick() {
    const risingIds = [...this.clusters.values()].filter((c) => c.state === 'rising_pattern').map((c) => c.cluster_id);
    if (risingIds.length === 0) return;

    const id = risingIds[Math.floor(Math.random() * risingIds.length)];
    const cluster = this.clusters.get(id);
    const detail = this.details.get(id);
    if (!cluster || !detail) return;

    const nextSpread = Math.min(1, cluster.spread_score + (0.2 + Math.random() * 0.2));
    const nextCount = cluster.report_count + 1;
    const nextDiversity = Math.min(1, Math.max(0.6, cluster.diversity_score + (Math.random() * 0.06 - 0.02)));

    let nextConfidence = 0;
    let nextState: ClusterState = 'rising_pattern';
    if (nextSpread >= 1) {
      const volume = Math.min(1, Math.log2(1 + nextCount) / Math.log2(21));
      nextConfidence = round4(0.4 * nextDiversity + 0.4 * nextSpread + 0.2 * volume);
      nextState = nextConfidence >= 0.7 ? 'escalated_alert' : nextConfidence >= 0.4 ? 'rising_pattern' : 'noise';
    }

    const updatedCluster: Cluster = {
      ...cluster,
      report_count: nextCount,
      diversity_score: round4(nextDiversity),
      spread_score: round4(nextSpread),
      confidence_score: nextConfidence,
      state: nextState,
      updated_at: new Date().toISOString(),
    };
    this.clusters.set(id, updatedCluster);

    const updatedDetail: ClusterDetail = {
      ...detail,
      ...updatedCluster,
      timestamp_histogram: bumpHistogram(detail.timestamp_histogram),
    };
    this.details.set(id, updatedDetail);

    this.emit({ type: 'cluster_updated', cluster: updatedCluster });

    if (nextState === 'escalated_alert' && cluster.state !== 'escalated_alert') {
      const alert: Alert = {
        alert_id: crypto.randomUUID(),
        cluster_id: id,
        escalated_at: updatedCluster.updated_at,
        status: 'open',
        cluster_summary: {
          geohash_bucket: updatedCluster.geohash_bucket,
          confidence_score: updatedCluster.confidence_score,
          report_count: updatedCluster.report_count,
        },
      };
      this.alerts.set(alert.alert_id, alert);
      this.emit({ type: 'alert_created', alert });
    }
  }
}
