import { Inject, Injectable } from '@nestjs/common';
import { PaymentService } from '../domain/payment.service';
import { OrderFacade } from '../../orders/application/order.facade';
import { PaymentGateway } from '../domain/payment-gateway.interface';
import { ProcessPaymentDto, VerifyPaymentDto, CancelPaymentDto } from './dto/payment-request.dto';
import { PaymentDto } from './dto/payment-response.dto';
import { plainToInstance } from 'class-transformer';
import { BusinessRuleException } from '../../common/exceptions/domain-exception';

@Injectable()
export class PaymentFacade {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderFacade: OrderFacade,
    @Inject('PaymentGateway')
    private readonly paymentGateway: PaymentGateway,
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
   * 결제 처리 (외부 결제 시스템 연동)
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentDto> {
    // 1. 주문 확인
    const order = await this.orderFacade.getOrder(dto.orderId, 'system');

    // 2. 결제 정보 생성
    const payment = await this.paymentService.createPayment(
      dto.orderId,
      dto.method,
      dto.amount
    );

    // 3. 외부 결제 시스템과 통신
    const gatewayResult = await this.paymentGateway.requestPayment(
      dto.orderId,
      dto.amount,
      dto.method,
      dto.customerInfo
    );

    if (!gatewayResult.success) {
      // 결제 실패 처리
      await this.paymentService.failPayment(payment.paymentId);
      throw new BusinessRuleException(`결제 실패: ${gatewayResult.errorMessage}`);
    }

    // 4. 결제 완료 처리
    const completedPayment = await this.paymentService.processPayment(
      payment.paymentId,
      gatewayResult.paymentKey
    );

    // 5. 주문 상태 업데이트 (OrderFacade에 결제 완료 알림)
    // 이 부분은 실제 구현에서 주문 서비스와 연동 필요

    return this.mapPaymentToDto(completedPayment);
  }

  /**
   * 결제 검증
   */
  async verifyPayment(dto: VerifyPaymentDto): Promise<PaymentDto> {
    // 외부 결제 시스템과 통신하여 결제 검증
    const gatewayResult = await this.paymentGateway.verifyPayment(
      dto.paymentKey,
      dto.orderId,
      dto.amount
    );

    if (!gatewayResult.success) {
      throw new BusinessRuleException(`결제 검증 실패: ${gatewayResult.errorMessage}`);
    }

    // 주문의 결제 정보 조회
    const payment = await this.paymentService.getPaymentByOrderId(dto.orderId);

    return this.mapPaymentToDto(payment);
  }

  /**
   * 결제 취소
   */
  async cancelPayment(dto: CancelPaymentDto): Promise<PaymentDto> {
    // 1. 결제 정보 조회
    const payment = await this.paymentService.getPaymentById(dto.paymentId);

    // 2. 외부 결제 시스템과 통신하여 결제 취소
    if (payment.paymentKey) {
      const gatewayResult = await this.paymentGateway.cancelPayment(
        payment.paymentKey,
        dto.reason
      );

      if (!gatewayResult.success) {
        throw new BusinessRuleException(`결제 취소 실패: ${gatewayResult.errorMessage}`);
      }
    }

    // 3. 결제 취소 처리
    const canceledPayment = await this.paymentService.cancelPayment(
      dto.paymentId,
      dto.reason
    );

    // 4. 주문 취소 처리 (OrderFacade에 결제 취소 알림)
    // 이 부분은 실제 구현에서 주문 서비스와 연동 필요

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
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        paymentKey: payment.paymentKey,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        canceledAt: payment.canceledAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}