# Backend

## Build executable

cd backend
npm run build
npx pkg . --output sensor-api-server --targets linux-arm64
ls -lh sensor-api-server && file sensor-api-server
Supply .proto file
Supply config file with environment variables