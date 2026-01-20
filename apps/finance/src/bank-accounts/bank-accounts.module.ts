import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsGrpcController } from './bank-accounts.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { AccountsModule } from '../accounts/accounts.module';
import { JournalEntry } from '../journal-entries/entities/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-lines/entities/journal-entry-line.entity';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccount, JournalEntry, JournalEntryLine, Account]),
    OrganizationsModule,
  ],
  providers: [BankAccountsService],
  controllers: [BankAccountsGrpcController],
  exports: [BankAccountsService],
})
export class BankAccountsModule {}

