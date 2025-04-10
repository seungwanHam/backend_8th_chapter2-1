import { Module } from '@nestjs/common';
import { PointController } from './controller/point.controller';
import { PointFacade } from './application/point.facade';
import { PointService } from './domain/point.service';
import { PointRepositoryImpl } from './infrastructure/point.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PointController],
  providers: [
    PointFacade,
    PointService,
    {
      provide: 'PointRepository',
      useClass: PointRepositoryImpl,
    },
  ],
  exports: [PointFacade, PointService],
})
export class PointModule { }