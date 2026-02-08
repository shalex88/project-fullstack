#!/bin/bash

# Run the system for e2e tests
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
    if [ ! -z "$SC_PID" ]; then
        kill $SC_PID 2>/dev/null
        echo "Stopped SensorCore (PID $SC_PID)"
    fi
    exit 0
}

# Trap EXIT, SIGINT, and SIGTERM to run cleanup
trap cleanup EXIT INT TERM

cd "$SCRIPT_DIR/../../sensor-core"
./sensor-core -c config/config.yaml &
SC_PID=$!
echo "Started SensorCore with PID $SC_PID"

cd "$SCRIPT_DIR/../../video-player"
./video-player -c config/config_cam1.yaml &
VP_PID=$!
echo "Started VideoPlayer with PID $VP_PID"

"$SCRIPT_DIR/../../media-server/mediamtx" "$SCRIPT_DIR/../../media-server/mediamtx.yml" &
MTX_PID=$!
echo "Started MediaMTX with PID $MTX_PID"

# Wait for all background processes
wait
