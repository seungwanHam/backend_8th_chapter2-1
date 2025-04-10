import { Coupon, UserCoupon } from './coupon.entity';

export interface CouponRepository {
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(page: number, limit: number, isActive?: boolean): Promise<{ items: Coupon[]; total: number }>;
  save(coupon: Omit<Coupon, 'couponId' | 'createdAt'>): Promise<Coupon>;
  update(id: string, coupon: Partial<Coupon>): Promise<Coupon>;
  increaseUsedQuantity(id: string): Promise<void>;
  
  // 사용자 쿠폰 관련
  findUserCouponById(id: string): Promise<UserCoupon | null>;
  findUserCoupons(userId: string, isUsed?: boolean): Promise<UserCoupon[]>;
  issueUserCoupon(userId: string, couponId: string, expiresAt?: Date): Promise<UserCoupon>;
  useUserCoupon(id: string, orderId: string): Promise<UserCoupon>;
  getUserCouponWithCoupon(id: string): Promise<UserCoupon | null>;
}