import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorPayload } from '../../common/payload/error.payload';
import { CryptoService } from '../../common/crypto/crypto.service';
import { AuthService } from '../../auth/auth.service';
import { ErrorCodeEnum } from '../../common/enum/errorCode.enum';
import {
  RenewAccessTokenDto,
  RegisterByEmailDto,
  SigninByEmailDto,
  SigninBySnsDto,
  UpdateUserByEmailDto,
  UpdateUserBySnsDto,
} from './dto/user.dto';
import { SignupTypeEnum } from './enum/user.enum';
import { UserSigninPayload, UserPayload, UserAccessTokenPayload } from './payload/user.payload';
import { IAuth } from '../../auth/interface/auth.interface';
import { IUpdateUserByEmail, IUpdateUserBySns, IUser } from './interface/user.interface';

@Injectable()
export class UserService {
  #refreshTokenExpiresIn: string;
  #accessTokenExpiresIn: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.#refreshTokenExpiresIn = this.configService.get<string>('REFRESHTOKEN_EXPIRES_IN');
    this.#accessTokenExpiresIn = this.configService.get<string>('ACCESSTOKEN_EXPIRES_IN');
  }

  /**
   * 회원가입 (email)
   */
  async registerByEmail(data: RegisterByEmailDto) {
    try {
      const { name, email, pwd } = data;

      // 이메일 중복 검사
      const [isDupEmail] = await this.prismaService.user.findMany({
        where: { email, deletedAt: null },
      });
      if (isDupEmail) {
        throw new ErrorPayload('Already use the email', ErrorCodeEnum.SIGNUP_DUP_EMAIL);
      }

      // 비밀번호 단방향 암호화
      const hashPwd = this.cryptoService.createHash(pwd);

      // 사용자 생성
      await this.prismaService.user.create({
        data: { signupType: SignupTypeEnum.EMAIL, name, email, pwd: hashPwd },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 로그인 (email)
   */
  async signinByEmail(data: SigninByEmailDto): Promise<UserSigninPayload> {
    try {
      const { email, pwd, rememberMe } = data;

      const userInfo = await this.prismaService.user.findFirst({
        select: {
          id: true,
          pwd: true,
          userPwdHistory: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        where: { email, deletedAt: null },
      });

      if (!userInfo) {
        throw new ErrorPayload('Incorrect email or password');
      }

      const isValid = this.cryptoService.validateHash(userInfo.pwd, pwd);
      if (!isValid) {
        throw new ErrorPayload('Incorrect email or password');
      }

      const refreshToken = await this.authService.createJwt(
        { id: userInfo.id },
        rememberMe ? this.#refreshTokenExpiresIn : undefined,
      );

      const accessToken = await this.authService.createJwt(
        { id: userInfo.id },
        this.#accessTokenExpiresIn,
      );

      // 토큰 저장
      await this.prismaService.userToken.create({
        data: {
          userId: userInfo.id,
          refreshToken: refreshToken.value,
          refreshTokenExpiredAt: refreshToken.expiredAt,
          accessToken: accessToken.value,
          accessTokenExpiredAt: accessToken.expiredAt,
        },
      });

      return new UserSigninPayload({
        refreshToken: refreshToken.value,
        refreshTokenExpiredAt: refreshToken.expiredAt,
        accessToken: accessToken.value,
        accessTokenExpiredAt: accessToken.expiredAt,
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * SNS 로그인 및 회원가입
   * 구글,네이버는 무조건 email이 있음
   * 카카오는 email이 없을 수 있음
   */
  async signinBySns(data: SigninBySnsDto): Promise<UserSigninPayload> {
    try {
      const { signSnsType, sub, email, name, image, rememberMe } = data;

      const userId: number = await this.prismaService.$transaction<number>(async (tx) => {
        const user = await tx.user.findFirst({
          select: {
            id: true,
          },
          where: {
            deletedAt: null,
            userSnsSign: {
              some: {
                type: signSnsType,
                value: sub,
                deletedAt: null,
              },
            },
          },
        });

        if (user) return user.id;
        // 등록된 사용자 없음 -> 회원가입
        else {
          /**
           * 이메일 중복 검사
           * 구글, 네이버는 strategy와 guard를 통해 무조건 이메일이 있지만, 카카오는 옵션임
           */
          if (email) {
            const [isDupEmail] = await tx.user.findMany({
              where: { email, deletedAt: null },
            });
            if (isDupEmail) {
              throw new ErrorPayload(
                '이미 가입된 이메일입니다. 이메일 로그인 후 마이페이지에서 간편 로그인을 등록하실 수 있습니다.',
                ErrorCodeEnum.SIGNUP_DUP_EMAIL,
              );
            }
          }

          // 사용자 생성
          const createdUser = await tx.user.create({
            select: {
              id: true,
            },
            data: { signupType: signSnsType, email, name, image },
          });

          // sns 정보 저장
          await tx.userSnsSign.create({
            data: {
              userId: createdUser.id,
              type: signSnsType,
              value: sub,
            },
          });

          return createdUser.id;
        }
      });

      const refreshToken = await this.authService.createJwt(
        { id: userId },
        rememberMe ? this.#refreshTokenExpiresIn : undefined,
      );

      const accessToken = await this.authService.createJwt(
        { id: userId },
        this.#accessTokenExpiresIn,
      );

      // 토큰 저장
      await this.prismaService.userToken.create({
        data: {
          userId: userId,
          refreshToken: refreshToken.value,
          refreshTokenExpiredAt: refreshToken.expiredAt,
          accessToken: accessToken.value,
          accessTokenExpiredAt: accessToken.expiredAt,
        },
      });

      return new UserSigninPayload({
        refreshToken: refreshToken.value,
        refreshTokenExpiredAt: refreshToken.expiredAt,
        accessToken: accessToken.value,
        accessTokenExpiredAt: accessToken.expiredAt,
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 사용자 조회
   */
  async get(auth: IAuth) {
    try {
      const userInfo = await this.prismaService.user.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          signupType: true,
          image: true,
          isSeller: true,
          userPwdHistory: {
            select: {
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        where: {
          id: auth.id,
        },
      });

      const data: IUser = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        signupType: userInfo.signupType,
        image: userInfo.image,
        isSeller: userInfo.isSeller ? true : false,
        pwdLastUpdatedAt: userInfo.userPwdHistory[0]?.createdAt ?? null,
      };

      return new UserPayload(data);
    } catch (e) {
      throw e;
    }
  }

  /**
   * refreshToken으로 accessToken 갱신
   */
  async renewAccessToken(data: RenewAccessTokenDto): Promise<UserAccessTokenPayload> {
    try {
      const { refreshToken } = data;

      if (!refreshToken) {
        throw new ErrorPayload('유효하지 않은 토큰입니다.', ErrorCodeEnum.INVALID_REFRESHTOKEN);
      }

      // refreshToken 유효성 체크 & 사용자 아이디 조회
      const userToken = await this.prismaService.userToken.findFirst({
        select: {
          id: true,
          userId: true,
        },
        where: {
          refreshToken,
          refreshTokenExpiredAt: {
            gte: new Date(),
          },
          deletedAt: null,
        },
      });
      if (!userToken) {
        throw new ErrorPayload('유효하지 않은 토큰입니다.', ErrorCodeEnum.INVALID_REFRESHTOKEN);
      }

      // accessToken 생성
      const accessToken = await this.authService.createJwt(
        { id: userToken.userId },
        this.#accessTokenExpiresIn,
      );

      // 사용자 토큰 정보 업데이트
      await this.prismaService.userToken.update({
        data: {
          accessToken: accessToken.value,
          accessTokenExpiredAt: accessToken.expiredAt,
        },
        where: {
          id: userToken.id,
        },
      });

      return new UserAccessTokenPayload({
        accessToken: accessToken.value,
        accessTokenExpiredAt: accessToken.expiredAt,
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 사용자 (email) 업데이트
   * 비밀번호 변경 가능
   */
  async updateUserByEmail(auth: IAuth, data: UpdateUserByEmailDto): Promise<boolean> {
    try {
      const { id } = auth;
      const { name, curPwd, pwd, image } = data;

      // 업데이트 파라미터 없음
      if (!(name || curPwd || pwd || image !== undefined)) {
        return true;
      }

      const userInfo = await this.prismaService.user.findUnique({
        select: {
          pwd: true,
          signupType: true,
        },
        where: { id },
      });

      if (userInfo.signupType !== SignupTypeEnum.EMAIL) {
        throw new ErrorPayload('Bad request');
      }

      const userUpdateParams: IUpdateUserByEmail = {};

      if (name) {
        userUpdateParams.name = name;
      }

      if (curPwd && pwd) {
        const isValid = this.cryptoService.validateHash(userInfo.pwd, curPwd);
        if (!isValid) {
          throw new ErrorPayload('Incorrect password');
        }

        const hashPwd = this.cryptoService.createHash(pwd);
        userUpdateParams.pwd = hashPwd;
      }

      if (image !== undefined) {
        userUpdateParams.image = image;
      }

      if (Object.keys(userUpdateParams).length) {
        await this.prismaService.user.update({ where: { id }, data: userUpdateParams });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 사용자 (sns) 업데이트
   * 비밀번호 변경 불가
   */
  async updateUserBySns(auth: IAuth, data: UpdateUserBySnsDto): Promise<boolean> {
    try {
      const { id } = auth;
      const { name, image } = data;

      // 업데이트 파라미터 없음
      if (!(name || image !== undefined)) {
        return true;
      }

      const userInfo = await this.prismaService.user.findUnique({
        select: {
          signupType: true,
        },
        where: { id },
      });

      if (userInfo.signupType === SignupTypeEnum.EMAIL) {
        throw new ErrorPayload('Bad request');
      }

      const userUpdateParams: IUpdateUserBySns = {};

      if (name) {
        userUpdateParams.name = name;
      }

      if (image !== undefined) {
        userUpdateParams.image = image;
      }

      if (Object.keys(userUpdateParams).length) {
        await this.prismaService.user.update({ where: { id }, data: userUpdateParams });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 로그아웃
   */
  async signout(auth: IAuth): Promise<boolean> {
    try {
      const { id, jwt } = auth;

      await this.prismaService.userToken.updateMany({
        where: {
          userId: id,
          accessToken: jwt,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 회원탈퇴
   */
  async unregister(auth: IAuth): Promise<boolean> {
    try {
      const now = new Date();

      // 사용자 정보 삭제 처리
      await this.prismaService.user.update({
        where: { id: auth.id },
        data: { deletedAt: now },
      });

      // 토큰 전부 삭제
      await this.prismaService.userToken.updateMany({
        where: { userId: auth.id },
        data: { deletedAt: now },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
