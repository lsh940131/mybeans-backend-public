import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { RoleGuard } from '../../../auth/guard/role.guard';
import { RoleEnum } from '../../../auth/enum/auth.enum';
import { Roles } from '../../../auth/decorator/role.decorator';
import { Auth } from '../../../auth/decorator/auth.decorator';
import { IAuth } from '../../../auth/interface/auth.interface';
import { SellerProductMgmtService } from './seller-product-mgmt.service';
import { EvaluateManipDto, GetManipDto, ListOfManipDto } from './dto/seller-product-mgmt.dto';
import { SPMListOfManipPayload, SPMManipPayload } from './payload/seller-product-mgmt.payload';

@Controller('admin/seller/product/mgmt')
@ApiTags('admin/seller/product/mgmt')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
export class SellerProductMgmtController {
  constructor(private readonly sellerProductMgmtService: SellerProductMgmtService) {}

  @Get('/manipulation/list')
  @ApiOperation({ summary: '상품조작요청 목록 조회' })
  async listOfManip(@Query() query: ListOfManipDto): Promise<SPMListOfManipPayload> {
    return await this.sellerProductMgmtService.listOfManip(query);
  }

  @Get('/manipulation')
  @ApiOperation({ summary: '상품조작요청 조회' })
  async getManip(@Query() query: GetManipDto): Promise<SPMManipPayload> {
    return await this.sellerProductMgmtService.getManip(query);
  }

  @Post('/manipulation')
  @ApiOperation({
    summary: '상품조작요청 심사',
    description: '수정요청 또는 거절시 사유 작성 필수',
  })
  async evaluateManip(@Auth() auth: IAuth, @Body() body: EvaluateManipDto) {
    return await this.sellerProductMgmtService.evaluateManip(auth, body);
  }
}
