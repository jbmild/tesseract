import { AppDataSource } from '../../database/database';
import { QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration to create locations table
 * - id: primary key
 * - name: location name
 * - clientId: foreign key to clients table (required)
 * - createdAt: timestamp
 * - updatedAt: timestamp
 */
export default {
  name: '0007-create-locations-table',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if locations table already exists
      const locationsTable = await queryRunner.getTable('locations');
      if (!locationsTable) {
        // Create locations table
        await queryRunner.createTable(
          new Table({
            name: 'locations',
            columns: [
              {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'name',
                type: 'varchar',
                length: '255',
                isNullable: false,
              },
              {
                name: 'clientId',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'createdAt',
                type: 'datetime',
                default: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'updatedAt',
                type: 'datetime',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
              },
            ],
          }),
          true
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
          'locations',
          new TableForeignKey({
            columnNames: ['clientId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'clients',
            onDelete: 'CASCADE',
          })
        );

        // Add index on clientId for better query performance
        await queryRunner.createIndex(
          'locations',
          new TableIndex({
            name: 'IDX_LOCATIONS_CLIENTID',
            columnNames: ['clientId'],
          })
        );

        console.log('  → Created locations table');
      } else {
        console.log('  → Locations table already exists, skipping creation');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0007-create-locations-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0007-create-locations-table failed:', error);
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

      const locationsTable = await queryRunner.getTable('locations');
      if (locationsTable) {
        // Drop foreign key
        const foreignKey = locationsTable.foreignKeys.find(fk => fk.columnNames.indexOf('clientId') !== -1);
        if (foreignKey) {
          await queryRunner.dropForeignKey('locations', foreignKey);
        }

        // Drop index
        const index = locationsTable.indices.find(idx => idx.name === 'IDX_LOCATIONS_CLIENTID');
        if (index) {
          await queryRunner.dropIndex('locations', index);
        }

        // Drop table
        await queryRunner.dropTable('locations');
        console.log('  → Dropped locations table');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0007-create-locations-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0007-create-locations-table failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
