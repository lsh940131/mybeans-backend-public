import { ApiProperty } from '@nestjs/swagger';
import { IAccessToken, ISignTokens, IUser } from '../interface/user.interface';
import { SignupTypeEnum } from '../enum/user.enum';
import { ApiPropertyEnum } from '../../../common/decorator/api-property-enum.decorator';

export class UserSigninPayload {
  constructor(data: ISignTokens) {
    this.refreshToken = data.refreshToken;
    this.accessToken = data.accessToken;
    this.refreshTokenExpiredAt = data.refreshTokenExpiredAt;
    this.accessTokenExpiredAt = data.accessTokenExpiredAt;
  }

  readonly refreshToken: string;
  readonly refreshTokenExpiredAt: Date;
  readonly accessToken: string;
  readonly accessTokenExpiredAt: Date;
}

export class UserAccessTokenPayload {
  constructor(data: IAccessToken) {
    this.accessToken = data.accessToken;
    this.accessTokenExpiredAt = data.accessTokenExpiredAt;
  }

  readonly accessToken: string;
  readonly accessTokenExpiredAt: Date;
}

export class UserPayload {
  constructor(data: IUser) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.signupType = data.signupType;
    this.image = data.image;
    this.isSeller = data.isSeller;
    this.pwdLastUpdatedAt = data.pwdLastUpdatedAt;
  }

  @ApiProperty({ description: '아이디' })
  readonly id: number;

  @ApiProperty({ description: '이름' })
  readonly name: string;

  @ApiProperty({ description: '이메일' })
  readonly email: string;

  @ApiPropertyEnum({
    description: '회원가입 타입',
    enums: [{ name: 'SignupTypeEnum', enum: SignupTypeEnum }],
  })
  readonly signupType: string;

  @ApiProperty({ description: '이미지' })
  readonly image: string;

  @ApiProperty({ description: '판매자 여부' })
  readonly isSeller: boolean;

  @ApiProperty({
    default: null,
    nullable: true,
    required: false,
    description: '마지막 비밀번호 변경 시각 (nullable)',
  })
  readonly pwdLastUpdatedAt: Date | null;
}
