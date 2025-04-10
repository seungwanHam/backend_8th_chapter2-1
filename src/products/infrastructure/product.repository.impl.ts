import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, ProductOption } from '../domain/product.entity';
import { ProductRepository } from '../domain/product.repository';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!product) {
      return null;
    }

    return this.mapToEntity(product);
  }

  async findAll(page: number, limit: number, search?: string): Promise<{ items: Product[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    } : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { options: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products.map(this.mapToEntity),
      total,
    };
  }

  async findPopular(limit: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: {
        options: true,
        orderItems: true,
      },
      take: limit,
    });

    // 판매량 기준으로 정렬 (실제로는 더 정교한 쿼리가 필요할 수 있음)
    const sortedProducts = products
      .map(product => ({
        product,
        soldCount: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .map(({ product }) => product);

    return sortedProducts.map(this.mapToEntity);
  }

  async save(productData: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { options, ...productInfo } = productData as any;

    const product = await this.prisma.product.create({
      data: {
        name: productInfo.name,
        description: productInfo.description,
        basePrice: productInfo.basePrice,
        options: {
          create: options.map(option => ({
            name: option.name,
            price: option.price,
            stock: option.stock,
          })),
        },
      },
      include: { options: true },
    });

    return this.mapToEntity(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: productData.name,
        description: productData.description,
        basePrice: productData.basePrice,
      },
      include: { options: true },
    });

    return this.mapToEntity(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(productId: string, optionId: string, quantity: number): Promise<void> {
    await this.prisma.productOption.update({
      where: { id: optionId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  private mapToEntity(prismaProduct: any): Product {
    return new Product({
      productId: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      basePrice: prismaProduct.basePrice,
      options: prismaProduct.options.map(option => ({
        optionId: option.id,
        name: option.name,
        price: option.price,
        stock: option.stock,
      })),
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }
}