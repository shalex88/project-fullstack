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
- [T1] [P] US1 Implement video playback in WebDashboard, integrating with MediaMTX.
- [T2] [P] US1 Add zoom controls in WebDashboard.
- [T3] [P] US1 Implement toast notifications for user feedback on actions.

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
- [T4] [P] US2 Implement snapshot functionality in WebDashboard.

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
- [T5] [P] US3 Integrate camera settings and status display in WebDashboard.

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T031 [P] Update docs: backend README in `backend/README.md` and link to `specs/001-camera-control-dashboard/quickstart.md`
- [ ] T032 Add basic performance instrumentation (timing logs, p95 reporting) in `backend/src/lib/metrics.ts` and integrate in routes
- [ ] T033 [P] Contract test hitting local camera-service via generated client in `backend/tests/contract/camera_client.test.ts` (requires `tmp/run_services.sh` running)
- [x] T034 Configure CORS and error handling middleware in `backend/src/api/server.ts`

---

## Phase 5: Packaging & Deployment (Priority: P4)

**Goal**: Create distributable Debian packages for production deployment with automated installation.

**Independent Test**: Install both packages on clean Ubuntu VM; verify backend service starts automatically; verify dashboard accessible at <http://localhost/> with API integration; verify uninstallation leaves no artifacts.

### Sub-Phase 5.1: Backend Package Creation

**Purpose**: Compile backend to standalone executable and create `.deb` package with systemd integration

- [ ] T035 [P] Install and configure `pkg` for TypeScript/Node.js compilation; add to `backend/package.json` devDependencies
- [ ] T036 Create pkg configuration file `backend/pkg-config.json` with build targets (node18-linux-x64)
- [ ] T037 Test backend compilation with pkg: verify executable runs standalone without Node.js runtime
- [ ] T038 [P] Create backend package directory structure in `backend/package/` matching deployment layout (opt/, etc/, DEBIAN/)
- [ ] T039 Write systemd service unit file in `backend/package/etc/systemd/system/camera-apiserver.service` (WorkingDirectory, ExecStart, Restart=always)
- [ ] T040 Create DEBIAN control file in `backend/package/DEBIAN/control` (Package=camera-apiserver, Version=1.0.0, Architecture=amd64, Description)
- [ ] T041 Create postinst script in `backend/package/DEBIAN/postinst` (create log directory, systemctl enable/start camera-apiserver.service)
- [ ] T042 [P] Create prerm script in `backend/package/DEBIAN/prerm` (systemctl stop camera-apiserver.service)
- [ ] T043 [P] Create postrm script in `backend/package/DEBIAN/postrm` (cleanup logs and configs)
- [ ] T044 Write `scripts/build-backend-package.sh`: compile with pkg, copy files to package/, run dpkg-deb --build
- [ ] T045 Test backend package installation on clean Ubuntu 20.04 VM; verify service starts and API responds at <http://localhost:3000/api/health>
- [ ] T046 [P] Verify service survives system reboot; test package removal with `apt remove camera-apiserver`

### Sub-Phase 5.2: Frontend Package Creation

**Purpose**: Build production frontend assets and create `.deb` package with nginx integration

