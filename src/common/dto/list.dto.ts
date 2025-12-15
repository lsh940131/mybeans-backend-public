import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Max } from 'class-validator';

export class CommonListDto {
  @ApiProperty({ description: '조회 범위 (시작)', default: 0 })
  @IsNotEmpty()
  @IsNumber()
  readonly offset: number;

  @ApiProperty({ description: '조회 범위 (종료)', default: 50 })
  @IsNotEmpty()
  @IsNumber()
  @Max(50)
  readonly length: number;
}
