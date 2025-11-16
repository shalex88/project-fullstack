# Quickstart: Camera Control Dashboard & ApiServer

This guide runs the local media pipeline and exercises the API + dashboard (once implemented).

## Prerequisites

- Linux, bash, Node.js 20.x, pnpm or npm
- Local stack provided in `tmp/` (MediaMTX + camera-service)

## 1) Start media services

From repo root:

```bash
cd tmp
./run_services.sh
```

This starts:

- MediaMTX (RTSP at :8554, HLS at :8888)
- Camera service (gRPC at :50051)

HLS will be available at:

- `http://localhost:8888/camera1/index.m3u8`

Stop with Ctrl+C (script handles cleanup).

## 2) Start ApiServer (after implementation)

From repo root:

```bash
cd backend
pnpm install # or npm install
echo "CAMERA_GRPC=localhost:50051" > .env
pnpm dev     # runs on http://localhost:3000
```

API examples:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/stream/url
curl -X POST http://localhost:3000/api/camera/zoom -H 'content-type: application/json' -d '{"zoom": 10}'
```

## 3) Start WebDashboard (after implementation)

From repo root:

```bash
cd frontend
pnpm install # or npm install
pnpm dev     # opens http://localhost:5173
```

The dashboard should:

- Load the HLS stream from `http://localhost:8888/camera1/index.m3u8` using hls.js
- Offer controls for Zoom/Focus that call the ApiServer

## Notes

- MVP runs in a trusted/local environment (no auth).
- Single camera (`camera1`) is supported; multi-camera is out of scope for MVP.
- Performance budgets: API p95 < 300ms; stream visible ≤ 2s p95; control effects ≤ 300ms p95.
