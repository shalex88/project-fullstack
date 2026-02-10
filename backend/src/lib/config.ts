import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  port: Number(process.env.PORT || 3000),
  cameraTarget: process.env.CAMERA_GRPC || 'localhost:50051',
  hlsUrlPattern: process.env.HLS_URL || 'http://localhost:8888/camera1/index.m3u8',
};

/**
 * Generate HLS URL for a specific camera ID
 * Replaces camera1 with camera{id} in the URL pattern
 */
export function getHlsUrl(cameraId: number): string {
  return CONFIG.hlsUrlPattern.replace(/camera\d+/i, `camera${cameraId}`);
}
