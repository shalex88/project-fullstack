import type { FastifyInstance } from 'fastify';
import { CONFIG } from '../lib/config.js';

export function registerStreamRoutes(app: FastifyInstance) {
  app.get('/api/stream/url', async () => {
    return { url: CONFIG.hlsUrl };
  });
}
