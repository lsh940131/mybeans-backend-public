import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IOCCreated,
  IOCOuote,
  IOCProduct,
  IOCProductOption,
  IOCProductOptionValue,
  IOCSellerItem,
  IOCSellerSubtotal,
} from '../interface/order-checkout.interface';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyEnum } from 'src/common/decorator/api-property-enum.decorator';
import { OCProductStatusEnum } from '../enum/order-checkout.enum';

export class OCCreatePayload {
  constructor(data: IOCCreated) {
    this.id = data.id;
    this.expiredAt = data.expiredAt;
  }

  @ApiProperty({ description: '계산서 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '계산서 만료시각' })
  @IsNotEmpty()
  @IsDate()
  readonly expiredAt: Date;
}

class OCProductOptionValuePayload {
  constructor(data: IOCProductOptionValue) {
    this.id = data.id;
    this.extraCharge = data.extraCharge;
    this.valueKr = data.categoryOptionValue.valueKr;
    this.valueEn = data.categoryOptionValue.valueEn;
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

class OCProductOptionPayload {
  constructor(data: IOCProductOption) {
    this.id = data.id;
    this.isRequired = data.isRequired;
    this.nameKr = data.categoryOption.nameKr;
    this.nameEn = data.categoryOption.nameEn;
    this.valueList = data.productOptionValue?.length
      ? data.productOptionValue.map((v) => new OCProductOptionValuePayload(v))
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
    type: OCProductOptionValuePayload,
  })
  @IsNotEmpty()
  readonly valueList: OCProductOptionValuePayload[];
}

class OCProductPayload {
  constructor(data: IOCProduct) {
    this.id = data.id;
    this.status = data.status as OCProductStatusEnum;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
    this.price = data.price;
    this.shippingFee = data.shippingFee;
    this.optionList = data.productOption?.length
      ? data.productOption.map((v) => new OCProductOptionPayload(v))
      : [];
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '상품 상태',
    enums: [{ name: 'OCProductStatusEnum', enum: OCProductStatusEnum }],
  })
  @IsNotEmpty()
  @IsEnum(OCProductStatusEnum)
  readonly status: OCProductStatusEnum;

  @ApiProperty({ description: '상품 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '상품 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '섬네일 링크' })
  @IsNotEmpty()
  @IsString()
  readonly thumbnailUrl: string;

  @ApiProperty({ description: '기본가' })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty({ description: '배송비' })
  @IsNotEmpty()
  @IsNumber()
  readonly shippingFee: number;

  @ApiPropertyOptional({ description: '상품 옵션 리스트', type: OCProductOptionPayload })
  @IsOptional()
  readonly optionList: null | OCProductOptionPayload[];
}

class OCSellerItemPayload {
  constructor(data: IOCSellerItem) {
    this.cartId = data.cartId;
    this.productId = data.productId;
    this.qty = data.qty;
    this.optionValueIdList = data.optionValueIdList;
    this.unitPrice = data.unitPrice;
    this.totalPrice = data.totalPrice;
    this.shippingFee = data.shippingFee;
    this.product = new OCProductPayload(data.product);
  }

  @ApiPropertyOptional({ description: '장바구니 아이디. 회원일 경우 있지만, guest일 경우 null' })
  @IsOptional()
  @IsNumber()
  readonly cartId: number;

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ description: '주문 개수' })
  @IsNotEmpty()
  @IsNumber()
  readonly qty: number;

  @ApiPropertyOptional({ description: '주문 옵션 값 아이디', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly optionValueIdList: number[];

  @ApiProperty({ description: '상품 개당 가격 (기본가 + 옵션가)' })
  @IsNotEmpty()
  @IsNumber()
  readonly unitPrice: number;

  @ApiProperty({ description: '상품 총 가격 (qty * unitPrice)' })
  @IsNotEmpty()
  @IsNumber()
  readonly totalPrice: number;

  @ApiProperty({ description: '상품 배송비' })
  @IsNotEmpty()
  @IsNumber()
  readonly shippingFee: number;

  @ApiProperty({ description: '상품 정보', type: OCProductPayload })
  @IsNotEmpty()
  readonly product: OCProductPayload;
}

export class OCSellerSubtotalPayload {
  constructor(data: IOCSellerSubtotal) {
    this.sellerId = data.sellerId;
    this.sellerName = data.sellerName;
    this.freeShippingThreshold = data.freeShippingThreshold;
    this.merchandiseSubtotal = data.merchandiseSubtotal;
    this.shippingFeeSubtotal = data.shippingFeeSubtotal;
    this.freeApplied = data.freeApplied;
    this.items = data.items?.map((v) => new OCSellerItemPayload(v));
  }

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly sellerId: number;

  @ApiProperty({ description: '판매자 상호명' })
  @IsNotEmpty()
  @IsString()
  readonly sellerName: string;

  @ApiPropertyOptional({ description: '판매자가 설정한 무료배송충족금액' })
  @IsOptional()
  @IsNumber()
  readonly freeShippingThreshold: number;

  @ApiProperty({ description: '해당 판매자 상품의 총 주문금액' })
  @IsNotEmpty()
  @IsNumber()
  readonly merchandiseSubtotal: number;

  @ApiProperty({ description: '해당 판매자 상품의 총 배송료' })
  @IsNotEmpty()
  @IsNumber()
  readonly shippingFeeSubtotal: number;

  @ApiProperty({ description: '무료배송 여부' })
  @IsNotEmpty()
  @IsBoolean()
  readonly freeApplied: boolean;

  @ApiProperty({
    description: '단일 판매자의 상품들의 견적 리스트',
    isArray: true,
    type: OCSellerItemPayload,
  })
  @IsNotEmpty()
  readonly items: OCSellerItemPayload[];
}

export class OCQuotePayload {
  constructor(data: IOCOuote) {
    this.subtotalMerchandise = data.subtotalMerchandise;
    this.subtotalShippingFee = data.subtotalShippingFee;
    this.list = data.list.map((v) => new OCSellerSubtotalPayload(v));
  }

  @ApiProperty({ description: '장바구니 상품 총 주문금액' })
  @IsNotEmpty()
  @IsNumber()
  readonly subtotalMerchandise: number;

  @ApiProperty({ description: '장바구니 상품 총 배송비' })
  @IsNotEmpty()
  @IsNumber()
  readonly subtotalShippingFee: number;

  @ApiProperty({
    description: '장바구니 상품을 판매자별로 묶은 견적 리스트',
    isArray: true,
    type: OCSellerSubtotalPayload,
  })
  @IsNotEmpty()
  readonly list: OCSellerSubtotalPayload[];
}
