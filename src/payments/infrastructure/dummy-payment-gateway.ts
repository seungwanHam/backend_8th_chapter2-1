import { Injectable } from '@nestjs/common';
import { PaymentGateway, PaymentGatewayResult } from '../domain/payment-gateway.interface';

@Injectable()
export class DummyPaymentGateway implements PaymentGateway {
  async requestPayment(
    orderId: string,
    amount: number,
    method: string,
    customerInfo: any
  ): Promise<PaymentGatewayResult> {
    // 실제 구현에서는 외부 결제 시스템 API 호출
    console.log('DummyPaymentGateway.requestPayment', { orderId, amount, method, customerInfo });

    // 항상 성공으로 처리 (테스트용)
    return {
      success: true,
      paymentKey: `dummy_payment_key_${Date.now()}`,
    };
  }

  async verifyPayment(
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<PaymentGatewayResult> {
    // 실제 구현에서는 외부 결제 시스템 API 호출하여 결제 검증
    console.log('DummyPaymentGateway.verifyPayment', { paymentKey, orderId, amount });

    // 항상 성공으로 처리 (테스트용)
    return {
      success: true,
      paymentKey,
    };
  }

  async cancelPayment(
    paymentKey: string,
    reason: string
  ): Promise<PaymentGatewayResult> {
    // 실제 구현에서는 외부 결제 시스템 API 호출하여 결제 취소
    console.log('DummyPaymentGateway.cancelPayment', { paymentKey, reason });

    // 항상 성공으로 처리 (테스트용)
    return {
      success: true,
      paymentKey,
    };
  }
}