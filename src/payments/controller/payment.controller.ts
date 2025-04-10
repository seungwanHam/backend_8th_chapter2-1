import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentFacade } from '../application/payment.facade';
import { ProcessPaymentDto, VerifyPaymentDto, CancelPaymentDto } from '../application/dto/payment-request.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';

@ApiTags('결제')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentFacade: PaymentFacade) { }

  @ApiOperation({ summary: '결제 정보 조회' })
  @ApiParam({ name: 'id', description: '결제 ID' })
  @ApiResponse({ status: 200, description: '결제 정보 반환' })
  @ApiResponse({ status: 404, description: '결제 정보를 찾을 수 없음' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPayment(@Param('id') paymentId: string) {
    return this.paymentFacade.getPayment(paymentId);
  }

  @ApiOperation({ summary: '주문의 결제 정보 조회' })
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  @ApiResponse({ status: 200, description: '결제 정보 반환' })
  @ApiResponse({ status: 404, description: '결제 정보를 찾을 수 없음' })
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentFacade.getPaymentByOrderId(orderId);
  }

  @ApiOperation({ summary: '결제 처리' })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiResponse({ status: 201, description: '결제 처리 성공' })
  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.paymentFacade.processPayment(dto);
  }

  @ApiOperation({ summary: '결제 검증' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({ status: 200, description: '결제 검증 성공' })
  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentFacade.verifyPayment(dto);
  }

  @ApiOperation({ summary: '결제 취소' })
  @ApiBody({ type: CancelPaymentDto })
  @ApiResponse({ status: 200, description: '결제 취소 성공' })
  @ApiResponse({ status: 400, description: '결제 취소 실패' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('cancel')
  async cancelPayment(@Body() dto: CancelPaymentDto) {
    return this.paymentFacade.cancelPayment(dto);
  }
}