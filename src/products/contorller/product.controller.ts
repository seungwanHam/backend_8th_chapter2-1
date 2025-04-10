import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductFacade } from '../application/product.facade';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../application/dto/product-request.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('상품')
@Controller('products')
export class ProductController {
  constructor(private readonly productFacade: ProductFacade) {}

  @ApiOperation({ summary: '상품 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiResponse({ status: 200, description: '상품 목록 반환' })
  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productFacade.getProducts(query);
  }

  @ApiOperation({ summary: '인기 상품 조회' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 상품 수' })
  @ApiResponse({ status: 200, description: '인기 상품 목록 반환' })
  @Get('popular')
  async getPopularProducts(@Query('limit') limit: number = 10) {
    return this.productFacade.getPopularProducts(limit);
  }

  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 200, description: '상품 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없음' })
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productFacade.getProduct(id);
  }

  @ApiOperation({ summary: '상품 등록' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: '상품 등록 성공' })
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productFacade.createProduct(dto);
  }

  @ApiOperation({ summary: '상품 수정' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: '상품 수정 성공' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없음' })
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productFacade.updateProduct(id, dto);
  }

  @ApiOperation({ summary: '상품 삭제' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiResponse({ status: 204, description: '상품 삭제 성공' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없음' })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    await this.productFacade.deleteProduct(id);
    return { message: '상품이 삭제되었습니다.' };
  }
}