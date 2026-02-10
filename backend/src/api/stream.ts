import type { FastifyInstance } from 'fastify';
import { getHlsUrl } from '../lib/config.js';
import { CameraIdSchema } from '../lib/validation.js';
import { ZodError } from 'zod';

export function registerStreamRoutes(app: FastifyInstance) {
  app.get('/api/v1/stream/:cameraId/url', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const url = getHlsUrl(params.cameraId);
      return { url };
    } catch (err: any) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: err.errors });
      }
      return reply.status(500).send({ error: 'INTERNAL_ERROR', message: err.message || 'Internal server error' });
    }
  });
}
