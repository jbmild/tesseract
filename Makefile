.PHONY: help install dev build up down logs clean

help:
	@echo "Tesseract - Warehouse Management System"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development servers (backend + web)"
	@echo "  make build      - Build all applications"
	@echo "  make up         - Start Docker containers"
	@echo "  make down       - Stop Docker containers"
	@echo "  make logs       - View Docker logs"
	@echo "  make clean      - Clean build artifacts and node_modules"

install:
	npm install
	cd backend && npm install
	cd web && npm install
	cd desktop && npm install
	cd mobile && npm install
	cd shared && npm install

dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:3000"
	@echo "Web: http://localhost:5173"
	@concurrently "cd backend && npm run start:dev" "cd web && npm run dev"

build:
	cd shared && npm run build
	cd backend && npm run build
	cd web && npm run build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	rm -rf node_modules backend/node_modules web/node_modules desktop/node_modules mobile/node_modules shared/node_modules
	rm -rf backend/dist web/dist desktop/dist shared/dist
	docker-compose down -v
