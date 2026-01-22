import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Warehouse } from './warehouse.entity';

export class WarehousesService {
  private warehousesRepository: Repository<Warehouse>;

  constructor() {
    this.warehousesRepository = AppDataSource.getRepository(Warehouse);
  }

  async findAll(clientId?: number | null): Promise<Warehouse[]> {
    const queryBuilder = this.warehousesRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.location', 'location')
      .leftJoinAndSelect('location.client', 'client')
      .leftJoinAndSelect('warehouse.exclusions', 'exclusions');

    if (clientId !== undefined && clientId !== null) {
      queryBuilder.where('location.clientId = :clientId', { clientId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, clientId?: number | null): Promise<Warehouse | null> {
    const queryBuilder = this.warehousesRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.location', 'location')
      .leftJoinAndSelect('location.client', 'client')
      .leftJoinAndSelect('warehouse.exclusions', 'exclusions')
      .where('warehouse.id = :id', { id });

    if (clientId !== undefined && clientId !== null) {
      queryBuilder.andWhere('location.clientId = :clientId', { clientId });
    }

    return queryBuilder.getOne();
  }

  async create(warehouseData: Partial<Warehouse>, clientId: number): Promise<Warehouse> {
    if (!clientId) {
      throw new Error('Client ID is required to create a warehouse.');
    }

    // Verify that the location belongs to the client
    const { Location } = await import('../locations/location.entity');
    const locationRepository = AppDataSource.getRepository(Location);
    const location = await locationRepository.findOne({
      where: { id: warehouseData.locationId, clientId },
    });

    if (!location) {
      throw new Error('Location not found or does not belong to the selected client.');
    }

    const warehouse = this.warehousesRepository.create(warehouseData);
    const savedWarehouse = await this.warehousesRepository.save(warehouse);
    
    // Reload with relations to return complete data
    const warehouseWithRelations = await this.findOne(savedWarehouse.id, clientId);
    if (!warehouseWithRelations) {
      throw new Error('Warehouse not found after creation');
    }
    return warehouseWithRelations;
  }

  async update(id: number, warehouseData: Partial<Warehouse>, clientId: number): Promise<Warehouse> {
    if (!clientId) {
      throw new Error('Client ID is required to update a warehouse.');
    }

    // First verify the warehouse exists and belongs to the client
    const existingWarehouse = await this.findOne(id, clientId);
    if (!existingWarehouse) {
      throw new Error('Warehouse not found or does not belong to the selected client.');
    }

    // If locationId is being updated, verify the new location belongs to the client
    if (warehouseData.locationId && warehouseData.locationId !== existingWarehouse.locationId) {
      const { Location } = await import('../locations/location.entity');
      const locationRepository = AppDataSource.getRepository(Location);
      const location = await locationRepository.findOne({
        where: { id: warehouseData.locationId, clientId },
      });

      if (!location) {
        throw new Error('Location not found or does not belong to the selected client.');
      }
    }

    await this.warehousesRepository.update(id, warehouseData);
    const updatedWarehouse = await this.findOne(id, clientId);
    if (!updatedWarehouse) {
      throw new Error('Warehouse not found after update');
    }
    return updatedWarehouse;
  }

  async remove(id: number, clientId: number): Promise<void> {
    if (!clientId) {
      throw new Error('Client ID is required to remove a warehouse.');
    }

    // Verify the warehouse belongs to the client before deleting
    const warehouse = await this.findOne(id, clientId);
    if (!warehouse) {
      throw new Error('Warehouse not found or does not belong to the selected client.');
    }

    await this.warehousesRepository.delete(id);
  }
}
