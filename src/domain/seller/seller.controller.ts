import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Roles } from '../../auth/decorator/role.decorator';
import { RoleEnum } from '../../auth/enum/auth.enum';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { IAuth } from 'src/auth/interface/auth.interface';
import { SellerListPayload, SellerPayload } from './payload/seller.payload';
import { SellerGetDto, SellerListDto, SellerUpdateDto } from './dto/seller.dto';

@Controller('seller')
@ApiTags('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('/list')
  @ApiOperation({ summary: '판매자 리스트 조회' })
  async list(@Query() query: SellerListDto): Promise<SellerListPayload> {
    return this.sellerService.list(query);
  }

  @Get('/')
  @ApiOperation({ summary: '판매자 정보 조회' })
  async get(@Query() query: SellerGetDto): Promise<SellerPayload> {
    return this.sellerService.get(query);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnum.SELLER)
  @Put('/')
  @ApiOperation({ summary: '판매자 정보 수정' })
  async update(@Auth() auth: IAuth, @Body() body: SellerUpdateDto): Promise<boolean> {
    return this.sellerService.update(auth, body);
  }
}
