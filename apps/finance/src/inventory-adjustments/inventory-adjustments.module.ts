import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryAdjustment } from './entities/inventory-adjustment.entity';
import { InventoryAdjustmentsService } from './inventory-adjustments.service';
import { InventoryAdjustmentsGrpcController } from './inventory-adjustments.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryAdjustment, Account]),
    OrganizationsModule,
    JournalEntriesModule,
  ],
  controllers: [InventoryAdjustmentsGrpcController],
  providers: [InventoryAdjustmentsService],
  exports: [InventoryAdjustmentsService],
})
export class InventoryAdjustmentsModule {}

