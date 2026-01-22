import { AppDataSource } from '../../database/database';
import { QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to update products size fields from decimal to integer (centimeters)
 */
export default {
  name: '0012-update-products-size-to-int',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if products table exists
      const productsTable = await queryRunner.getTable('products');
      if (!productsTable) {
        console.log('  → Products table does not exist, skipping migration');
        await queryRunner.commitTransaction();
        return;
      }

      // Check if columns are decimal type and need to be converted
      const widthColumn = productsTable.findColumnByName('width');
      const heightColumn = productsTable.findColumnByName('height');
      const depthColumn = productsTable.findColumnByName('depth');

      if (widthColumn && widthColumn.type === 'decimal') {
        // Convert decimal to int by rounding values first, then changing column type
        await queryRunner.query(`
          UPDATE products 
          SET width = ROUND(COALESCE(width, 0))
          WHERE width IS NOT NULL
        `);
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN width INT NULL
        `);
        console.log('  → Updated width column to INT');
      }

      if (heightColumn && heightColumn.type === 'decimal') {
        await queryRunner.query(`
          UPDATE products 
          SET height = ROUND(COALESCE(height, 0))
          WHERE height IS NOT NULL
        `);
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN height INT NULL
        `);
        console.log('  → Updated height column to INT');
      }

      if (depthColumn && depthColumn.type === 'decimal') {
        await queryRunner.query(`
          UPDATE products 
          SET depth = ROUND(COALESCE(depth, 0))
          WHERE depth IS NOT NULL
        `);
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN depth INT NULL
        `);
        console.log('  → Updated depth column to INT');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0012-update-products-size-to-int completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0012-update-products-size-to-int failed:', error);
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
      if (!productsTable) {
        console.log('  → Products table does not exist, skipping rollback');
        await queryRunner.commitTransaction();
        return;
      }

      // Revert to decimal type
      const widthColumn = productsTable.findColumnByName('width');
      const heightColumn = productsTable.findColumnByName('height');
      const depthColumn = productsTable.findColumnByName('depth');

      if (widthColumn && widthColumn.type === 'int') {
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN width DECIMAL(10, 2) NULL
        `);
      }

      if (heightColumn && heightColumn.type === 'int') {
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN height DECIMAL(10, 2) NULL
        `);
      }

      if (depthColumn && depthColumn.type === 'int') {
        await queryRunner.query(`
          ALTER TABLE products 
          MODIFY COLUMN depth DECIMAL(10, 2) NULL
        `);
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0012-update-products-size-to-int completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0012-update-products-size-to-int failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
