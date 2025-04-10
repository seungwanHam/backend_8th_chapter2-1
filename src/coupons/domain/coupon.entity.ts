export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class Coupon {
  couponId: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  totalQuantity?: number;
  usedQuantity: number;
  createdAt: Date;

  constructor(props: {
    couponId: string;
    code: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    totalQuantity?: number;
    usedQuantity: number;
    createdAt: Date;
  }) {
    this.couponId = props.couponId;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.minOrderAmount = props.minOrderAmount;
    this.maxDiscountAmount = props.maxDiscountAmount;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.isActive = props.isActive;
    this.totalQuantity = props.totalQuantity;
    this.usedQuantity = props.usedQuantity;
    this.createdAt = props.createdAt;
  }

  /**
   * 쿠폰이 유효한지 확인
   */
  isValid(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.startDate &&
      now <= this.endDate &&
      (!this.totalQuantity || this.usedQuantity < this.totalQuantity)
    );
  }

  /**
   * 쿠폰 수량 제한이 있는지 확인
   */
  hasQuantityLimit(): boolean {
    return !!this.totalQuantity;
  }

  /**
   * 쿠폰 수량이 남아있는지 확인
   */
  hasAvailableQuantity(): boolean {
    return !this.hasQuantityLimit() || this.usedQuantity < this.totalQuantity;
  }

  /**
   * 최소 주문 금액을 충족하는지 확인
   */
  isMinOrderAmountMet(orderAmount: number): boolean {
    return orderAmount >= this.minOrderAmount;
  }

  /**
   * 할인 금액 계산
   */
  calculateDiscount(orderAmount: number): number {
    if (!this.isMinOrderAmountMet(orderAmount)) {
      return 0;
    }

    let discount = 0;

    if (this.discountType === DiscountType.PERCENTAGE) {
      discount = Math.floor(orderAmount * (this.discountValue / 100));

      // 최대 할인 금액 제한이 있는 경우
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
    } else {
      // 정액 할인
      discount = this.discountValue;

      // 주문 금액보다 할인 금액이 클 수 없음
      if (discount > orderAmount) {
        discount = orderAmount;
      }
    }

    return discount;
  }
}

export class UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  coupon?: Coupon;
  isUsed: boolean;
  usedAt?: Date;
  orderId?: string;
  issuedAt: Date;
  expiresAt?: Date;

  constructor(props: {
    id: string;
    userId: string;
    couponId: string;
    coupon?: Coupon;
    isUsed: boolean;
    usedAt?: Date;
    orderId?: string;
    issuedAt: Date;
    expiresAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.couponId = props.couponId;
    this.coupon = props.coupon;
    this.isUsed = props.isUsed;
    this.usedAt = props.usedAt;
    this.orderId = props.orderId;
    this.issuedAt = props.issuedAt;
    this.expiresAt = props.expiresAt;
  }

  /**
   * 사용 가능한 쿠폰인지 확인
   */
  isAvailable(): boolean {
    const now = new Date();

    // 이미 사용된 쿠폰인지 확인
    if (this.isUsed) {
      return false;
    }

    // 만료일이 설정된 경우 확인
    if (this.expiresAt && now > this.expiresAt) {
      return false;
    }

    // 연결된 쿠폰이 있는 경우 쿠폰의 유효성 확인
    if (this.coupon) {
      return this.coupon.isValid();
    }

    return true;
  }
}