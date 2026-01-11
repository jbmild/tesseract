import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../database/database';
import { User } from './user.entity';

export class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = AppDataSource.getRepository(User);
  }

  async isSystemAdmin(roleId: number): Promise<boolean> {
    const { Role } = await import('../roles/role.entity');
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({ where: { id: roleId } });
    return role?.name.toLowerCase() === 'systemadmin';
  }

  async findAll(clientId?: number | null, isSystemAdmin: boolean = false): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('user.clients', 'clients');

    if (isSystemAdmin) {
      // If systemadmin has no client selected, show all users with no clients assigned
      if (!clientId) {
        // Get users that have no clients assigned using NOT EXISTS
        queryBuilder.where(
          'NOT EXISTS (SELECT 1 FROM user_clients uc WHERE uc.userId = user.id)'
        );
      } else {
        // If systemadmin has a client selected, show users assigned to that client
        queryBuilder.where('clients.id = :clientId', { clientId });
      }
    } else {
      // For non-systemadmin users, filter by client assignment
      if (clientId) {
        queryBuilder.where('clients.id = :clientId', { clientId });
      }
    }

    return queryBuilder.getMany();
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
      relations: ['role', 'role.permissions', 'clients'],
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
