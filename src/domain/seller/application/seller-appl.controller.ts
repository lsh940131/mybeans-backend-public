import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { SellerApplService } from './seller-appl.service';
import { ApplyTempDto } from './dto/seller-appl.dto';
import { IAuth } from '../../../auth/interface/auth.interface';
import { Auth } from '../../../auth/decorator/auth.decorator';
import { SAPayload } from './payload/seller-appl.payload';

@Controller('seller/application')
@ApiTags('seller/application')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class SellerApplController {
  constructor(private readonly sellerApplService: SellerApplService) {}

  @Post('/temp')
  @ApiOperation({
    summary: '판매자 자격 신청서 임시 저장',
    description: `
    - 사용자별로 한 번만 자격 신청 생성 가능. 이후 계속해서 이 api로 수정(저장)
    - 사용자 임시저장 액션 + 단계 이동 + 30초 주기로 변경점이 있을 시 저장
    - status가 SellerApplStatusEnum.TEMP, SellerApplStatusEnum.REVISE 일 때만 사용 가능`,
  })
  async temp(@Auth() auth: IAuth, @Body() data: ApplyTempDto): Promise<boolean> {
    return await this.sellerApplService.temp(auth, data);
  }

  @Post('/')
  @ApiOperation({
    summary: '판매자 자격 신청서 제출',
    description: `
    - 임시 저장 기능으로 필수값을 모두 입력하게 한 뒤 호출
    - admin 심사 결과로 status가 'SellerApplStatusEnum.REVISE'로 바뀌었다면, 부족한 자료를 안내하고 다시 한 번 임시 저장 기능으로 수정하도록 유도
  `,
  })
  async create(@Auth() auth: IAuth): Promise<boolean> {
    return await this.sellerApplService.create(auth);
  }

  @Get('/')
  @ApiOperation({ summary: '판매자 자격 신청 조회' })
  async get(@Auth() auth: IAuth): Promise<SAPayload> {
    return await this.sellerApplService.get(auth);
  }
}
