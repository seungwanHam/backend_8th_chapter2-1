import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { EntityNotFoundException } from '../../common/exceptions/domain-exception';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) { }

  /**
   * 사용자 ID로 사용자 조회
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}