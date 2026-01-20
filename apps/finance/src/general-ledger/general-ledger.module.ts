import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralLedger } from './entities/general-ledger.entity';
import { GeneralLedgerService } from './general-ledger.service';
import { GeneralLedgerGrpcController } from './general-ledger.grpc.controller';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-lines/entities/journal-entry-line.entity';
import { JournalEntry } from '../journal-entries/entities/journal-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralLedger, Account, JournalEntryLine, JournalEntry]),
  ],
  providers: [GeneralLedgerService],
  controllers: [GeneralLedgerGrpcController],
  exports: [GeneralLedgerService],
})
export class GeneralLedgerModule {}
