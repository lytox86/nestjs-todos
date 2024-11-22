import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InjectedRequestUser } from '../auth/jwt-payload';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: InjectedRequestUser = request.user; // Injected by JwtStrategy
    return user.userId;
  },
);
