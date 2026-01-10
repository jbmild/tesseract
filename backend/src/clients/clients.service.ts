import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Client } from './client.entity';

export class ClientsService {
  private clientsRepository: Repository<Client>;

  constructor() {
    this.clientsRepository = AppDataSource.getRepository(Client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: number): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(id: number, clientData: Partial<Client>): Promise<Client> {
    await this.clientsRepository.update(id, clientData);
    const client = await this.findOne(id);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  }

  async remove(id: number): Promise<void> {
    await this.clientsRepository.delete(id);
  }
}
