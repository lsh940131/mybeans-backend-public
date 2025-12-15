import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SellerApplMgmtService } from './seller-appl-mgmt.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { RoleGuard } from '../../../auth/guard/role.guard';
import { RoleEnum } from '../../../auth/enum/auth.enum';
import { Roles } from '../../../auth/decorator/role.decorator';
import { Auth } from '../../../auth/decorator/auth.decorator';
import { IAuth } from '../../../auth/interface/auth.interface';
import { GetDto, EvaluateDto, ListDto } from './dto/seller-appl-mgmt.dto';
import { SAMListPayload, SAMPayload } from './payload/seller-appl-mgmt.payload';

@Controller('admin/seller/application/mgmt')
@ApiTags('admin/seller/application/mgmt')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
export class SellerMgmtController {
  constructor(private readonly sellerApplMgmtService: SellerApplMgmtService) {}

  @Get('/list')
  @ApiOperation({ summary: '판매자 자격 신청 목록 조회' })
  async list(@Query() query: ListDto): Promise<SAMListPayload> {
    return this.sellerApplMgmtService.list(query);
  }

  @Get('/')
  @ApiOperation({ summary: '판매자 자격 신청 상세 조회' })
  async get(@Query() query: GetDto): Promise<SAMPayload> {
    return this.sellerApplMgmtService.get(query);
  }

  @Post('/evaluate')
  @ApiOperation({ summary: '판매자 자격 신청 검수' })
  async evaluate(@Auth() auth: IAuth, @Body() body: EvaluateDto): Promise<boolean> {
    return this.sellerApplMgmtService.evaluate(auth, body);
  }
}
