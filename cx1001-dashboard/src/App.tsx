import { lazy, Suspense, useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { ClusterList } from './components/ClusterList';
import { useDashboardData } from './state/useDashboardData';
import { USE_MOCK } from './lib/dataSource';

// Recharts (pulled in only by DetailPanel) is the single biggest slice of the
// bundle - code-split it so the map + cluster list are interactive without
// waiting on it, and it only loads the first time someone opens a cluster.
const DetailPanel = lazy(() => import('./components/DetailPanel').then((m) => ({ default: m.DetailPanel })));

function App() {
  const { clusters, alerts, newClusterIds, connected, loading, updateAlert } = useDashboardData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNoise, setShowNoise] = useState(false);

  const selectedCluster = useMemo(() => clusters.find((c) => c.cluster_id === selectedId) ?? null, [clusters, selectedId]);
  const selectedAlert = useMemo(
    () => alerts.find((a) => a.cluster_id === selectedId && a.status === 'open') ?? alerts.find((a) => a.cluster_id === selectedId),
    [alerts, selectedId]
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>CX1001 Authority Dashboard</h1>
          <div className="subtitle">Live safety-report clusters {USE_MOCK ? '(mock demo data)' : ''}</div>
        </div>
        <div className="connection-status">
          <span className={`connection-dot${connected ? '' : ' offline'}`} />
          {connected ? (USE_MOCK ? 'Simulating' : 'Live') : 'Connecting…'}
        </div>
      </header>

      <div className="main-layout">
        <MapView clusters={clusters} showNoise={showNoise} selectedId={selectedId} onSelect={setSelectedId} />
        <aside className="sidebar">
          {loading ? (
            <div className="loading-note">Loading clusters…</div>
          ) : selectedCluster ? (
            <Suspense fallback={<div className="loading-note">Loading cluster detail…</div>}>
              <DetailPanel
                cluster={selectedCluster}
                alert={selectedAlert}
                onBack={() => setSelectedId(null)}
                onUpdateAlert={updateAlert}
              />
            </Suspense>
          ) : (
            <ClusterList
              clusters={clusters}
              newClusterIds={newClusterIds}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showNoise={showNoise}
              onToggleNoise={setShowNoise}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
