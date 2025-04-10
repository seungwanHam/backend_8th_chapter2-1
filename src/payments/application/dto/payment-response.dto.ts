import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../domain/payment.entity';

export class PaymentDto {
  @Expose()
  @IsString()
  paymentId: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsString()
  orderId: string;

  @Expose()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @Expose()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsOptional()
  @IsString()
  paymentKey?: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  canceledAt?: Date;
}