import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryMgmtService } from './category-mgmt.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard';
import { RoleGuard } from '../../../auth/guard/role.guard';
import { Roles } from '../../../auth/decorator/role.decorator';
import { RoleEnum } from '../../../auth/enum/auth.enum';
import {
  CreateDto,
  CreateOptionDto,
  CreateOptionValueDto,
  DeleteDto,
  DeleteOptionDto,
  DeleteOptionValueDto,
  UpdateDto,
  UpdateOptionDto,
  UpdateOptionValueDto,
} from './dto/category-mgmt.dto';

@Controller('admin/category/mgmt')
@ApiTags('admin/category/mgmt')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
export class CategoryMgmtController {
  constructor(private readonly categoryMgmtService: CategoryMgmtService) {}

  @Post('/')
  @ApiOperation({ summary: '카테고리 생성' })
  async create(@Body() body: CreateDto): Promise<boolean> {
    return await this.categoryMgmtService.create(body);
  }

  @Put('/')
  @ApiOperation({ summary: '카테고리 수정' })
  async update(@Body() body: UpdateDto): Promise<boolean> {
    return await this.categoryMgmtService.update(body);
  }

  @Delete('/')
  @ApiOperation({
    summary: '카테고리 삭제',
    description: '해당 카테고리로 등록된 상품이 있다면 삭제 불가',
  })
  async delete(@Body() body: DeleteDto): Promise<boolean> {
    return await this.categoryMgmtService.delete(body);
  }

  @Post('/option')
  @ApiOperation({
    summary: '카테고리 옵션 생성',
    description: '하위 카테고리들도 해당 옵션 선택 가능함',
  })
  async createOption(@Body() body: CreateOptionDto): Promise<boolean> {
    return await this.categoryMgmtService.createOption(body);
  }

  @Put('/option')
  @ApiOperation({ summary: '카테고리 옵션 수정' })
  async updateOption(@Body() body: UpdateOptionDto): Promise<boolean> {
    return await this.categoryMgmtService.updateOption(body);
  }

  @Delete('/option')
  @ApiOperation({
    summary: '카테고리 옵션 삭제',
    description: '해당 카테고리 옵션을 사용중인 상품이 있다면 삭제 불가',
  })
  async deleteOption(@Body() body: DeleteOptionDto): Promise<boolean> {
    return await this.categoryMgmtService.deleteOption(body);
  }

  @Post('/option/value')
  @ApiOperation({ summary: '카테고리 옵션 값 생성' })
  async createOptionValue(@Body() body: CreateOptionValueDto): Promise<boolean> {
    return await this.categoryMgmtService.createOptionValue(body);
  }

  @Put('/option/value')
  @ApiOperation({
    summary: '카테고리 옵션 값 수정',
    description: '등록된 상품이 사용중인 옵션이라면 수정 불가',
  })
  async updateOptionValue(@Body() body: UpdateOptionValueDto): Promise<boolean> {
    return await this.categoryMgmtService.updateOptionValue(body);
  }

  @Delete('/option/value')
  @ApiOperation({
    summary: '카테고리 옵션 값 삭제',
    description: '등록된 상품이 사용중인 옵션이라면 삭제 불가',
  })
  async deleteOptionValue(@Body() body: DeleteOptionValueDto): Promise<boolean> {
    return await this.categoryMgmtService.deleteOptionValue(body);
  }
}
