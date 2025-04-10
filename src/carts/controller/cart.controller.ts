import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartFacade } from '../application/cart.facade';
import { AddCartItemDto, UpdateCartItemDto } from '../application/dto/cart-request.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';

@ApiTags('장바구니')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartFacade: CartFacade) { }

  @ApiOperation({ summary: '장바구니 조회' })
  @ApiResponse({ status: 200, description: '장바구니 정보 반환' })
  @Get()
  async getCart(@CurrentUser() userId: string) {
    return this.cartFacade.getCart(userId);
  }

  @ApiOperation({ summary: '장바구니에 상품 추가' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: '상품 추가 성공' })
  @Post('items')
  async addItemToCart(
    @CurrentUser() userId: string,
    @Body() dto: AddCartItemDto
  ) {
    return this.cartFacade.addItemToCart(userId, dto);
  }

  @ApiOperation({ summary: '장바구니 상품 수량 변경' })
  @ApiParam({ name: 'itemId', description: '장바구니 아이템 ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: '수량 변경 성공' })
  @ApiResponse({ status: 404, description: '장바구니 아이템을 찾을 수 없음' })
  @Put('items/:itemId')
  async updateCartItemQuantity(
    @CurrentUser() userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto
  ) {
    return this.cartFacade.updateCartItemQuantity(userId, itemId, dto);
  }

  @ApiOperation({ summary: '장바구니에서 상품 제거' })
  @ApiParam({ name: 'itemId', description: '장바구니 아이템 ID' })
  @ApiResponse({ status: 200, description: '상품 제거 성공' })
  @ApiResponse({ status: 404, description: '장바구니 아이템을 찾을 수 없음' })
  @Delete('items/:itemId')
  async removeCartItem(
    @CurrentUser() userId: string,
    @Param('itemId') itemId: string
  ) {
    return this.cartFacade.removeCartItem(userId, itemId);
  }

  @ApiOperation({ summary: '장바구니 비우기' })
  @ApiResponse({ status: 200, description: '장바구니 비우기 성공' })
  @Delete('items')
  async clearCart(@CurrentUser() userId: string) {
    return this.cartFacade.clearCart(userId);
  }
}