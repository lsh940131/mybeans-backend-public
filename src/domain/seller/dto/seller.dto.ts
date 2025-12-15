import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CommonListDto } from '../../../common/dto/list.dto';

export class SellerListDto extends CommonListDto {}

export class SellerGetDto {
  @ApiProperty({ description: '판매자 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly sellerId: number;
}

export class SellerUpdateDto {
  @ApiPropertyOptional({ description: '판매자 상호명' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({ description: '판매자 상호 이미지' })
  @IsOptional()
  @IsString()
  readonly image: string;

  @ApiPropertyOptional({ description: '판매자 무료배송 기준값' })
  @IsOptional()
  @IsNumber()
  readonly freeShippingThreshold: number;
}
