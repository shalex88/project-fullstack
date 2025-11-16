import Fastify from 'fastify';
import { CONFIG } from '../../src/lib/config.js';
import { registerStreamRoutes } from '../../src/api/stream.js';
import { registerCameraRoutes } from '../../src/api/camera.js';

describe('Backend Integration: Stream and Zoom (US1)', () => {
  const app = Fastify({ logger: false });

  beforeAll(async () => {
    registerStreamRoutes(app);
    registerCameraRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/stream/url', () => {
    it('returns the HLS URL', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stream/url',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('url');
      expect(json.url).toBe(CONFIG.hlsUrl);
    });
  });

  describe('GET /api/camera/zoom', () => {
    it('returns current zoom level from gRPC', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/camera/zoom',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('zoom');
      expect(typeof json.zoom).toBe('number');
    });
  });

  describe('POST /api/camera/zoom', () => {
    it('sets zoom level via gRPC', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/zoom',
        headers: { 'content-type': 'application/json' },
        payload: { zoom: 15 },
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json).toHaveProperty('zoom');
      expect(json.zoom).toBe(15);
    });

    it('rejects invalid zoom payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/camera/zoom',
        headers: { 'content-type': 'application/json' },
        payload: { zoom: -5 },
      });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
