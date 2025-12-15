import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorator/role.decorator';
import { RoleEnum } from '../../../auth/enum/auth.enum';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { RoleGuard } from '../../../auth/guard/role.guard';
import { SellerProductService } from './seller-product.service';
import { Auth } from '../../../auth/decorator/auth.decorator';
import { IAuth } from '../../../auth/interface/auth.interface';
import {
  SPCancelSubmitDto,
  SPDeleteManipDto,
  SPCreateManipCreationDto,
  SPSubmitRequestDto,
  SPUpdateManipCreationDto,
  SPGetManipDto,
  SPCreateManipUpdate,
  SPUpdateManipUpdateDto,
  SPListOfManipDto,
  PSCreateManipDeletionDto,
  PSListOfProductDto,
  PSGetProductDto,
} from './dto/seller-product.dto';
import {
  SPManipIdPayload,
  SPGetManipPayload,
  SPListOfManipPayload,
  SPListOfProductPayload,
  SPGetProductPayload,
} from './payload/seller-product.payload';

@Controller('seller/product')
@ApiTags('seller/product')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RoleGuard)
@Roles(RoleEnum.SELLER)
export class SellerProductController {
  constructor(private readonly sellerProductService: SellerProductService) {}

  @Get('/manipulation/list')
  @ApiOperation({ summary: '상품조작요청 목록 조회' })
  async listOfManip(
    @Auth() auth: IAuth,
    @Query() query: SPListOfManipDto,
  ): Promise<SPListOfManipPayload> {
    return await this.sellerProductService.listOfManip(auth, query);
  }

  @Post('/manipulation/creation')
  @ApiOperation({
    summary: '상품등록요청 생성',
    description: `
      - 사용자 임시저장 액션 + 단계 이동 + 30초 주기로 변경점이 있을 시 저장
      - status가 .TEMP, .REVISE 일 때만 사용 가능`,
  })
  async createManipCreation(
    @Auth() auth: IAuth,
    @Body() body: SPCreateManipCreationDto,
  ): Promise<SPManipIdPayload> {
    return await this.sellerProductService.createManipCreation(auth, body);
  }

  @Put('/manipulation/creation')
  @ApiOperation({ summary: '상품등록요청 수정', description: 'overwrite' })
  async updateManipCreation(
    @Auth() auth: IAuth,
    @Body() body: SPUpdateManipCreationDto,
  ): Promise<boolean> {
    return await this.sellerProductService.updateManipCreation(auth, body);
  }

  @Post('/manipulation/update')
  @ApiOperation({
    summary: '상품수정요청 생성',
    description: '현재 상품정보를 기본으로 사용자의 값을 덧씌워 보내야함',
  })
  async createManipUpdate(
    @Auth() auth: IAuth,
    @Body() body: SPCreateManipUpdate,
  ): Promise<SPManipIdPayload> {
    return await this.sellerProductService.createManipUpdate(auth, body);
  }

  @Put('/manipulation/update')
  @ApiOperation({ summary: '상품수정요청 수정', description: 'overwrite' })
  async updateManipUpdate(
    @Auth() auth: IAuth,
    @Body() body: SPUpdateManipUpdateDto,
  ): Promise<boolean> {
    return await this.sellerProductService.updateManipUpdate(auth, body);
  }

  @Post('/manipulation/deletion')
  @ApiOperation({
    summary: '상품삭제요청 생성',
  })
  async createManipDeletion(
    @Auth() auth: IAuth,
    @Body() body: PSCreateManipDeletionDto,
  ): Promise<SPManipIdPayload> {
    return await this.sellerProductService.createManipDeletion(auth, body);
  }

  @Post('/manipulation/submit')
  @ApiOperation({ summary: '상품조작요청 제출' })
  async submitManip(@Auth() auth: IAuth, @Body() body: SPSubmitRequestDto): Promise<boolean> {
    return await this.sellerProductService.submitManip(auth, body);
  }

  @Post('/manipulation/submit/cancel')
  @ApiOperation({
    summary: '상품조작요청 제출 취소',
    description: '제출 후 5분 내에만 취소 가능. 임시저장 상태로 돌아감',
  })
  async cancelSubmitManip(@Auth() auth: IAuth, @Body() body: SPCancelSubmitDto): Promise<boolean> {
    return await this.sellerProductService.cancelSubmitManip(auth, body);
  }

  @Get('/manipulation')
  @ApiOperation({ summary: '상품조작요청 조회' })
  async getManip(@Auth() auth: IAuth, @Query() query: SPGetManipDto): Promise<SPGetManipPayload> {
    return await this.sellerProductService.getManip(auth, query);
  }

  @Delete('/manipulation')
  @ApiOperation({ summary: '상품조작요청 삭제', description: '임시저장 상태일 때만 삭제 가능' })
  async deleteManip(@Auth() auth: IAuth, @Query() query: SPDeleteManipDto): Promise<boolean> {
    return await this.sellerProductService.deleteManip(auth, query);
  }

  @Get('/list')
  @ApiOperation({ summary: '상품 목록 조회' })
  async listOfProduct(
    @Auth() auth: IAuth,
    @Query() query: PSListOfProductDto,
  ): Promise<SPListOfProductPayload> {
    return await this.sellerProductService.listOfProduct(auth, query);
  }

  @Get('/')
  @ApiOperation({ summary: '상품 조회' })
  async getProduct(
    @Auth() auth: IAuth,
    @Query() query: PSGetProductDto,
  ): Promise<SPGetProductPayload> {
    return await this.sellerProductService.getProduct(auth, query);
  }
}
