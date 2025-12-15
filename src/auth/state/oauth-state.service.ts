import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type OauthState = { rememberMe: boolean; redirectTo: string; nonce: string };

@Injectable()
export class OauthStateService {
  private readonly secret: string;
  private readonly ttl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.secret = this.configService.getOrThrow<string>('OAUTH_STATE_SECRET');
    this.ttl = this.configService.getOrThrow<string>('OAUTH_STATE_TTL');
  }

  sign(input: Pick<OauthState, 'rememberMe' | 'redirectTo'>): string {
    const payload: OauthState = {
      rememberMe: !!input.rememberMe,
      redirectTo: typeof input.redirectTo === 'string' ? input.redirectTo : '/',
      nonce: crypto.randomUUID(),
    };
    return this.jwtService.sign(payload, { secret: this.secret, expiresIn: this.ttl });
  }

  verify(token: string): OauthState {
    const parsed = this.jwtService.verify<OauthState>(token, { secret: this.secret });
    // redirectTo 방어로직(내부 경로만 허용)
    if (typeof parsed.redirectTo !== 'string' || !parsed.redirectTo.startsWith('/')) {
      parsed.redirectTo = '/';
    }
    return parsed;
  }
}
