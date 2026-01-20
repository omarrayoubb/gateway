import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetDisposal } from './entities/asset-disposal.entity';
import { AssetDisposalsService } from './asset-disposals.service';
import { AssetDisposalsGrpcController } from './asset-disposals.grpc.controller';
import { Asset } from '../assets/entities/asset.entity';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetDisposal, Asset, Account]),
    JournalEntriesModule,
  ],
  controllers: [AssetDisposalsGrpcController],
  providers: [AssetDisposalsService],
  exports: [AssetDisposalsService],
})
export class AssetDisposalsModule {}

