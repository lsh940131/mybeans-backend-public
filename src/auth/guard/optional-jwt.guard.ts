import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class OptionalJwtGuard extends JwtGuard {
  handleRequest(err, user, info, context: ExecutionContext) {
    return user ?? null;
  }
}
