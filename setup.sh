#!/bin/bash

echo "🧊 Setting up Tesseract - Warehouse Management System"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install shared package
echo "📦 Installing shared package..."
cd shared && npm install && cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install web dependencies
echo "📦 Installing web dependencies..."
cd web && npm install && cd ..

# Install desktop dependencies
echo "📦 Installing desktop dependencies..."
cd desktop && npm install && cd ..

# Install mobile dependencies
echo "📦 Installing mobile dependencies..."
cd mobile && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application with Docker:"
echo "  docker-compose up -d"
echo ""
echo "To start development servers:"
echo "  npm run dev:backend  # Backend on http://localhost:3000"
echo "  npm run dev:web      # Web on http://localhost:5173"
echo ""
echo "For mobile development, you'll need to:"
echo "  1. Set up React Native CLI"
echo "  2. For Android: Set up Android Studio"
echo "  3. For iOS: Set up Xcode (macOS only)"
echo "  4. Run: cd mobile && npm start"
