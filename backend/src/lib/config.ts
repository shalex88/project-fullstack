import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  port: Number(process.env.PORT || 3000),
  cameraTarget: process.env.CAMERA_GRPC || 'localhost:50051',
  hlsUrl: process.env.HLS_URL || 'http://localhost:8888/camera1/index.m3u8',
};
