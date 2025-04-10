import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserFacade } from './application/user.facade';
import { UserService } from './domain/user.service';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { PrismaModule } from '../prisma/prisma.module';
import { PointModule } from '../points/point.module';

@Module({
  imports: [
    PrismaModule,
    PointModule,
  ],
  controllers: [UserController],
  providers: [
    UserFacade,
    UserService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UserModule { }