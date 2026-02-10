import * as grpc from '@grpc/grpc-js';
import { randomBytes } from 'crypto';

export interface ApiError {
  error: string;
  message: string;
  traceId?: string;
  details?: Record<string, any>;
}

export interface ApiErrorResponse {
  statusCode: number;
  body: ApiError;
}

function generateTraceId(): string {
  return randomBytes(5).toString('hex');
}

export function mapGrpcError(err: any): ApiErrorResponse {
  const code = err?.code as grpc.status | undefined;
  const message = err?.message || 'gRPC error';
  const traceId = generateTraceId();

  switch (code) {
    case grpc.status.UNIMPLEMENTED:
      return {
        statusCode: 501,
        body: { error: 'UNIMPLEMENTED', message, traceId }
      };
    case grpc.status.FAILED_PRECONDITION:
      return {
        statusCode: 409,
        body: { error: 'FAILED_PRECONDITION', message, traceId }
      };
    case grpc.status.INVALID_ARGUMENT:
      return {
        statusCode: 400,
        body: { error: 'INVALID_ARGUMENT', message, traceId }
      };
    case grpc.status.NOT_FOUND:
      return {
        statusCode: 404,
        body: { error: 'NOT_FOUND', message, traceId }
      };
    case grpc.status.UNAVAILABLE:
      return {
        statusCode: 503,
        body: { error: 'UNAVAILABLE', message, traceId }
      };
    default:
      return {
        statusCode: 502,
        body: { error: 'BAD_GATEWAY', message, traceId }
      };
  }
}
