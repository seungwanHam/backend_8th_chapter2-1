import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Coupon, DiscountType, UserCoupon } from '../domain/coupon.entity';
import { CouponRepository } from '../domain/coupon.repository';

@Injectable()
export class CouponRepositoryImpl implements CouponRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return null;
    }

    return this.mapToCouponEntity(coupon);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return null;
    }

    return this.mapToCouponEntity(coupon);
  }

  async findAll(page: number, limit: number, isActive?: boolean): Promise<{ items: Coupon[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = isActive !== undefined ? { isActive } : {};

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      items: coupons.map(this.mapToCouponEntity),
      total,
    };
  }

  async save(couponData: Omit<Coupon, 'couponId' | 'createdAt'>): Promise<Coupon> {
    const coupon = await this.prisma.coupon.create({
      data: {
        code: couponData.code,
        name: couponData.name,
        description: couponData.description,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        minOrderAmount: couponData.minOrderAmount,
        maxDiscountAmount: couponData.maxDiscountAmount,
        startDate: couponData.startDate,
        endDate: couponData.endDate,
        isActive: couponData.isActive,
        totalQuantity: couponData.totalQuantity,
        usedQuantity: couponData.usedQuantity || 0,
      },
    });

    return this.mapToCouponEntity(coupon);
  }

  async update(id: string, couponData: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        name: couponData.name,
        description: couponData.description,
        discountValue: couponData.discountValue,
        minOrderAmount: couponData.minOrderAmount,
        maxDiscountAmount: couponData.maxDiscountAmount,
        startDate: couponData.startDate,
        endDate: couponData.endDate,
        isActive: couponData.isActive,
        totalQuantity: couponData.totalQuantity,
      },
    });

    return this.mapToCouponEntity(coupon);
  }

  async increaseUsedQuantity(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: {
        usedQuantity: {
          increment: 1,
        },
      },
    });
  }

  // 사용자 쿠폰 관련
  async findUserCouponById(id: string): Promise<UserCoupon | null> {
    const userCoupon = await this.prisma.userCoupon.findUnique({
      where: { id },
    });

    if (!userCoupon) {
      return null;
    }

    return this.mapToUserCouponEntity(userCoupon);
  }

  async findUserCoupons(userId: string, isUsed?: boolean): Promise<UserCoupon[]> {
    const where = {
      userId,
      ...(isUsed !== undefined ? { isUsed } : {}),
    };

    const userCoupons = await this.prisma.userCoupon.findMany({
      where,
      include: {
        coupon: true,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    return userCoupons.map(uc => this.mapToUserCouponEntityWithCoupon(uc));
  }

  async issueUserCoupon(userId: string, couponId: string, expiresAt?: Date): Promise<UserCoupon> {
    const userCoupon = await this.prisma.userCoupon.create({
      data: {
        userId,
        couponId,
        expiresAt,
      },
    });

    return this.mapToUserCouponEntity(userCoupon);
  }

  async useUserCoupon(id: string, orderId: string): Promise<UserCoupon> {
    const userCoupon = await this.prisma.userCoupon.update({
      where: { id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        orderId,
      },
    });

    return this.mapToUserCouponEntity(userCoupon);
  }

  async getUserCouponWithCoupon(id: string): Promise<UserCoupon | null> {
    const userCoupon = await this.prisma.userCoupon.findUnique({
      where: { id },
      include: {
        coupon: true,
      },
    });

    if (!userCoupon) {
      return null;
    }

    return this.mapToUserCouponEntityWithCoupon(userCoupon);
  }

  /**
   * 선착순 쿠폰 목록 조회
   */
  async findFirstComeCoupons(): Promise<Coupon[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        couponType: 'FIRST_COME',
        isActive: true,
      },
    });

    return coupons.map(this.mapToCouponEntity);
  }

  /**
   * 쿠폰 남은 수량 감소 (선착순 쿠폰용)
   */
  async decreaseRemainingQuantity(couponId: string): Promise<Coupon> {
    const coupon = await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        remainingQuantity: {
          decrement: 1,
        },
      },
    });

    return this.mapToCouponEntity(coupon);
  }

  /**
   * 트랜잭션 시작
   */
  async beginTransaction(): Promise<any> {
    return await this.prisma.$transaction.start();
  }

  /**
   * 트랜잭션 커밋
   */
  async commitTransaction(tx: any): Promise<void> {
    await tx.commit();
  }

  /**
   * 트랜잭션 롤백
   */
  async rollbackTransaction(tx: any): Promise<void> {
    await tx.rollback();
  }

  private mapToCouponEntity(prismaCoupon: any): Coupon {
    return new Coupon({
      couponId: prismaCoupon.id,
      code: prismaCoupon.code,
      name: prismaCoupon.name,
      description: prismaCoupon.description,
      discountType: prismaCoupon.discountType as DiscountType,
      discountValue: prismaCoupon.discountValue,
      minOrderAmount: prismaCoupon.minOrderAmount,
      maxDiscountAmount: prismaCoupon.maxDiscountAmount,
      startDate: prismaCoupon.startDate,
      endDate: prismaCoupon.endDate,
      isActive: prismaCoupon.isActive,
      totalQuantity: prismaCoupon.totalQuantity,
      usedQuantity: prismaCoupon.usedQuantity,
      createdAt: prismaCoupon.createdAt,
    });
  }

  private mapToUserCouponEntity(prismaUserCoupon: any): UserCoupon {
    return new UserCoupon({
      id: prismaUserCoupon.id,
      userId: prismaUserCoupon.userId,
      couponId: prismaUserCoupon.couponId,
      isUsed: prismaUserCoupon.isUsed,
      usedAt: prismaUserCoupon.usedAt,
      orderId: prismaUserCoupon.orderId,
      issuedAt: prismaUserCoupon.issuedAt,
      expiresAt: prismaUserCoupon.expiresAt,
    });
  }

  private mapToUserCouponEntityWithCoupon(prismaUserCoupon: any): UserCoupon {
    return new UserCoupon({
      id: prismaUserCoupon.id,
      userId: prismaUserCoupon.userId,
      couponId: prismaUserCoupon.couponId,
      coupon: prismaUserCoupon.coupon ? this.mapToCouponEntity(prismaUserCoupon.coupon) : undefined,
      isUsed: prismaUserCoupon.isUsed,
      usedAt: prismaUserCoupon.usedAt,
      orderId: prismaUserCoupon.orderId,
      issuedAt: prismaUserCoupon.issuedAt,
      expiresAt: prismaUserCoupon.expiresAt,
    });
  }
}