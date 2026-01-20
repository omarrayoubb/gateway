import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './journal-entry-lines/entities/journal-entry-line.entity';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesGrpcController } from './journal-entries.grpc.controller';
import { JournalEntryLinesService } from './journal-entry-lines/journal-entry-lines.service';
import { JournalEntryLinesGrpcController } from './journal-entry-lines/journal-entry-lines.grpc.controller';
import { Account } from '../accounts/entities/account.entity';
import { GeneralLedgerModule } from '../general-ledger/general-ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry, JournalEntryLine, Account]),
    GeneralLedgerModule,
  ],
  providers: [JournalEntriesService, JournalEntryLinesService],
  controllers: [JournalEntriesGrpcController, JournalEntryLinesGrpcController],
  exports: [JournalEntriesService, JournalEntryLinesService],
})
export class JournalEntriesModule {}

