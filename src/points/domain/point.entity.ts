export enum PointTransactionType {
  CHARGE = 'CHARGE',
  USE = 'USE',
  REFUND = 'REFUND',
  REWARD = 'REWARD',
}

export class PointTransaction {
  transactionId: string;
  userId: string;
  type: PointTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  relatedId?: string;
  createdAt: Date;

  constructor(props: {
    transactionId: string;
    userId: string;
    type: PointTransactionType;
    amount: number;
    balanceAfter: number;
    description: string;
    relatedId?: string;
    createdAt: Date;
  }) {
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.type = props.type;
    this.amount = props.amount;
    this.balanceAfter = props.balanceAfter;
    this.description = props.description;
    this.relatedId = props.relatedId;
    this.createdAt = props.createdAt;
  }
}

export class Point {
  userId: string;
  balance: number;
  updatedAt: Date;

  constructor(props: {
    userId: string;
    balance: number;
    updatedAt: Date;
  }) {
    this.userId = props.userId;
    this.balance = props.balance;
    this.updatedAt = props.updatedAt;
  }

  /**
   * 포인트 충전 가능 여부 확인
   */
  canCharge(amount: number): boolean {
    return amount > 0;
  }

  /**
   * 포인트 사용 가능 여부 확인
   */
  canUse(amount: number): boolean {
    return this.balance >= amount && amount > 0;
  }
}