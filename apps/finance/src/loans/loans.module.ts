import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansGrpcController } from './loans.grpc.controller';
import { Loan } from './entities/loan.entity';
import { LoanPayment } from './entities/loan-payment.entity';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanPayment, Account]),
    JournalEntriesModule,
  ],
  controllers: [LoansGrpcController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}

