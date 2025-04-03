import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  @Post()
  @ApiOperation({ summary: '결제 처리', description: '주문에 대한 결제를 처리합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        orderId: { type: 'string', example: 'order-123' },
        couponId: { type: 'string', example: 'coupon-123', nullable: true },
        pointAmount: { type: 'number', example: 10000, description: '사용할 포인트 금액' }
      },
      required: ['userId', 'orderId'],
    },
  })
  @ApiResponse({
    status: 200, description: '결제 완료', schema: {
      example: {
        paymentId: 'payment-123',
        orderId: 'order-123',
        totalPrice: 20000,
        usedPoints: 10000,
        usedCoupon: {
          couponId: 'coupon-123',
          discountAmount: 5000
        },
        finalAmount: 5000,
        status: 'COMPLETED',
        paidAt: '2024-03-15T09:00:00Z'
      }
    }
  })
  @ApiResponse({
    status: 400, description: '포인트 부족', schema: {
      example: {
        statusCode: 400,
        message: '포인트가 부족합니다.',
      }
    }
  })
  @ApiResponse({
    status: 400, description: '쿠폰 사용 불가', schema: {
      example: {
        statusCode: 400,
        message: '쿠폰을 사용할 수 없습니다.',
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
  processPayment(@Body() body: any) {
    return {
      paymentId: 'payment-123',
      orderId: 'order-123',
      totalPrice: 20000,
      usedPoints: 10000,
      usedCoupon: {
        couponId: 'coupon-123',
        discountAmount: 5000
      },
      finalAmount: 5000,
      status: 'COMPLETED',
      paidAt: '2024-03-15T09:00:00Z'
    };
  }

  @Get('history')
  @ApiOperation({ summary: '결제 내역 조회', description: '사용자의 결제 내역을 조회합니다.' })
  @ApiQuery({ name: 'userId', required: true, description: '사용자 ID', example: 'user-123' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiResponse({
    status: 200, description: '결제 내역', schema: {
      example: {
        items: [
          {
            paymentId: 'payment-123',
            orderId: 'order-123',
            totalPrice: 20000,
            usedPoints: 10000,
            usedCoupon: {
              couponId: 'coupon-123',
              discountAmount: 5000
            },
            finalAmount: 5000,
            status: 'COMPLETED',
            paidAt: '2024-03-15T09:00:00Z'
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
    status: 404, description: '결제 내역 없음', schema: {
      example: {
        statusCode: 404,
        message: '결제 내역이 없습니다.',
      }
    }
  })
  getPaymentHistory(@Query() query: any) {
    return {
      items: [
        {
          paymentId: 'payment-123',
          orderId: 'order-123',
          totalPrice: 20000,
          usedPoints: 10000,
          usedCoupon: {
            couponId: 'coupon-123',
            discountAmount: 5000
          },
          finalAmount: 5000,
          status: 'COMPLETED',
          paidAt: '2024-03-15T09:00:00Z'
        }
      ],
      pagination: {
        total: 5,
        page: 1,
        limit: 10
      }
    };
  }
}
