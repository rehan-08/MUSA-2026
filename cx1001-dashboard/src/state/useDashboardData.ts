import { useCallback, useEffect, useRef, useState } from 'react';
import { dataSource } from '../lib/dataSource';
import type { Alert, AlertStatus, Cluster } from '../types';

const NEW_BADGE_MS = 30_000;

export interface DashboardData {
  clusters: Cluster[];
  alerts: Alert[];
  newClusterIds: Set<string>;
  connected: boolean;
  loading: boolean;
  updateAlert: (id: string, status: AlertStatus) => Promise<void>;
}

/**
 * Single source of truth for the dashboard: does the initial fetch, then
 * applies every websocket (or mock-simulator) message as an in-place patch
 * to just the affected cluster/alert - never a full re-fetch - so the map
 * and sidebar only re-render the one marker/row that actually changed.
 */
export function useDashboardData(): DashboardData {
  const [clusters, setClusters] = useState<Record<string, Cluster>>({});
  const [alerts, setAlerts] = useState<Record<string, Alert>>({});
  const [newClusterIds, setNewClusterIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const badgeTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;

    Promise.all([dataSource.fetchClusters(), dataSource.fetchAlerts()])
      .then(([clusterList, alertList]) => {
        if (cancelled) return;
        setClusters(Object.fromEntries(clusterList.map((c) => [c.cluster_id, c])));
        setAlerts(Object.fromEntries(alertList.map((a) => [a.alert_id, a])));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = dataSource.subscribe((msg) => {
      if (msg.type === 'cluster_updated') {
        setClusters((prev) => ({ ...prev, [msg.cluster.cluster_id]: msg.cluster }));
      } else if (msg.type === 'alert_created') {
        setAlerts((prev) => ({ ...prev, [msg.alert.alert_id]: msg.alert }));

        const clusterId = msg.alert.cluster_id;
        setNewClusterIds((prev) => new Set(prev).add(clusterId));
        window.clearTimeout(badgeTimers.current.get(clusterId));
        const timerId = window.setTimeout(() => {
          setNewClusterIds((prev) => {
            const next = new Set(prev);
            next.delete(clusterId);
            return next;
          });
          badgeTimers.current.delete(clusterId);
        }, NEW_BADGE_MS);
        badgeTimers.current.set(clusterId, timerId);
      }
    }, setConnected);

    return () => {
      cancelled = true;
      unsubscribe();
      for (const timerId of badgeTimers.current.values()) window.clearTimeout(timerId);
      badgeTimers.current.clear();
    };
  }, []);

  const updateAlert = useCallback(async (id: string, status: AlertStatus) => {
    const updated = await dataSource.updateAlertStatus(id, status);
    setAlerts((prev) => ({ ...prev, [id]: updated }));
  }, []);

  return {
    clusters: Object.values(clusters),
    alerts: Object.values(alerts),
    newClusterIds,
    connected,
    loading,
    updateAlert,
  };
}
