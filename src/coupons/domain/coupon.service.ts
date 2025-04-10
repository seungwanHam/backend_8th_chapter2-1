import { Inject, Injectable } from '@nestjs/common';
import { Coupon, DiscountType, UserCoupon } from './coupon.entity';
import { CouponRepository } from './coupon.repository';
import { BusinessRuleException, EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class CouponService {
  constructor(
    @Inject('CouponRepository')
    private readonly couponRepository: CouponRepository,
  ) { }

  /**
   * 쿠폰 상세 조회
   */
  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new EntityNotFoundException('쿠폰을 찾을 수 없습니다.');
    }
    return coupon;
  }

  /**
   * 쿠폰 코드로 조회
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new EntityNotFoundException('쿠폰을 찾을 수 없습니다.');
    }
    return coupon;
  }

  /**
   * 쿠폰 목록 조회
   */
  async getCoupons(page: number, limit: number, isActive?: boolean): Promise<{ items: Coupon[]; total: number }> {
    return this.couponRepository.findAll(page, limit, isActive);
  }

  /**
   * 쿠폰 생성
   */
  async createCoupon(
    code: string,
    name: string,
    discountType: DiscountType,
    discountValue: number,
    minOrderAmount: number,
    startDate: Date,
    endDate: Date,
    options?: {
      description?: string;
      maxDiscountAmount?: number;
      totalQuantity?: number;
      isActive?: boolean;
    }
  ): Promise<Coupon> {
    // 쿠폰 코드 중복 확인
    const existingCoupon = await this.couponRepository.findByCode(code);
    if (existingCoupon) {
      throw new BusinessRuleException('이미 사용 중인 쿠폰 코드입니다.');
    }

    // 할인 값 유효성 검증
    if (discountType === DiscountType.PERCENTAGE && (discountValue <= 0 || discountValue > 100)) {
      throw new BusinessRuleException('할인율은 1에서 100 사이의 값이어야 합니다.');
    }

    if (discountType === DiscountType.FIXED_AMOUNT && discountValue <= 0) {
      throw new BusinessRuleException('할인 금액은 0보다 커야 합니다.');
    }

    // 쿠폰 유효기간 검증
    if (startDate >= endDate) {
      throw new BusinessRuleException('쿠폰 시작일은 종료일보다 이전이어야 합니다.');
    }

    const coupon = await this.couponRepository.save({
      code,
      name,
      description: options?.description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount: options?.maxDiscountAmount,
      startDate,
      endDate,
      isActive: options?.isActive ?? true,
      totalQuantity: options?.totalQuantity,
      usedQuantity: 0,
    } as Coupon);

    return coupon;
  }

  /**
   * 쿠폰 업데이트
   */
  async updateCoupon(id: string, couponData: Partial<Coupon>): Promise<Coupon> {
    await this.getCouponById(id);
    return this.couponRepository.update(id, couponData);
  }

  /**
   * 사용자에게 쿠폰 발급
   */
  async issueCouponToUser(userId: string, couponId: string): Promise<UserCoupon> {
    const coupon = await this.getCouponById(couponId);

    // 쿠폰 유효성 검증
    if (!coupon.isValid()) {
      throw new BusinessRuleException('유효하지 않은 쿠폰입니다.');
    }

    // 쿠폰 수량 검증
    if (coupon.hasQuantityLimit() && !coupon.hasAvailableQuantity()) {
      throw new BusinessRuleException('쿠폰 수량이 모두 소진되었습니다.');
    }

    // 쿠폰 발급 (기본적으로 만료일은 쿠폰의 종료일)
    return this.couponRepository.issueUserCoupon(userId, couponId, coupon.endDate);
  }

  /**
   * 사용자 쿠폰 목록 조회
   */
  async getUserCoupons(userId: string, isUsed?: boolean): Promise<UserCoupon[]> {
    return this.couponRepository.findUserCoupons(userId, isUsed);
  }

  /**
   * 사용자 쿠폰 조회
   */
  async getUserCoupon(id: string): Promise<UserCoupon> {
    const userCoupon = await this.couponRepository.getUserCouponWithCoupon(id);
    if (!userCoupon) {
      throw new EntityNotFoundException('사용자 쿠폰을 찾을 수 없습니다.');
    }
    return userCoupon;
  }

  /**
   * 쿠폰 사용
   */
  async useCoupon(userCouponId: string, orderId: string, orderAmount: number): Promise<{ discountAmount: number }> {
    const userCoupon = await this.getUserCoupon(userCouponId);

    if (!userCoupon.coupon) {
      throw new BusinessRuleException('쿠폰 정보를 찾을 수 없습니다.');
    }

    if (!userCoupon.isAvailable()) {
      throw new BusinessRuleException('사용할 수 없는 쿠폰입니다.');
    }

    if (!userCoupon.coupon.isMinOrderAmountMet(orderAmount)) {
      throw new BusinessRuleException(`최소 주문 금액(${userCoupon.coupon.minOrderAmount}원)을 충족하지 않습니다.`);
    }

    // 할인 금액 계산
    const discountAmount = userCoupon.coupon.calculateDiscount(orderAmount);

    // 쿠폰 사용 처리
    await this.couponRepository.useUserCoupon(userCouponId, orderId);

    // 쿠폰 사용량 증가
    await this.couponRepository.increaseUsedQuantity(userCoupon.couponId);

    return { discountAmount };
  }
}