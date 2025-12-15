import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsGrpcController } from './vendor-products.grpc.controller';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VendorProduct, Vendor, Product])],
  providers: [VendorProductsService],
  controllers: [VendorProductsGrpcController],
  exports: [VendorProductsService],
})
export class VendorProductsModule {}

