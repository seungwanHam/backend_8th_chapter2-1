import { Injectable } from '@nestjs/common';
import { CartService } from '../domain/cart.service';
import { ProductFacade } from '../../products/application/product.facade';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-request.dto';
import { CartDto } from './dto/cart-response.dto';
import { plainToInstance } from 'class-transformer';
import { BusinessRuleException } from '../../common/exceptions/domain-exception';

@Injectable()
export class CartFacade {
  constructor(
    private readonly cartService: CartService,
    private readonly productFacade: ProductFacade,
  ) { }

  /**
   * 장바구니 조회
   */
  async getCart(userId: string): Promise<CartDto> {
    const cart = await this.cartService.getCart(userId);

    return this.mapCartToDto(cart);
  }

  /**
   * 장바구니에 상품 추가
   */
  async addItemToCart(userId: string, dto: AddCartItemDto): Promise<CartDto> {
    // 상품 정보 조회
    const product = await this.productFacade.getProduct(dto.productId);

    // 옵션 정보 찾기
    const option = product.options.find(opt => opt.optionId === dto.optionId);
    if (!option) {
      throw new BusinessRuleException('선택한 상품 옵션을 찾을 수 없습니다.');
    }

    // 재고 확인
    if (option.stock < dto.quantity) {
      throw new BusinessRuleException('상품의 재고가 부족합니다.');
    }

    // 장바구니에 추가
    const cart = await this.cartService.addItemToCart(
      userId,
      dto.productId,
      dto.optionId,
      product.name,
      option.name,
      option.price,
      dto.quantity
    );

    return this.mapCartToDto(cart);
  }

  /**
   * 장바구니 상품 수량 변경
   */
  async updateCartItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.cartService.updateCartItemQuantity(
      userId,
      itemId,
      dto.quantity
    );

    return this.mapCartToDto(cart);
  }

  /**
   * 장바구니에서 상품 제거
   */
  async removeCartItem(userId: string, itemId: string): Promise<CartDto> {
    const cart = await this.cartService.removeCartItem(userId, itemId);

    return this.mapCartToDto(cart);
  }

  /**
   * 장바구니 비우기
   */
  async clearCart(userId: string): Promise<CartDto> {
    const cart = await this.cartService.clearCart(userId);

    return this.mapCartToDto(cart);
  }

  /**
   * Cart 엔티티를 DTO로 변환
   */
  private mapCartToDto(cart: any): CartDto {
    return plainToInstance(
      CartDto,
      {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          optionId: item.optionId,
          optionName: item.optionName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.getSubtotal(),
        })),
        totalAmount: cart.getTotalAmount(),
        itemCount: cart.getItemCount(),
        updatedAt: cart.updatedAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}