import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRevaluation } from './entities/asset-revaluation.entity';
import { AssetRevaluationsService } from './asset-revaluations.service';
import { AssetRevaluationsGrpcController } from './asset-revaluations.grpc.controller';
import { Asset } from '../assets/entities/asset.entity';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetRevaluation, Asset, Account]),
    JournalEntriesModule,
  ],
  controllers: [AssetRevaluationsGrpcController],
  providers: [AssetRevaluationsService],
  exports: [AssetRevaluationsService],
})
export class AssetRevaluationsModule {}

