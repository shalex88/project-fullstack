# Tasks: Camera Control Dashboard & ApiServer

description: "Task list for Camera Control Dashboard & ApiServer"

**Input**: Design documents from `/specs/001-camera-control-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per the constitution unless explicitly exempted with a time-bound waiver; include unit tests for core logic and integration/contract tests for cross-boundary changes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend (Fastify): `backend/src/` and `backend/tests/`
- Frontend (React + Vite): `frontend/src/` and `frontend/tests/`
- Contracts: `contracts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure: `backend/`, `frontend/`, `contracts/`
- [x] T002 [P] Initialize backend project (TypeScript, Node 20) with `backend/package.json`, `backend/tsconfig.json`, `backend/jest.config.ts`
- [x] T003 [P] Initialize frontend project (Vite + React + TS) with `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`
- [x] T004 [P] Configure linting/formatting (ESLint + Prettier) in `backend/.eslintrc.cjs`, `frontend/.eslintrc.cjs`
- [x] T005 Add environment sample for backend `.env.sample` with `CAMERA_GRPC=localhost:50051`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup ts-proto codegen: `backend/package.json` script to generate from `contracts/camera/camera_service.proto` into `backend/src/grpc/generated/`
- [x] T007 [P] Implement gRPC client factory in `backend/src/grpc/client.ts` (reads `CAMERA_GRPC`)
- [x] T008 [P] Create Fastify app skeleton with health route in `backend/src/api/server.ts`
- [x] T009 [P] Add validation schemas with zod in `backend/src/lib/validation.ts` (zoom, focus, toggles)
- [x] T010 Setup backend test harness: Jest + ts-jest in `backend/jest.config.ts` and sample test in `backend/tests/unit/smoke.test.ts`
- [x] T011 Setup frontend test harness: Vitest + Testing Library in `frontend/vitest.config.ts` and `frontend/tests/unit/smoke.test.tsx`
- [x] T012 Update spec acceptance for US1 in `specs/001-camera-control-dashboard/spec.md` (replace pan/tilt with zoom for MVP)
- [x] T013 Add backend config loader in `backend/src/lib/config.ts` (env parsing, defaults)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Live Stream & Basic Control (Priority: P1) 🎯 MVP

**Goal**: Show live HLS stream and provide basic control (Start/Stop UI + Zoom In/Out)

**Independent Test**: From the dashboard, click Start Stream to view live video; use Zoom In/Out to change framing; Stop hides the stream. Backend returns HLS URL and mediates zoom via gRPC.

### Tests for User Story 1 (Required when applicable) ⚠️

- [x] T014 [P] [US1] Backend integration tests for `/api/stream/url` and `/api/camera/zoom` in `backend/tests/integration/stream_zoom.test.ts`
- [x] T015 [P] [US1] Frontend unit test for HLS Start/Stop flow in `frontend/tests/unit/player_start_stop.test.tsx`

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement `GET /api/stream/url` in `backend/src/api/stream.ts` (returns `http://localhost:8888/camera1/index.m3u8`)
- [x] T017 [US1] Implement zoom endpoints `GET/POST /api/camera/zoom` in `backend/src/api/camera.ts` (map to gRPC SetZoom/GetZoom)
- [x] T018 [US1] Implement WebDashboard page in `frontend/src/pages/Dashboard.tsx` with Start/Stop and Zoom +/- controls
- [x] T019 [US1] Add frontend API client in `frontend/src/services/api.ts` (stream URL, zoom get/set)
- [x] T020 [US1] Add accessibility (keyboard shortcuts, focus styles) in `frontend/src/components/Controls.tsx`
- [x] T021 [US1] Add backend logging for control actions in `backend/src/lib/log.ts` and integrate

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Zoom & Snapshot (Priority: P2)

**Goal**: Provide in-session snapshot capture alongside zoom controls.

**Independent Test**: With an active stream, click Snapshot; a PNG is produced from the current frame and downloaded to the user’s device.

### Tests for User Story 2 (Required when applicable) ⚠️

- [x] T022 [P] [US2] Frontend unit test for snapshot capture from `<video>` in `frontend/tests/unit/snapshot.test.tsx`
- [ ] T023 [P] [US2] Backend non-regression integration check (zoom endpoints unaffected) in `backend/tests/integration/zoom_regression.test.ts`

### Implementation for User Story 2

- [x] T024 [US2] Implement Snapshot button drawing from `<video>` to `<canvas>` and downloading in `frontend/src/components/Controls.tsx`
- [x] T025 [US2] Add UI state and error handling for snapshot in `frontend/src/components/Controls.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Camera Settings & Status (Priority: P3)

**Goal**: View camera info and toggle autofocus/stabilization; show status and disable controls when offline.

**Independent Test**: Open settings, toggle autofocus; backend returns success; UI reflects state; when services stop, dashboard shows offline and disables controls.

### Tests for User Story 3 (Required when applicable) ⚠️

- [x] T026 [P] [US3] Backend integration tests for `/api/camera/info`, `/api/camera/autofocus`, `/api/camera/stabilization` in `backend/tests/integration/settings_status.test.ts`
- [x] T027 [P] [US3] Frontend unit test for settings panel and disabled states in `frontend/tests/unit/settings_status.test.tsx`

### Implementation for User Story 3

- [x] T028 [P] [US3] Implement routes in `backend/src/api/camera.ts` (info, autofocus enable, stabilization enable) mapping to gRPC
- [x] T029 [US3] Implement Settings panel in `frontend/src/components/Settings.tsx` (info display, toggles)
- [x] T030 [US3] Implement status area in `frontend/src/components/Status.tsx` and integrate into `Dashboard.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T031 [P] Update docs: backend README in `backend/README.md` and link to `specs/001-camera-control-dashboard/quickstart.md`
- [ ] T032 Add basic performance instrumentation (timing logs, p95 reporting) in `backend/src/lib/metrics.ts` and integrate in routes
- [ ] T033 [P] Contract test hitting local camera-service via generated client in `backend/tests/contract/camera_client.test.ts` (requires `tmp/run_services.sh` running)
- [x] T034 Configure CORS and error handling middleware in `backend/src/api/server.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent (frontend-only snapshot) but should validate zoom non-regression
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent; consumes gRPC methods distinct from US1

### Within Each User Story

- Tests (included) SHOULD be written and FAIL before implementation
- Backend endpoints before frontend integration (when applicable)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational tasks T007–T011 can run in parallel
- After Foundational, frontend (US2 snapshot) can proceed in parallel with backend (US3 settings)
- Within US1, backend route T016 can be parallelized with frontend player T018

---

## Parallel Example: User Story 1

```bash
# Tests (write first, expect to fail until implemented)
Task: "Backend integration tests for /api/stream/url and /api/camera/zoom"
Task: "Frontend unit test for HLS Start/Stop flow"

# Implementation
Task: "GET /api/stream/url in backend/src/api/stream.ts"
Task: "Dashboard + controls in frontend/src/pages/Dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test User Story 1 independently via tests + manual run
5. Demo locally using `tmp/run_services.sh`

### Incremental Delivery

1. US1 → Test independently → Demo (MVP)
2. US2 → Test independently → Demo (snapshot)
3. US3 → Test independently → Demo (settings/status)

### Parallel Team Strategy

- Developer A: Backend routes (US1/US3)
- Developer B: Frontend player + controls (US1), Snapshot (US2)
- Developer C: Tests and metrics/polish

