import { Module } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ElasticService],
  exports: [ElasticService],
})
export class ElasticModule {}
