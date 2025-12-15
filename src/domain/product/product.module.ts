import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ElasticModule } from '../../elastic/elastic.module';

@Module({
  imports: [PrismaModule, ElasticModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
