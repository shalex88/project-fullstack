import path from 'node:path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { CONFIG } from '../lib/config.js';

// Use path relative to repo root (works for both runtime and test runs from backend/ dir)
const PROTO_PATH = path.resolve(process.cwd(), '../contracts/camera/camera_service.proto');

type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any
    ? (...args: A extends [...infer P, any] ? P : A) => Promise<any>
    : never;
};

export function createCameraClient() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;
  const CameraService = proto.camera.v1.CameraService as any;
  const client = new CameraService(CONFIG.cameraTarget, grpc.credentials.createInsecure());
  return client as any as {
    SetZoom: (req: { zoom: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetZoom: (req: {}, cb: (err: grpc.ServiceError | null, res: { zoom: number }) => void) => void;
    SetFocus: (req: { focus: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetFocus: (req: {}, cb: (err: grpc.ServiceError | null, res: { focus: number }) => void) => void;
    GetInfo: (req: {}, cb: (err: grpc.ServiceError | null, res: { info: string }) => void) => void;
    SetAutoFocus: (req: { enable: boolean }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    SetStabilization: (req: { enable: boolean }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GoToMinZoom: (req: {}, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GoToMaxZoom: (req: {}, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
  };
}
