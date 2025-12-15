import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class PwhCreateDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;
}

export class PwhDeleteDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;
}

class PwhMergeItemDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNumber()
  @IsNotEmpty()
  readonly productId: number;

  @ApiProperty({ description: '구경일시' })
  @IsDate()
  @IsNotEmpty()
  readonly createdAt: Date;
}

export class PwhMergeDto {
  @ApiProperty({ type: PwhMergeItemDto, isArray: true })
  @IsArray()
  readonly list: PwhMergeItemDto[];
}
