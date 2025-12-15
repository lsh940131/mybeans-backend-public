import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class GetDto {
  @ApiProperty({ description: '카테고리 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
