#!/bin/sh
set -e

# Check if node_modules exists and has packages
if [ ! -d "node_modules" ] || [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules not found or empty. Installing dependencies..."
  npm install
fi

# Check if package-lock.json is newer than node_modules
if [ "package-lock.json" -nt "node_modules" ]; then
  echo "📦 package-lock.json is newer. Updating dependencies..."
  npm install
fi

# Execute the main command
exec "$@"
