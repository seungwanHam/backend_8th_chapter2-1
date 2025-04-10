import { Order, OrderItem, OrderStatus } from './order.entity';

export interface OrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Order[]; total: number }>;
  
  save(order: Order): Promise<Order>;
  createOrderWithItems(
    userId: string,
    items: Omit<OrderItem, 'id'>[],
    totalAmount: number,
    paymentMethod: string,
    shippingAddress: string,
    receiverName: string,
    receiverPhone: string,
  ): Promise<Order>;
  
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
}