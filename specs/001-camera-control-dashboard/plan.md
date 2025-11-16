# Implementation Plan: Camera Control Dashboard & ApiServer

**Branch**: `001-camera-control-dashboard` | **Date**: 2025-11-16 | **Spec**: `specs/001-camera-control-dashboard/spec.md`
**Input**: Feature specification from `/specs/001-camera-control-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a fullstack TypeScript solution where the WebDashboard plays an HLS stream from MediaMTX (`http://localhost:8888/camera1/index.m3u8`) and exposes controls for Zoom and Focus. The ApiServer mediates dashboard actions to the gRPC camera service defined in `contracts/camera/camera_service.proto` using `@grpc/grpc-js` with `ts-proto`-generated types/clients. MVP runs in a trusted/local environment without auth, for a single camera.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js 20.x), React + TypeScript
**Primary Dependencies**: Backend: Fastify, @grpc/grpc-js, ts-proto, zod; Frontend: Vite, React, hls.js
**Storage**: N/A (no persistence in MVP)
**Testing**: Backend: Jest + ts-jest, supertest; Frontend: Vitest + Testing Library; e2e optional: Playwright; Contract: generated TS client against local camera-service
**Target Platform**: Linux server (backend), modern browsers (frontend)
**Project Type**: web (frontend + backend)
**Performance Goals**: Stream start visible ≤ 2s p95; control actions (zoom/focus) visible effect ≤ 300ms p95; backend API latency p95 < 300ms, p99 < 1s
**Constraints**: Single camera; no auth in MVP; HLS via MediaMTX at :8888; <200ms p95 desirable for non-stream API; accessibility basics for UI
**Scale/Scope**: Single operator/session; local dev usage; future iterations may add multi-camera and auth

Decoupling: ApiServer does not proxy, control, or gate HLS playback; it only mediates camera commands (zoom/focus/info). The frontend fetches HLS directly from MediaMTX and can start/stop playback independently of camera commands.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality: formatting + linting pass; review checklist completed; no critical static analysis findings.
- Testing: unit tests for core logic; integration/contract tests for cross-boundary changes; CI green; coverage rationale provided.
- UX Consistency: acceptance criteria documented; accessibility basics (keyboard, contrast, focus) verified for UI work.
- Performance: explicit budgets declared; baseline benchmark/load test for critical paths; no regressions vs thresholds.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── api/            # Fastify routes (REST facade)
│   ├── grpc/           # Generated gRPC clients (ts-proto), client factory
│   ├── services/       # Camera service adapter (maps HTTP→gRPC)
│   └── lib/            # Validation (zod), config, logging
└── tests/
  ├── unit/
  ├── integration/    # supertest against Fastify app
  └── contract/       # Calls into local camera-service via generated client

frontend/
├── src/
│   ├── components/     # Player, Controls, Status
│   ├── pages/          # Dashboard page
│   └── services/       # API client wrappers
└── tests/
  └── unit/
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` projects to isolate concerns and testing; backend mediates control to gRPC camera service; frontend plays HLS directly from MediaMTX.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
