import { Payment, PaymentStatus } from './payment.entity';

export interface PaymentRepository {
  findById(paymentId: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;

  createPayment(
    orderId: string,
    userId: string,
    amount: number
  ): Promise<Payment>;

  updateStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment>;

  setCompletedAt(
    paymentId: string,
    completedAt: Date
  ): Promise<Payment>;

  setCanceledAt(
    paymentId: string,
    canceledAt: Date
  ): Promise<Payment>;
}