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
**Testing**: Backend: Jest + ts-jest, supertest; Frontend: Vitest + Testing Library; e2e optional: Playwright; Contract: generated TS client against local camera-service and video-service
**Target Platform**: Linux server (backend), modern browsers (frontend)
**Project Type**: web (frontend + backend)
**Performance Goals**: Stream start visible ≤ 2s p95; control actions (zoom/focus) visible effect ≤ 300ms p95; backend API latency p95 < 300ms, p99 < 1s
**Constraints**: Single camera; no auth in MVP; HLS via MediaMTX at :8888; <200ms p95 desirable for non-stream API; accessibility basics for UI
**Scale/Scope**: Single operator/session; local dev usage; future iterations may add multi-camera and auth

Decoupling: ApiServer does not proxy, control, or gate HLS playback; it only mediates camera commands (zoom/focus/info) and video service commands (stabilization). The frontend fetches HLS directly from MediaMTX and can start/stop playback independently of camera/video commands.

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
│   ├── grpc/           # Generated gRPC clients (ts-proto), client factory for camera and video services
│   └── lib/            # Validation (zod), config, logging
└── tests/
  ├── unit/
  ├── integration/    # supertest against Fastify app
  └── contract/       # Calls into local camera-service and video-service via generated clients

frontend/
├── src/
│   ├── components/     # Player, Controls, Status, Toast
│   ├── pages/          # Dashboard page
│   └── services/       # API client wrappers
└── tests/
  └── unit/
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` projects to isolate concerns and testing; backend mediates control to gRPC camera service and video service; frontend plays HLS directly from MediaMTX and displays toast notifications for user feedback.

## Packaging & Deployment Structure

### Package Artifacts

```text
dist/
├── camera-apiserver_1.0.0_amd64.deb          # Backend Debian package
└── camera-webdashboard_1.0.0_all.deb         # Frontend Debian package

backend/package/
├── DEBIAN/
│   ├── control                                # Package metadata
│   ├── postinst                               # Post-installation script
│   ├── prerm                                  # Pre-removal script
│   └── postrm                                 # Post-removal script
├── opt/
│   └── camera-apiserver/
│       ├── bin/
│       │   └── camera-apiserver               # Compiled standalone executable
│       └── config/
│           ├── camera-apiserver.conf          # Default configuration
│           └── .env.example                   # Environment template
└── etc/
    └── systemd/
        └── system/
            └── camera-apiserver.service       # systemd unit file

frontend/package/
├── DEBIAN/
│   ├── control                                # Package metadata
│   ├── postinst                               # Post-installation script (nginx config)
│   ├── prerm                                  # Pre-removal script
│   └── postrm                                 # Post-removal script
├── var/
│   └── www/
│       └── camera-webdashboard/
│           ├── index.html                     # Built static assets
│           ├── assets/
│           │   ├── index-[hash].js
│           │   ├── index-[hash].css
│           │   └── [other assets]
│           └── favicon.ico
└── etc/
    └── nginx/
        └── sites-available/
            └── camera-webdashboard            # nginx site configuration
```

### Build Scripts

```text
scripts/
├── build-backend-package.sh                   # Backend compilation + deb creation
├── build-frontend-package.sh                  # Frontend build + deb creation
└── build-all.sh                               # Orchestrates both packages
```

**Packaging Decision**: Use `dpkg-deb` for native Debian package creation; backend compiled to standalone executable with `pkg`; frontend served via nginx; both packages include systemd/nginx integration scripts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Implementation Phases

### Phase 0: Research & Validate (Completed)

**Goal**: Understand and validate the HLS playback independence and gRPC integration approach.

**Tasks**:

- ✅ Confirm MediaMTX HLS stream at `http://localhost:8888/camera1/index.m3u8` is directly accessible
- ✅ Validate `contracts/camera/camera_service.proto` contract and camera service gRPC endpoint
- ✅ Test basic gRPC client connection to camera service
- ✅ Verify hls.js can play MediaMTX stream in browser
- ✅ Document playback decoupling (frontend → MediaMTX direct, backend → camera gRPC only)

**Output**: `research.md` with findings and technical approach confirmation.

### Phase 1: Design & Contracts (Completed)

**Goal**: Define data models, API contracts, and component architecture.

**Tasks**:

- ✅ Design REST API contract for ApiServer (OpenAPI/Swagger)
- ✅ Define frontend component structure (Player, Controls, Status)
- ✅ Document camera service adapter interface (HTTP→gRPC mapping)
- ✅ Create data models for camera state, control commands, player session
- ✅ Define error handling strategy (gRPC errors → HTTP status codes)
- ✅ Document accessibility requirements for UI controls

**Output**: `data-model.md`, `quickstart.md`, `contracts/openapi.yaml`.

### Phase 2: Backend Implementation (Completed)

**Goal**: Build ApiServer with Fastify that mediates camera controls via gRPC.

**Tasks**:

