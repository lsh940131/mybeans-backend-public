import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UACreateDto {
  @ApiProperty({ description: '배송지 이름. 사용자가 입력안하면 받는이 이름으로 보내세요.' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ description: '받는 이' })
  @IsNotEmpty()
  @IsString()
  readonly receiverName: string;

  @ApiProperty({ description: '연락처' })
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @ApiProperty({ description: '주소' })
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional()
  @IsString()
  readonly addressDetail: string;

  @ApiPropertyOptional({ description: '우편번호' })
  @IsOptional()
  @IsString()
  readonly postcode: string;

  @ApiProperty({ description: '기본 배송지 설정 여부' })
  @IsNotEmpty()
  @IsBoolean()
  readonly isDefault: boolean;
}

export class UAUpdateDto {
  @ApiProperty({ description: '배송지 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyOptional({
    description: '배송지 이름. 사용자가 입력안하면 받는이 이름으로 보내세요.',
  })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({ description: '받는 이' })
  @IsOptional()
  @IsString()
  readonly receiverName: string;

  @ApiPropertyOptional({ description: '연락처' })
  @IsOptional()
  @IsString()
  readonly phone: string;

  @ApiPropertyOptional({ description: '주소' })
  @IsOptional()
  @IsString()
  readonly address: string;

  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional()
  @IsString()
  readonly addressDetail: string;

  @ApiPropertyOptional({ description: '우편번호' })
  @IsOptional()
  @IsString()
  readonly postcode: string;

  @ApiPropertyOptional({ description: '기본 배송지 설정 여부' })
  @IsOptional()
  @IsBoolean()
  readonly isDefault: boolean;
}

export class UADeleteDto {
  @ApiProperty({ description: '배송지 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
}
