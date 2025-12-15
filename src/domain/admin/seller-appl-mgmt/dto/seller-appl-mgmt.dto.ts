import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { EvaluateEnum, StatusEnum } from '../enum/seller-appl-mgmt.enum';
import { TransformToList } from '../../../../common/decorator/trasnform-to-list';

export class ListDto {
  @ApiProperty({ description: '조회 범위 (시작)', default: 0 })
  @IsNotEmpty()
  @IsNumber()
  readonly offset: number;

  @ApiProperty({ description: '조회 범위 (종료)', default: 50 })
  @IsNotEmpty()
  @IsNumber()
  readonly length: number;

  @ApiPropertyOptional({
    description: '상태',
    enum: StatusEnum,
    isArray: true,
    default: [StatusEnum.SUBMIT],
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(StatusEnum, { each: true })
  readonly statusList: StatusEnum[];

  @ApiPropertyOptional({ description: 'keyword 검색. 사업자등록번호, 상호명' })
  @IsOptional()
  @IsString()
  readonly keyword: string;
}

export class GetDto {
  @ApiProperty({ description: '아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}

export class EvaluateDto {
  @ApiProperty({ description: '아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({
    description: '상태, 수정 요청과 거절할 경우 사유 작성 필수',
    enum: EvaluateEnum,
  })
  @IsNotEmpty()
  @IsEnum(EvaluateEnum)
  readonly status: EvaluateEnum;

  @ApiPropertyOptional({ description: '수정 요청 사유' })
  @ValidateIf((o) => o.status === EvaluateEnum.REVISE)
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly reviseReason?: string;

  @ApiPropertyOptional({ description: '거절 사유' })
  @ValidateIf((o) => o.status === EvaluateEnum.REJECT)
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly rejectReason?: string;
}
