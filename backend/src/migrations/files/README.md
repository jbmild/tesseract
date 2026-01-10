# Database Migrations

This directory contains database migration files that are executed automatically when the application starts.

## How Migrations Work

1. Migrations are executed in alphabetical order (by filename)
2. Each migration is tracked in the `migrations` table
3. Only pending migrations (not yet executed) will run
4. Migrations run automatically on application startup

## Creating a New Migration

1. Create a new file in this directory with the format: `XXXX-description.ts`
   - Use sequential numbers (0001, 0002, 0003, etc.)
   - Use descriptive names (e.g., `0002-add-user-indexes.ts`)

2. Export a default object with `up` and optionally `down` methods:

```typescript
import { AppDataSource } from '../../database/database';

export default {
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Your migration SQL here
      await queryRunner.query(`
        ALTER TABLE users 
        ADD INDEX idx_username (username)
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  async down(): Promise<void> {
    // Rollback logic (optional but recommended)
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(`
        ALTER TABLE users 
        DROP INDEX idx_username
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
```

3. Register the migration in `migration-runner.ts`:

```typescript
import addUserIndexes from './files/0002-add-user-indexes';

const MIGRATION_REGISTRY: { [key: string]: { up: () => Promise<void>; down?: () => Promise<void> } } = {
  '0001-initial-setup': initialSetup,
  '0002-add-user-indexes': addUserIndexes, // Add your migration here
};
```

## Best Practices

- Always use transactions in migrations
- Test migrations on a development database first
- Include rollback logic (`down` method) when possible
- Use descriptive migration names
- Keep migrations small and focused
- Never modify an already-executed migration file
