import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Location } from './location.entity';

export class LocationsService {
  private locationsRepository: Repository<Location>;

  constructor() {
    this.locationsRepository = AppDataSource.getRepository(Location);
  }

  async findAll(clientId?: number | null): Promise<Location[]> {
    const findOptions: any = {
      relations: ['client'],
    };
    if (clientId !== undefined && clientId !== null) {
      findOptions.where = { clientId };
    }
    return this.locationsRepository.find(findOptions);
  }

  async findOne(id: number, clientId?: number | null): Promise<Location | null> {
    const findOptions: any = {
      where: { id },
      relations: ['client'],
    };
    if (clientId !== undefined && clientId !== null) {
      findOptions.where.clientId = clientId;
    }
    return this.locationsRepository.findOne(findOptions);
  }

  async create(locationData: Partial<Location>, clientId: number): Promise<Location> {
    if (!clientId) {
      throw new Error('Client ID is required to create a location.');
    }
    const location = this.locationsRepository.create({ ...locationData, clientId });
    return this.locationsRepository.save(location);
  }

  async update(id: number, locationData: Partial<Location>, clientId: number): Promise<Location> {
    if (!clientId) {
      throw new Error('Client ID is required to update a location.');
    }
    const updateOptions: any = { id, clientId };
    await this.locationsRepository.update(updateOptions, locationData);
    const location = await this.findOne(id, clientId);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  async remove(id: number, clientId: number): Promise<void> {
    if (!clientId) {
      throw new Error('Client ID is required to remove a location.');
    }
    const deleteOptions: any = { id, clientId };
    await this.locationsRepository.delete(deleteOptions);
  }
}
