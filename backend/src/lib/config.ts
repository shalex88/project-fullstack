import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  port: Number(process.env.PORT || 3000),
  cameraTarget: process.env.CAMERA_GRPC || 'localhost:50051',
  webrtcUrlPattern: process.env.WEBRTC_URL || 'http://localhost:8889/camera1',
};

/**
 * Generate WebRTC URL for a specific camera ID
 * Replaces camera1 with camera{id} in the URL pattern
 */
export function getHlsUrl(cameraId: number): string {
  return CONFIG.webrtcUrlPattern.replace(/camera\d+/i, `camera${cameraId}`);
}
