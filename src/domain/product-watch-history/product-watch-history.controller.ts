import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { Auth } from '../../auth/decorator/auth.decorator';
import { IAuth } from '../../auth/interface/auth.interface';
import { ProductWatchHistoryService } from './product-watch-history.service';
import { PwhCreateDto, PwhDeleteDto, PwhMergeDto } from './dto/product-watch-history.dto';
import { PwhListPayload, PwhCreatedPayload } from './payload/product-watch-history.payload';

@Controller('product-watch-history')
@ApiTags('product-watch-history')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class ProductWatchHistoryController {
  constructor(private readonly pwhService: ProductWatchHistoryService) {}

  @Post('/')
  @ApiOperation({ summary: '구경한 상품 기록 저장' })
  async create(@Auth() auth: IAuth, @Body() body: PwhCreateDto): Promise<PwhCreatedPayload> {
    return await this.pwhService.create(auth, body);
  }

  @Get('/')
  @ApiOperation({ summary: '구경한 상품 기록 조회', description: '최근 50개 조회' })
  async list(@Auth() auth: IAuth): Promise<PwhListPayload> {
    return await this.pwhService.list(auth);
  }

  @Delete('/')
  @ApiOperation({ summary: '구경한 상품 기록 삭제' })
  async delete(@Auth() auth: IAuth, @Query() query: PwhDeleteDto): Promise<boolean> {
    return await this.pwhService.delete(auth, query);
  }

  @Delete('/clear')
  @ApiOperation({ summary: '구경한 상품 기록 전체 삭제' })
  async clear(@Auth() auth: IAuth): Promise<boolean> {
    return await this.pwhService.clear(auth);
  }

  @Post('/merge')
  @ApiOperation({
    summary: '구경한 상품 기록 병합',
    description: 'guest가 로그인할 때 sessionStorage에 저장한 구경 상품 기록 병합',
  })
  async mergeGuestToMember(@Auth() auth: IAuth, @Body() body: PwhMergeDto): Promise<boolean> {
    return await this.pwhService.mergeGuestToMember(auth, body);
  }
}
