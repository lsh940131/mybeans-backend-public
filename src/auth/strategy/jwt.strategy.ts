import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorPayload } from '../../common/payload/error.payload';
import { CryptoService } from '../../common/crypto/crypto.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '../enum/auth.enum';
import { IAuth } from '../interface/auth.interface';
import { ErrorCodeEnum } from '../../common/enum/errorCode.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWTKEY'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // jwt 토큰 확인
  async validate(req: Request, payload: any): Promise<IAuth> {
    try {
      let id: number;
      try {
        const decrypted = this.cryptoService.aes256Decrypt(payload.sub);
        const jwtPayload = JSON.parse(decrypted);
        id = jwtPayload.id;
      } catch (e) {
        throw new ErrorPayload('Unauthorized', ErrorCodeEnum.INVALID_ACCESSTOKEN);
      }

      let jwt = req.headers['authorization'];
      jwt = jwt.replace('Bearer ', '');

      const tokenInfo = await this.prismaService.userToken.findFirst({
        select: {
          userId: true,
        },
        where: {
          accessToken: jwt,
          deletedAt: null,
        },
      });
      if (!tokenInfo) {
        throw new ErrorPayload('Unauthorized', ErrorCodeEnum.INVALID_ACCESSTOKEN);
      }

      const userInfo = await this.prismaService.user.findUnique({
        select: {
          id: true,
          isSeller: true,
          isAdmin: true,
          seller: {
            select: {
              id: true,
            },
            where: {
              deletedAt: null,
            },
          },
        },
        where: { id, deletedAt: null },
      });
      if (!userInfo) {
        throw new ErrorPayload('Unauthorized', ErrorCodeEnum.INVALID_ACCESSTOKEN);
      }

      const roles: RoleEnum[] = [];
      if (userInfo.isSeller) roles.push(RoleEnum.SELLER);
      if (userInfo.isAdmin) roles.push(RoleEnum.ADMIN);

      const sellerId = userInfo.seller[0]?.id;

      const auth: IAuth = { id, jwt, roles, sellerId };

      return auth;
    } catch (e) {
      throw e;
    }
  }
}
