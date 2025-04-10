import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsDate, IsOptional, IsBoolean, Min, MinLength, MaxLength, IsDateString } from 'class-validator';
import { DiscountType } from '../../domain/coupon.entity';

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(1)
  discountValue: number;

  @IsNumber()
  @Min(0)
  minOrderAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalQuantity?: number;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalQuantity?: number;
}

export class CouponQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class IssueCouponDto {
  @IsString()
  couponId: string;
}

export class ApplyCouponDto {
  @IsString()
  userCouponId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;
}