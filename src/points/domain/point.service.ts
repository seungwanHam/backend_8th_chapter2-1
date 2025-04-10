import { Inject, Injectable } from '@nestjs/common';
import { Point, PointTransaction, PointTransactionType } from './point.entity';
import { PointRepository } from './point.repository';
import { BusinessRuleException, EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class PointService {
  constructor(
    @Inject('PointRepository')
    private readonly pointRepository: PointRepository,
  ) { }

  /**
   * 포인트 잔액 조회
   */
  async getPointBalance(userId: string): Promise<Point> {
    const point = await this.pointRepository.findByUserId(userId);
    if (!point) {
      // 포인트 정보가 없으면 새로 생성
      return this.pointRepository.createPoint(userId);
    }
    return point;
  }

  /**
   * 포인트 충전
   */
  async chargePoint(userId: string, amount: number, description: string): Promise<PointTransaction> {
    if (amount < 1000) {
      throw new BusinessRuleException('최소 충전 금액은 1,000포인트입니다.');
    }

    let point = await this.getPointBalance(userId);

    if (!point.canCharge(amount)) {
      throw new BusinessRuleException('유효하지 않은 충전 금액입니다.');
    }

    const newBalance = point.balance + amount;
    point = await this.pointRepository.updateBalance(userId, amount);

    // 거래 내역 생성
    return this.pointRepository.createTransaction(
      userId,
      PointTransactionType.CHARGE,
      amount,
      newBalance,
      description || '포인트 충전',
    );
  }

  /**
   * 포인트 사용
   */
  async usePoint(userId: string, amount: number, orderId: string): Promise<PointTransaction> {
    const point = await this.getPointBalance(userId);

    if (!point.canUse(amount)) {
      throw new BusinessRuleException('포인트 잔액이 부족합니다.');
    }

    const newBalance = point.balance - amount;
    await this.pointRepository.updateBalance(userId, -amount);

    // 거래 내역 생성
    return this.pointRepository.createTransaction(
      userId,
      PointTransactionType.USE,
      amount,
      newBalance,
      '상품 구매',
      orderId,
    );
  }

  /**
   * 포인트 환불
   */
  async refundPoint(userId: string, amount: number, orderId: string): Promise<PointTransaction> {
    if (amount <= 0) {
      throw new BusinessRuleException('유효하지 않은 환불 금액입니다.');
    }

    const point = await this.getPointBalance(userId);
    const newBalance = point.balance + amount;
    await this.pointRepository.updateBalance(userId, amount);

    // 거래 내역 생성
    return this.pointRepository.createTransaction(
      userId,
      PointTransactionType.REFUND,
      amount,
      newBalance,
      '주문 취소 환불',
      orderId,
    );
  }

  /**
   * 포인트 거래 내역 조회
   */
  async getPointTransactions(
    userId: string,
    page: number,
    limit: number,
    type?: PointTransactionType
  ): Promise<{ items: PointTransaction[]; total: number }> {
    // 포인트 계정이 있는지 확인
    await this.getPointBalance(userId);

    return this.pointRepository.getTransactions(userId, page, limit, type);
  }
}