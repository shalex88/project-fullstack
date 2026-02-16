import path from 'node:path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { CONFIG } from '../lib/config.js';

// Use path relative to repo root (works for both runtime and test runs from backend/ dir)
const PROTO_PATH = path.resolve(process.cwd(), '../contracts/core_service.proto');

type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any
    ? (...args: A extends [...infer P, any] ? P : A) => Promise<any>
    : never;
};

export function createCoreClient() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;
  const CoreService = proto.core.v1.CoreService as any;

  // Configure gRPC channel with proper timeouts
  const channelCredentials = grpc.credentials.createInsecure();
  const client = new CoreService(CONFIG.cameraTarget, channelCredentials, {
    'grpc.max_receive_message_length': -1,
    'grpc.max_send_message_length': -1,
  });

  return client as any as {
    SetZoom: (req: { camera_id: number; zoom: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetZoom: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: { zoom: number }) => void) => void;
    SetFocus: (req: { camera_id: number; focus: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetFocus: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: { focus: number }) => void) => void;
    GetInfo: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: { info: string }) => void) => void;
    GetCapabilities: (
      req: { camera_id: number },
      cb: (err: grpc.ServiceError | null, res: { capabilities: string[] }) => void
    ) => void;
    SetAutoFocus: (req: { camera_id: number; enable: boolean }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetAutoFocus: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: { enable: boolean }) => void) => void;
    SetStabilization: (req: { camera_id: number; enable: boolean }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetStabilization: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: { enable: boolean }) => void) => void;
    GoToMinZoom: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GoToMaxZoom: (req: { camera_id: number }, cb: (err: grpc.ServiceError | null, res: {}) => void) => void;
    GetVideoCapabilities: (
      req: { camera_id: number },
      cb: (err: grpc.ServiceError | null, res: { capabilities: string[] }) => void
    ) => void;
    SetVideoCapabilityState: (
      req: { camera_id: number; capability: string; enable: boolean },
      cb: (err: grpc.ServiceError | null, res: {}) => void
    ) => void;
    GetVideoCapabilityState: (
      req: { camera_id: number; capability: string },
      cb: (err: grpc.ServiceError | null, res: { enable: boolean }) => void
    ) => void;
  };
}
