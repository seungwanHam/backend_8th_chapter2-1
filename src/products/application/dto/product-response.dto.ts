import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested, IsArray, IsDate } from 'class-validator';

export class ProductOptionDto {
  @Expose()
  @IsString()
  optionId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  stock: number;
}

export class ProductDto {
  @Expose()
  @IsString()
  productId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsNumber()
  basePrice: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options: ProductOptionDto[];

  @Expose()
  @IsDate()
  createdAt: Date;
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

export class ProductListResponseDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  items: ProductDto[];

  @Expose()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}

export class PopularProductDto extends ProductDto {
  @Expose()
  @IsNumber()
  soldCount: number;
}