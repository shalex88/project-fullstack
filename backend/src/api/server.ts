import Fastify from 'fastify';
import cors from '@fastify/cors';
import { CONFIG } from '../lib/config.js';
import { registerCameraRoutes } from './camera.js';
import { registerStreamRoutes } from './stream.js';
import { registerVideoRoutes } from './video.js';
import { ZodError } from 'zod';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({ error: 'Validation failed', details: error.errors });
  } else {
    reply.status(500).send({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/health', async () => ({ status: 'ok' }));

registerStreamRoutes(app);
registerCameraRoutes(app);
registerVideoRoutes(app);

app
  .listen({ port: CONFIG.port, host: '0.0.0.0' })
  .then(() => app.log.info(`ApiServer listening on :${CONFIG.port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
