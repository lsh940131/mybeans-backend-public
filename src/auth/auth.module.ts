import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from '../common/crypto/crypto.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { OauthStateService } from './state/oauth-state.service';
import { KakaoStrategy } from './strategy/kakao.strategy';

@Module({
  controllers: [],
  providers: [
    AuthService,
    OauthStateService,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
  imports: [
    PrismaModule,
    ConfigModule,
    CryptoModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWTKEY'),
      }),
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
