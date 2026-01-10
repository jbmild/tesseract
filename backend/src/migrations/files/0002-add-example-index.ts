import { AppDataSource } from '../../database/database';

/**
 * Example migration: Add index to users table
 * This is a demonstration migration showing how to add database indexes
 */
export default {
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if index already exists before creating
      const indexes = await queryRunner.query(`
        SHOW INDEXES FROM users WHERE Key_name = 'idx_users_username'
      `);

      if (indexes.length === 0) {
        await queryRunner.query(`
          CREATE INDEX idx_users_username ON users(username)
        `);
        console.log('  → Added index on users.username');
      } else {
        console.log('  → Index idx_users_username already exists, skipping');
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
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

      await queryRunner.query(`
        DROP INDEX idx_users_username ON users
      `);

      console.log('  → Removed index idx_users_username');
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
