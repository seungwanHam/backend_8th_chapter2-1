import { Controller, Get, Post, Body, Query, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderFacade } from '../application/order.facade';
import { CreateOrderDto, OrderQueryDto } from '../application/dto/order-request.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';

@ApiTags('주문')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderFacade: OrderFacade) { }

  @ApiOperation({ summary: '주문 생성' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: '주문 생성 성공' })
  @Post()
  async createOrder(
    @CurrentUser() userId: string,
    @Body() dto: CreateOrderDto
  ) {
    return this.orderFacade.createOrder(userId, dto);
  }

  @ApiOperation({ summary: '주문 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '주문 목록 반환' })
  @Get()
  async getUserOrders(
    @CurrentUser() userId: string,
    @Query() query: OrderQueryDto
  ) {
    return this.orderFacade.getUserOrders(userId, query);
  }

  @ApiOperation({ summary: '주문 상세 조회' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '주문 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
  @Get(':id')
  async getOrder(
    @CurrentUser() userId: string,
    @Param('id') orderId: string
  ) {
    return this.orderFacade.getOrder(orderId, userId);
  }

  @ApiOperation({ summary: '주문 취소' })
  @ApiParam({ name: 'id', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '주문 취소 성공' })
  @ApiResponse({ status: 400, description: '취소할 수 없는 상태의 주문' })
  @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
  @Delete(':id/cancel')
  async cancelOrder(
    @CurrentUser() userId: string,
    @Param('id') orderId: string
  ) {
    return this.orderFacade.cancelOrder(orderId, userId);
  }
}