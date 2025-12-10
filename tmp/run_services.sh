#!/bin/bash

# Run the system for e2e tests
# Starts 1 camera video streams at rtsp://localhost:8554/camera1
# Starts 1 camera services at grpc://localhost:50051
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup function to kill all background processes
cleanup() {
    echo "Shutting down services..."
    if [ ! -z "$MTX_PID" ]; then
        kill $MTX_PID 2>/dev/null
        echo "Stopped MediaMTX (PID $MTX_PID)"
    fi
    if [ ! -z "$VP_PID" ]; then
        kill $VP_PID 2>/dev/null
        echo "Stopped VideoPlayer (PID $VP_PID)"
    fi
    exit 0
}

# Trap EXIT, SIGINT, and SIGTERM to run cleanup
trap cleanup EXIT INT TERM

"$SCRIPT_DIR/media-server/mediamtx" "$SCRIPT_DIR/media-server/mediamtx.yml" &
MTX_PID=$!
echo "Started MediaMTX with PID $MTX_PID"

cd "$SCRIPT_DIR/../../video-player"
./video-player -c config/config.yaml &
VP_PID=$!
echo "Started VideoPlayer with PID $VP_PID"

# Wait for all background processes
wait
