import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { DiscountType } from '../../domain/coupon.entity';

export class CouponDto {
  @Expose()
  @IsString()
  couponId: string;

  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @Expose()
  @IsNumber()
  discountValue: number;

  @Expose()
  @IsNumber()
  minOrderAmount: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @Expose()
  @IsDate()
  startDate: Date;

  @Expose()
  @IsDate()
  endDate: Date;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @IsOptional()
  @IsNumber()
  totalQuantity?: number;

  @Expose()
  @IsNumber()
  usedQuantity: number;

  @Expose()
  @IsDate()
  createdAt: Date;
}

export class UserCouponDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @ValidateNested()
  @Type(() => CouponDto)
  coupon: CouponDto;

  @Expose()
  @IsBoolean()
  isUsed: boolean;

  @Expose()
  @IsOptional()
  @IsDate()
  usedAt?: Date;

  @Expose()
  @IsOptional()
  @IsString()
  orderId?: string;

  @Expose()
  @IsDate()
  issuedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Expose()
  @IsBoolean()
  isAvailable: boolean;
}

export class CouponListResponseDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponDto)
  items: CouponDto[];

  @Expose()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
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

export class ApplyCouponResponseDto {
  @Expose()
  @IsNumber()
  discountAmount: number;
}