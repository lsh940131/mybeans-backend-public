import { ApiProperty } from '@nestjs/swagger';
import { ISellerListItem, ISeller } from '../interface/seller.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CommonListPayload } from 'src/common/payload/list.payload';

export class SellerListItemPayload {
  constructor(data: ISellerListItem) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
  }

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '판매자 상호명' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ description: '판매자 상호 이미지' })
  @IsNotEmpty()
  @IsString()
  readonly image: string;
}

export class SellerListPayload extends CommonListPayload<SellerListItemPayload> {
  constructor(count: number, list: SellerListItemPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: SellerListItemPayload, isArray: true })
  readonly list: SellerListItemPayload[];
}

class SellerUserPayload {
  constructor(data: { name: string }) {
    this.name = data.name;
  }

  @ApiProperty({ description: '사용자 이름' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class SellerPayload {
  constructor(data: ISeller) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.user = new SellerUserPayload(data.user);
  }

  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '판매자 상호명' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ description: '판매자 상호 이미지' })
  @IsNotEmpty()
  @IsString()
  readonly image: string;

  @ApiProperty({ description: '판매자 정보', type: SellerUserPayload })
  readonly user: SellerUserPayload;
}
