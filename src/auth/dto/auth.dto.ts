import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJwtDto {
  @ApiProperty({ required: true, default: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
