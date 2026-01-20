import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesGrpcController } from './expenses.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AccountsModule } from '../accounts/accounts.module';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Account]),
    OrganizationsModule,
    AccountsModule,
    GeneralLedgerModule,
    JournalEntriesModule,
  ],
  providers: [ExpensesService],
  controllers: [ExpensesGrpcController],
  exports: [ExpensesService],
})
export class ExpensesModule {}

