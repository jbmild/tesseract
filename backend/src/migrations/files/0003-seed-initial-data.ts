import { AppDataSource } from '../../database/database';

/**
 * Seed initial data migration
 * Note: Actual seeding happens in seed-runner.ts after permissions are synced
 * This migration is a placeholder to track that seeding should occur
 */
export default {
  async up(): Promise<void> {
    // The actual seeding happens in seed-runner.ts after permissions are synced
    // This migration just marks that seeding should occur
    console.log('  → Seed migration registered (will run after permissions sync)');
  },

  async down(): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { User } = await import('../../users/user.entity');
      const { Role } = await import('../../roles/role.entity');
      const userRepository = queryRunner.manager.getRepository(User);
      const roleRepository = queryRunner.manager.getRepository(Role);

      // Remove admin user
      const adminUser = await userRepository.findOne({
        where: { username: 'admin' },
      });

      if (adminUser) {
        await userRepository.remove(adminUser);
        console.log('  → Removed admin user');
      }

      // Remove admin role (optional - you might want to keep it)
      const adminRole = await roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (adminRole) {
        await roleRepository.remove(adminRole);
        console.log('  → Removed admin role');
      }

      await queryRunner.commitTransaction();
      console.log('  → Initial data rollback completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};
