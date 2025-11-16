import Fastify from 'fastify';
import { registerCameraRoutes } from '../../src/api/camera.js';

describe('Backend Integration: Settings and Status (US3)', () => {
  const app = Fastify({ logger: false });

  beforeAll(async () => {
    registerCameraRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/camera/info', () => {
    it('returns camera information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/camera/info',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('info');
      expect(typeof json.info).toBe('string');
    });
  });

  describe('POST /api/camera/autofocus', () => {
    it('enables autofocus', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/autofocus',
        headers: { 'content-type': 'application/json' },
        payload: { enable: true },
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('enable');
      expect(json.enable).toBe(true);
    });

    it('rejects invalid payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/autofocus',
        headers: { 'content-type': 'application/json' },
        payload: { enable: 'yes' },
      });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/camera/stabilization', () => {
    it('enables stabilization', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/stabilization',
        headers: { 'content-type': 'application/json' },
        payload: { enable: true },
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('enable');
      expect(json.enable).toBe(true);
    });
  });

  describe('GET /api/camera/focus', () => {
    it('returns current focus level', async () => {
      // Focus is automatic by default; disable autofocus to interact with focus endpoints
      const disableAuto = await app.inject({
        method: 'POST',
        url: '/api/camera/autofocus',
        headers: { 'content-type': 'application/json' },
        payload: { enable: false },
      });
      expect(disableAuto.statusCode).toBe(200);

      const response = await app.inject({
        method: 'GET',
        url: '/api/camera/focus',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('focus');
      expect(typeof json.focus).toBe('number');
    });
  });

  describe('POST /api/camera/focus', () => {
    it('sets focus level', async () => {
      // Ensure autofocus is disabled before setting focus
      const disableAuto = await app.inject({
        method: 'POST',
        url: '/api/camera/autofocus',
        headers: { 'content-type': 'application/json' },
        payload: { enable: false },
      });
      expect(disableAuto.statusCode).toBe(200);

      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/focus',
        headers: { 'content-type': 'application/json' },
        payload: { focus: 50 },
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('focus');
      expect(json.focus).toBe(50);
    });
  });
});
