import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { PointTransactionType } from '../../domain/point.entity';

export class PointBalanceDto {
  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsNumber()
  balance: number;

  @Expose()
  @IsString()
  updatedAt: string;
}

export class PointTransactionDto {
  @Expose()
  @IsString()
  transactionId: string;

  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @IsEnum(PointTransactionType)
  type: PointTransactionType;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsNumber()
  balanceAfter: number;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  relatedId?: string;

  @Expose()
  @IsString()
  createdAt: string;
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

export class PointHistoryResponseDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointTransactionDto)
  items: PointTransactionDto[];

  @Expose()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}