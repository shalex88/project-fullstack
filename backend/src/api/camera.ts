import type { FastifyInstance } from 'fastify';
import { createCoreClient } from '../grpc/coreClient.js';
import { ZoomSetSchema, FocusSetSchema, ToggleSchema } from '../lib/validation.js';
import { createLogger } from '../lib/log.js';
import { mapGrpcError } from '../lib/grpcError.js';

const logger = createLogger('camera');
const CAMERA_ID = 1;
const GRPC_TIMEOUT = 5000; // 5 second timeout

// Helper function to add timeout to Promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = GRPC_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('gRPC request timeout')), timeoutMs)
    ),
  ]);
}

export function registerCameraRoutes(app: FastifyInstance) {
  const client = createCoreClient();

  app.get('/api/camera/zoom', async (_req, reply) => {
    try {
      const res = await withTimeout(
        new Promise<{ zoom: number }>((resolve, reject) =>
          client.GetZoom({ camera_id: CAMERA_ID }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetZoom', { zoom: res.zoom });
      return { zoom: res.zoom };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.post('/api/camera/zoom', async (req: any, reply) => {
    try {
      const body = ZoomSetSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetZoom({ camera_id: CAMERA_ID, zoom: body.zoom }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetZoom', { zoom: body.zoom });
      return { zoom: body.zoom };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.get('/api/camera/focus', async (_req, reply) => {
    try {
      const res = await withTimeout(
        new Promise<{ focus: number }>((resolve, reject) =>
          client.GetFocus({ camera_id: CAMERA_ID }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
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
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetFocus({ camera_id: CAMERA_ID, focus: body.focus }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetFocus', { focus: body.focus });
      return { focus: body.focus };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.get('/api/camera/info', async (_req, reply) => {
    try {
      const res = await withTimeout(
        new Promise<{ info: string }>((resolve, reject) =>
          client.GetInfo({ camera_id: CAMERA_ID }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetInfo', { info: res.info });
      return { info: res.info };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.post('/api/camera/autofocus', async (req: any, reply) => {
    try {
      const body = ToggleSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetAutoFocus({ camera_id: CAMERA_ID, enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetAutoFocus', { enable: body.enable });
      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });

  app.post('/api/camera/stabilization', async (req: any, reply) => {
    try {
      const body = ToggleSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetStabilization({ camera_id: CAMERA_ID, enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetStabilization', { enable: body.enable });
      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send({ error: mapped.error, message: mapped.message });
    }
  });
}
