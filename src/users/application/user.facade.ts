import { Injectable } from '@nestjs/common';
import { UserService } from '../domain/user.service';
import { PointFacade } from '../../points/application/point.facade';

@Injectable()
export class UserFacade {
  constructor(
    private readonly userService: UserService,
    private readonly pointFacade: PointFacade,
  ) { }

  /**
   * 사용자 포인트 잔액 조회
   */
  async getUserPointBalance(userId: string): Promise<any> {
    // 사용자 존재 확인
    await this.userService.getUserById(userId);

    // 포인트 잔액 조회
    return this.pointFacade.getPointBalance(userId);
  }

  /**
   * 사용자 포인트 내역 조회
   */
  async getUserPointHistory(userId: string, page = 1, limit = 10, type?: string): Promise<any> {
    // 사용자 존재 확인
    await this.userService.getUserById(userId);

    // 포인트 내역 조회
    return this.pointFacade.getPointHistory(userId, {
      page,
      limit,
      type: type as any
    });
  }
}