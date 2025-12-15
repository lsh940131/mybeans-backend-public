import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SPMManipActionEnum,
  SPMManipStatusEnum,
  SPMManipStatusHangulEnum,
} from '../enum/seller-product-mgmt.enum';
import {
  ISPMCategory,
  ISPMCategoryOption,
  ISPMCategoryOptionValue,
  ISPMEvaluator,
  ISPMManip,
  ISPMManipListItem,
  ISPMSeller,
} from '../interface/seller-product-mgmt.interface';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyEnum } from '../../../../common/decorator/api-property-enum.decorator';
import { CommonListPayload } from '../../../../common/payload/list.payload';

class SPMSellerPayload {
  constructor(data: ISPMSeller) {
    this.id = data.id;
    this.name = data.name;
  }

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '판매자 이름' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

class SPMCategoryPayload {
  constructor(data: ISPMCategory) {
    this.id = data.id;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
  }

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 이름(한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 이름(영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;
}

export class SPMListOfManipItemPayload {
  constructor(data: ISPMManipListItem) {
    this.id = data.id;
    this.action = data.action as SPMManipActionEnum;
    this.status = data.status as SPMManipStatusEnum;
    this.seller = data.seller ? new SPMSellerPayload(data.seller) : null;
    this.category = data.category ? new SPMCategoryPayload(data.category) : null;
  }

  @ApiProperty({ description: '요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '액션',
    enums: [{ name: 'SPMManipActionEnum', enum: SPMManipActionEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPMManipActionEnum)
  readonly action: SPMManipActionEnum;

  @ApiPropertyEnum({
    description: '상태',
    enums: [
      { name: 'SPMManipStatusEnum', enum: SPMManipStatusEnum },
      { name: 'SPMManipStatusHangulEnum', enum: SPMManipStatusHangulEnum },
    ],
  })
  @IsNotEmpty()
  @IsEnum(SPMManipStatusEnum)
  readonly status: SPMManipStatusEnum;

  @ApiProperty({ description: '판매자', type: SPMSellerPayload })
  readonly seller: SPMSellerPayload;

  @ApiProperty({ description: '카테고리', type: SPMCategoryPayload })
  readonly category: SPMCategoryPayload;
}

export class SPMListOfManipPayload extends CommonListPayload<SPMListOfManipItemPayload> {
  constructor(count: number, list: SPMListOfManipItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: SPMListOfManipItemPayload, isArray: true })
  readonly list: SPMListOfManipItemPayload[];
}

class SPMOptionValuePayload {
  constructor(data: ISPMCategoryOptionValue) {
    this.categoryOptionValueId = data.categoryOptionValueId;
    this.extraCharge = data.extraCharge;
  }

  @ApiProperty({ description: '옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionValueId: number;

  @ApiProperty({ description: '옵션 값의 추가요금' })
  @IsNotEmpty()
  @IsNumber()
  readonly extraCharge: number;
}

class SPMOptionPayload {
  constructor(data: ISPMCategoryOption) {
    this.categoryOptionId = data.categoryOptionId;
    this.categoryOptionValueList =
      data.categoryOptionValueList?.map((v) => new SPMOptionValuePayload(v)) || [];
  }

  @ApiProperty({ description: '옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiProperty({ description: '옵션 값 리스트', isArray: true, type: SPMOptionValuePayload })
  @IsNotEmpty()
  @IsArray()
  readonly categoryOptionValueList: SPMOptionValuePayload[];
}

class SPMEvaluatorPayload {
  constructor(data: ISPMEvaluator) {
    this.id = data.id;
    this.name = data.name;
  }

  @ApiProperty({ description: '심사자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '심사자 이름' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class SPMManipPayload {
  constructor(data: ISPMManip) {
    this.id = data.id;
    this.action = data.action as SPMManipActionEnum;
    this.status = data.status as SPMManipStatusEnum;
    this.sellerId = data.sellerId;
    this.categoryId = data.categoryId;
    this.productId = data.productId;

    this.nameKr = data.value.nameKr;
    this.nameEn = data.value.nameEn;
    this.thumbnailUrl = data.value.thumbnailUrl;
    this.price = data.value.price;
    this.optionList = data.value.optionList?.map((v) => new SPMOptionPayload(v)) || [];
    this.imageList = data.value.imageList;

    this.reviseReason = data.reviseReason;
    this.rejectReason = data.rejectReason;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '액션',
    enums: [{ name: 'SPMManipActionEnum', enum: SPMManipActionEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPMManipActionEnum)
  readonly action: SPMManipActionEnum;

  @ApiPropertyEnum({
    description: '상태',
    enums: [
      { name: 'SPMManipStatusEnum', enum: SPMManipStatusEnum },
      { name: 'SPMManipStatusHangulEnum', enum: SPMManipStatusHangulEnum },
    ],
  })
  @IsNotEmpty()
  @IsEnum(SPMManipStatusEnum)
  readonly status: SPMManipStatusEnum;

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly sellerId: number;

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryId: number;

  @ApiPropertyOptional({ description: '상품 아이디' })
  @IsOptional()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ description: '상품 이름(한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 이름(영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '상품 대표이미지' })
  @IsNotEmpty()
  @IsString()
  readonly thumbnailUrl: string;

  @ApiProperty({ description: '상품 가격' })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiPropertyOptional({ description: '상품 옵션 리스트', isArray: true, type: SPMOptionPayload })
  @IsOptional()
  readonly optionList: SPMOptionPayload[];

  @ApiProperty({ description: '상품 상세 이미지', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  readonly imageList: string[];

  @ApiPropertyOptional({ description: '심사자', type: SPMEvaluatorPayload })
  @IsOptional()
  readonly evaluator: SPMEvaluatorPayload;

  @ApiPropertyOptional({ description: '심사일' })
  @IsOptional()
  @IsDate()
  readonly evaluatedAt: Date;

  @ApiPropertyOptional({ description: '상품조작요청 수정 이유' })
  @IsOptional()
  @IsString()
  readonly reviseReason: string;

  @ApiPropertyOptional({ description: '상품조작요청 거절 이유' })
  @IsOptional()
  @IsString()
  readonly rejectReason: string;

  @ApiProperty({ description: '요청 제출일' })
  @IsNotEmpty()
  @IsDate()
  readonly submitedAt: Date;

  @ApiProperty({ description: '요청 생성일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;

  @ApiPropertyOptional({ description: '요청 수정일' })
  @IsNotEmpty()
  @IsDate()
  readonly updatedAt: Date;
}
