import { Injectable } from '@nestjs/common';
import { OrderService } from '../domain/order.service';
import { ProductFacade } from '../../products/application/product.facade';
import { CartFacade } from '../../carts/application/cart.facade';
import { PointFacade } from '../../points/application/point.facade';
import { CouponFacade } from '../../coupons/application/coupon.facade';
import { CreateOrderDto, OrderQueryDto, PaymentMethod } from './dto/order-request.dto';
import { OrderDto, OrderListResponseDto } from './dto/order-response.dto';
import { plainToInstance } from 'class-transformer';
import { BusinessRuleException } from '../../common/exceptions/domain-exception';

@Injectable()
export class OrderFacade {
  constructor(
    private readonly orderService: OrderService,
    private readonly productFacade: ProductFacade,
    private readonly cartFacade: CartFacade,
    private readonly pointFacade: PointFacade,
    private readonly couponFacade: CouponFacade,
  ) { }

  /**
   * 주문 생성
   */
  async createOrder(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    // 1. 상품 정보 및 재고 검증
    const validatedItems = await this.productFacade.validateOrderItems(dto.items);

    // 주문 총액 계산
    let totalAmount = validatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // 2. 쿠폰 적용 (있는 경우)
    let couponDiscount = 0;
    if (dto.couponId) {
      try {
        const couponResult = await this.couponFacade.applyCoupon({
          userCouponId: dto.couponId,
          orderId: '', // 생성된 주문 ID로 나중에 업데이트
          orderAmount: totalAmount,
        });
        couponDiscount = couponResult.discountAmount;
        totalAmount -= couponDiscount;
      } catch (error) {
        // 쿠폰 적용 실패 시 무시하고 진행
        console.error('쿠폰 적용 실패:', error.message);
      }
    }

    // 3. 포인트 결제 검증 (포인트로 결제하는 경우)
    if (dto.paymentMethod === PaymentMethod.POINT) {
      const pointBalance = await this.pointFacade.getPointBalance(userId);
      if (pointBalance.balance < totalAmount) {
        throw new BusinessRuleException('포인트 잔액이 부족합니다.');
      }
    }

    // 4. 주문 생성
    const order = await this.orderService.createOrder(
      userId,
      validatedItems.map(item => ({
        productId: item.productId,
        optionId: item.optionId,
        productName: item.productName,
        optionName: item.optionName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      totalAmount,
      dto.paymentMethod,
      dto.shippingAddress,
      dto.receiverName,
      dto.receiverPhone,
    );

    // 5. 포인트 결제 처리 (포인트로 결제하는 경우)
    if (dto.paymentMethod === PaymentMethod.POINT) {
      await this.pointFacade.usePoint(userId, {
        amount: totalAmount,
        orderId: order.orderId,
      });

      // 결제 완료 처리
      await this.orderService.markOrderAsPaid(order.orderId);
    }

    // 6. 장바구니 비우기
    await this.cartFacade.clearCart(userId);

    return this.mapOrderToDto(order);
  }

  /**
   * 주문 상세 조회
   */
  async getOrder(orderId: string, userId: string): Promise<OrderDto> {
    const order = await this.orderService.getOrderById(orderId);

    // 주문자 확인
    if (order.userId !== userId) {
      throw new BusinessRuleException('해당 주문에 접근할 권한이 없습니다.');
    }

    return this.mapOrderToDto(order);
  }

  /**
   * 주문 목록 조회
   */
  async getUserOrders(userId: string, query: OrderQueryDto): Promise<OrderListResponseDto> {
    const { items, total } = await this.orderService.getUserOrders(
      userId,
      query.page,
      query.limit
    );

    return plainToInstance(
      OrderListResponseDto,
      {
        items: items.map(order => this.mapOrderToDto(order)),
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
   * 주문 취소
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderDto> {
    const order = await this.orderService.cancelOrder(orderId, userId);

    // 재고 복구
    await this.productFacade.restoreProductStock(
      order.items.map(item => ({
        productId: item.productId,
        optionId: item.optionId,
        quantity: item.quantity,
      }))
    );

    // 포인트 환불 (포인트로 결제한 경우)
    if (order.paymentMethod === PaymentMethod.POINT) {
      await this.pointFacade.refundPoint(userId, order.totalAmount, order.orderId);
    }

    return this.mapOrderToDto(order);
  }

  /**
   * Order 엔티티를 DTO로 변환
   */
  private mapOrderToDto(order: any): OrderDto {
    return plainToInstance(
      OrderDto,
      {
        orderId: order.orderId,
        userId: order.userId,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          optionId: item.optionId,
          optionName: item.optionName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}