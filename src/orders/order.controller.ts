import { Body, Controller, Get, Param, Post, Delete, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  @Post()
  @ApiOperation({ summary: '주문 생성', description: '장바구니에서 상품을 선택하여 주문을 생성합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'product-123' },
              optionId: { type: 'string', example: 'option-123' },
              quantity: { type: 'number', example: 2 }
            }
          },
          example: [
            { productId: 'product-123', optionId: 'option-123', quantity: 2 }
          ]
        }
      },
      required: ['userId', 'items'],
    },
  })
  @ApiResponse({
    status: 201, description: '주문 생성 완료', schema: {
      example: {
        orderId: 'order-123',
        totalPrice: 20000,
        status: 'CREATED',
        items: [
          { productId: 'product-123', name: '상품명', optionName: '옵션명', quantity: 2, unitPrice: 10000, totalPrice: 20000 }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400, description: '상품 정보 오류', schema: {
      example: {
        statusCode: 400,
        message: '상품 정보가 없습니다.',
      }
    }
  })
  createOrder(@Body() body: any) {
    return {
      orderId: 'order-123',
      totalPrice: 20000,
      status: 'CREATED',
      items: [
        { productId: 'product-123', name: '상품명', optionName: '옵션명', quantity: 2, unitPrice: 10000, totalPrice: 20000 }
      ]
    };
  }

  @Get()
  @ApiOperation({ summary: '주문 목록 조회', description: '사용자의 주문 목록을 조회합니다.' })
  @ApiQuery({ name: 'userId', required: true, description: '사용자 ID', example: 'user-123' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiResponse({
    status: 200, description: '주문 목록', schema: {
      example: {
        items: [
          {
            orderId: 'order-123',
            status: 'COMPLETED',
            totalPrice: 20000,
            createdAt: '2024-03-15T09:00:00Z'
          }
        ],
        pagination: {
          total: 5,
          page: 1,
          limit: 10
        }
      }
    }
  })
  @ApiResponse({
    status: 404, description: '주문 목록 없음', schema: {
      example: {
        statusCode: 404,
        message: '주문 목록이 없습니다.',
      }
    }
  })
  getOrderList(@Query() query: any) {
    return {
      items: [
        {
          orderId: 'order-123',
          status: 'COMPLETED',
          totalPrice: 20000,
          createdAt: '2024-03-15T09:00:00Z'
        }
      ],
      pagination: {
        total: 5,
        page: 1,
        limit: 10
      }
    };
  }

  @Get(':orderId')
  @ApiOperation({ summary: '주문 상세 조회', description: '주문 ID로 주문 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'orderId', description: '주문 ID', example: 'order-123' })
  @ApiResponse({
    status: 200, description: '주문 상세 정보', schema: {
      example: {
        orderId: 'order-123',
        userId: 'user-123',
        status: 'COMPLETED',
        totalPrice: 20000,
        items: [
          { productId: 'product-123', name: '상품명', optionName: '옵션명', quantity: 2, unitPrice: 10000, totalPrice: 20000 }
        ],
        paymentInfo: {
          paymentId: 'payment-123',
          method: 'POINT',
          paidAmount: 20000,
          usedPoints: 20000,
          status: 'COMPLETED',
          paidAt: '2024-03-15T09:10:00Z'
        },
        createdAt: '2024-03-15T09:00:00Z'
      }
    }
  })
  @ApiResponse({
    status: 404, description: '주문 정보 없음', schema: {
      example: {
        statusCode: 404,
        message: '주문 정보가 없습니다.',
      }
    }
  })
  getOrderDetail(@Param('orderId') orderId: string) {
    return {
      orderId: 'order-123',
      userId: 'user-123',
      status: 'COMPLETED',
      totalPrice: 20000,
      items: [
        { productId: 'product-123', name: '상품명', optionName: '옵션명', quantity: 2, unitPrice: 10000, totalPrice: 20000 }
      ],
      paymentInfo: {
        paymentId: 'payment-123',
        method: 'POINT',
        paidAmount: 20000,
        usedPoints: 20000,
        status: 'COMPLETED',
        paidAt: '2024-03-15T09:10:00Z'
      },
      createdAt: '2024-03-15T09:00:00Z'
    };
  }

  @Post(':orderId/cancel')
  @ApiOperation({ summary: '주문 취소', description: '주문을 취소합니다.' })
  @ApiParam({ name: 'orderId', description: '취소할 주문 ID', example: 'order-123' })
  @ApiResponse({
    status: 200, description: '주문 취소 완료', schema: {
      example: {
        orderId: 'order-123',
        status: 'CANCELLED',
        message: '주문이 취소되었습니다.'
      }
    }
  })
  @ApiResponse({
    status: 400, description: '취소 불가능한 주문', schema: {
      example: {
        statusCode: 400,
        message: '이미 처리된 주문은 취소할 수 없습니다.',
      }
    }
  })
  @ApiResponse({
    status: 404, description: '주문 정보 없음', schema: {
      example: {
        statusCode: 404,
        message: '주문 정보가 없습니다.',
      }
    }
  })
  cancelOrder(@Param('orderId') orderId: string) {
    return {
      orderId: 'order-123',
      status: 'CANCELLED',
      message: '주문이 취소되었습니다.'
    };
  }
}
