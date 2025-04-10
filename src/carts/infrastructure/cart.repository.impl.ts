import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cart, CartItem } from '../domain/cart.entity';
import { CartRepository } from '../domain/cart.repository';

@Injectable()
export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      return null;
    }

    return this.mapToCartEntity(cart);
  }

  async createCart(userId: string): Promise<Cart> {
    const cart = await this.prisma.cart.create({
      data: {
        userId,
      },
      include: { items: true },
    });

    return this.mapToCartEntity(cart);
  }

  async addItem(
    cartId: string,
    productId: string,
    optionId: string,
    productName: string,
    optionName: string,
    price: number,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        optionId,
        productName,
        optionName,
        price,
        quantity,
      },
    });

    return this.mapToCartItemEntity(item);
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.prisma.cartItem.update({
      where: {
        id: itemId,
        cartId,
      },
      data: {
        quantity,
      },
    });

    return this.mapToCartItemEntity(item);
  }

  async removeItem(
    cartId: string,
    itemId: string,
  ): Promise<void> {
    await this.prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId,
      },
    });
  }

  async clearCart(
    cartId: string,
  ): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }

  async getCartWithItems(
    cartId: string,
  ): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      return null;
    }

    return this.mapToCartEntity(cart);
  }

  private mapToCartItemEntity(prismaCartItem: any): CartItem {
    return new CartItem({
      id: prismaCartItem.id,
      productId: prismaCartItem.productId,
      optionId: prismaCartItem.optionId,
      productName: prismaCartItem.productName,
      optionName: prismaCartItem.optionName,
      price: prismaCartItem.price,
      quantity: prismaCartItem.quantity,
    });
  }

  private mapToCartEntity(prismaCart: any): Cart {
    return new Cart({
      id: prismaCart.id,
      userId: prismaCart.userId,
      items: prismaCart.items.map(this.mapToCartItemEntity),
      updatedAt: prismaCart.updatedAt,
    });
  }
}