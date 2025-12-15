import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodeEnum } from '../enum/errorCode.enum';
import { IsEnum } from 'class-validator';

export class ErrorPayload {
  constructor(message: string);
  constructor(message: string, code: string);
  constructor(message: string, code?: string) {
    this.message = message;
    this.code = code
      ? Object.values(ErrorCodeEnum).includes(code as ErrorCodeEnum)
        ? (code as ErrorCodeEnum)
        : null
      : null;
  }

  @ApiProperty({ description: '에러 메세지', default: 'error message' })
  readonly message: string;

  @ApiProperty({ description: '에러 코드', default: null, enum: ErrorCodeEnum })
  @IsEnum(ErrorCodeEnum)
  readonly code: string;
}
