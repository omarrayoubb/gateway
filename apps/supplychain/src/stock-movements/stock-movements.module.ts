import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory-batches/entities/inventory-batch.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsGrpcController } from './stock-movements.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, Product, InventoryBatch, Warehouse]),
  ],
  providers: [StockMovementsService],
  controllers: [StockMovementsGrpcController],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}

