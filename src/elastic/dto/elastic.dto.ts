import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { CommonListDto } from '../../common/dto/list.dto';
import { TransformToBoolean } from '../../common/decorator/transform-to-boolean';
import { TransformToList } from '../../common/decorator/trasnform-to-list';

export class ESearchDto extends CommonListDto {
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
