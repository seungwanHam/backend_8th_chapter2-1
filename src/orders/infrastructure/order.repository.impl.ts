import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, OrderItem, OrderStatus } from '../domain/order.entity';
import { OrderRepository } from '../domain/order.repository';

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(orderId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    return this.mapToOrderEntity(order);
  }

  async findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    return {
      items: orders.map(this.mapToOrderEntity),
      total,
    };
  }

  async save(order: Order): Promise<Order> {
    // 이 메서드는 필요한 경우 구현
    throw new Error('Method not implemented.');
  }

  async createOrderWithItems(
    userId: string,
    items: Omit<OrderItem, 'id'>[],
    totalAmount: number,
    paymentMethod: string,
    shippingAddress: string,
    receiverName: string,
    receiverPhone: string,
  ): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        paymentMethod,
        shippingAddress,
        receiverName,
        receiverPhone,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            optionId: item.optionId,
            productName: item.productName,
            optionName: item.optionName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    return this.mapToOrderEntity(order);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return this.mapToOrderEntity(order);
  }

  private mapToOrderItemEntity(prismaOrderItem: any): OrderItem {
    return new OrderItem({
      id: prismaOrderItem.id,
      productId: prismaOrderItem.productId,
      optionId: prismaOrderItem.optionId,
      productName: prismaOrderItem.productName,
      optionName: prismaOrderItem.optionName,
      price: prismaOrderItem.price,
      quantity: prismaOrderItem.quantity,
      subtotal: prismaOrderItem.subtotal,
    });
  }

  private mapToOrderEntity(prismaOrder: any): Order {
    return new Order({
      orderId: prismaOrder.id,
      userId: prismaOrder.userId,
      status: prismaOrder.status as OrderStatus,
      items: prismaOrder.items.map(this.mapToOrderItemEntity),
      totalAmount: prismaOrder.totalAmount,
      paymentMethod: prismaOrder.paymentMethod,
      shippingAddress: prismaOrder.shippingAddress,
      receiverName: prismaOrder.receiverName,
      receiverPhone: prismaOrder.receiverPhone,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    });
  }
}