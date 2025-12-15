import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UACreateDto, UADeleteDto, UAUpdateDto } from './dto/user-address.dto';
import { Auth } from '../../../auth/decorator/auth.decorator';
import { IAuth } from '../../../auth/interface/auth.interface';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { UAListItemPayload } from './payload/user-address.payload';

@Controller('user/address')
@ApiTags('user/address')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post('/')
  @ApiOperation({ summary: '배송지 추가', description: '최대 50개까지만 저장 가능' })
  async create(@Auth() auth: IAuth, @Body() body: UACreateDto): Promise<number> {
    return this.userAddressService.create(auth, body);
  }

  @Get('/list')
  @ApiOperation({ summary: '배송지 목록 조회' })
  async list(@Auth() auth: IAuth): Promise<UAListItemPayload[]> {
    return this.userAddressService.list(auth);
  }

  @Put('/')
  @ApiOperation({ summary: '배송지 수정' })
  async update(@Auth() auth: IAuth, @Body() body: UAUpdateDto): Promise<boolean> {
    return this.userAddressService.update(auth, body);
  }

  @Delete('/')
  @ApiOperation({ summary: '배송지 삭제' })
  async delete(@Auth() auth: IAuth, @Query() query: UADeleteDto): Promise<boolean> {
    return this.userAddressService.delete(auth, query);
  }
}
