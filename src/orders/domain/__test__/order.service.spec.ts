import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { Order, OrderItem, OrderStatus } from '../order.entity';
import { EntityNotFoundException, BusinessRuleException, ForbiddenException } from '../../../common/exceptions/domain-exception';

describe('OrderService', () => {
  let service: OrderService;
  let repository: jest.Mocked<OrderRepository>;

  const mockOrderItem = new OrderItem({
    productId: 'product-1',
    optionId: 'option-1',
    productName: '테스트 상품',
    optionName: '옵션 1',
    price: 10000,
    quantity: 2,
    subtotal: 20000,
  });

  const mockOrder = new Order({
    orderId: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDING,
    items: [mockOrderItem],
    totalAmount: 20000,
    paymentMethod: 'CARD',
    shippingAddress: '서울시 강남구',
    receiverName: '홍길동',
    receiverPhone: '010-1234-5678',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByUserIdWithPagination: jest.fn(),
      save: jest.fn(),
      createOrderWithItems: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'OrderRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get('OrderRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderById', () => {
    it('주문이 존재하는 경우 주문을 반환해야 합니다', async () => {
      repository.findById.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('order-1');

      expect(result).toEqual(mockOrder);
      expect(repository.findById).toHaveBeenCalledWith('order-1');
    });

    it('주문이 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getOrderById('non-existent')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getUserOrders', () => {
    it('페이지네이션이 적용된 사용자 주문 목록을 반환해야 합니다', async () => {
      const mockResult = { items: [mockOrder], total: 1 };
      repository.findByUserIdWithPagination.mockResolvedValue(mockResult);

      const result = await service.getUserOrders('user-1', 1, 10);

      expect(result).toEqual(mockResult);
      expect(repository.findByUserIdWithPagination).toHaveBeenCalledWith('user-1', 1, 10);
    });
  });

  describe('createOrder', () => {
    it('주문이 성공적으로 생성되어야 합니다', async () => {
      repository.createOrderWithItems.mockResolvedValue(mockOrder);

      const orderItems = [{
        productId: 'product-1',
        optionId: 'option-1',
        productName: '테스트 상품',
        optionName: '옵션 1',
        price: 10000,
        quantity: 2,
        subtotal: 20000,
      }];

      const result = await service.createOrder(
        'user-1',
        orderItems,
        20000,
        'CARD',
        '서울시 강남구',
        '홍길동',
        '010-1234-5678'
      );

      expect(result).toEqual(mockOrder);
      expect(repository.createOrderWithItems).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('조건이 충족되면 주문이 취소되어야 합니다', async () => {
      const pendingOrder = { ...mockOrder, canCancel: () => true };
      repository.findById.mockResolvedValue(pendingOrder as Order);
      repository.updateStatus.mockResolvedValue({ ...pendingOrder, status: OrderStatus.CANCELED } as Order);

      const result = await service.cancelOrder('order-1', 'user-1');

      expect(result.status).toEqual(OrderStatus.CANCELED);
      expect(repository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.CANCELED);
    });

    it('사용자가 주문 소유자가 아닌 경우 ForbiddenException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue({ ...mockOrder, userId: 'other-user' } as Order);

      await expect(service.cancelOrder('order-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('주문을 취소할 수 없는 상태인 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED, canCancel: () => false };
      repository.findById.mockResolvedValue(deliveredOrder as Order);

      await expect(service.cancelOrder('order-1', 'user-1')).rejects.toThrow(BusinessRuleException);
    });
  });
});