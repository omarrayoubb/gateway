import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockImpact } from './entities/stock-impact.entity';
import { StockImpactsService } from './stock-impacts.service';
import { StockImpactsGrpcController } from './stock-impacts.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-items/entities/invoice-item.entity';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { PurchaseBillItem } from '../purchase-bills/purchase-bill-items/entities/purchase-bill-item.entity';
import { InventoryAdjustment } from '../inventory-adjustments/entities/inventory-adjustment.entity';
import { InventoryValuation } from '../inventory-valuations/entities/inventory-valuation.entity';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockImpact,
      Invoice,
      InvoiceItem,
      PurchaseBill,
      PurchaseBillItem,
      InventoryAdjustment,
      InventoryValuation,
      Account,
    ]),
    OrganizationsModule,
  ],
  controllers: [StockImpactsGrpcController],
  providers: [StockImpactsService],
  exports: [StockImpactsService],
})
export class StockImpactsModule {}

