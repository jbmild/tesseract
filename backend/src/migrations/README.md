# Database Migration System

The migration system automatically runs database migrations when the application starts. It ensures your database schema stays in sync with your application code.

## How It Works

1. **Automatic Execution**: Migrations run automatically when the backend starts
2. **Ordered Execution**: Migrations run in alphabetical order (by filename)
3. **Tracking**: Each executed migration is recorded in the `migrations` table
4. **Idempotent**: Migrations only run once - already executed migrations are skipped

## Migration Flow

```
App Starts → Database Connection → Check Migrations Table → 
Load Migration Files → Compare with Executed → Run Pending → Record Success
```

## Creating a New Migration

### Step 1: Create Migration File

Create a new file in `src/migrations/files/` with the format:
```
XXXX-description.ts
```

Where `XXXX` is a sequential number (0001, 0002, 0003, etc.)

Example: `0003-add-user-email-index.ts`

### Step 2: Write Migration Code

Use the template from `migration-template.ts`:

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
        CREATE INDEX idx_user_email ON users(email)
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
    // Rollback logic
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(`
        DROP INDEX idx_user_email ON users
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

### Step 3: Register Migration

Add your migration to the registry in `migration-runner.ts`:

```typescript
import addUserEmailIndex from './files/0003-add-user-email-index';

const MIGRATION_REGISTRY = {
  '0001-initial-setup': initialSetup,
  '0002-add-example-index': addExampleIndex,
  '0003-add-user-email-index': addUserEmailIndex, // Add here
};
```

## Migration Best Practices

1. **Always Use Transactions**: Wrap your migration in a transaction for safety
2. **Include Rollback Logic**: Implement the `down()` method for rollbacks
3. **Check Before Creating**: Check if indexes/columns exist before creating them
4. **Test First**: Always test migrations on a development database
5. **Never Modify Executed Migrations**: Once a migration runs, don't change it
6. **Use Descriptive Names**: Make migration names clear and descriptive
7. **Keep Migrations Small**: One logical change per migration

## Migration Table

The system automatically creates a `migrations` table to track executed migrations:

```sql
CREATE TABLE migrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Checking Migration Status

You can check which migrations have been executed by querying the database:

```sql
SELECT * FROM migrations ORDER BY executedAt ASC;
```

## Example Migrations

- `0001-initial-setup.ts` - Initial placeholder migration
- `0002-add-example-index.ts` - Example migration adding an index

## Troubleshooting

- **Migration fails**: Check the error logs, fix the issue, and restart
- **Migration already executed**: The system will skip it automatically
- **Need to re-run**: Remove the migration record from the `migrations` table (not recommended)
