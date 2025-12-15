import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAuth } from '../interface/auth.interface';
import { RoleEnum } from '../enum/auth.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as IAuth;

    if (!user?.roles) return false;

    for (const requiredRole of requiredRoles) {
      if (!user.roles.includes(requiredRole)) throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
