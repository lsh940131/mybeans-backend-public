import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { OrderCheckoutService } from './order-checkout.service';
import { OCCreateDto, OCGetDto, OCUpdateDto } from './dto/order-checkout.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { IAuth } from 'src/auth/interface/auth.interface';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { OCCreatePayload, OCQuotePayload } from './payload/order-checkout.payload';

@Controller('order/checkout')
@ApiTags('order/checkout')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class OrderCheckoutController {
  constructor(private readonly orderCheckoutService: OrderCheckoutService) {}

  @Post('/')
  @ApiOperation({ summary: '계산서 생성', description: '30분 간 유효' })
  async create(@Auth() auth: IAuth, @Body() body: OCCreateDto): Promise<OCCreatePayload> {
    return await this.orderCheckoutService.create(auth, body);
  }

  @Get('/')
  @ApiOperation({ summary: '계산서 조회' })
  async get(@Auth() auth: IAuth, @Query() query: OCGetDto): Promise<OCQuotePayload> {
    return await this.orderCheckoutService.get(auth, query);
  }

  @Put('/')
  @ApiOperation({
    summary: '계산서 수정',
    description: '현재는 배송지 및 배송요청사항에 관한 것으로 한정. 이후 할인,쿠폰 내용도 포함',
  })
  async update(@Auth() auth: IAuth, @Body() body: OCUpdateDto) {
    return await this.orderCheckoutService.update(auth, body);
  }
}
