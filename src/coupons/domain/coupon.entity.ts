export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum CouponType {
  REGULAR = 'REGULAR',      // 일반 쿠폰
  FIRST_COME = 'FIRST_COME', // 선착순 쿠폰
  NORMAL = "NORMAL"
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
  totalQuantity?: number;   // 총 발급 가능 수량
  remainingQuantity?: number; // 남은 발급 가능 수량
  usedQuantity: number;
  couponType: CouponType;   // 쿠폰 타입 추가
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
    remainingQuantity?: number;
    usedQuantity: number;
    couponType?: CouponType;
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
    this.remainingQuantity = props.remainingQuantity;
    this.usedQuantity = props.usedQuantity;
    this.couponType = props.couponType || CouponType.REGULAR;
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
      this.hasRemainingQuantity()
    );
  }

  /**
   * 선착순 쿠폰인지 확인
   */
  isFirstCome(): boolean {
    return this.couponType === CouponType.FIRST_COME;
  }

  /**
   * 수량 제한이 있는지 확인
   */
  hasQuantityLimit(): boolean {
    return !!this.totalQuantity;
  }

  /**
   * 남은 수량이 있는지 확인
   */
  hasRemainingQuantity(): boolean {
    if (!this.hasQuantityLimit()) {
      return true;
    }
    return this.remainingQuantity > 0;
  }

  /**
   * 쿠폰 발급 가능 여부 확인 (선착순)
   */
  canIssue(): boolean {
    if (!this.isValid()) {
      return false;
    }

    // 선착순 쿠폰이고 수량 제한이 있는 경우, 남은 수량을 체크
    if (this.isFirstCome() && this.hasQuantityLimit()) {
      return this.hasRemainingQuantity();
    }

    return true;
  }

  /**
   * 쿠폰 발급 시 수량 감소
   * 동시성 문제를 고려하여 실제 데이터베이스 업데이트는 Repository에서 처리
   */
  decreaseRemainingQuantity(): void {
    if (this.remainingQuantity !== undefined && this.remainingQuantity > 0) {
      this.remainingQuantity--;
    }
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