import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../database/database';
import { User } from './user.entity';

export class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'role.permissions', 'clients'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'clients'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['role', 'role.permissions'],
    });
  }

  async create(userData: Partial<User> & { clientIds?: number[] }): Promise<User> {
    const { clientIds, ...userFields } = userData;
    const user = this.usersRepository.create(userFields);
    
    // Hash password if provided
    if (user.password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    
    // Handle clients if provided
    if (clientIds && clientIds.length > 0) {
      const { Client } = await import('../clients/client.entity');
      const clientsRepository = AppDataSource.getRepository(Client);
      const clients = await clientsRepository.find({
        where: clientIds.map(id => ({ id })),
      });
      user.clients = clients;
    }
    
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User> & { clientIds?: number[] }): Promise<User> {
    const { clientIds, ...userFields } = userData;
    
    // Hash password if it's being updated
    if (userFields.password) {
      const saltRounds = 10;
      userFields.password = await bcrypt.hash(userFields.password, saltRounds);
    }
    
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update basic fields
    Object.assign(user, userFields);
    
    // Handle clients if provided
    if (clientIds !== undefined) {
      if (clientIds.length > 0) {
        const { Client } = await import('../clients/client.entity');
        const clientsRepository = AppDataSource.getRepository(Client);
        const clients = await clientsRepository.find({
          where: clientIds.map(id => ({ id })),
        });
        user.clients = clients;
      } else {
        user.clients = [];
      }
    }
    
    return this.usersRepository.save(user);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
