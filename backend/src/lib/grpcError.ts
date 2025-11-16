import * as grpc from '@grpc/grpc-js';

export function mapGrpcError(err: any): { statusCode: number; error: string; message: string } {
  const code = err?.code as grpc.status | undefined;
  const message = err?.message || 'gRPC error';
  switch (code) {
    case grpc.status.UNIMPLEMENTED:
      return { statusCode: 501, error: 'UNIMPLEMENTED', message };
    case grpc.status.FAILED_PRECONDITION:
      return { statusCode: 409, error: 'FAILED_PRECONDITION', message };
    case grpc.status.INVALID_ARGUMENT:
      return { statusCode: 400, error: 'INVALID_ARGUMENT', message };
    case grpc.status.NOT_FOUND:
      return { statusCode: 404, error: 'NOT_FOUND', message };
    case grpc.status.UNAVAILABLE:
      return { statusCode: 503, error: 'UNAVAILABLE', message };
    default:
      return { statusCode: 502, error: 'BAD_GATEWAY', message };
  }
}
