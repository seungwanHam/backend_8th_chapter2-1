import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';

export class CreateProductOptionDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateProductOptionDto)
  options: CreateProductOptionDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;
}

export class ProductQueryDto {
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
  @IsString()
  search?: string;
}