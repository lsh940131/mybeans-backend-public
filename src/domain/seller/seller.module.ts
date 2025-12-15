import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SellerApplModule } from './application/seller-appl.module';
import { SellerProductModule } from './product/seller-product.module';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({
  imports: [PrismaModule, SellerApplModule, SellerProductModule],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
