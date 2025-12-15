import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransformToList } from '../../../common/decorator/trasnform-to-list';
import { Type } from 'class-transformer';

export class CAddItemDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ description: '구매 개수' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(99)
  readonly qty: number;

  @ApiPropertyOptional({ description: '상품 옵션 값 아이디 리스트' })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly optionValueIdList: number[];
}

export class CDeleteItemDto {
  @ApiProperty({ description: '장바구니 아이디 리스트' })
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly cartIdList: number[];
}

export class CUpdateItemDto {
  @ApiProperty({ description: '장바구니 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly cartId: number;

  @ApiProperty({ description: '구매 개수' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(99)
  readonly qty: number;
}

export class CGuestItemDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ description: '구매 개수' })
  @IsNotEmpty()
  @IsNumber()
  @Max(99)
  readonly qty: number;

  @ApiPropertyOptional({ description: '상품 옵션 값 아이디 리스트' })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly optionValueIdList: number[];
}

export class CGuestItemListDto {
  @ApiProperty({
    description: '장바구니 항목 리스트',
    type: [CGuestItemDto],
    minItems: 1,
    maxItems: 50,
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CGuestItemDto)
  readonly items: CGuestItemDto[];
}

export class CMergeDto {
  @ApiProperty({
    description: '장바구니 항목 리스트',
    type: [CGuestItemDto],
    minItems: 1,
    maxItems: 50,
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CGuestItemDto)
  readonly items: CGuestItemDto[];
}
