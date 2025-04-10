import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PointTransactionType } from '../../domain/point.entity';
import { Type } from 'class-transformer';

export class ChargePointDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UsePointDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class PointHistoryQueryDto {
  @IsOptional()
  @IsEnum(PointTransactionType)
  type?: PointTransactionType;

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
}