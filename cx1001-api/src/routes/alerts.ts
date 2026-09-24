import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AlertsService } from '../services/alerts.js';

const statusQuerySchema = z.object({
  status: z.enum(['open', 'reviewed', 'closed']).optional(),
});

const statusBodySchema = z.object({
  status: z.enum(['open', 'reviewed', 'closed']),
});

export function registerAlertRoutes(app: FastifyInstance, deps: { alerts: AlertsService }): void {
  app.get('/alerts', async (request, reply) => {
    const parsed = statusQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    }
    return reply.send(deps.alerts.list(parsed.data.status));
  });

  app.patch<{ Params: { id: string } }>('/alerts/:id', async (request, reply) => {
    const parsed = statusBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_request', details: parsed.error.flatten() });
    }
    if (!deps.alerts.findById(request.params.id)) {
      return reply.code(404).send({ error: 'not_found' });
    }
    const updated = deps.alerts.updateStatus(request.params.id, parsed.data.status);
    return reply.send(updated);
  });
}
