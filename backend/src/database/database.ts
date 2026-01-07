import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  entities: [User, Order, Product],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};
