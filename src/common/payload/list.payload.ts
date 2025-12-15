import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class CommonListPayload<T> {
  constructor(count: number, list: T[]) {
    this.count = count;
    this.list = list;
  }

  @ApiProperty({ description: '전체 개수' })
  @IsNotEmpty()
  @IsNumber()
  readonly count: number;

  @ApiProperty({
    description: '리스트',
    isArray: true,
    type: () => Object, // 각 모듈에서 override 필요
  })
  @IsArray()
  readonly list: T[];
}
