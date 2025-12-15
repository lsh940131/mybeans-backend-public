import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  ValidateIf,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { SignSnsTypeEnum } from '../enum/user.enum';

export class RegisterByEmailDto {
  @ApiProperty({ required: true, default: 'tester' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ required: true, default: 'test@test.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ required: true, default: 'qwer1234', minLength: 6, maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  readonly pwd: string; // TODO: passwd 로 변경
}

export class RegisterBySnsDto {
  @ApiProperty({
    required: true,
    enum: SignSnsTypeEnum,
    example: SignSnsTypeEnum.NAVER,
    description: '회원가입 방식 (B: 네이버, C: 카카오, D: 구글)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(SignSnsTypeEnum)
  readonly signupType: SignSnsTypeEnum;

  @ApiProperty({ required: true, default: 'tester' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  // kakao가 이메일을 무조건 줄 수 있는지 모르겠음
  @ApiProperty({ required: true, default: 'test@test.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  // SNS 로그인인 경우 필수
  @ApiProperty({ default: 'sns-token-xyz' })
  @IsNotEmpty()
  @IsString()
  readonly snsSignValue: string;
}

export class SigninDto {
  @ApiPropertyOptional({
    description: '로그인 상태 유지. refreshToken 저장 위치 변경. false=세션쿠키, true=일반쿠키',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly rememberMe: boolean;

  @ApiPropertyOptional({ description: '로그인 후 리다이렉트 할 페이지 링크' })
  @IsOptional()
  @IsString()
  readonly redirectTo?: string;
}

export class SigninByEmailDto extends SigninDto {
  @ApiProperty({ required: true, default: 'test@test.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ required: true, default: 'qwer1234', minLength: 6, maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  readonly pwd: string;
}

export class SigninBySnsDto extends SigninDto {
  @ApiProperty({
    required: true,
    enum: SignSnsTypeEnum,
    example: SignSnsTypeEnum.NAVER,
    description: '회원가입 방식 (B: 네이버, C: 카카오, D: 구글)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(SignSnsTypeEnum)
  readonly signSnsType: SignSnsTypeEnum;

  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly image: string;
}

export class UpdateUserByEmailDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description: '현재 비밀번호',
    default: 'qwer1234',
    minLength: 6,
    maxLength: 50,
  })
  @ValidateIf((o) => o.pwd !== undefined)
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  readonly curPwd?: string;

  @ApiPropertyOptional({
    description: '새 비밀번호',
    default: 'asdf1234',
    minLength: 6,
    maxLength: 50,
  })
  @ValidateIf((o) => o.curPwd !== undefined)
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  readonly pwd?: string;

  @IsOptional()
  @ValidateIf((_, value) => value === null || typeof value === 'string')
  @IsString()
  readonly image?: string | null;
}

export class UpdateUserBySnsDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @ValidateIf((_, value) => value === null || typeof value === 'string')
  @IsString()
  readonly image?: string | null;
}

export class RenewAccessTokenDto {
  @ApiProperty({ description: '리프레시 토큰' })
  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;
}
