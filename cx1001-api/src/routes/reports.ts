import type { FastifyInstance } from 'fastify';
import { reportBodySchema, clampReportTimestamp, RateLimiter } from '../services/ingestion.js';
import type { ClusteringService } from '../services/clustering.js';

export function registerReportRoutes(
  app: FastifyInstance,
  deps: { clustering: ClusteringService; rateLimiter: RateLimiter; ipRateLimiter: RateLimiter }
): void {
  app.post('/reports', async (request, reply) => {
    const parsed = reportBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    }

    const body = parsed.data;

    if (!deps.ipRateLimiter.allow(request.ip)) {
      return reply.code(429).send({ error: 'rate_limited', detail: 'Too many reports from this network in the last 60 seconds' });
    }
    if (!deps.rateLimiter.allow(body.device_hash)) {
      return reply.code(429).send({ error: 'rate_limited', detail: 'Too many reports from this device in the last 60 seconds' });
    }

    const result = deps.clustering.ingestReport({ ...body, timestamp: clampReportTimestamp(body.timestamp) });
    return reply.code(201).send({ report_id: result.report_id });
  });
}
