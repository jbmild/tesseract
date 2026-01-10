import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { initializeDatabase } from './database/database';
import healthRoutes from './routes/health.routes';
import usersRoutes from './routes/users.routes';
import ordersRoutes from './routes/orders.routes';
import productsRoutes from './routes/products.routes';

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

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);

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
    
    app.listen(port, () => {
      console.log(`🚀 Backend server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
