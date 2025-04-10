import { Module } from '@nestjs/common';
import { OrderController } from './controller/order.controller';
import { OrderFacade } from './application/order.facade';
import { OrderService } from './domain/order.service';
import { OrderRepositoryImpl } from './infrastructure/order.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductModule } from '../products/product.module';
import { CartModule } from '../carts/cart.module';
import { PointModule } from '../points/point.module';
import { CouponModule } from '../coupons/coupon.module';

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    CartModule,
    PointModule,
    CouponModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderFacade,
    OrderService,
    {
      provide: 'OrderRepository',
      useClass: OrderRepositoryImpl,
    },
  ],
  exports: [OrderFacade],
})
export class OrderModule { }