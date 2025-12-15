import { Module } from '@nestjs/common';
import { SellerMgmtController } from './seller-appl-mgmt.controller';
import { SellerApplMgmtService } from './seller-appl-mgmt.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerMgmtController],
  providers: [SellerApplMgmtService],
})
export class SellerApplMgmtModule {}
