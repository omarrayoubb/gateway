import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorPayment } from './entities/vendor-payment.entity';
import { VendorPaymentAllocation } from './payment-allocations/entities/vendor-payment-allocation.entity';
import { VendorPaymentsService } from './vendor-payments.service';
import { VendorPaymentsGrpcController } from './vendor-payments.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorPayment, VendorPaymentAllocation, PurchaseBill]),
    OrganizationsModule,
    GeneralLedgerModule,
  ],
  providers: [VendorPaymentsService],
  controllers: [VendorPaymentsGrpcController],
  exports: [VendorPaymentsService],
})
export class VendorPaymentsModule {}

