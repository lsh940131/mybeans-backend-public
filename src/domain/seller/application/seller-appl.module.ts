import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { SellerApplController } from './seller-appl.controller';
import { SellerApplService } from './seller-appl.service';

@Module({
  imports: [PrismaModule],
  controllers: [SellerApplController],
  providers: [SellerApplService],
})
export class SellerApplModule {}
