#!/bin/sh
set -e

# Change to app directory
cd /app || exit 1

echo "🔍 Ensuring dependencies are installed..." >&2

# Always run npm install to ensure dependencies are present
# This handles cases where node_modules is empty or missing due to volume mounts
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found!" >&2
  exit 1
fi

# Check if key dependencies exist, if not, install everything
if [ ! -d "node_modules" ] || [ ! -d "node_modules/react" ] || [ ! -d "node_modules/vite" ]; then
  echo "📦 Installing dependencies..." >&2
  npm install >&2
  echo "✅ Dependencies installed successfully" >&2
else
  echo "✅ Dependencies are present" >&2
fi

# Execute the main command
echo "🚀 Starting application..." >&2
exec "$@"
