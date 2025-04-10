import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Points')
@Controller('points')
export class PointController {
  @Post('charge')
  @ApiOperation({ summary: '포인트 충전', description: '유저가 입력한 금액만큼 포인트를 충전합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123', description: '충전할 유저의 ID' },
        amount: { type: 'number', example: 10000, description: '충전할 금액 (1원 이상)' },
      },
      required: ['userId', 'amount'],
    },
  })
  @ApiResponse({
    status: 201, description: '충전 완료', schema: {
      example: {
        balance: 10000,
        message: '포인트 충전이 완료되었습니다.'
      }
    }
  })
  @ApiResponse({
    status: 400, description: '잘못된 요청', schema: {
      example: {
        statusCode: 400,
        message: '충전 금액은 1원 이상이어야 합니다.',
      }
    }
  })
  chargePoint(@Body() body: any) {
    return { balance: 10000, message: '포인트 충전이 완료되었습니다.' };
  }

  @Get()
  @ApiOperation({ summary: '포인트 조회', description: '유저의 현재 포인트 잔액을 조회합니다.' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: '조회할 유저의 ID',
    example: 'user-123'
  })
  @ApiResponse({
    status: 200, description: '잔액 조회 성공', schema: {
      example: {
        balance: 10000,
        lastChargeDate: '2025-04-04T09:00:00Z'
      }
    }
  })
  @ApiResponse({
    status: 404, description: '사용자를 찾을 수 없음', schema: {
      example: {
        statusCode: 404,
        message: '해당 사용자를 찾을 수 없습니다.',
      }
    }
  })
  getBalance() {
    return {
      balance: 10000,
      lastChargeDate: '2024-03-15T09:00:00Z'
    };
  }

  @Get('history')
  @ApiOperation({ summary: '포인트 사용 내역 조회', description: '유저의 포인트 충전/사용 이력을 조회합니다.' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: '조회할 유저의 ID',
    example: 'user-123'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (1부터 시작)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '한 페이지당 항목 수',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: '포인트 사용 내역 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'history-123' },
              type: { type: 'string', enum: ['CHARGE', 'USE'], example: 'CHARGE' },
              amount: { type: 'number', example: 10000 },
              balance: { type: 'number', example: 15000 },
              description: { type: 'string', example: '포인트 충전' },
              date: { type: 'string', example: '2024-03-15T09:00:00Z' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
          },
        },
      },
    },
  })
  getPointHistory() {
    return {
      items: [
        {
          id: 'history-123',
          type: 'CHARGE',
          amount: 10000,
          balance: 15000,
          description: '포인트 충전',
          date: '2024-03-15T09:00:00Z'
        }
      ],
      pagination: {
        total: 42,
        page: 1,
        limit: 20
      }
    };
  }
}