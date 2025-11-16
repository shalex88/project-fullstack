# Feature Specification: Camera Control Dashboard & ApiServer

**Feature Branch**: `[001-camera-control-dashboard]`
**Created**: 2025-11-16
**Status**: Draft
**Input**: User description: "Build a fullstack web app that can control a video camera. Back-end (aka ApiServer) will serve as a mediator an communicate with the actual camera service. Front-end (aka WebDashboard) will show the video stream and buttons to constrol the camera."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View Live Playback & Basic Control (Priority: P1)

An operator opens the WebDashboard, connects to a camera, sees the live video playback (HLS), and can start/stop playback and adjust zoom using on-screen controls. Playback is independent of camera commands.

**Why this priority**: This is the core value: visualize the camera feed and basic control, enabling immediate operations and demos.

**Independent Test**: From the dashboard, start playback for a camera and verify the video is visible and zoom changes produce observable framing changes while playback can be started/stopped. Camera commands function regardless of playback state.

**Acceptance Scenarios**:

1. Given the dashboard is loaded, When the operator clicks "Start Playback", Then a live video stream is displayed.
2. Given a live video is visible, When the operator clicks "Zoom In", Then the stream shows a tighter framing.
3. Given a live video is visible, When the operator clicks "Stop Playback", Then playback stops and the UI reflects the stopped state.

---

### User Story 2 - Zoom & Snapshot (Priority: P2)

An operator can zoom in/out to refine the view and take a snapshot image from the live stream to confirm positioning or archive a frame.

**Why this priority**: Enhances operational capability beyond basic navigation; snapshot supports verification and record-keeping needs.

**Independent Test**: With an active stream, execute zoom in/out and capture a snapshot; verify zoom visibly changes framing and snapshot is produced for download/view.

**Acceptance Scenarios**:

1. Given a live stream, When the operator clicks Zoom In, Then the stream shows a tighter framing.
2. Given a live stream, When the operator clicks Snapshot, Then a still image of the current frame is produced and available to the user.

---

### User Story 3 - Camera Settings & Status (Priority: P3)

An operator can view and modify camera settings (e.g., resolution, frame rate, focus mode) and see status (connected/offline, current PTZ values).

**Why this priority**: Improves control fidelity and transparency, useful for troubleshooting and consistent operation.

**Independent Test**: Open settings, adjust one setting (e.g., resolution) within allowed options, apply it, and verify the dashboard reflects the change and status stays coherent.

**Acceptance Scenarios**:

1. Given a connected camera, When the operator selects a different resolution, Then the new resolution is applied and reflected in the dashboard.
2. Given a connected camera, When the connection drops, Then the dashboard shows an offline state and disables unavailable controls.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Camera offline or unreachable during start: show clear error, allow retry, keep controls disabled until connected.
- Stream starts but stalls mid-session: show reconnecting indicator and auto-retry with backoff.
- Conflicting commands (e.g., rapid zoom in/out): queue or throttle to avoid oscillation; UI shows busy state.
- Permission-limited operator: disable restricted controls and show tooltip explaining required role.
- Snapshot during stream stop: inform user snapshot unavailable without active stream.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: WebDashboard MUST display a live HLS video for a selected camera when the operator starts playback.
- **FR-002**: WebDashboard MUST provide controls for Start/Stop playback and Zoom In/Out.
- **FR-003**: WebDashboard MUST provide snapshot capture from playback when active.
- **FR-004**: ApiServer MUST mediate camera commands only (zoom, focus, info, etc.) to the camera service; video playback is independent and MUST NOT be proxied or controlled via ApiServer.
- **FR-005**: System MUST present clear status and errors (connected, offline, busy, action succeeded/failed) and disable controls when actions are not available.
- **FR-006**: For MVP, the system operates without authentication; access is expected to be restricted to a trusted/local environment. A follow-up iteration will add authentication and roles.
- **FR-007**: System MUST support controlling a single camera (no multi-camera selection in MVP).
- **FR-008**: System will not persist operator preferences in MVP; settings reset each session.
- **FR-009**: System MUST log control actions (who did what and when) for auditability without exposing implementation details to users.
- **FR-010**: System MUST provide accessible controls (keyboard-operable, visible focus, sufficient contrast) and user-friendly messages.

### Key Entities *(include if feature involves data)*

- **Camera**: A controllable device with attributes such as identifier, connection status, supported capabilities (zoom, focus, snapshot), and settings (resolution, frame rate).
- **PlayerSession**: A client-side playback session linking an operator to a camera with state (starting, live, reconnecting, stopped) and timing metadata; does not control camera streaming lifecycle.
- **ControlCommand**: A user-triggered action (zoom, focus, start/stop, snapshot) with parameters and outcome status.
- **User**: An authenticated actor with role(s) determining permitted controls and settings access.

### Assumptions & Dependencies

- Assumption: MVP targets a single camera; multi-camera selection is out of scope and can be considered in a future iteration.
- Assumption: The camera service exposes operations for zoom/focus/info; no camera-side stream lifecycle control is required. Video playback is provided independently by MediaMTX (HLS).
- Assumption: MVP operates within a trusted/local environment without user authentication; security hardening will be added in a subsequent iteration.
- Dependency: Availability of a reachable camera service endpoint in non-production environments for testing.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Operators see a live stream within 2 seconds for at least 95% of start attempts under expected network conditions.
- **SC-002**: Zoom adjustments produce a visible framing change within 300 ms for at least 95% of actions during an active stream.
- **SC-003**: 90% of operators can successfully complete the P1 flow (start playback, zoom in or out, stop playback) on the first attempt without assistance.
- **SC-004**: Snapshot is produced within 1 second for at least 95% of requests while a stream is active.
- **SC-005**: Dashboard reflects offline or error states within 1 second of detection and prevents unavailable actions.
