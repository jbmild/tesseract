import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { initializeDatabase } from './database/database';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import rolesRoutes from './routes/roles.routes';
import permissionsRoutes, { setAppInstance } from './routes/permissions.routes';
import clientsRoutes from './routes/clients.routes';
import locationsRoutes from './routes/locations.routes';
import warehousesRoutes from './routes/warehouses.routes';
import exclusionsRoutes from './routes/exclusions.routes';
import productsRoutes from './routes/products.routes';
import { PermissionsService } from './permissions/permissions.service';
import { authenticateToken } from './auth/auth.middleware';
import { clientContextMiddleware } from './middleware/client-context.middleware';

// Load environment variables (only if not already set, e.g., in Docker)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dotenv = require('dotenv');
  if (dotenv && dotenv.config) {
    dotenv.config();
  }
} catch (error) {
  // dotenv not available or already configured via environment
  console.log('Environment variables loaded from system');
}

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Protected routes (require authentication and client context)
app.use('/api/users', authenticateToken, clientContextMiddleware, usersRoutes);
app.use('/api/roles', authenticateToken, clientContextMiddleware, rolesRoutes);
app.use('/api/permissions', authenticateToken, clientContextMiddleware, permissionsRoutes);
app.use('/api/clients', authenticateToken, clientContextMiddleware, clientsRoutes);
app.use('/api/locations', authenticateToken, clientContextMiddleware, locationsRoutes);
app.use('/api/warehouses', authenticateToken, clientContextMiddleware, warehousesRoutes);
app.use('/api/warehouse-exclusions', authenticateToken, clientContextMiddleware, exclusionsRoutes);
app.use('/api/products', authenticateToken, clientContextMiddleware, productsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Initialize database and start server
async function bootstrap() {
  try {
    await initializeDatabase();
    
    // Set app instance for route scanning
    setAppInstance(app);
    
    // Sync permissions from routes on startup
    try {
      const permissionsService = new PermissionsService();
      const syncedPermissions = await permissionsService.syncFromRoutes(app);
      console.log(`✅ Synced ${syncedPermissions.length} permissions from routes`);
      
      // Run seed migration after permissions are synced
      const { runSeedMigration } = await import('./migrations/seed-runner');
      await runSeedMigration();
    } catch (error) {
      console.warn('⚠️  Failed to sync permissions on startup:', error);
    }
    
    app.listen(port, () => {
      console.log(`🚀 Backend server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
