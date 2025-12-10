import type { FastifyInstance } from 'fastify';
import { createVideoClient } from '../grpc/videoClient.js';
import { ToggleSchema } from '../lib/validation.js';
import { createLogger } from '../lib/log.js';
import { mapGrpcError } from '../lib/grpcError.js';

const logger = createLogger('video');

export function registerVideoRoutes(app: FastifyInstance) {
  const client = createVideoClient();

  app.post('/api/video/stabilization', async (req: any, reply) => {
    try {
      const body = ToggleSchema.parse((req as any).body);

      if (body.enable) {
        await new Promise((resolve, reject) =>
          client.EnableOptionalElement({ element: 'myf2f' }, (err: any) => (err ? reject(err) : resolve(null)))
        );
        logger.info('EnableOptionalElement', { element: 'myf2f' });
      } else {
        await new Promise((resolve, reject) =>
          client.DisableOptionalElement({ element: 'myf2f' }, (err: any) => (err ? reject(err) : resolve(null)))
        );
        logger.info('DisableOptionalElement', { element: 'myf2f' });
      }

      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });
}
