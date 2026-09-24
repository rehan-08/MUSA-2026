import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ClusteringService } from '../services/clustering.js';

const stateQuerySchema = z.object({
  state: z.enum(['noise', 'rising_pattern', 'escalated_alert']).optional(),
});

export function registerClusterRoutes(app: FastifyInstance, deps: { clustering: ClusteringService }): void {
  app.get('/clusters', async (request, reply) => {
    const parsed = stateQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    }
    const clusters = deps.clustering.listClusters(parsed.data.state);
    const withoutDeviceHashes = clusters.map(({ report_ids, ...rest }) => ({
      ...rest,
      report_count: report_ids.length,
    }));
    return reply.send(withoutDeviceHashes);
  });

  app.get<{ Params: { id: string } }>('/clusters/:id', async (request, reply) => {
    const detail = deps.clustering.getClusterDetail(request.params.id);
    if (!detail) {
      return reply.code(404).send({ error: 'not_found' });
    }
    return reply.send(detail);
  });
}
