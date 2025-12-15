import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateDto {
  @ApiPropertyOptional({ description: '부모 카테고리 아이디', default: null })
  @IsOptional()
  @IsNumber()
  readonly parentId: number | null;

  @ApiProperty({ description: '카테고리 이름 (한글)', default: '테스트' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'nameKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameKr은 공백만으로 구성될 수 없습니다.' })
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 이름 (영어)', default: 'test' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'nameEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameEn은 공백만으로 구성될 수 없습니다.' })
  readonly nameEn: string;
}

export class UpdateDto {
  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyOptional({
    description: '부모 카테고리 아이디. null 업데이트 시 최상위 카테고리로 올라감',
  })
  @IsOptional()
  @IsNumber()
  readonly parentId: number | null;

  @ApiPropertyOptional({ description: '카테고리 이름 (한글)', default: '테스트' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'nameKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameKr은 공백만으로 구성될 수 없습니다.' })
  readonly nameKr: string;

  @ApiPropertyOptional({ description: '카테고리 이름 (영어)', default: 'test' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'nameEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameEn은 공백만으로 구성될 수 없습니다.' })
  readonly nameEn: string;
}

export class DeleteDto {
  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}

export class CreateOptionDto {
  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryId: number;

  @ApiProperty({ description: '카테고리 이름 (한글)', default: '테스트_옵션' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'nameKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameKr은 공백만으로 구성될 수 없습니다.' })
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 이름 (영어)', default: 'test_option' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'nameEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameEn은 공백만으로 구성될 수 없습니다.' })
  readonly nameEn: string;
}

export class UpdateOptionDto {
  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiPropertyOptional({ description: '카테고리 옵션 이름 (한글)', default: '테스트_옵션' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'nameKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameKr은 공백만으로 구성될 수 없습니다.' })
  readonly nameKr: string;

  @ApiPropertyOptional({ description: '카테고리 옵션 이름 (영어)', default: 'test_option' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'nameEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'nameEn은 공백만으로 구성될 수 없습니다.' })
  readonly nameEn: string;
}

export class DeleteOptionDto {
  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;
}

export class CreateOptionValueDto {
  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionId: number;

  @ApiProperty({ description: '카테고리 옵션 값 이름 (한글)', default: '테스트_옵션_값' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'valueKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'valueKr은 공백만으로 구성될 수 없습니다.' })
  readonly valueKr: string;

  @ApiProperty({ description: '카테고리 옵션 값 이름 (영어)', default: 'test_option_value' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'valueEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'valueEn은 공백만으로 구성될 수 없습니다.' })
  readonly valueEn: string;
}

export class UpdateOptionValueDto {
  @ApiProperty({ description: '카테고리 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionValueId: number;

  @ApiPropertyOptional({ description: '카테고리 옵션 이름 (한글)', default: '테스트_옵션_값' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'valueKr은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'valueKr은 공백만으로 구성될 수 없습니다.' })
  readonly valueKr: string;

  @ApiPropertyOptional({ description: '카테고리 옵션 이름 (영어)', default: 'test_option_value' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'valueEn은 최소 1자 이상이어야 합니다.' })
  @Matches(/\S/, { message: 'valueEn은 공백만으로 구성될 수 없습니다.' })
  readonly valueEn: string;
}

export class DeleteOptionValueDto {
  @ApiProperty({ description: '카테고리 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly categoryOptionValueId: number;
}
