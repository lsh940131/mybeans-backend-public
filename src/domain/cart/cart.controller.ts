import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../auth/decorator/auth.decorator';
import { IAuth } from '../../auth/interface/auth.interface';
import { CartService } from './cart.service';
import {
  CAddItemDto,
  CDeleteItemDto,
  CUpdateItemDto,
  CGuestItemListDto,
  CMergeDto,
} from './dto/cart.dto';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CAddPayload, CQuotePayload } from './payload/cart.payload';
import { Public } from '../../auth/decorator/public.decorator';

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/')
  @ApiOperation({
    summary: '장바구니에 상품 추가',
    description:
      '장바구니에 이미 같은 옵션을 선택한 상품이 있을 경우 최대 개수(qty=99)가 넘지 않는 선에서 주문 개수 증가',
  })
  async addItem(@Auth() auth: IAuth, @Body() body: CAddItemDto): Promise<CAddPayload> {
    return await this.cartService.addItem(auth, body);
  }

  @Get('/')
  @ApiOperation({ summary: '장바구니 조회' })
  async get(@Auth() auth: IAuth): Promise<CQuotePayload> {
    return await this.cartService.get(auth);
  }

  @Put('/')
  @ApiOperation({ summary: '장바구니 상품 수정' })
  async updateItem(@Auth() auth: IAuth, @Body() body: CUpdateItemDto): Promise<boolean> {
    return await this.cartService.updateItem(auth, body);
  }

  @Delete('/')
  @ApiOperation({ summary: '장바구니 상품 삭제' })
  async deleteItem(@Auth() auth: IAuth, @Query() query: CDeleteItemDto): Promise<boolean> {
    return await this.cartService.deleteItem(auth, query);
  }

  @Public()
  @Post('/guest')
  @ApiOperation({ summary: '게스트 장바구니 조회', description: '최대 50개까지만 조회 가능' })
  async guest(@Body() body: CGuestItemListDto): Promise<CQuotePayload> {
    return await this.cartService.guest(body);
  }

  @Post('/merge')
  @ApiOperation({
    summary: '장바구니 머지',
    description:
      '게스트 장바구니와 회원 장바구니 병합. 최대 qty 99개. 장바구니는 최대 50개 제한이지만 머지에서는 제한 없음 = 최대 100개',
  })
  async mergeGuestToMember(@Auth() auth: IAuth, @Body() body: CMergeDto): Promise<boolean> {
    return await this.cartService.mergeGuestToMember(auth, body);
  }
}
