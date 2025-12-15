import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryPayload, CategoryTreePayload } from './payload/category.payload';
import { GetDto } from './dto/category.dto';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/tree')
  @ApiOperation({ summary: '카테고리 트리' })
  async tree(): Promise<CategoryTreePayload[]> {
    return await this.categoryService.tree();
  }

  @Get('/')
  @ApiOperation({ summary: '카테고리 조회' })
  async get(@Query() query: GetDto): Promise<CategoryPayload> {
    return await this.categoryService.get(query);
  }
}