- ✅ Set up Fastify application with TypeScript
- ✅ Generate gRPC client code from proto using ts-proto
- ✅ Implement camera service adapter (gRPC client wrapp (camera and video services)
- ✅ Implement camera service adapter (gRPC client wrapper)
- ✅ Implement video service adapter (gRPC client wrapper)
- ✅ Create REST endpoints: `/api/camera/zoom`, `/api/camera/focus`, `/api/camera/info`, `/api/camera/autofocus`, `/api/camera/stabilization`, `/api/video/stabilization`, `/api/stream/url`
- ✅ Add validation middleware using zod
- ✅ Implement error mapping (gRPC → HTTP status codes)
- ✅ Add logging and health check endpoint
- ✅ Write unit tests for camera and video adapters
- ✅ Write integration tests for API endpoints
- ✅ Write contract tests against local camera service and video
**Output**: Working backend in `backend/` with passing tests.

### Phase 3: Frontend Implementation (Completed)

**Goal**: Build React dashboard with HLS player and camera controls.

**Tasks**:

- ✅ Set up Vite + React + TypeScript project
- ✅ Implement Player component with hls.js integration
- ✅ Implement Controls component (Start/Stop, Zoom In/Out, Focus, Snapshot)
- ✅ Implement Toast component for user notifications (success, error, warning, info)
- ✅ Implement Dashboard page layout with modern sidebar UI
- ✅ Create API service client for backend calls (camera and video endpoints)
- ✅ Add keyboard shortcuts for controls (Space, +/-, F/D, A, S)
- ✅ Implement feature detection (hide unsupported camera features)
- ✅ Add error handling and user feedback via toast notificationssupported camera features)
- ✅ Add error handling and user feedback
- ✅ Implement accessibility features (ARIA labels, keyboard navigation)
- ✅ Write unit tests for components
- ✅ Test cross-browser compatibility

**Output**: Working frontend in `frontend/` with passing tests.

### Phase 4: Integration & E2E Testing (Completed)

**Goal**: Verify end-to-end functionality with all services running.

**Tasks**:

- ✅ Create `dev.sh` script to start all services (MediaMTX, camera-service, backend, frontend)
- ✅ Test complete user flow: start playback → adjust zoom → adjust focus → capture snapshot
- ✅ Verify playback independence (stream continues during camera commands)
- ✅ Test error scenarios (camera offline, stream unavailable)
- ✅ Verify keyboard shortcuts work correctly
- ✅ Test feature detection with different camera types (fake_simple, fake_advanced)
- ✅ Validate accessibility (keyboard navigation, screen reader compatibility)
- ✅ Performance baseline: measure stream start time, control response time

**Output**: Validated system ready for packaging.

### Phase 5: Packaging & Deployment (New - To Implement)

**Goal**: Create distributable Debian packages for production deployment.

#### Sub-Phase 5.1: Backend Package Creation

**Tasks**:

- [ ] Install and configure `pkg` for TypeScript/Node.js compilation
- [ ] Create pkg configuration file with build targets (node18-linux-x64)
- [ ] Compile backend to standalone executable (`camera-apiserver` binary)
- [ ] Test executable runs without Node.js runtime
- [ ] Create `backend/package/` directory structure matching deployment layout
- [ ] Write systemd service unit file (`camera-apiserver.service`)
- [ ] Create DEBIAN control files:
  - [ ] `control` (metadata: name, version, architecture=amd64, description)
  - [ ] `postinst` (create log dir, enable/start service)
  - [ ] `prerm` (stop service before removal)
  - [ ] `postrm` (cleanup logs and configs)
- [ ] Write `scripts/build-backend-package.sh`:
  - [ ] Compile backend with pkg
  - [ ] Copy executable to package structure
  - [ ] Copy config files and service unit
  - [ ] Build deb: `dpkg-deb --build backend/package dist/camera-apiserver_1.0.0_amd64.deb`
- [ ] Test backend package installation on clean Ubuntu VM
- [ ] Verify service starts automatically after install
- [ ] Verify service survives system reboot
- [ ] Test package removal and cleanup

**Output**: `camera-apiserver_1.0.0_amd64.deb` with automated installation.

#### Sub-Phase 5.2: Frontend Package Creation

**Tasks**:

- [ ] Run production build: `cd frontend && npm run build`
- [ ] Verify build artifacts in `frontend/dist/`
- [ ] Create `frontend/package/` directory structure
- [ ] Write nginx site configuration (`camera-webdashboard`):
  - [ ] Serve static files from `/var/www/camera-webdashboard/`
  - [ ] Proxy `/api/*` to backend at `http://localhost:3000`
  - [ ] Configure gzip compression
  - [ ] Set proper cache headers for assets
- [ ] Create DEBIAN control files:
  - [ ] `control` (metadata: name, version, architecture=all, depends=nginx)
  - [ ] `postinst` (copy files, enable nginx site, reload nginx)
  - [ ] `prerm` (disable nginx site before removal)
  - [ ] `postrm` (cleanup files)
