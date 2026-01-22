import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { WarehouseExclusion } from './warehouse-exclusion.entity';

export class ExclusionsService {
  private exclusionsRepository: Repository<WarehouseExclusion>;

  constructor() {
    this.exclusionsRepository = AppDataSource.getRepository(WarehouseExclusion);
  }

  async findAllByWarehouse(warehouseId: number): Promise<WarehouseExclusion[]> {
    return this.exclusionsRepository.find({
      where: { warehouseId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number, warehouseId: number): Promise<WarehouseExclusion | null> {
    return this.exclusionsRepository.findOne({
      where: { id, warehouseId },
    });
  }

  async create(exclusionData: Partial<WarehouseExclusion>, warehouseId: number): Promise<WarehouseExclusion> {
    // Verify warehouse exists
    const { Warehouse } = await import('./warehouse.entity');
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    const warehouse = await warehouseRepository.findOne({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new Error('Warehouse not found.');
    }

    const exclusion = this.exclusionsRepository.create({
      ...exclusionData,
      warehouseId,
    });
    return this.exclusionsRepository.save(exclusion);
  }

  async update(id: number, exclusionData: Partial<WarehouseExclusion>, warehouseId: number): Promise<WarehouseExclusion> {
    const exclusion = await this.findOne(id, warehouseId);
    if (!exclusion) {
      throw new Error('Exclusion not found or does not belong to the warehouse.');
    }

    await this.exclusionsRepository.update(id, exclusionData);
    const updatedExclusion = await this.findOne(id, warehouseId);
    if (!updatedExclusion) {
      throw new Error('Exclusion not found after update');
    }
    return updatedExclusion;
  }

  async remove(id: number, warehouseId: number): Promise<void> {
    const exclusion = await this.findOne(id, warehouseId);
    if (!exclusion) {
      throw new Error('Exclusion not found or does not belong to the warehouse.');
    }

    await this.exclusionsRepository.delete(id);
  }
}
