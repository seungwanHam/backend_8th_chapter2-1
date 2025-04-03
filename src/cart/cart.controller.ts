import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Carts')
@Controller('carts')
export class CartController {
  @Post('items')
  @ApiOperation({ summary: '장바구니 담기', description: '상품을 장바구니에 추가합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        productId: { type: 'string', example: 'product-123' },
        optionId: { type: 'string', example: 'option-123' },
        quantity: { type: 'number', example: 1 }
      },
      required: ['userId', 'productId', 'optionId', 'quantity'],
    },
  })
  @ApiResponse({
    status: 200, description: '장바구니 추가 완료', schema: {
      example: {
        cartItemId: 'cart-item-123',
        productId: 'product-123',
        productName: '상품명',
        optionId: 'option-123',
        optionName: '옵션명',
        quantity: 1,
        unitPrice: 10000
      }
    }
  })
  @ApiResponse({
    status: 400, description: '재고 부족', schema: {
      example: {
        statusCode: 400,
        message: '재고가 부족합니다.',
      }
    }
  })
  addToCart(@Body() body: any) {
    return {
      cartItemId: 'cart-item-123',
      productId: 'product-123',
      productName: '상품명',
      optionId: 'option-123',
      optionName: '옵션명',
      quantity: 1,
      unitPrice: 10000
    };
  }

  @Get('items')
  @ApiOperation({ summary: '장바구니 조회', description: '사용자의 장바구니 항목을 조회합니다.' })
  @ApiQuery({ name: 'userId', required: true, description: '사용자 ID', example: 'user-123' })
  @ApiResponse({
    status: 200, description: '장바구니 항목', schema: {
      example: {
        items: [
          {
            cartItemId: 'cart-item-123',
            productId: 'product-123',
            productName: '상품명',
            optionId: 'option-123',
            optionName: '옵션명',
            quantity: 1,
            unitPrice: 10000,
            totalPrice: 10000
          }
        ],
        totalPrice: 10000
      }
    }
  })
  @ApiResponse({
    status: 404, description: '장바구니 항목 없음', schema: {
      example: {
        statusCode: 404,
        message: '장바구니에 상품이 없습니다.',
      }
    }
  })
  getCartItems(@Query('userId') userId: string) {
    return {
      items: [
        {
          cartItemId: 'cart-item-123',
          productId: 'product-123',
          productName: '상품명',
          optionId: 'option-123',
          optionName: '옵션명',
          quantity: 1,
          unitPrice: 10000,
          totalPrice: 10000
        }
      ],
      totalPrice: 10000
    };
  }

  @Put('items/:cartItemId')
  @ApiOperation({ summary: '장바구니 수정', description: '장바구니 항목의 수량을 수정합니다.' })
  @ApiParam({ name: 'cartItemId', description: '장바구니 항목 ID', example: 'cart-item-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        quantity: { type: 'number', example: 2 }
      },
      required: ['userId', 'quantity'],
    },
  })
  @ApiResponse({
    status: 200, description: '장바구니 수정 완료', schema: {
      example: {
        cartItemId: 'cart-item-123',
        quantity: 2,
        totalPrice: 20000
      }
    }
  })
  @ApiResponse({
    status: 404, description: '장바구니 항목 없음', schema: {
      example: {
        statusCode: 404,
        message: '장바구니 항목을 찾을 수 없습니다.',
      }
    }
  })
  updateCartItem(@Param('cartItemId') cartItemId: string, @Body() body: any) {
    return {
      cartItemId: 'cart-item-123',
      quantity: 2,
      totalPrice: 20000
    };
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: '장바구니 삭제', description: '장바구니 항목을 삭제합니다.' })
  @ApiParam({ name: 'cartItemId', description: '장바구니 항목 ID', example: 'cart-item-123' })
  @ApiQuery({ name: 'userId', required: true, description: '사용자 ID', example: 'user-123' })
  @ApiResponse({
    status: 200, description: '장바구니 삭제 완료', schema: {
      example: {
        message: '장바구니 항목이 삭제되었습니다.'
      }
    }
  })
  @ApiResponse({
    status: 404, description: '장바구니 항목 없음', schema: {
      example: {
        statusCode: 404,
        message: '장바구니 항목을 찾을 수 없습니다.',
      }
    }
  })
  deleteCartItem(@Param('cartItemId') cartItemId: string, @Query('userId') userId: string) {
    return {
      message: '장바구니 항목이 삭제되었습니다.'
    };
  }
} 