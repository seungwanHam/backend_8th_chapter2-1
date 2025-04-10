export class CartItem {
  id: string;
  productId: string;
  optionId: string;
  productName: string;
  optionName: string;
  price: number;
  quantity: number;

  constructor(props: {
    id: string;
    productId: string;
    optionId: string;
    productName: string;
    optionName: string;
    price: number;
    quantity: number;
  }) {
    this.id = props.id;
    this.productId = props.productId;
    this.optionId = props.optionId;
    this.productName = props.productName;
    this.optionName = props.optionName;
    this.price = props.price;
    this.quantity = props.quantity;
  }

  /**
   * 항목 소계 계산
   */
  getSubtotal(): number {
    return this.price * this.quantity;
  }
}

export class Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    items: CartItem[];
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.items = props.items;
    this.updatedAt = props.updatedAt;
  }

  /**
   * 장바구니 총액 계산
   */
  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }

  /**
   * 장바구니 아이템 개수
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * 특정 상품 옵션이 장바구니에 있는지 확인
   */
  hasItem(productId: string, optionId: string): boolean {
    return this.items.some(
      item => item.productId === productId && item.optionId === optionId
    );
  }

  /**
   * 특정 상품 옵션의 장바구니 아이템 찾기
   */
  findItem(productId: string, optionId: string): CartItem | undefined {
    return this.items.find(
      item => item.productId === productId && item.optionId === optionId
    );
  }
}