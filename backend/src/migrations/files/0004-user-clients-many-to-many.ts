import { AppDataSource } from '../../database/database';

/**
 * Migration to convert user-client relationship from one-to-many to many-to-many
 * Creates user_clients join table and migrates existing data
 */
export default {
  name: '0004-user-clients-many-to-many',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create user_clients join table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`user_clients\` (
          \`userId\` int NOT NULL,
          \`clientId\` int NOT NULL,
          PRIMARY KEY (\`userId\`, \`clientId\`),
          KEY \`FK_user_clients_userId\` (\`userId\`),
          KEY \`FK_user_clients_clientId\` (\`clientId\`),
          CONSTRAINT \`FK_user_clients_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT \`FK_user_clients_clientId\` FOREIGN KEY (\`clientId\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB;
      `);

      // Migrate existing data from users.clientId to user_clients join table
      // Check if clientId column exists before migrating
      const columns = await queryRunner.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'clientId'
      `);
      
      if (columns.length > 0) {
        await queryRunner.query(`
          INSERT INTO \`user_clients\` (\`userId\`, \`clientId\`)
          SELECT \`id\`, \`clientId\` FROM \`users\`
          WHERE \`clientId\` IS NOT NULL
          ON DUPLICATE KEY UPDATE \`userId\` = \`userId\`;
        `);
      }

      // Remove the old clientId column from users table (if it exists)
      const clientIdColumn = await queryRunner.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'clientId'
      `);
      
      if (clientIdColumn.length > 0) {
        // Check and drop foreign key if it exists
        const foreignKeys = await queryRunner.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND CONSTRAINT_NAME = 'FK_users_clientId'
        `);
        
        if (foreignKeys.length > 0) {
          await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_clientId\`;
          `);
        }
        
        // Drop index if it exists
        const indexes = await queryRunner.query(`
          SELECT INDEX_NAME 
          FROM INFORMATION_SCHEMA.STATISTICS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND INDEX_NAME = 'FK_users_clientId'
        `);
        
        if (indexes.length > 0) {
          await queryRunner.query(`
            ALTER TABLE \`users\` DROP INDEX \`FK_users_clientId\`;
          `);
        }
        
        // Drop the column
        await queryRunner.query(`
          ALTER TABLE \`users\` DROP COLUMN \`clientId\`;
        `);
      }

      console.log('Migration 0004-user-clients-many-to-many applied: Converted user-client relationship to many-to-many.');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  },

  async down(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Add back the clientId column to users table
      await queryRunner.query(`
        ALTER TABLE \`users\` 
        ADD COLUMN \`clientId\` int DEFAULT NULL,
        ADD KEY \`FK_users_clientId\` (\`clientId\`),
        ADD CONSTRAINT \`FK_users_clientId\` FOREIGN KEY (\`clientId\`) REFERENCES \`clients\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE;
      `);

      // Migrate data back (take first client for each user)
      await queryRunner.query(`
        UPDATE \`users\` u
        INNER JOIN (
          SELECT \`userId\`, MIN(\`clientId\`) as \`clientId\`
          FROM \`user_clients\`
          GROUP BY \`userId\`
        ) uc ON u.\`id\` = uc.\`userId\`
        SET u.\`clientId\` = uc.\`clientId\`;
      `);

      // Drop the join table
      await queryRunner.query(`
        DROP TABLE IF EXISTS \`user_clients\`;
      `);

      console.log('Migration 0004-user-clients-many-to-many rolled back: Reverted to one-to-many relationship.');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  },
};
