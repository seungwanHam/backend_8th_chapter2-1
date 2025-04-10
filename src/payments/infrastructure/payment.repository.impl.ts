import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, PaymentMethod, PaymentStatus } from '../domain/payment.entity';
import { PaymentRepository } from '../domain/payment.repository';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(paymentId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return null;
    }

    return this.mapToPaymentEntity(payment);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return null;
    }

    return this.mapToPaymentEntity(payment);
  }

  async createPayment(
    orderId: string,
    method: PaymentMethod,
    amount: number
  ): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        status: PaymentStatus.PENDING,
        method,
        amount,
      },
    });

    return this.mapToPaymentEntity(payment);
  }

  async updateStatus(
    paymentId: string,
    status: PaymentStatus,
    paymentKey?: string
  ): Promise<Payment> {
    const data: any = { status };

    if (paymentKey) {
      data.paymentKey = paymentKey;
    }

    if (status === PaymentStatus.COMPLETED) {
      data.completedAt = new Date();
    } else if (status === PaymentStatus.CANCELED) {
      data.canceledAt = new Date();
    }

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data,
    });

    return this.mapToPaymentEntity(payment);
  }

  async setCompletedAt(paymentId: string, completedAt: Date): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { completedAt },
    });

    return this.mapToPaymentEntity(payment);
  }

  async setCanceledAt(paymentId: string, canceledAt: Date): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { canceledAt },
    });

    return this.mapToPaymentEntity(payment);
  }

  private mapToPaymentEntity(prismaPayment: any): Payment {
    return new Payment({
      paymentId: prismaPayment.id,
      orderId: prismaPayment.orderId,
      status: prismaPayment.status as PaymentStatus,
      method: prismaPayment.method as PaymentMethod,
      amount: prismaPayment.amount,
      paymentKey: prismaPayment.paymentKey,
      createdAt: prismaPayment.createdAt,
      completedAt: prismaPayment.completedAt,
      canceledAt: prismaPayment.canceledAt,
    });
  }
}