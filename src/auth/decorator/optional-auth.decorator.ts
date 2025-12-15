import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuth } from '../interface/auth.interface';

export const OptionalAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuth | null => {
    const request = ctx.switchToHttp().getRequest();

    return request.user ?? null;
  },
);
