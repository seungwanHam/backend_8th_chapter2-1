import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { OrderStatus } from '../../domain/order.entity';

export class OrderItemDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  productId: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsString()
  productName: string;

  @Expose()
  @IsString()
  optionId: string;

  @Expose()
  @IsString()
  optionName: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  quantity: number;

  @Expose()
  @IsNumber()
  subtotal: number;
}

export class OrderDto {
  @Expose()
  @IsString()
  orderId: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @Expose()
  @IsNumber()
  totalAmount: number;

  @Expose()
  @IsString()
  paymentMethod: string;

  @Expose()
  @IsString()
  shippingAddress: string;

  @Expose()
  @IsString()
  receiverName: string;

  @Expose()
  @IsString()
  receiverPhone: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}

export class PaginationDto {
  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  limit: number;
}

export class OrderListResponseDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  items: OrderDto[];

  @Expose()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}