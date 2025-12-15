import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsNotEmpty,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { SPMManipStatusEnum, SPMManipStatusMgmtEnum } from '../enum/seller-product-mgmt.enum';
import { TransformToList } from '../../../../common/decorator/trasnform-to-list';

export class ListOfManipDto {
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
    enum: SPMManipStatusEnum,
    isArray: true,
    default: [SPMManipStatusEnum.SUBMIT],
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(SPMManipStatusEnum, { each: true })
  readonly statusList: SPMManipStatusEnum[];

  @ApiPropertyOptional({ description: 'keyword 검색. 판매자 이름' })
  @IsOptional()
  @IsString()
  readonly keyword: string;
}

export class GetManipDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class EvaluateManipDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;

  @ApiProperty({
    description: '상태',
    enum: SPMManipStatusMgmtEnum,
    default: SPMManipStatusMgmtEnum.APPROVAL,
  })
  @IsNotEmpty()
  @IsEnum(SPMManipStatusMgmtEnum)
  readonly status: SPMManipStatusMgmtEnum;

  @ApiPropertyOptional({ description: '수정 요청 사유', default: null })
  @ValidateIf((o) => o.status === SPMManipStatusMgmtEnum.REVISE)
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly reviseReason?: string;

  @ApiPropertyOptional({ description: '거절 사유', default: null })
  @ValidateIf((o) => o.status === SPMManipStatusMgmtEnum.REJECT)
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly rejectReason?: string;
}
