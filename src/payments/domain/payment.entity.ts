export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export enum PaymentMethod {
  POINT = 'POINT',
}

export class Payment {
  paymentId: string;
  orderId: string;
  userId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  createdAt: Date;
  completedAt?: Date;
  canceledAt?: Date;

  constructor(props: {
    paymentId?: string;
    orderId: string;
    userId: string;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    createdAt?: Date;
    completedAt?: Date;
    canceledAt?: Date;
  }) {
    this.paymentId = props.paymentId;
    this.orderId = props.orderId;
    this.userId = props.userId;
    this.status = props.status;
    this.method = props.method;
    this.amount = props.amount;
    this.createdAt = props.createdAt || new Date();
    this.completedAt = props.completedAt;
    this.canceledAt = props.canceledAt;
  }

  /**
   * 결제 완료 가능 여부 확인
   */
  canComplete(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  /**
   * 결제 취소 가능 여부 확인
   */
  canCancel(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  /**
   * 결제 완료 처리 (포인트 차감 후)
   */
  complete(): void {
    if (!this.canComplete()) {
      throw new Error('이 결제는 완료 처리할 수 없는 상태입니다.');
    }

    this.status = PaymentStatus.COMPLETED;
    this.completedAt = new Date();
  }

  /**
   * 결제 취소 처리 (포인트 환불 포함)
   */
  cancel(): void {
    if (!this.canCancel()) {
      throw new Error('이 결제는 취소할 수 없는 상태입니다.');
    }

    this.status = PaymentStatus.CANCELED;
    this.canceledAt = new Date();
  }

  /**
   * 결제 실패 처리
   */
  fail(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('이 결제는 실패 처리할 수 없는 상태입니다.');
    }

    this.status = PaymentStatus.FAILED;
  }
}