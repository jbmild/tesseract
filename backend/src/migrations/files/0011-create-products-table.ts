import { AppDataSource } from '../../database/database';
import { QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration to create products table
 * - id: primary key
 * - sku: unique stock keeping unit
 * - code: product code
 * - barcode: product barcode (nullable)
 * - name: product name
 * - description: product description (nullable)
 * - width, height, depth: size dimensions (nullable)
 * - clientId: foreign key to clients table (required)
 * - createdAt: timestamp
 * - updatedAt: timestamp
 */
export default {
  name: '0011-create-products-table',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if products table already exists
      const productsTable = await queryRunner.getTable('products');
      if (!productsTable) {
        // Create products table
        await queryRunner.createTable(
          new Table({
            name: 'products',
            columns: [
              {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'sku',
                type: 'varchar',
                length: '255',
                isNullable: false,
                isUnique: true,
              },
              {
                name: 'code',
                type: 'varchar',
                length: '255',
                isNullable: false,
              },
              {
                name: 'barcode',
                type: 'varchar',
                length: '255',
                isNullable: true,
              },
              {
                name: 'name',
                type: 'varchar',
                length: '255',
                isNullable: false,
              },
              {
                name: 'description',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'width',
                type: 'int',
                isNullable: true,
              },
              {
                name: 'height',
                type: 'int',
                isNullable: true,
              },
              {
                name: 'depth',
                type: 'int',
                isNullable: true,
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
          'products',
          new TableForeignKey({
            columnNames: ['clientId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'clients',
            onDelete: 'CASCADE',
          })
        );

        // Add index on clientId for better query performance
        await queryRunner.createIndex(
          'products',
          new TableIndex({
            name: 'IDX_PRODUCTS_CLIENTID',
            columnNames: ['clientId'],
          })
        );

        // Add index on sku for faster lookups
        await queryRunner.createIndex(
          'products',
          new TableIndex({
            name: 'IDX_PRODUCTS_SKU',
            columnNames: ['sku'],
          })
        );

        console.log('  → Created products table');
      } else {
        console.log('  → Products table already exists, skipping creation');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0011-create-products-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0011-create-products-table failed:', error);
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

      const productsTable = await queryRunner.getTable('products');
      if (productsTable) {
        // Drop foreign key
        const foreignKey = productsTable.foreignKeys.find(fk => fk.columnNames.indexOf('clientId') !== -1);
        if (foreignKey) {
          await queryRunner.dropForeignKey('products', foreignKey);
        }

        // Drop indexes
        const indexes = productsTable.indices;
        for (const index of indexes) {
          await queryRunner.dropIndex('products', index);
        }

        // Drop table
        await queryRunner.dropTable('products');
        console.log('  → Dropped products table');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0011-create-products-table completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0011-create-products-table failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
