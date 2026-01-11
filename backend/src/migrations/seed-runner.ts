import { AppDataSource } from '../database/database';
import bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';

/**
 * Run seed migration for initial data
 * This runs after permissions are synced to ensure all permissions exist
 * Ensures systemadmin role always has all permissions on every startup
 */
export async function runSeedMigration(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Get all permissions
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const allPermissions = await permissionRepository.find();

    if (allPermissions.length === 0) {
      console.log('⚠️  No permissions found. Skipping seed - please sync permissions first.');
      await queryRunner.commitTransaction();
      return;
    }

    // Check if old "admin" role exists and rename it to "systemadmin"
    const roleRepository = queryRunner.manager.getRepository(Role);
    let oldAdminRole = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name: 'admin' })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .getOne();

    if (oldAdminRole) {
      // Rename admin to systemadmin
      oldAdminRole.name = 'systemadmin';
      oldAdminRole = await roleRepository.save(oldAdminRole);
      console.log('✅ Renamed admin role to systemadmin');
    }

    // Always ensure systemadmin role exists and has all permissions (case-insensitive search)
    let systemAdminRole = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name: 'systemadmin' })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .getOne();

    if (!systemAdminRole) {
      // Create systemadmin role with all permissions (clientId = null for global role)
      systemAdminRole = roleRepository.create({
        name: 'systemadmin',
        description: 'System Administrator role with full access to all features',
        permissions: allPermissions,
        clientId: null, // Global role, not client-specific
      });
      systemAdminRole = await roleRepository.save(systemAdminRole);
      console.log(`✅ Created systemadmin role with ${allPermissions.length} permissions`);
    } else {
      // Ensure systemadmin role is global (clientId = null)
      if (systemAdminRole.clientId !== null) {
        systemAdminRole.clientId = null;
        await roleRepository.save(systemAdminRole);
        console.log('✅ Updated systemadmin role to be global (clientId = null)');
      }

      // Always update systemadmin role to have all permissions (in case new permissions were added)
      const currentPermissionIds = systemAdminRole.permissions?.map(p => p.id).sort() || [];
      const allPermissionIds = allPermissions.map(p => p.id).sort();
      
      const permissionsChanged = 
        currentPermissionIds.length !== allPermissionIds.length ||
        !currentPermissionIds.every((id, index) => id === allPermissionIds[index]);

      if (permissionsChanged) {
        systemAdminRole.permissions = allPermissions;
        systemAdminRole = await roleRepository.save(systemAdminRole);
        console.log(`✅ Updated systemadmin role with ${allPermissions.length} permissions (was ${currentPermissionIds.length})`);
      } else {
        console.log(`ℹ️  Systemadmin role already has all ${allPermissions.length} permissions`);
      }
    }

    // Ensure admin user exists
    const userRepository = queryRunner.manager.getRepository(User);
    let adminUser = await userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      // Create admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('12345', saltRounds);

      adminUser = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        roleId: systemAdminRole.id,
      });

      await userRepository.save(adminUser);
      console.log('✅ Created admin user (username: admin, password: 12345)');
    } else {
      // Ensure admin user is assigned to systemadmin role
      if (adminUser.roleId !== systemAdminRole.id) {
        adminUser.roleId = systemAdminRole.id;
        await userRepository.save(adminUser);
        console.log('✅ Updated admin user to use systemadmin role');
      } else {
        console.log('ℹ️  Admin user already exists and is assigned to systemadmin role');
      }
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
