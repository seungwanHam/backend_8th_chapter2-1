import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../cart.service';
import { CartRepository } from '../cart.repository';
import { Cart, CartItem } from '../cart.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain-exception';

describe('CartService', () => {
  let service: CartService;
  let repository: jest.Mocked<CartRepository>;

  const mockCartItem = new CartItem({
    id: 'item-1',
    productId: 'product-1',
    optionId: 'option-1',
    productName: '테스트 상품',
    optionName: '옵션 1',
    price: 10000,
    quantity: 2,
  });

  const mockCart = new Cart({
    id: 'cart-1',
    userId: 'user-1',
    items: [mockCartItem],
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findByUserId: jest.fn(),
      createCart: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      getCartWithItems: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: 'CartRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    repository = module.get('CartRepository');
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('장바구니가 존재하는 경우 장바구니를 반환해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);

      const result = await service.getCart('user-1');

      expect(result).toEqual(mockCart);
      expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('장바구니가 존재하지 않는 경우 새로 생성해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(null);
      repository.createCart.mockResolvedValue(mockCart);

      const result = await service.getCart('user-1');

      expect(result).toEqual(mockCart);
      expect(repository.createCart).toHaveBeenCalledWith('user-1');
    });
  });

  describe('addItemToCart', () => {
    it('장바구니에 새 상품을 추가해야 합니다', async () => {
      const emptyCart = new Cart({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        updatedAt: new Date(),
      });

      repository.findByUserId.mockResolvedValue(emptyCart);
      repository.addItem.mockResolvedValue(mockCartItem);
      repository.getCartWithItems.mockResolvedValue(mockCart);

      const result = await service.addItemToCart(
        'user-1',
        'product-1',
        'option-1',
        '테스트 상품',
        '옵션 1',
        10000,
        2
      );

      expect(result).toEqual(mockCart);
      expect(repository.addItem).toHaveBeenCalledWith(
        'cart-1',
        'product-1',
        'option-1',
        '테스트 상품',
        '옵션 1',
        10000,
        2
      );
    });

    it('이미 장바구니에 있는 상품인 경우 수량을 업데이트해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);
      repository.updateItemQuantity.mockResolvedValue(new CartItem({
        ...mockCartItem,
        quantity: 3
      }));
      repository.getCartWithItems.mockResolvedValue(new Cart({
        ...mockCart,
        items: [new CartItem({
          ...mockCartItem,
          quantity: 3
        })]
      }));

      const result = await service.addItemToCart(
        'user-1',
        'product-1',
        'option-1',
        '테스트 상품',
        '옵션 1',
        10000,
        1
      );

      expect(repository.updateItemQuantity).toHaveBeenCalledWith('cart-1', 'item-1', 3);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('장바구니 상품 수량을 성공적으로 업데이트해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);
      repository.updateItemQuantity.mockResolvedValue(new CartItem({
        ...mockCartItem,
        quantity: 5
      }));
      repository.getCartWithItems.mockResolvedValue(new Cart({
        ...mockCart,
        items: [new CartItem({
          ...mockCartItem,
          quantity: 5
        })]
      }));

      const result = await service.updateCartItemQuantity('user-1', 'item-1', 5);

      expect(repository.updateItemQuantity).toHaveBeenCalledWith('cart-1', 'item-1', 5);
    });

    it('상품이 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);

      await expect(service.updateCartItemQuantity('user-1', 'non-existent', 5)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('removeCartItem', () => {
    it('장바구니에서 상품을 성공적으로 제거해야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);
      repository.removeItem.mockResolvedValue();
      repository.getCartWithItems.mockResolvedValue(new Cart({
        ...mockCart,
        items: []
      }));

      const result = await service.removeCartItem('user-1', 'item-1');

      // src/carts/domain/__tests__/cart.service.spec.ts (계속)
      expect(repository.removeItem).toHaveBeenCalledWith('cart-1', 'item-1');
      expect(result.items).toHaveLength(0);
    });

    it('상품이 존재하지 않는 경우 EntityNotFoundException을 발생시켜야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);

      await expect(service.removeCartItem('user-1', 'non-existent')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('clearCart', () => {
    it('장바구니를 성공적으로 비워야 합니다', async () => {
      repository.findByUserId.mockResolvedValue(mockCart);
      repository.clearCart.mockResolvedValue();
      repository.getCartWithItems.mockResolvedValue(new Cart({
        ...mockCart,
        items: []
      }));

      const result = await service.clearCart('user-1');

      expect(repository.clearCart).toHaveBeenCalledWith('cart-1');
      expect(result.items).toHaveLength(0);
    });

    it('장바구니가 존재하지 않는 경우 새로운 빈 장바구니를 생성해야 합니다', async () => {
      const emptyCart = new Cart({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        updatedAt: new Date(),
      });

      repository.findByUserId.mockResolvedValue(null);
      repository.createCart.mockResolvedValue(emptyCart);
      // getCartWithItems 호출 결과도 모킹해야 합니다
      repository.getCartWithItems.mockResolvedValue(emptyCart);

      const result = await service.clearCart('user-1');

      expect(result).toEqual(emptyCart);
      expect(repository.createCart).toHaveBeenCalledWith('user-1');
    });
  });
});