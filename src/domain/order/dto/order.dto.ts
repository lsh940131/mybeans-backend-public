import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderConfirmDto {
  @ApiProperty({ description: '계산서 아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly checkoutId: number;

  @ApiProperty({ description: 'Toss 결제키' })
  @IsNotEmpty()
  @IsString()
  readonly paymentKey: string;

  @ApiProperty({ description: 'Toss 결제 요청 시 프론트에서 제시한 orderId' })
  @IsNotEmpty()
  @IsString()
  readonly tossOrderId: string;

  @ApiProperty({ description: 'Toss 결제 요청 금액' })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}
