import type { Cluster, ClusterState } from '../types';

interface ClusterListProps {
  clusters: Cluster[];
  newClusterIds: Set<string>;
  selectedId: string | null;
  onSelect: (clusterId: string) => void;
  showNoise: boolean;
  onToggleNoise: (value: boolean) => void;
}

const STATE_ORDER: Record<ClusterState, number> = {
  escalated_alert: 0,
  rising_pattern: 1,
  noise: 2,
};

const STATE_LABEL: Record<ClusterState, string> = {
  escalated_alert: 'Escalated',
  rising_pattern: 'Rising pattern',
  noise: 'Noise',
};

function sortClusters(clusters: Cluster[]): Cluster[] {
  return [...clusters].sort((a, b) => {
    const orderDiff = STATE_ORDER[a.state] - STATE_ORDER[b.state];
    if (orderDiff !== 0) return orderDiff;
    if (b.confidence_score !== a.confidence_score) return b.confidence_score - a.confidence_score;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function ClusterList({ clusters, newClusterIds, selectedId, onSelect, showNoise, onToggleNoise }: ClusterListProps) {
  const visible = sortClusters(clusters.filter((c) => c.state !== 'noise' || showNoise));
  const escalatedCount = clusters.filter((c) => c.state === 'escalated_alert').length;
  const risingCount = clusters.filter((c) => c.state === 'rising_pattern').length;

  return (
    <>
      <div className="sidebar-header">
        <h2>Clusters</h2>
        <div className="detail-meta-row">
          {escalatedCount} escalated &middot; {risingCount} rising
        </div>
        <label className="noise-toggle">
          <input type="checkbox" checked={showNoise} onChange={(e) => onToggleNoise(e.target.checked)} />
          Show noise clusters (debug)
        </label>
      </div>
      <div className="cluster-list">
        {visible.length === 0 && <div className="cluster-list-empty">No clusters to show yet.</div>}
        {visible.map((cluster) => (
          <button
            key={cluster.cluster_id}
            className={`cluster-item${cluster.cluster_id === selectedId ? ' selected' : ''}`}
            onClick={() => onSelect(cluster.cluster_id)}
          >
            <div className="cluster-item-top">
              <span className="cluster-item-title">
                <span className={`state-dot ${cluster.state}`} />
                <span className="geohash">{cluster.geohash_bucket}</span>
              </span>
              {newClusterIds.has(cluster.cluster_id) && <span className="badge-new">NEW</span>}
            </div>
            <div className="cluster-item-meta">
              <span>{STATE_LABEL[cluster.state]}</span>
              <span>{cluster.report_count} reports</span>
              <span className="confidence-pill">C {cluster.confidence_score.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
