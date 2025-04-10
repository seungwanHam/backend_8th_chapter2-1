import { Inject, Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { ProductRepository } from './product.repository';
import { BusinessRuleException, EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) { }

  /**
   * 상품 ID로 상품 조회
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new EntityNotFoundException('상품을 찾을 수 없습니다.');
    }
    return product;
  }

  /**
   * 상품 목록 조회
   */
  async getProducts(page: number, limit: number, search?: string): Promise<{ items: Product[]; total: number }> {
    return this.productRepository.findAll(page, limit, search);
  }

  /**
   * 인기 상품 조회
   */
  async getPopularProducts(limit: number): Promise<Product[]> {
    return this.productRepository.findPopular(limit);
  }

  /**
   * 상품 생성
   */
  async createProduct(product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.productRepository.save(product as Product);
  }

  /**
   * 상품 업데이트
   */
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    await this.getProductById(id);
    return this.productRepository.update(id, product);
  }

  /**
   * 상품 삭제
   */
  async deleteProduct(id: string): Promise<void> {
    await this.getProductById(id);
    return this.productRepository.delete(id);
  }

  /**
   * 상품 재고 감소
   */
  async decreaseProductStock(productId: string, optionId: string, quantity: number): Promise<void> {
    const product = await this.getProductById(productId);
    const option = product.getOption(optionId);

    if (!option) {
      throw new BusinessRuleException('상품 옵션을 찾을 수 없습니다.');
    }

    if (!product.hasStock(optionId, quantity)) {
      throw new BusinessRuleException('상품 재고가 부족합니다.');
    }

    await this.productRepository.updateStock(productId, optionId, -quantity);
  }

  /**
   * 상품 재고 증가
   */
  async increaseProductStock(productId: string, optionId: string, quantity: number): Promise<void> {
    await this.getProductById(productId);
    await this.productRepository.updateStock(productId, optionId, quantity);
  }
}