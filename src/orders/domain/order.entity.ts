export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export class OrderItem {
  id: string;
  productId: string;
  optionId: string;
  productName: string;
  optionName: string;
  price: number;
  quantity: number;
  subtotal: number;

  constructor(props: {
    id?: string;
    productId: string;
    optionId: string;
    productName: string;
    optionName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }) {
    this.id = props.id;
    this.productId = props.productId;
    this.optionId = props.optionId;
    this.productName = props.productName;
    this.optionName = props.optionName;
    this.price = props.price;
    this.quantity = props.quantity;
    this.subtotal = props.subtotal;
  }
}

export class Order {
  orderId: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    orderId?: string;
    userId: string;
    status: OrderStatus;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    receiverName: string;
    receiverPhone: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.orderId = props.orderId;
    this.userId = props.userId;
    this.status = props.status;
    this.items = props.items;
    this.totalAmount = props.totalAmount;
    this.paymentMethod = props.paymentMethod;
    this.shippingAddress = props.shippingAddress;
    this.receiverName = props.receiverName;
    this.receiverPhone = props.receiverPhone;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * 주문을 취소할 수 있는지 확인
   */
  canCancel(): boolean {
    return this.status === OrderStatus.PENDING || this.status === OrderStatus.PAID;
  }

  /**
   * 배송 시작 가능 여부 확인
   */
  canShip(): boolean {
    return this.status === OrderStatus.PAID;
  }

  /**
   * 배송 완료 가능 여부 확인
   */
  canComplete(): boolean {
    return this.status === OrderStatus.SHIPPING;
  }

  /**
   * 주문 상태 변경
   */
  changeStatus(status: OrderStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}