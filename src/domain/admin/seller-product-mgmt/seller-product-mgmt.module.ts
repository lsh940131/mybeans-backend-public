import { Module } from '@nestjs/common';
import { SellerProductMgmtController } from './seller-product-mgmt.controller';
import { SellerProductMgmtService } from './seller-product-mgmt.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerProductMgmtController],
  providers: [SellerProductMgmtService],
})
export class SellerProductMgmtModule {}
