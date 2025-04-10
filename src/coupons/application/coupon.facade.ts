import { Injectable } from '@nestjs/common';
import { CouponService } from '../domain/coupon.service';
import { CreateCouponDto, UpdateCouponDto, CouponQueryDto, IssueCouponDto, ApplyCouponDto, IssueFirstComeCouponDto } from './dto/coupon-request.dto';
import { CouponDto, UserCouponDto, CouponListResponseDto, ApplyCouponResponseDto } from './dto/coupon-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CouponFacade {
  constructor(private readonly couponService: CouponService) { }

  /**
   * 쿠폰 목록 조회
   */
  async getCoupons(query: CouponQueryDto): Promise<CouponListResponseDto> {
    const { items, total } = await this.couponService.getCoupons(
      query.page,
      query.limit,
      query.isActive
    );

    return plainToInstance(
      CouponListResponseDto,
      {
        items: items.map(coupon => ({
          couponId: coupon.couponId,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          startDate: coupon.startDate,
          endDate: coupon.endDate,
          isActive: coupon.isActive,
          totalQuantity: coupon.totalQuantity,
          usedQuantity: coupon.usedQuantity,
          createdAt: coupon.createdAt,
        })),
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
        }
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 쿠폰 상세 조회
   */
  async getCoupon(id: string): Promise<CouponDto> {
    const coupon = await this.couponService.getCouponById(id);

    return plainToInstance(
      CouponDto,
      {
        couponId: coupon.couponId,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        totalQuantity: coupon.totalQuantity,
        usedQuantity: coupon.usedQuantity,
        createdAt: coupon.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 쿠폰 생성
   */
  async createCoupon(dto: CreateCouponDto): Promise<CouponDto> {
    const coupon = await this.couponService.createCoupon(
      dto.code,
      dto.name,
      dto.discountType,
      dto.discountValue,
      dto.minOrderAmount,
      new Date(dto.startDate),
      new Date(dto.endDate),
      {
        description: dto.description,
        maxDiscountAmount: dto.maxDiscountAmount,
        totalQuantity: dto.totalQuantity,
        isActive: dto.isActive,
      }
    );

    return plainToInstance(
      CouponDto,
      {
        couponId: coupon.couponId,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        totalQuantity: coupon.totalQuantity,
        usedQuantity: coupon.usedQuantity,
        createdAt: coupon.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 쿠폰 업데이트
   */
  async updateCoupon(id: string, dto: UpdateCouponDto): Promise<CouponDto> {
    const updateData: Partial<any> = { ...dto };

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    const coupon = await this.couponService.updateCoupon(id, updateData);

    return plainToInstance(
      CouponDto,
      {
        couponId: coupon.couponId,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        totalQuantity: coupon.totalQuantity,
        usedQuantity: coupon.usedQuantity,
        createdAt: coupon.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 사용자에게 쿠폰 발급
   */
  async issueCouponToUser(userId: string, dto: IssueCouponDto): Promise<UserCouponDto> {
    const userCoupon = await this.couponService.issueCouponToUser(userId, dto.couponId);

    const userCouponWithCoupon = await this.couponService.getUserCoupon(userCoupon.id);

    return plainToInstance(
      UserCouponDto,
      {
        id: userCouponWithCoupon.id,
        userId: userCouponWithCoupon.userId,
        coupon: userCouponWithCoupon.coupon ? {
          couponId: userCouponWithCoupon.coupon.couponId,
          code: userCouponWithCoupon.coupon.code,
          name: userCouponWithCoupon.coupon.name,
          description: userCouponWithCoupon.coupon.description,
          discountType: userCouponWithCoupon.coupon.discountType,
          discountValue: userCouponWithCoupon.coupon.discountValue,
          minOrderAmount: userCouponWithCoupon.coupon.minOrderAmount,
          maxDiscountAmount: userCouponWithCoupon.coupon.maxDiscountAmount,
          startDate: userCouponWithCoupon.coupon.startDate,
          endDate: userCouponWithCoupon.coupon.endDate,
          isActive: userCouponWithCoupon.coupon.isActive,
          totalQuantity: userCouponWithCoupon.coupon.totalQuantity,
          usedQuantity: userCouponWithCoupon.coupon.usedQuantity,
          createdAt: userCouponWithCoupon.coupon.createdAt,
        } : undefined,
        isUsed: userCouponWithCoupon.isUsed,
        usedAt: userCouponWithCoupon.usedAt,
        orderId: userCouponWithCoupon.orderId,
        issuedAt: userCouponWithCoupon.issuedAt,
        expiresAt: userCouponWithCoupon.expiresAt,
        isAvailable: userCouponWithCoupon.isAvailable(),
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 사용자 쿠폰 목록 조회
   */
  async getUserCoupons(userId: string, isUsed?: boolean): Promise<UserCouponDto[]> {
    const userCoupons = await this.couponService.getUserCoupons(userId, isUsed);

    return userCoupons.map(userCoupon =>
      plainToInstance(
        UserCouponDto,
        {
          id: userCoupon.id,
          userId: userCoupon.userId,
          coupon: userCoupon.coupon ? {
            couponId: userCoupon.coupon.couponId,
            code: userCoupon.coupon.code,
            name: userCoupon.coupon.name,
            description: userCoupon.coupon.description,
            discountType: userCoupon.coupon.discountType,
            discountValue: userCoupon.coupon.discountValue,
            minOrderAmount: userCoupon.coupon.minOrderAmount,
            maxDiscountAmount: userCoupon.coupon.maxDiscountAmount,
            startDate: userCoupon.coupon.startDate,
            endDate: userCoupon.coupon.endDate,
            isActive: userCoupon.coupon.isActive,
            totalQuantity: userCoupon.coupon.totalQuantity,
            usedQuantity: userCoupon.coupon.usedQuantity,
            createdAt: userCoupon.coupon.createdAt,
          } : undefined,
          isUsed: userCoupon.isUsed,
          usedAt: userCoupon.usedAt,
          orderId: userCoupon.orderId,
          issuedAt: userCoupon.issuedAt,
          expiresAt: userCoupon.expiresAt,
          isAvailable: userCoupon.isAvailable(),
        },
        { excludeExtraneousValues: true }
      )
    );
  }

  /**
   * 쿠폰 적용
   */
  async applyCoupon(dto: ApplyCouponDto): Promise<ApplyCouponResponseDto> {
    const result = await this.couponService.useCoupon(
      dto.userCouponId,
      dto.orderId,
      dto.orderAmount
    );

    return plainToInstance(
      ApplyCouponResponseDto,
      {
        discountAmount: result.discountAmount,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 선착순 쿠폰 발급
   */
  async issueFirstComeCoupon(userId: string, dto: IssueFirstComeCouponDto): Promise<UserCouponDto> {
    const userCoupon = await this.couponService.issueFirstComeCoupon(
      userId,
      dto.couponId
    );

    const userCouponWithCoupon = await this.couponService.getUserCoupon(userCoupon.id);

    return this.mapUserCouponToDto(userCouponWithCoupon);
  }

  /**
   * 유효한 선착순 쿠폰 목록 조회
   */
  async getAvailableFirstComeCoupons(): Promise<CouponDto[]> {
    const coupons = await this.couponService.getAvailableFirstComeCoupons();

    return coupons.map(coupon => this.mapCouponToDto(coupon));
  }

  // 매핑 메서드 추가
  private mapUserCouponToDto(userCoupon: any): UserCouponDto {
    return plainToInstance(
      UserCouponDto,
      {
        id: userCoupon.id,
        userId: userCoupon.userId,
        coupon: userCoupon.coupon ? this.mapCouponToDto(userCoupon.coupon) : undefined,
        isUsed: userCoupon.isUsed,
        usedAt: userCoupon.usedAt,
        orderId: userCoupon.orderId,
        issuedAt: userCoupon.issuedAt,
        expiresAt: userCoupon.expiresAt,
        isAvailable: userCoupon.isAvailable(),
      },
      { excludeExtraneousValues: true }
    );
  }

  private mapCouponToDto(coupon: any): CouponDto {
    return plainToInstance(
      CouponDto,
      {
        couponId: coupon.couponId,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        totalQuantity: coupon.totalQuantity,
        remainingQuantity: coupon.remainingQuantity,
        usedQuantity: coupon.usedQuantity,
        couponType: coupon.couponType,
        createdAt: coupon.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}