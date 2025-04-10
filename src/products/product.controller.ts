import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  @Get()
  @ApiOperation({ summary: '상품 목록 조회', description: '상품 목록을 조회합니다.' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: '검색어', example: '상품명' })
  @ApiResponse({
    status: 200, description: '상품 목록', schema: {
      example: {
        items: [
          {
            productId: 'product-123',
            name: '상품명',
            description: '상품 설명',
            basePrice: 10000,
            options: [
              {
                optionId: 'option-123',
                name: '옵션명',
                price: 10000,
                stock: 100
              }
            ],
            createdAt: '2024-03-15T09:00:00Z'
          }
        ],
        pagination: {
          total: 50,
          page: 1,
          limit: 10
        }
      }
    }
  })
  @ApiResponse({
    status: 404, description: '상품 목록 없음', schema: {
      example: {
        statusCode: 404,
        message: '상품 목록을 찾을 수 없습니다.',
      }
    }
  })
  getProducts(@Query() query: any) {
    return {
      items: [
        {
          productId: 'product-123',
          name: '상품명',
          description: '상품 설명',
          basePrice: 10000,
          options: [
            {
              optionId: 'option-123',
              name: '옵션명',
              price: 10000,
              stock: 100
            }
          ],
          createdAt: '2024-03-15T09:00:00Z'
        }
      ],
      pagination: {
        total: 50,
        page: 1,
        limit: 10
      }
    };
  }

  @Get('popular')
  @ApiOperation({ summary: '인기 상품 조회', description: '인기 상품 목록을 조회합니다.' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 상품 수', example: 5 })
  @ApiResponse({
    status: 200, description: '인기 상품 목록', schema: {
      example: {
        items: [
          {
            productId: 'product-123',
            name: '인기 상품',
            description: '가장 많이 팔린 상품',
            basePrice: 10000,
            soldCount: 150,
            options: [
              {
                optionId: 'option-123',
                name: '옵션명',
                price: 10000,
                stock: 100
              }
            ]
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404, description: '인기 상품 없음', schema: {
      example: {
        statusCode: 404,
        message: '인기 상품이 없습니다.',
      }
    }
  })
  getPopularProducts(@Query('limit') limit: number = 5) {
    return {
      items: [
        {
          productId: 'product-123',
          name: '인기 상품',
          description: '가장 많이 팔린 상품',
          basePrice: 10000,
          soldCount: 150,
          options: [
            {
              optionId: 'option-123',
              name: '옵션명',
              price: 10000,
              stock: 100
            }
          ]
        }
      ]
    };
  }
}