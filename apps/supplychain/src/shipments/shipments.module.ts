import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsGrpcController } from './shipments.grpc.controller';
import { Shipment } from './entities/shipment.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory-batches/entities/inventory-batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentItem, Warehouse, Vendor, Product, InventoryBatch])],
  providers: [ShipmentsService],
  controllers: [ShipmentsGrpcController],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}

