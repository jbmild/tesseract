import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Order } from './order.entity';

export class OrdersService {
  private ordersRepository: Repository<Order>;

  constructor() {
    this.ordersRepository = AppDataSource.getRepository(Order);
  }

  async findAll(clientId?: number | null): Promise<Order[]> {
    const findOptions: any = {};
    if (clientId) {
      findOptions.where = { clientId };
    }
    return this.ordersRepository.find(findOptions);
  }

  async findOne(id: number, clientId?: number | null): Promise<Order | null> {
    const findOptions: any = { where: { id } };
    if (clientId) {
      findOptions.where.clientId = clientId;
    }
    return this.ordersRepository.findOne(findOptions);
  }

  async create(orderData: Partial<Order>, clientId?: number | null): Promise<Order> {
    if (!clientId) {
      throw new Error('Client ID is required to create an order');
    }
    const order = this.ordersRepository.create({ ...orderData, clientId });
    return this.ordersRepository.save(order);
  }

  async update(id: number, orderData: Partial<Order>, clientId?: number | null): Promise<Order> {
    const updateOptions: any = { id };
    if (clientId) {
      updateOptions.clientId = clientId;
    }
    await this.ordersRepository.update(updateOptions, orderData);
    const order = await this.findOne(id, clientId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async remove(id: number, clientId?: number | null): Promise<void> {
    const deleteOptions: any = { id };
    if (clientId) {
      deleteOptions.clientId = clientId;
    }
    await this.ordersRepository.delete(deleteOptions);
  }
}
