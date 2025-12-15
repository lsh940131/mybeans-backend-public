import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { MypageService } from './mypage.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { IAuth } from 'src/auth/interface/auth.interface';
import { MyPageGetOrderListDto } from './dto/mypage.dto';
import { MypageOrderListPayload } from './payload/mypage.payload';

@Controller('/user/mypage')
@ApiTags('/user/mypage')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get('/order/list')
  @ApiOperation({ summary: '주문/배송내역 조회' })
  async getOrderList(
    @Auth() auth: IAuth,
    @Query() query: MyPageGetOrderListDto,
  ): Promise<MypageOrderListPayload> {
    return await this.mypageService.getOrderList(auth, query);
  }
}
