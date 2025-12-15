import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorPerformanceService } from './vendor-performance.service';
import { VendorPerformanceGrpcController } from './vendor-performance.grpc.controller';
import { VendorPerformance } from './entities/vendor-performance.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VendorPerformance, Vendor])],
  providers: [VendorPerformanceService],
  controllers: [VendorPerformanceGrpcController],
  exports: [VendorPerformanceService],
})
export class VendorPerformanceModule {}

