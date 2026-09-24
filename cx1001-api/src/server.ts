import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocketPlugin from '@fastify/websocket';
import { createDb } from './db/connection.js';
import { WebSocketHub } from './ws/hub.js';
import { ClusteringService } from './services/clustering.js';
import { AlertsService } from './services/alerts.js';
import { RateLimiter } from './services/ingestion.js';
import { registerReportRoutes } from './routes/reports.js';
import { registerClusterRoutes } from './routes/clusters.js';
import { registerAlertRoutes } from './routes/alerts.js';

const PORT = Number(process.env.PORT ?? 4000);
const DB_PATH = process.env.DB_PATH ?? './data/cx1001.db';
// EXTRA_ALLOWED_ORIGINS lets a LAN/phone demo add its own origin (e.g.
// http://192.168.1.23:5173) at start time without hardcoding anyone's IP
// into source: EXTRA_ALLOWED_ORIGINS="http://192.168.1.23:5173,http://192.168.1.23:5174"
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.EXTRA_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? []),
];

async function main() {
  const app = Fastify({ logger: true });

  const db = createDb(DB_PATH);
  const wsHub = new WebSocketHub();
  const clustering = new ClusteringService(db, wsHub);
  const alerts = new AlertsService(db);
  const rateLimiter = new RateLimiter(); // 5 req/60s per device_hash
  const ipRateLimiter = new RateLimiter(20, 60_000); // 20 req/60s per source IP - looser, since one IP can be many real reporters

  await app.register(cors, { origin: ALLOWED_ORIGINS });
  await app.register(websocketPlugin);

  app.get('/ws', { websocket: true }, (socket) => {
    wsHub.register(socket);
  });

  app.get('/health', async () => ({ status: 'ok' }));

  registerReportRoutes(app, { clustering, rateLimiter, ipRateLimiter });
  registerClusterRoutes(app, { clustering });
  registerAlertRoutes(app, { alerts });

  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`CX1001 API listening on http://localhost:${PORT} (ws at ws://localhost:${PORT}/ws)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
