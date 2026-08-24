import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from '@/types/auth.type';

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserType | undefined,
    ctx: ExecutionContext,
  ): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data && user) {
      return user[data];
    }

    return user;
  },
);
