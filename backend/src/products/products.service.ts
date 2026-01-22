import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Product } from './product.entity';

export class ProductsService {
  private productsRepository: Repository<Product>;

  constructor() {
    this.productsRepository = AppDataSource.getRepository(Product);
  }

  async findAll(clientId?: number | null): Promise<Product[]> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.client', 'client');

    if (clientId !== undefined && clientId !== null) {
      queryBuilder.where('product.clientId = :clientId', { clientId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, clientId?: number | null): Promise<Product | null> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.client', 'client')
      .where('product.id = :id', { id });

    if (clientId !== undefined && clientId !== null) {
      queryBuilder.andWhere('product.clientId = :clientId', { clientId });
    }

    return queryBuilder.getOne();
  }

  async create(productData: Partial<Product>, clientId: number): Promise<Product> {
    if (!clientId) {
      throw new Error('Client ID is required to create a product.');
    }
    const product = this.productsRepository.create({ ...productData, clientId });
    const savedProduct = await this.productsRepository.save(product);
    
    // Reload with relations to return complete data
    const productWithRelations = await this.findOne(savedProduct.id, clientId);
    if (!productWithRelations) {
      throw new Error('Product not found after creation');
    }
    return productWithRelations;
  }

  async update(id: number, productData: Partial<Product>, clientId: number): Promise<Product> {
    if (!clientId) {
      throw new Error('Client ID is required to update a product.');
    }
    const updateOptions: any = { id, clientId };
    await this.productsRepository.update(updateOptions, productData);
    const product = await this.findOne(id, clientId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async remove(id: number, clientId: number): Promise<void> {
    if (!clientId) {
      throw new Error('Client ID is required to remove a product.');
    }
    const deleteOptions: any = { id, clientId };
    await this.productsRepository.delete(deleteOptions);
  }
}
