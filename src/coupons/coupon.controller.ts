import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  @Post('issue')
  @ApiOperation({ summary: '쿠폰 발급', description: '사용자에게 쿠폰을 발급합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        couponType: { type: 'string', example: 'DISCOUNT_10', description: '발급할 쿠폰 타입' }
      },
      required: ['userId', 'couponType'],
    },
  })
  @ApiResponse({
    status: 200, description: '쿠폰 발급 완료', schema: {
      example: {
        couponId: 'coupon-123',
        type: 'DISCOUNT_10',
        discountRate: 10,
        expiresAt: '2024-04-15T09:00:00Z',
        message: '쿠폰이 발급되었습니다.'
      }
    }
  })
  @ApiResponse({
    status: 400, description: '쿠폰 발급 실패', schema: {
      example: {
        statusCode: 400,
        message: '쿠폰 발급에 실패했습니다. (발급 가능 수량 초과)',
      }
    }
  })
  issueCoupon(@Body() body: any) {
    return {
      couponId: 'coupon-123',
      type: 'DISCOUNT_10',
      discountRate: 10,
      expiresAt: '2024-04-15T09:00:00Z',
      message: '쿠폰이 발급되었습니다.'
    };
  }

  @Get('my')
  @ApiOperation({ summary: '내 쿠폰 목록 조회', description: '사용자의 쿠폰 목록을 조회합니다.' })
  @ApiQuery({ name: 'userId', required: true, description: '사용자 ID', example: 'user-123' })
  @ApiQuery({ name: 'status', required: false, description: '쿠폰 상태 필터 (ALL, AVAILABLE, USED, EXPIRED)', example: 'AVAILABLE' })
  @ApiResponse({
    status: 200, description: '쿠폰 목록', schema: {
      example: {
        items: [
          {
            couponId: 'coupon-123',
            type: 'DISCOUNT_10',
            discountRate: 10,
            used: false,
            expiresAt: '2024-04-15T09:00:00Z'
          },
          {
            couponId: 'coupon-124',
            type: 'DISCOUNT_20',
            discountRate: 20,
            used: true,
            usedAt: '2024-03-10T09:00:00Z',
            expiresAt: '2024-04-15T09:00:00Z'
          }
        ]
      }
    }
  })
  getMyCoupons(@Query() query: any) {
    return {
      items: [
        {
          couponId: 'coupon-123',
          type: 'DISCOUNT_10',
          discountRate: 10,
          used: false,
          expiresAt: '2024-04-15T09:00:00Z'
        },
        {
          couponId: 'coupon-124',
          type: 'DISCOUNT_20',
          discountRate: 20,
          used: true,
          usedAt: '2024-03-10T09:00:00Z',
          expiresAt: '2024-04-15T09:00:00Z'
        }
      ]
    };
  }

  @Get('available')
  @ApiOperation({ summary: '사용 가능한 쿠폰 조회', description: '현재 발급 가능한 쿠폰 목록을 조회합니다.' })
  @ApiResponse({
    status: 200, description: '발급 가능한 쿠폰 목록', schema: {
      example: {
        items: [
          {
            couponType: 'DISCOUNT_10',
            discountRate: 10,
            description: '10% 할인 쿠폰',
            totalCount: 100,
            remainingCount: 50,
            expiresAt: '2024-04-15T09:00:00Z'
          }
        ]
      }
    }
  })
  getAvailableCoupons() {
    return {
      items: [
        {
          couponType: 'DISCOUNT_10',
          discountRate: 10,
          description: '10% 할인 쿠폰',
          totalCount: 100,
          remainingCount: 50,
          expiresAt: '2024-04-15T09:00:00Z'
        }
      ]
    };
  }
}
