import type { FastifyInstance } from 'fastify';
import { CONFIG } from '../lib/config';

export function registerStreamRoutes(app: FastifyInstance) {
  app.get('/api/stream/url', async () => {
    return { url: CONFIG.hlsUrl };
  });
}
