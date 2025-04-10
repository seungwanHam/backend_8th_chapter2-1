import { Module } from '@nestjs/common';
import { ProductController } from './contorller/product.controller';
import { ProductFacade } from './application/product.facade';
import { ProductService } from './domain/product.service';
import { ProductRepositoryImpl } from './infrastructure/product.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    ProductFacade,
    ProductService,
    {
      provide: 'ProductRepository',
      useClass: ProductRepositoryImpl,
    },
  ],
  exports: [ProductFacade],
})
export class ProductModule {}