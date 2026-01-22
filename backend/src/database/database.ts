import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { Client } from '../clients/client.entity';
import { Location } from '../locations/location.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { Migration } from '../migrations/migration.entity';

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  entities: [User, Role, Permission, Client, Location, Warehouse, Migration],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run migrations after database connection is established
    const { runMigrations } = await import('../migrations/migration-runner');
    await runMigrations();
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};
