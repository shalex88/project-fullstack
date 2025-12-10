#!/bin/bash
set -euo pipefail

echo "Installing Node.js 20 LTS..."

# Install curl if not present
sudo apt-get update
sudo apt-get install -y curl

# Remove old Node.js versions and related packages
sudo apt-get remove -y nodejs npm libnode-dev libnode72 || true
sudo apt-get autoremove -y

# Install Node.js 20 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Installing project dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd "$(dirname "$0")/backend"
rm -rf node_modules package-lock.json
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd "$(dirname "$0")/../frontend"
rm -rf node_modules package-lock.json
npm install

echo "Installation complete!"
echo "You can now run ./dev.sh to start the development environment"