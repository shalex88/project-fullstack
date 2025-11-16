# Research Notes: Camera Control Dashboard & ApiServer

## Decisions

- Decision: Use Fastify for backend HTTP API
  - Rationale: Better performance and built-in types over Express; easy JSON handling and plugin ecosystem.
  - Alternatives considered: Express (ubiquitous but slower, less typed), Koa (lean but smaller ecosystem).

- Decision: Generate TypeScript gRPC client with ts-proto + @grpc/grpc-js
  - Rationale: Strongly-typed clients and messages; modern TS tooling; avoids runtime any-casting.
  - Alternatives considered: grpc-tools with JS stubs (less typed), Buf (heavier tooling; unnecessary for MVP).

- Decision: HLS playback via hls.js in React
  - Rationale: Broad browser support for HLS over MSE; simple integration; works with MediaMTX LL-HLS.
  - Alternatives considered: video.js (heavier), native HTML5 HLS (limited to Safari).

- Decision: Controls include Zoom + Focus; Snapshot is frontend-only (no gRPC) and PTZ is excluded
  - Rationale: Matches available gRPC methods in camera_service.proto; snapshot can be implemented by capturing frames from the HLS `<video>`; avoids proto changes.
  - Alternatives considered: Add PTZ and snapshot to proto (heavier change, deferred).

- Decoupling of streaming and commands
  - Playback (HLS via MediaMTX) is independent and not proxied/controlled by ApiServer; ApiServer handles only camera gRPC commands.

- Decision: Single camera MVP; no authentication
  - Rationale: Matches clarified requirements; enables quick E2E demo with local services.
  - Alternatives considered: Multi-camera selector; OAuth/SSO (deferred due to scope/time).

## Best Practices & Patterns

- Backend
  - Validate incoming payloads with zod; map to strongly-typed gRPC requests.
  - Encapsulate gRPC channel creation in a client factory; reuse channels; handle timeouts.
  - Surface errors as typed HTTP errors with consistent JSON error shape.
  - Add basic metrics/timing logs for API latency (p95/p99 budgets).

- Frontend
  - Initialize hls.js only when media source is supported; fallback to native for Safari.
  - Show explicit connection and error states; disable controls when stream inactive.
  - Keyboard-accessible controls, visible focus, adequate contrast.

- Testing
  - Unit-test request validation and service mapping; mock gRPC client.
  - Contract tests: call gRPC camera-service in tmp stack to verify basic connectivity and method contract.
  - Integration tests: API routes via supertest; ensure HTTP→gRPC mapping and error shaping.

## Open Questions (Resolved)

- HLS URL and port
  - From tmp/mediamtx/mediamtx.yml: HLS server at :8888; path `camera1`. URL: `http://localhost:8888/camera1/index.m3u8`.

- gRPC method coverage vs spec
  - Proto exposes Zoom/Focus/Info, not PTZ or Snapshot; MVP scopes controls accordingly.

- Canonical proto path
  - The camera proto is copied to `contracts/camera/camera_service.proto` (do not import from tmp/).

- Performance budgets
  - Adopt constitution defaults: API p95 < 300ms; stream visible ≤ 2s p95; control effect visible ≤ 300ms p95. Add timing logs to measure.
