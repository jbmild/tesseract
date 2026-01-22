import { AppDataSource } from '../../database/database';
import { QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration to create warehouse_exclusions table
 * Stores exclusion rules for warehouse storage matrix (aisle × bay × level × bin)
 */
export default {
  name: '0009-create-warehouse-exclusions-table',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if warehouse_exclusions table already exists
      const exclusionsTable = await queryRunner.getTable('warehouse_exclusions');
      if (!exclusionsTable) {
        // Create warehouse_exclusions table
        await queryRunner.createTable(
          new Table({
            name: 'warehouse_exclusions',
            columns: [
              {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'warehouseId',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'aisleValue',
                type: 'varchar',
                length: '50',
                isNullable: true,
              },
              {
                name: 'bayValue',
                type: 'varchar',
                length: '50',
                isNullable: true,
              },
              {
                name: 'levelValue',
                type: 'varchar',
                length: '50',
                isNullable: true,
              },
              {
                name: 'binValue',
                type: 'varchar',
                length: '50',
                isNullable: true,
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
          'warehouse_exclusions',
          new TableForeignKey({
            columnNames: ['warehouseId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'warehouses',
            onDelete: 'CASCADE',
          })
        );

        // Add index on warehouseId for better query performance
        await queryRunner.createIndex(
          'warehouse_exclusions',
          new TableIndex({
            name: 'IDX_WAREHOUSE_EXCLUSIONS_WAREHOUSEID',
            columnNames: ['warehouseId'],
          })
        );

        console.log('  → Created warehouse_exclusions table');
      } else {
        console.log('  → Warehouse exclusions table already exists, skipping creation');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0009-create-warehouse-exclusions-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0009-create-warehouse-exclusions-table failed:', error);
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

      const exclusionsTable = await queryRunner.getTable('warehouse_exclusions');
      if (exclusionsTable) {
        // Drop foreign key
        const foreignKey = exclusionsTable.foreignKeys.find(fk => fk.columnNames.indexOf('warehouseId') !== -1);
        if (foreignKey) {
          await queryRunner.dropForeignKey('warehouse_exclusions', foreignKey);
        }

        // Drop index
        const index = exclusionsTable.indices.find(idx => idx.name === 'IDX_WAREHOUSE_EXCLUSIONS_WAREHOUSEID');
        if (index) {
          await queryRunner.dropIndex('warehouse_exclusions', index);
        }

        // Drop table
        await queryRunner.dropTable('warehouse_exclusions');
        console.log('  → Dropped warehouse_exclusions table');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0009-create-warehouse-exclusions-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0009-create-warehouse-exclusions-table failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
