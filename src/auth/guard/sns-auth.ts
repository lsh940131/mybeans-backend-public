import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SignSnsErrorEnum } from '../enum/auth.enum';

type ProviderName = 'google' | 'naver' | 'kakao';

function makeSnsAuthGuard(name: ProviderName) {
  @Injectable()
  class SnsAuthGuard extends AuthGuard(name) {
    constructor(public readonly config: ConfigService) {
      super();
      this.frontUrl = this.config.get<string>('FRONT_URL')!;
    }

    public readonly frontUrl: string;

    async canActivate(ctx: ExecutionContext) {
      const res = ctx.switchToHttp().getResponse<Response>();
      const activated = (await super.canActivate(ctx)) as boolean | void;

      // super.canActivate 중에 redirect/에러 응답이 나가면 headersSent = true
      if (res.headersSent) return false;

      return (activated ?? true) as boolean;
    }

    handleRequest(err: any, user: any, info: any, ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest<Request>();
      const res = ctx.switchToHttp().getResponse<Response>();

      if (err || !user) {
        let reason = 'oauth_failed';
        if (err?.message && Object.values(SignSnsErrorEnum).includes(err.message)) {
          reason = err.message;
        } else if (info?.message?.includes?.('invalid_grant') || info?.oauthError) {
          reason = SignSnsErrorEnum.TOKEN_EXCHANGE_FAILED as any;
        }

        // 에러 케이스
        res.redirect(
          `${this.frontUrl}/sign/social-popup-bridge#ok=false&provider=${name}&reason=${reason}`,
        );

        throw err;
      }
      return user;
    }
  }
  return SnsAuthGuard;
}

@Injectable()
export class GoogleAuthGuard extends makeSnsAuthGuard('google') {}
@Injectable()
export class NaverAuthGuard extends makeSnsAuthGuard('naver') {}
@Injectable()
export class KakaoAuthGuard extends makeSnsAuthGuard('kakao') {}
