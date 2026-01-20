import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransactionsGrpcController } from './bank-transactions.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankTransaction, BankAccount]),
    OrganizationsModule,
  ],
  providers: [BankTransactionsService],
  controllers: [BankTransactionsGrpcController],
  exports: [BankTransactionsService],
})
export class BankTransactionsModule {}

