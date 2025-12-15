import { Module } from '@nestjs/common';
import { ProductWatchHistoryController } from './product-watch-history.controller';
import { ProductWatchHistoryService } from './product-watch-history.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * 사용자가 구경한 상품 기록
 */
@Module({
  imports: [PrismaModule],
  controllers: [ProductWatchHistoryController],
  providers: [ProductWatchHistoryService],
  exports: [],
})
export class ProductWatchHistoryModule {}
