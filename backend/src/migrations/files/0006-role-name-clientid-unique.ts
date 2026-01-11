import { AppDataSource } from '../../database/database';

/**
 * Migration to change role name unique constraint to composite unique (name, clientId)
 * This allows roles with the same name across different clients, but unique within a client
 */
export default {
  name: '0006-role-name-clientid-unique',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if the old unique index on name exists
      const indexes = await queryRunner.query(`
        SHOW INDEXES FROM roles WHERE Key_name = 'IDX_roles_name'
      `);

      if (indexes.length > 0) {
        // Drop the old unique constraint on name
        await queryRunner.query(`
          ALTER TABLE roles DROP INDEX IDX_roles_name
        `);
        console.log('  → Dropped old unique index on roles.name');
      }

      // Check if the composite unique index already exists
      const compositeIndexes = await queryRunner.query(`
        SHOW INDEXES FROM roles WHERE Key_name = 'IDX_roles_name_clientId'
      `);

      if (compositeIndexes.length === 0) {
        // Create composite unique index on (name, clientId)
        await queryRunner.query(`
          CREATE UNIQUE INDEX IDX_roles_name_clientId ON roles(name, clientId)
        `);
        console.log('  → Created composite unique index on roles(name, clientId)');
      } else {
        console.log('  → Composite unique index already exists, skipping');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0006-role-name-clientid-unique completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0006-role-name-clientid-unique failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  async down(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Drop the composite unique index
      const compositeIndexes = await queryRunner.query(`
        SHOW INDEXES FROM roles WHERE Key_name = 'IDX_roles_name_clientId'
      `);

      if (compositeIndexes.length > 0) {
        await queryRunner.query(`
          ALTER TABLE roles DROP INDEX IDX_roles_name_clientId
        `);
        console.log('  → Dropped composite unique index on roles(name, clientId)');
      }

      // Restore the old unique constraint on name
      const indexes = await queryRunner.query(`
        SHOW INDEXES FROM roles WHERE Key_name = 'IDX_roles_name'
      `);

      if (indexes.length === 0) {
        await queryRunner.query(`
          CREATE UNIQUE INDEX IDX_roles_name ON roles(name)
        `);
        console.log('  → Restored unique index on roles.name');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0006-role-name-clientid-unique completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0006-role-name-clientid-unique failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
