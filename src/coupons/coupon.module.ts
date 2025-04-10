import { Module } from '@nestjs/common';
import { CouponController } from './controller/coupon.controller';
import { CouponFacade } from './application/coupon.facade';
import { CouponService } from './domain/coupon.service';
import { CouponRepositoryImpl } from './infrastructure/coupon.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CouponController],
  providers: [
    CouponFacade,
    CouponService,
    {
      provide: 'CouponRepository',
      useClass: CouponRepositoryImpl,
    },
  ],
  exports: [CouponFacade],
})
export class CouponModule { }