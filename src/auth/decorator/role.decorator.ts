import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enum/auth.enum';

export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);
