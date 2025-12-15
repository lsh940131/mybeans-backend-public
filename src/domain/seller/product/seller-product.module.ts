import { Module } from '@nestjs/common';
import { SellerProductController } from './seller-product.controller';
import { SellerProductService } from './seller-product.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CategoryModule } from '../../../domain/category/category.module';

@Module({
  imports: [PrismaModule, CategoryModule],
  controllers: [SellerProductController],
  providers: [SellerProductService],
})
export class SellerProductModule {}
