import { ApiProperty } from '@nestjs/swagger';
import { IPwhProduct, IPwhListItem } from '../interface/product-watch-history.interface';
import { CommonListPayload } from '../../../common/payload/list.payload';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PwhCreatedPayload {
  constructor(data: { id: number }) {
    this.id = data.id;
  }

  @ApiProperty({ description: '상품 구경 기록 아이디' })
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;
}

class PwhProductPayload {
  constructor(data: IPwhProduct) {
    this.id = data.id;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.thumbnailUrl = data.thumbnailUrl;
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

  @ApiProperty({ description: '섬네일 링크' })
  @IsNotEmpty()
  @IsString()
  readonly thumbnailUrl: string;
}

export class PwhListItemPayload {
  constructor(data: IPwhListItem) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.product = new PwhProductPayload(data.product);
  }

  @ApiProperty({ description: '구경 상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '구경 기록 생성일' })
  @IsDate()
  @IsNotEmpty()
  readonly createdAt: Date;

  @ApiProperty({ description: '상품정보', type: PwhProductPayload })
  @IsNotEmpty()
  readonly product: PwhProductPayload;
}

export class PwhListPayload extends CommonListPayload<PwhListItemPayload> {
  constructor(count: number, list: PwhListItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: PwhListItemPayload, isArray: true })
  readonly list: PwhListItemPayload[];
}
