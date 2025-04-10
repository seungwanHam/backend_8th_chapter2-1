import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../payment.service';
import { PaymentRepository } from '../payment.repository';
import { Payment, PaymentMethod, PaymentStatus } from '../payment.entity';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions/domain-exception';

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: jest.Mocked<PaymentRepository>;

  const mockPayment = new Payment({
    paymentId: 'payment-1',
    orderId: 'order-1',
    userId: 'user-1',
    status: PaymentStatus.PENDING,
    method: PaymentMethod.POINT,
    amount: 20000,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      createPayment: jest.fn(),
      updateStatus: jest.fn(),
      setCompletedAt: jest.fn(),
      setCanceledAt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'PaymentRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get('PaymentRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getPaymentById', () => {
    it('결제가 존재하는 경우 결제 정보를 반환해야 합니다', async () => {
      repository.findById.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-1');

      expect(result).toEqual(mockPayment);
      expect(repository.findById).toHaveBeenCalledWith('payment-1');
    });

    it('결제가 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getPaymentByOrderId', () => {
    it('결제가 존재하는 경우 결제 정보를 반환해야 합니다', async () => {
      repository.findByOrderId.mockResolvedValue(mockPayment);

      const result = await service.getPaymentByOrderId('order-1');

      expect(result).toEqual(mockPayment);
      expect(repository.findByOrderId).toHaveBeenCalledWith('order-1');
    });

    it('결제가 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findByOrderId.mockResolvedValue(null);

      await expect(service.getPaymentByOrderId('non-existent')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('createPayment', () => {
    it('결제가 성공적으로 생성되어야 합니다', async () => {
      repository.findByOrderId.mockResolvedValue(null);
      repository.createPayment.mockResolvedValue(mockPayment);
  
      const result = await service.createPayment('order-1', PaymentMethod.POINT, 20000);
      
      expect(result).toEqual(mockPayment);
      expect(repository.createPayment).toHaveBeenCalledWith('order-1', PaymentMethod.POINT, 20000);
    });

    it('이미 결제가 존재하는 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      repository.findByOrderId.mockResolvedValue(mockPayment);

      await expect(service.createPayment('order-1', PaymentMethod.POINT, 20000)).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('processPayment', () => {
    it('결제 처리가 성공적으로 이루어져야 합니다', async () => {
      const pendingPayment = {
        ...mockPayment,
        canComplete: () => true,
        complete: jest.fn()
      };
      repository.findById.mockResolvedValue({
        ...pendingPayment,
        canCancel: () => false,
        cancel: () => { },
        fail: () => { }
      });
      repository.updateStatus.mockResolvedValue({
        ...pendingPayment,
        status: PaymentStatus.COMPLETED,
        canCancel: () => false,
        cancel: () => { },
        fail: () => { }
      });

      const result = await service.processPayment('payment-1', 'payment-key-123');

      expect(pendingPayment.complete).toHaveBeenCalled();
      expect(repository.updateStatus).toHaveBeenCalledWith('payment-1', PaymentStatus.COMPLETED, 'payment-key-123');
    });

    it('결제 처리가 불가능한 상태인 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      const completedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
        canComplete: () => false
      };
      repository.findById.mockResolvedValue(completedPayment as Payment);

      await expect(service.processPayment('payment-1', 'payment-key-123')).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('cancelPayment', () => {
    it('결제 취소가 성공적으로 이루어져야 합니다', async () => {
      const completedPayment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
        canCancel: () => true,
        cancel: jest.fn()
      };
      repository.findById.mockResolvedValue({
        ...completedPayment,
        canComplete: () => false,
        complete: () => { },
        fail: () => { }
      });
      repository.updateStatus.mockResolvedValue({
        ...completedPayment,
        status: PaymentStatus.CANCELED,
        canComplete: () => false,
        complete: () => { },
        fail: () => { }
      });
      repository.setCanceledAt.mockResolvedValue({
        ...completedPayment,
        status: PaymentStatus.CANCELED,
        canceledAt: new Date(),
        canComplete: () => false,
        complete: () => { },
        fail: () => { }
      });

      const result = await service.cancelPayment('payment-1', '주문 취소');

      expect(completedPayment.cancel).toHaveBeenCalled();
      expect(repository.updateStatus).toHaveBeenCalledWith('payment-1', PaymentStatus.CANCELED);
      expect(repository.setCanceledAt).toHaveBeenCalled();
    });

    it('결제 취소가 불가능한 상태인 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      const pendingPayment = {
        ...mockPayment,
        canCancel: () => false
      };
      repository.findById.mockResolvedValue(pendingPayment as Payment);

      await expect(service.cancelPayment('payment-1', '주문 취소')).rejects.toThrow(BusinessRuleException);
    });
  });
});