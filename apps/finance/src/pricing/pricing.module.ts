import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingGrpcController } from './pricing.grpc.controller';
import { Pricing } from './entities/pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pricing]),
  ],
  controllers: [PricingGrpcController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}

