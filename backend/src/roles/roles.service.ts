import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Role } from './role.entity';

export class RolesService {
  private rolesRepository: Repository<Role>;

  constructor() {
    this.rolesRepository = AppDataSource.getRepository(Role);
  }

  async findAll(clientId?: number | null): Promise<Role[]> {
    const findOptions: any = {
      relations: ['permissions'],
    };
    // Roles can be global (clientId = null) or client-specific
    // If clientId is provided, show roles for that client OR global roles (null)
    if (clientId !== undefined && clientId !== null) {
      findOptions.where = [
        { clientId: null }, // Global roles
        { clientId }, // Client-specific roles
      ];
    }
    return this.rolesRepository.find(findOptions);
  }

  async findOne(id: number, clientId?: number | null): Promise<Role | null> {
    const findOptions: any = {
      where: { id },
      relations: ['permissions'],
    };
    // Allow access if role is global (clientId = null) or matches the client
    if (clientId !== undefined && clientId !== null) {
      findOptions.where = [
        { id, clientId: null },
        { id, clientId },
      ];
    }
    return this.rolesRepository.findOne(findOptions);
  }

  async findByName(name: string, clientId?: number | null): Promise<Role | null> {
    const findOptions: any = {
      where: { name },
      relations: ['permissions'],
    };
    if (clientId !== undefined && clientId !== null) {
      findOptions.where = [
        { name, clientId: null },
        { name, clientId },
      ];
    }
    return this.rolesRepository.findOne(findOptions);
  }

  async create(roleData: Partial<Role>, clientId?: number | null): Promise<Role> {
    // clientId is optional for roles - can be null for global roles
    const finalClientId = clientId ?? null;
    
    // Check if a role with the same name and clientId already exists
    const existingRole = await this.rolesRepository.findOne({
      where: { name: roleData.name, clientId: finalClientId },
    });
    
    if (existingRole) {
      throw new Error(`A role with the name "${roleData.name}" already exists for this client`);
    }
    
    const role = this.rolesRepository.create({ ...roleData, clientId: finalClientId });
    return this.rolesRepository.save(role);
  }

  async update(id: number, roleData: Partial<Role>, clientId?: number | null): Promise<Role> {
    const role = await this.findOne(id, clientId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // If name is being updated, check for duplicates
    if (roleData.name && roleData.name !== role.name) {
      const finalClientId = roleData.clientId !== undefined ? roleData.clientId : role.clientId;
      const existingRole = await this.rolesRepository.findOne({
        where: { name: roleData.name, clientId: finalClientId },
      });
      
      if (existingRole && existingRole.id !== id) {
        throw new Error(`A role with the name "${roleData.name}" already exists for this client`);
      }
    }
    
    Object.assign(role, roleData);
    return this.rolesRepository.save(role);
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
