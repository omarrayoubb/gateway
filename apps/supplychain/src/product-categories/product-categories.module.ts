import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesGrpcController } from './product-categories.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategory]),
  ],
  providers: [ProductCategoriesService],
  controllers: [ProductCategoriesGrpcController],
  exports: [ProductCategoriesService],
})
export class ProductCategoriesModule {}