- [ ] Write `scripts/build-frontend-package.sh`:
  - [ ] Build frontend with Vite
  - [ ] Copy dist/ to package structure
  - [ ] Copy nginx config
  - [ ] Build deb: `dpkg-deb --build frontend/package dist/camera-webdashboard_1.0.0_all.deb`
- [ ] Test frontend package installation on clean Ubuntu VM
- [ ] Verify nginx serves dashboard at `http://localhost/`
- [ ] Verify API proxying works correctly
- [ ] Test package removal and cleanup

**Output**: `camera-webdashboard_1.0.0_all.deb` with nginx integration.

#### Sub-Phase 5.3: Build Automation & CI

**Tasks**:

- [ ] Create `scripts/build-all.sh` to orchestrate both packages
- [ ] Add version management (extract from package.json or git tags)
- [ ] Add build artifacts to `.gitignore`
- [ ] Document build requirements in README
- [ ] Create installation documentation with example commands
- [ ] Add CI pipeline for package builds (optional)
- [ ] Test installation on multiple Ubuntu/Debian versions

**Output**: Automated build process and documentation.

#### Sub-Phase 5.4: Validation & Documentation

**Tasks**:

- [ ] Write deployment guide (`docs/DEPLOYMENT.md`):
  - [ ] System requirements
  - [ ] Installation steps for both packages
  - [ ] Configuration options
  - [ ] Service management commands
  - [ ] Troubleshooting guide
- [ ] Test complete installation flow:
  - [ ] Clean Ubuntu 20.04 VM
  - [ ] Clean Ubuntu 22.04 VM
  - [ ] Clean Debian 11 VM
- [ ] Verify all deployment requirements (DR-001 to DR-010)
- [ ] Verify packaging success criteria (PC-001 to PC-008)
- [ ] Document uninstallation procedure
- [ ] Create upgrade procedure documentation

**Output**: Production-ready packages with complete documentation.

### Phase 6: Documentation & Handoff

**Goal**: Finalize user documentation and operational guides.

**Tasks**:

- [ ] Update README with complete feature description
- [ ] Document API endpoints with examples
- [ ] Create operator guide for dashboard usage
- [ ] Document keyboard shortcuts reference
- [ ] Add troubleshooting guide for common issues
- [ ] Document known limitations and future enhancements
- [ ] Create deployment architecture diagram
- [ ] Document security considerations for production use

**Output**: Complete documentation suite.

## Success Validation

### Phase 5 Completion Criteria

**Backend Package**:

- [ ] Package installs without errors on Ubuntu 20.04+
- [ ] Service starts automatically after installation
- [ ] Backend binary runs without Node.js on target system
- [ ] Service survives system reboot
- [ ] API accessible at `http://localhost:3000/api/health`
- [ ] Package removal leaves no artifacts

**Frontend Package**:

- [ ] Package installs without errors on Ubuntu 20.04+
- [ ] nginx configuration applied automatically
- [ ] Dashboard accessible at `http://localhost/`
- [ ] API proxy to backend works correctly
- [ ] Static assets served with proper caching
- [ ] Package removal cleans up all files

**Integration**:

- [ ] Both packages install together without conflicts
- [ ] Complete user flow works after package installation
- [ ] Installation completes in under 30 seconds
- [ ] System resources used appropriately (memory, CPU)

## Timeline Estimate

- Phase 0 (Research): ✅ Completed
- Phase 1 (Design): ✅ Completed
- Phase 2 (Backend): ✅ Completed
- Phase 3 (Frontend): ✅ Completed
- Phase 4 (Integration): ✅ Completed
- Phase 5 (Packaging): **3-5 days**
  - Sub-Phase 5.1 (Backend Package): 1-2 days
  - Sub-Phase 5.2 (Frontend Package): 1-2 days
  - Sub-Phase 5.3 (Build Automation): 0.5 day
  - Sub-Phase 5.4 (Validation): 0.5-1 day
- Phase 6 (Documentation): 1 day

**Total Remaining**: ~4-6 days

## Risk Assessment

### Phase 5 Specific Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| `pkg` compilation fails for backend dependencies | High | Test compilation early; use `--no-bytecode` flag if needed; consider alternative like `nexe` |
| systemd service fails to start automatically | High | Test postinst script thoroughly; add service restart logic; verify permissions |
| nginx configuration conflicts with existing setup | Medium | Use unique site name; test on clean system first; document prerequisites |
| Package installation requires internet | Medium | Ensure all dependencies bundled; test in offline environment |
| Binary size too large | Low | Use compression; document storage requirements; consider splitting assets |
| Debian package structure errors | Medium | Follow Debian policy manual; validate with `lintian`; test on multiple distributions |

## Notes

- Backend executable must be self-contained with no external dependencies
- Frontend package depends on nginx but includes all application code
- Both packages must support clean uninstallation
- Installation should not require user interaction (non-interactive)
- Package versions should follow semantic versioning
- Consider adding package signing for production use in future iteration
