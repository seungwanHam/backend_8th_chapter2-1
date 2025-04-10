import { Inject, Injectable } from '@nestjs/common';
import { Payment, PaymentMethod, PaymentStatus } from './payment.entity';
import { PaymentRepository } from './payment.repository';
import { BusinessRuleException, EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
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
   * 결제 생성
   */
  async createPayment(
    orderId: string,
    method: PaymentMethod,
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
   * 외부 결제 시스템을 통한 결제 처리
   */
  async processPayment(
    paymentId: string,
    paymentKey: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.canComplete()) {
      throw new BusinessRuleException('이미 처리된 결제입니다.');
    }

    // 여기서 실제로는 외부 결제 시스템과의 통신을 수행
    // 예: 결제 검증, 승인 등

    // 결제 완료 처리
    payment.complete(paymentKey);

    return this.paymentRepository.updateStatus(
      paymentId,
      PaymentStatus.COMPLETED,
      paymentKey
    );
  }

  /**
   * 결제 취소
   */
  async cancelPayment(
    paymentId: string,
    reason: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.canCancel()) {
      throw new BusinessRuleException('취소할 수 없는 결제 상태입니다.');
    }

    // 외부 결제 시스템과 통신하여 결제 취소 처리
    // 예: PG사 결제 취소 API 호출

    // 결제 취소 처리
    payment.cancel();

    const updatedPayment = await this.paymentRepository.updateStatus(
      paymentId,
      PaymentStatus.CANCELED
    );

    return this.paymentRepository.setCanceledAt(
      paymentId,
      new Date()
    );
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