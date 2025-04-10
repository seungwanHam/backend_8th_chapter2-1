export interface PaymentGatewayResult {
  success: boolean;
  paymentKey?: string;
  errorMessage?: string;
}

export interface PaymentGateway {
  requestPayment(
    orderId: string,
    amount: number,
    method: string,
    customerInfo: any
  ): Promise<PaymentGatewayResult>;

  verifyPayment(
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<PaymentGatewayResult>;

  cancelPayment(
    paymentKey: string,
    reason: string
  ): Promise<PaymentGatewayResult>;
}