import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OCSourceEnum } from '../enum/order-checkout.enum';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OCCreateDto {
  @ApiProperty({
    enum: OCSourceEnum,
    description: 'A: 장바구니, B: 바로구매',
  })
  @IsEnum(OCSourceEnum)
  readonly source: OCSourceEnum;

  // -------------------------
  // source = A (장바구니) 용
  // -------------------------

  @ApiProperty({
    required: false,
    type: [Number],
    description: '장바구니에서 진입할 때 선택된 cartId 목록 (source=A일 때 필수)',
  })
  @ValidateIf((o) => o.source === OCSourceEnum.CART)
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly cartIdList?: number[];

  // -------------------------
  // source = B (바로구매) 용
  // -------------------------

  @ApiProperty({
    required: false,
    description: '바로구매 상품 ID (source=B일 때 필수)',
  })
  @ValidateIf((o) => o.source === OCSourceEnum.DIRECT)
  @IsNumber()
  readonly productId?: number;

  @ApiProperty({
    required: false,
    description: '바로구매 수량 (source=B일 때 필수)',
    minimum: 1,
    default: 1,
  })
  @ValidateIf((o) => o.source === OCSourceEnum.DIRECT)
  @IsNumber()
  @Min(1)
  readonly qty?: number;

  @ApiProperty({
    required: false,
    type: [Number],
    description: '바로구매 옵션 value ID 목록 (옵션 없는 상품도 있으므로 선택값)',
  })
  @ValidateIf((o) => o.source === OCSourceEnum.DIRECT)
  @IsArray()
  @IsNumber({}, { each: true })
  readonly optionValueIdList?: number[];
}

export class OCGetDto {
  @ApiProperty({ description: '계산서 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}

export class OCItemDto {
  @ApiProperty({
    description:
      '상품아이디와 옵션 값들을 엮어 만든 키 ex) `${productId}:${optValueIds}` optValueIds는 오름차순정렬. 옵션이 없다면 `${productId}:-`',
  })
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @ApiPropertyOptional({ description: '상품 배송요청사항' })
  @IsOptional()
  @IsString()
  readonly shipmentReqMsg: string;
}

class OCShipmentDto {
  @ApiProperty({ description: '받는 이' })
  @IsNotEmpty()
  @IsString()
  readonly receiverName: string;

  @ApiProperty({ description: '연락처' })
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @ApiProperty({ description: '주소' })
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional()
  @IsString()
  readonly addressDetail: string;

  @ApiPropertyOptional({ description: '우편번호' })
  @IsOptional()
  @IsString()
  readonly postcode: string;

  @ApiProperty({
    description: '주문/결제할 상품의 키과 배송요청사항',
    isArray: true,
    type: OCItemDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OCItemDto)
  readonly items: OCItemDto[];
}

export class OCUpdateDto {
  @ApiProperty({ description: '계산서 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '배송지 정보 및 상품별 배송요청사항', type: OCShipmentDto })
  @IsNotEmpty()
  readonly shipment: OCShipmentDto;
}
