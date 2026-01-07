# Tesseract Project Structure

```
tesseract/
├── backend/                 # Express.js Backend API
│   ├── src/
│   │   ├── main.ts         # Application entry point
│   │   ├── app.module.ts   # Root module
│   │   ├── config/         # Configuration module
│   │   ├── database/       # Database module
│   │   ├── health/         # Health check endpoint
│   │   ├── users/          # Users CRUD
│   │   ├── orders/         # Orders CRUD
│   │   └── products/       # Products CRUD
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── web/                     # React Web Application
│   ├── src/
│   │   ├── main.tsx        # React entry point
│   │   ├── App.tsx         # Main app component
│   │   └── App.css         # Styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── desktop/                 # Electron Desktop Application
│   ├── src/
│   │   ├── main.ts         # Electron main process
│   │   └── preload.ts      # Preload script
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                  # React Native Mobile Application
│   ├── src/
│   │   └── App.tsx         # Main app component
│   ├── index.js            # React Native entry
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md           # Mobile setup instructions
│
├── shared/                  # Shared TypeScript Code
│   ├── src/
│   │   └── index.ts        # Shared types and utilities
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                  # Docker configuration
│   └── mysql/
│       └── init.sql        # MySQL initialization script
│
├── docs/                    # Documentation
│   └── stack.md            # Technology stack documentation
│
├── docker-compose.yml       # Docker Compose configuration
├── docker-compose.dev.yml   # Development overrides
├── Makefile                 # Convenience commands
├── setup.sh                 # Setup script
├── package.json             # Root package.json (workspaces)
└── README.md                # Main README

```

## Key Features

### Backend (Express.js)
- RESTful API with TypeORM
- MySQL database integration
- CRUD operations for Users, Orders, and Products
- Health check endpoint
- CORS enabled for cross-origin requests

### Web (React + Vite)
- Modern React with TypeScript
- Vite for fast development
- Proxy configuration for API calls
- Responsive UI with modern design

### Desktop (Electron)
- Wraps the web application
- Native desktop experience
- Cross-platform support (Windows, macOS, Linux)

### Mobile (React Native)
- Native mobile app
- Cross-platform (iOS and Android)
- Ready for barcode scanning integration

### Shared
- Common TypeScript types
- API response interfaces
- Utility functions
- Shared constants

## Database Schema

The following tables are automatically created by TypeORM:
- `users`: User management
- `orders`: Order management
- `products`: Product/inventory management

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

Similar endpoints exist for `/api/orders` and `/api/products`.
