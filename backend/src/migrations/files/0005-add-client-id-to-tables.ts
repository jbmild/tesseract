import { AppDataSource } from '../../database/database';
import { QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Migration to add clientId column to orders, products, and roles tables
 * - orders: clientId is required (NOT NULL)
 * - products: clientId is required (NOT NULL)
 * - roles: clientId is optional (NULL) for global roles like systemadmin
 */
export default {
  name: '0005-add-client-id-to-tables',
  async up(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Add clientId to orders table
      const ordersTable = await queryRunner.getTable('orders');
      if (ordersTable && !ordersTable.findColumnByName('clientId')) {
        await queryRunner.addColumn(
          'orders',
          new TableColumn({
            name: 'clientId',
            type: 'int',
            isNullable: false,
          })
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
          'orders',
          new TableForeignKey({
            columnNames: ['clientId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'clients',
            onDelete: 'CASCADE',
          })
        );
        console.log('  → Added clientId column to orders table');
      }

      // Add clientId to products table
      const productsTable = await queryRunner.getTable('products');
      if (productsTable && !productsTable.findColumnByName('clientId')) {
        await queryRunner.addColumn(
          'products',
          new TableColumn({
            name: 'clientId',
            type: 'int',
            isNullable: false,
          })
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
        console.log('  → Added clientId column to products table');
      }

      // Add clientId to roles table (nullable - optional)
      const rolesTable = await queryRunner.getTable('roles');
      if (rolesTable && !rolesTable.findColumnByName('clientId')) {
        await queryRunner.addColumn(
          'roles',
          new TableColumn({
            name: 'clientId',
            type: 'int',
            isNullable: true,
          })
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
          'roles',
          new TableForeignKey({
            columnNames: ['clientId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'clients',
            onDelete: 'SET NULL',
          })
        );
        console.log('  → Added clientId column to roles table (nullable)');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 0005-add-client-id-to-tables completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration 0005-add-client-id-to-tables failed:', error);
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

      // Remove foreign keys and columns in reverse order
      const rolesTable = await queryRunner.getTable('roles');
    if (rolesTable) {
      const foreignKey = rolesTable.foreignKeys.find(fk => fk.columnNames.indexOf('clientId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('roles', foreignKey);
      }
      if (rolesTable.findColumnByName('clientId')) {
        await queryRunner.dropColumn('roles', 'clientId');
        console.log('  → Removed clientId column from roles table');
      }
    }

    const productsTable = await queryRunner.getTable('products');
    if (productsTable) {
      const foreignKey = productsTable.foreignKeys.find(fk => fk.columnNames.indexOf('clientId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('products', foreignKey);
      }
      if (productsTable.findColumnByName('clientId')) {
        await queryRunner.dropColumn('products', 'clientId');
        console.log('  → Removed clientId column from products table');
      }
    }

    const ordersTable = await queryRunner.getTable('orders');
    if (ordersTable) {
      const foreignKey = ordersTable.foreignKeys.find(fk => fk.columnNames.indexOf('clientId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('orders', foreignKey);
      }
      if (ordersTable.findColumnByName('clientId')) {
        await queryRunner.dropColumn('orders', 'clientId');
        console.log('  → Removed clientId column from orders table');
      }
    }

    await queryRunner.commitTransaction();
    console.log('✅ Rollback 0005-add-client-id-to-tables completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Rollback 0005-add-client-id-to-tables failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
