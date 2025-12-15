import { CommonListPayload } from 'src/common/payload/list.payload';
import {
  IMypageProductOption,
  IMypageProduct,
  IMypageOrderProduct,
  IMypageOrderList,
  IMypageShipmentProduct,
} from '../interface/mypage.interface';
import { MypageShipmentProductStatusEnum, MypageOrderProductStatusEnum } from '../enum/mypage.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyEnum } from 'src/common/decorator/api-property-enum.decorator';

class MypageProductOptionPayload {
  constructor(data: IMypageProductOption) {
    this.optionNameKr = data.optionNameKr;
    this.optionNameEn = data.optionNameEn;
    this.optionValueKr = data.optionValueKr;
    this.optionValueEn = data.optionValueEn;
  }

  @ApiProperty({ description: '상품 옵션 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly optionNameKr: string;

  @ApiProperty({ description: '상품 옵션 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly optionNameEn: string;

  @ApiProperty({ description: '상품 옵션 값 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly optionValueKr: string;
  @ApiProperty({ description: '상품 옵션 값 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly optionValueEn: string;
}

class MypageProductPayload {
  constructor(data: IMypageProduct) {
    this.id = data.id;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
    this.selectedOptionList = data.selectedOptionList?.length
      ? data.selectedOptionList.map((v) => new MypageProductOptionPayload(v))
      : [];
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

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

  @ApiProperty({
    description: '선택된 옵션 리스트',
    isArray: true,
    type: MypageProductOptionPayload,
  })
  readonly selectedOptionList: MypageProductOptionPayload[];
}

class MypageShipmentProductPayload {
  constructor(data: IMypageShipmentProduct) {
    this.id = data.id;
    this.status = data.status;
    this.shippedAt = data.shippedAt;
    this.deliveredAt = data.deliveredAt;
    this.createdAt = data.createdAt;
  }

  @ApiProperty({ description: '주문상품 배송정보 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '주문상품 배송정보 상태',
    enums: [{ name: 'MypageShipmentProductStatusEnum', enum: MypageShipmentProductStatusEnum }],
  })
  @IsNotEmpty()
  readonly status: string | MypageShipmentProductStatusEnum;

  @ApiPropertyOptional({ description: '출고 시각' })
  @IsOptional()
  @IsDate()
  readonly shippedAt: Date;

  @ApiPropertyOptional({ description: '배송완료 시각' })
  @IsOptional()
  @IsDate()
  readonly deliveredAt: Date;

  @ApiProperty({ description: '배송정보 생성시각' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;
}

export class MypageOrderProductPayload {
  constructor(data: IMypageOrderProduct) {
    this.id = data.id;
    this.status = data.status;
    this.qty = data.qty;
    this.price = data.price;
    this.totalPrice = data.totalPrice;
    this.createdAt = data.createdAt;
    this.product = new MypageProductPayload(data.product);
    this.shipment = new MypageShipmentProductPayload(data.shipment);
  }

  @ApiProperty({ description: '주문 상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({
    description: '주문 상품 상태',
    enums: [{ name: 'MypageOrderProductStatusEnum', enum: MypageOrderProductStatusEnum }],
  })
  @IsEnum(MypageOrderProductStatusEnum)
  readonly status: string | MypageOrderProductStatusEnum;

  @ApiProperty({ description: '주문 수량' })
  @IsNotEmpty()
  @IsNumber()
  readonly qty: number;

  @ApiProperty({ description: '상품 개당 가격 (기본가 + 옵션가)' })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty({ description: '상품 총 가격 (qty * unitPrice)' })
  @IsNotEmpty()
  @IsNumber()
  readonly totalPrice: number;

  @ApiProperty({ description: '주문일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;

  @ApiProperty({ description: '상품 정보', type: MypageProductPayload })
  @IsNotEmpty()
  readonly product: MypageProductPayload;

  @ApiPropertyOptional({ description: '상품 배송정보', type: MypageShipmentProductPayload })
  @IsOptional()
  readonly shipment: MypageShipmentProductPayload;
}

export class MypageOrderListItemPayload {
  constructor(data: IMypageOrderList) {
    this.id = data.id;
    this.no = data.no;
    this.totalMerchandise = data.totalMerchandise;
    this.totalShippingFee = data.totalShippingFee;
    this.totalAmount = data.totalAmount;
    this.orderProductList = data.orderProductList?.length
      ? data.orderProductList.map((v) => new MypageOrderProductPayload(v))
      : [];
  }

  @ApiProperty({ description: '주문 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '주문 번호' })
  @IsNotEmpty()
  @IsString()
  readonly no: string;

  @ApiProperty({ description: '주문 상품의 총 주문금액' })
  @IsNotEmpty()
  @IsNumber()
  readonly totalMerchandise: number;

  @ApiProperty({ description: '주문 상품의 총 배송료' })
  @IsNotEmpty()
  @IsNumber()
  readonly totalShippingFee: number;

  @ApiProperty({ description: '주문 상품의 총 결제금액 (totalMerchandise + totalShippingFee)' })
  @IsNotEmpty()
  @IsNumber()
  readonly totalAmount: number;

  @ApiProperty({ description: '주문 상품 정보', isArray: true, type: MypageOrderProductPayload })
  readonly orderProductList: MypageOrderProductPayload[];
}

export class MypageOrderListPayload extends CommonListPayload<MypageOrderListItemPayload> {
  constructor(count: number, list: MypageOrderListItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: MypageOrderListItemPayload, isArray: true })
  readonly list: MypageOrderListItemPayload[];
}
