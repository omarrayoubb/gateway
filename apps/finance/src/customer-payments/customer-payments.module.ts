import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPayment } from './entities/customer-payment.entity';
import { CustomerPaymentAllocation } from './payment-allocations/entities/payment-allocation.entity';
import { CustomerPaymentsService } from './customer-payments.service';
import { CustomerPaymentsGrpcController } from './customer-payments.grpc.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';
import { CustomerCreditsModule } from '../customer-credits/customer-credits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerPayment, CustomerPaymentAllocation, Invoice]),
    GeneralLedgerModule,
    CustomerCreditsModule,
  ],
  providers: [CustomerPaymentsService],
  controllers: [CustomerPaymentsGrpcController],
  exports: [CustomerPaymentsService],
})
export class CustomerPaymentsModule {}

