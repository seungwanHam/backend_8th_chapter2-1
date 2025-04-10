import { Cart, CartItem } from './cart.entity';

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;

  createCart(userId: string): Promise<Cart>;

  addItem(
    cartId: string,
    productId: string,
    optionId: string,
    productName: string,
    optionName: string,
    price: number,
    quantity: number,
  ): Promise<CartItem>;

  updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem>;

  removeItem(
    cartId: string,
    itemId: string,
  ): Promise<void>;

  clearCart(
    cartId: string,
  ): Promise<void>;

  getCartWithItems(
    cartId: string,
  ): Promise<Cart | null>;
}