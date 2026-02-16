import type { FastifyInstance } from 'fastify';
import { createCoreClient } from '../grpc/coreClient.js';
import { ZoomSetSchema, FocusSetSchema, ToggleSchema, CameraIdSchema } from '../lib/validation.js';
import { createLogger } from '../lib/log.js';
import { mapGrpcError } from '../lib/grpcError.js';

const logger = createLogger('camera');
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

  app.get('/api/v1/cameras/:cameraId/zoom', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ zoom: number }>((resolve, reject) =>
          client.GetZoom({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetZoom', { camera_id: params.cameraId, zoom: res.zoom });
      return { zoom: res.zoom };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/zoom', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const body = ZoomSetSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetZoom({ camera_id: params.cameraId, zoom: body.zoom }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetZoom', { camera_id: params.cameraId, zoom: body.zoom });
      return { zoom: body.zoom };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/zoom/min', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.GoToMinZoom({ camera_id: params.cameraId }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('GoToMinZoom', { camera_id: params.cameraId });
      return reply.status(200).send();
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/zoom/max', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.GoToMaxZoom({ camera_id: params.cameraId }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('GoToMaxZoom', { camera_id: params.cameraId });
      return reply.status(200).send();
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/focus', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ focus: number }>((resolve, reject) =>
          client.GetFocus({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetFocus', { camera_id: params.cameraId, focus: res.focus });
      return { focus: res.focus };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/focus', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const body = FocusSetSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetFocus({ camera_id: params.cameraId, focus: body.focus }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetFocus', { camera_id: params.cameraId, focus: body.focus });
      return { focus: body.focus };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/info', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ info: string }>((resolve, reject) =>
          client.GetInfo({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetInfo', { camera_id: params.cameraId, info: res.info });
      return { info: res.info };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/capabilities', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ capabilities: string[] }>((resolve, reject) =>
          client.GetCapabilities({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      // Map protobuf enum names (CAPABILITY_ZOOM -> ZOOM)
      const capabilities = res.capabilities
        .map(cap => cap.replace(/^CAPABILITY_/, ''))
        .filter(cap => cap.length > 0);
      logger.info('GetCapabilities', { camera_id: params.cameraId, capabilities });
      return { capabilities };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/autofocus', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ enable: boolean }>((resolve, reject) =>
          client.GetAutoFocus({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetAutoFocus', { camera_id: params.cameraId, enable: res.enable });
      return { enable: res.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/autofocus', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const body = ToggleSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetAutoFocus({ camera_id: params.cameraId, enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetAutoFocus', { camera_id: params.cameraId, enable: body.enable });
      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.get('/api/v1/cameras/:cameraId/stabilization', async (req, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const res = await withTimeout(
        new Promise<{ enable: boolean }>((resolve, reject) =>
          client.GetStabilization({ camera_id: params.cameraId }, (err: any, data: any) => (err ? reject(err) : resolve(data)))
        )
      );
      logger.info('GetCameraStabilization', { camera_id: params.cameraId, enable: res.enable });
      return { enable: res.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });

  app.put('/api/v1/cameras/:cameraId/stabilization', async (req: any, reply) => {
    try {
      const params = CameraIdSchema.parse(req.params);
      const body = ToggleSchema.parse((req as any).body);
      await withTimeout(
        new Promise((resolve, reject) =>
          client.SetStabilization({ camera_id: params.cameraId, enable: body.enable }, (err: any) => (err ? reject(err) : resolve(null)))
        )
      );
      logger.info('SetCameraStabilization', { camera_id: params.cameraId, enable: body.enable });
      return { enable: body.enable };
    } catch (err: any) {
      const mapped = mapGrpcError(err);
      return reply.status(mapped.statusCode).send(mapped.body);
    }
  });
}
