import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PDeleteSearchHistoryDto,
  PGetDto,
  PListDto,
  PMergeGuestToMemberSearchHistory,
} from './dto/product.dto';
import {
  ProductGetPayload,
  ProductGetSearchKeywordPayload,
  ProductListPayload,
} from './payload/product.payload';
import { OptionalJwtGuard } from '../../auth/guard/optional-jwt.guard';
import { OptionalAuth } from '../../auth/decorator/optional-auth.decorator';
import { IAuth } from '../../auth/interface/auth.interface';
import { Auth } from 'src/auth/decorator/auth.decorator';

@Controller('product')
@ApiTags('product')
@ApiBearerAuth('access-token')
@UseGuards(OptionalJwtGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/list')
  @ApiOperation({ summary: '상품 목록 조회', description: 'jwt 필수 아님' })
  async list(
    @OptionalAuth() auth: IAuth | null,
    @Query() query: PListDto,
  ): Promise<ProductListPayload> {
    return await this.productService.list(auth, query);
  }

  @Get('/')
  @ApiOperation({ summary: '상품 상세 조회', description: 'jwt 필수 아님' })
  async get(
    @OptionalAuth() auth: IAuth | null,
    @Query() query: PGetDto,
  ): Promise<ProductGetPayload> {
    return await this.productService.get(auth, query);
  }

  @Get('/search/keyword/history')
  @ApiOperation({ summary: '상품 검색 키워드 기록 조회' })
  async getSearchKeywordHistory(@Auth() auth: IAuth): Promise<ProductGetSearchKeywordPayload[]> {
    return await this.productService.getSearchKeywordHistory(auth);
  }

  @Delete('/search/history')
  @ApiOperation({ description: '상품 검색 기록 삭제' })
  async deleteSearchHistory(
    @Auth() auth: IAuth,
    @Query() query: PDeleteSearchHistoryDto,
  ): Promise<boolean> {
    return await this.productService.deleteSearchHistory(auth, query);
  }

  @Delete('/search/history/clear')
  @ApiOperation({ description: '상품 검색 기록 전부 삭제' })
  async clearSearchHistory(@Auth() auth: IAuth): Promise<boolean> {
    return await this.productService.clearSearchHistory(auth);
  }

  @Post('/merge/search/history')
  @ApiOperation({ summary: '검색 키워드 기록 머지' })
  async mergeGuestToMemberSearchHistory(
    @Auth() auth: IAuth,
    @Body() body: PMergeGuestToMemberSearchHistory,
  ): Promise<boolean> {
    return await this.productService.mergeGuestToMemberSearchHistory(auth, body);
  }
}
