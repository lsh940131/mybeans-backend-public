import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrderCheckoutModule } from './checkout/order-checkout.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { CryptoModule } from 'src/common/crypto/crypto.module';

@Module({
  imports: [ConfigModule, PrismaModule, OrderCheckoutModule, PricingModule, CryptoModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
