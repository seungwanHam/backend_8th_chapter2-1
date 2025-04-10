import { Product } from './product.entity';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(page: number, limit: number, search?: string): Promise<{ items: Product[]; total: number }>;
  findPopular(limit: number): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(productId: string, optionId: string, quantity: number): Promise<void>;
}