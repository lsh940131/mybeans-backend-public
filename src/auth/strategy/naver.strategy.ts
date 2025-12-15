import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Request } from 'express';
import { OauthStateService } from '../state/oauth-state.service';
import { IAuthNaver } from '../interface/auth.interface';
import { SignSnsErrorEnum } from '../enum/auth.enum';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  userProfileUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly stateService: OauthStateService,
  ) {
    super({
      authorizationURL: configService.getOrThrow<string>('NAVER_AUTHORIZATION_URL'),
      tokenURL: configService.getOrThrow<string>('NAVER_TOKEN_URL'),
      clientID: configService.getOrThrow<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('NAVER_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
    });

    this.userProfileUrl = this.configService.getOrThrow<string>('NAVER_USER_PROFILE_URL');
  }

  /**
   * 초기 진입(/signin/naver)에서 들어온 쿼리(rememberMe, redirectTo, ...)를 state로 직렬화해서 구글로 보냄
   * callback API의 state에 그대로 돌아옴
   */
  async authenticate(req: Request, options?: any) {
    try {
      const { rememberMe = 'false', redirectTo = '/' } = (req.query as any) || {};

      const state = this.stateService.sign({
        rememberMe: rememberMe === 'true',
        redirectTo: String(redirectTo),
      });

      // super.authenticate에 옵션 합쳐서 위임
      return super.authenticate(req, { ...options, state });
    } catch (e) {
      const code = e?.message === 'CONFIG_MISCONFIGURED' ? 'CONFIG_MISCONFIGURED' : 'STATE_INVALID';

      return (this as any).error(new Error(code));
    }
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: any) {
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

    const resp = profile?._json?.response;
    if (!resp) throw new UnauthorizedException(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED);
    if (!resp.email) throw new UnauthorizedException(SignSnsErrorEnum.EMAIL_REQUIRED);
    const name = resp.name || profile.displayName;
    if (!name) throw new UnauthorizedException(SignSnsErrorEnum.NAME_REQUIRED);

    return {
      provider: 'naver',
      sub: resp.id,
      email: resp.email,
      name,
      image: resp.profile_image ?? profile.photos?.[0]?.value,
      rememberMe,
      redirectTo,
    } as IAuthNaver;
  }

  /**
   * 네이버 프로필 직접 조회 구현
   * passport-oauth2의 인증 절차에 따라 자동 호출되고, 반드시 done을 사용해서 마무리
   */
  async userProfile(accessToken: string, done: (err?: any, profile?: any) => void) {
    try {
      const res = await fetch(this.userProfileUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return done(new Error(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED));

      const j = await res.json();
      if (j.resultcode !== '00') {
        return done(new Error(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED));
      }

      const resp = j.response || {};
      const profile: any = {
        id: resp.id,
        displayName: resp.name || resp.nickname,
        emails: resp.email ? [{ value: resp.email }] : [],
        photos: resp.profile_image ? [{ value: resp.profile_image }] : [],
        _json: { response: resp },
      };

      return done(null, profile);
    } catch (e) {
      return done(new Error(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED));
    }
  }
}
