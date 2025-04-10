import { Expose } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';

export class CartItemDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  productId: string;

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

export class CartDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsArray()
  items: CartItemDto[];

  @Expose()
  @IsNumber()
  totalAmount: number;

  @Expose()
  @IsNumber()
  itemCount: number;

  @Expose()
  @IsDate()
  updatedAt: Date;
}