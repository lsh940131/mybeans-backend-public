import {
  Controller,
  UseGuards,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  RegisterByEmailDto,
  SigninByEmailDto,
  SigninDto,
  UpdateUserByEmailDto,
  UpdateUserBySnsDto,
} from './dto/user.dto';
import { Auth } from '../../auth/decorator/auth.decorator';
import { IAuth, IAuthGoogle, IAuthKakao, IAuthNaver } from '../../auth/interface/auth.interface';
import { UserPayload } from './payload/user.payload';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Roles } from '../../auth/decorator/role.decorator';
import { RoleEnum } from '../../auth/enum/auth.enum';
import { Request, Response } from 'express';
import { SignSnsTypeEnum } from './enum/user.enum';
import { GoogleAuthGuard, KakaoAuthGuard, NaverAuthGuard } from '../../auth/guard/sns-auth';

@Controller('user')
@ApiTags('user')
export class UserController {
  #env: string;
  #frontUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.#env = this.configService.get<string>('ENV');
    this.#frontUrl = this.configService.get<string>('FRONT_URL');
  }

  @Post('/register/email')
  @ApiOperation({ summary: '회원가입 (email)' })
  async registerByEmail(@Body() data: RegisterByEmailDto): Promise<boolean> {
    return await this.userService.registerByEmail(data);
  }

  @Post('/signin/email')
  @ApiOperation({
    summary: '로그인 (email)',
    description:
      'cookie에 accessToken과 refreshToken이 설정됨. accessToken 값을 Authorize에 넣어서 사용',
  })
  async signinByEmail(
    @Body() data: SigninByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    const result = await this.userService.signinByEmail(data);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.refreshTokenExpiredAt,
    });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiredAt,
    });

    return true;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/signin/google')
  @ApiOperation({ summary: '로그인 (google)' })
  async signinByGoogle(@Query() query: SigninDto): Promise<void> {
    // Passport가 리다이렉트
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/signin/google/callback')
  @ApiOperation({ summary: '로그인 (google) callback' })
  async googleCallback(@Req() req, @Res() res) {
    const user: IAuthGoogle = req.user;

    const result = await this.userService.signinBySns({
      signSnsType: SignSnsTypeEnum.GOOGLE,
      sub: user.sub,
      email: user.email,
      name: user.name,
      image: user.image,
      rememberMe: user.rememberMe,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.refreshTokenExpiredAt,
    });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiredAt,
    });

    return res.redirect(
      `${this.#frontUrl}/sign/social-popup-bridge#ok=true&provider=google&redirectTo=${encodeURIComponent(user.redirectTo)}`,
    );
  }

  @UseGuards(NaverAuthGuard)
  @Get('/signin/naver')
  @ApiOperation({ summary: '로그인 (naver)' })
  async signinByNaver(@Query() query: SigninDto): Promise<void> {
    // Passport가 리다이렉트
  }

  @UseGuards(NaverAuthGuard)
  @Get('/signin/naver/callback')
  @ApiOperation({ summary: '로그인 (naver) callback' })
  async naverCallback(@Req() req, @Res() res) {
    const user: IAuthNaver = req.user;

    const result = await this.userService.signinBySns({
      signSnsType: SignSnsTypeEnum.NAVER,
      sub: user.sub,
      email: user.email,
      name: user.name,
      image: user.image,
      rememberMe: user.rememberMe,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.refreshTokenExpiredAt,
    });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiredAt,
    });

    return res.redirect(
      `${this.#frontUrl}/sign/social-popup-bridge#ok=true&provider=naver&redirectTo=${encodeURIComponent(user.redirectTo)}`,
    );
  }

  @UseGuards(KakaoAuthGuard)
  @Get('/signin/kakao')
  @ApiOperation({ summary: '로그인 (kakao)' })
  async signinByKakao(@Query() query: SigninDto): Promise<void> {
    // Passport가 리다이렉트
  }

  @UseGuards(KakaoAuthGuard)
  @Get('/signin/kakao/callback')
  @ApiOperation({ summary: '로그인 (kakao) callback' })
  async kakaoCallback(@Req() req, @Res() res) {
    const user: IAuthKakao = req.user;

    const result = await this.userService.signinBySns({
      signSnsType: SignSnsTypeEnum.KAKAO,
      sub: user.sub,
      email: user.email,
      name: user.name,
      image: user.image,
      rememberMe: user.rememberMe,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.refreshTokenExpiredAt,
    });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiredAt,
    });

    return res.redirect(
      `${this.#frontUrl}/sign/social-popup-bridge#ok=true&provider=kakao&redirectTo=${encodeURIComponent(user.redirectTo)}`,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('/')
  @ApiOperation({ summary: '사용자 조회' })
  async get(@Auth() auth: IAuth): Promise<UserPayload> {
    return await this.userService.get(auth);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('/check/accesstoken')
  @ApiOperation({
    summary: 'accessToken 유효성 체크',
    description: '유효할 경우 true. 유효하지 않을 경우 Unauthorized 에러',
  })
  async checkAccessToken(): Promise<boolean> {
    return true;
  }

  @Get('/renew/accesstoken')
  @ApiOperation({
    summary: 'accessToken 갱신',
    description: 'cookie에 유효한 refreshToken이 있어야함',
  })
  async renewAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    const refreshToken = req.cookies?.refreshToken;

    const result = await this.userService.renewAccessToken({ refreshToken });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.#env === 'PROD',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiredAt,
    });

    return true;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('/email')
  @ApiOperation({ summary: '사용자 수정 (email)' })
  async updateUserByEmail(
    @Auth() auth: IAuth,
    @Body() data: UpdateUserByEmailDto,
  ): Promise<boolean> {
    return await this.userService.updateUserByEmail(auth, data);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('/sns')
  @ApiOperation({ summary: '사용자 수정 (sns)' })
  async updateUserBySns(@Auth() auth: IAuth, @Body() data: UpdateUserBySnsDto): Promise<boolean> {
    return await this.userService.updateUserBySns(auth, data);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('/isAdmin')
  @ApiOperation({ summary: '관리자 role 체크' })
  async isAdmin(@Auth() auth: IAuth) {
    return true;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Post('/signout')
  @ApiOperation({ summary: '로그아웃' })
  async signout(@Auth() auth: IAuth): Promise<boolean> {
    return await this.userService.signout(auth);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Delete('/unregister')
  @ApiOperation({ summary: '회원탈퇴' })
  async unregister(@Auth() auth: IAuth): Promise<boolean> {
    return await this.userService.unregister(auth);
  }
}
