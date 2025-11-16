import type { FastifyInstance } from 'fastify';
import { createCameraClient } from '../grpc/client.js';
import { ZoomSetSchema, FocusSetSchema, ToggleSchema } from '../lib/validation.js';
import { createLogger } from '../lib/log.js';
import { mapGrpcError } from '../lib/grpcError.js';

const logger = createLogger('camera');

export function registerCameraRoutes(app: FastifyInstance) {
  const client = createCameraClient();

  app.get('/api/camera/zoom', async () => {
    const res = await new Promise<{ zoom: number }>((resolve, reject) =>
      client.GetZoom({}, (err: any, data: any) => (err ? reject(err) : resolve(data)))
    );
    logger.info('GetZoom', { zoom: res.zoom });
    return { zoom: res.zoom };
  });

  app.post('/api/camera/zoom', async (req: any) => {
    const body = ZoomSetSchema.parse((req as any).body);
    await new Promise((resolve, reject) =>
      client.SetZoom({ zoom: body.zoom }, (err: any) => (err ? reject(err) : resolve(null)))
    );
    logger.info('SetZoom', { zoom: body.zoom });
    return { zoom: body.zoom };
  });

  app.get('/api/camera/focus', async (_req, reply) => {
    try {
      const res = await new Promise<{ focus: number }>((resolve, reject) =>
        client.GetFocus({}, (err: any, data: any) => (err ? reject(err) : resolve(data)))
      );
      logger.info('GetFocus', { focus: res.focus });
      return { focus: res.focus };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.post('/api/camera/focus', async (req: any, reply) => {
    try {
      const body = FocusSetSchema.parse((req as any).body);
      await new Promise((resolve, reject) =>
        client.SetFocus({ focus: body.focus }, (err: any) => (err ? reject(err) : resolve(null)))
      );
      logger.info('SetFocus', { focus: body.focus });
      return { focus: body.focus };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.get('/api/camera/info', async () => {
    const res = await new Promise<{ info: string }>((resolve, reject) =>
      client.GetInfo({}, (err: any, data: any) => (err ? reject(err) : resolve(data)))
    );
    logger.info('GetInfo', { info: res.info });
    return { info: res.info };
  });

  app.post('/api/camera/autofocus', async (req: any) => {
    const body = ToggleSchema.parse((req as any).body);
    await new Promise((resolve, reject) =>
      client.EnableAutoFocus({ enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
    );
    logger.info('EnableAutoFocus', { enable: body.enable });
    return { enable: body.enable };
  });

  app.post('/api/camera/stabilization', async (req: any) => {
    const body = ToggleSchema.parse((req as any).body);
    await new Promise((resolve, reject) =>
      client.Stabilize({ enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
    );
    logger.info('Stabilize', { enable: body.enable });
    return { enable: body.enable };
  });
}
