import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { CouponModule } from './coupons/coupon.module';
import { OrderModule } from './orders/order.module';
import { PaymentModule } from './payments/payment.module';
import { PointModule } from './points/point.module';
import { ProductModule } from './products/product.module';

@Module({
  imports: [
    CartModule,
    CouponModule,
    OrderModule,
    PaymentModule,
    PointModule,
    ProductModule,
  ],
})
export class AppModule { }