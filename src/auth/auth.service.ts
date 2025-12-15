import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../common/crypto/crypto.service';
import { CreateJwtDto } from './dto/auth.dto';
import { AuthJwtPayload } from './payload/auth.payload';
import { DateTime, DurationLike } from 'luxon';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * 사용자id로 jwt 토큰 생성
   * @param data {id: 사용자id}
   * @param expiresIn 1s|1m|...
   * @returns jwt
   */
  async createJwt(data: CreateJwtDto, expiresIn?: string): Promise<AuthJwtPayload> {
    try {
      const encrypted = this.cryptoService.aes256Encrypt(
        JSON.stringify({
          ...data,
        }),
      );

      const jwtOptions: Record<string, any> = {};
      if (expiresIn) {
        jwtOptions.expiresIn = expiresIn;
      }
      const jwt = await this.jwtService.signAsync({ sub: encrypted }, jwtOptions);

      const expiredAt = expiresIn ? this.#getExpirationDate(expiresIn) : undefined;

      return new AuthJwtPayload(jwt, expiredAt);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 현 시간을 기준으로 주어진 시간문자열로 만료일을 계산하여 반환
   * @param expiresIn 1s|1m|...
   */
  #getExpirationDate(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([smhdwy])$/); // s, m, h, d, w, y 지원
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const unitMap: Record<string, keyof DurationLike> = {
      s: 'seconds',
      m: 'minutes',
      h: 'hours',
      d: 'days',
      w: 'weeks',
      y: 'years',
    };

    const durationKey = unitMap[unit];
    if (!durationKey) {
      throw new Error(`Unsupported unit: ${unit}`);
    }

    return DateTime.now()
      .plus({ [durationKey]: amount })
      .toJSDate();
  }
}
