import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderItem, OrderStatus } from './order.entity';
import { OrderRepository } from './order.repository';
import { BusinessRuleException, EntityNotFoundException, ForbiddenException } from '../../common/exceptions/domain-exception';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
  ) { }

  /**
   * 주문 조회
   */
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new EntityNotFoundException('주문을 찾을 수 없습니다.');
    }
    return order;
  }

  /**
   * 사용자 주문 목록 조회
   */
  async getUserOrders(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Order[]; total: number }> {
    return this.orderRepository.findByUserIdWithPagination(userId, page, limit);
  }

  /**
   * 주문 생성
   */
  async createOrder(
    userId: string,
    orderItems: Omit<OrderItem, 'id'>[],
    totalAmount: number,
    paymentMethod: string,
    shippingAddress: string,
    receiverName: string,
    receiverPhone: string,
  ): Promise<Order> {
    // 주문 생성 (초기 상태는 PENDING)
    return this.orderRepository.createOrderWithItems(
      userId,
      orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      receiverName,
      receiverPhone,
    );
  }

  /**
   * 주문 취소
   */
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // 권한 확인
    if (order.userId !== userId) {
      throw new ForbiddenException('이 주문을 취소할 권한이 없습니다.');
    }

    // 취소 가능 상태 확인
    if (!order.canCancel()) {
      throw new BusinessRuleException('이 주문은 현재 취소할 수 없는 상태입니다.');
    }

    // 주문 상태 변경
    return this.orderRepository.updateStatus(orderId, OrderStatus.CANCELED);
  }

  /**
   * 주문 결제 완료 처리
   */
  async markOrderAsPaid(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // 결제 가능 상태 확인
    if (order.status !== OrderStatus.PENDING) {
      throw new BusinessRuleException('이미 결제 처리되었거나 취소된 주문입니다.');
    }

    // 주문 상태 변경
    return this.orderRepository.updateStatus(orderId, OrderStatus.PAID);
  }

  /**
   * 주문 배송 시작 처리
   */
  async startShipping(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // 배송 시작 가능 상태 확인
    if (!order.canShip()) {
      throw new BusinessRuleException('이 주문은 현재 배송을 시작할 수 없는 상태입니다.');
    }

    // 주문 상태 변경
    return this.orderRepository.updateStatus(orderId, OrderStatus.SHIPPING);
  }

  /**
   * 주문 배송 완료 처리
   */
  async completeDelivery(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // 배송 완료 가능 상태 확인
    if (!order.canComplete()) {
      throw new BusinessRuleException('이 주문은 현재 배송 완료 처리할 수 없는 상태입니다.');
    }

    // 주문 상태 변경
    return this.orderRepository.updateStatus(orderId, OrderStatus.DELIVERED);
  }
}