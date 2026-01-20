import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankReconciliation } from './entities/bank-reconciliation.entity';
import { BankReconciliationsService } from './bank-reconciliations.service';
import { BankReconciliationsGrpcController } from './bank-reconciliations.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { BankTransaction } from '../bank-transactions/entities/bank-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankReconciliation, BankAccount, BankTransaction]),
    OrganizationsModule,
  ],
  providers: [BankReconciliationsService],
  controllers: [BankReconciliationsGrpcController],
  exports: [BankReconciliationsService],
})
export class BankReconciliationsModule {}

