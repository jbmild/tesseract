import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Order } from './order.entity';

export class OrdersService {
  private ordersRepository: Repository<Order>;

  constructor() {
    this.ordersRepository = AppDataSource.getRepository(Order);
  }

  async findAll(clientId?: number | null): Promise<Order[]> {
    // Note: Orders don't have direct client relationship yet
    // This is a placeholder for future client filtering
    // For now, return all orders (or filter by user's clients if needed)
    return this.ordersRepository.find();
  }

  async findOne(id: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(orderData);
    return this.ordersRepository.save(order);
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order> {
    await this.ordersRepository.update(id, orderData);
    const order = await this.findOne(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
