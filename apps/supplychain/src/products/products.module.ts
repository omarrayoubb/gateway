import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsGrpcController } from './products.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [ProductsService],
  controllers: [ProductsGrpcController],
  exports: [ProductsService],
})
export class ProductsModule {}

