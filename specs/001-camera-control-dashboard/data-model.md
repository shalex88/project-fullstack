# Data Model: Camera Control Dashboard & ApiServer

## Entities

- Camera
  - id: string (e.g., "camera1")
  - hlsUrl: string (e.g., `http://localhost:8888/camera1/index.m3u8`)
  - capabilities: { zoom: boolean, focus: boolean, autofocus: boolean, stabilization: boolean }
  - status: { connected: boolean, message?: string }

- PlayerSession
  - cameraId: string
  - state: "starting" | "live" | "reconnecting" | "stopped"
  - startedAt?: ISO timestamp
  - lastError?: string

- ControlCommand
  - type: "setZoom" | "getZoom" | "setFocus" | "getFocus" | "setAutofocus" | "setStabilization"
  - payload: object (per command)
  - outcome: "success" | "error"
  - message?: string

- ToastNotification
  - id: string
  - message: string
  - type: "info" | "success" | "warning" | "error"
  - createdAt: timestamp

- User (future)
  - role: "operator" | "viewer" | "admin" (not used in MVP)

## API Shapes (HTTP)

### Camera API

- GET /api/camera/zoom
  - 200: { zoom: number }

- POST /api/camera/zoom { zoom: number }
  - 200: { zoom: number }

- GET /api/camera/focus
  - 200: { focus: number }
  - 503: { error: string, message: string } (when autofocus is enabled)

- POST /api/camera/focus { focus: number }
  - 200: { focus: number }
  - 503: { error: string, message: string } (when autofocus is enabled)

- POST /api/camera/autofocus { enable: boolean }
  - 200: { enable: boolean }

- POST /api/camera/stabilization { enable: boolean }
  - 200: { enable: boolean }

- GET /api/camera/info
  - 200: { info: string }

### Video API

- POST /api/video/stabilization { enable: boolean }
  - 200: { enable: boolean }
  - Note: Uses video service gRPC (EnableOptionalElement/DisableOptionalElement with element="myf2f")

### Stream API

- GET /api/stream/url
  - 200: { url: string }  # HLS URL for frontend player

### Health API

- GET /api/health
  - 200: { status: string }

## gRPC Mapping

### Camera Service (camera_service.proto)

- SetZoom { zoom: int32 } → SetZoomResponse {}
- GetZoom {} → GetZoomResponse { zoom: int32 }
- SetFocus { focus: int32 } → SetFocusResponse {}
- GetFocus {} → GetFocusResponse { focus: int32 }
- SetAutoFocus { enable: bool } → SetAutoFocusResponse {}
- SetStabilization { enable: bool } → SetStabilizationResponse {}
- GetInfo {} → GetInfoResponse { info: string }

### Video Service (video_service.proto)

- EnableOptionalElement { element: string } → EnableOptionalElementResponse {}
- DisableOptionalElement { element: string } → DisableOptionalElementResponse {}
  - Used for video stabilization with element="myf2f"

## Frontend State Management

### Dashboard State

- streamUrl: string (from /api/stream/url)
- isPlaying: boolean (local player state)
- zoom: number (synced with camera)
- zoomInput: string (user input field)
- focus: number (synced with camera)
- focusInput: string (user input field)
- autofocus: boolean (camera setting)
- stabilization: boolean (video service setting)
- cameraInfo: string (from /api/camera/info)
- connected: boolean (server reachability)
- capabilities: CameraCapabilities (feature detection)
- toasts: ToastMessage[] (user notifications)

### Feature Detection

The frontend automatically detects which camera features are available by:
1. Attempting to call each API endpoint
2. Checking for 500/501 status codes (not implemented)
3. Updating the `capabilities` object to enable/disable UI controls
4. Gracefully handling unsupported features
