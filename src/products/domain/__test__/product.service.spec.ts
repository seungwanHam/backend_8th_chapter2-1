import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { ProductRepository } from '../product.repository';
import { Product, ProductOption } from '../product.entity';
import { EntityNotFoundException, BusinessRuleException } from '../../../common/exceptions/domain-exception';

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  const mockProduct = new Product({
    productId: 'test-id',
    name: '테스트 상품',
    description: '테스트 상품 설명',
    basePrice: 10000,
    options: [
      {
        optionId: 'option-1',
        name: '옵션 1',
        price: 1000,
        stock: 10,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findPopular: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'ProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get('ProductRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getProductById', () => {
    it('상품이 존재하는 경우 상품을 반환해야 합니다', async () => {
      repository.findById.mockResolvedValue(mockProduct);

      const result = await service.getProductById('test-id');

      expect(result).toEqual(mockProduct);
      expect(repository.findById).toHaveBeenCalledWith('test-id');
    });

    it('상품이 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProductById('non-existent')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('getProducts', () => {
    it('페이지네이션이 적용된 상품 목록을 반환해야 합니다', async () => {
      const mockResult = { items: [mockProduct], total: 1 };
      repository.findAll.mockResolvedValue(mockResult);

      const result = await service.getProducts(1, 10);

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('decreaseProductStock', () => {
    it('재고가 충분한 경우 재고를 감소시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(mockProduct);
      repository.updateStock.mockResolvedValue();

      await service.decreaseProductStock('test-id', 'option-1', 5);

      expect(repository.updateStock).toHaveBeenCalledWith('test-id', 'option-1', -5);
    });

    it('재고가 부족한 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(mockProduct);

      await expect(service.decreaseProductStock('test-id', 'option-1', 20)).rejects.toThrow(BusinessRuleException);
    });

    it('옵션이 존재하지 않는 경우 BusinessRuleException을 발생시켜야 합니다', async () => {
      repository.findById.mockResolvedValue(mockProduct);

      await expect(service.decreaseProductStock('test-id', 'non-existent', 5)).rejects.toThrow(BusinessRuleException);
    });
  });
});