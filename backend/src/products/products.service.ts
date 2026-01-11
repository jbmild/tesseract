import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Product } from './product.entity';

export class ProductsService {
  private productsRepository: Repository<Product>;

  constructor() {
    this.productsRepository = AppDataSource.getRepository(Product);
  }

  async findAll(clientId?: number | null): Promise<Product[]> {
    const findOptions: any = {};
    if (clientId) {
      findOptions.where = { clientId };
    }
    return this.productsRepository.find(findOptions);
  }

  async findOne(id: number, clientId?: number | null): Promise<Product | null> {
    const findOptions: any = { where: { id } };
    if (clientId) {
      findOptions.where.clientId = clientId;
    }
    return this.productsRepository.findOne(findOptions);
  }

  async create(productData: Partial<Product>, clientId?: number | null): Promise<Product> {
    if (!clientId) {
      throw new Error('Client ID is required to create a product');
    }
    const product = this.productsRepository.create({ ...productData, clientId });
    return this.productsRepository.save(product);
  }

  async update(id: number, productData: Partial<Product>, clientId?: number | null): Promise<Product> {
    const updateOptions: any = { id };
    if (clientId) {
      updateOptions.clientId = clientId;
    }
    await this.productsRepository.update(updateOptions, productData);
    const product = await this.findOne(id, clientId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async remove(id: number, clientId?: number | null): Promise<void> {
    const deleteOptions: any = { id };
    if (clientId) {
      deleteOptions.clientId = clientId;
    }
    await this.productsRepository.delete(deleteOptions);
  }
}
