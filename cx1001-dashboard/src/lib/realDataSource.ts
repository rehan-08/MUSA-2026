import type { Alert, AlertStatus, Cluster, ClusterState, DataSource, WsMessage } from '../types';
import { normalizeCluster, normalizeClusterDetail } from './normalize';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4000/ws';
const RECONNECT_DELAY_MS = 2000;

function normalizeWsMessage(raw: { type: string; cluster?: Record<string, unknown>; alert?: Alert }): WsMessage {
  if (raw.type === 'cluster_updated' && raw.cluster) {
    return { type: 'cluster_updated', cluster: normalizeCluster(raw.cluster) };
  }
  if (raw.type === 'alert_created' && raw.alert) {
    return { type: 'alert_created', alert: raw.alert };
  }
  throw new Error(`Unrecognized websocket message: ${JSON.stringify(raw)}`);
}

export class RealDataSource implements DataSource {
  async fetchClusters(state?: ClusterState): Promise<Cluster[]> {
    const qs = state ? `?state=${state}` : '';
    const res = await fetch(`${API_URL}/clusters${qs}`);
    if (!res.ok) throw new Error(`GET /clusters failed: ${res.status}`);
    const raw: Record<string, unknown>[] = await res.json();
    return raw.map(normalizeCluster);
  }

  async fetchClusterDetail(id: string) {
    const res = await fetch(`${API_URL}/clusters/${id}`);
    if (!res.ok) throw new Error(`GET /clusters/${id} failed: ${res.status}`);
    return normalizeClusterDetail(await res.json());
  }

  async fetchAlerts(status?: AlertStatus): Promise<Alert[]> {
    const qs = status ? `?status=${status}` : '';
    const res = await fetch(`${API_URL}/alerts${qs}`);
    if (!res.ok) throw new Error(`GET /alerts failed: ${res.status}`);
    return res.json();
  }

  async updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
    const res = await fetch(`${API_URL}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`PATCH /alerts/${id} failed: ${res.status}`);
    return res.json();
  }

  subscribe(onMessage: (msg: WsMessage) => void, onStatusChange?: (connected: boolean) => void): () => void {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      socket = new WebSocket(WS_URL);
      socket.onopen = () => onStatusChange?.(true);
      socket.onmessage = (event) => {
        try {
          onMessage(normalizeWsMessage(JSON.parse(event.data)));
        } catch {
          // ignore malformed frames
        }
      };
      socket.onclose = () => {
        onStatusChange?.(false);
        if (stopped) return;
        reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };
      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }
}
