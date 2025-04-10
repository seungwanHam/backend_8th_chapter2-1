import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from '../point.service';
import { PointRepository } from '../point.repository';
import { Point, PointTransaction, PointTransactionType } from '../point.entity';
import { BusinessRuleException } from '../../../common/exceptions/domain-exception';

describe('PointService', () => {
  let service: PointService;
  let repository: jest.Mocked<PointRepository>;

  const mockPoint = new Point({
    userId: 'user-1',
    balance: 10000,
    updatedAt: new Date(),
  });

  const mockTransaction = new PointTransaction({
    transactionId: 'tx-1',
    userId: 'user-1',
    type: PointTransactionType.CHARGE,
    amount: 5000,
    balanceAfter: 15000,
    description: '포인트 충전',
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findByUserId: jest.fn(),
      createPoint: jest.fn(),
      updateBalance: jest.fn(),
      createTransaction: jest.fn(),
      getTransactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: 'PointRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PointService>(PointService);
    repository = module.get('PointRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getPointBalance', () => {
    it('사용자가 포인트 계정을 가지고 있는 경우 잔액을 반환해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockPoint);

      const result = await service.getPointBalance('user-1');

      expect(result).toEqual(mockPoint);
      expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('사용자가 포인트 계정이 없는 경우 새로 생성해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(null);
      repository.createPoint.mockResolvedValue(mockPoint);

      const result = await service.getPointBalance('user-1');

      expect(result).toEqual(mockPoint);
      expect(repository.createPoint).toHaveBeenCalledWith('user-1');
    });
  });

  describe('chargePoint', () => {
    it('포인트 충전이 성공적으로 이루어져야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockPoint);
      repository.updateBalance.mockResolvedValue(mockPoint);
      repository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.chargePoint('user-1', 5000, '포인트 충전');

      expect(result).toEqual(mockTransaction);
      expect(repository.updateBalance).toHaveBeenCalledWith('user-1', 5000);
      expect(repository.createTransaction).toHaveBeenCalled();
    });

    it('충전 금액이 최소 금액보다 적은 경우 오류가 발생해야 합니다', async () => {
      await expect(service.chargePoint('user-1', 500, '')).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('usePoint', () => {
    it('잔액이 충분한 경우 포인트 사용이 성공적으로 이루어져야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockPoint);
      repository.updateBalance.mockResolvedValue(mockPoint);
      repository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.usePoint('user-1', 5000, 'order-1');

      expect(result).toEqual(mockTransaction);
      expect(repository.updateBalance).toHaveBeenCalledWith('user-1', -5000);
      expect(repository.createTransaction).toHaveBeenCalled();
    });

    it('잔액이 부족한 경우 오류가 발생해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockPoint);

      await expect(service.usePoint('user-1', 15000, 'order-1')).rejects.toThrow(BusinessRuleException);
    });
  });
});