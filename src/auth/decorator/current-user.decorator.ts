import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    // data가 있으면 해당 속성만 반환, 없으면 userId 반환
    return data ? request.user[data.toString()] : request.user.userId;
  },
);