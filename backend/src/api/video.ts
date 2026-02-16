import type { FastifyInstance } from 'fastify';
import { createCoreClient } from '../grpc/coreClient.js';
import { ToggleSchema, CameraIdSchema } from '../lib/validation.js';
import { createLogger } from '../lib/log.js';
import { mapGrpcError } from '../lib/grpcError.js';

const logger = createLogger('video');

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('gRPC request timeout')), timeoutMs)
    ),
  ]);
}

export function registerVideoRoutes(app: FastifyInstance) {
  const client = createCoreClient();

  app.get('/api/v1/cameras/:cameraId/video/capabilities', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ capabilities: string[] }>((resolve, reject) =>
          client.GetVideoCapabilities({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetVideoCapabilities', { camera_id: params.cameraId, capabilities: res.capabilities ?? [] });
      return { capabilities: res.capabilities ?? [] };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/video/capabilities/:capability', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const body = ToggleSchema.parse((req as any).body);
      const capability = String((req.params as any).capability ?? '').trim();

      if (!capability) {
        return reply.status(400).send({ error: 'Validation failed', details: [{ path: ['capability'], message: 'capability is required' }] });
      }

      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetVideoCapabilityState(
            { camera_id: params.cameraId, capability, enable: body.enable },
            (err: any) => (err ? reject(err) : resolve(null))
          )
        )
      );
      logger.info('SetVideoCapabilityState', { camera_id: params.cameraId, capability, enable: body.enable });

      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/video/capabilities/:capability', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const capability = String((req.params as any).capability ?? '').trim();

      if (!capability) {
        return reply.status(400).send({ error: 'Validation failed', details: [{ path: ['capability'], message: 'capability is required' }] });
      }

      const res = await withTimeout(
        new Promise<{ enable: boolean }>((resolve, reject) =>
          client.GetVideoCapabilityState(
            { camera_id: params.cameraId, capability },
            (err: any, data: any) => (err ? reject(err) : resolve(data))
          )
        )
      );
      logger.info('GetVideoCapabilityState', { camera_id: params.cameraId, capability, enable: res.enable });

      return { enable: res.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });
}
