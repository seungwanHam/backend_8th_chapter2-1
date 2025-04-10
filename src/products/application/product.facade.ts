import { Injectable } from '@nestjs/common';
import { ProductService } from '../domain/product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product-request.dto';
import { ProductDto, ProductListResponseDto, PopularProductDto } from './dto/product-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductFacade {
  constructor(private readonly productService: ProductService) { }

  /**
   * 상품 목록 조회
   */
  async getProducts(query: ProductQueryDto): Promise<ProductListResponseDto> {
    const { items, total } = await this.productService.getProducts(
      query.page,
      query.limit,
      query.search
    );

    return plainToInstance(
      ProductListResponseDto,
      {
        items: items.map(product => ({
          productId: product.productId,
          name: product.name,
          description: product.description,
          basePrice: product.basePrice,
          options: product.options,
          createdAt: product.createdAt,
        })),
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
        }
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 인기 상품 조회
   */
  async getPopularProducts(limit: number): Promise<PopularProductDto[]> {
    const products = await this.productService.getPopularProducts(limit);

    return products.map(product =>
      plainToInstance(
        PopularProductDto,
        {
          productId: product.productId,
          name: product.name,
          description: product.description,
          basePrice: product.basePrice,
          options: product.options,
          createdAt: product.createdAt,
          soldCount: 0, // 실제로는 판매량 정보가 필요함
        },
        { excludeExtraneousValues: true }
      )
    );
  }

  /**
   * 상품 상세 조회
   */
  async getProduct(id: string): Promise<ProductDto> {
    const product = await this.productService.getProductById(id);

    return plainToInstance(
      ProductDto,
      {
        productId: product.productId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        options: product.options,
        createdAt: product.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 상품 생성
   */
  async createProduct(dto: CreateProductDto): Promise<ProductDto> {
    const product = await this.productService.createProduct({
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      options: dto.options.map(option => ({
        optionId: '', // 생성 시에는 빈 값
        name: option.name,
        price: option.price,
        stock: option.stock,
      })),
    });

    return plainToInstance(
      ProductDto,
      {
        productId: product.productId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        options: product.options,
        createdAt: product.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 상품 업데이트
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.productService.updateProduct(id, dto);

    return plainToInstance(
      ProductDto,
      {
        productId: product.productId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        options: product.options,
        createdAt: product.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 상품 삭제
   */
  async deleteProduct(id: string): Promise<void> {
    await this.productService.deleteProduct(id);
  }

  /**
   * 주문 상품 검증
   */
  async validateOrderItems(items: Array<{
    productId: string;
    optionId: string;
    quantity: number;
  }>): Promise<Array<{
    productId: string;
    optionId: string;
    productName: string;
    optionName: string;
    price: number;
    quantity: number;
  }>> {
    const validatedItems = [];

    for (const item of items) {
      const product = await this.productService.getProductById(item.productId);
      const option = product.getOption(item.optionId);

      if (!option) {
        throw new BusinessRuleException('상품 옵션을 찾을 수 없습니다.');
      }

      if (!product.hasStock(item.optionId, item.quantity)) {
        throw new BusinessRuleException(`'${product.name}(${option.name})' 상품의 재고가 부족합니다.`);
      }

      validatedItems.push({
        productId: item.productId,
        optionId: item.optionId,
        productName: product.name,
        optionName: option.name,
        price: option.price,
        quantity: item.quantity
      });

      // 재고 감소
      await this.productService.decreaseProductStock(
        item.productId,
        item.optionId,
        item.quantity
      );
    }

    return validatedItems;
  }

  /**
   * 취소된 상품 재고 복구
   */
  async restoreProductStock(items: Array<{
    productId: string;
    optionId: string;
    quantity: number;
  }>): Promise<void> {
    for (const item of items) {
      await this.productService.increaseProductStock(
        item.productId,
        item.optionId,
        item.quantity
      );
    }
  }
}