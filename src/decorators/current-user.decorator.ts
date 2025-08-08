import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../types/auth.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserProfile => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
