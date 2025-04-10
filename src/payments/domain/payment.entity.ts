export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  POINT = 'POINT',
}

export class Payment {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  paymentKey?: string; // 외부 결제 시스템의 키
  createdAt: Date;
  completedAt?: Date;
  canceledAt?: Date;

  constructor(props: {
    paymentId?: string;
    orderId: string;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    paymentKey?: string;
    createdAt?: Date;
    completedAt?: Date;
    canceledAt?: Date;
  }) {
    this.paymentId = props.paymentId;
    this.orderId = props.orderId;
    this.status = props.status;
    this.method = props.method;
    this.amount = props.amount;
    this.paymentKey = props.paymentKey;
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
   * 결제 완료 처리
   */
  complete(paymentKey?: string): void {
    if (!this.canComplete()) {
      throw new Error('이 결제는 완료 처리할 수 없는 상태입니다.');
    }
    
    this.status = PaymentStatus.COMPLETED;
    this.completedAt = new Date();
    
    if (paymentKey) {
      this.paymentKey = paymentKey;
    }
  }

  /**
   * 결제 취소 처리
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