- [ ] T047 [P] Run production build `cd frontend && npm run build`; verify artifacts in `frontend/dist/`
- [ ] T048 Create frontend package directory structure in `frontend/package/` (var/www/, etc/nginx/, DEBIAN/)
- [ ] T049 Write nginx site configuration in `frontend/package/etc/nginx/sites-available/camera-webdashboard` (root, proxy_pass to <http://localhost:3000>, gzip, cache headers)
- [ ] T050 Create DEBIAN control file in `frontend/package/DEBIAN/control` (Package=camera-webdashboard, Version=1.0.0, Architecture=all, Depends=nginx)
- [ ] T051 Create postinst script in `frontend/package/DEBIAN/postinst` (copy files, ln -s sites-available to sites-enabled, nginx -s reload)
- [ ] T052 [P] Create prerm script in `frontend/package/DEBIAN/prerm` (remove sites-enabled symlink)
- [ ] T053 [P] Create postrm script in `frontend/package/DEBIAN/postrm` (cleanup /var/www/camera-webdashboard/)
- [ ] T054 Write `scripts/build-frontend-package.sh`: npm run build, copy dist/ to package/, copy nginx config, run dpkg-deb --build
- [ ] T055 Test frontend package installation on clean Ubuntu 20.04 VM; verify nginx serves dashboard at <http://localhost/>
- [ ] T056 [P] Verify API proxying works (/api/* → <http://localhost:3000>); test package removal with `apt remove camera-webdashboard`

### Sub-Phase 5.3: Build Automation & CI

**Purpose**: Orchestrate package builds and add version management

- [ ] T057 Create `scripts/build-all.sh` to run both build-backend-package.sh and build-frontend-package.sh
- [ ] T058 [P] Add version management: extract version from `package.json` or git tags; inject into DEBIAN control files
- [ ] T059 [P] Add build artifacts to `.gitignore`: `dist/*.deb`, `backend/package/`, `frontend/package/`
- [ ] T060 Update `README.md` with build requirements (dpkg-deb, pkg) and build commands
- [ ] T061 Create `docs/INSTALLATION.md` with example commands: `sudo dpkg -i camera-apiserver_1.0.0_amd64.deb camera-webdashboard_1.0.0_all.deb`
- [ ] T062 [P] Test installation on multiple distributions (Ubuntu 20.04, 22.04, Debian 11)

### Sub-Phase 5.4: Validation & Documentation

**Purpose**: Verify all deployment requirements and document operational procedures

- [ ] T063 Write deployment guide in `docs/DEPLOYMENT.md` (system requirements, installation steps, configuration options, troubleshooting)
- [ ] T064 Test complete installation flow on clean Ubuntu 20.04 VM: install both packages, verify full user flow (stream + controls)
- [ ] T065 [P] Test complete installation flow on clean Ubuntu 22.04 VM
- [ ] T066 [P] Test complete installation flow on clean Debian 11 VM
- [ ] T067 Verify all deployment requirements DR-001 to DR-010 from `spec.md`
- [ ] T068 Verify packaging success criteria PC-001 to PC-008 from `spec.md`
- [ ] T069 [P] Document uninstallation procedure in `docs/DEPLOYMENT.md` with cleanup verification steps
- [ ] T070 [P] Create upgrade procedure documentation: install new version over old, verify migration

**Checkpoint**: Production-ready packages validated on multiple distributions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Packaging (Phase 5)**: Depends on Phases 2, 3, 4 completion - requires working implementation
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent (frontend-only snapshot) but should validate zoom non-regression
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent; consumes gRPC methods distinct from US1

### Phase 5 Dependencies

- **Sub-Phase 5.1 (Backend Package)**: Depends on Phase 2 completion (working backend implementation)
- **Sub-Phase 5.2 (Frontend Package)**: Depends on Phase 3 completion (working frontend implementation)
- **Sub-Phase 5.3 (Build Automation)**: Depends on Sub-Phases 5.1 AND 5.2 completion
- **Sub-Phase 5.4 (Validation)**: Depends on Sub-Phase 5.3 completion; requires all packages ready

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
- **Phase 5**: Sub-Phases 5.1 (backend) and 5.2 (frontend) can run in parallel if resourced

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
4. Phase 5 → Package and validate → Production-ready deployment

### Parallel Team Strategy

- Developer A: Backend routes (US1/US3) + Backend packaging (Sub-Phase 5.1)
- Developer B: Frontend player + controls (US1), Snapshot (US2) + Frontend packaging (Sub-Phase 5.2)
- Developer C: Tests and metrics/polish + Build automation (Sub-Phase 5.3)

### Packaging Strategy (Phase 5)

1. Complete Phases 1-4 first (working implementation required)
2. Backend package (Sub-Phase 5.1) and Frontend package (Sub-Phase 5.2) can proceed in parallel
3. Build automation (Sub-Phase 5.3) after both packages complete
4. Validation (Sub-Phase 5.4) on multiple distributions before release

