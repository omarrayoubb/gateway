import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxPayablesService } from './tax-payables.service';
import { TaxPayablesGrpcController } from './tax-payables.grpc.controller';
import { TaxPayable } from './entities/tax-payable.entity';
import { Account } from '../accounts/entities/account.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxPayable, Account, Invoice, PurchaseBill]),
    JournalEntriesModule,
  ],
  controllers: [TaxPayablesGrpcController],
  providers: [TaxPayablesService],
  exports: [TaxPayablesService],
})
export class TaxPayablesModule {}

