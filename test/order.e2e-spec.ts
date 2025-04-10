// test/order.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('E-Commerce Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('상품 조회 -> 장바구니 담기 -> 주문 생성 -> 결제 처리 흐름', async () => {
    // 1. 상품 목록 조회
    const productRes = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(productRes.body.items.length).toBeGreaterThan(0);
    const productId = productRes.body.items[0].productId;
    const optionId = productRes.body.items[0].options[0].optionId;
    const productPrice = productRes.body.items[0].options[0].price;

    // 2. 장바구니 담기
    const cartRes = await request(app.getHttpServer())
      .post('/carts/items')
      .send({
        userId: 'user-123',
        productId,
        optionId,
        quantity: 1
      })
      .expect(201);

    expect(cartRes.body).toHaveProperty('cartItemId');
    expect(cartRes.body.productId).toBe(productId);
    expect(cartRes.body.optionId).toBe(optionId);

    // 3. 장바구니 조회
    const cartListRes = await request(app.getHttpServer())
      .get('/carts/items')
      .query({ userId: 'user-123' })
      .expect(200);

    expect(cartListRes.body.items.length).toBeGreaterThan(0);

    // 4. 주문 생성
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .send({
        userId: 'user-123',
        items: [{ productId, optionId, quantity: 1 }]
      })
      .expect(201);

    expect(orderRes.body).toHaveProperty('orderId');
    expect(orderRes.body).toHaveProperty('totalPrice');
    expect(orderRes.body.status).toBe('CREATED');
    const orderId = orderRes.body.orderId;

    // 5. 주문 상세 조회
    const orderDetailRes = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);

    expect(orderDetailRes.body.orderId).toBe(orderId);

    // 6. 결제 처리
    const paymentRes = await request(app.getHttpServer())
      .post('/payments')
      .send({
        userId: 'user-123',
        orderId,
        pointAmount: orderRes.body.totalPrice
      })
      .expect(201);

    expect(paymentRes.body).toHaveProperty('paymentId');
    expect(paymentRes.body.orderId).toBe(orderId);
    expect(paymentRes.body.status).toBe('COMPLETED');

    // 7. 결제 내역 조회
    const paymentHistoryRes = await request(app.getHttpServer())
      .get('/payments/history')
      .query({ userId: 'user-123' })
      .expect(200);

    expect(paymentHistoryRes.body.items.length).toBeGreaterThan(0);
  });
});