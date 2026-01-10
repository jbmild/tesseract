import { AppDataSource } from '../../database/database';

/**
 * Migration Template
 * 
 * Copy this file and rename it with the format: XXXX-description.ts
 * Replace XXXX with the next sequential number
 * 
 * Example: 0002-add-user-indexes.ts
 */
export default {
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // TODO: Add your migration SQL here
      // Example:
      // await queryRunner.query(`
      //   ALTER TABLE users 
      //   ADD COLUMN new_field VARCHAR(255) NULL
      // `);

      console.log('  → Migration executed successfully');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  async down(): Promise<void> {
    // TODO: Add rollback logic here
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Example rollback:
      // await queryRunner.query(`
      //   ALTER TABLE users 
      //   DROP COLUMN new_field
      // `);

      console.log('  → Migration rolled back successfully');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
