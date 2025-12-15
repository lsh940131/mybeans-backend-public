import { Module } from '@nestjs/common';
import { OrderCheckoutController } from './order-checkout.controller';
import { OrderCheckoutService } from './order-checkout.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PricingModule } from '../../../pricing/pricing.module';

@Module({
  imports: [PrismaModule, PricingModule],
  controllers: [OrderCheckoutController],
  providers: [OrderCheckoutService],
})
export class OrderCheckoutModule {}
