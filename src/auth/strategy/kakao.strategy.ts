import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Request } from 'express';
import { OauthStateService } from '../state/oauth-state.service';
import { IAuthKakao } from '../interface/auth.interface';
import { SignSnsErrorEnum } from '../enum/auth.enum';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  userProfileUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly stateService: OauthStateService,
  ) {
    super({
      authorizationURL: configService.getOrThrow<string>('KAKAO_AUTHORIZATION_URL'),
      tokenURL: configService.getOrThrow<string>('KAKAO_TOKEN_URL'),
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'), // optional
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
      scope: ['profile_nickname', 'profile_image'],
      passReqToCallback: true,
    });

    this.userProfileUrl = this.configService.getOrThrow<string>('KAKAO_USER_PROFILE_URL');
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

    // 카카오 프로필 파싱
    const resp = profile?._json; // userProfile에서 _json에 원본을 담아줄 것
    if (!resp) throw new UnauthorizedException(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED);

    const id = String(resp.id ?? '');
    const kakao_account = resp.kakao_account ?? {};
    const profileObj = kakao_account.profile ?? {};

    const email: string | undefined = kakao_account.email;
    const name: string | undefined = profileObj.nickname;
    const image: string | undefined = profileObj.profile_image_url || profile?.photos?.[0]?.value;

    if (!name) throw new UnauthorizedException(SignSnsErrorEnum.NAME_REQUIRED);

    const result: IAuthKakao = {
      provider: 'kakao',
      sub: id,
      email,
      name,
      image,
      rememberMe,
      redirectTo,
    };
    return result;
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
      // 카카오는 에러 시 HTTP 4xx/5xx로 내려오기 때문에 여기선 별도 코드 비교 불필요
      // 기대형식: { id, kakao_account: { email, profile: { nickname, profile_image_url ... } }, ... }

      const kakao_account = j.kakao_account ?? {};
      const profile = kakao_account.profile ?? {};

      const normalized: any = {
        id: j.id,
        displayName: profile.nickname,
        emails: kakao_account.email ? [{ value: kakao_account.email }] : [],
        photos: profile.profile_image_url ? [{ value: profile.profile_image_url }] : [],
        _json: j, // validate에서 원본 접근
      };

      return done(null, normalized);
    } catch {
      return done(new Error(SignSnsErrorEnum.PROVIDER_USERINFO_FAILED));
    }
  }
}
