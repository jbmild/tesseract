import { Repository } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Product } from './product.entity';

export class ProductsService {
  private productsRepository: Repository<Product>;

  constructor() {
    this.productsRepository = AppDataSource.getRepository(Product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, productData);
    const product = await this.findOne(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
