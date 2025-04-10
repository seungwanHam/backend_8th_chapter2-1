import { Point, PointTransaction, PointTransactionType } from './point.entity';

export interface PointRepository {
  findByUserId(userId: string): Promise<Point | null>;
  createPoint(userId: string): Promise<Point>;
  updateBalance(userId: string, amount: number): Promise<Point>;
  createTransaction(
    userId: string,
    type: PointTransactionType,
    amount: number,
    balanceAfter: number,
    description: string,
    relatedId?: string,
  ): Promise<PointTransaction>;
  getTransactions(
    userId: string,
    page: number,
    limit: number,
    type?: PointTransactionType,
  ): Promise<{ items: PointTransaction[]; total: number }>;
}