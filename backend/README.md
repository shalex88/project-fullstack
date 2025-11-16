# Camera ApiServer

Backend HTTP API for the Camera Control Dashboard. Mediates dashboard control actions to a gRPC camera service.

## Setup

```bash
npm install
echo "CAMERA_GRPC=localhost:50051" > .env
```

## Run

Development with watch mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Test

```bash
npm test
```

## Environment Variables

- `PORT` (default: 3000) — HTTP server port
- `CAMERA_GRPC` (default: localhost:50051) — gRPC camera service target
- `HLS_URL` (default: http://localhost:8888/camera1/index.m3u8) — HLS stream URL returned to frontend

## Quickstart

See [specs/001-camera-control-dashboard/quickstart.md](../specs/001-camera-control-dashboard/quickstart.md) for full setup including media services.

## API

- `GET /api/health` → `{ status: "ok" }`
- `GET /api/stream/url` → `{ url: string }`
- `GET /api/camera/zoom` → `{ zoom: number }`
- `POST /api/camera/zoom` (body: `{ zoom: number }`) → `{ zoom: number }`
- `GET /api/camera/focus` → `{ focus: number }`
- `POST /api/camera/focus` (body: `{ focus: number }`) → `{ focus: number }`
- `GET /api/camera/info` → `{ info: string }`
- `POST /api/camera/autofocus` (body: `{ enable: boolean }`) → `{ enable: boolean }`
- `POST /api/camera/stabilization` (body: `{ enable: boolean }`) → `{ enable: boolean }`

## Architecture

- **Fastify** HTTP framework
- **gRPC** client for camera service (via `@grpc/proto-loader`)
- **Zod** request validation
- **Jest + ts-jest** for tests
