import { Module } from '@nestjs/common';
import { PaymentController } from './controller/payment.controller';
import { PaymentFacade } from './application/payment.facade';
import { PaymentService } from './domain/payment.service';
import { PaymentRepositoryImpl } from './infrastructure/payment.repository.impl';
import { DummyPaymentGateway } from './infrastructure/dummy-payment-gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../orders/order.module';

@Module({
  imports: [
    PrismaModule,
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentFacade,
    PaymentService,
    {
      provide: 'PaymentRepository',
      useClass: PaymentRepositoryImpl,
    },
    {
      provide: 'PaymentGateway',
      useClass: DummyPaymentGateway,
    },
  ],
  exports: [PaymentFacade],
})
export class PaymentModule { }