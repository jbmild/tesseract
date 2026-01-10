import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Permission } from './permission.entity';
import { getRoutesFromApp } from '../utils/route-scanner';
import { Express } from 'express';

export class PermissionsService {
  private permissionsRepository: Repository<Permission>;

  constructor() {
    this.permissionsRepository = AppDataSource.getRepository(Permission);
  }

  /**
   * Sync permissions with backend routes
   * Creates or updates permissions based on current routes
   */
  async syncFromRoutes(app: Express): Promise<Permission[]> {
    const routes = getRoutesFromApp(app);
    const permissions: Permission[] = [];

    for (const route of routes) {
      // Check if permission already exists
      let permission = await this.permissionsRepository.findOne({
        where: { name: route.action },
      });

      if (permission) {
        // Update existing permission
        permission.resource = route.resource;
        permission.description = `${route.method} ${route.path}`;
      } else {
        // Create new permission
        permission = this.permissionsRepository.create({
          name: route.action,
          resource: route.resource,
          description: `${route.method} ${route.path}`,
        });
      }

      const saved = await this.permissionsRepository.save(permission);
      permissions.push(saved);
    }

    // Remove permissions that no longer have corresponding routes
    const routeActions = new Set(routes.map(r => r.action));
    const allPermissions = await this.permissionsRepository.find();
    const orphanedPermissions = allPermissions.filter(p => !routeActions.has(p.name));

    if (orphanedPermissions.length > 0) {
      await this.permissionsRepository.remove(orphanedPermissions);
    }

    return permissions;
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      relations: ['roles'],
    });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionsRepository.find({
      where: { resource },
      relations: ['roles'],
    });
  }

  async findOne(id: number): Promise<Permission | null> {
    return this.permissionsRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionsRepository.create(permissionData);
    return this.permissionsRepository.save(permission);
  }

  async update(id: number, permissionData: Partial<Permission>): Promise<Permission> {
    await this.permissionsRepository.update(id, permissionData);
    const permission = await this.findOne(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return permission;
  }

  async remove(id: number): Promise<void> {
    await this.permissionsRepository.delete(id);
  }

  /**
   * Get all available routes (for display purposes)
   */
  getAvailableRoutes(app: Express) {
    return getRoutesFromApp(app);
  }
}
