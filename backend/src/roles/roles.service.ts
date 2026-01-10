import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Role } from './role.entity';

export class RolesService {
  private rolesRepository: Repository<Role>;

  constructor() {
    this.rolesRepository = AppDataSource.getRepository(Role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role> {
    await this.rolesRepository.update(id, roleData);
    const role = await this.findOne(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findOne(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const { Permission } = await import('../permissions/permission.entity');
    const permissionsRepository = AppDataSource.getRepository(Permission);
    const permissions = await permissionsRepository
      .createQueryBuilder('permission')
      .where('permission.id IN (:...ids)', { ids: permissionIds })
      .getMany();
    
    role.permissions = permissions;
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    await this.rolesRepository.delete(id);
  }
}
