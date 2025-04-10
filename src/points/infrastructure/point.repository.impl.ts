import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Point, PointTransaction, PointTransactionType } from '../domain/point.entity';
import { PointRepository } from '../domain/point.repository';

@Injectable()
export class PointRepositoryImpl implements PointRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByUserId(userId: string): Promise<Point | null> {
    const point = await this.prisma.point.findUnique({
      where: { userId },
    });

    if (!point) {
      return null;
    }

    return new Point({
      userId: point.userId,
      balance: point.balance,
      updatedAt: point.updatedAt,
    });
  }

  async createPoint(userId: string): Promise<Point> {
    const point = await this.prisma.point.create({
      data: {
        userId,
        balance: 0,
      },
    });

    return new Point({
      userId: point.userId,
      balance: point.balance,
      updatedAt: point.updatedAt,
    });
  }

  async updateBalance(userId: string, amount: number): Promise<Point> {
    const point = await this.prisma.point.upsert({
      where: { userId },
      update: {
        balance: {
          increment: amount,
        },
      },
      create: {
        userId,
        balance: amount > 0 ? amount : 0,
      },
    });

    return new Point({
      userId: point.userId,
      balance: point.balance,
      updatedAt: point.updatedAt,
    });
  }

  async createTransaction(
    userId: string,
    type: PointTransactionType,
    amount: number,
    balanceAfter: number,
    description: string,
    relatedId?: string,
  ): Promise<PointTransaction> {
    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId,
        type,
        amount,
        balanceAfter,
        description,
        relatedId,
      },
    });

    return new PointTransaction({
      transactionId: transaction.id,
      userId: transaction.userId,
      type: transaction.type as PointTransactionType,
      amount: transaction.amount,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      relatedId: transaction.relatedId,
      createdAt: transaction.createdAt,
    });
  }

  async getTransactions(
    userId: string,
    page: number,
    limit: number,
    type?: PointTransactionType,
  ): Promise<{ items: PointTransaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(type ? { type } : {}),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pointTransaction.count({ where }),
    ]);

    return {
      items: transactions.map(
        tx => new PointTransaction({
          transactionId: tx.id,
          userId: tx.userId,
          type: tx.type as PointTransactionType,
          amount: tx.amount,
          balanceAfter: tx.balanceAfter,
          description: tx.description,
          relatedId: tx.relatedId,
          createdAt: tx.createdAt,
        })
      ),
      total,
    };
  }
}