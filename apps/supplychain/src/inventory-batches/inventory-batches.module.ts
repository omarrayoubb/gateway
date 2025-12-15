import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { InventoryBatchesService } from './inventory-batches.service';
import { InventoryBatchesGrpcController } from './inventory-batches.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryBatch, Product, Warehouse]),
  ],
  providers: [InventoryBatchesService],
  controllers: [InventoryBatchesGrpcController],
  exports: [InventoryBatchesService],
})
export class InventoryBatchesModule {}

