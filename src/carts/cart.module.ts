import { Module } from '@nestjs/common';
import { CartController } from './controller/cart.controller';
import { CartFacade } from './application/cart.facade';
import { CartService } from './domain/cart.service';
import { CartRepositoryImpl } from './infrastructure/cart.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [
    PrismaModule,
    ProductModule, // ProductFacade에 의존성이 있으므로 추가
  ],
  controllers: [CartController],
  providers: [
    CartFacade,
    CartService,
    {
      provide: 'CartRepository',
      useClass: CartRepositoryImpl,
    },
  ],
  exports: [CartFacade],
})
export class CartModule { }