import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseBill } from './entities/purchase-bill.entity';
import { PurchaseBillItem } from './purchase-bill-items/entities/purchase-bill-item.entity';
import { PurchaseBillsService } from './purchase-bills.service';
import { PurchaseBillsGrpcController } from './purchase-bills.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseBill, PurchaseBillItem]),
    OrganizationsModule,
    GeneralLedgerModule,
  ],
  providers: [PurchaseBillsService],
  controllers: [PurchaseBillsGrpcController],
  exports: [PurchaseBillsService],
})
export class PurchaseBillsModule {}

