import { Controller, Get, Post, Body, Query, Param, Put, UseGuards } from '@nestjs/common';
import { CouponFacade } from '../application/coupon.facade';
import { CreateCouponDto, UpdateCouponDto, CouponQueryDto, IssueCouponDto, ApplyCouponDto, IssueFirstComeCouponDto } from '../application/dto/coupon-request.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';

@ApiTags('쿠폰')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponFacade: CouponFacade) { }

  @ApiOperation({ summary: '쿠폰 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'isActive', required: false, description: '활성 쿠폰만 조회' })
  @ApiResponse({ status: 200, description: '쿠폰 목록 반환' })
  @Get()
  async getCoupons(@Query() query: CouponQueryDto) {
    return this.couponFacade.getCoupons(query);
  }

  @ApiOperation({ summary: '쿠폰 상세 조회' })
  @ApiParam({ name: 'id', description: '쿠폰 ID' })
  @ApiResponse({ status: 200, description: '쿠폰 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '쿠폰을 찾을 수 없음' })
  @Get(':id')
  async getCoupon(@Param('id') id: string) {
    return this.couponFacade.getCoupon(id);
  }

  @ApiOperation({ summary: '쿠폰 생성' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: '쿠폰 생성 성공' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponFacade.createCoupon(dto);
  }

  @ApiOperation({ summary: '쿠폰 업데이트' })
  @ApiParam({ name: 'id', description: '쿠폰 ID' })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: '쿠폰 업데이트 성공' })
  @ApiResponse({ status: 404, description: '쿠폰을 찾을 수 없음' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponFacade.updateCoupon(id, dto);
  }

  @ApiOperation({ summary: '사용자 쿠폰 목록 조회' })
  @ApiQuery({ name: 'isUsed', required: false, description: '사용된 쿠폰만 조회' })
  @ApiResponse({ status: 200, description: '사용자 쿠폰 목록 반환' })
  @UseGuards(JwtAuthGuard)
  @Get('user/my')
  async getUserCoupons(
    @CurrentUser() userId: string,
    @Query('isUsed') isUsed?: boolean
  ) {
    return this.couponFacade.getUserCoupons(userId, isUsed);
  }

  @ApiOperation({ summary: '쿠폰 발급' })
  @ApiBody({ type: IssueCouponDto })
  @ApiResponse({ status: 201, description: '쿠폰 발급 성공' })
  @UseGuards(JwtAuthGuard)
  @Post('user/issue')
  async issueCoupon(
    @CurrentUser() userId: string,
    @Body() dto: IssueCouponDto
  ) {
    return this.couponFacade.issueCouponToUser(userId, dto);
  }

  @ApiOperation({ summary: '선착순 쿠폰 발급' })
  @ApiBody({ type: IssueFirstComeCouponDto })
  @ApiResponse({ status: 201, description: '선착순 쿠폰 발급 성공' })
  @ApiResponse({ status: 400, description: '쿠폰 발급 실패 (수량 소진 등)' })
  @UseGuards(JwtAuthGuard)
  @Post('first-come/issue')
  async issueFirstComeCoupon(
    @CurrentUser() userId: string,
    @Body() dto: IssueFirstComeCouponDto
  ) {
    return this.couponFacade.issueFirstComeCoupon(userId, dto);
  }

  @ApiOperation({ summary: '유효한 선착순 쿠폰 목록 조회' })
  @ApiResponse({ status: 200, description: '선착순 쿠폰 목록 반환' })
  @Get('first-come')
  async getAvailableFirstComeCoupons() {
    return this.couponFacade.getAvailableFirstComeCoupons();
  }

  @ApiOperation({ summary: '쿠폰 적용' })
  @ApiBody({ type: ApplyCouponDto })
  @ApiResponse({ status: 200, description: '쿠폰 적용 성공, 할인 금액 반환' })
  @ApiResponse({ status: 400, description: '쿠폰 적용 실패' })
  @UseGuards(JwtAuthGuard)
  @Post('apply')
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.couponFacade.applyCoupon(dto);
  }
}