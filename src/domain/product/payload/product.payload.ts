import { ApiPropertyEnum } from 'src/common/decorator/api-property-enum.decorator';
import { ProductStatusEnum } from '../enum/product.enum';
import {
  IProductCategory,
  IProductCoffeeProfile,
  IProductGet,
  IProductImage,
  IProductListItem,
  IProductOption,
  IProductOptionValue,
  IProductSearchKeyword,
  IProductSeller,
} from '../interface/product.interface';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonListPayload } from 'src/common/payload/list.payload';

class ProductCoffeeProfilePayload {
  constructor(data: IProductCoffeeProfile) {
    this.isSingle = data.isSingle;
    this.isBlend = data.isBlend;
    this.isSpecialty = data.isSpecialty;
    this.isDecaf = data.isDecaf;
  }

  @ApiProperty({ description: '싱글 오리진 여부', example: true })
  @IsBoolean()
  readonly isSingle: boolean;

  @ApiProperty({ description: '블렌드 여부', example: false })
  @IsBoolean()
  readonly isBlend: boolean;

  @ApiProperty({ description: '스페셜티 여부', example: true })
  @IsBoolean()
  readonly isSpecialty: boolean;

  @ApiProperty({ description: '디카페인 여부', example: false })
  @IsBoolean()
  readonly isDecaf: boolean;
}

class ProductCategoryPayload {
  constructor(data: IProductCategory) {
    this.id = data.id;
    this.parentId = data.parentId;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
  }

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 부모 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly parentId: number;

  @ApiProperty({ description: '카테고리 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;
}

class ProductSellerPayload {
  constructor(data: IProductSeller) {
    this.id = data.id;
    this.name = data.name;
  }

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '판매자 이름 (상호명)' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

class ProductImagePayload {
  constructor(data: IProductImage) {
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

class ProductOptionValuePayload {
  constructor(data: IProductOptionValue) {
    this.id = data.id;
    this.extraCharge = data.extraCharge;
    this.valueKr = data.valueKr;
    this.valueEn = data.valueEn;
  }

  @ApiProperty({ description: '상품 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '상품 옵션 값 추가금' })
  @IsNotEmpty()
  @IsNumber()
  readonly extraCharge: number;

  @ApiProperty({ description: '상품 옵션 값 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly valueKr: string;

  @ApiProperty({ description: '상품 옵션 값 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly valueEn: string;
}

class ProductOptionPayload {
  constructor(data: IProductOption) {
    this.id = data.id;
    this.isRequired = data.isRequired;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.valueList = data.valueList?.length
      ? data.valueList.map((v) => new ProductOptionValuePayload(v))
      : null;
  }

  @ApiProperty({ description: '상품 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '상품 옵션 필수 여부' })
  @IsNotEmpty()
  @IsBoolean()
  readonly isRequired: boolean;

  @ApiProperty({ description: '상품 옵션 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 옵션 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({
    description: '상품 옵션 값 리스트',
    isArray: true,
    type: ProductOptionValuePayload,
  })
  @IsNotEmpty()
  readonly valueList: ProductOptionValuePayload[];
}

export class ProductListItemPayload {
  constructor(data: IProductListItem) {
    this.id = data.id;
    this.status = data.status as ProductStatusEnum;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
    this.price = data.price;
    this.productCoffeeProfile = data.productCoffeeProfile
      ? new ProductCoffeeProfilePayload(data.productCoffeeProfile)
      : null;
    this.category = new ProductCategoryPayload(data.category);
    this.seller = new ProductSellerPayload(data.seller);
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '상품 상태',
    enums: [{ name: 'ProductStatusEnum', enum: ProductStatusEnum }],
  })
  @IsNotEmpty()
  @IsEnum(ProductStatusEnum)
  readonly status: ProductStatusEnum;

  @ApiProperty({ description: '상품 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '썸네일 링크' })
  @IsNotEmpty()
  @IsString()
  readonly thumbnailUrl: string;

  @ApiProperty({ description: '가격' })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiPropertyOptional({
    description: '상품 중 커피의 추가필드',
    type: ProductCoffeeProfilePayload,
  })
  readonly productCoffeeProfile: ProductCoffeeProfilePayload;

  @ApiProperty({ description: '상품 카테고리', type: ProductCategoryPayload })
  @IsNotEmpty()
  readonly category: ProductCategoryPayload;

  @ApiProperty({ description: '판매자', type: ProductSellerPayload })
  @IsNotEmpty()
  readonly seller: ProductSellerPayload;
}

export class ProductListPayload extends CommonListPayload<ProductListItemPayload> {
  constructor(count: number, list: ProductListItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: ProductListItemPayload, isArray: true })
  readonly list: ProductListItemPayload[];
}

export class ProductGetPayload {
  constructor(product: IProductGet, optionList: IProductOption[]) {
    this.id = product.id;
    this.status = product.status;
    this.nameKr = product.nameKr;
    this.nameEn = product.nameEn;
    this.thumbnailUrl = product.thumbnailUrl;
    this.price = product.price;
    this.category = new ProductCategoryPayload(product.category);
    this.seller = new ProductSellerPayload(product.seller);
    this.imageList = product.productImage?.length
      ? product.productImage.map((v) => new ProductImagePayload(v))
      : null;

    this.optionList = optionList?.length
      ? optionList.map((v) => new ProductOptionPayload(v))
      : null;
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '상품 상태',
    enums: [{ name: 'ProductStatusEnum', enum: ProductStatusEnum }],
    default: ProductStatusEnum.ON,
  })
  @IsNotEmpty()
  @IsEnum(ProductStatusEnum)
  readonly status: string;

  @ApiProperty({ description: '상품 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '상품 썸네일' })
  @IsNotEmpty()
  @IsString()
  readonly thumbnailUrl: string;

  @ApiProperty({ description: '상품 가격' })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty({ description: '상품 카테고리' })
  @IsNotEmpty()
  readonly category: ProductCategoryPayload;

  @ApiProperty({ description: '상품 판매자' })
  @IsNotEmpty()
  readonly seller: ProductSellerPayload;

  @ApiProperty({ description: '상품 상세 이미지 리스트', isArray: true, type: ProductImagePayload })
  @IsNotEmpty()
  readonly imageList: ProductImagePayload[];

  @ApiProperty({ description: '상품 옵션 리스트', isArray: true, type: ProductOptionPayload })
  @IsNotEmpty()
  readonly optionList: ProductOptionPayload[];
}

export class ProductGetSearchKeywordPayload {
  constructor(data: IProductSearchKeyword) {
    this.id = data.id;
    this.keyword = data.keyword;
    this.createdAt = data.createdAt;
  }

  @ApiProperty({ description: '검색 기록 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '검색 키워드' })
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @ApiProperty({ description: '검색 시간' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;
}
