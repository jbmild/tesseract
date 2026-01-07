# Quick Start Guide

## 🚀 Getting Started with Docker (Recommended)

The fastest way to get everything running:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f
```

This will start:
- ✅ MySQL database on port 3306
- ✅ Backend API on http://localhost:3000
- ✅ Web app on http://localhost:5173

## 📦 Manual Setup

### 1. Install Dependencies

```bash
# Run the setup script
./setup.sh

# Or manually
npm install
cd backend && npm install && cd ..
cd web && npm install && cd ..
cd desktop && npm install && cd ..
cd mobile && npm install && cd ..
cd shared && npm install && cd ..
```

### 2. Setup Database

Make sure MySQL is running, or use Docker:

```bash
docker run -d \
  --name tesseract-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=tesseract \
  -p 3306:3306 \
  mysql:8.0
```

### 3. Configure Backend

Create `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=tesseract
PORT=3000
NODE_ENV=development
```

### 4. Start Backend

```bash
cd backend
npm run start:dev
```

Backend will be available at http://localhost:3000

### 5. Start Web App

In a new terminal:
```bash
cd web
npm run dev
```

Web app will be available at http://localhost:5173

### 6. Start Desktop App

In a new terminal (after web is running):
```bash
cd desktop
npm run dev
```

### 7. Start Mobile App

For React Native, you'll need to initialize the native projects first:

```bash
cd mobile
# Follow instructions in mobile/README.md
npm start
```

## 🧪 Testing the Setup

1. **Check Backend Health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check Web App:**
   Open http://localhost:5173 in your browser

3. **Test API Endpoints:**
   ```bash
   # Create a user
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   
   # Get all users
   curl http://localhost:3000/api/users
   ```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f web

# Rebuild containers
docker-compose up -d --build

# Stop and remove everything (including volumes)
docker-compose down -v
```

## 📱 Mobile App Setup

The mobile app requires additional setup:

1. **For Android:**
   - Install Android Studio
   - Set up Android SDK
   - Create an Android emulator or connect a device
   - Run: `cd mobile && npm run android`

2. **For iOS (macOS only):**
   - Install Xcode
   - Install CocoaPods: `sudo gem install cocoapods`
   - Run: `cd mobile && npm run ios`

See `mobile/README.md` for detailed instructions.

## 🔧 Troubleshooting

### Backend won't connect to database
- Check MySQL is running: `docker ps` or `mysql -u root -p`
- Verify database credentials in `backend/.env`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Web app can't connect to backend
- Ensure backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`
- Verify proxy configuration in `web/vite.config.ts`

### Docker containers won't start
- Check Docker is running: `docker ps`
- View logs: `docker-compose logs`
- Rebuild: `docker-compose up -d --build`

## 📚 Next Steps

- Explore the API endpoints in `backend/src/`
- Customize the web UI in `web/src/`
- Add features to the desktop app in `desktop/src/`
- Integrate barcode scanning in the mobile app
- Add authentication and authorization
- Implement offline sync with RxDB or PouchDB
