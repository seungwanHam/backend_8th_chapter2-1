import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserFacade } from '../application/user.facade';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';

@ApiTags('사용자')
@Controller('users')
export class UserController {
  constructor(private readonly userFacade: UserFacade) { }

  @ApiOperation({ summary: '사용자 포인트 잔액 조회' })
  @ApiResponse({ status: 200, description: '포인트 잔액 정보 반환' })
  @UseGuards(JwtAuthGuard)
  @Get('me/points/balance')
  async getPointBalance(@CurrentUser() userId: string) {
    return this.userFacade.getUserPointBalance(userId);
  }

  @ApiOperation({ summary: '사용자 포인트 내역 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'type', required: false, description: '거래 유형 (CHARGE, USE, REFUND, REWARD)' })
  @ApiResponse({ status: 200, description: '포인트 내역 반환' })
  @UseGuards(JwtAuthGuard)
  @Get('me/points/history')
  async getPointHistory(
    @CurrentUser() userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string
  ) {
    return this.userFacade.getUserPointHistory(userId, page, limit, type);
  }
}