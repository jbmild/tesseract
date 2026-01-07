import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { User } from './user.entity';

export class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
