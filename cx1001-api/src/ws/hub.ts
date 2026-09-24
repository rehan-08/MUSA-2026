import type { WebSocket } from 'ws';
import type { Cluster } from '../models/cluster.js';
import type { Alert } from '../models/alert.js';

export type BroadcastMessage =
  | { type: 'cluster_updated'; cluster: Cluster }
  | { type: 'alert_created'; alert: Alert };

export interface WsHub {
  broadcast(message: BroadcastMessage): void;
}

/** In-memory fan-out hub: tracks connected sockets and pushes JSON messages to all of them. */
export class WebSocketHub implements WsHub {
  private readonly sockets = new Set<WebSocket>();

  register(socket: WebSocket): void {
    this.sockets.add(socket);
    socket.on('close', () => this.sockets.delete(socket));
  }

  broadcast(message: BroadcastMessage): void {
    const payload = JSON.stringify(message);
    for (const socket of this.sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(payload);
      }
    }
  }
}

/** No-op hub for contexts without a live server (tests, seed script). */
export const noopHub: WsHub = { broadcast: () => {} };
