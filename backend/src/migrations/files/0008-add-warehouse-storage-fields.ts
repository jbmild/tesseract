import { AppDataSource } from '../../database/database';
import { QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to add storage configuration fields to warehouses table
 * Adds aisle, bay, level, and bin fields (type and count for each)
 */
export default {
  name: '0008-add-warehouse-storage-fields',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if warehouses table exists
      const warehousesTable = await queryRunner.getTable('warehouses');
      if (!warehousesTable) {
        console.log('  → Warehouses table does not exist, skipping migration');
        await queryRunner.commitTransaction();
        return;
      }

      // Add Aisle fields
      const aisleTypeColumn = warehousesTable.findColumnByName('aisleType');
      if (!aisleTypeColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'aisleType',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }));
        console.log('  → Added aisleType column');
      }

      const aisleCountColumn = warehousesTable.findColumnByName('aisleCount');
      if (!aisleCountColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'aisleCount',
          type: 'int',
          isNullable: true,
        }));
        console.log('  → Added aisleCount column');
      }

      // Add Bay fields
      const bayTypeColumn = warehousesTable.findColumnByName('bayType');
      if (!bayTypeColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'bayType',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }));
        console.log('  → Added bayType column');
      }

      const bayCountColumn = warehousesTable.findColumnByName('bayCount');
      if (!bayCountColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'bayCount',
          type: 'int',
          isNullable: true,
        }));
        console.log('  → Added bayCount column');
      }

      // Add Level fields
      const levelTypeColumn = warehousesTable.findColumnByName('levelType');
      if (!levelTypeColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'levelType',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }));
        console.log('  → Added levelType column');
      }

      const levelCountColumn = warehousesTable.findColumnByName('levelCount');
      if (!levelCountColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'levelCount',
          type: 'int',
          isNullable: true,
        }));
        console.log('  → Added levelCount column');
      }

      // Add Bin fields
      const binTypeColumn = warehousesTable.findColumnByName('binType');
      if (!binTypeColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'binType',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }));
        console.log('  → Added binType column');
      }

      const binCountColumn = warehousesTable.findColumnByName('binCount');
      if (!binCountColumn) {
        await queryRunner.addColumn('warehouses', new TableColumn({
          name: 'binCount',
          type: 'int',
          isNullable: true,
        }));
        console.log('  → Added binCount column');
      }

      await queryRunner.commitTransaction();
      console.log('  → Migration executed successfully');
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

      // Check if warehouses table exists
      const warehousesTable = await queryRunner.getTable('warehouses');
      if (!warehousesTable) {
        console.log('  → Warehouses table does not exist, skipping rollback');
        await queryRunner.commitTransaction();
        return;
      }

      // Remove columns in reverse order
      const columnsToRemove = [
        'binCount', 'binType',
        'levelCount', 'levelType',
        'bayCount', 'bayType',
        'aisleCount', 'aisleType',
      ];

      for (const columnName of columnsToRemove) {
        const column = warehousesTable.findColumnByName(columnName);
        if (column) {
          await queryRunner.dropColumn('warehouses', columnName);
          console.log(`  → Removed ${columnName} column`);
        }
      }

      await queryRunner.commitTransaction();
      console.log('  → Migration rolled back successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
