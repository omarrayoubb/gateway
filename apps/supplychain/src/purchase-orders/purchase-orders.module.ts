import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersGrpcController } from './purchase-orders.grpc.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem, Warehouse, Vendor, Product])],
  providers: [PurchaseOrdersService],
  controllers: [PurchaseOrdersGrpcController],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}

