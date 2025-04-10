import { Module } from '@nestjs/common';
import { PaymentController } from './controller/payment.controller';
import { PaymentFacade } from './application/payment.facade';
import { PaymentService } from './domain/payment.service';
import { PaymentRepositoryImpl } from './infrastructure/payment.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../orders/order.module';
import { PointModule } from '../points/point.module';

@Module({
  imports: [
    PrismaModule,
    OrderModule,
    PointModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentFacade,
    PaymentService,
    {
      provide: 'PaymentRepository',
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: [PaymentFacade],
})
export class PaymentModule { }