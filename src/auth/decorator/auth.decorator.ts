import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuth } from '../interface/auth.interface';

export const Auth = createParamDecorator((data: unknown, ctx: ExecutionContext): IAuth => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
});
