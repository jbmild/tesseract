import { AppDataSource } from '../database/database';
import { Migration } from './migration.entity';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationFile {
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

// Migration registry - add new migrations here
import initialSetup from './files/0001-initial-setup';
import addExampleIndex from './files/0002-add-example-index';
import seedInitialData from './files/0003-seed-initial-data';

const MIGRATION_REGISTRY: { [key: string]: { up: () => Promise<void>; down?: () => Promise<void> } } = {
  '0001-initial-setup': initialSetup,
  '0002-add-example-index': addExampleIndex,
  '0003-seed-initial-data': seedInitialData,
  // Add more migrations here as you create them
};

/**
 * Load all migration files from the registry
 */
function loadMigrations(): MigrationFile[] {
  const migrations: MigrationFile[] = [];

  // Get all migration names and sort them
  const migrationNames = Object.keys(MIGRATION_REGISTRY).sort();

  for (const name of migrationNames) {
    const migration = MIGRATION_REGISTRY[name];
    if (migration && typeof migration.up === 'function') {
      migrations.push({
        name,
        up: migration.up,
        down: migration.down,
      });
    }
  }

  return migrations;
}

/**
 * Get all executed migrations from the database
 */
async function getExecutedMigrations(): Promise<string[]> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    
    // Check if migrations table exists first
    const tableExists = await queryRunner.hasTable('migrations');
    if (!tableExists) {
      return [];
    }
    
    const migrations = await queryRunner.query(`
      SELECT name FROM migrations 
      ORDER BY executedAt ASC
    `);
    
    return migrations.map((m: any) => m.name);
  } catch (error) {
    // If migrations table doesn't exist or query fails, return empty array
    return [];
  } finally {
    await queryRunner.release();
  }
}

/**
 * Create the migrations table if it doesn't exist
 */
async function ensureMigrationsTable(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    
    // Check if migrations table exists
    const tableExists = await queryRunner.hasTable('migrations');
    
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE \`migrations\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(255) NOT NULL,
          \`executedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY \`IDX_migrations_name\` (\`name\`),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created migrations table');
    }
  } finally {
    await queryRunner.release();
  }
}

/**
 * Record a migration as executed
 */
async function recordMigration(name: string): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.query(`
      INSERT INTO migrations (name, executedAt, createdAt)
      VALUES (?, NOW(), NOW())
    `, [name]);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Load all migration files
    const migrationFiles = await loadMigrations();
    
    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migrations found');
      return;
    }

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      m => !executedMigrations.includes(m.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date');
      return;
    }

    console.log(`📦 Found ${pendingMigrations.length} pending migration(s)`);

    // Run pending migrations in order
    for (const migration of pendingMigrations) {
      try {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.up();
        await recordMigration(migration.name);
        console.log(`✅ Migration ${migration.name} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} failed:`, error);
        throw error;
      }
    }

    console.log(`✅ All ${pendingMigrations.length} migration(s) completed successfully`);
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  }
}
