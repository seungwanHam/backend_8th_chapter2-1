export interface ProductOption {
  optionId: string;
  name: string;
  price: number;
  stock: number;
}

export class Product {
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  options: ProductOption[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    productId: string;
    name: string;
    description: string;
    basePrice: number;
    options: ProductOption[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.productId = props.productId;
    this.name = props.name;
    this.description = props.description;
    this.basePrice = props.basePrice;
    this.options = props.options;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * 상품 옵션 조회
   * 존재하는 옵션인지 확인합니다.
   */
  getOption(optionId: string): ProductOption | undefined {
    return this.options.find(option => option.optionId === optionId);
  }

  /**
   * 상품 옵션 재고 확인
   * 요청한 수량만큼 재고가 있는지 확인합니다.
   */
  hasStock(optionId: string, quantity: number): boolean {
    const option = this.getOption(optionId);
    return option ? option.stock >= quantity : false;
  }
}