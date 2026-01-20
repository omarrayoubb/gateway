import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccruedExpensesService } from './accrued-expenses.service';
import { AccruedExpensesGrpcController } from './accrued-expenses.grpc.controller';
import { AccruedExpense } from './entities/accrued-expense.entity';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccruedExpense, Account]),
    JournalEntriesModule,
  ],
  controllers: [AccruedExpensesGrpcController],
  providers: [AccruedExpensesService],
  exports: [AccruedExpensesService],
})
export class AccruedExpensesModule {}

