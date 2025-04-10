import { Inject, Injectable } from '@nestjs/common';
import { Cart, CartItem } from './cart.entity';
import { CartRepository } from './cart.repository';
import { EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class CartService {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) { }

  /**
   * 사용자 장바구니 조회
   */
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      // 장바구니가 없는 경우 새로 생성
      cart = await this.cartRepository.createCart(userId);
    }
    return cart;
  }

  /**
   * 장바구니에 상품 추가
   */
  async addItemToCart(
    userId: string,
    productId: string,
    optionId: string,
    productName: string,
    optionName: string,
    price: number,
    quantity: number
  ): Promise<Cart> {
    let cart = await this.getCart(userId);

    // 이미 같은 상품이 있는지 확인
    const existingItem = cart.findItem(productId, optionId);

    if (existingItem) {
      // 이미 있으면 수량만 증가
      await this.cartRepository.updateItemQuantity(
        cart.id,
        existingItem.id,
        existingItem.quantity + quantity
      );
    } else {
      // 새 상품 추가
      await this.cartRepository.addItem(
        cart.id,
        productId,
        optionId,
        productName,
        optionName,
        price,
        quantity
      );
    }

    // 업데이트된 장바구니 반환
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * 장바구니 상품 수량 업데이트
   */
  async updateCartItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    // 해당 아이템이 있는지 확인
    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new EntityNotFoundException('장바구니에 해당 상품이 없습니다.');
    }

    // 수량 업데이트
    await this.cartRepository.updateItemQuantity(cart.id, itemId, quantity);

    // 업데이트된 장바구니 반환
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * 장바구니에서 상품 제거
   */
  async removeCartItem(
    userId: string,
    itemId: string
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    // 해당 아이템이 있는지 확인
    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new EntityNotFoundException('장바구니에 해당 상품이 없습니다.');
    }

    // 아이템 제거
    await this.cartRepository.removeItem(cart.id, itemId);

    // 업데이트된 장바구니 반환
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * 장바구니 비우기
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    // 장바구니 비우기
    await this.cartRepository.clearCart(cart.id);

    // 업데이트된 장바구니 반환
    return this.cartRepository.getCartWithItems(cart.id);
  }
}