import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  ICategory,
  ICategoryNode,
  ICategoryOption,
  ICategoryOptionValue,
} from '../interface/category.interface';

export class CategoryTreePayload {
  constructor(data: ICategoryNode) {
    this.id = data.id;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.children = data.children?.map((child) => new CategoryTreePayload(child)) || [];
  }

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 한글명' })
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 영문명' })
  @IsString()
  readonly nameEn: string;

  @ApiProperty({
    description: '하위 카테고리 리스트',
    type: () => [CategoryTreePayload],
  })
  @ValidateNested({ each: true })
  @Type(() => CategoryTreePayload)
  @IsOptional()
  readonly children: CategoryTreePayload[];
}

class CategoryOptionValuePayload {
  constructor(data: ICategoryOptionValue) {
    this.id = data.id;
    this.valueKr = data.valueKr;
    this.valueEn = data.valueEn;
  }

  @ApiProperty({ description: '카테고리 옵션 값 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 옵션 값 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly valueKr: string;

  @ApiProperty({ description: '카테고리 옵션 값 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly valueEn: string;
}

class CategoryOptionPayload {
  constructor(data: ICategoryOption) {
    this.id = data.id;
    this.nameKr = data.nameKr;
    this.nameEn = data.nameEn;
    this.categoryOptionValue = data.categoryOptionValue
      ? data.categoryOptionValue.map((v) => new CategoryOptionValuePayload(v))
      : [];
  }

  @ApiProperty({ description: '카테고리 옵션 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '카테고리 옵션 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 옵션 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({
    description: '카테고리 옵션 값 리스트',
    isArray: true,
    type: CategoryOptionValuePayload,
  })
  readonly categoryOptionValue: CategoryOptionValuePayload[];
}

export class CategoryPayload {
  constructor(category: ICategory, optionList: ICategoryOption[]) {
    this.id = category.id;
    this.parentId = category.parentId;
    this.nameKr = category.nameKr;
    this.nameEn = category.nameEn;
    this.optionList = optionList ? optionList.map((v) => new CategoryOptionPayload(v)) : [];
  }

  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyOptional({ description: '카테고리 부모 아이디' })
  @IsOptional()
  @IsNumber()
  readonly parentId: number | null;

  @ApiProperty({ description: '카테고리 이름 (한글)' })
  @IsNotEmpty()
  @IsString()
  readonly nameKr: string;

  @ApiProperty({ description: '카테고리 이름 (영어)' })
  @IsNotEmpty()
  @IsString()
  readonly nameEn: string;

  @ApiProperty({ description: '카테고리 옵션 리스트', isArray: true, type: CategoryOptionPayload })
  readonly optionList: CategoryOptionPayload[];
}
