import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { AccountingPeriodsService } from './accounting-periods.service';
import { AccountingPeriodsGrpcController } from './accounting-periods.grpc.controller';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';
import { JournalEntry } from '../journal-entries/entities/journal-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountingPeriod, GeneralLedger, JournalEntry]),
  ],
  providers: [AccountingPeriodsService],
  controllers: [AccountingPeriodsGrpcController],
  exports: [AccountingPeriodsService],
})
export class AccountingPeriodsModule {}

