import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUAListItem } from '../interface/user-address.interface';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UAListItemPayload {
  constructor(data: IUAListItem) {
    this.id = data.id;
    this.name = data.name;
    this.receiverName = data.receiverName;
    this.phone = data.phone;
    this.address = data.address;
    this.addressDetail = data.addressDetail;
    this.postcode = data.postcode;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  @ApiProperty({ description: '배송지 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '배송지 이름' })
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

  @ApiProperty({ description: '배송지 생성일' })
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;

  @ApiPropertyOptional({ description: '배송지 수정일' })
  @IsOptional()
  @IsDate()
  readonly updatedAt: Date;
}
