# Tesseract
The cosmic cube that controls your warehouse Space

## Project Structure

This is a monorepo containing:
- **Backend**: Express.js API with MySQL database
- **Web**: React + TypeScript web application
- **Desktop**: Electron desktop application
- **Mobile**: React Native mobile application
- **Shared**: Shared TypeScript types and utilities

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for running the full stack)
- For mobile development: React Native CLI and Android Studio / Xcode

## Quick Start with Docker

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust if needed
3. Run the entire stack:
   ```bash
   # Use either command (both work):
   docker compose up -d    # Docker Compose v2 (recommended)
   # or
   docker-compose up -d    # Legacy v1 syntax (alias available)
   ```

**Note for WSL users**: If `docker-compose` is not found, use `docker compose` (with a space) or reload your shell after the alias is added:
   ```bash
   source ~/.bashrc
   ```

This will start:
- MySQL database on port 3306
- Backend API on port 3000
- Web application on port 5173

## Development Setup

### Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm run install:backend
npm run install:web
npm run install:desktop
npm run install:mobile
```

### Run Applications

#### Backend
```bash
npm run dev:backend
# or
cd backend && npm run start:dev
```

#### Web
```bash
npm run dev:web
# or
cd web && npm run dev
```

#### Desktop
```bash
npm run dev:desktop
# or
cd desktop && npm run dev
```

#### Mobile
```bash
cd mobile && npm start
# Then in separate terminals:
npm run android  # for Android
npm run ios      # for iOS
```

## Building for Production

```bash
# Build backend
npm run build:backend

# Build web
npm run build:web

# Build desktop
npm run build:desktop
```

## Docker Commands

```bash
# Start all services
docker compose up -d    # or: docker-compose up -d

# Stop all services
docker compose down     # or: docker-compose down

# View logs
docker compose logs -f  # or: docker-compose logs -f

# Rebuild containers
docker compose up -d --build  # or: docker-compose up -d --build

# Stop and remove volumes (clears database)
docker compose down -v  # or: docker-compose down -v
```

**Note**: Docker Compose v2 uses `docker compose` (space). The legacy `docker-compose` (hyphen) command is available as an alias if needed.

## API Endpoints

- Health: `GET /api/health`
- Users: `GET /api/users`, `POST /api/users`, etc.
- Orders: `GET /api/orders`, `POST /api/orders`, etc.
- Products: `GET /api/products`, `POST /api/products`, etc.

## Technology Stack

- **Language**: TypeScript
- **Backend**: Express.js with TypeORM
- **Database**: MySQL 8.0
- **Web**: React + Vite
- **Desktop**: Electron
- **Mobile**: React Native
- **Containerization**: Docker & Docker Compose
