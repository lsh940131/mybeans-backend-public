import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CommonListDto } from '../../../common/dto/list.dto';
import { TransformToBoolean } from '../../../common/decorator/transform-to-boolean';
import { TransformToList } from '../../../common/decorator/trasnform-to-list';
import { Type } from 'class-transformer';

export class PListDto extends CommonListDto {
  @ApiPropertyOptional({ description: '키워드 검색' })
  @IsOptional()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional({ description: '카테고리 아이디 리스트' })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly categoryIdList: number[];

  @ApiPropertyOptional({ description: '판매자 아이디 리스트' })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly sellerIdList: number[];

  @ApiPropertyOptional({ description: '싱글 오리진 여부' })
  @IsOptional()
  @TransformToBoolean()
  @IsBoolean()
  readonly isSingle: boolean;

  @ApiPropertyOptional({ description: '블렌드 여부' })
  @IsOptional()
  @TransformToBoolean()
  @IsBoolean()
  readonly isBlend: boolean;

  @ApiPropertyOptional({ description: '스페셜티 여부' })
  @IsOptional()
  @TransformToBoolean()
  @IsBoolean()
  readonly isSpecialty: boolean;

  @ApiPropertyOptional({ description: '디카페인 여부' })
  @IsOptional()
  @TransformToBoolean()
  @IsBoolean()
  readonly isDecaf: boolean;
}

export class PGetDto {
  @ApiProperty({ description: '상품 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}

export class PDeleteSearchHistoryDto {
  @ApiProperty({ description: '검색 기록 아이디' })
  @IsNotEmpty()
  @TransformToList()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly idList: number[];
}

class GuestSearchHistoryItem {
  @ApiProperty({ description: '검색어' })
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @ApiProperty({ description: '검색일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;
}

export class PMergeGuestToMemberSearchHistory {
  @ApiProperty({
    description: '상품 검색 키워드 리스트',
    isArray: true,
    type: GuestSearchHistoryItem,
  })
  @IsArray()
  readonly items: GuestSearchHistoryItem[];
}
