import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonListDto } from 'src/common/dto/list.dto';
import { MypageOrderProductStatusEnum, MypageShipmentProductStatusEnum } from '../enum/mypage.enum';
import { TransformToList } from 'src/common/decorator/trasnform-to-list';

function formatYmd(date: Date) {
  return date.toISOString().split('T')[0]; // yyyy-MM-dd
}

function getSixMonthsAgoYmd() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return formatYmd(d);
}

function getTodayYmd() {
  return formatYmd(new Date());
}

export class MyPageGetOrderListDto extends CommonListDto {
  @ApiProperty({
    description: '조회 시작일',
    default: getSixMonthsAgoYmd(),
    example: getSixMonthsAgoYmd(),
  })
  @IsNotEmpty()
  @IsDate()
  readonly startDate: Date;

  @ApiProperty({ description: '조회 종료일', default: getTodayYmd(), example: getTodayYmd() })
  @IsNotEmpty()
  @IsDate()
  readonly endDate: Date;

  @ApiPropertyOptional({ description: '키워드 검색. 상품 이름' })
  @IsOptional()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional({
    description: '상품 결제 상태',
    enum: MypageOrderProductStatusEnum,
    isArray: true,
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(MypageOrderProductStatusEnum, { each: true })
  readonly orderProductStatus: MypageOrderProductStatusEnum[];

  @ApiPropertyOptional({
    description: '상품 배송 상태',
    enum: MypageShipmentProductStatusEnum,
    isArray: true,
  })
  @IsOptional()
  @TransformToList()
  @IsArray()
  @IsEnum(MypageShipmentProductStatusEnum, { each: true })
  readonly shipmentProductStatus: MypageShipmentProductStatusEnum[];
}
