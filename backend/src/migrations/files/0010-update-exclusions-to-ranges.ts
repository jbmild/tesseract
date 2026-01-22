import { AppDataSource } from '../../database/database';
import { QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to update warehouse_exclusions table to use from/to ranges
 * Renames single value columns to from/to columns for each dimension
 */
export default {
  name: '0010-update-exclusions-to-ranges',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Check if warehouse_exclusions table exists
      const exclusionsTable = await queryRunner.getTable('warehouse_exclusions');
      if (!exclusionsTable) {
        console.log('  → Warehouse exclusions table does not exist, skipping migration');
        await queryRunner.commitTransaction();
        return;
      }

      // Check if old columns exist and rename/add new columns
      const hasOldColumns = exclusionsTable.findColumnByName('aisleValue');
      
      if (hasOldColumns) {
        // Rename existing columns to from/to pattern
        // Aisle
        if (exclusionsTable.findColumnByName('aisleValue')) {
          await queryRunner.query(`
            ALTER TABLE \`warehouse_exclusions\` 
            CHANGE COLUMN \`aisleValue\` \`aisleFrom\` VARCHAR(50) NULL
          `);
        }
        if (!exclusionsTable.findColumnByName('aisleTo')) {
          await queryRunner.addColumn('warehouse_exclusions', new TableColumn({
            name: 'aisleTo',
            type: 'varchar',
            length: '50',
            isNullable: true,
          }));
        }

        // Bay
        if (exclusionsTable.findColumnByName('bayValue')) {
          await queryRunner.query(`
            ALTER TABLE \`warehouse_exclusions\` 
            CHANGE COLUMN \`bayValue\` \`bayFrom\` VARCHAR(50) NULL
          `);
        }
        if (!exclusionsTable.findColumnByName('bayTo')) {
          await queryRunner.addColumn('warehouse_exclusions', new TableColumn({
            name: 'bayTo',
            type: 'varchar',
            length: '50',
            isNullable: true,
          }));
        }

        // Level
        if (exclusionsTable.findColumnByName('levelValue')) {
          await queryRunner.query(`
            ALTER TABLE \`warehouse_exclusions\` 
            CHANGE COLUMN \`levelValue\` \`levelFrom\` VARCHAR(50) NULL
          `);
        }
        if (!exclusionsTable.findColumnByName('levelTo')) {
          await queryRunner.addColumn('warehouse_exclusions', new TableColumn({
            name: 'levelTo',
            type: 'varchar',
            length: '50',
            isNullable: true,
          }));
        }

        // Bin
        if (exclusionsTable.findColumnByName('binValue')) {
          await queryRunner.query(`
            ALTER TABLE \`warehouse_exclusions\` 
            CHANGE COLUMN \`binValue\` \`binFrom\` VARCHAR(50) NULL
          `);
        }
        if (!exclusionsTable.findColumnByName('binTo')) {
          await queryRunner.addColumn('warehouse_exclusions', new TableColumn({
            name: 'binTo',
            type: 'varchar',
            length: '50',
            isNullable: true,
          }));
        }

        console.log('  → Updated exclusions columns to from/to ranges');
      } else {
        // New installation - add all columns
        const columnsToAdd = [
          { name: 'aisleFrom', type: 'varchar', length: '50' },
          { name: 'aisleTo', type: 'varchar', length: '50' },
          { name: 'bayFrom', type: 'varchar', length: '50' },
          { name: 'bayTo', type: 'varchar', length: '50' },
          { name: 'levelFrom', type: 'varchar', length: '50' },
          { name: 'levelTo', type: 'varchar', length: '50' },
          { name: 'binFrom', type: 'varchar', length: '50' },
          { name: 'binTo', type: 'varchar', length: '50' },
        ];

        for (const col of columnsToAdd) {
          if (!exclusionsTable.findColumnByName(col.name)) {
            await queryRunner.addColumn('warehouse_exclusions', new TableColumn({
              name: col.name,
              type: col.type,
              length: col.length,
              isNullable: true,
            }));
          }
        }
        console.log('  → Added from/to range columns to exclusions table');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0010-update-exclusions-to-ranges completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0010-update-exclusions-to-ranges failed:', error);
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
      if (!exclusionsTable) {
        console.log('  → Warehouse exclusions table does not exist, skipping rollback');
        await queryRunner.commitTransaction();
        return;
      }

      // Revert to single value columns
      if (exclusionsTable.findColumnByName('aisleFrom')) {
        await queryRunner.query(`
          ALTER TABLE \`warehouse_exclusions\` 
          CHANGE COLUMN \`aisleFrom\` \`aisleValue\` VARCHAR(50) NULL
        `);
      }
      if (exclusionsTable.findColumnByName('aisleTo')) {
        await queryRunner.dropColumn('warehouse_exclusions', 'aisleTo');
      }

      if (exclusionsTable.findColumnByName('bayFrom')) {
        await queryRunner.query(`
          ALTER TABLE \`warehouse_exclusions\` 
          CHANGE COLUMN \`bayFrom\` \`bayValue\` VARCHAR(50) NULL
        `);
      }
      if (exclusionsTable.findColumnByName('bayTo')) {
        await queryRunner.dropColumn('warehouse_exclusions', 'bayTo');
      }

      if (exclusionsTable.findColumnByName('levelFrom')) {
        await queryRunner.query(`
          ALTER TABLE \`warehouse_exclusions\` 
          CHANGE COLUMN \`levelFrom\` \`levelValue\` VARCHAR(50) NULL
        `);
      }
      if (exclusionsTable.findColumnByName('levelTo')) {
        await queryRunner.dropColumn('warehouse_exclusions', 'levelTo');
      }

      if (exclusionsTable.findColumnByName('binFrom')) {
        await queryRunner.query(`
          ALTER TABLE \`warehouse_exclusions\` 
          CHANGE COLUMN \`binFrom\` \`binValue\` VARCHAR(50) NULL
        `);
      }
      if (exclusionsTable.findColumnByName('binTo')) {
        await queryRunner.dropColumn('warehouse_exclusions', 'binTo');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Rollback 0010-update-exclusions-to-ranges completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0010-update-exclusions-to-ranges failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
