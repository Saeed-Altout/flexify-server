import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserProfile } from '../types/auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserProfile | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserProfile }>();
    return request.user ?? undefined;
  },
);
