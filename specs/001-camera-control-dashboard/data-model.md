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
  - type: "setZoom" | "getZoom" | "setFocus" | "getFocus" | "enableAutofocus" | "enableStabilization" | "goToMinZoom" | "goToMaxZoom"
  - payload: object (per command)
  - outcome: "success" | "error"
  - message?: string

- User (future)
  - role: "operator" | "viewer" | "admin" (not used in MVP)

## API Shapes (HTTP)

- POST /api/camera/zoom { zoom: number }
  - 200: { zoom: number }

- GET /api/camera/zoom
  - 200: { zoom: number }

- POST /api/camera/focus { focus: number }
  - 200: { focus: number }

- GET /api/camera/focus
  - 200: { focus: number }

- POST /api/camera/autofocus { enable: boolean }
  - 200: { enable: boolean }

- POST /api/camera/stabilization { enable: boolean }
  - 200: { enable: boolean }

- GET /api/camera/info
  - 200: { info: string }

- GET /api/stream/url
  - 200: { url: string }  # HLS URL for frontend player

## gRPC Mapping (to camera_service.proto)

- SetZoomRequest { zoom } → SetZoomResponse {}
- GetZoomRequest {} → GetZoomResponse { zoom }
- SetFocusRequest { focus } → SetFocusResponse {}
- GetFocusRequest {} → GetFocusResponse { focus }
- EnableAutoFocusRequest { enable } → EnableAutoFocusResponse {}
- EnableStabilizationRequest { enable } → EnableStabilizationResponse {}
- GoToMinZoomRequest {} → GoToMinZoomResponse {}
- GoToMaxZoomRequest {} → GoToMaxZoomResponse {}
- GetInfoRequest {} → GetInfoResponse { info }
