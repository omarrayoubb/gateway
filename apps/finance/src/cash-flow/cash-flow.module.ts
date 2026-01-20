import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowService } from './cash-flow.service';
import { CashFlowGrpcController } from './cash-flow.grpc.controller';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { CashAccount } from '../cash-accounts/entities/cash-account.entity';
import { CustomerPayment } from '../customer-payments/entities/customer-payment.entity';
import { VendorPayment } from '../vendor-payments/entities/vendor-payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { RecurringBill } from '../recurring-bills/entities/recurring-bill.entity';
import { PaymentSchedule } from '../payment-schedules/entities/payment-schedule.entity';
import { BankTransaction } from '../bank-transactions/entities/bank-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankAccount,
      CashAccount,
      CustomerPayment,
      VendorPayment,
      Invoice,
      PurchaseBill,
      RecurringBill,
      PaymentSchedule,
      BankTransaction,
    ]),
  ],
  providers: [CashFlowService],
  controllers: [CashFlowGrpcController],
  exports: [CashFlowService],
})
export class CashFlowModule {}

