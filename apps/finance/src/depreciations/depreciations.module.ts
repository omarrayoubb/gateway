import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depreciation } from './entities/depreciation.entity';
import { DepreciationsService } from './depreciations.service';
import { DepreciationsGrpcController } from './depreciations.grpc.controller';
import { Asset } from '../assets/entities/asset.entity';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Depreciation, Asset, Account]),
    JournalEntriesModule,
  ],
  controllers: [DepreciationsGrpcController],
  providers: [DepreciationsService],
  exports: [DepreciationsService],
})
export class DepreciationsModule {}

