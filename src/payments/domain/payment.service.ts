import { Inject, Injectable } from '@nestjs/common';
import { Payment, PaymentMethod, PaymentStatus } from './payment.entity';
import { PaymentRepository } from './payment.repository';
import { PointService } from '../../points/domain/point.service';
import { BusinessRuleException, EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    private readonly pointService: PointService, // PointService 주입
  ) { }

  /**
   * 결제 조회
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new EntityNotFoundException('결제 정보를 찾을 수 없습니다.');
    }
    return payment;
  }

  /**
   * 주문 ID로 결제 조회
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new EntityNotFoundException('해당 주문의 결제 정보를 찾을 수 없습니다.');
    }
    return payment;
  }

  /**
   * 결제 생성 (포인트 결제)
   */
  async createPayment(
    orderId: string,
    method: PaymentMethod = PaymentMethod.POINT,
    amount: number
  ): Promise<Payment> {
    // 이미 결제 정보가 있는지 확인
    const existingPayment = await this.paymentRepository.findByOrderId(orderId);
    if (existingPayment) {
      throw new BusinessRuleException('이미 결제 정보가 생성된 주문입니다.');
    }

    // 결제 정보 생성
    return this.paymentRepository.createPayment(orderId, method, amount);
  }

  /**
   * 포인트 차감 및 결제 처리
   */
  async processPayment(
    paymentId: string,
    userId: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.canComplete()) {
      throw new BusinessRuleException('이미 처리된 결제입니다.');
    }

    try {
      // 포인트 차감
      await this.pointService.usePoint(
        userId,
        payment.amount,
        payment.orderId
      );

      // 결제 완료 처리
      payment.complete();

      return this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.COMPLETED
      );
    } catch (error) {
      // 포인트 차감 실패 시 결제 실패 처리
      payment.fail();
      await this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.FAILED
      );
      throw new BusinessRuleException(`포인트 차감 실패: ${error.message}`);
    }
  }

  /**
   * 결제 취소 및 포인트 환불
   */
  async cancelPayment(
    paymentId: string,
    reason: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.canCancel()) {
      throw new BusinessRuleException('취소할 수 없는 결제 상태입니다.');
    }

    try {
      // 포인트 환불
      await this.pointService.chargePoint(
        payment.userId,
        payment.amount,
        `주문취소(${payment.orderId}) 환불: ${reason}`
      );

      // 결제 취소 처리
      payment.cancel();

      return this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.CANCELED
      );
    } catch (error) {
      throw new BusinessRuleException(`포인트 환불 실패: ${error.message}`);
    }
  }

  /**
   * 결제 실패 처리
   */
  async failPayment(paymentId: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    // 결제 실패 처리
    payment.fail();

    return this.paymentRepository.updateStatus(
      paymentId,
      PaymentStatus.FAILED
    );
  }
}