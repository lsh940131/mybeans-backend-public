import { ApiProperty } from '@nestjs/swagger';
import { IESearchProduct } from '../interface/elastic.interface';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CommonListPayload } from 'src/common/payload/list.payload';

export class ESearchProductPayload {
  constructor(data: IESearchProduct) {
    this.productId = data.productId;
  }

  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;
}

export class ESearchProductListPayload extends CommonListPayload<ESearchProductPayload> {
  constructor(count: number, list: ESearchProductPayload[]) {
    super(count, list);
  }

  @ApiProperty({ type: ESearchProductPayload, isArray: true })
  readonly list: ESearchProductPayload[];
}
