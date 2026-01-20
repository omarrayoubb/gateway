import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCredit } from './entities/customer-credit.entity';
import { CustomerCreditsService } from './customer-credits.service';
import { CustomerCreditsGrpcController } from './customer-credits.grpc.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CustomerPayment } from '../customer-payments/entities/customer-payment.entity';
import { CustomerPaymentAllocation } from '../customer-payments/payment-allocations/entities/payment-allocation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerCredit, Invoice, CustomerPayment, CustomerPaymentAllocation]),
  ],
  providers: [CustomerCreditsService],
  controllers: [CustomerCreditsGrpcController],
  exports: [CustomerCreditsService],
})
export class CustomerCreditsModule {}

