#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_LOG="$ROOT_DIR/tmp/services.log"
BACKEND_LOG="$ROOT_DIR/backend/backend.log"
FRONTEND_LOG="$ROOT_DIR/frontend/frontend.log"

SERVICES_PID=""
BACKEND_PID=""
FRONTEND_PID=""
SRV_TAIL=""
BE_TAIL=""
FE_TAIL=""

cleanup() {
  echo "\n[dev] Cleaning up..."
  # Stop log tailers first
  if [[ -n "${SRV_TAIL}" ]] && kill -0 "${SRV_TAIL}" 2>/dev/null; then
    kill "${SRV_TAIL}" 2>/dev/null || true
  fi
  if [[ -n "${BE_TAIL}" ]] && kill -0 "${BE_TAIL}" 2>/dev/null; then
    kill "${BE_TAIL}" 2>/dev/null || true
  fi
  if [[ -n "${FE_TAIL}" ]] && kill -0 "${FE_TAIL}" 2>/dev/null; then
    kill "${FE_TAIL}" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    echo "[dev] Stopping frontend (PID ${FRONTEND_PID})"
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo "[dev] Stopping backend (PID ${BACKEND_PID})"
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${SERVICES_PID}" ]] && kill -0 "${SERVICES_PID}" 2>/dev/null; then
    echo "[dev] Stopping media services (PID ${SERVICES_PID})"
    kill "${SERVICES_PID}" 2>/dev/null || true
  fi
  echo "[dev] Done."
}
trap cleanup EXIT INT TERM

# Proactively clean any stale dev processes using project binaries
echo "[dev] Cleaning any previous dev processes..."
pkill -f "$ROOT_DIR/tmp/mediamtx/mediamtx" 2>/dev/null || true
pkill -f "$ROOT_DIR/tmp/camera-service/camera-service" 2>/dev/null || true
pkill -f "tsx watch src/api/server.ts" 2>/dev/null || true
pkill -f "vite.*--host" 2>/dev/null || true
sleep 0.5

echo "[dev] Starting local media stack (MediaMTX + camera-service)..."
chmod +x "$ROOT_DIR/tmp/run_services.sh" 2>/dev/null || true
(cd "$ROOT_DIR/tmp" && ./run_services.sh) >"$SERVICES_LOG" 2>&1 &
SERVICES_PID=$!
echo "[dev] Services PID: ${SERVICES_PID} (logs: $SERVICES_LOG)"

echo "[dev] Preparing backend..."
pushd "$ROOT_DIR/backend" >/dev/null
if [[ ! -d node_modules ]]; then
  echo "[dev] Installing backend dependencies..."
  npm install
fi
if [[ ! -f .env ]]; then
  echo "[dev] Creating backend .env from sample..."
  if [[ -f .env.sample ]]; then
    cp .env.sample .env
  else
    echo "PORT=3000" > .env
    echo "CAMERA_GRPC=localhost:50051" >> .env
    echo "HLS_URL=http://localhost:8888/camera1/index.m3u8" >> .env
  fi
fi
port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk '{print $4}' | grep -E "[:\.]${port}$" >/dev/null 2>&1
  else
    lsof -iTCP -sTCP:LISTEN -nP 2>/dev/null | awk '{print $9}' | grep -E ":${port}$" >/dev/null 2>&1
  fi
}

if port_in_use 3000; then
  echo "[dev] Backend port 3000 already in use; skipping start."
  BACKEND_PID=""
else
  echo "[dev] Starting backend dev server..."
  npm run dev >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
fi
popd >/dev/null
if [[ -n "${BACKEND_PID}" ]]; then
  echo "[dev] Backend PID: ${BACKEND_PID} (logs: $BACKEND_LOG)"
else
  echo "[dev] Backend assumed running at http://localhost:3000 (existing process)"
fi

echo "[dev] Preparing frontend..."
pushd "$ROOT_DIR/frontend" >/dev/null
if [[ ! -d node_modules ]]; then
  echo "[dev] Installing frontend dependencies..."
  npm install
fi
if port_in_use 5173; then
  echo "[dev] Frontend port 5173 already in use; skipping start."
  FRONTEND_PID=""
else
  echo "[dev] Starting frontend dev server..."
  # Pass --host to allow access from other devices if needed
  npm run dev -- --host >"$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
fi
popd >/dev/null
if [[ -n "${FRONTEND_PID}" ]]; then
  echo "[dev] Frontend PID: ${FRONTEND_PID} (logs: $FRONTEND_LOG)"
else
  echo "[dev] Frontend assumed running at http://localhost:5173 (existing process)"
fi

echo "\n[dev] Ready! Open these URLs:"
echo "- Backend health:   http://localhost:3000/api/health"
echo "- Stream URL API:   http://localhost:3000/api/stream/url"
echo "- Frontend (Vite):  http://localhost:5173"
echo "- HLS stream (raw): http://localhost:8888/camera1/index.m3u8"

echo "\n[dev] Tailing logs (Ctrl+C to stop):"
echo "--- $SERVICES_LOG ---"
tail -n +1 -f "$SERVICES_LOG" &
SRV_TAIL=$!
echo "--- $BACKEND_LOG ---"
tail -n +1 -f "$BACKEND_LOG" &
BE_TAIL=$!
echo "--- $FRONTEND_LOG ---"
tail -n +1 -f "$FRONTEND_LOG" &
FE_TAIL=$!

# Keep script running until interrupted
wait
