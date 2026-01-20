import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COGS } from './entities/cogs.entity';
import { CogsService } from './cogs.service';
import { CogsGrpcController } from './cogs.grpc.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-items/entities/invoice-item.entity';
import { InventoryValuation } from '../inventory-valuations/entities/inventory-valuation.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([COGS, Invoice, InvoiceItem, InventoryValuation]),
    OrganizationsModule,
  ],
  providers: [CogsService],
  controllers: [CogsGrpcController],
  exports: [CogsService],
})
export class CogsModule {}

