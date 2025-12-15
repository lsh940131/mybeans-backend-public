import { Module } from '@nestjs/common';
import { SellerApplMgmtModule } from './seller-appl-mgmt/seller-appl-mgmt.module';
import { CategoryMgmtModule } from './category-mgmt/category-mgmt.module';
import { SellerProductMgmtModule } from './seller-product-mgmt/seller-product-mgmt.module';

@Module({
  imports: [SellerApplMgmtModule, CategoryMgmtModule, SellerProductMgmtModule],
})
export class AdminModule {}
