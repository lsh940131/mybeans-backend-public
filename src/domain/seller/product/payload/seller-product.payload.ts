import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import {
  SPManipActionEnum,
  SPManipStatusEnum,
  SPManipStatusHangulEnum,
  SPProductStatusEnum,
} from '../enum/seller-product.enum';
import {
  ISPGetProduct,
  ISPListOfManip,
  ISPListOfProduct,
  ISPManip,
  ISPManipCategory,
  ISPManipOption,
  ISPManipOptionValue,
  ISPProductImage,
  ISProductOption,
} from '../interface/seller-product.interface';
import { ApiPropertyEnum } from '../../../../common/decorator/api-property-enum.decorator';
import { CommonListPayload } from '../../../../common/payload/list.payload';

export class SPManipIdPayload {
  constructor(id: number) {
    this.manipId = id;
  }

  @ApiProperty({ description: '상품 조작 요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly manipId: number;
}

class SPManipOptionValuePayload {
  constructor(data: ISPManipOptionValue) {
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

class SPManipOptionPayload {
  constructor(data: ISPManipOption) {
    this.categoryOptionId = data.categoryOptionId;
    this.categoryOptionValueList =
      data.categoryOptionValueList?.map((v) => new SPManipOptionValuePayload(v)) || [];
  }

  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiProperty({ description: '옵션 값 리스트', isArray: true, type: SPManipOptionValuePayload })
  @IsNotEmpty()
  @IsArray()
  readonly categoryOptionValueList: SPManipOptionValuePayload[];
}

export class SPGetManipPayload {
  constructor(data: ISPManip) {
    this.id = data.id;
    this.action = data.action as SPManipActionEnum;
    this.status = data.status as SPManipStatusEnum;
    this.sellerId = data.sellerId;
    this.categoryId = data.categoryId;
    this.productId = data.productId;

    this.nameKr = data.value.nameKr;
    this.nameEn = data.value.nameEn;
    this.thumbnailUrl = data.value.thumbnailUrl;
    this.price = data.value.price;
    this.optionList = data.value.optionList?.map((v) => new SPManipOptionPayload(v)) || [];
    this.imageList = data.value.imageList;

    this.reviseReason = data.reviseReason;
    this.rejectReason = data.rejectReason;
    this.submitedAt = data.submitedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '액션',
    enums: [{ name: 'SPManipActionEnum', enum: SPManipActionEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPManipActionEnum)
  readonly action: SPManipActionEnum;

  @ApiPropertyEnum({
    description: '상태',
    enums: [
      { name: 'SPManipStatusEnum', enum: SPManipStatusEnum },
      { name: 'SPManipStatusHangulEnum', enum: SPManipStatusHangulEnum },
    ],
  })
  @IsNotEmpty()
  @IsEnum(SPManipStatusEnum)
  readonly status: SPManipStatusEnum;

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

  @ApiPropertyOptional({
    description: '상품 옵션 리스트',
    isArray: true,
    type: SPManipOptionPayload,
  })
  @IsOptional()
  readonly optionList: SPManipOptionPayload[];

  @ApiProperty({ description: '상품 상세 이미지', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  readonly imageList: string[];

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

class SPCategoryPayload {
  constructor(data: ISPManipCategory) {
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

export class SPListOfManipItemPayload {
  constructor(data: ISPListOfManip) {
    this.id = data.id;
    this.action = data.action as SPManipActionEnum;
    this.status = data.status as SPManipStatusEnum;
    this.category = data.category ? new SPCategoryPayload(data.category) : null;

    this.nameKr = data.value.nameKr;
    this.nameEn = data.value.nameEn;
    this.price = data.value.price;
    this.thumbnailUrl = data.value.thumbnailUrl;

    this.submitedAt = data.submitedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  @ApiProperty({ description: '조작요청 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '조작요청 액션',
    enums: [{ name: 'SPManipActionEnum', enum: SPManipActionEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPManipActionEnum)
  readonly action: SPManipActionEnum;

  @ApiPropertyEnum({
    description: '조작요청 상태',
    enums: [{ name: 'SPManipActionEnum', enum: SPManipActionEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPManipActionEnum)
  readonly status: SPManipStatusEnum;

  @ApiPropertyOptional({ description: '카테고리' })
  @IsOptional()
  readonly category: SPCategoryPayload | null;

  @ApiPropertyOptional({ description: '상품 이름(한글)' })
  @IsOptional()
  @IsString()
  readonly nameKr: string;

  @ApiPropertyOptional({ description: '상품 이름(영어)' })
  @IsOptional()
  @IsString()
  readonly nameEn: string;

  @ApiPropertyOptional({ description: '상품 가격' })
  @IsOptional()
  @IsNumber()
  readonly price: number;

  @ApiPropertyOptional({ description: '상품 대표 이미지' })
  @IsOptional()
  @IsString()
  readonly thumbnailUrl: string;

  @ApiPropertyOptional({ description: '심사 신청일' })
  @IsOptional()
  @IsDate()
  readonly submitedAt: Date | null;

  @ApiProperty({ description: '조작요청 생성일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;

  @ApiPropertyOptional({ description: '조작요청 수정일' })
  @IsOptional()
  @IsDate()
  readonly updatedAt: Date | null;
}

export class SPListOfManipPayload extends CommonListPayload<SPListOfManipItemPayload> {
  constructor(count: number, list: SPListOfManipItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: SPListOfManipItemPayload, isArray: true })
  readonly list: SPListOfManipItemPayload[];
}

export class SPListOfProductItemPayload {
  constructor(data: ISPListOfProduct) {
    this.id = data.id;
    this.category = new SPCategoryPayload(data.category);
    this.status = data.status as SPProductStatusEnum;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
    this.createdAt = data.createdAt;
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리', type: SPCategoryPayload })
  @IsNotEmpty()
  readonly category: SPCategoryPayload;

  @ApiPropertyEnum({
    description: '상품 상태',
    enums: [{ name: 'SPProductStatusEnum', enum: SPProductStatusEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPProductStatusEnum)
  readonly status: SPProductStatusEnum;

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

  @ApiProperty({ description: '상품 생성일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;
}

export class SPListOfProductPayload extends CommonListPayload<SPListOfProductItemPayload> {
  constructor(count: number, list: SPListOfProductItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: SPListOfProductItemPayload, isArray: true })
  readonly list: SPListOfProductItemPayload[];
}

class SPProductOptionValuePayload {
  constructor(data: SPProductOptionValuePayload) {
    this.id = data.id;
    this.categoryOptionValueId = data.categoryOptionValueId;
    this.extraCharge = data.extraCharge;
  }

  @ApiProperty({ description: '상품 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionValueId: number;

  @ApiProperty({ description: '옵션 값의 추가요금' })
  @IsNotEmpty()
  @IsNumber()
  readonly extraCharge: number;
}

class SPProductOptionPayload {
  constructor(data: ISProductOption) {
    this.id = data.id;
    this.categoryOptionId = data.categoryOptionId;
    this.productOptionValue =
      data.productOptionValue?.map((v) => new SPProductOptionValuePayload(v)) || [];
  }

  @ApiProperty({ description: '상품 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiProperty({ description: '옵션 값 리스트', isArray: true, type: SPManipOptionValuePayload })
  @IsNotEmpty()
  @IsArray()
  readonly productOptionValue: SPManipOptionValuePayload[];
}

class SPProductImagePayload {
  constructor(data: ISPProductImage) {
    this.id = data.id;
    this.url = data.url;
  }

  @ApiProperty({ description: '상품 이미지 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '상품 이미지 url' })
  @IsNotEmpty()
  @IsString()
  readonly url: string;
}

export class SPGetProductPayload {
  constructor(data: ISPGetProduct) {
    this.id = data.id;
    this.categoryId = data.categoryId;
    this.status = data.status as SPProductStatusEnum;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
    this.price = data.price;
    this.createdAt = data.createdAt;
    this.optionList = data.productOption?.length
      ? data.productOption.map((v) => new SPProductOptionPayload(v))
      : [];
    this.imageList = data.productImage?.length
      ? data.productImage.map((v) => new SPProductImagePayload(v))
      : [];
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryId: number;

  @ApiPropertyEnum({
    description: '상품 상태',
    enums: [{ name: 'SPProductStatusEnum', enum: SPProductStatusEnum }],
  })
  @IsNotEmpty()
  @IsEnum(SPProductStatusEnum)
  readonly status: SPProductStatusEnum;

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

  @ApiPropertyOptional({
    description: '상품 옵션 리스트',
    isArray: true,
    type: SPProductOptionPayload,
  })
  @IsOptional()
  readonly optionList: SPProductOptionPayload[];

  @ApiProperty({ description: '상품 상세 이미지', isArray: true, type: SPProductImagePayload })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(10)
  readonly imageList: SPProductImagePayload[];

  @ApiProperty({ description: '상품 생성일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;
}
