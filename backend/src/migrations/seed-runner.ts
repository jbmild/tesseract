import { AppDataSource } from '../database/database';
import bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';

/**
 * Run seed migration for initial data
 * This runs after permissions are synced to ensure all permissions exist
 */
export async function runSeedMigration(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Check if admin user already exists
    const userRepository = queryRunner.manager.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists, skipping seed');
      await queryRunner.commitTransaction();
      return;
    }

    // Get all permissions
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const allPermissions = await permissionRepository.find();

    if (allPermissions.length === 0) {
      console.log('⚠️  No permissions found. Skipping seed - please sync permissions first.');
      await queryRunner.commitTransaction();
      return;
    }

    // Create or update admin role (case-insensitive search)
    const roleRepository = queryRunner.manager.getRepository(Role);
    let adminRole = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name: 'admin' })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .getOne();

    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'admin',
        description: 'Administrator role with full access to all features',
        permissions: allPermissions,
      });
      adminRole = await roleRepository.save(adminRole);
      console.log(`✅ Created admin role with ${allPermissions.length} permissions`);
    } else {
      // Update existing admin role with all permissions
      adminRole.permissions = allPermissions;
      adminRole = await roleRepository.save(adminRole);
      console.log(`✅ Updated admin role with ${allPermissions.length} permissions`);
    }

    // Create admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('12345', saltRounds);

    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
    });

    await userRepository.save(adminUser);
    console.log('✅ Created admin user (username: admin, password: 12345)');

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
