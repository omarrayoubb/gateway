import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsGrpcController } from './vendors.grpc.controller';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor])],
  providers: [VendorsService],
  controllers: [VendorsGrpcController],
  exports: [VendorsService],
})
export class VendorsModule {}

