import { Injectable } from '@nestjs/common';
import { PointService } from '../domain/point.service';
import { ChargePointDto, UsePointDto, PointHistoryQueryDto } from './dto/point-request.dto';
import { PointBalanceDto, PointTransactionDto, PointHistoryResponseDto } from './dto/point-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PointFacade {
  constructor(private readonly pointService: PointService) { }

  /**
   * 포인트 계정 초기화
   * 새 사용자가 생성될 때 호출됩니다.
   */
  async initializePointAccount(userId: string): Promise<void> {
    // 포인트 계정이 없으면 생성, 있으면 아무 작업도 하지 않음
    await this.pointService.getPointBalance(userId);
  }

  /**
   * 포인트 잔액 조회
   */
  async getPointBalance(userId: string): Promise<PointBalanceDto> {
    const point = await this.pointService.getPointBalance(userId);

    return plainToInstance(
      PointBalanceDto,
      {
        userId: point.userId,
        balance: point.balance,
        updatedAt: point.updatedAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 포인트 충전
   */
  async chargePoint(userId: string, dto: ChargePointDto): Promise<PointTransactionDto> {
    const transaction = await this.pointService.chargePoint(
      userId,
      dto.amount,
      dto.description
    );

    return plainToInstance(
      PointTransactionDto,
      {
        transactionId: transaction.transactionId,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 포인트 사용
   */
  async usePoint(userId: string, dto: UsePointDto): Promise<PointTransactionDto> {
    const transaction = await this.pointService.usePoint(
      userId,
      dto.amount,
      dto.orderId
    );

    return plainToInstance(
      PointTransactionDto,
      {
        transactionId: transaction.transactionId,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        description: transaction.description,
        relatedId: transaction.relatedId,
        createdAt: transaction.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 포인트 환불
   */
  async refundPoint(userId: string, amount: number, orderId: string): Promise<PointTransactionDto> {
    const transaction = await this.pointService.refundPoint(userId, amount, orderId);

    return plainToInstance(
      PointTransactionDto,
      {
        transactionId: transaction.transactionId,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        description: transaction.description,
        relatedId: transaction.relatedId,
        createdAt: transaction.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  /**
   * 포인트 거래 내역 조회
   */
  async getPointHistory(userId: string, query: PointHistoryQueryDto): Promise<PointHistoryResponseDto> {
    const { items, total } = await this.pointService.getPointTransactions(
      userId,
      query.page,
      query.limit,
      query.type
    );

    return plainToInstance(
      PointHistoryResponseDto,
      {
        items: items.map(tx => ({
          transactionId: tx.transactionId,
          userId: tx.userId,
          type: tx.type,
          amount: tx.amount,
          balanceAfter: tx.balanceAfter,
          description: tx.description,
          relatedId: tx.relatedId,
          createdAt: tx.createdAt,
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
}