import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';
import { PaymentModule } from './payments/payment.module';
import { CartModule } from './carts/cart.module';
import { PointModule } from './points/point.module';
import { CouponModule } from './coupons/coupon.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    CartModule,
    PointModule,
    CouponModule,
  ],
})
export class AppModule { }