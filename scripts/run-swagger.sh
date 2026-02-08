#!/bin/bash -e

# Get the repo root directory
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Starting Swagger UI on http://localhost:8081"
echo "OpenAPI spec: ${REPO_ROOT}/contracts/openapi.yaml"
echo ""

docker run --rm -p 8081:8080 \
  -e SWAGGER_JSON=/openapi/openapi.yaml \
  -v "${REPO_ROOT}/contracts:/openapi" \
  swaggerapi/swagger-ui
