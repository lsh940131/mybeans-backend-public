import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsArray,
  ArrayMaxSize,
  Min,
  ValidateIf,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  SPManipActionEnum,
  SPManipStatusEnum,
  SPProductStatusEnum,
} from '../enum/seller-product.enum';
import { ApiPropertyEnum } from '../../../../common/decorator/api-property-enum.decorator';
import { CommonListDto } from '../../../../common/dto/list.dto';
import { TransformToList } from '../../../../common/decorator/trasnform-to-list';

class SPOptionValueDto {
  @ApiPropertyOptional({ description: '카테고리 옵션 값 아이디' })
  @IsOptional()
  @IsNumber()
  readonly categoryOptionValueId: number;

  @ApiPropertyOptional({ description: '옵션 값의 추가요금. 상품 가격(price)에 합산됨' })
  @IsOptional()
  @IsNumber()
  readonly extraCharge: number;
}

class SPOptionDto {
  @ApiPropertyOptional({ description: '카테고리 옵션 아이디' })
  @IsOptional()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiPropertyOptional({
    description: '카테고리 옵션 값 리스트',
    isArray: true,
    type: SPOptionValueDto,
  })
  @IsOptional()
  @Type(() => SPOptionValueDto)
  readonly categoryOptionValueList: SPOptionValueDto[];
}

export class SPCreateManipCreationDto {
  @ApiPropertyOptional({ description: '카테고리 아이디' })
  @ValidateIf((o) => o.productOptionList?.length > 0)
  @IsNumber()
  readonly categoryId: number;

  @ApiPropertyOptional({ description: '상품 이름 (한글)' })
  @IsOptional()
  @IsString()
  readonly nameKr: string;

  @ApiPropertyOptional({ description: '상품 이름 (영어)' })
  @IsOptional()
  @IsString()
  readonly nameEn: string;

  @ApiPropertyOptional({ description: '상품 대표 이미지' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly thumbnailUrl: string;

  @ApiPropertyOptional({ description: '상품 가격' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiPropertyOptional({ description: '배송비' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly shippingFee: number;

  @ApiPropertyOptional({
    description: '옵션 및 옵션 값 리스트',
    isArray: true,
    type: SPOptionDto,
  })
  @IsOptional()
  @Type(() => SPOptionDto)
  readonly optionList: SPOptionDto[];

  // 첨부파일
  @ApiPropertyOptional({ description: '첨부파일 URL 리스트. overwrite로 동작' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  readonly imageList: string[];
}

export class SPUpdateManipCreationDto extends SPCreateManipCreationDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPCreateManipUpdateDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiPropertyOptional({ description: '판매 상태', enum: SPProductStatusEnum })
  @IsOptional()
  @IsEnum(SPProductStatusEnum)
  readonly status: SPProductStatusEnum;
}

export class SPDeleteManipDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPSubmitRequestDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPCancelSubmitDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPGetManipDto {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPCreateManipUpdate {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiPropertyEnum({
    description: '상품 판매상태',
    enums: [{ name: 'SPProductStatusEnum', enum: SPProductStatusEnum }],
    default: SPProductStatusEnum.ON,
  })
  @IsOptional()
  @IsEnum(SPProductStatusEnum)
  readonly status: SPProductStatusEnum;

  @ApiProperty({ description: '상품 이름 (한글)', default: '수정_만델링' })
  @IsOptional()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 이름 (영어)', default: 'update_Mandheling' })
  @IsOptional()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '상품 대표 이미지', default: 'update_thumbnail_url' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly thumbnailUrl: string;

  @ApiProperty({ description: '상품 가격', default: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({ description: '카테고리 아이디', default: 4 })
  @ValidateIf((o) => o.productOptionList?.length > 0)
  @IsNumber()
  readonly categoryId: number;

  @ApiPropertyOptional({
    description: '옵션 및 옵션 값 리스트',
    isArray: true,
    type: SPOptionDto,
  })
  @IsOptional()
  @Type(() => SPOptionDto)
  readonly optionList: SPOptionDto[];

  // 첨부파일
  @ApiPropertyOptional({ description: '첨부파일 URL 리스트. overwrite로 동작' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  readonly imageList: string[];
}

export class SPUpdateManipUpdateDto extends OmitType(SPCreateManipUpdate, ['productId'] as const) {
  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

export class SPListOfManipDto extends CommonListDto {
  @ApiPropertyOptional({ description: 'keyword 검색. 상품명' })
  @IsOptional()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional({
    description: '액션',
    enum: SPManipActionEnum,
    isArray: true,
    default: null,
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(SPManipActionEnum, { each: true })
  readonly actionList: SPManipActionEnum[];

  @ApiPropertyOptional({
    description: '상태',
    enum: SPManipStatusEnum,
    isArray: true,
    default: null,
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(SPManipStatusEnum, { each: true })
  readonly statusList: SPManipStatusEnum[];
}

export class PSCreateManipDeletionDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;
}

export class PSListOfProductDto extends CommonListDto {
  @ApiPropertyOptional({ description: 'keyword 검색. 상품명' })
  @IsOptional()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional({ description: '카테고리 아이디 리스트' })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly categoryIdList: number[];

  @ApiPropertyOptional({
    description: '상품 상태',
    enum: SPProductStatusEnum,
    isArray: true,
    default: null,
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(SPProductStatusEnum, { each: true })
  readonly statusList: SPProductStatusEnum[];
}

export class PSGetProductDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;
}
