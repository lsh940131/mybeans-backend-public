import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Request } from 'express';
import { IAuthGoogle } from '../interface/auth.interface';
import { OauthStateService } from '../state/oauth-state.service';
import { UnauthorizedException } from '@nestjs/common';
import { SignSnsErrorEnum } from '../enum/auth.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly stateService: OauthStateService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
    });
  }

  /**
   * 초기 진입(/signin/google)에서 들어온 쿼리(rememberMe, redirectTo, ...)를 state로 직렬화해서 구글로 보냄
   * callback API의 state에 그대로 돌아옴
   */
  authenticate(req: Request, options?: any): any {
    try {
      const { rememberMe = 'false', redirectTo = '/' } = (req.query as any) || {};

      const state = this.stateService.sign({
        rememberMe: rememberMe === 'true',
        redirectTo: String(redirectTo),
      });

      // super.authenticate에 옵션 합쳐서 위임
      return super.authenticate(req, { ...options, state });
    } catch (e) {
      throw new UnauthorizedException(
        e?.message === SignSnsErrorEnum.CONFIG_MISCONFIGURED
          ? SignSnsErrorEnum.CONFIG_MISCONFIGURED
          : SignSnsErrorEnum.STATE_INVALID,
      );
    }
  }

  /**
   * 구글에서 callback 호출할 때 동작
   * 흐름:
   *    1. AuthGuard('google')로 구글로 리다이렉트
   *    2. 사용자가 구글 로그인
   *    3. 구글에서 내 서비스가 보낸 쿼리 파라미터에 code를 붙여서 내가 등록한 callback url 실행 (ex GET /signin/google/callback?code=...&rememberMe=...)
   *    4. AuthGuard에서 code 감지 -> 토큰 교환 -> 프로필 조회 -> validate 호출
   * @param req /user/signin/google 호출 request
   * @param accessToken 구글 accessToken
   * @param refreshToken 구글 refreshToken
   * @param profile 구글 profile
   */
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<IAuthGoogle> {
    let rememberMe = false,
      redirectTo = '/';
    try {
      const state = this.stateService.verify(String(req.query.state || ''));
      rememberMe = !!state.rememberMe;
      redirectTo =
        typeof state.redirectTo === 'string' && state.redirectTo.startsWith('/')
          ? state.redirectTo
          : '/';
    } catch {
      throw new UnauthorizedException(SignSnsErrorEnum.STATE_INVALID);
    }

    const email = profile.emails?.[0]?.value;
    const emailVerified = profile._json?.email_verified ?? true;
    const name = profile.displayName;

    if (!email) throw new UnauthorizedException(SignSnsErrorEnum.EMAIL_REQUIRED);
    if (emailVerified === false) throw new UnauthorizedException(SignSnsErrorEnum.EMAIL_UNVERIFIED);
    if (!name) throw new UnauthorizedException(SignSnsErrorEnum.NAME_REQUIRED);

    const user: IAuthGoogle = {
      provider: 'google',
      sub: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      image: profile.photos?.[0]?.value,
      rememberMe,
      redirectTo,
    };

    return user;
  }
}
