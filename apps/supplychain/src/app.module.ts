import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductAlertsModule } from './product-alerts/product-alerts.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoryBatchesModule } from './inventory-batches/inventory-batches.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { VendorsModule } from './vendors/vendors.module';
import { VendorProductsModule } from './vendor-products/vendor-products.module';
import { VendorPerformanceModule } from './vendor-performance/vendor-performance.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ShipmentTrackingModule } from './shipment-tracking/shipment-tracking.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { DeliveryNotesModule } from './delivery-notes/delivery-notes.module';
import { Product } from './products/entities/product.entity';
import { ProductCategory } from './product-categories/entities/product-category.entity';
import { ProductAlert } from './product-alerts/entities/product-alert.entity';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { InventoryBatch } from './inventory-batches/entities/inventory-batch.entity';
import { StockMovement } from './stock-movements/entities/stock-movement.entity';
import { Vendor } from './vendors/entities/vendor.entity';
import { VendorProduct } from './vendor-products/entities/vendor-product.entity';
import { VendorPerformance } from './vendor-performance/entities/vendor-performance.entity';
import { Shipment } from './shipments/entities/shipment.entity';
import { ShipmentItem } from './shipments/entities/shipment-item.entity';
import { ShipmentTracking } from './shipment-tracking/entities/shipment-tracking.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from './purchase-orders/entities/purchase-order-item.entity';
import { DeliveryNote } from './delivery-notes/entities/delivery-note.entity';
import { DeliveryNoteItem } from './delivery-notes/entities/delivery-note-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('SUPPLYCHAIN_DB_HOST') || configService.get('DB_HOST') || 'localhost',
        port: configService.get('SUPPLYCHAIN_DB_PORT') || configService.get('DB_PORT') || 5432,
        username: configService.get('SUPPLYCHAIN_DB_USERNAME') || configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('SUPPLYCHAIN_DB_PASSWORD') || configService.get('DB_PASSWORD') || '',
        database: configService.get('SUPPLYCHAIN_DB_DATABASE') || configService.get('DB_DATABASE') || 'supplychain',
        entities: [Product, ProductCategory, ProductAlert, Warehouse, InventoryBatch, StockMovement, Vendor, VendorProduct, VendorPerformance, Shipment, ShipmentItem, ShipmentTracking, PurchaseOrder, PurchaseOrderItem, DeliveryNote, DeliveryNoteItem],
        synchronize: configService.get('SUPPLYCHAIN_DB_SYNCHRONIZE') === 'true' || configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    ProductsModule,
    ProductCategoriesModule,
    ProductAlertsModule,
    WarehousesModule,
    InventoryBatchesModule,
    StockMovementsModule,
    VendorsModule,
    VendorProductsModule,
    VendorPerformanceModule,
    ShipmentsModule,
    ShipmentTrackingModule,
    PurchaseOrdersModule,
    DeliveryNotesModule,
  ],
})
export class AppModule {}

