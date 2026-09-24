import { useEffect, useState } from 'react';
import type { Alert, Cluster, ClusterDetail } from '../types';
import { dataSource } from '../lib/dataSource';
import { ScoreBarChart } from './ScoreBarChart';
import { TimestampHistogramChart } from './TimestampHistogramChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { ClusterNotes } from './ClusterNotes';

interface DetailPanelProps {
  cluster: Cluster;
  alert: Alert | undefined;
  onBack: () => void;
  onUpdateAlert: (alertId: string, status: Alert['status']) => Promise<void>;
}

const STATE_LABEL: Record<Cluster['state'], string> = {
  escalated_alert: 'Escalated alert',
  rising_pattern: 'Rising pattern',
  noise: 'Noise',
};

export function DetailPanel({ cluster, alert, onBack, onUpdateAlert }: DetailPanelProps) {
  const [detail, setDetail] = useState<ClusterDetail | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    dataSource.fetchClusterDetail(cluster.cluster_id).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [cluster.cluster_id]);

  const handleUpdate = async (status: Alert['status']) => {
    if (!alert) return;
    setBusy(true);
    try {
      await onUpdateAlert(alert.alert_id, status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <button className="back-link" onClick={onBack}>
          &larr; Back to list
        </button>
        <h2>
          <span className={`detail-state-label ${cluster.state}`}>{STATE_LABEL[cluster.state]}</span>
        </h2>
        <div className="detail-meta-row">
          {cluster.geohash_bucket} &middot; {cluster.report_count} reports &middot; updated{' '}
          {new Date(cluster.updated_at).toLocaleTimeString()}
        </div>
      </div>

      <div className="detail-body">
        <section className="detail-section">
          <h3>Confidence breakdown</h3>
          <ScoreBarChart cluster={cluster} />
          <p className="alert-status-note">
            Dashed lines mark the gate thresholds: 0.4 (rising) and 0.7 (escalate to alert).
          </p>
        </section>

        <section className="detail-section">
          <h3>Reports per day</h3>
          {detail ? <TimestampHistogramChart histogram={detail.timestamp_histogram} /> : <p className="alert-status-note">Loading…</p>}
        </section>

        <section className="detail-section">
          <h3>Category breakdown</h3>
          {detail ? <CategoryBreakdown breakdown={detail.category_breakdown} /> : <p className="alert-status-note">Loading…</p>}
        </section>

        <section className="detail-section">
          <h3>Detailed statements</h3>
          {detail ? <ClusterNotes notes={detail.notes} /> : <p className="alert-status-note">Loading…</p>}
        </section>

        {cluster.state === 'escalated_alert' && (
          <section className="detail-section">
            <h3>Alert</h3>
            {alert ? (
              alert.status === 'open' ? (
                <div className="alert-actions">
                  <button className="btn btn-primary" disabled={busy} onClick={() => handleUpdate('reviewed')}>
                    Mark reviewed
                  </button>
                  <button className="btn btn-outline" disabled={busy} onClick={() => handleUpdate('closed')}>
                    Close
                  </button>
                </div>
              ) : (
                <p className="alert-status-note">Status: {alert.status}</p>
              )
            ) : (
              <p className="alert-status-note">No open alert record found for this cluster yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
