import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { OrderService } from './order.service';
import { Auth } from '../../auth/decorator/auth.decorator';
import { IAuth } from '../../auth/interface/auth.interface';
import { OrderConfirmDto } from './dto/order.dto';

@Controller('order')
@ApiTags('order')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/payment/toss/confirm')
  @ApiOperation({ summary: '주문/결제 확인' })
  async confirm(@Auth() auth: IAuth, @Body() body: OrderConfirmDto): Promise<any> {
    return await this.orderService.confirm(auth, body);
  }
}
