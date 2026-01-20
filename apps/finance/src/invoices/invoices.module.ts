import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './invoice-items/entities/invoice-item.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesGrpcController } from './invoices.grpc.controller';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';
import { CustomerCreditsModule } from '../customer-credits/customer-credits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    GeneralLedgerModule,
    CustomerCreditsModule,
  ],
  providers: [InvoicesService],
  controllers: [InvoicesGrpcController],
  exports: [InvoicesService],
})
export class InvoicesModule {}

