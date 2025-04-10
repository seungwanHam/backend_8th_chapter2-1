import { Injectable } from '@nestjs/common';
import { PaymentService } from '../domain/payment.service';
import { OrderFacade } from '../../orders/application/order.facade';
import { ProcessPaymentDto, CancelPaymentDto } from './dto/payment-request.dto';
import { PaymentDto } from './dto/payment-response.dto';
import { plainToInstance } from 'class-transformer';
import { PaymentMethod } from '../domain/payment.entity';
import { BusinessRuleException } from '../../common/exceptions/domain-exception';
import { PointService } from 'src/points/domain/point.service';

@Injectable()
export class PaymentFacade {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderFacade: OrderFacade,
    private readonly pointService: PointService,
  ) { }

  /**
   * 결제 정보 조회
   */
  async getPayment(paymentId: string): Promise<PaymentDto> {
    const payment = await this.paymentService.getPaymentById(paymentId);
    return this.mapPaymentToDto(payment);
  }

  /**
   * 주문의 결제 정보 조회
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentDto> {
    const payment = await this.paymentService.getPaymentByOrderId(orderId);
    return this.mapPaymentToDto(payment);
  }

  /**
   * 결제 처리 (포인트 차감)
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentDto> {
    // 1. 주문 확인
    const order = await this.orderFacade.getOrder(dto.orderId, dto.userId);

    // 2. 결제 정보 생성
    const payment = await this.paymentService.createPayment(
      dto.orderId,
      PaymentMethod.POINT,
      dto.amount
    );

    try {
      // 3. 포인트 차감
      await this.pointService.usePoint(
        dto.userId,
        dto.amount,
        dto.orderId
      );

      // 4. 결제 완료 처리
      const completedPayment = await this.paymentService.processPayment(
        payment.paymentId,
        `point-payment-${Date.now()}`
      );

      return this.mapPaymentToDto(completedPayment);
    } catch (error) {
      // 결제 실패 처리
      await this.paymentService.failPayment(payment.paymentId);
      throw new BusinessRuleException(`결제 실패: ${error.message}`);
    }
  }

  /**
   * 결제 취소
   */
  async cancelPayment(dto: CancelPaymentDto): Promise<PaymentDto> {
    // 결제 취소 및 포인트 환불
    const canceledPayment = await this.paymentService.cancelPayment(
      dto.paymentId,
      dto.reason
    );

    return this.mapPaymentToDto(canceledPayment);
  }

  /**
   * Payment 엔티티를 DTO로 변환
   */
  private mapPaymentToDto(payment: any): PaymentDto {
    return plainToInstance(
      PaymentDto,
      {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        userId: payment.userId,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        canceledAt: payment.canceledAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}