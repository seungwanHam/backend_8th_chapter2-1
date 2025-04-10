import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../coupon.service';
import { CouponRepository } from '../coupon.repository';
import { Coupon, CouponType, DiscountType, UserCoupon } from '../coupon.entity';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions/domain-exception';

describe('CouponService', () => {
  let service: CouponService;
  let repository: jest.Mocked<CouponRepository>;

  // 모든 필수 메서드를 가진 Coupon 클래스 확장
  class TestCoupon extends Coupon {
    isValid(): boolean { return true; }
    hasQuantityLimit(): boolean { return false; }
    hasRemainingQuantity(): boolean { return true; }
    canIssue(): boolean { return true; }
    isFirstCome(): boolean { return false; }
    decreaseRemainingQuantity(): void {}
    calculate(orderAmount: number): number { return Math.min(orderAmount * (this.discountValue / 100), this.maxDiscountAmount || Infinity); }
  }

  // 선착순 쿠폰 클래스 확장
  class TestFirstComeCoupon extends Coupon {
    isValid(): boolean { return true; }
    hasQuantityLimit(): boolean { return true; }
    hasRemainingQuantity(): boolean { return this.remainingQuantity > 0; }
    canIssue(): boolean { return this.isFirstCome() && this.hasRemainingQuantity(); }
    isFirstCome(): boolean { return true; }
    decreaseRemainingQuantity(): void { this.remainingQuantity--; }
    calculate(orderAmount: number): number { return Math.min(orderAmount * (this.discountValue / 100), this.maxDiscountAmount || Infinity); }
  }

  const mockCoupon = new TestCoupon({
    couponId: 'coupon-1',
    code: 'TEST10',
    name: '테스트 쿠폰',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    minOrderAmount: 10000,
    maxDiscountAmount: 5000,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    isActive: true,
    couponType: CouponType.NORMAL,
    usedQuantity: 0,
    createdAt: new Date(),
  });

  const mockFirstComeCoupon = new TestFirstComeCoupon({
    couponId: 'coupon-2',
    code: 'FIRSTCOME50',
    name: '선착순 50% 할인 쿠폰',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 50,
    minOrderAmount: 20000,
    maxDiscountAmount: 10000,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    isActive: true,
    totalQuantity: 100,
    remainingQuantity: 50,
    usedQuantity: 50,
    couponType: CouponType.FIRST_COME,
    createdAt: new Date(),
  });

  const mockUserCoupon = new UserCoupon({
    id: 'user-coupon-1',
    userId: 'user-1',
    couponId: 'coupon-1',
    coupon: mockCoupon,
    isUsed: false,
    issuedAt: new Date(),
    expiresAt: new Date('2023-12-31'),
  });

  // 사용된 mockFirstComeCoupon 복사본 생성
  const zeroRemainingCoupon = new TestFirstComeCoupon({
    ...mockFirstComeCoupon,
    remainingQuantity: 0,
  });
  
  // 실제 메서드 동작을 오버라이드
  zeroRemainingCoupon.hasRemainingQuantity = function() { return false; };
  zeroRemainingCoupon.canIssue = function() { return false; };

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      increaseUsedQuantity: jest.fn(),
      findUserCouponById: jest.fn(),
      findUserCoupons: jest.fn(),
      issueUserCoupon: jest.fn(),
      useUserCoupon: jest.fn(),
      getUserCouponWithCoupon: jest.fn(),
      findFirstComeCoupons: jest.fn(),
      decreaseRemainingQuantity: jest.fn(),
      beginTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: 'CouponRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    repository = module.get('CouponRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('issueFirstComeCoupon', () => {
    it('선착순 쿠폰 발급이 성공적으로 이루어져야 합니다', async () => {
      repository.beginTransaction.mockResolvedValue({});
      repository.findById.mockResolvedValue(mockFirstComeCoupon);
      repository.decreaseRemainingQuantity.mockResolvedValue(mockFirstComeCoupon);
      repository.issueUserCoupon.mockResolvedValue(mockUserCoupon);
      repository.commitTransaction.mockResolvedValue();

      const result = await service.issueFirstComeCoupon('user-1', 'coupon-2');
      
      expect(result).toEqual(mockUserCoupon);
      expect(repository.beginTransaction).toHaveBeenCalled();
      expect(repository.decreaseRemainingQuantity).toHaveBeenCalledWith('coupon-2');
      expect(repository.issueUserCoupon).toHaveBeenCalled();
      expect(repository.commitTransaction).toHaveBeenCalled();
    });

    it('선착순 쿠폰이 아닌 경우 오류가 발생해야 합니다', async () => {
      repository.beginTransaction.mockResolvedValue({});
      repository.findById.mockResolvedValue(mockCoupon);
      repository.rollbackTransaction.mockResolvedValue();

      await expect(service.issueFirstComeCoupon('user-1', 'coupon-1')).rejects.toThrow(BusinessRuleException);
      expect(repository.rollbackTransaction).toHaveBeenCalled();
    });

    it('남은 수량이 없는 경우 오류가 발생해야 합니다', async () => {
      repository.beginTransaction.mockResolvedValue({});
      repository.findById.mockResolvedValue(zeroRemainingCoupon);
      repository.rollbackTransaction.mockResolvedValue();

      await expect(service.issueFirstComeCoupon('user-1', 'coupon-2')).rejects.toThrow(BusinessRuleException);
      expect(repository.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('useCoupon', () => {
    it('쿠폰 사용이 성공적으로 이루어져야 합니다', async () => {
      const userCouponWithMethod = {
        ...mockUserCoupon,
        isAvailable: () => true,
      };
      
      repository.getUserCouponWithCoupon.mockResolvedValue(userCouponWithMethod);
      repository.useUserCoupon.mockResolvedValue(mockUserCoupon);
      repository.increaseUsedQuantity.mockResolvedValue();

      const result = await service.useCoupon('user-coupon-1', 'order-1', 20000);
      
      expect(result).toEqual({ discountAmount: 2000 });
      expect(repository.useUserCoupon).toHaveBeenCalledWith('user-coupon-1', 'order-1');
      expect(repository.increaseUsedQuantity).toHaveBeenCalledWith('coupon-1');
    });

    it('최소 주문 금액을 충족하지 않는 경우 오류가 발생해야 합니다', async () => {
      const userCouponWithMethod = {
        ...mockUserCoupon,
        isAvailable: () => true,
      };
      
      repository.getUserCouponWithCoupon.mockResolvedValue(userCouponWithMethod);

      await expect(service.useCoupon('user-coupon-1', 'order-1', 5000)).rejects.toThrow(BusinessRuleException);
    });
  });
});