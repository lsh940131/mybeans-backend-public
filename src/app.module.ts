import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter/exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { FileModule } from './domain/file/file.module';
import { UserModule } from './domain/user/user.module';
import { SellerModule } from './domain/seller/seller.module';
import { AdminModule } from './domain/admin/admin.module';
import { CategoryModule } from './domain/category/category.module';
import { ElasticModule } from './elastic/elastic.module';
import { ProductModule } from './domain/product/product.module';
import { CartModule } from './domain/cart/cart.module';
import { OrderModule } from './domain/order/order.module';
import { CronModule } from './cron/cron.module';
import { ProductWatchHistoryModule } from './domain/product-watch-history/product-watch-history.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    FileModule,
    UserModule,
    SellerModule,
    AdminModule,
    CategoryModule,
    ElasticModule,
    ProductModule,
    CartModule,
    OrderModule,
    CronModule,
    ProductWatchHistoryModule,
    PricingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
