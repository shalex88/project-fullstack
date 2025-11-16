#!/bin/bash

# Run the system for e2e tests
# Starts 1 camera video streams at rtsp://localhost:8554/camera1
# Starts 1 camera services at grpc://localhost:50051


# Cleanup function to kill all background processes
cleanup() {
    echo "Shutting down services..."
    if [ ! -z "$MTX_PID" ]; then
        kill $MTX_PID 2>/dev/null
        echo "Stopped MediaMTX (PID $MTX_PID)"
    fi
    for pid in "${CAMERA_PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    echo "Stopped Camera Services (PIDs ${CAMERA_PIDS[*]})"
    exit 0
}

# Trap EXIT, SIGINT, and SIGTERM to run cleanup
trap cleanup EXIT INT TERM

./mediamtx/mediamtx ./mediamtx/mediamtx.yml &
MTX_PID=$!
echo "Started MediaMTX with PID $MTX_PID"

./camera-service/camera-service --config ./camera-service/camera1.yaml &
CAMERA_PIDS=($!)
echo "Started Camera Services gRPC (with reflection) with PIDs ${CAMERA_PIDS[*]}"

# Wait for all background processes
wait