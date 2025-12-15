import { Module } from '@nestjs/common';
import { CategoryMgmtController } from './category-mgmt.controller';
import { CategoryMgmtService } from './category-mgmt.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryMgmtController],
  providers: [CategoryMgmtService],
})
export class CategoryMgmtModule {}
