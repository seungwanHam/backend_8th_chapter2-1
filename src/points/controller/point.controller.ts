import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PointFacade } from '../application/point.facade';
import { ChargePointDto, UsePointDto, PointHistoryQueryDto } from '../application/dto/point-request.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';

@ApiTags('포인트')
@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointController {
  constructor(private readonly pointFacade: PointFacade) { }

  @ApiOperation({ summary: '포인트 잔액 조회' })
  @ApiResponse({ status: 200, description: '포인트 잔액 정보 반환' })
  @Get('balance')
  async getBalance(@CurrentUser() userId: string) {
    return this.pointFacade.getPointBalance(userId);
  }

  @ApiOperation({ summary: '포인트 충전' })
  @ApiBody({ type: ChargePointDto })
  @ApiResponse({ status: 201, description: '포인트 충전 성공' })
  @Post('charge')
  async chargePoint(
    @CurrentUser() userId: string,
    @Body() dto: ChargePointDto
  ) {
    return this.pointFacade.chargePoint(userId, dto);
  }

  @ApiOperation({ summary: '포인트 사용' })
  @ApiBody({ type: UsePointDto })
  @ApiResponse({ status: 201, description: '포인트 사용 성공' })
  @ApiResponse({ status: 400, description: '포인트 잔액 부족' })
  @Post('use')
  async usePoint(
    @CurrentUser() userId: string,
    @Body() dto: UsePointDto
  ) {
    return this.pointFacade.usePoint(userId, dto);
  }

  @ApiOperation({ summary: '포인트 거래 내역 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'type', required: false, description: '거래 유형' })
  @ApiResponse({ status: 200, description: '포인트 거래 내역 반환' })
  @Get('history')
  async getPointHistory(
    @CurrentUser() userId: string,
    @Query() query: PointHistoryQueryDto
  ) {
    return this.pointFacade.getPointHistory(userId, query);
  }
}